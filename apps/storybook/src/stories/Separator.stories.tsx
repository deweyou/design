import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Separator } from '@deweyou-design/react/separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      description: 'Direction of the separator line.',
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    label: {
      description: 'Optional text label centered within the separator (horizontal only).',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Separator visually divides content. Horizontal (default) renders an hr element; vertical renders a div. An optional label floats centered in the horizontal variant.',
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <p style={{ margin: '0 0 12px', color: 'var(--ui-color-text)' }}>Above content</p>
      <Separator />
      <p style={{ margin: '12px 0 0', color: 'var(--ui-color-text)' }}>Below content</p>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '24px', maxWidth: '360px' }}>
      <div>
        <p style={{ margin: '0 0 8px', color: 'var(--ui-color-text-muted)', fontSize: '0.8rem' }}>
          Horizontal (default)
        </p>
        <Separator />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', color: 'var(--ui-color-text-muted)', fontSize: '0.8rem' }}>
          With label
        </p>
        <Separator label="OR" />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', height: '60px' }}>
        <span style={{ color: 'var(--ui-color-text)' }}>Left</span>
        <Separator orientation="vertical" />
        <span style={{ color: 'var(--ui-color-text)' }}>Right</span>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Separator label="Continue with" />
      <Separator label="OR" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Separator data-testid="horizontal-sep" />
      <Separator data-testid="labeled-sep" label="OR" />
      <div style={{ display: 'flex', height: '40px', alignItems: 'stretch', gap: '8px' }}>
        <span>A</span>
        <Separator orientation="vertical" data-testid="vertical-sep" />
        <span>B</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const horizontalSep = canvas.getByTestId('horizontal-sep');
    expect(horizontalSep).toBeInTheDocument();
    expect(horizontalSep.tagName).toBe('HR');
    const labeledSep = canvas.getByTestId('labeled-sep');
    expect(labeledSep).toBeInTheDocument();
    expect(labeledSep).toHaveTextContent('OR');
    const verticalSep = canvas.getByTestId('vertical-sep');
    expect(verticalSep).toBeInTheDocument();
    expect(verticalSep.tagName).toBe('DIV');
    expect(verticalSep).toHaveAttribute('role', 'separator');
  },
};
