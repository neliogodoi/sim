import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import QRCode from 'qrcode';
import { combineLatest, filter, firstValueFrom, from, map, of, shareReplay, switchMap, take } from 'rxjs';

import { normalizeScriptFont, SCRIPT_FONT_OPTIONS, scriptFontAssetPath } from '../../../core/constants/script-fonts';
import { Wedding, WeddingPartyMember } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { DEFAULT_WEDDING_ID, WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
	selector: 'app-groomsmen-invite-page',
	imports: [AsyncPipe],
	templateUrl: './groomsmen-invite.page.html',

	styleUrl: './groomsmen-invite.page.css',
})
export class GroomsmenInvitePage implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);

	protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
	protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
	protected readonly isReadOnly$ = this.weddingId$.pipe(map((weddingId) => weddingId === DEFAULT_WEDDING_ID));
	protected readonly member$ = this.route.paramMap.pipe(
		switchMap((params) => {
			const memberId = params.get('memberId');
			if (!memberId) {
				return of(undefined);
			}

			return this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.weddingPartyMember$(memberId, weddingId)));
		}),
	);
	private readonly templateSource$ = from(fetch('/template_convite.svg').then((response) => response.text())).pipe(shareReplay(1));
	private readonly scriptFontDataMap$ = from(this.loadScriptFontDataMap()).pipe(shareReplay(1));
	protected readonly templateSvg$ = combineLatest([this.templateSource$, this.wedding$, this.member$, this.scriptFontDataMap$]).pipe(
		switchMap(async ([template, wedding, member, scriptFontDataMap]) => {
			if (!wedding || !member) {
				return undefined;
			}

			return this.sanitizer.bypassSecurityTrustHtml(await this.renderTemplate(template, wedding, member, scriptFontDataMap));
		}),
	);
	protected readonly responseMessage = signal('');

	protected imageUrl(url?: string): string {
		return toDisplayImageUrl(url);
	}

	ngOnInit(): void {
		combineLatest([this.route.queryParamMap, this.templateSvg$])
			.pipe(
				filter(([params, template]) => params.get('print') === '1' && !!template),
				take(1),
			)
			.subscribe(() => {
				void this.printWhenReady();
			});
	}

	protected async respond(invitationStatus: 'accepted' | 'declined'): Promise<void> {
		const memberId = this.route.snapshot.paramMap.get('memberId');
		if (!memberId) {
			this.responseMessage.set('Convite individual nao encontrado.');
			return;
		}

		const weddingId = await firstValueFrom(this.weddingId$);
		await this.weddingService.updateWeddingPartyInvitation(memberId, invitationStatus, weddingId);
		this.responseMessage.set(invitationStatus === 'accepted' ? 'Resposta registrada. Obrigado pelo sim!' : 'Resposta registrada.');
	}

	protected shortCoupleName(member: { firstName: string; secondName: string }): string {
		return `${this.firstWord(member.firstName)} & ${this.firstWord(member.secondName)}`;
	}

	private async printWhenReady(): Promise<void> {
		await this.waitForFonts();
		await this.waitForEmbeddedImages();
		await this.nextFrame();
		window.print();
	}

	private async waitForFonts(): Promise<void> {
		if (!('fonts' in document)) {
			return;
		}

		const fontLoads = [
			...SCRIPT_FONT_OPTIONS.map((option) => document.fonts.load(`16px "${option.value}"`)),
			document.fonts.load('16px "Cormorant Garamond"'),
			document.fonts.load('16px "Playfair Display"'),
			document.fonts.ready,
		];

		await Promise.allSettled(fontLoads);
	}

	private async waitForEmbeddedImages(): Promise<void> {
		const imageUrls = Array.from(document.querySelectorAll('svg image'))
			.map((image) => image.getAttribute('href') || image.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
			.filter((url): url is string => !!url);

		if (!imageUrls.length) {
			return;
		}

		await Promise.allSettled(
			imageUrls.map(
				(url) =>
					new Promise<void>((resolve) => {
						const image = new Image();
						image.onload = () => resolve();
						image.onerror = () => resolve();
						image.src = url;
					}),
			),
		);
	}

	private nextFrame(): Promise<void> {
		return new Promise((resolve) => requestAnimationFrame(() => resolve()));
	}

	private async loadScriptFontDataMap(): Promise<Record<string, string>> {
		const entries = await Promise.all(
			SCRIPT_FONT_OPTIONS.map(async (option) => {
				if (!option.assetPath) {
					return [option.value, ''] as const;
				}

				const response = await fetch(option.assetPath);
				const buffer = await response.arrayBuffer();
				return [option.value, this.arrayBufferToDataUrl(buffer, option.assetPath)] as const;
			}),
		);

		return Object.fromEntries(entries);
	}

	private arrayBufferToDataUrl(buffer: ArrayBuffer, assetPath: string): string {
		const bytes = new Uint8Array(buffer);
		let binary = '';
		for (const byte of bytes) {
			binary += String.fromCharCode(byte);
		}

		const mimeType = assetPath.endsWith('.otf') ? 'font/otf' : 'font/ttf';
		return `data:${mimeType};base64,${btoa(binary)}`;
	}

	private async renderTemplate(
		template: string,
		wedding: Wedding,
		member: WeddingPartyMember,
		scriptFontDataMap: Record<string, string>,
	): Promise<string> {
		const parser = new DOMParser();
		const document = parser.parseFromString(template, 'image/svg+xml');
		const parserError = document.querySelector('parsererror');
		if (parserError) {
			return template;
		}

		const scriptFont = normalizeScriptFont(wedding.theme?.scriptFont);
		document.documentElement.setAttribute('width', '210mm');
		document.documentElement.setAttribute('height', '297mm');
		document.documentElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
		this.embedSvgFonts(document, scriptFont, scriptFontDataMap[scriptFont]);

		const imageUrl = this.imageUrl(wedding.coverImageUrl);
		this.setSvgCoupleNames(document, wedding.coupleNames || 'Os noivos');
		this.setSvgText(document, 'data', wedding.eventDate || '');
		this.setSvgText(document, 'pergunta', 'Vocês aceitam ser nossos padrinhos?');
		this.setSvgText(document, 'nomes-padrinhos', this.shortCoupleName(member));
		this.setSvgFont(document, 'nomes-noivos', scriptFont);
		this.setSvgFont(document, 'data', 'Cormorant Garamond');
		this.setSvgFont(document, 'nomes-padrinhos', 'Cormorant Garamond');
		await this.setInviteQrCode(
			document,
			this.groomsmenInviteUrl(wedding, member),
			this.readableThemeInk(this.normalizeHex(wedding.theme?.primary, '#173f25')),
		);
		this.applyTemplateTheme(document, wedding);

		const imageElement = document.getElementById('foto-casal') ?? document.querySelector('image');
		if (imageUrl && imageElement) {
			imageElement.setAttribute('href', imageUrl);
			imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageUrl);
			imageElement.setAttribute('x', '-24.813244');
			imageElement.setAttribute('y', '1.7500004');
			imageElement.setAttribute('width', '1112.1564');
			imageElement.setAttribute('height', '848.29474');
			imageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
		}

		return new XMLSerializer()
			.serializeToString(document.documentElement)
			.replace(/font-family:Bacalisties/g, "font-family:'Bacalisties'")
			.replace(/font-family:Likhan/g, "font-family:'Cormorant Garamond'")
			.replace(/font-family:FreeSerif/g, "font-family:'Cormorant Garamond'");
	}

	private groomsmenInviteUrl(wedding: Wedding, member: WeddingPartyMember): string {
		const weddingPath = wedding.slug || wedding.id || DEFAULT_WEDDING_ID;
		return `${window.location.origin}/${encodeURIComponent(weddingPath)}/convite-padrinhos/${encodeURIComponent(member.id)}`;
	}

	private async setInviteQrCode(document: Document, url: string, primary: string): Promise<void> {
		const qrImage = this.findQrImage(document);
		if (!qrImage) {
			return;
		}

		const qrCodeUrl = await QRCode.toDataURL(url, {
			margin: 1,
			width: 512,
			color: {
				dark: primary,
				light: '#ffffff',
			},
		});

		qrImage.setAttribute('href', qrCodeUrl);
		qrImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', qrCodeUrl);
		qrImage.setAttribute('preserveAspectRatio', 'none');
	}

	private findQrImage(document: Document): SVGImageElement | null {
		const imageById = document.getElementById('qr-code') || document.getElementById('image1-9');
		if (imageById?.tagName.toLowerCase() === 'image') {
			return imageById as unknown as SVGImageElement;
		}

		return Array.from(document.querySelectorAll('image')).find((image) => {
			const id = image.getAttribute('id')?.toLowerCase() || '';
			const label = image.getAttribute('inkscape:label')?.toLowerCase() || '';
			return id.includes('qr') || label.includes('qr');
		}) as SVGImageElement | undefined || null;
	}

	private setSvgText(document: Document, id: string, value: string): void {
		const element = document.getElementById(id);
		const textNode = element?.querySelector('tspan') ?? element;
		if (textNode) {
			textNode.textContent = value;
		}
	}

	private setSvgCoupleNames(document: Document, value: string): void {
		const element = document.getElementById('nomes-noivos');
		const firstTextNode = element?.querySelector('tspan');
		if (!element || !firstTextNode) {
			this.setSvgText(document, 'nomes-noivos', value);
			return;
		}

		const namespace = element.namespaceURI || 'http://www.w3.org/2000/svg';
		const x = firstTextNode.getAttribute('x') || element.getAttribute('x') || '527.0321';
		const y = firstTextNode.getAttribute('y') || element.getAttribute('y') || '574';
		const style = firstTextNode.getAttribute('style');

		element.textContent = '';
		element.setAttribute('xml:space', 'preserve');

		const singleLine = document.createElementNS(namespace, 'tspan');
		singleLine.setAttribute('x', x);
		singleLine.setAttribute('y', y);
		singleLine.setAttribute('xml:space', 'preserve');
		if (style) {
			singleLine.setAttribute('style', style);
		}
		singleLine.textContent = value;

		element.append(singleLine);
	}

	private setSvgFont(document: Document, id: string, fontFamily: string): void {
		const element = document.getElementById(id);
		const textNodes = Array.from(element?.querySelectorAll('tspan') ?? []);
		for (const target of [element, ...textNodes]) {
			if (!target) {
				continue;
			}

			target.setAttribute('font-family', fontFamily);
			const currentStyle = target.getAttribute('style') || '';
			const nextStyle = currentStyle
				.replace(/font-family:[^;]+;?/g, '')
				.replace(/-inkscape-font-specification:[^;]+;?/g, '')
				.trim();
			target.setAttribute('style', `${nextStyle}${nextStyle ? ';' : ''}font-family:'${fontFamily}','Times New Roman',serif`);
		}
	}

	private embedSvgFonts(document: Document, scriptFont: string, scriptFontDataUrl?: string): void {
		const svg = document.documentElement;
		const namespace = svg.namespaceURI || 'http://www.w3.org/2000/svg';
		const defs = document.querySelector('defs') ?? svg.insertBefore(document.createElementNS(namespace, 'defs'), svg.firstChild);
		const existingStyle = defs.querySelector('#sim-template-fonts');
		existingStyle?.remove();

		const scriptFontUrl = scriptFontDataUrl || scriptFontAssetPath(scriptFont) || '/fonts/Bacalisties.ttf';
		const style = document.createElementNS(namespace, 'style');
		style.setAttribute('id', 'sim-template-fonts');
		style.textContent = `
      @font-face { font-family: '${scriptFont}'; src: url('${scriptFontUrl}') format('truetype'); }
      #nomes-noivos, #nomes-noivos tspan { font-family: '${scriptFont}', 'Times New Roman', serif !important; white-space: pre !important; }
      #data, #data tspan, #nomes-padrinhos, #nomes-padrinhos tspan, #pergunta, #pergunta tspan, #mensagem, #mensagem tspan {
        font-family: 'Cormorant Garamond', 'Times New Roman', serif !important;
      }
      #subtitulo, #subtitulo tspan {
        font-family: 'Montserrat', Arial, sans-serif !important;
      }
    `;

		defs.append(style);
	}

	private applyTemplateTheme(document: Document, wedding: Wedding): void {
		const primary = this.normalizeHex(wedding.theme?.primary, '#173f25');
		const secondary = this.normalizeHex(wedding.theme?.secondary || wedding.theme?.tertiary, '#c9a35a');
		const ink = this.readableThemeInk(primary);
		const secondaryAccent = this.safeAccent(secondary);
		const background = '#ffffff';

		for (const target of ['icone-dos-noivos', 'nomes-noivos', 'data', 'pergunta', 'nomes-padrinhos', 'mensagem']) {
			this.setSvgColor(document, target, ink, 'fill');
		}

		this.setSvgColor(document, 'subtitulo', ink, 'fill');
		this.setBackgroundGradient(document, background);

		for (const target of [
			'divisor-nomes-data',
			'adornos-padrinhos',
			'divisor-padrinhos-mensagem',
			'divisor-convite-pergunta',
		]) {
			this.setSvgColor(document, target, secondaryAccent, 'both');
		}

		this.setSvgColor(document, 'moldura', secondaryAccent, 'stroke');
		this.applyFloralTheme(document, primary);
	}

	private setBackgroundGradient(document: Document, color: string): void {
		const background = this.findSvgTarget(document, 'cor-de fundo');
		if (!background) {
			return;
		}

		document.getElementById('sim-template-paper-glow')?.remove();
		background.setAttribute('stroke', 'none');
		this.tintExistingGradient(document, background, color);

		const currentStyle = background.getAttribute('style') || '';
		const nextStyle = currentStyle
			.replace(/stroke:[^;]+;?/g, '')
			.replace(/stroke-opacity:[^;]+;?/g, '')
			.trim();
		background.setAttribute('style', `${nextStyle}${nextStyle ? ';' : ''}stroke:none`);
	}

	private tintExistingGradient(document: Document, element: Element, color: string): void {
		const fill = element.getAttribute('fill') || element.getAttribute('style')?.match(/fill:\s*(url\(#([^)]+)\))/)?.[1] || '';
		const gradientId = fill.match(/url\(#([^)]+)\)/)?.[1];
		if (!gradientId) {
			return;
		}

		const gradient = document.getElementById(gradientId);
		if (!gradient) {
			return;
		}

		for (const stop of Array.from(gradient.querySelectorAll('stop'))) {
			const currentStyle = stop.getAttribute('style') || '';
			const nextStyle = currentStyle.includes('stop-color:')
				? currentStyle.replace(/stop-color:[^;]+;?/g, `stop-color:${color};`)
				: `${currentStyle}${currentStyle ? ';' : ''}stop-color:${color}`;
			stop.setAttribute('style', nextStyle);
			stop.setAttribute('stop-color', color);
		}
	}

	private setSvgColor(document: Document, targetName: string, color: string, mode: 'fill' | 'stroke' | 'both'): void {
		const root = this.findSvgTarget(document, targetName);
		if (!root) {
			return;
		}

		const elements = [root, ...Array.from(root.querySelectorAll('*'))];
		for (const element of elements) {
			const tagName = element.tagName.toLowerCase();
			const isText = tagName === 'text' || tagName === 'tspan';
			const isLine = tagName === 'line' || tagName === 'polyline';
			const isPaintableShape = ['path', 'rect', 'circle', 'ellipse', 'polygon'].includes(tagName);

			if ((mode === 'fill' || mode === 'both') && !isLine) {
				this.setPaintAttribute(element, 'fill', color, isText || isPaintableShape);
			}

			if (mode === 'stroke' || mode === 'both') {
				this.setPaintAttribute(element, 'stroke', color, isLine || isPaintableShape);
			}
		}
	}

	private setPaintAttribute(element: Element, property: 'fill' | 'stroke', color: string, force: boolean): void {
		const current = element.getAttribute(property);
		if (current && current !== 'none') {
			element.setAttribute(property, color);
			element.setAttribute(`${property}-opacity`, '1');
		} else if (force && current !== 'none') {
			element.setAttribute(property, color);
			element.setAttribute(`${property}-opacity`, '1');
		}

		const currentStyle = element.getAttribute('style');
		if (currentStyle?.includes(`${property}:`)) {
			element.setAttribute('style', this.replaceStylePaint(currentStyle, property, color));
		}
	}

	private replaceStylePaint(style: string, property: 'fill' | 'stroke', color: string): string {
		const opacityProperty = `${property}-opacity`;
		const declarations = style
			.split(';')
			.map((declaration) => {
				const [name, ...valueParts] = declaration.split(':');
				const normalizedName = name?.trim();
				if (normalizedName === opacityProperty) {
					return `${opacityProperty}:1`;
				}

				if (normalizedName !== property) {
					return declaration;
				}

				const currentValue = valueParts.join(':').trim();
				return currentValue === 'none' ? declaration : `${property}:${color}`;
			})
			.filter(Boolean);

		if (!declarations.some((declaration) => declaration.trim().startsWith(`${opacityProperty}:`))) {
			declarations.push(`${opacityProperty}:1`);
		}

		return declarations.join(';');
	}

	private applyFloralTheme(document: Document, primary: string): void {
		const floral = this.findSvgTarget(document, 'floral-borda');
		if (!floral) {
			return;
		}

		const filterId = 'sim-template-floral-tint';
		document.getElementById(filterId)?.remove();
		floral.removeAttribute('filter');

		const paintableElements = [floral, ...Array.from(floral.querySelectorAll('*'))].filter((element) =>
			['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'].includes(element.tagName.toLowerCase()),
		);

		paintableElements.forEach((element) => {
			this.remapPaintByTone(element, 'fill', primary);
			this.remapPaintByTone(element, 'stroke', primary);
		});
	}

	private remapPaintByTone(element: Element, property: 'fill' | 'stroke', primary: string): void {
		const attributePaint = element.getAttribute(property);
		const stylePaint = this.getStylePaint(element.getAttribute('style'), property);
		const sourcePaint = stylePaint || attributePaint;
		const sourceColor = this.parsePaintColor(sourcePaint);

		if (!sourceColor) {
			return;
		}

		const color = this.floralTone(primary, this.relativeLuminance(sourceColor));
		if (attributePaint && attributePaint !== 'none' && !attributePaint.startsWith('url(')) {
			element.setAttribute(property, color);
		}

		const currentStyle = element.getAttribute('style');
		if (currentStyle?.includes(`${property}:`)) {
			element.setAttribute('style', this.replaceStylePaint(currentStyle, property, color));
		}
	}

	private floralTone(primary: string, luminance: number): string {
		const naturalTone = this.naturalFloralTone(luminance);
		return this.mixHex(naturalTone, primary, 0.1);
	}

	private naturalFloralTone(luminance: number): string {
		if (luminance > 0.82) {
			return '#f3ead3';
		}

		if (luminance > 0.66) {
			return '#d7c99e';
		}

		if (luminance > 0.5) {
			return '#aeb27c';
		}

		if (luminance > 0.34) {
			return '#8d8f66';
		}

		if (luminance > 0.18) {
			return '#6f654f';
		}

		return '#4d4033';
	}

	private getStylePaint(style: string | null, property: 'fill' | 'stroke'): string | undefined {
		return style
			?.split(';')
			.map((declaration) => declaration.trim())
			.find((declaration) => declaration.startsWith(`${property}:`))
			?.split(':')
			.slice(1)
			.join(':')
			.trim();
	}

	private parsePaintColor(value: string | null | undefined): { red: number; green: number; blue: number } | undefined {
		if (!value || value === 'none' || value.startsWith('url(')) {
			return undefined;
		}

		const trimmed = value.trim();
		if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
			return this.hexToRgb(trimmed);
		}

		if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
			const [, red, green, blue] = trimmed;
			return this.hexToRgb(`#${red}${red}${green}${green}${blue}${blue}`);
		}

		const rgbMatch = trimmed.match(/^rgb\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*\)$/i);
		if (rgbMatch) {
			return {
				red: Number(rgbMatch[1]),
				green: Number(rgbMatch[2]),
				blue: Number(rgbMatch[3]),
			};
		}

		return undefined;
	}

	private relativeLuminance(color: { red: number; green: number; blue: number }): number {
		return (0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue) / 255;
	}

	private findSvgTarget(document: Document, targetName: string): Element | undefined {
		const byId = document.getElementById(targetName);
		if (byId) {
			return byId;
		}

		return Array.from(document.querySelectorAll('*')).find((element) => {
			const label =
				element.getAttribute('inkscape:label') ||
				element.getAttributeNS('http://www.inkscape.org/namespaces/inkscape', 'label');
			return label === targetName;
		});
	}

	private normalizeHex(value: string | undefined, fallback: string): string {
		if (!value) {
			return fallback;
		}

		const trimmed = value.trim();
		if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
			return trimmed;
		}

		if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
			const [, red, green, blue] = trimmed;
			return `#${red}${red}${green}${green}${blue}${blue}`;
		}

		return fallback;
	}

	private mixHex(color: string, target: string, amount: number): string {
		const sourceRgb = this.hexToRgb(color);
		const targetRgb = this.hexToRgb(target);

		return this.rgbToHex({
			red: Math.round(sourceRgb.red + (targetRgb.red - sourceRgb.red) * amount),
			green: Math.round(sourceRgb.green + (targetRgb.green - sourceRgb.green) * amount),
			blue: Math.round(sourceRgb.blue + (targetRgb.blue - sourceRgb.blue) * amount),
		});
	}

	private hexToRgb(hex: string): { red: number; green: number; blue: number } {
		return {
			red: Number.parseInt(hex.slice(1, 3), 16),
			green: Number.parseInt(hex.slice(3, 5), 16),
			blue: Number.parseInt(hex.slice(5, 7), 16),
		};
	}

	private rgbToHex(color: { red: number; green: number; blue: number }): string {
		return `#${[color.red, color.green, color.blue]
			.map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, '0'))
			.join('')}`;
	}

	private readableThemeInk(color: string): string {
		return this.mixHex(color, '#000000', 0.5);
	}

	private safeAccent(color: string): string {
		const luminance = this.relativeLuminance(this.hexToRgb(color));
		if (luminance > 0.78) {
			return this.mixHex(color, '#000000', 0.24);
		}

		return color;
	}

	private firstWord(value: string): string {
		return value.trim().split(/\s+/)[0] || value;
	}

}
