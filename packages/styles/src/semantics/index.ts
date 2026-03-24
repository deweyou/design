import { internalPrimitives, textColorFamilyNames } from '../primitives';

const textColorThemeTokens = textColorFamilyNames.flatMap((familyName) => {
  return [
    {
      name: `textColor${familyName[0]!.toUpperCase()}${familyName.slice(1)}`,
      cssVar: `--ui-text-color-${familyName}`,
      defaultThemeValue: internalPrimitives.color.textPalette[familyName]['800'],
    },
    {
      name: `textBackground${familyName[0]!.toUpperCase()}${familyName.slice(1)}`,
      cssVar: `--ui-text-background-${familyName}`,
      defaultThemeValue: internalPrimitives.color.textPalette[familyName]['100'],
    },
  ];
});

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
  ...textColorThemeTokens,
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
    textColorFamilyNames.flatMap((familyName) => {
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
