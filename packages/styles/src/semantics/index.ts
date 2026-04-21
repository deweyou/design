import { colorFamilyNames, colorPaletteStepNames, internalPrimitives } from '../primitives';

const paletteThemeTokens = colorFamilyNames.flatMap((familyName) => {
  return colorPaletteStepNames.map((stepName) => {
    return {
      name: `colorPalette${familyName[0]!.toUpperCase()}${familyName.slice(1)}${stepName}`,
      cssVar: `--ui-color-palette-${familyName}-${stepName}`,
      defaultThemeValue: internalPrimitives.color.palette[familyName][stepName],
    };
  });
});

const textColorThemeTokens = colorFamilyNames.flatMap((familyName) => {
  return [
    {
      name: `textColor${familyName[0]!.toUpperCase()}${familyName.slice(1)}`,
      cssVar: `--ui-text-color-${familyName}`,
      defaultThemeValue: internalPrimitives.color.palette[familyName]['800'],
    },
    {
      name: `textBackground${familyName[0]!.toUpperCase()}${familyName.slice(1)}`,
      cssVar: `--ui-text-background-${familyName}`,
      defaultThemeValue: internalPrimitives.color.palette[familyName]['100'],
    },
  ];
});

export const publicThemeTokens = [
  {
    name: 'colorBlack',
    cssVar: '--ui-color-black',
    defaultThemeValue: internalPrimitives.color.black,
  },
  {
    name: 'colorWhite',
    cssVar: '--ui-color-white',
    defaultThemeValue: internalPrimitives.color.white,
  },
  {
    name: 'brandBackground',
    cssVar: '--ui-color-brand-bg',
    defaultThemeValue: internalPrimitives.color.brandBackground,
  },
  {
    name: 'brandBackgroundHover',
    cssVar: '--ui-color-brand-bg-hover',
    defaultThemeValue: internalPrimitives.color.brandBackgroundHover,
  },
  {
    name: 'brandBackgroundActive',
    cssVar: '--ui-color-brand-bg-active',
    defaultThemeValue: internalPrimitives.color.brandBackgroundActive,
  },
  {
    name: 'textOnBrand',
    cssVar: '--ui-color-text-on-brand',
    defaultThemeValue: internalPrimitives.color.textOnBrand,
  },
  {
    name: 'dangerBackground',
    cssVar: '--ui-color-danger-bg',
    defaultThemeValue: internalPrimitives.color.dangerBackground,
  },
  {
    name: 'dangerBackgroundHover',
    cssVar: '--ui-color-danger-bg-hover',
    defaultThemeValue: internalPrimitives.color.dangerBackgroundHover,
  },
  {
    name: 'dangerBackgroundActive',
    cssVar: '--ui-color-danger-bg-active',
    defaultThemeValue: internalPrimitives.color.dangerBackgroundActive,
  },
  {
    name: 'dangerText',
    cssVar: '--ui-color-danger-text',
    defaultThemeValue: internalPrimitives.color.dangerText,
  },
  {
    name: 'textOnDanger',
    cssVar: '--ui-color-text-on-danger',
    defaultThemeValue: internalPrimitives.color.textOnDanger,
  },
  {
    name: 'focusRing',
    cssVar: '--ui-color-focus-ring',
    defaultThemeValue: internalPrimitives.color.focusRing,
  },
  {
    name: 'surfaceRaised',
    cssVar: '--ui-color-surface-raised',
    defaultThemeValue: internalPrimitives.color.warmSurfaceRaised,
  },
  {
    name: 'brandText',
    cssVar: '--ui-color-brand-text',
    defaultThemeValue: internalPrimitives.color.brandText,
  },
  {
    name: 'textDisabled',
    cssVar: '--ui-color-text-disabled',
    defaultThemeValue: internalPrimitives.color.textDisabled,
  },
  {
    name: 'radiusRect',
    cssVar: '--ui-radius-rect',
    defaultThemeValue: internalPrimitives.radius.rect,
  },
  {
    name: 'radiusFloat',
    cssVar: '--ui-radius-float',
    defaultThemeValue: internalPrimitives.radius.float,
  },
  {
    name: 'radiusPill',
    cssVar: '--ui-radius-pill',
    defaultThemeValue: internalPrimitives.radius.pill,
  },
  {
    name: 'textBodySize',
    cssVar: '--ui-text-size-body',
    defaultThemeValue: internalPrimitives.text.bodySize,
  },
  {
    name: 'textBodyLineHeight',
    cssVar: '--ui-text-line-height-body',
    defaultThemeValue: internalPrimitives.text.bodyLineHeight,
  },
  {
    name: 'textCaptionSize',
    cssVar: '--ui-text-size-caption',
    defaultThemeValue: internalPrimitives.text.captionSize,
  },
  {
    name: 'textCaptionLineHeight',
    cssVar: '--ui-text-line-height-caption',
    defaultThemeValue: internalPrimitives.text.captionLineHeight,
  },
  {
    name: 'textHeading1Size',
    cssVar: '--ui-text-size-h1',
    defaultThemeValue: internalPrimitives.text.heading1Size,
  },
  {
    name: 'textHeading1LineHeight',
    cssVar: '--ui-text-line-height-h1',
    defaultThemeValue: internalPrimitives.text.heading1LineHeight,
  },
  {
    name: 'textHeading2Size',
    cssVar: '--ui-text-size-h2',
    defaultThemeValue: internalPrimitives.text.heading2Size,
  },
  {
    name: 'textHeading2LineHeight',
    cssVar: '--ui-text-line-height-h2',
    defaultThemeValue: internalPrimitives.text.heading2LineHeight,
  },
  {
    name: 'textHeading3Size',
    cssVar: '--ui-text-size-h3',
    defaultThemeValue: internalPrimitives.text.heading3Size,
  },
  {
    name: 'textHeading3LineHeight',
    cssVar: '--ui-text-line-height-h3',
    defaultThemeValue: internalPrimitives.text.heading3LineHeight,
  },
  {
    name: 'textHeading4Size',
    cssVar: '--ui-text-size-h4',
    defaultThemeValue: internalPrimitives.text.heading4Size,
  },
  {
    name: 'textHeading4LineHeight',
    cssVar: '--ui-text-line-height-h4',
    defaultThemeValue: internalPrimitives.text.heading4LineHeight,
  },
  {
    name: 'textHeading5Size',
    cssVar: '--ui-text-size-h5',
    defaultThemeValue: internalPrimitives.text.heading5Size,
  },
  {
    name: 'textHeading5LineHeight',
    cssVar: '--ui-text-line-height-h5',
    defaultThemeValue: internalPrimitives.text.heading5LineHeight,
  },
  ...paletteThemeTokens,
  ...textColorThemeTokens,
] as const;

export const semanticTokens = {
  black: '--ui-color-black',
  white: '--ui-color-white',
  surface: '--ui-color-surface',
  surfaceRaised: '--ui-color-surface-raised',
  canvas: '--ui-color-canvas',
  text: '--ui-color-text',
  textMuted: '--ui-color-text-muted',
  textDisabled: '--ui-color-text-disabled',
  border: '--ui-color-border',
  borderStrong: '--ui-color-border-strong',
  brandBg: '--ui-color-brand-bg',
  brandBgHover: '--ui-color-brand-bg-hover',
  brandBgActive: '--ui-color-brand-bg-active',
  brandText: '--ui-color-brand-text',
  textOnBrand: '--ui-color-text-on-brand',
  dangerBg: '--ui-color-danger-bg',
  dangerBgHover: '--ui-color-danger-bg-hover',
  dangerBgActive: '--ui-color-danger-bg-active',
  dangerText: '--ui-color-danger-text',
  textOnDanger: '--ui-color-text-on-danger',
  warningBg: '--ui-color-warning-bg',
  warningBgHover: '--ui-color-warning-bg-hover',
  warningBgActive: '--ui-color-warning-bg-active',
  warningText: '--ui-color-warning-text',
  textOnWarning: '--ui-color-text-on-warning',
  focusRing: '--ui-color-focus-ring',
  radiusRect: '--ui-radius-rect',
  radiusFloat: '--ui-radius-float',
  radiusPill: '--ui-radius-pill',
  shadowSoft: '--ui-shadow-soft',
  shadowSm: '--ui-shadow-sm',
  shadowMd: '--ui-shadow-md',
  shadowLg: '--ui-shadow-lg',
  spaceXs: '--ui-space-xs',
  spaceSm: '--ui-space-sm',
  spaceMd: '--ui-space-md',
  spaceLg: '--ui-space-lg',
  spaceXl: '--ui-space-xl',
  zTooltip: '--ui-z-tooltip',
  zPopover: '--ui-z-popover',
  zDialog: '--ui-z-dialog',
  zToast: '--ui-z-toast',
  textBodySize: '--ui-text-size-body',
  textBodyLineHeight: '--ui-text-line-height-body',
  textCaptionSize: '--ui-text-size-caption',
  textCaptionLineHeight: '--ui-text-line-height-caption',
  textHeading1Size: '--ui-text-size-h1',
  textHeading1LineHeight: '--ui-text-line-height-h1',
  textHeading2Size: '--ui-text-size-h2',
  textHeading2LineHeight: '--ui-text-line-height-h2',
  textHeading3Size: '--ui-text-size-h3',
  textHeading3LineHeight: '--ui-text-line-height-h3',
  textHeading4Size: '--ui-text-size-h4',
  textHeading4LineHeight: '--ui-text-line-height-h4',
  textHeading5Size: '--ui-text-size-h5',
  textHeading5LineHeight: '--ui-text-line-height-h5',
  ...Object.fromEntries(
    colorFamilyNames.flatMap((familyName) => {
      return colorPaletteStepNames.map((stepName) => {
        return [
          `colorPalette${familyName[0]!.toUpperCase()}${familyName.slice(1)}${stepName}`,
          `--ui-color-palette-${familyName}-${stepName}`,
        ];
      });
    }),
  ),
  ...Object.fromEntries(
    colorFamilyNames.flatMap((familyName) => {
      return [
        [
          `textColor${familyName[0]!.toUpperCase()}${familyName.slice(1)}`,
          `--ui-text-color-${familyName}`,
        ],
        [
          `textBackground${familyName[0]!.toUpperCase()}${familyName.slice(1)}`,
          `--ui-text-background-${familyName}`,
        ],
      ];
    }),
  ),
} as const;
