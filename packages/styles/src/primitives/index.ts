export const colorPaletteStepNames = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const;

export type ColorPaletteStepName = (typeof colorPaletteStepNames)[number];

export const colorFamilyNames = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive',
] as const;

export type ColorFamilyName = (typeof colorFamilyNames)[number];

export const textPaletteStepNames = colorPaletteStepNames;
export type TextPaletteStepName = ColorPaletteStepName;

export const textColorFamilyNames = colorFamilyNames;
export type TextColorFamilyName = ColorFamilyName;

export const baseMonochrome = {
  black: '#000000',
  white: '#ffffff',
} as const;

type PaletteFamilyDefinition = {
  hue: number;
  saturation: number;
};

const colorPaletteFamilyDefinitions = {
  red: { hue: 8, saturation: 82 },
  orange: { hue: 24, saturation: 86 },
  amber: { hue: 40, saturation: 88 },
  yellow: { hue: 54, saturation: 92 },
  lime: { hue: 82, saturation: 72 },
  green: { hue: 138, saturation: 66 },
  emerald: { hue: 154, saturation: 62 },
  teal: { hue: 172, saturation: 60 },
  cyan: { hue: 190, saturation: 68 },
  sky: { hue: 204, saturation: 76 },
  blue: { hue: 220, saturation: 78 },
  indigo: { hue: 242, saturation: 66 },
  violet: { hue: 264, saturation: 72 },
  purple: { hue: 280, saturation: 72 },
  fuchsia: { hue: 304, saturation: 76 },
  pink: { hue: 330, saturation: 78 },
  rose: { hue: 350, saturation: 82 },
  slate: { hue: 218, saturation: 18 },
  gray: { hue: 220, saturation: 10 },
  zinc: { hue: 240, saturation: 6 },
  neutral: { hue: 0, saturation: 0 },
  stone: { hue: 28, saturation: 8 },
  taupe: { hue: 24, saturation: 14 },
  mauve: { hue: 284, saturation: 14 },
  mist: { hue: 204, saturation: 12 },
  olive: { hue: 72, saturation: 14 },
} as const satisfies Record<ColorFamilyName, PaletteFamilyDefinition>;

const colorPaletteStepConfig = [
  ['50', { lightness: 98, saturationMultiplier: 0.18 }],
  ['100', { lightness: 95, saturationMultiplier: 0.28 }],
  ['200', { lightness: 89, saturationMultiplier: 0.42 }],
  ['300', { lightness: 82, saturationMultiplier: 0.58 }],
  ['400', { lightness: 73, saturationMultiplier: 0.74 }],
  ['500', { lightness: 64, saturationMultiplier: 1 }],
  ['600', { lightness: 55, saturationMultiplier: 0.94 }],
  ['700', { lightness: 45, saturationMultiplier: 0.88 }],
  ['800', { lightness: 36, saturationMultiplier: 0.74 }],
  ['900', { lightness: 27, saturationMultiplier: 0.6 }],
  ['950', { lightness: 18, saturationMultiplier: 0.46 }],
] as const satisfies ReadonlyArray<
  readonly [ColorPaletteStepName, { lightness: number; saturationMultiplier: number }]
>;

const formatHsl = (hue: number, saturation: number, lightness: number) => {
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
};

const createPaletteScale = ({ hue, saturation }: PaletteFamilyDefinition) => {
  return Object.fromEntries(
    colorPaletteStepConfig.map(([stepName, stepConfig]) => {
      return [
        stepName,
        formatHsl(
          hue,
          Number((saturation * stepConfig.saturationMultiplier).toFixed(2)),
          stepConfig.lightness,
        ),
      ];
    }),
  ) as Record<ColorPaletteStepName, string>;
};

export const colorPalette = Object.fromEntries(
  colorFamilyNames.map((familyName) => {
    return [familyName, createPaletteScale(colorPaletteFamilyDefinitions[familyName])];
  }),
) as Record<ColorFamilyName, Record<ColorPaletteStepName, string>>;

export const internalPrimitives = {
  color: {
    black: baseMonochrome.black,
    white: baseMonochrome.white,
    // 暖白三档（自定义值，不走色板算法）
    warmCanvas: '#fefcf8',
    warmSurface: '#fffefb',
    warmSurfaceRaised: '#ffffff',
    // 文字
    text: colorPalette.stone['950'],
    textMuted: colorPalette.stone['500'],
    textDisabled: colorPalette.stone['400'],
    textOnBrand: baseMonochrome.white,
    textOnDanger: baseMonochrome.white,
    // 边框
    border: colorPalette.stone['200'],
    borderStrong: colorPalette.stone['300'],
    // 品牌（emerald 下沉）
    brandBackground: colorPalette.emerald['900'],
    brandBackgroundHover: colorPalette.emerald['950'],
    brandBackgroundActive: colorPalette.emerald['950'],
    brandText: colorPalette.emerald['800'],
    // 危险
    dangerBackground: colorPalette.red['700'],
    dangerBackgroundHover: colorPalette.red['800'],
    dangerBackgroundActive: colorPalette.red['900'],
    dangerText: colorPalette.red['700'],
    // 焦点
    focusRing: colorPalette.emerald['600'],
    // 调色板引用
    palette: colorPalette,
    textPalette: colorPalette,
  },
  radius: {
    rect: '0',
    float: '4px',
    pill: '999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
  },
  shadow: {
    soft: '0 18px 40px rgba(24, 33, 29, 0.12)',
    softDark: '0 18px 40px rgba(0, 0, 0, 0.34)',
    sm: '0 2px 8px rgba(24, 33, 29, 0.06)',
    smDark: '0 2px 8px rgba(0, 0, 0, 0.2)',
    md: '0 8px 24px rgba(24, 33, 29, 0.1)',
    mdDark: '0 8px 24px rgba(0, 0, 0, 0.28)',
    lg: '0 18px 40px rgba(24, 33, 29, 0.12)',
    lgDark: '0 18px 40px rgba(0, 0, 0, 0.34)',
  },
  font: {
    body: '"Source Han Serif CN Web", "Songti SC", "STSong", "SimSun", "NSimSun", serif',
    display: '"Source Han Serif CN Web", "Songti SC", "STSong", "SimSun", "NSimSun", serif',
    mono: '"IBM Plex Mono", "SFMono-Regular", monospace',
    roles: {
      body: {
        defaultWeightTier: 'body',
        usageScope: 'body text, buttons, forms, and data cells',
      },
      display: {
        defaultWeightTier: 'title',
        usageScope: 'headings and stronger content hierarchy',
      },
      mono: {
        defaultWeightTier: 'body',
        usageScope: 'code, fixed-width identifiers, and explicit exceptions',
      },
    },
    fallbacks: {
      macos: ['Songti SC', 'STSong'],
      windows: ['SimSun', 'NSimSun'],
    },
    weights: {
      body: '400',
      emphasis: '500',
      title: '600',
      strong: '700',
    },
  },
  text: {
    bodySize: '1rem',
    bodyLineHeight: '1.6',
    captionSize: '0.875rem',
    captionLineHeight: '1.45',
    heading1Size: 'clamp(2.8rem, 5vw, 4.6rem)',
    heading1LineHeight: '1.02',
    heading2Size: '2.3rem',
    heading2LineHeight: '1.08',
    heading3Size: '1.85rem',
    heading3LineHeight: '1.14',
    heading4Size: '1.45rem',
    heading4LineHeight: '1.22',
    heading5Size: '1.15rem',
    heading5LineHeight: '1.32',
  },
  zIndex: {
    tooltip: '1000',
    popover: '1100',
    dialog: '1200',
    toast: '1300',
  },
} as const;
