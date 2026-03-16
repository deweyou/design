import { internalPrimitives } from '../primitives';

export const lightTheme = {
  '--ui-color-canvas': internalPrimitives.color.neutralCanvas,
  '--ui-color-surface': internalPrimitives.color.neutralSurface,
  '--ui-color-text': internalPrimitives.color.neutralInk,
  '--ui-color-text-muted': internalPrimitives.color.neutralInkMuted,
  '--ui-color-border': internalPrimitives.color.borderSoft,
  '--ui-color-border-strong': internalPrimitives.color.borderStrong,
  '--ui-color-brand-bg': internalPrimitives.color.brandAmber,
  '--ui-color-brand-bg-hover': internalPrimitives.color.brandAmberHover,
  '--ui-color-brand-bg-active': internalPrimitives.color.brandAmberActive,
  '--ui-color-text-on-brand': internalPrimitives.color.brandText,
  '--ui-color-focus-ring': internalPrimitives.color.focusRing,
  '--ui-color-link': internalPrimitives.color.link,
  '--ui-radius-md': internalPrimitives.radius.md,
  '--ui-shadow-soft': internalPrimitives.shadow.soft,
  '--ui-font-body': internalPrimitives.font.body,
  '--ui-font-display': internalPrimitives.font.display,
  '--ui-font-mono': internalPrimitives.font.mono,
} as const;

export const darkTheme = {
  ...lightTheme,
  '--ui-color-canvas': '#1f1916',
  '--ui-color-surface': '#2b231f',
  '--ui-color-text': '#f6ecdf',
  '--ui-color-text-muted': '#d8c5b3',
  '--ui-color-border': '#614838',
  '--ui-color-border-strong': '#8d6b55',
  '--ui-color-brand-bg': '#e28641',
  '--ui-color-brand-bg-hover': '#ed995c',
  '--ui-color-brand-bg-active': '#c96d29',
  '--ui-color-link': '#ffd4b0',
  '--ui-shadow-soft': '0 18px 40px rgba(0, 0, 0, 0.34)',
} as const;
