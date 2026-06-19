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
				map(([url, activeWeddingId]) => this.weddingIdFromUrl(url, activeWeddingId)),
				switchMap((weddingId) => this.weddingService.wedding$(weddingId)),
			)
			.subscribe((wedding) => {
				const root = document.documentElement;
				this.applyTheme(root, wedding?.theme);
				this.applyScriptFont(root, wedding?.theme?.scriptFont);
			});
	}

	applyTheme(root: HTMLElement, _theme?: WeddingTheme): void {
		const neutralTheme = {
			primary: '#3F3F3A',
			primaryRgb: '63, 63, 58',
			primarySoft: '#8A8A82',
			primaryLight: '#C9C9C2',
			primaryPale: '#EDEDEA',
			primaryContrast: '#FFFFFF',
			secondary: '#6F6F68',
			secondaryRgb: '111, 111, 104',
			contrast: '#2B2B28',
			contrastSoft: '#D9D9D4',
			tertiary: '#F1F1EE',
			tertiaryRgb: '241, 241, 238',
			neutral: '#FFFFFF',
			neutralRgb: '255, 255, 255',
			background: '#F8F8F6',
			backgroundRgb: '248, 248, 246',
			surface: '#FFFFFF',
			surfaceStrong: '#FFFFFF',
			text: '#242421',
			muted: '#6F6F68',
			border: '#DEDED8',
			soft: '#EFEFEB',
			shadow: '46, 46, 42',
		};

		root.style.setProperty('--color-primary', neutralTheme.primary);
		root.style.setProperty('--color-primary-rgb', neutralTheme.primaryRgb);
		root.style.setProperty('--color-primary-soft', neutralTheme.primarySoft);
		root.style.setProperty('--color-primary-light', neutralTheme.primaryLight);
		root.style.setProperty('--color-primary-pale', neutralTheme.primaryPale);
		root.style.setProperty('--color-primary-contrast', neutralTheme.primaryContrast);
		root.style.setProperty('--color-secondary', neutralTheme.secondary);
		root.style.setProperty('--color-secondary-rgb', neutralTheme.secondaryRgb);
		root.style.setProperty('--color-contrast', neutralTheme.contrast);
		root.style.setProperty('--color-contrast-soft', neutralTheme.contrastSoft);
		root.style.setProperty('--color-tertiary', neutralTheme.tertiary);
		root.style.setProperty('--color-tertiary-rgb', neutralTheme.tertiaryRgb);
		root.style.setProperty('--color-neutral', neutralTheme.neutral);
		root.style.setProperty('--color-neutral-rgb', neutralTheme.neutralRgb);
		root.style.setProperty('--color-background', neutralTheme.background);
		root.style.setProperty('--color-background-rgb', neutralTheme.backgroundRgb);
		root.style.setProperty('--color-surface', neutralTheme.surface);
		root.style.setProperty('--color-surface-strong', neutralTheme.surfaceStrong);
		root.style.setProperty('--color-text', neutralTheme.text);
		root.style.setProperty('--color-muted', neutralTheme.muted);
		root.style.setProperty('--color-border', neutralTheme.border);
		root.style.setProperty('--color-soft', neutralTheme.soft);
		root.style.setProperty('--color-shadow', neutralTheme.shadow);
		root.style.setProperty('--color-qr-dark', neutralTheme.text);
		root.style.setProperty('--color-qr-light', neutralTheme.surface);
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

	private publicRouteSegments(): Set<string> {
		return new Set([
			'album',
			'confirmar-presenca',
			'convite',
			'convite-especial',
			'convite-padrinhos',
			'local',
			'mais',
			'presentes',
			'recados',
		]);
	}

}
