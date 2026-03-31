import type { Preview } from '@storybook/react';
import { createElement } from 'react';

import '@deweyou-ui/styles/theme.css';

const storybookThemeBackgrounds = {
  light: '#ffffff',
  dark: '#000000',
} as const;

const preview: Preview = {
  globalTypes: {
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

      return createElement(
        'div',
        {
          'data-theme': themeMode,
          style: {
            background: storybookThemeBackgrounds[themeMode],
            colorScheme: themeMode,
            minHeight: 'auto',
            padding: '24px',
            width: '100%',
          },
        },
        createElement(Story),
      );
    },
  ],
  parameters: {
    layout: 'centered',
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
  },
};

export default preview;
