import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { NumberInput } from '@deweyou-design/react/number-input';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
  args: {
    defaultValue: '4',
    hint: 'Use the buttons or Arrow Up and Arrow Down.',
    label: 'Quantity',
    max: 10,
    min: 0,
    step: 1,
  },
  argTypes: {
    clearable: {
      control: 'boolean',
      description: 'Shows a localized clear action while the editable input has a value.',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown while the numeric input is empty.',
    },
    showControls: {
      control: 'boolean',
      description: 'Shows the decrement and increment buttons while preserving keyboard stepping.',
      table: { defaultValue: { summary: 'true' } },
    },
    showFocusRing: {
      control: 'boolean',
      description:
        'Shows the component focus ring. Disable only when a surrounding surface provides equivalent focus feedback.',
      table: { defaultValue: { summary: 'true' } },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'ghost'],
      table: { defaultValue: { summary: 'outlined' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'NumberInput combines direct numeric editing with optional accessible step controls, locale-aware formatting, range constraints, and Field validation semantics.',
      },
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clearable: true,
    defaultValue: '4',
    hint: 'Use the buttons or Arrow Up and Arrow Down.',
    label: 'Quantity',
    max: 10,
    min: 0,
    placeholder: 'Enter quantity',
    step: 1,
  },
};

export const SizesAndVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <NumberInput defaultValue="2" label="Small" size="sm" />
      <NumberInput defaultValue="4" label="Medium" />
      <NumberInput defaultValue="8" label="Large" size="lg" />
      <NumberInput defaultValue="12" label="Ghost" variant="ghost" />
    </div>
  ),
};

export const Formatting: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <NumberInput
        defaultValue="1280"
        formatOptions={{ style: 'currency', currency: 'CNY' }}
        label="Budget"
        locale="zh-CN"
        min={0}
        step={100}
      />
      <NumberInput
        defaultValue="37.5"
        formatOptions={{ style: 'percent' }}
        label="Completion"
        locale="en-US"
        max={100}
        min={0}
        step={1}
      />
      <NumberInput defaultValue="1.5" label="Precision" precision={2} step={0.25} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <NumberInput defaultValue="3" label="Ready" max={5} min={1} />
      <NumberInput
        defaultValue="3"
        label="Inline value"
        showControls={false}
        showFocusRing={false}
        variant="ghost"
      />
      <NumberInput
        defaultValue="5"
        hint="The upper boundary is reached."
        label="At maximum"
        max={5}
      />
      <NumberInput defaultValue="2" error="Enter a value from 1 to 5." label="Invalid" />
      <NumberInput defaultValue="2" label="Read only" readOnly />
      <NumberInput defaultValue="2" disabled label="Disabled" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, inlineSize: 'min(100%, 360px)' }}>
      <NumberInput defaultValue="2" label="Tickets" max={3} min={1} />
      <NumberInput
        defaultValue="6"
        label="Inline quantity"
        showControls={false}
        showFocusRing={false}
        variant="ghost"
      />
      <NumberInput
        clearable
        defaultValue="5"
        label="Clearable quantity"
        placeholder="Enter quantity"
      />
      <NumberInput defaultValue="8" error="The value needs review." label="Invalid quantity" />
      <NumberInput defaultValue="4" disabled label="Disabled quantity" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'Tickets' });
    const increment = canvas.getAllByRole('button', { name: 'Increase value' })[0];
    const decrement = canvas.getAllByRole('button', { name: 'Decrease value' })[0];

    await expect(input).toHaveAttribute('aria-valuenow', '2');
    await userEvent.click(increment);
    await expect(input).toHaveAttribute('aria-valuenow', '3');
    await expect(increment).toBeDisabled();

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveAttribute('aria-valuenow', '2');
    await expect(decrement).toBeEnabled();

    const inlineInput = canvas.getByRole('spinbutton', { name: 'Inline quantity' });
    const inlineControl = inlineInput.closest<HTMLElement>('[data-part="control"]');
    await expect(inlineControl).not.toBeNull();
    await expect(within(inlineControl!).queryByRole('button')).toBeNull();
    await userEvent.click(inlineInput);
    await expect(getComputedStyle(inlineControl!).boxShadow).toBe('none');
    await userEvent.keyboard('{ArrowUp}');
    await expect(inlineInput).toHaveAttribute('aria-valuenow', '7');

    const clearableInput = canvas.getByRole('spinbutton', { name: 'Clearable quantity' });
    await userEvent.click(canvas.getByRole('button', { name: 'Clear value' }));
    await expect(clearableInput).toHaveValue('');
    await expect(clearableInput).toHaveFocus();
    await expect(clearableInput).toHaveAttribute('placeholder', 'Enter quantity');

    await expect(canvas.getByText('The value needs review.')).toBeInTheDocument();
    await expect(canvas.getByRole('spinbutton', { name: 'Disabled quantity' })).toBeDisabled();
  },
};
