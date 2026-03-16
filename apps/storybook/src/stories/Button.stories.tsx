import type { Meta, StoryObj } from '@storybook/react';

import { FoundationButton } from '@deweyou-ui/components';

const meta = {
  title: 'Internal review/FoundationButton',
  component: FoundationButton,
  tags: ['autodocs'],
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
