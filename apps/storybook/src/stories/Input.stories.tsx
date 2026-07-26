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
    placeholder: {
      description: 'Placeholder text shown while the input is empty.',
      control: { type: 'text' },
    },
    clearable: {
      description: 'Shows a localized clear action while the editable input has a value.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } },
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
    clearable: true,
    defaultValue: 'hello@deweyou.design',
    label: 'Email address',
    hint: 'We will never share your email.',
    autoComplete: 'email',
    name: 'email',
    placeholder: 'you@example.com',
    spellCheck: false,
    type: 'email',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input label="Default (md)" placeholder="Type a value…" />
      <Input label="Small (sm)" size="sm" placeholder="Type a compact value…" />
      <Input label="Large (lg)" size="lg" placeholder="Type a larger value…" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input label="Normal" hint="Helper text here." placeholder="Enter a value…" />
      <Input label="With error" error="This field is required." placeholder="Enter a value…" />
      <Input label="Disabled" disabled placeholder="Cannot type here…" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input
        clearable
        label="Your name"
        hint="Enter your full name."
        placeholder="John Doe"
        data-testid="name-input"
      />
      <Input
        label="Email"
        error="Invalid email address."
        autoComplete="email"
        name="email"
        placeholder="you@example.com"
        spellCheck={false}
        data-testid="error-input"
        type="email"
      />
      <Input
        label="Disabled field"
        disabled
        placeholder="Not editable…"
        data-testid="disabled-input"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: default input is visible and accepts typing
    const nameInput = canvas.getByTestId('name-input');
    await expect(nameInput).toBeInTheDocument();
    await userEvent.type(nameInput, 'Alice');
    await expect(nameInput).toHaveValue('Alice');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear input' }));
    await expect(nameInput).toHaveValue('');
    await expect(nameInput).toHaveFocus();
    await expect(nameInput).toHaveAttribute('placeholder', 'John Doe');

    // error state: error message is present
    const errorInput = canvas.getByTestId('error-input');
    await expect(errorInput).toBeInTheDocument();
    await expect(canvas.getByText('Invalid email address.')).toBeInTheDocument();

    // E2E-P-02: disabled input cannot be typed into
    const disabledInput = canvas.getByTestId('disabled-input');
    await expect(disabledInput).toBeDisabled();
  },
};
