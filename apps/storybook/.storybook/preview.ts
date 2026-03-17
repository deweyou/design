import type { Preview } from '@storybook/react';

import '@deweyou-ui/styles/theme.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
      sort: 'requiredFirst',
    },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#f6f0e8' },
        { name: 'dark', value: '#1f1916' },
      ],
    },
  },
};

export default preview;
