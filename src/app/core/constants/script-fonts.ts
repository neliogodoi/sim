export interface ScriptFontOption {
  label: string;
  value: string;
  cssFamily: string;
  assetPath?: string;
}

export const DEFAULT_SCRIPT_FONT = 'Bacalisties';

export const SCRIPT_FONT_OPTIONS: ScriptFontOption[] = [
  { label: 'Bacalisties', value: 'Bacalisties', cssFamily: "'Bacalisties'", assetPath: '/fonts/Bacalisties.ttf' },
  { label: 'Brittany Signature', value: 'Brittany Signature', cssFamily: "'Brittany Signature'", assetPath: '/fonts/BrittanySignature.ttf' },
  { label: 'Great Vibes', value: 'Great Vibes', cssFamily: "'Great Vibes'", assetPath: '/fonts/great-vibes.ttf' },
  { label: 'Alex Brush', value: 'Alex Brush', cssFamily: "'Alex Brush'", assetPath: '/fonts/AlexBrush-Regular.ttf' },
  { label: 'Allura', value: 'Allura', cssFamily: "'Allura'", assetPath: '/fonts/Allura-Regular.ttf' },
  { label: 'Dancing Script', value: 'Dancing Script', cssFamily: "'Dancing Script'", assetPath: '/fonts/Dancing%20Script.ttf' },
  { label: 'Tangerine', value: 'Tangerine', cssFamily: "'Tangerine'", assetPath: '/fonts/Tangerine_Bold.ttf' },
  { label: 'Cormorant SC', value: 'Cormorant SC', cssFamily: "'Cormorant SC'", assetPath: '/fonts/CormorantSC-Regular.otf' },
  { label: 'Playfair Display', value: 'Playfair Display', cssFamily: "'Playfair Display'", assetPath: '/fonts/PlayfairDisplay-Regular.ttf' },
  { label: 'Montserrat', value: 'Montserrat', cssFamily: "'Montserrat'", assetPath: '/fonts/Montserrat-Regular.ttf' },
];

export function scriptFontCssFamily(value?: string): string {
  return SCRIPT_FONT_OPTIONS.find((option) => option.value === value)?.cssFamily || `'${DEFAULT_SCRIPT_FONT}'`;
}

export function normalizeScriptFont(value?: string): string {
  return value && SCRIPT_FONT_OPTIONS.some((option) => option.value === value) ? value : DEFAULT_SCRIPT_FONT;
}

export function scriptFontAssetPath(value?: string): string | undefined {
  return SCRIPT_FONT_OPTIONS.find((option) => option.value === value)?.assetPath;
}
