import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const componentsEntry = fileURLToPath(
  new URL('../../../packages/components/src/index.ts', import.meta.url),
);
const componentsSourceDir = fileURLToPath(
  new URL('../../../packages/components/src', import.meta.url),
);
const iconsSourceDir = fileURLToPath(new URL('../../../packages/icons/src', import.meta.url));
const iconExportsDir = fileURLToPath(
  new URL('../../../packages/icons/src/exports', import.meta.url),
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
    defaultName: 'Internal review stories for component state coverage',
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
      resolve: {
        ...config.resolve,
        alias: [
          ...aliases,
          {
            find: /^@deweyou-ui\/components\/(.+)$/,
            replacement: `${componentsSourceDir}/$1/index.tsx`,
          },
          {
            find: /^@deweyou-ui\/components$/,
            replacement: componentsEntry,
          },
          {
            find: /^@deweyou-ui\/icons\/(.+)$/,
            replacement: `${iconExportsDir}/$1.ts`,
          },
          {
            find: '@deweyou-ui/icons',
            replacement: iconsSourceDir,
          },
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
    };
  },
};

export default config;
