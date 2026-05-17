import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Field, Input } from '@deweyou-design/react';

const meta = {
  title: 'Components/Field',
  component: Field.Root,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Field wires labels, descriptions, error text, required state, disabled state, and form control aria attributes for custom input compositions.',
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hasDescription: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hasError: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
} satisfies Meta<typeof Field.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    hasDescription: true,
    hasError: false,
    invalid: false,
    required: false,
  },
  render: ({
    disabled = false,
    hasDescription = true,
    hasError = false,
    invalid = false,
    required = false,
  }) => {
    return (
      <Field.Root
        disabled={disabled}
        hasDescription={hasDescription}
        hasError={hasError}
        id="field-story"
        invalid={invalid}
        required={required}
      >
        <Field.Label>Name</Field.Label>
        <Field.Control>
          <Input placeholder="Deweyou" />
        </Field.Control>
        {hasDescription && (
          <Field.Description>Field connects label, description, and control ids.</Field.Description>
        )}
        {hasError && <Field.ErrorText>Enter a valid value.</Field.ErrorText>}
      </Field.Root>
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <Field.Root id="field-invalid-story" hasDescription hasError invalid required>
      <Field.Label>Email address</Field.Label>
      <Field.Control>
        <Input placeholder="you@example.com" type="email" />
      </Field.Control>
      <Field.Description>Use the email connected to your Deweyou account.</Field.Description>
      <Field.ErrorText>Enter a valid email address.</Field.ErrorText>
    </Field.Root>
  ),
};

export const Interaction: Story = {
  name: 'Interaction',
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Name');
    const description = canvas.getByText('Field connects label, description, and control ids.');

    await expect(input).toBeInTheDocument();
    await expect(input.getAttribute('aria-describedby')).toBe(description.id);
    await userEvent.type(input, ' Dewey');
    await expect(input).toHaveValue(' Dewey');
  },
};
