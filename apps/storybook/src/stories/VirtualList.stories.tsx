import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, VirtualList, type VirtualListRef } from '@deweyou-design/react';

const rows = Array.from({ length: 1000 }, (_, index) => ({
  id: `section-${index + 1}`,
  title: `Section ${index + 1}`,
  description: `Document paragraph anchor ${index + 1}`,
}));

const meta: Meta<typeof VirtualList> = {
  title: 'Components/VirtualList',
  component: VirtualList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'VirtualList renders a large one-dimensional collection through a ScrollArea-aligned viewport. Import from `@deweyou-design/react/virtual-list`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <VirtualList
      count={rows.length}
      estimateSize={() => 56}
      height={320}
      renderItem={({ index }) => {
        const row = rows[index];

        return (
          <div
            style={{
              borderBottom: '1px solid var(--ui-color-border)',
              boxSizing: 'border-box',
              color: 'var(--ui-color-text)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              height: '100%',
              justifyContent: 'center',
              padding: '0 16px',
            }}
          >
            <strong>{row.title}</strong>
            <span style={{ color: 'var(--ui-color-text-muted)', fontSize: 13 }}>
              {row.description}
            </span>
          </div>
        );
      }}
      style={{
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-float)',
        width: 420,
      }}
    />
  ),
};

export const AnchorNavigation: StoryObj = {
  render: () => {
    const listRef = useRef<VirtualListRef>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 420 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => listRef.current?.scrollToIndex(0)} size="sm" variant="outlined">
            Top
          </Button>
          <Button onClick={() => listRef.current?.scrollToIndex(250)} size="sm" variant="outlined">
            Section 251
          </Button>
          <Button onClick={() => listRef.current?.scrollToIndex(900)} size="sm" variant="outlined">
            Section 901
          </Button>
        </div>
        <VirtualList
          ref={listRef}
          count={rows.length}
          estimateSize={() => 56}
          height={320}
          renderItem={({ index }) => {
            const row = rows[index];

            return (
              <div
                style={{
                  borderBottom: '1px solid var(--ui-color-border)',
                  boxSizing: 'border-box',
                  color: 'var(--ui-color-text)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  height: '100%',
                  justifyContent: 'center',
                  padding: '0 16px',
                }}
              >
                <strong>{row.title}</strong>
                <span style={{ color: 'var(--ui-color-text-muted)', fontSize: 13 }}>
                  {row.description}
                </span>
              </div>
            );
          }}
          style={{
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-float)',
          }}
        />
      </div>
    );
  },
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: AnchorNavigation.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    void expect(canvas.getByText('Section 1')).toBeInTheDocument();
    void expect(canvas.queryByText('Document paragraph anchor 901')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByText('Section 901'));

    await waitFor(() => {
      void expect(canvas.getByText('Document paragraph anchor 901')).toBeInTheDocument();
    });
  },
};
