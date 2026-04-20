import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Breadcrumb } from '@deweyou-design/react/breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb.Root,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumb is a compound navigation component. Compose with Breadcrumb.Root, .List, .Item, .Link, .Current, and .Separator.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Detail</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
            <Breadcrumb.Separator />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current>Current</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
            <Breadcrumb.Separator>›</Breadcrumb.Separator>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#">Docs</Breadcrumb.Link>
            <Breadcrumb.Separator>›</Breadcrumb.Separator>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Current>API Reference</Breadcrumb.Current>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <Breadcrumb.Root aria-label="Page navigation">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Dashboard</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Profile</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
};

export const Interaction: Story = {
  render: () => (
    <Breadcrumb.Root data-testid="breadcrumb-root">
      <Breadcrumb.List data-testid="breadcrumb-list">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#" data-testid="breadcrumb-link">
            Home
          </Breadcrumb.Link>
          <Breadcrumb.Separator data-testid="breadcrumb-sep" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current data-testid="breadcrumb-current">Current Page</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('breadcrumb-root');
    void expect(root).toBeInTheDocument();
    void expect(root.tagName).toBe('NAV');
    const list = canvas.getByTestId('breadcrumb-list');
    void expect(list.tagName).toBe('OL');
    const link = canvas.getByTestId('breadcrumb-link');
    void expect(link.tagName).toBe('A');
    void expect(link).toHaveTextContent('Home');
    const sep = canvas.getByTestId('breadcrumb-sep');
    void expect(sep).toHaveAttribute('aria-hidden', 'true');
    const current = canvas.getByTestId('breadcrumb-current');
    void expect(current).toHaveAttribute('aria-current', 'page');
    void expect(current).toHaveTextContent('Current Page');
  },
};
