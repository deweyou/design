import type { Preview } from '@storybook/react';
import { createElement, Suspense } from 'react';

import {
  ConfigProvider,
  configLocales,
  defaultConfigLocale,
  type ConfigLocale,
  type ConfigProviderProps,
} from '@deweyou-design/react/config-provider';

import '@deweyou-design/styles/theme-with-fonts.css';

const storybookThemeBackgrounds = {
  light: '#ffffff',
  dark: '#000000',
} as const;

const resolveStorybookLocale = (value: unknown): ConfigLocale =>
  configLocales.find((locale) => locale === value) ?? defaultConfigLocale;

const preview: Preview = {
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Component locale supplied by ConfigProvider',
      defaultValue: defaultConfigLocale,
      toolbar: {
        dynamicTitle: true,
        icon: 'globe',
        items: configLocales.map((locale) => ({ title: locale, value: locale })),
      },
    },
    themeMode: {
      name: 'Theme',
      description: 'Preview light and dark theme tokens',
      defaultValue: 'light',
      toolbar: {
        dynamicTitle: true,
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const themeMode = context.globals.themeMode === 'dark' ? 'dark' : 'light';
      const locale = resolveStorybookLocale(context.globals.locale);
      const fullViewport = context.parameters.fullViewport === true;
      const storyContent = createElement(
        'div',
        {
          'data-theme': themeMode,
          style: {
            background: storybookThemeBackgrounds[themeMode],
            colorScheme: themeMode,
            minHeight: fullViewport ? '100vh' : 'auto',
            padding: fullViewport ? 0 : '24px',
            width: '100%',
          },
        },
        createElement(
          Suspense,
          { fallback: createElement('span', null, 'Loading locale…') },
          createElement(Story),
        ),
      );

      return createElement(ConfigProvider, { locale } as ConfigProviderProps, storyContent);
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
      sort: 'requiredFirst',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#000000' },
      ],
    },
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
};

export default preview;
