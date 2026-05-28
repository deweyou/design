import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, VirtualList, type VirtualListRef } from '@deweyou-design/react';

const rows = Array.from({ length: 1000 }, (_, index) => ({
  id: `section-${index + 1}`,
  title: `Section ${index + 1}`,
  description: `Document paragraph anchor ${index + 1}`,
}));

const dynamicRows = Array.from({ length: 120 }, (_, index) => ({
  id: `note-${index + 1}`,
  title: `Daily note ${index + 1}`,
  paragraphs: Array.from({ length: (index % 4) + 1 }, (__, paragraphIndex) =>
    [
      `Measured article paragraph ${paragraphIndex + 1}.`,
      'The row height is intentionally uneven so ResizeObserver can refine the estimate after render.',
      index % 3 === 0
        ? 'Longer notes wrap across more lines and behave like an MDX content stream.'
        : 'Short notes stay compact.',
    ].join(' '),
  ),
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
        width: 'min(26.25rem, 100%)',
      }}
    />
  ),
};

export const AnchorNavigation: StoryObj = {
  render: () => {
    const listRef = useRef<VirtualListRef>(null);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: '100%',
          width: 'min(26.25rem, 100%)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button onClick={() => listRef.current?.scrollToIndex(0)} variant="outlined">
            Top
          </Button>
          <Button onClick={() => listRef.current?.scrollToIndex(250)} variant="outlined">
            Section 251
          </Button>
          <Button onClick={() => listRef.current?.scrollToIndex(900)} variant="outlined">
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

export const DynamicContent: StoryObj = {
  render: () => {
    const listRef = useRef<VirtualListRef>(null);

    return (
      <div style={{ maxWidth: '100%', width: 'min(38rem, 100%)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <Button
            onClick={() => listRef.current?.scrollToIndex(0, { offset: 16 })}
            variant="outlined"
          >
            First
          </Button>
          <Button
            onClick={() => listRef.current?.scrollToIndex(48, { offset: 16 })}
            variant="outlined"
          >
            Note 49
          </Button>
          <Button
            onClick={() => listRef.current?.scrollToIndex(96, { offset: 16 })}
            variant="outlined"
          >
            Note 97
          </Button>
        </div>
        <VirtualList
          ref={listRef}
          count={dynamicRows.length}
          estimateSize={() => 132}
          height={360}
          itemClassName="virtual-list-story-entry"
          itemRole={null}
          overscan={3}
          renderItem={({ index, measureRef }) => {
            const row = dynamicRows[index];

            return (
              <article
                ref={measureRef}
                id={row.id}
                style={{
                  borderBottom: '1px solid var(--ui-color-border)',
                  boxSizing: 'border-box',
                  color: 'var(--ui-color-text)',
                  padding: '14px 16px',
                }}
              >
                <strong>{row.title}</strong>
                {row.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    style={{
                      color: 'var(--ui-color-text-muted)',
                      lineHeight: 1.6,
                      margin: '8px 0 0',
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </article>
            );
          }}
          scrollMargin={16}
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
