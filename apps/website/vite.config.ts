import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const stylesEntry = fileURLToPath(new URL('../../packages/styles/src/index.ts', import.meta.url));
const stylesCssDir = fileURLToPath(new URL('../../packages/styles/src/css', import.meta.url));

export default defineConfig({
  test: {
    setupFiles: ['src/test-setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: /^@deweyou-ui\/styles\/theme\.css$/,
        replacement: `${stylesCssDir}/theme.css`,
      },
      {
        find: /^@deweyou-ui\/styles\/theme-light\.css$/,
        replacement: `${stylesCssDir}/theme-light.css`,
      },
      {
        find: /^@deweyou-ui\/styles\/theme-dark\.css$/,
        replacement: `${stylesCssDir}/theme-dark.css`,
      },
      {
        find: /^@deweyou-ui\/styles\/reset\.css$/,
        replacement: `${stylesCssDir}/reset.css`,
      },
      {
        find: /^@deweyou-ui\/styles\/base\.css$/,
        replacement: `${stylesCssDir}/base.css`,
      },
      {
        find: /^@deweyou-ui\/styles$/,
        replacement: stylesEntry,
      },
    ],
  },
});
