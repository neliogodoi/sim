import { Injectable } from '@angular/core';

export type ContrastRule = 'analogous' | 'complementary' | 'splitComplementary' | 'triadic' | 'tetradic' | 'square';

export type WeddingThemeRecipeId = 'elegant' | 'romantic' | 'editorial' | 'ceremonial' | 'modern' | 'bold';

export type WeddingAccentStrategy = 'champagne' | 'rose' | 'terracotta' | 'gold' | 'graphite' | 'deepContrast';

export type WeddingNeutralStrategy = 'offWhite' | 'fendi' | 'sand' | 'ivory' | 'softGray' | 'warmWhite';

export interface WeddingThemeRecipe {
	id: WeddingThemeRecipeId;
	name: string;
	description: string;
	accentStrategy: WeddingAccentStrategy;
	neutralStrategy: WeddingNeutralStrategy;
}

export const WEDDING_THEME_RECIPES: WeddingThemeRecipe[] = [
	{
		id: 'elegant',
		name: 'Elegante',
		description: 'Harmônico, suave e romântico.',
		accentStrategy: 'champagne',
		neutralStrategy: 'offWhite',
	},
	{
		id: 'romantic',
		name: 'Romântico',
		description: 'Delicado, afetivo e acolhedor.',
		accentStrategy: 'rose',
		neutralStrategy: 'fendi',
	},
	{
		id: 'editorial',
		name: 'Editorial',
		description: 'Criativo, sofisticado e autoral.',
		accentStrategy: 'terracotta',
		neutralStrategy: 'sand',
	},
	{
		id: 'ceremonial',
		name: 'Cerimonial',
		description: 'Clássico, rico e solene.',
		accentStrategy: 'gold',
		neutralStrategy: 'ivory',
	},
	{
		id: 'modern',
		name: 'Moderno',
		description: 'Minimalista, limpo e contemporâneo.',
		accentStrategy: 'graphite',
		neutralStrategy: 'softGray',
	},
	{
		id: 'bold',
		name: 'Marcante',
		description: 'Mais contraste e presença visual.',
		accentStrategy: 'deepContrast',
		neutralStrategy: 'warmWhite',
	},
];

export interface GeneratedWeddingTheme {
	primary: string;
	primarySoft: string;
	primaryLight: string;
	primaryPale: string;
	contrast: string;
	contrastSoft: string;
	background: string;
	surface: string;
	text: string;
	muted: string;
	border: string;
	contrastRule: ContrastRule;
	recipeId: WeddingThemeRecipeId;
}

@Injectable({
	providedIn: 'root',
})
export class ThemeGeneratorService {
	generateTheme(primaryColor: string, recipeIdOrContrastRule: WeddingThemeRecipeId | ContrastRule): GeneratedWeddingTheme {
		const primary = this.normalizeHex(primaryColor) || '#8A3A4A';
		const recipe = this.recipeById(recipeIdOrContrastRule);
		const primaryHsl = this.hexToHsl(primary);
		const primaryBase = this.hslToHex({
			...primaryHsl,
			s: this.clamp(primaryHsl.s, 18, 64),
			l: this.clamp(primaryHsl.l, 24, 48),
		});
		const accent = this.accentColor(primaryHsl, recipe.accentStrategy);
		const neutral = this.neutralPalette(recipe.neutralStrategy);
		const text = this.textColor(primaryHsl, recipe.id);
		const muted = this.mix(text, neutral.background, recipe.id === 'bold' ? 32 : 44);
		const primaryPale = this.mix(primaryBase, neutral.background, recipe.id === 'modern' ? 82 : 76);
		const contrastSoft = this.mix(accent, neutral.background, recipe.id === 'bold' ? 58 : 72);

		return {
			primary: primaryBase,
			primarySoft: this.mix(primaryBase, neutral.background, 34),
			primaryLight: this.mix(primaryBase, neutral.background, 58),
			primaryPale,
			contrast: accent,
			contrastSoft,
			background: neutral.background,
			surface: neutral.surface,
			text,
			muted,
			border: this.mix(text, neutral.background, 84),
			contrastRule: this.legacyContrastRule(recipe.id),
			recipeId: recipe.id,
		};
	}

	lighten(hex: string, amount: number): string {
		const hsl = this.hexToHsl(hex);
		return this.hslToHex({ ...hsl, l: this.clamp(hsl.l + amount, 0, 100) });
	}

	private contrastHue(hue: number, contrastRule: ContrastRule): number {
		const hueShiftByRule: Record<ContrastRule, number> = {
			analogous: 30,
			complementary: 180,
			splitComplementary: 150,
			triadic: 120,
			tetradic: 60,
			square: 90,
		};

		return hue + hueShiftByRule[contrastRule];
	}

	private recipeById(value: WeddingThemeRecipeId | ContrastRule): WeddingThemeRecipe {
		const legacyMap: Record<ContrastRule, WeddingThemeRecipeId> = {
			analogous: 'elegant',
			complementary: 'bold',
			splitComplementary: 'romantic',
			triadic: 'editorial',
			tetradic: 'ceremonial',
			square: 'modern',
		};
		const recipeId = (legacyMap[value as ContrastRule] || value) as WeddingThemeRecipeId;
		return WEDDING_THEME_RECIPES.find((recipe) => recipe.id === recipeId) || WEDDING_THEME_RECIPES[0];
	}

	private legacyContrastRule(recipeId: WeddingThemeRecipeId): ContrastRule {
		const contrastRuleByRecipe: Record<WeddingThemeRecipeId, ContrastRule> = {
			elegant: 'analogous',
			romantic: 'splitComplementary',
			editorial: 'triadic',
			ceremonial: 'tetradic',
			modern: 'square',
			bold: 'complementary',
		};
		return contrastRuleByRecipe[recipeId];
	}

	private accentColor(primaryHsl: Hsl, strategy: WeddingAccentStrategy): string {
		const accentByStrategy: Record<WeddingAccentStrategy, Partial<Hsl>> = {
			champagne: { h: 40, s: 42, l: 66 },
			rose: { h: 350, s: 34, l: 64 },
			terracotta: { h: 18, s: 50, l: 50 },
			gold: { h: 42, s: 58, l: 55 },
			graphite: { h: primaryHsl.h, s: 8, l: 28 },
			deepContrast: { h: this.normalizeHue(primaryHsl.h + 180), s: this.clamp(primaryHsl.s + 8, 38, 72), l: 26 },
		};
		const accent = accentByStrategy[strategy];
		return this.hslToHex({
			h: accent.h ?? primaryHsl.h,
			s: accent.s ?? primaryHsl.s,
			l: accent.l ?? primaryHsl.l,
		});
	}

	private neutralPalette(strategy: WeddingNeutralStrategy): { background: string; surface: string } {
		const neutralByStrategy: Record<WeddingNeutralStrategy, { background: string; surface: string }> = {
			offWhite: { background: '#FBFAF6', surface: '#FFFFFF' },
			fendi: { background: '#F4EFE8', surface: '#FFFDF9' },
			sand: { background: '#F3E8D9', surface: '#FFF9F0' },
			ivory: { background: '#FFF9EC', surface: '#FFFFFF' },
			softGray: { background: '#F3F3F1', surface: '#FFFFFF' },
			warmWhite: { background: '#FFFDF8', surface: '#FFFFFF' },
		};
		return neutralByStrategy[strategy];
	}

	private textColor(primaryHsl: Hsl, recipeId: WeddingThemeRecipeId): string {
		if (recipeId === 'modern') {
			return '#232323';
		}

		if (recipeId === 'bold') {
			return this.hslToHex({
				...primaryHsl,
				s: this.clamp(primaryHsl.s + 8, 34, 72),
				l: 16,
			});
		}

		return this.hslToHex({
			...primaryHsl,
			s: this.clamp(primaryHsl.s * 0.72, 20, 48),
			l: 20,
		});
	}

	private mix(firstHex: string, secondHex: string, secondWeight: number): string {
		const first = this.hexToRgb(firstHex);
		const second = this.hexToRgb(secondHex);
		const ratio = this.clamp(secondWeight, 0, 100) / 100;
		const mixed = {
			r: first.r * (1 - ratio) + second.r * ratio,
			g: first.g * (1 - ratio) + second.g * ratio,
			b: first.b * (1 - ratio) + second.b * ratio,
		};
		return this.rgbToHex(mixed);
	}

	private normalizeHex(hex: string): string | null {
		const normalized = hex.trim().replace('#', '');
		const value =
			normalized.length === 3
				? normalized
						.split('')
						.map((part) => `${part}${part}`)
						.join('')
				: normalized;

		if (!/^[0-9a-fA-F]{6}$/.test(value)) {
			return null;
		}

		return `#${value.toUpperCase()}`;
	}

	private hexToHsl(hex: string): Hsl {
		const normalized = this.normalizeHex(hex) || '#8A3A4A';
		const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
		const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
		const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		const delta = max - min;
		const lightness = (max + min) / 2;
		let hue = 0;
		let saturation = 0;

		if (delta !== 0) {
			saturation = delta / (1 - Math.abs(2 * lightness - 1));

			if (max === red) {
				hue = 60 * (((green - blue) / delta) % 6);
			} else if (max === green) {
				hue = 60 * ((blue - red) / delta + 2);
			} else {
				hue = 60 * ((red - green) / delta + 4);
			}
		}

		return {
			h: this.normalizeHue(hue),
			s: Math.round(saturation * 100),
			l: Math.round(lightness * 100),
		};
	}

	private hslToHex({ h, s, l }: Hsl): string {
		const saturation = this.clamp(s, 0, 100) / 100;
		const lightness = this.clamp(l, 0, 100) / 100;
		const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
		const huePrime = this.normalizeHue(h) / 60;
		const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
		const match = lightness - chroma / 2;
		let red = 0;
		let green = 0;
		let blue = 0;

		if (huePrime >= 0 && huePrime < 1) {
			red = chroma;
			green = x;
		} else if (huePrime >= 1 && huePrime < 2) {
			red = x;
			green = chroma;
		} else if (huePrime >= 2 && huePrime < 3) {
			green = chroma;
			blue = x;
		} else if (huePrime >= 3 && huePrime < 4) {
			green = x;
			blue = chroma;
		} else if (huePrime >= 4 && huePrime < 5) {
			red = x;
			blue = chroma;
		} else {
			red = chroma;
			blue = x;
		}

		return `#${[red, green, blue]
			.map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0'))
			.join('')
			.toUpperCase()}`;
	}

	private hexToRgb(hex: string): Rgb {
		const normalized = this.normalizeHex(hex) || '#000000';
		return {
			r: Number.parseInt(normalized.slice(1, 3), 16),
			g: Number.parseInt(normalized.slice(3, 5), 16),
			b: Number.parseInt(normalized.slice(5, 7), 16),
		};
	}

	private rgbToHex({ r, g, b }: Rgb): string {
		return `#${[r, g, b]
			.map((channel) => Math.round(this.clamp(channel, 0, 255)).toString(16).padStart(2, '0'))
			.join('')
			.toUpperCase()}`;
	}

	private normalizeHue(hue: number): number {
		return ((hue % 360) + 360) % 360;
	}

	private clamp(value: number, min: number, max: number): number {
		return Math.min(max, Math.max(min, value));
	}
}

interface Hsl {
	h: number;
	s: number;
	l: number;
}

interface Rgb {
	r: number;
	g: number;
	b: number;
}
