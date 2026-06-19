import { Injectable } from '@angular/core';

export type ContrastRule = 'analogous' | 'complementary' | 'splitComplementary' | 'triadic' | 'tetradic' | 'square';

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
}

@Injectable({
	providedIn: 'root',
})
export class ThemeGeneratorService {
	generateTheme(primaryColor: string, contrastRule: ContrastRule): GeneratedWeddingTheme {
		const primary = this.normalizeHex(primaryColor) || '#8A3A4A';
		const primaryHsl = this.hexToHsl(primary);
		const contrastHue = this.contrastHue(primaryHsl.h, contrastRule);
		const contrast = this.hslToHex({
			h: this.normalizeHue(contrastHue),
			s: this.clamp(primaryHsl.s, 25, 70),
			l: this.clamp(primaryHsl.l, 28, 55),
		});
		const lowSaturationPrimary = { ...primaryHsl, s: this.clamp(primaryHsl.s * 0.18, 8, 18) };

		return {
			primary,
			primarySoft: this.lighten(primary, 16),
			primaryLight: this.lighten(primary, 34),
			primaryPale: this.lighten(primary, 58),
			contrast,
			contrastSoft: this.lighten(contrast, 42),
			background: this.hslToHex({ ...lowSaturationPrimary, l: 97 }),
			surface: '#FFFFFF',
			text: this.hslToHex({ ...lowSaturationPrimary, l: 14 }),
			muted: this.hslToHex({ ...lowSaturationPrimary, l: 46 }),
			border: this.hslToHex({ ...lowSaturationPrimary, l: 88 }),
			contrastRule,
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
