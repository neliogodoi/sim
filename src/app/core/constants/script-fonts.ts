export interface ScriptFontOption {
  label: string;
  value: string;
  cssFamily: string;
}

export const DEFAULT_SCRIPT_FONT = 'Bacalisties';

export const SCRIPT_FONT_OPTIONS: ScriptFontOption[] = [
  { label: 'Bacalisties', value: 'Bacalisties', cssFamily: "'Bacalisties'" },
  { label: 'Brittany Signature', value: 'Brittany Signature', cssFamily: "'Brittany Signature'" },
  { label: 'Great Vibes', value: 'Great Vibes', cssFamily: "'Great Vibes'" },
  { label: 'Alex Brush', value: 'Alex Brush', cssFamily: "'Alex Brush'" },
  { label: 'Allura', value: 'Allura', cssFamily: "'Allura'" },
  { label: 'Dancing Script', value: 'Dancing Script', cssFamily: "'Dancing Script'" },
  { label: 'Tangerine', value: 'Tangerine', cssFamily: "'Tangerine'" },
  { label: 'Cormorant SC', value: 'Cormorant SC', cssFamily: "'Cormorant SC'" },
  { label: 'Playfair Display', value: 'Playfair Display', cssFamily: "'Playfair Display'" },
  { label: 'Montserrat', value: 'Montserrat', cssFamily: "'Montserrat'" },
];

export function scriptFontCssFamily(value?: string): string {
  return SCRIPT_FONT_OPTIONS.find((option) => option.value === value)?.cssFamily || `'${DEFAULT_SCRIPT_FONT}'`;
}

export function normalizeScriptFont(value?: string): string {
  return value && SCRIPT_FONT_OPTIONS.some((option) => option.value === value) ? value : DEFAULT_SCRIPT_FONT;
}
