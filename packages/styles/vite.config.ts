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
  './theme-light.css': './dist/css/theme-light.css',
  './theme-dark.css': './dist/css/theme-dark.css',
  './reset.css': './dist/css/reset.css',
  './base.css': './dist/css/base.css',
  './less/bridge.less': './dist/less/bridge.less',
  './less/mixins.less': './dist/less/mixins.less',
};

const defaultPackConfig = definePackConfig({
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
