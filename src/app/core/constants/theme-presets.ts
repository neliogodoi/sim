export interface ThemePreset {
	id: string;
	name: string;
	category: string;
	description: string;
	primary: string;
	secondary: string;
	tertiary: string;
	neutral: string;
}

export const THEME_PRESETS: ThemePreset[] = [
	{
		id: 'verde-salvia',
		name: 'Verde Salvia',
		category: 'Verde Salvia + Branco + Off-White',
		description: 'Natural, leve e atemporal para convites delicados e cerimonias ao ar livre.',
		primary: '#6f8469',
		secondary: '#ffffff',
		tertiary: '#f4f0e8',
		neutral: '#fffdf8',
	},
	{
		id: 'azul-champagne',
		name: 'Azul Marinho',
		category: 'Azul Marinho + Champagne + Dourado',
		description: 'Elegante e luxuoso para celebracoes classicas a noite.',
		primary: '#17243f',
		secondary: '#c9a35a',
		tertiary: '#ead8b3',
		neutral: '#fffaf0',
	},
	{
		id: 'mocha-creme',
		name: 'Mocha',
		category: 'Mocha + Creme + Cappuccino',
		description: 'Sofisticado, quente e aconchegante em tons de marrom.',
		primary: '#6f5648',
		secondary: '#b99675',
		tertiary: '#f3eadb',
		neutral: '#fff8ef',
	},
	{
		id: 'chumbo-oliva',
		name: 'Chumbo Oliva',
		category: 'Cinza Chumbo + Verde Oliva + Branco',
		description: 'Moderno e chique para espacos industriais ou contemporaneos.',
		primary: '#34383b',
		secondary: '#7c8751',
		tertiary: '#ffffff',
		neutral: '#ffffff',
	},
	{
		id: 'terracota-mostarda',
		name: 'Terracota',
		category: 'Terracota + Mostarda + Bege',
		description: 'Boho, terroso e acolhedor para entardecer ou dias frios.',
		primary: '#b35f3d',
		secondary: '#c59a2f',
		tertiary: '#e7d3ba',
		neutral: '#fff8ee',
	},
];

export const DEFAULT_THEME_PRESET = THEME_PRESETS[0];

export function themePresetById(id?: string): ThemePreset {
	return THEME_PRESETS.find((theme) => theme.id === id) || DEFAULT_THEME_PRESET;
}

export function themePresetFromColors(primary?: string, secondary?: string, tertiary?: string, neutral?: string): ThemePreset {
	return (
		THEME_PRESETS.find(
			(theme) =>
				sameColor(theme.primary, primary) &&
				sameColor(theme.secondary, secondary) &&
				sameColor(theme.tertiary, tertiary) &&
				sameColor(theme.neutral, neutral),
		) || DEFAULT_THEME_PRESET
	);
}

function sameColor(first: string, second?: string): boolean {
	return first.toLowerCase() === (second || '').toLowerCase();
}
