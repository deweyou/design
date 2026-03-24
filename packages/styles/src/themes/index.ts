import { colorFamilyNames, colorPaletteStepNames, internalPrimitives } from '../primitives';

const createPaletteCssVar = (familyName: string, stepName: string) => {
  return `var(--ui-color-palette-${familyName}-${stepName})`;
};

const createMonochromeCssVar = (tokenName: 'black' | 'white') => {
  return `var(--ui-color-${tokenName})`;
};

const createPaletteThemeSurface = () => {
  return Object.fromEntries(
    colorFamilyNames.flatMap((familyName) => {
      return colorPaletteStepNames.map((stepName) => {
        return [
          `--ui-color-palette-${familyName}-${stepName}`,
          internalPrimitives.color.palette[familyName][stepName],
        ];
      });
    }),
  ) as Record<`--ui-color-palette-${string}-${string}`, string>;
};

const createTextColorThemeSurface = (textShade: '200' | '800', backgroundShade: '100' | '900') => {
  return Object.fromEntries(
    colorFamilyNames.flatMap((familyName) => {
      return [
        [`--ui-text-color-${familyName}`, createPaletteCssVar(familyName, textShade)],
        [`--ui-text-background-${familyName}`, createPaletteCssVar(familyName, backgroundShade)],
      ];
    }),
  ) as Record<`--ui-text-${'color' | 'background'}-${string}`, string>;
};

const paletteThemeSurface = createPaletteThemeSurface();
const lightTextColorThemeSurface = createTextColorThemeSurface('800', '100');
const darkTextColorThemeSurface = createTextColorThemeSurface('200', '900');

export const sharedColorTheme = {
  '--ui-color-black': internalPrimitives.color.black,
  '--ui-color-white': internalPrimitives.color.white,
  '--ui-color-text-on-brand': createMonochromeCssVar('white'),
  '--ui-color-text-on-danger': createMonochromeCssVar('white'),
  ...paletteThemeSurface,
} as const;

export const lightTheme = {
  '--ui-color-canvas': createMonochromeCssVar('white'),
  '--ui-color-surface': createPaletteCssVar('neutral', '50'),
  '--ui-color-text': createPaletteCssVar('neutral', '950'),
  '--ui-color-text-muted': createPaletteCssVar('slate', '700'),
  '--ui-color-border': createPaletteCssVar('slate', '300'),
  '--ui-color-border-strong': createPaletteCssVar('slate', '400'),
  '--ui-color-brand-bg': createPaletteCssVar('emerald', '700'),
  '--ui-color-brand-bg-hover': createPaletteCssVar('emerald', '800'),
  '--ui-color-brand-bg-active': createPaletteCssVar('emerald', '900'),
  '--ui-color-danger-bg': createPaletteCssVar('red', '700'),
  '--ui-color-danger-bg-hover': createPaletteCssVar('red', '800'),
  '--ui-color-danger-bg-active': createPaletteCssVar('red', '900'),
  '--ui-color-danger-text': createPaletteCssVar('red', '800'),
  '--ui-color-focus-ring': createPaletteCssVar('emerald', '500'),
  '--ui-color-link': createPaletteCssVar('emerald', '700'),
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
  '--ui-color-canvas': createMonochromeCssVar('black'),
  '--ui-color-surface': createPaletteCssVar('neutral', '950'),
  '--ui-color-text': createPaletteCssVar('neutral', '100'),
  '--ui-color-text-muted': createPaletteCssVar('slate', '400'),
  '--ui-color-border': createPaletteCssVar('slate', '800'),
  '--ui-color-border-strong': createPaletteCssVar('slate', '700'),
  '--ui-color-brand-bg': createPaletteCssVar('emerald', '500'),
  '--ui-color-brand-bg-hover': createPaletteCssVar('emerald', '400'),
  '--ui-color-brand-bg-active': createPaletteCssVar('emerald', '600'),
  '--ui-color-danger-bg': createPaletteCssVar('red', '500'),
  '--ui-color-danger-bg-hover': createPaletteCssVar('red', '400'),
  '--ui-color-danger-bg-active': createPaletteCssVar('red', '600'),
  '--ui-color-danger-text': createPaletteCssVar('red', '200'),
  '--ui-color-focus-ring': createPaletteCssVar('emerald', '300'),
  '--ui-color-link': createPaletteCssVar('emerald', '300'),
  '--ui-shadow-soft': '0 18px 40px rgba(0, 0, 0, 0.34)',
  ...darkTextColorThemeSurface,
} as const;
