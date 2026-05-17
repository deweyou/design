export type StyleEntrypoint = {
  description: string;
  importPath: string;
  packageName: '@deweyou-design/styles';
  usage: 'app-root' | 'theme' | 'palette' | 'reset' | 'base' | 'authoring' | 'build-plugin';
};

export const styleEntrypoints: StyleEntrypoint[] = [
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/theme.css',
    usage: 'app-root',
    description: 'Default consumer entry: reset, base, theme layers, and fallback fonts.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/theme-with-fonts.css',
    usage: 'theme',
    description: 'Full Source Han Sans SC and Serif CN webfont entry for previews.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/theme-light.css',
    usage: 'theme',
    description: 'Light theme token output only.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/theme-dark.css',
    usage: 'theme',
    description: 'Dark theme token output only.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/color.css',
    usage: 'palette',
    description: 'Raw color palette tokens that are theme invariant.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/reset.css',
    usage: 'reset',
    description: 'Reset layer only.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/base.css',
    usage: 'base',
    description: 'Base typography and element defaults.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/less/bridge',
    usage: 'authoring',
    description: 'Less variable bridge for component authors.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/less/mixins',
    usage: 'authoring',
    description: 'Less authoring mixins for component styles.',
  },
  {
    packageName: '@deweyou-design/styles',
    importPath: '@deweyou-design/styles/unplugin-font-subset',
    usage: 'build-plugin',
    description: 'Vite/unplugin font subset generator for Source Han typography.',
  },
];

export const colorFamilies = [
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

export const semanticThemeTokens = [
  '--ui-color-brand-bg',
  '--ui-color-brand-bg-hover',
  '--ui-color-brand-bg-active',
  '--ui-color-text-on-brand',
  '--ui-color-danger-bg',
  '--ui-color-danger-bg-hover',
  '--ui-color-danger-bg-active',
  '--ui-color-danger-text',
  '--ui-color-text-on-danger',
  '--ui-color-focus-ring',
  '--ui-color-surface-raised',
  '--ui-color-brand-text',
  '--ui-font-body',
  '--ui-font-control',
  '--ui-font-content',
  '--ui-font-display',
  '--ui-font-mono',
] as const;
