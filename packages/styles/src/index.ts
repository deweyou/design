import { publicThemeTokens } from './semantics';
import { darkTheme, lightTheme } from './themes';

export { internalPrimitives } from './primitives';
export { publicThemeTokens, semanticTokens } from './semantics';
export { darkTheme, lightTheme } from './themes';

export const internalTypographyRoleNames = ['body', 'display', 'mono'] as const;

function serializeTheme(selector: string, tokens: Record<string, string>) {
  const body = Object.entries(tokens)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return `${selector} {\n${body}\n}`;
}

export function createThemeStyleSheets() {
  return {
    light: serializeTheme(':root, [data-theme="light"]', lightTheme),
    dark: serializeTheme('[data-theme="dark"]', darkTheme),
  };
}
