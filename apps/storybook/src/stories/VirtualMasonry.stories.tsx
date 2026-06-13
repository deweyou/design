import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { VirtualMasonry, type VirtualMasonryRef } from '@deweyou-design/react/virtual-masonry';

const images = Array.from({ length: 120 }, (_, index) => {
  const height = 150 + (index % 5) * 44;
  const color = ['0f766e', 'be123c', '4338ca', 'b45309', '334155'][index % 5];

  return {
    alt: `Gallery item ${index + 1}`,
    height,
    src: `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 ${height}%22%3E%3Crect width=%22240%22 height=%22${height}%22 fill=%22%23${color}%22/%3E%3C/svg%3E`,
    width: 240,
  };
});

const meta: Meta<typeof VirtualMasonry> = {
  title: 'Components/VirtualMasonry',
  component: VirtualMasonry,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'VirtualMasonry renders long irregular image collections by mounting only visible masonry cells. Import from `@deweyou-design/react/virtual-masonry`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof VirtualMasonry> = {
  args: {
    defaultContainerWidth: 760,
    height: 360,
    images,
    maxColumnCount: 4,
    minColumnWidth: 180,
    overscan: 300,
  },
};

const AnchorNavigation = () => {
  const masonryRef = useRef<VirtualMasonryRef>(null);

  return (
    <div style={{ display: 'grid', gap: 12, width: 'min(48rem, 100%)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button data-testid="scroll-top" onClick={() => masonryRef.current?.scrollToIndex(0)}>
          Top
        </Button>
        <Button data-testid="scroll-deep" onClick={() => masonryRef.current?.scrollToIndex(72)}>
          Item 73
        </Button>
      </div>
      <VirtualMasonry
        ref={masonryRef}
        defaultContainerWidth={760}
        height={360}
        images={images}
        maxColumnCount={4}
        minColumnWidth={180}
        overscan={300}
      />
    </div>
  );
};

export const Navigation: StoryObj = {
  render: () => <AnchorNavigation />,
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <AnchorNavigation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('scroll-deep'));
    await waitFor(async () => {
      await expect(canvas.getByAltText('Gallery item 73')).toBeInTheDocument();
    });
  },
};
