import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Spinner } from '@deweyou-design/react/spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size in px (number) or any CSS string. Defaults to 1em.',
      control: { type: 'text' },
    },
    'aria-label': {
      description:
        'Accessible label. When provided, adds role="status". When absent, adds aria-hidden="true".',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Spinner indicates indeterminate loading. Use `aria-label` when the spinner conveys state to screen-reader users.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Loading' },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Spinner size="1em" aria-label="Small spinner" />
      <Spinner size="1.5em" aria-label="Medium spinner" />
      <Spinner size="2.5em" aria-label="Large spinner" />
      <Spinner size={40} aria-label="40px spinner" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ color: 'var(--ui-color-text)' }}>
        <Spinner aria-label="Loading in text color" />
      </div>
      <div style={{ color: 'var(--ui-color-brand-bg)' }}>
        <Spinner aria-label="Loading in brand color" />
      </div>
      <div style={{ color: 'var(--ui-color-danger-text)' }}>
        <Spinner aria-label="Loading in danger color" />
      </div>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Spinner aria-label="Loading content" data-testid="labeled-spinner" />
      <Spinner data-testid="hidden-spinner" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labeledSpinner = canvas.getByTestId('labeled-spinner');
    expect(labeledSpinner).toBeInTheDocument();
    expect(labeledSpinner).toHaveAttribute('role', 'status');
    expect(labeledSpinner).toHaveAttribute('aria-label', 'Loading content');
    const hiddenSpinner = canvas.getByTestId('hidden-spinner');
    expect(hiddenSpinner).toBeInTheDocument();
    expect(hiddenSpinner).toHaveAttribute('aria-hidden', 'true');
  },
};
