import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { Toaster, toast } from '@deweyou-design/react/toast';

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Toast displays brief, auto-dismissing notifications. Place `<Toaster />` once at the app root and trigger notifications imperatively via `toast.create()`. Import from `@deweyou-design/react/toast`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: '24px' }}>
      <Toaster />
      <Button
        onClick={() =>
          toast.create({
            title: 'Changes saved',
            description: 'Your settings have been updated successfully.',
          })
        }
      >
        Show toast
      </Button>
    </div>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px' }}>
      <Toaster />
      <Button
        onClick={() =>
          toast.create({ title: 'Info', description: 'Informational message.', variant: 'info' })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          toast.create({
            title: 'Success',
            description: 'Operation completed.',
            variant: 'success',
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast.create({ title: 'Warning', description: 'Please review this.', variant: 'warning' })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toast.create({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })
        }
      >
        Danger
      </Button>
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px' }}>
      <Toaster />
      <Button
        onClick={() =>
          toast.create({
            title: 'Short duration',
            description: 'This disappears in 2 seconds.',
            duration: 2000,
          })
        }
      >
        Short (2s)
      </Button>
      <Button onClick={() => toast.create({ title: 'Title only', variant: 'success' })}>
        Title only
      </Button>
    </div>
  ),
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div style={{ padding: '24px' }}>
      <Toaster />
      <Button
        data-testid="show-toast-btn"
        onClick={() =>
          toast.create({
            title: 'Interaction test toast',
            description: 'This toast was created programmatically.',
            variant: 'success',
          })
        }
      >
        Show toast
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByText('Interaction test toast')).toBeNull();

    const btn = canvas.getByTestId('show-toast-btn');
    await userEvent.click(btn);

    await waitFor(() => {
      expect(within(document.body).getByText('Interaction test toast')).toBeTruthy();
    });
    expect(
      within(document.body).getByText('This toast was created programmatically.'),
    ).toBeTruthy();
  },
};
