import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, NavOverlay } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/NavOverlay',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <NavOverlay.Root>
      <NavOverlay.Trigger>
        <Button variant="outlined">Open navigation</Button>
      </NavOverlay.Trigger>
      <NavOverlay.Content>
        <a href="#">Overview</a>
        <a href="#">Components</a>
        <NavOverlay.CloseButton />
      </NavOverlay.Content>
    </NavOverlay.Root>
  ),
};

export const Interaction: Story = {
  name: 'Interaction',
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open navigation' }));

    const dialog = await waitFor(() => within(document.body).getByRole('dialog'));
    await expect(within(dialog).getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', { name: 'Close navigation' })).toBeVisible();
  },
};

export const LongList: Story = {
  render: () => (
    <NavOverlay.Root defaultOpen>
      <NavOverlay.Trigger>
        <Button variant="outlined">Open navigation</Button>
      </NavOverlay.Trigger>
      <NavOverlay.Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'hidden',
          paddingBottom: 96,
          paddingTop: 72,
        }}
      >
        <nav
          aria-label="Long navigation"
          style={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            gap: 8,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {Array.from({ length: 32 }, (_, index) => (
            <a href={`#section-${index + 1}`} key={index}>
              Section {index + 1}
            </a>
          ))}
        </nav>
        <NavOverlay.CloseButton
          style={{
            bottom: 24,
            left: '50%',
            position: 'fixed',
            right: 'auto',
            top: 'auto',
            transform: 'translateX(-50%)',
          }}
        />
      </NavOverlay.Content>
    </NavOverlay.Root>
  ),
};
