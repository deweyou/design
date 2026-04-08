import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const componentsEntry = fileURLToPath(
  new URL('../../../packages/react/src/index.ts', import.meta.url),
);
const componentsSourceDir = fileURLToPath(new URL('../../../packages/react/src', import.meta.url));
const iconsSourceDir = fileURLToPath(new URL('../../../packages/react-icons/src', import.meta.url));
const iconExportsDir = fileURLToPath(
  new URL('../../../packages/react-icons/src/exports', import.meta.url),
);
const stylesEntry = fileURLToPath(
  new URL('../../../packages/styles/src/index.ts', import.meta.url),
);
const stylesCssDir = fileURLToPath(new URL('../../../packages/styles/src/css', import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    defaultName: 'Overview',
  },
  async viteFinal(config) {
    const aliases = Array.isArray(config.resolve?.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement,
        }));

    return {
      ...config,
      base: '/',
      resolve: {
        ...config.resolve,
        alias: [
          ...aliases,
          {
            find: /^@deweyou-design\/react\/(.+)$/,
            replacement: `${componentsSourceDir}/$1/index.tsx`,
          },
          {
            find: /^@deweyou-design\/react$/,
            replacement: componentsEntry,
          },
          {
            find: /^@deweyou-design\/react-icons\/(.+)$/,
            replacement: `${iconExportsDir}/$1.ts`,
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
        ],
      },
    };
  },
};

export default config;
