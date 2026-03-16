import { internalPrimitives } from '../primitives';

export const publicThemeTokens = [
  {
    name: 'brandBackground',
    cssVar: '--ui-color-brand-bg',
    defaultThemeValue: internalPrimitives.color.brandAmber,
  },
  {
    name: 'brandBackgroundHover',
    cssVar: '--ui-color-brand-bg-hover',
    defaultThemeValue: internalPrimitives.color.brandAmberHover,
  },
  {
    name: 'brandBackgroundActive',
    cssVar: '--ui-color-brand-bg-active',
    defaultThemeValue: internalPrimitives.color.brandAmberActive,
  },
  {
    name: 'textOnBrand',
    cssVar: '--ui-color-text-on-brand',
    defaultThemeValue: internalPrimitives.color.brandText,
  },
  {
    name: 'focusRing',
    cssVar: '--ui-color-focus-ring',
    defaultThemeValue: internalPrimitives.color.focusRing,
  },
  { name: 'link', cssVar: '--ui-color-link', defaultThemeValue: internalPrimitives.color.link },
] as const;

export const semanticTokens = {
  surface: '--ui-color-surface',
  canvas: '--ui-color-canvas',
  text: '--ui-color-text',
  textMuted: '--ui-color-text-muted',
  border: '--ui-color-border',
  borderStrong: '--ui-color-border-strong',
  radiusMd: '--ui-radius-md',
  shadowSoft: '--ui-shadow-soft',
} as const;
