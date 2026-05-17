import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, NavOverlay, ScrollArea } from '@deweyou-design/react';

const navLinkStyle: CSSProperties = {
  alignItems: 'center',
  color: 'var(--ui-color-text)',
  display: 'flex',
  minHeight: 'var(--ui-touch-target-min)',
  textDecoration: 'none',
};

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
        <a href="#" style={navLinkStyle}>
          Overview
        </a>
        <a href="#" style={navLinkStyle}>
          Components
        </a>
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
    await expect(
      within(dialog).getByRole('button', { name: 'Close navigation' }),
    ).toBeInTheDocument();
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
          paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
          paddingTop: 'calc(72px + env(safe-area-inset-top))',
        }}
      >
        <ScrollArea.Root
          style={{
            flex: '1 1 auto',
            minHeight: 0,
          }}
        >
          <ScrollArea.Viewport>
            <nav
              aria-label="Long navigation"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {Array.from({ length: 32 }, (_, index) => (
                <a href={`#section-${index + 1}`} key={index} style={navLinkStyle}>
                  Section {index + 1}
                </a>
              ))}
            </nav>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <NavOverlay.CloseButton />
      </NavOverlay.Content>
    </NavOverlay.Root>
  ),
};
