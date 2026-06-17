import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, firstValueFrom, from, map, of, shareReplay, switchMap, take } from 'rxjs';

import { normalizeScriptFont } from '../../../core/constants/script-fonts';
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
  protected readonly templateSvg$ = combineLatest([this.templateSource$, this.wedding$, this.member$]).pipe(
    map(([template, wedding, member]) => {
      if (!wedding || !member) {
        return undefined;
      }

      return this.sanitizer.bypassSecurityTrustHtml(this.renderTemplate(template, wedding, member));
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
      .subscribe(() => setTimeout(() => window.print()));
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

  private renderTemplate(template: string, wedding: Wedding, member: WeddingPartyMember): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(template, 'image/svg+xml');
    const parserError = document.querySelector('parsererror');
    if (parserError) {
      return template;
    }

    document.documentElement.setAttribute('width', '210mm');
    document.documentElement.setAttribute('height', '297mm');
    document.documentElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    const imageUrl = this.imageUrl(wedding.coverImageUrl);
    this.setSvgText(document, 'nomes-noivos', wedding.coupleNames || 'Os noivos');
    this.setSvgText(document, 'data', wedding.eventDate || '');
    this.setSvgText(document, 'pergunta', 'Vocês aceitam ser nossos padrinhos?');
    this.setSvgText(document, 'nomes-padrinhos', this.shortCoupleName(member));
    this.setSvgFont(document, 'nomes-noivos', normalizeScriptFont(wedding.theme?.scriptFont));
    this.setSvgFont(document, 'data', 'Cormorant Garamond');
    this.setSvgFont(document, 'nomes-padrinhos', 'Cormorant Garamond');
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

  private setSvgText(document: Document, id: string, value: string): void {
    const element = document.getElementById(id);
    const textNode = element?.querySelector('tspan') ?? element;
    if (textNode) {
      textNode.textContent = value;
    }
  }

  private setSvgFont(document: Document, id: string, fontFamily: string): void {
    const element = document.getElementById(id);
    const textNode = element?.querySelector('tspan');
    for (const target of [element, textNode]) {
      if (!target) {
        continue;
      }

      target.setAttribute('font-family', fontFamily);
      const currentStyle = target.getAttribute('style') || '';
      const nextStyle = currentStyle
        .replace(/font-family:[^;]+;?/g, '')
        .replace(/-inkscape-font-specification:[^;]+;?/g, '')
        .trim();
      target.setAttribute('style', `${nextStyle}${nextStyle ? ';' : ''}font-family:'${fontFamily}'`);
    }
  }

  private applyTemplateTheme(document: Document, wedding: Wedding): void {
    const primary = this.normalizeHex(wedding.theme?.primary, '#173f25');
    const secondary = this.normalizeHex(wedding.theme?.secondary || wedding.theme?.tertiary, '#c9a35a');
    const background = this.normalizeHex(wedding.theme?.background || wedding.theme?.neutral, '#fffaf3');

    for (const target of ['nomes-noivos', 'data', 'pergunta', 'nomes-padrinhos', 'mensagem']) {
      this.setSvgColor(document, target, primary, 'fill');
    }

    this.setSvgColor(document, 'subtitulo', primary, 'fill');
    this.setSvgColor(document, 'cor-de fundo', background, 'fill');

    for (const target of [
      'divisor-nomes-data',
      'adornos-padrinhos',
      'divior-padrinhos-mensagem',
      'divisor-titulo-pergunta',
      'icone-dos-noivos',
    ]) {
      this.setSvgColor(document, target, secondary, 'both');
    }

    this.setSvgColor(document, 'moldura', secondary, 'stroke');
    this.applyFloralTint(document, primary);
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
    } else if (force && current !== 'none') {
      element.setAttribute(property, color);
    }

    const currentStyle = element.getAttribute('style');
    if (currentStyle?.includes(`${property}:`)) {
      element.setAttribute('style', this.replaceStylePaint(currentStyle, property, color));
    }
  }

  private replaceStylePaint(style: string, property: 'fill' | 'stroke', color: string): string {
    return style
      .split(';')
      .map((declaration) => {
        const [name, ...valueParts] = declaration.split(':');
        if (name?.trim() !== property) {
          return declaration;
        }

        const currentValue = valueParts.join(':').trim();
        return currentValue === 'none' ? declaration : `${property}:${color}`;
      })
      .join(';');
  }

  private applyFloralTint(document: Document, color: string): void {
    const floral = this.findSvgTarget(document, 'floral-borda');
    if (!floral) {
      return;
    }

    const svg = document.documentElement;
    const namespace = svg.namespaceURI || 'http://www.w3.org/2000/svg';
    const filterId = 'sim-template-floral-tint';
    const defs = document.querySelector('defs') ?? svg.insertBefore(document.createElementNS(namespace, 'defs'), svg.firstChild);
    document.getElementById(filterId)?.remove();

    const filter = document.createElementNS(namespace, 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    const flood = document.createElementNS(namespace, 'feFlood');
    flood.setAttribute('flood-color', color);
    flood.setAttribute('flood-opacity', '0.32');
    flood.setAttribute('result', 'themeTint');

    const blend = document.createElementNS(namespace, 'feBlend');
    blend.setAttribute('in', 'SourceGraphic');
    blend.setAttribute('in2', 'themeTint');
    blend.setAttribute('mode', 'multiply');
    blend.setAttribute('result', 'tinted');

    const saturate = document.createElementNS(namespace, 'feColorMatrix');
    saturate.setAttribute('in', 'tinted');
    saturate.setAttribute('type', 'saturate');
    saturate.setAttribute('values', '0.75');

    filter.append(flood, blend, saturate);
    defs.append(filter);
    floral.setAttribute('filter', `url(#${filterId})`);
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

  private firstWord(value: string): string {
    return value.trim().split(/\s+/)[0] || value;
  }

}
