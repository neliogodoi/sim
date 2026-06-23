import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, filter, map, startWith, switchMap } from 'rxjs';

import { scriptFontCssFamily } from '../constants/script-fonts';
import { WeddingTheme } from '../models/wedding.models';
import { WeddingContextService } from './wedding-context.service';
import { WeddingService } from './wedding.service';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private readonly router = inject(Router);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);

	initialize(): void {
		combineLatest([this.currentUrl$(), this.weddingContextService.activeWeddingId$])
			.pipe(
				map(([url, activeWeddingId]) => ({
					isPublicWeddingRoute: this.isPublicWeddingRoute(url),
					weddingId: this.weddingIdFromUrl(url, activeWeddingId),
				})),
				switchMap((context) =>
					this.weddingService.wedding$(context.weddingId).pipe(
						map((wedding) => ({
							...context,
							wedding,
						})),
					),
				),
			)
			.subscribe(({ isPublicWeddingRoute, wedding }) => {
				const root = document.documentElement;
				this.applyTheme(root, wedding?.theme);
				this.applyScriptFont(root, isPublicWeddingRoute ? wedding?.theme?.scriptFont : undefined);
			});
	}

	applyTheme(root: HTMLElement, theme?: WeddingTheme): void {
		const neutralTheme = this.neutralTheme();
		const resolvedTheme = theme ? this.publicWeddingTheme(theme) : neutralTheme;

		root.style.setProperty('--color-primary', resolvedTheme.primary);
		root.style.setProperty('--color-primary-rgb', resolvedTheme.primaryRgb);
		root.style.setProperty('--color-primary-soft', resolvedTheme.primarySoft);
		root.style.setProperty('--color-primary-light', resolvedTheme.primaryLight);
		root.style.setProperty('--color-primary-pale', resolvedTheme.primaryPale);
		root.style.setProperty('--color-primary-contrast', resolvedTheme.primaryContrast);
		root.style.setProperty('--color-secondary', resolvedTheme.secondary);
		root.style.setProperty('--color-secondary-rgb', resolvedTheme.secondaryRgb);
		root.style.setProperty('--color-contrast', resolvedTheme.contrast);
		root.style.setProperty('--color-contrast-soft', resolvedTheme.contrastSoft);
		root.style.setProperty('--color-tertiary', resolvedTheme.tertiary);
		root.style.setProperty('--color-tertiary-rgb', resolvedTheme.tertiaryRgb);
		root.style.setProperty('--color-neutral', resolvedTheme.neutral);
		root.style.setProperty('--color-neutral-rgb', resolvedTheme.neutralRgb);
		root.style.setProperty('--color-background', resolvedTheme.background);
		root.style.setProperty('--color-background-rgb', resolvedTheme.backgroundRgb);
		root.style.setProperty('--color-surface', resolvedTheme.surface);
		root.style.setProperty('--color-surface-strong', resolvedTheme.surfaceStrong);
		root.style.setProperty('--color-text', resolvedTheme.text);
		root.style.setProperty('--color-muted', resolvedTheme.muted);
		root.style.setProperty('--color-border', resolvedTheme.border);
		root.style.setProperty('--color-soft', resolvedTheme.soft);
		root.style.setProperty('--color-shadow', resolvedTheme.shadow);
		root.style.setProperty('--color-qr-dark', resolvedTheme.text);
		root.style.setProperty('--color-qr-light', resolvedTheme.surface);
	}

	private neutralTheme(): ResolvedThemeTokens {
		const text = '#243C27';
		return {
			primary: '#568A5B',
			primaryRgb: '86, 138, 91',
			primarySoft: '#6F9A73',
			primaryLight: '#C8D8C9',
			primaryPale: '#EFF5EF',
			primaryContrast: '#FFFFFF',
			secondary: '#6D866F',
			secondaryRgb: '109, 134, 111',
			contrast: '#C6A46A',
			contrastSoft: '#F5EBDC',
			tertiary: '#FBF8F3',
			tertiaryRgb: '251, 248, 243',
			neutral: '#FFFEFC',
			neutralRgb: '255, 253, 251',
			background: '#FCF9F4',
			backgroundRgb: '252, 249, 244',
			surface: '#FEFCF8',
			surfaceStrong: '#FFFFFF',
			text,
			muted: '#617764',
			border: '#ECE7DF',
			soft: '#F1F6F1',
			shadow: this.rgbString(text),
		};
	}

	private publicWeddingTheme(theme: WeddingTheme): ResolvedThemeTokens {
		const fallback = this.neutralTheme();
		const primary = this.normalizeHex(theme.primary, fallback.primary);
		const backgroundBase = this.normalizeHex(theme.background || theme.neutral, '#FBFAF6');
		const background = this.mix(backgroundBase, '#FFFFFF', 30);
		const surfaceBase = this.normalizeHex(theme.surface, '#FFFFFF');
		const surface = this.mix(surfaceBase, '#FFFFFF', 18);
		const text = this.normalizeHex(theme.text, this.strongTextFromPrimary(primary));
		const muted = this.normalizeHex(theme.muted || theme.secondary, this.mix(text, background, 48));
		const secondary = this.normalizeHex(theme.secondary || theme.contrast, muted);
		const contrast = this.normalizeHex(theme.contrast || theme.secondary, secondary);
		const tertiary = this.normalizeHex(theme.tertiary || theme.primaryPale, this.mix(primary, background, 76));
		const neutral = this.normalizeHex(theme.neutral || background, background);
		const primarySoft = this.normalizeHex(theme.primarySoft, this.mix(primary, background, 34));
		const primaryLight = this.normalizeHex(theme.primaryLight, this.mix(primary, background, 66));
		const primaryPale = this.normalizeHex(theme.primaryPale, this.mix(primary, background, 84));
		const contrastSoft = this.normalizeHex(theme.contrastSoft, this.mix(contrast, background, 72));
		const border = this.normalizeHex(theme.border, this.mix(text, background, 89));
		const soft = this.mix(primary, background, 92);

		return {
			primary,
			primaryRgb: this.rgbString(primary),
			primarySoft,
			primaryLight,
			primaryPale,
			primaryContrast: this.normalizeHex(theme.primaryContrast, this.readableOn(primary)),
			secondary,
			secondaryRgb: this.rgbString(secondary),
			contrast,
			contrastSoft,
			tertiary,
			tertiaryRgb: this.rgbString(tertiary),
			neutral,
			neutralRgb: this.rgbString(neutral),
			background,
			backgroundRgb: this.rgbString(background),
			surface,
			surfaceStrong: surface,
			text,
			muted,
			border,
			soft,
			shadow: this.rgbString(text),
		};
	}

	applyScriptFont(root: HTMLElement, scriptFont?: string): void {
		root.style.setProperty(
			'--font-script',
			`${scriptFontCssFamily(scriptFont)}, 'Brittany Signature', 'Great Vibes', Georgia, 'Times New Roman', serif`,
		);
	}

	private currentUrl$() {
		return this.router.events.pipe(
			filter((event): event is NavigationEnd => event instanceof NavigationEnd),
			map((event) => event.urlAfterRedirects),
			startWith(this.router.url),
		);
	}

	private weddingIdFromUrl(url: string, activeWeddingId: string): string {
		const [path] = url.split('?');
		const [firstSegment = ''] = path.split('/').filter(Boolean);

		if (firstSegment === 'admin') {
			return activeWeddingId;
		}

		if (firstSegment === 'demo') {
			return 'default';
		}

		if (!firstSegment || this.publicRouteSegments().has(firstSegment)) {
			return 'default';
		}

		return firstSegment;
	}

	private isPublicWeddingRoute(url: string): boolean {
		const [path] = url.split('?');
		const [firstSegment = ''] = path.split('/').filter(Boolean);

		if (!firstSegment || firstSegment === 'admin' || firstSegment === 'demo') {
			return false;
		}

		return true;
	}

	private publicRouteSegments(): Set<string> {
		return new Set([
			'album',
			'agenda',
			'confirmar-presenca',
			'convite',
			'convite-especial',
			'convite-padrinhos',
			'local',
			'mais',
			'musicas',
			'padrinhos',
			'pessoas',
			'presentes',
			'recados',
		]);
	}

	private normalizeHex(value: string | undefined, fallback: string): string {
		if (!value) {
			return fallback;
		}

		const trimmed = value.trim();
		const short = /^#?([0-9a-f]{3})$/i.exec(trimmed);
		if (short) {
			return `#${short[1]
				.split('')
				.map((char) => `${char}${char}`)
				.join('')}`.toUpperCase();
		}

		const long = /^#?([0-9a-f]{6})$/i.exec(trimmed);
		return long ? `#${long[1]}`.toUpperCase() : fallback;
	}

	private strongTextFromPrimary(primary: string): string {
		return this.mix(primary, '#11160F', 34);
	}

	private readableOn(hex: string): string {
		const { r, g, b } = this.hexToRgb(hex);
		const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
		return luminance > 0.56 ? '#242421' : '#FFFFFF';
	}

	private mix(firstHex: string, secondHex: string, secondWeight: number): string {
		const first = this.hexToRgb(firstHex);
		const second = this.hexToRgb(secondHex);
		const ratio = Math.min(Math.max(secondWeight, 0), 100) / 100;
		return this.rgbToHex({
			r: first.r * (1 - ratio) + second.r * ratio,
			g: first.g * (1 - ratio) + second.g * ratio,
			b: first.b * (1 - ratio) + second.b * ratio,
		});
	}

	private rgbString(hex: string): string {
		const { r, g, b } = this.hexToRgb(hex);
		return `${r}, ${g}, ${b}`;
	}

	private hexToRgb(hex: string): Rgb {
		const normalized = this.normalizeHex(hex, '#000000').slice(1);
		return {
			r: Number.parseInt(normalized.slice(0, 2), 16),
			g: Number.parseInt(normalized.slice(2, 4), 16),
			b: Number.parseInt(normalized.slice(4, 6), 16),
		};
	}

	private rgbToHex(rgb: Rgb): string {
		const toHex = (value: number) =>
			Math.round(Math.min(Math.max(value, 0), 255))
				.toString(16)
				.padStart(2, '0');
		return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
	}

}

interface ResolvedThemeTokens {
	primary: string;
	primaryRgb: string;
	primarySoft: string;
	primaryLight: string;
	primaryPale: string;
	primaryContrast: string;
	secondary: string;
	secondaryRgb: string;
	contrast: string;
	contrastSoft: string;
	tertiary: string;
	tertiaryRgb: string;
	neutral: string;
	neutralRgb: string;
	background: string;
	backgroundRgb: string;
	surface: string;
	surfaceStrong: string;
	text: string;
	muted: string;
	border: string;
	soft: string;
	shadow: string;
}

interface Rgb {
	r: number;
	g: number;
	b: number;
}
