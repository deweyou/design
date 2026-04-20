import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';

import { ScrollArea } from '@deweyou-design/react/scroll-area';

const sizeOptions = ['sm', 'md', 'lg'] as const;

const meta: Meta = {
  title: 'Components/ScrollArea',
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Scrollbar thickness. sm = 4px, md = 8px (default), lg = 12px.',
      control: { type: 'select' },
      options: sizeOptions,
      table: { defaultValue: { summary: 'md' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'ScrollArea provides cross-browser custom scrollbars over a scrollable region. Import from `@deweyou-design/react/scroll-area`.',
      },
    },
  },
};

export default meta;

const longText = Array.from(
  { length: 40 },
  (_, i) => `Line ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
).join('\n');

export const Default: StoryObj = {
  render: () => (
    <ScrollArea.Root
      style={{
        height: '200px',
        width: '320px',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-float)',
      }}
    >
      <ScrollArea.Viewport>
        <div
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.875rem',
            padding: '12px',
            whiteSpace: 'pre-line',
          }}
        >
          {longText}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Vertical (default)
        </p>
        <ScrollArea.Root
          style={{
            height: '160px',
            width: '260px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-float)',
          }}
        >
          <ScrollArea.Viewport>
            <div
              style={{
                color: 'var(--ui-color-text)',
                fontSize: '0.875rem',
                padding: '12px',
                whiteSpace: 'pre-line',
              }}
            >
              {longText}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Horizontal
        </p>
        <ScrollArea.Root
          style={{
            height: '80px',
            width: '260px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-float)',
          }}
        >
          <ScrollArea.Viewport>
            <div
              style={{
                color: 'var(--ui-color-text)',
                fontSize: '0.875rem',
                padding: '12px',
                whiteSpace: 'nowrap',
                width: '600px',
              }}
            >
              This is a very wide content area that overflows horizontally.
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="horizontal">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  ),
};

export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      {sizeOptions.map((size) => (
        <div key={size}>
          <p
            style={{
              color: 'var(--ui-color-text-muted)',
              fontSize: '0.75rem',
              marginBottom: '8px',
            }}
          >
            size=&quot;{size}&quot;
          </p>
          <ScrollArea.Root
            style={{
              height: '160px',
              width: '220px',
              border: '1px solid var(--ui-color-border)',
              borderRadius: 'var(--ui-radius-float)',
            }}
          >
            <ScrollArea.Viewport>
              <div
                style={{
                  color: 'var(--ui-color-text)',
                  fontSize: '0.875rem',
                  padding: '12px',
                  whiteSpace: 'pre-line',
                }}
              >
                {longText}
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical" size={size}>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </div>
      ))}
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <ScrollArea.Root
      style={{
        height: '160px',
        width: '260px',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-float)',
      }}
    >
      <ScrollArea.Viewport>
        <div
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.875rem',
            padding: '12px',
            whiteSpace: 'pre-line',
            width: '500px',
          }}
        >
          {longText}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <ScrollArea.Root
      data-testid="scroll-root"
      style={{
        height: '200px',
        width: '320px',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-float)',
      }}
    >
      <ScrollArea.Viewport>
        <div
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.875rem',
            padding: '12px',
            whiteSpace: 'pre-line',
          }}
        >
          {longText}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const scrollbars = canvasElement.querySelectorAll('[data-orientation="vertical"]');
      void expect(scrollbars.length).toBeGreaterThan(0);
    });
    const root = canvas.getByTestId('scroll-root');
    void expect(root).toBeTruthy();
  },
};
