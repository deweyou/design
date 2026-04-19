import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Card } from '@deweyou-design/react/card';

const paddingOptions = ['none', 'sm', 'md', 'lg'] as const;
const shapeOptions = ['auto', 'rect'] as const;

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    padding: {
      description: 'Internal padding size. Defaults to md.',
      control: { type: 'select' },
      options: paddingOptions,
      table: { defaultValue: { summary: 'md' } },
    },
    shape: {
      description: 'Border radius shape. auto = 0.8rem, rect = square corners.',
      control: { type: 'select' },
      options: shapeOptions,
      table: { defaultValue: { summary: 'auto' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Card is a surface container with a border and rounded corners. Use it to group related content with consistent visual framing.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'md',
    shape: 'auto',
    children: 'Card content goes here.',
    style: { maxWidth: '320px' },
  },
};

export const ShapeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Card padding="md" shape="auto" style={{ minWidth: '200px' }}>
        <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--ui-color-text)' }}>
          shape=&quot;auto&quot;
        </strong>
        <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '0.85rem' }}>
          Rounded corners (0.8rem)
        </p>
      </Card>
      <Card padding="md" shape="rect" style={{ minWidth: '200px' }}>
        <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--ui-color-text)' }}>
          shape=&quot;rect&quot;
        </strong>
        <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '0.85rem' }}>
          Square corners (no border-radius)
        </p>
      </Card>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(2, 1fr)',
        maxWidth: '640px',
      }}
    >
      {paddingOptions.map((padding) => (
        <Card key={padding} padding={padding}>
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--ui-color-text)' }}>
            padding=&quot;{padding}&quot;
          </strong>
          <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '0.85rem' }}>
            Some card content here.
          </p>
        </Card>
      ))}
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Card padding="md" data-testid="card-auto" shape="auto" style={{ minWidth: '160px' }}>
        <p style={{ margin: 0, color: 'var(--ui-color-text)' }}>Auto shape</p>
      </Card>
      <Card padding="md" data-testid="card-rect" shape="rect" style={{ minWidth: '160px' }}>
        <p style={{ margin: 0, color: 'var(--ui-color-text)' }}>Rect shape</p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cardAuto = canvas.getByTestId('card-auto');
    const cardRect = canvas.getByTestId('card-rect');
    expect(cardAuto).toBeInTheDocument();
    expect(cardRect).toBeInTheDocument();
    expect(cardAuto.tagName).toBe('DIV');
    expect(cardRect.tagName).toBe('DIV');
  },
};
