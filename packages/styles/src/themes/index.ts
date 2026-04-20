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
  '--ui-color-canvas': internalPrimitives.color.warmCanvas,
  '--ui-color-surface': internalPrimitives.color.warmSurface,
  '--ui-color-surface-raised': internalPrimitives.color.warmSurfaceRaised,
  '--ui-color-text': createPaletteCssVar('stone', '950'),
  '--ui-color-text-muted': createPaletteCssVar('stone', '500'),
  '--ui-color-text-disabled': createPaletteCssVar('stone', '400'),
  '--ui-color-border': createPaletteCssVar('stone', '200'),
  '--ui-color-border-strong': createPaletteCssVar('stone', '300'),
  '--ui-color-brand-bg': createPaletteCssVar('emerald', '900'),
  '--ui-color-brand-bg-hover': createPaletteCssVar('emerald', '950'),
  '--ui-color-brand-bg-active': createPaletteCssVar('emerald', '950'),
  '--ui-color-brand-text': createPaletteCssVar('emerald', '800'),
  '--ui-color-text-on-brand': createMonochromeCssVar('white'),
  '--ui-color-danger-bg': createPaletteCssVar('red', '700'),
  '--ui-color-danger-bg-hover': createPaletteCssVar('red', '800'),
  '--ui-color-danger-bg-active': createPaletteCssVar('red', '900'),
  '--ui-color-danger-text': createPaletteCssVar('red', '700'),
  '--ui-color-text-on-danger': createMonochromeCssVar('white'),
  '--ui-color-focus-ring': createPaletteCssVar('emerald', '600'),
  '--ui-radius-rect': internalPrimitives.radius.rect,
  '--ui-radius-float': internalPrimitives.radius.float,
  '--ui-radius-pill': internalPrimitives.radius.pill,
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
  '--ui-space-xs': internalPrimitives.spacing.xs,
  '--ui-space-sm': internalPrimitives.spacing.sm,
  '--ui-space-md': internalPrimitives.spacing.md,
  '--ui-space-lg': internalPrimitives.spacing.lg,
  '--ui-space-xl': internalPrimitives.spacing.xl,
  '--ui-z-tooltip': internalPrimitives.zIndex.tooltip,
  '--ui-z-popover': internalPrimitives.zIndex.popover,
  '--ui-z-dialog': internalPrimitives.zIndex.dialog,
  '--ui-z-toast': internalPrimitives.zIndex.toast,
  '--ui-shadow-sm': internalPrimitives.shadow.sm,
  '--ui-shadow-md': internalPrimitives.shadow.md,
  '--ui-shadow-lg': internalPrimitives.shadow.lg,
  ...lightTextColorThemeSurface,
} as const;

export const darkTheme = {
  '--ui-color-canvas': createPaletteCssVar('stone', '950'),
  '--ui-color-surface': createPaletteCssVar('stone', '900'),
  '--ui-color-surface-raised': createPaletteCssVar('stone', '800'),
  '--ui-color-text': createPaletteCssVar('stone', '50'),
  '--ui-color-text-muted': createPaletteCssVar('stone', '400'),
  '--ui-color-text-disabled': createPaletteCssVar('stone', '600'),
  '--ui-color-border': createPaletteCssVar('stone', '700'),
  '--ui-color-border-strong': createPaletteCssVar('stone', '600'),
  '--ui-color-brand-bg': createPaletteCssVar('emerald', '600'),
  '--ui-color-brand-bg-hover': createPaletteCssVar('emerald', '500'),
  '--ui-color-brand-bg-active': createPaletteCssVar('emerald', '400'),
  '--ui-color-brand-text': createPaletteCssVar('emerald', '400'),
  '--ui-color-text-on-brand': createMonochromeCssVar('white'),
  '--ui-color-danger-bg': createPaletteCssVar('red', '500'),
  '--ui-color-danger-bg-hover': createPaletteCssVar('red', '400'),
  '--ui-color-danger-bg-active': createPaletteCssVar('red', '300'),
  '--ui-color-danger-text': createPaletteCssVar('red', '400'),
  '--ui-color-text-on-danger': createMonochromeCssVar('white'),
  '--ui-color-focus-ring': createPaletteCssVar('emerald', '400'),
  '--ui-radius-rect': internalPrimitives.radius.rect,
  '--ui-radius-float': internalPrimitives.radius.float,
  '--ui-radius-pill': internalPrimitives.radius.pill,
  '--ui-shadow-soft': internalPrimitives.shadow.softDark,
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
  '--ui-shadow-sm': internalPrimitives.shadow.smDark,
  '--ui-shadow-md': internalPrimitives.shadow.mdDark,
  '--ui-shadow-lg': internalPrimitives.shadow.lgDark,
  ...darkTextColorThemeSurface,
} as const;
