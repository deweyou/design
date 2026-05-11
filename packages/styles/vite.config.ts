import { defineConfig } from 'vite-plus';
import { defineConfig as definePackConfig } from 'vite-plus/pack';

const stylesPublicExports = {
  '.': {
    types: './dist/index.d.mts',
    import: './dist/index.mjs',
    default: './dist/index.mjs',
  },
  './color.css': './dist/css/color.css',
  './theme.css': './dist/css/theme.css',
  './theme-with-fonts.css': './dist/css/theme-with-fonts.css',
  './theme-light.css': './dist/css/theme-light.css',
  './theme-dark.css': './dist/css/theme-dark.css',
  './reset.css': './dist/css/reset.css',
  './base.css': './dist/css/base.css',
  './font-subset': {
    types: './dist/font-subset/index.d.mts',
    import: './dist/font-subset/index.mjs',
    default: './dist/font-subset/index.mjs',
  },
  './unplugin-font-subset': {
    types: './dist/unplugin-font-subset/index.d.mts',
    import: './dist/unplugin-font-subset/index.mjs',
    default: './dist/unplugin-font-subset/index.mjs',
  },
  './less/bridge': './dist/less/bridge.less',
  './less/bridge.less': './dist/less/bridge.less',
  './less/mixins': './dist/less/mixins.less',
  './less/mixins.less': './dist/less/mixins.less',
};

const defaultPackConfig = definePackConfig({
  entry: {
    index: './src/index.ts',
    'font-subset/index': './src/font-subset/index.ts',
    'unplugin-font-subset/index': './src/unplugin-font-subset/index.ts',
  },
  exports: {
    customExports: stylesPublicExports,
  },
});

export default defineConfig({
  // Styles keep the default pack output, but still need a follow-up asset copy stage after build.
  pack: defaultPackConfig,
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
