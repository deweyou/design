import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Alert } from '@deweyou-design/react/alert';

const variants = ['info', 'success', 'warning', 'danger'] as const;

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Semantic type controlling the color palette.',
      control: { type: 'select' },
      options: variants,
      table: { defaultValue: { summary: 'info' } },
    },
    title: {
      description: 'Optional heading displayed above the body content.',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Alert (Callout) delivers contextual feedback. Four semantic variants: info, success, warning, danger. Danger variant adds role="alert" for screen readers.',
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Did you know?',
    children: 'You can customize this component using the controls below.',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info" title="Info">
        This is an informational message.
      </Alert>
      <Alert variant="success" title="Success">
        Your changes have been saved.
      </Alert>
      <Alert variant="warning" title="Warning">
        Your session will expire in 5 minutes.
      </Alert>
      <Alert variant="danger" title="Error">
        Something went wrong. Please try again.
      </Alert>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info">Alert without a title — body only.</Alert>
      <Alert variant="danger" title="Critical error">
        This action cannot be undone.
      </Alert>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info" title="Info alert" data-testid="info-alert">
        Informational content here.
      </Alert>
      <Alert variant="danger" title="Danger alert" data-testid="danger-alert">
        This is a danger alert.
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const infoAlert = canvas.getByTestId('info-alert');
    expect(infoAlert).toBeInTheDocument();
    expect(infoAlert).toHaveTextContent('Info alert');
    expect(infoAlert).toHaveTextContent('Informational content here.');
    const dangerAlert = canvas.getByTestId('danger-alert');
    expect(dangerAlert).toBeInTheDocument();
    expect(dangerAlert).toHaveAttribute('role', 'alert');
    expect(dangerAlert).toHaveTextContent('This is a danger alert.');
  },
};
