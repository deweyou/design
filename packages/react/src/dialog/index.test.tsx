// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Dialog } from './index.tsx';

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  cleanup();
});

describe('Dialog — default closed state', () => {
  it('does not render dialog content when closed', () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
          <Dialog.Description>Dialog body</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Dialog — open state', () => {
  it('renders dialog content when trigger is clicked', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure?</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });

  it('renders title and description inside the dialog', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure?</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => {
      expect(screen.getByText('Confirm action')).toBeDefined();
      expect(screen.getByText('Are you sure?')).toBeDefined();
    });
  });
});

describe('Dialog — close trigger', () => {
  it('closes the dialog when the close trigger is clicked', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure?</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});

describe('Dialog — controlled mode', () => {
  it('can be opened externally via open prop', async () => {
    const { rerender } = render(
      <Dialog.Root open={false}>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Description>Body</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(
      <Dialog.Root open={true}>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Description>Body</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });
});
