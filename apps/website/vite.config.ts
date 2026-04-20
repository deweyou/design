import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const componentsEntry = fileURLToPath(
  new URL('../../packages/react/src/index.ts', import.meta.url),
);
const componentsSourceDir = fileURLToPath(new URL('../../packages/react/src', import.meta.url));
const iconsSourceDir = fileURLToPath(new URL('../../packages/react-icons/src', import.meta.url));
const stylesEntry = fileURLToPath(new URL('../../packages/styles/src/index.ts', import.meta.url));
const stylesCssDir = fileURLToPath(new URL('../../packages/styles/src/css', import.meta.url));

export default defineConfig({
  test: {
    setupFiles: ['src/test-setup.ts'],
  },
  resolve: {
    alias: [
      {
        find: /^@deweyou-design\/react\/(.+)$/,
        replacement: `${componentsSourceDir}/$1/index.tsx`,
      },
      {
        find: /^@deweyou-design\/react$/,
        replacement: componentsEntry,
      },
      {
        find: '@deweyou-design/react-icons',
        replacement: iconsSourceDir,
      },
      {
        find: /^@deweyou-design\/styles\/theme\.css$/,
        replacement: `${stylesCssDir}/theme.css`,
      },
      {
        find: /^@deweyou-design\/styles\/theme-light\.css$/,
        replacement: `${stylesCssDir}/theme-light.css`,
      },
      {
        find: /^@deweyou-design\/styles\/theme-dark\.css$/,
        replacement: `${stylesCssDir}/theme-dark.css`,
      },
      {
        find: /^@deweyou-design\/styles\/reset\.css$/,
        replacement: `${stylesCssDir}/reset.css`,
      },
      {
        find: /^@deweyou-design\/styles\/base\.css$/,
        replacement: `${stylesCssDir}/base.css`,
      },
      {
        find: /^@deweyou-design\/styles$/,
        replacement: stylesEntry,
      },
      {
        find: /^@deweyou-ui\/styles\/theme\.css$/,
        replacement: `${stylesCssDir}/theme.css`,
      },
      {
        find: /^@deweyou-ui\/styles$/,
        replacement: stylesEntry,
      },
    ],
  },
});
