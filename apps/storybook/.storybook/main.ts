import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const iconsSourceDir = fileURLToPath(new URL('../../../packages/icons/src', import.meta.url));
const iconExportsDir = fileURLToPath(
  new URL('../../../packages/icons/src/exports', import.meta.url),
);

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
            find: /^@deweyou-ui\/icons\/(.+)$/,
            replacement: `${iconExportsDir}/$1.ts`,
          },
          {
            find: '@deweyou-ui/icons',
            replacement: iconsSourceDir,
          },
        ],
      },
    };
  },
};

export default config;
