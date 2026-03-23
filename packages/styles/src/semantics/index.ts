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
    name: 'dangerBackground',
    cssVar: '--ui-color-danger-bg',
    defaultThemeValue: internalPrimitives.color.dangerBg,
  },
  {
    name: 'dangerBackgroundHover',
    cssVar: '--ui-color-danger-bg-hover',
    defaultThemeValue: internalPrimitives.color.dangerBgHover,
  },
  {
    name: 'dangerBackgroundActive',
    cssVar: '--ui-color-danger-bg-active',
    defaultThemeValue: internalPrimitives.color.dangerBgActive,
  },
  {
    name: 'dangerText',
    cssVar: '--ui-color-danger-text',
    defaultThemeValue: internalPrimitives.color.dangerText,
  },
  {
    name: 'textOnDanger',
    cssVar: '--ui-color-text-on-danger',
    defaultThemeValue: internalPrimitives.color.dangerTextOnBg,
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
  dangerBg: '--ui-color-danger-bg',
  dangerText: '--ui-color-danger-text',
  radiusMd: '--ui-radius-md',
  shadowSoft: '--ui-shadow-soft',
} as const;
