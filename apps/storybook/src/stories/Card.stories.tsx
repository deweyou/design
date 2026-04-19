import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Card } from '@deweyou-design/react/card';

const paddingOptions = ['none', 'sm', 'md', 'lg'] as const;

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
    children: 'Card content goes here.',
    style: { maxWidth: '320px' },
  },
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

export const States: Story = {
  render: () => (
    <Card padding="lg" style={{ maxWidth: '400px' }}>
      <h3 style={{ margin: '0 0 8px', color: 'var(--ui-color-text)' }}>Card title</h3>
      <p style={{ margin: '0 0 16px', color: 'var(--ui-color-text-muted)' }}>
        Cards are neutral surface containers. Nest any content inside.
      </p>
    </Card>
  ),
};

export const Interaction: Story = {
  render: () => (
    <Card padding="md" data-testid="test-card" style={{ maxWidth: '320px' }}>
      <p style={{ margin: 0, color: 'var(--ui-color-text)' }}>Interactive card content</p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Interactive card content');
    expect(card.tagName).toBe('DIV');
  },
};
