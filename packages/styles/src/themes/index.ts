import { internalPrimitives, textColorFamilyNames } from '../primitives';

const createTextColorThemeSurface = (textShade: '200' | '800', backgroundShade: '100' | '900') => {
  return Object.fromEntries(
    textColorFamilyNames.flatMap((familyName) => {
      return [
        [
          `--ui-text-color-${familyName}`,
          internalPrimitives.color.textPalette[familyName][textShade],
        ],
        [
          `--ui-text-background-${familyName}`,
          internalPrimitives.color.textPalette[familyName][backgroundShade],
        ],
      ];
    }),
  ) as Record<`--ui-text-${'color' | 'background'}-${string}`, string>;
};

const lightTextColorThemeSurface = createTextColorThemeSurface('800', '100');
const darkTextColorThemeSurface = createTextColorThemeSurface('200', '900');

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
  '--ui-color-danger-bg': internalPrimitives.color.dangerBg,
  '--ui-color-danger-bg-hover': internalPrimitives.color.dangerBgHover,
  '--ui-color-danger-bg-active': internalPrimitives.color.dangerBgActive,
  '--ui-color-danger-text': internalPrimitives.color.dangerText,
  '--ui-color-text-on-danger': internalPrimitives.color.dangerTextOnBg,
  '--ui-color-focus-ring': internalPrimitives.color.focusRing,
  '--ui-color-link': internalPrimitives.color.link,
  '--ui-radius-md': internalPrimitives.radius.md,
  '--ui-shadow-soft': internalPrimitives.shadow.soft,
  '--ui-font-body': internalPrimitives.font.body,
  '--ui-font-display': internalPrimitives.font.display,
  '--ui-font-mono': internalPrimitives.font.mono,
  '--ui-font-weight-body': internalPrimitives.font.weights.body,
  '--ui-font-weight-emphasis': internalPrimitives.font.weights.emphasis,
  '--ui-font-weight-title': internalPrimitives.font.weights.title,
  '--ui-font-weight-strong': internalPrimitives.font.weights.strong,
  '--ui-text-size-body': internalPrimitives.text.bodySize,
  '--ui-text-line-height-body': internalPrimitives.text.bodyLineHeight,
  '--ui-text-size-caption': internalPrimitives.text.captionSize,
  '--ui-text-line-height-caption': internalPrimitives.text.captionLineHeight,
  '--ui-text-size-h1': internalPrimitives.text.heading1Size,
  '--ui-text-line-height-h1': internalPrimitives.text.heading1LineHeight,
  '--ui-text-size-h2': internalPrimitives.text.heading2Size,
  '--ui-text-line-height-h2': internalPrimitives.text.heading2LineHeight,
  '--ui-text-size-h3': internalPrimitives.text.heading3Size,
  '--ui-text-line-height-h3': internalPrimitives.text.heading3LineHeight,
  '--ui-text-size-h4': internalPrimitives.text.heading4Size,
  '--ui-text-line-height-h4': internalPrimitives.text.heading4LineHeight,
  '--ui-text-size-h5': internalPrimitives.text.heading5Size,
  '--ui-text-line-height-h5': internalPrimitives.text.heading5LineHeight,
  ...lightTextColorThemeSurface,
} as const;

export const darkTheme = {
  ...lightTheme,
  '--ui-color-canvas': '#000000',
  '--ui-color-surface': '#0f1311',
  '--ui-color-text': '#edf3ef',
  '--ui-color-text-muted': '#b8c6be',
  '--ui-color-border': '#38443f',
  '--ui-color-border-strong': '#5a6c64',
  '--ui-color-brand-bg': '#729b89',
  '--ui-color-brand-bg-hover': '#85ad9c',
  '--ui-color-brand-bg-active': '#5e8574',
  '--ui-color-text-on-brand': '#f7fbf8',
  '--ui-color-danger-bg': '#c16c65',
  '--ui-color-danger-bg-hover': '#d3817a',
  '--ui-color-danger-bg-active': '#ab5851',
  '--ui-color-danger-text': '#ffb8b1',
  '--ui-color-text-on-danger': '#fff7f6',
  '--ui-color-focus-ring': '#9ec8b4',
  '--ui-color-link': '#b6e2cc',
  '--ui-shadow-soft': '0 18px 40px rgba(0, 0, 0, 0.34)',
  ...darkTextColorThemeSurface,
} as const;
