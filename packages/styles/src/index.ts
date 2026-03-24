import { colorFamilyNames, colorPaletteStepNames } from './primitives';
import { publicThemeTokens } from './semantics';
import { darkTheme, lightTheme, sharedColorTheme } from './themes';

export {
  baseMonochrome,
  colorFamilyNames,
  colorPalette,
  colorPaletteStepNames,
  type ColorFamilyName,
  type ColorPaletteStepName,
  internalPrimitives,
  textColorFamilyNames,
  textPaletteStepNames,
  type TextColorFamilyName,
  type TextPaletteStepName,
} from './primitives';
export { publicThemeTokens, semanticTokens } from './semantics';
export { darkTheme, lightTheme, sharedColorTheme } from './themes';

export const internalTypographyRoleNames = ['body', 'display', 'mono'] as const;
export const internalColorFamilyNames = colorFamilyNames;
export const internalColorPaletteStepNames = colorPaletteStepNames;
export const internalTextPaletteFamilyNames = colorFamilyNames;
export const internalTextPaletteStepNames = colorPaletteStepNames;

function serializeTheme(selector: string, tokens: Record<string, string>) {
  const body = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return `${selector} {\n${body}\n}`;
}

export function createThemeStyleSheets() {
  return {
    color: serializeTheme(':root', sharedColorTheme),
    light: serializeTheme(':root, [data-theme="light"]', lightTheme),
    dark: serializeTheme('[data-theme="dark"]', darkTheme),
  };
}
