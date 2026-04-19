import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { Tooltip } from '@deweyou-design/react/tooltip';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip displays a short informational message on hover/focus. Built on Ark UI. Import from `@deweyou-design/react/tooltip`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="outlined">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>This is a tooltip</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        justifyContent: 'center',
        padding: '80px',
        flexWrap: 'wrap',
      }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button>Short tip</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Brief message</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="outlined">Long tip</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          This tooltip has a longer description that wraps across multiple lines when it exceeds the
          maximum width of 240px.
        </Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
          <Button variant="ghost">No delay</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Opens instantly (openDelay=0)</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        justifyContent: 'center',
        padding: '80px',
      }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button>Default (closed)</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Visible on hover</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
          <button
            style={{
              background: 'none',
              border: '1px solid var(--ui-color-border)',
              borderRadius: 'var(--ui-radius-float)',
              color: 'var(--ui-color-text)',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Native button trigger
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>Works on any focusable element</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        justifyContent: 'center',
        padding: '80px',
        flexWrap: 'wrap',
      }}
    >
      <Tooltip.Root size="sm">
        <Tooltip.Trigger>
          <Button>Small (sm)</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Compact tooltip</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root size="md">
        <Tooltip.Trigger>
          <Button variant="outlined">Medium (md)</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Standard tooltip</Tooltip.Content>
      </Tooltip.Root>
      <Tooltip.Root size="lg">
        <Tooltip.Trigger>
          <Button variant="ghost">Large (lg)</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          A larger tooltip suitable for multi-line descriptive text that requires more space.
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}
    >
      <Tooltip.Root openDelay={0} closeDelay={0}>
        <Tooltip.Trigger>
          <button data-testid="tooltip-trigger">Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip is visible</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId('tooltip-trigger');
    expect(canvas.queryByText('Tooltip is visible')).toBeNull();

    await userEvent.hover(trigger);
    await waitFor(() => {
      expect(canvas.getByText('Tooltip is visible')).toBeTruthy();
    });

    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(canvas.queryByText('Tooltip is visible')).toBeNull();
    });
  },
};
