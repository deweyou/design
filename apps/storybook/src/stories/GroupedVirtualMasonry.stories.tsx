import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import {
  GroupedVirtualMasonry,
  type GroupedVirtualMasonryRef,
} from '@deweyou-design/react/grouped-virtual-masonry';

const colors = ['0f766e', 'be123c', '4338ca', 'b45309', '334155'];

const createImages = (group: string, count: number, offset = 0) =>
  Array.from({ length: count }, (_, index) => {
    const height = 150 + ((index + offset) % 5) * 44;
    const color = colors[(index + offset) % colors.length];

    return {
      alt: `${group} item ${index + 1}`,
      height,
      id: `${group}-${index + 1}`,
      src: `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 ${height}%22%3E%3Crect width=%22240%22 height=%22${height}%22 fill=%22%23${color}%22/%3E%3C/svg%3E`,
      width: 240,
    };
  });

const groups = [
  {
    id: 'today',
    images: createImages('Today', 36),
    title: 'Today',
  },
  {
    id: 'week',
    images: createImages('This week', 48, 2),
    title: 'This week',
  },
  {
    id: 'archive',
    images: createImages('Archive', 48, 4),
    title: 'Archive',
  },
];

const meta: Meta<typeof GroupedVirtualMasonry> = {
  title: 'Components/GroupedVirtualMasonry',
  component: GroupedVirtualMasonry,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'GroupedVirtualMasonry virtualizes long grouped masonry collections with fixed-height group headers. Import from `@deweyou-design/react/grouped-virtual-masonry`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof GroupedVirtualMasonry> = {
  args: {
    defaultContainerWidth: 760,
    groupHeaderHeight: 44,
    groups,
    height: 420,
    maxColumnCount: 4,
    minColumnWidth: 180,
    overscan: 300,
  },
};

const GroupNavigation = () => {
  const masonryRef = useRef<GroupedVirtualMasonryRef>(null);

  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(48rem, 100%)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button data-testid="scroll-top" onClick={() => masonryRef.current?.scrollToGroup(0)}>
          Today
        </Button>
        <Button data-testid="scroll-week" onClick={() => masonryRef.current?.scrollToGroup(1)}>
          This week
        </Button>
        <Button
          data-testid="scroll-archive"
          onClick={() => masonryRef.current?.scrollToItem(2, 16)}
        >
          Archive item 17
        </Button>
      </div>
      <GroupedVirtualMasonry
        ref={masonryRef}
        defaultContainerWidth={760}
        groupHeaderHeight={44}
        groups={groups}
        height={420}
        maxColumnCount={4}
        minColumnWidth={180}
        overscan={300}
      />
    </div>
  );
};

export const Navigation: StoryObj = {
  render: () => <GroupNavigation />,
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <GroupNavigation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('scroll-archive'));
    await waitFor(async () => {
      await expect(canvas.getByAltText('Archive item 17')).toBeInTheDocument();
    });
  },
};
