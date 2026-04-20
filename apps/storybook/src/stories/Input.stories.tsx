import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Input } from '@deweyou-design/react/input';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Label text displayed above the input field.',
      control: { type: 'text' },
    },
    hint: {
      description: 'Helper text displayed below the input field.',
      control: { type: 'text' },
    },
    error: {
      description: 'Error message. When non-empty, the field enters an error state.',
      control: { type: 'text' },
    },
    size: {
      description: 'Input size. Defaults to md.',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      description: 'Disables the input field.',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Input collects single-line text from the user. Use `label` and `hint` to guide the user, and `error` to show inline validation feedback.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email address',
    hint: 'We will never share your email.',
    placeholder: 'you@example.com',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input label="Default (md)" placeholder="Placeholder text" />
      <Input label="Small (sm)" size="sm" placeholder="Placeholder text" />
      <Input label="Large (lg)" size="lg" placeholder="Placeholder text" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input label="Normal" hint="Helper text here." placeholder="Placeholder" />
      <Input label="With error" error="This field is required." placeholder="Placeholder" />
      <Input label="Disabled" disabled placeholder="Cannot type here" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input
        label="Your name"
        hint="Enter your full name."
        placeholder="John Doe"
        data-testid="name-input"
      />
      <Input
        label="Email"
        error="Invalid email address."
        placeholder="you@example.com"
        data-testid="error-input"
      />
      <Input
        label="Disabled field"
        disabled
        placeholder="Not editable"
        data-testid="disabled-input"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: default input is visible and accepts typing
    const nameInput = canvas.getByTestId('name-input');
    expect(nameInput).toBeInTheDocument();
    await userEvent.type(nameInput, 'Alice');
    expect(nameInput).toHaveValue('Alice');

    // error state: error message is present
    const errorInput = canvas.getByTestId('error-input');
    expect(errorInput).toBeInTheDocument();
    expect(canvas.getByText('Invalid email address.')).toBeInTheDocument();

    // E2E-P-02: disabled input cannot be typed into
    const disabledInput = canvas.getByTestId('disabled-input');
    expect(disabledInput).toBeDisabled();
  },
};
