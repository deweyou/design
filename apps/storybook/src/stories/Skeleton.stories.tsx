import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Skeleton } from '@deweyou-design/react/skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    width: {
      description: 'Width in px (number) or any CSS string. Defaults to 100%.',
      control: { type: 'text' },
    },
    height: {
      description: 'Height in px (number) or any CSS string. Defaults to 1em.',
      control: { type: 'text' },
    },
    circle: {
      description: 'Circular mode for avatar placeholders.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton provides a loading placeholder with a shimmer animation. Use circle mode for avatar-sized placeholders.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: '240px',
    height: '1em',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '360px' }}>
      <Skeleton height="1em" />
      <Skeleton height="1em" width="80%" />
      <Skeleton height="1em" width="60%" />
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Skeleton circle width={40} height={40} />
        <div style={{ flex: 1, display: 'grid', gap: '6px' }}>
          <Skeleton height="0.875em" />
          <Skeleton height="0.875em" width="70%" />
        </div>
      </div>
      <Skeleton height="120px" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Skeleton circle width={48} height={48} />
      <Skeleton circle width={32} height={32} />
      <Skeleton circle width={24} height={24} />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '8px', maxWidth: '320px' }}>
      <Skeleton data-testid="line-skeleton" height="1em" />
      <Skeleton data-testid="circle-skeleton" circle width={40} height={40} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lineSkeleton = canvas.getByTestId('line-skeleton');
    void expect(lineSkeleton).toBeInTheDocument();
    void expect(lineSkeleton).toHaveAttribute('aria-hidden', 'true');
    const circleSkeleton = canvas.getByTestId('circle-skeleton');
    void expect(circleSkeleton).toBeInTheDocument();
    void expect(circleSkeleton).toHaveAttribute('aria-hidden', 'true');
  },
};
