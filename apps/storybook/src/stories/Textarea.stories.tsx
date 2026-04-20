import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Textarea } from '@deweyou-design/react/textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Label text displayed above the textarea.',
      control: { type: 'text' },
    },
    hint: {
      description: 'Helper text displayed below the textarea.',
      control: { type: 'text' },
    },
    error: {
      description: 'Error message. When non-empty, the field enters an error state.',
      control: { type: 'text' },
    },
    size: {
      description: 'Textarea size. Defaults to md.',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      description: 'Disables the textarea.',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Textarea collects multi-line text from the user. Supports label, hint, and inline error feedback.',
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Message',
    hint: 'Please describe your issue in detail.',
    placeholder: 'Type your message here…',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
      <Textarea label="Small (sm)" size="sm" placeholder="Small textarea" />
      <Textarea label="Medium (md)" size="md" placeholder="Medium textarea" />
      <Textarea label="Large (lg)" size="lg" placeholder="Large textarea" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
      <Textarea label="Normal" hint="Helper text here." placeholder="Placeholder" />
      <Textarea label="With error" error="Message cannot be empty." placeholder="Placeholder" />
      <Textarea label="Disabled" disabled placeholder="Cannot type here" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
      <Textarea
        label="Feedback"
        hint="Your feedback helps us improve."
        placeholder="Write your feedback…"
        data-testid="feedback-textarea"
      />
      <Textarea
        label="Required field"
        error="This field cannot be empty."
        data-testid="error-textarea"
      />
      <Textarea
        label="Read-only area"
        disabled
        placeholder="Cannot be edited"
        data-testid="disabled-textarea"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: textarea is visible and accepts typing
    const feedbackTextarea = canvas.getByTestId('feedback-textarea');
    expect(feedbackTextarea).toBeInTheDocument();
    await userEvent.type(feedbackTextarea, 'Great product!');
    expect(feedbackTextarea).toHaveValue('Great product!');

    // error state: error message is visible
    const errorTextarea = canvas.getByTestId('error-textarea');
    expect(errorTextarea).toBeInTheDocument();
    expect(canvas.getByText('This field cannot be empty.')).toBeInTheDocument();

    // E2E-P-02: disabled textarea cannot be interacted with
    const disabledTextarea = canvas.getByTestId('disabled-textarea');
    expect(disabledTextarea).toBeDisabled();
  },
};
