import type { Meta, StoryObj } from '@storybook/react';

import { FoundationButton } from '@deweyou-ui/components';

const meta = {
  title: 'Internal review/FoundationButton',
  component: FoundationButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Internal review baseline story used to validate the Storybook 10 upgrade.',
      },
    },
  },
  args: {
    label: 'Internal review button',
  },
} satisfies Meta<typeof FoundationButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Brand: Story = {};

export const Neutral: Story = {
  args: {
    tone: 'neutral',
    label: 'Neutral review state',
  },
};
