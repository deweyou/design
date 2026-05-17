import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, Nav, NavOverlay, ScrollArea } from '@deweyou-design/react';

const navLinkStyle: CSSProperties = {
  justifyContent: 'flex-start',
};

const overlayItems = [
  { label: 'Overview', value: 'overview' },
  { label: 'Components', value: 'components' },
  { label: 'Icons', value: 'icons' },
] as const;

const NavOverlayDemo = () => {
  const [activeValue, setActiveValue] = useState('overview');

  return (
    <NavOverlay.Root>
      <NavOverlay.Trigger>
        <Button variant="outlined">Open navigation</Button>
      </NavOverlay.Trigger>
      <NavOverlay.Content>
        <Nav.Root aria-label="Overlay navigation" orientation="vertical">
          {overlayItems.map((item) => (
            <Nav.Link
              key={item.value}
              active={activeValue === item.value}
              href={`#${item.value}`}
              style={navLinkStyle}
              onClick={(event) => {
                event.preventDefault();
                setActiveValue(item.value);
              }}
            >
              {item.label}
            </Nav.Link>
          ))}
        </Nav.Root>
        <NavOverlay.CloseButton />
      </NavOverlay.Content>
    </NavOverlay.Root>
  );
};

const LongNavOverlayDemo = () => {
  const [activeValue, setActiveValue] = useState('section-1');

  return (
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
            <Nav.Root
              aria-label="Long navigation"
              orientation="vertical"
              style={{
                gap: 8,
              }}
            >
              {Array.from({ length: 32 }, (_, index) => {
                const value = `section-${index + 1}`;

                return (
                  <Nav.Link
                    key={value}
                    active={activeValue === value}
                    href={`#${value}`}
                    style={navLinkStyle}
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveValue(value);
                    }}
                  >
                    Section {index + 1}
                  </Nav.Link>
                );
              })}
            </Nav.Root>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <NavOverlay.CloseButton />
      </NavOverlay.Content>
    </NavOverlay.Root>
  );
};

const meta = {
  title: 'Components/NavOverlay',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'NavOverlay is a full-screen navigation dialog for compact viewports. It provides accessible dialog semantics, safe-area aware spacing, and a persistent close button pattern.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <NavOverlayDemo />,
};

export const Interaction: Story = {
  name: 'Interaction',
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open navigation' }));

    const dialog = await waitFor(() => within(document.body).getByRole('dialog'));
    await expect(within(dialog).getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('link', { name: 'Components' }));
    await expect(within(dialog).getByRole('link', { name: 'Components' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      within(dialog).getByRole('button', { name: 'Close navigation' }),
    ).toBeInTheDocument();
  },
};

export const LongList: Story = {
  render: () => <LongNavOverlayDemo />,
};
