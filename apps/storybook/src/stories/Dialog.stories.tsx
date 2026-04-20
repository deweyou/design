import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { Dialog } from '@deweyou-design/react/dialog';

const meta: Meta = {
  title: 'Components/Dialog',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dialog is a modal overlay. Built on Ark UI for focus trapping, ARIA `role="dialog"`, and keyboard management. Import from `@deweyou-design/react/dialog`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outlined">Open dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Confirm action</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to proceed? This action cannot be undone.
        </Dialog.Description>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Dialog.CloseTrigger>
            <Button variant="outlined">Cancel</Button>
          </Dialog.CloseTrigger>
          <Dialog.CloseTrigger>
            <Button>Confirm</Button>
          </Dialog.CloseTrigger>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="outlined">Compact</Button>
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: '24rem' }}>
          <Dialog.Title>Delete item</Dialog.Title>
          <Dialog.Description>This will permanently delete the selected item.</Dialog.Description>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}
          >
            <Dialog.CloseTrigger>
              <Button variant="outlined">Cancel</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger>
              <Button>Delete</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="outlined">Wide</Button>
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: '44rem' }}>
          <Dialog.Title>Terms and conditions</Dialog.Title>
          <Dialog.Description>
            Please read the following terms carefully before proceeding.
          </Dialog.Description>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}
          >
            <Dialog.CloseTrigger>
              <Button variant="outlined">Decline</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger>
              <Button>I agree</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  ),
};

const ControlledDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}
    >
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open externally
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Title>Controlled dialog</Dialog.Title>
          <Dialog.Description>This dialog is controlled via external state.</Dialog.Description>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}
          >
            <Dialog.CloseTrigger>
              <Button variant="outlined">Cancel</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export const States: StoryObj = { render: () => <ControlledDialog /> };

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outlined" data-testid="dialog-trigger">
          Open dialog
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Confirm action</Dialog.Title>
        <Dialog.Description>Are you sure you want to proceed?</Dialog.Description>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Dialog.CloseTrigger>
            <Button variant="outlined" data-testid="dialog-close">
              Cancel
            </Button>
          </Dialog.CloseTrigger>
          <Button>Confirm</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();

    const trigger = canvas.getByTestId('dialog-trigger');
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(within(dialog).getByText('Confirm action')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    const closeBtn = document.querySelector('[data-testid="dialog-close"]') as HTMLElement;
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });
  },
};
