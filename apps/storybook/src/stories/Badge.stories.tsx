import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Badge } from '@deweyou-design/react/badge';

const variants = ['soft', 'solid', 'outline'] as const;
const colors = ['neutral', 'primary', 'danger', 'success', 'warning'] as const;
const shapes = ['pill', 'rounded', 'rect'] as const;

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Visual treatment: soft (tinted bg), solid (filled), or outline (border only).',
      control: { type: 'select' },
      options: variants,
      table: { defaultValue: { summary: 'soft' } },
    },
    color: {
      description: 'Semantic color emphasis.',
      control: { type: 'select' },
      options: colors,
      table: { defaultValue: { summary: 'neutral' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Badge is a compact inline label for status, categories, or counts. Three variants × five semantic colors.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'New',
    variant: 'soft',
    color: 'primary',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '64px', fontSize: '0.8rem', color: 'var(--ui-color-text-muted)' }}>
            {variant}
          </span>
          {colors.map((color) => (
            <Badge key={color} variant={variant} color={color}>
              {color}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge color="success">Active</Badge>
      <Badge color="danger">Error</Badge>
      <Badge color="warning">Pending</Badge>
      <Badge color="primary">New</Badge>
      <Badge color="neutral">Draft</Badge>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {shapes.map((shape) => (
        <div key={shape} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '64px', fontSize: '0.8rem', color: 'var(--ui-color-text-muted)' }}>
            {shape}
          </span>
          <Badge shape={shape} variant="soft" color="primary">
            Soft
          </Badge>
          <Badge shape={shape} variant="solid" color="danger">
            Solid
          </Badge>
          <Badge shape={shape} variant="outline" color="success">
            Outline
          </Badge>
        </div>
      ))}
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Badge data-testid="soft-badge" variant="soft" color="primary">
        Soft
      </Badge>
      <Badge data-testid="solid-badge" variant="solid" color="danger">
        Solid
      </Badge>
      <Badge data-testid="outline-badge" variant="outline" color="success">
        Outline
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const softBadge = canvas.getByTestId('soft-badge');
    expect(softBadge).toBeInTheDocument();
    expect(softBadge).toHaveTextContent('Soft');
    const solidBadge = canvas.getByTestId('solid-badge');
    expect(solidBadge).toBeInTheDocument();
    expect(solidBadge).toHaveTextContent('Solid');
    const outlineBadge = canvas.getByTestId('outline-badge');
    expect(outlineBadge).toBeInTheDocument();
    expect(outlineBadge).toHaveTextContent('Outline');
  },
};
