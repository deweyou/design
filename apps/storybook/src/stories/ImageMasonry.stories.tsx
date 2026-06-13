import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ImageMasonry, type ImageMasonryImage } from '@deweyou-design/react/image-masonry';
import { ImagePreview } from '@deweyou-design/react/image-preview';

const images: ImageMasonryImage[] = [
  {
    alt: 'Teal gallery tile',
    height: 160,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 160%22%3E%3Crect width=%22240%22 height=%22160%22 fill=%22%230f766e%22/%3E%3C/svg%3E',
    width: 240,
  },
  {
    alt: 'Rose gallery tile',
    height: 260,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 260%22%3E%3Crect width=%22240%22 height=%22260%22 fill=%22%23be123c%22/%3E%3C/svg%3E',
    width: 240,
  },
  {
    alt: 'Indigo gallery tile',
    height: 190,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 190%22%3E%3Crect width=%22240%22 height=%22190%22 fill=%22%234338ca%22/%3E%3C/svg%3E',
    width: 240,
  },
  {
    alt: 'Amber gallery tile',
    height: 130,
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 240 130%22%3E%3Crect width=%22240%22 height=%22130%22 fill=%22%23b45309%22/%3E%3C/svg%3E',
    width: 240,
  },
];

const meta: Meta<typeof ImageMasonry> = {
  title: 'Components/ImageMasonry',
  component: ImageMasonry,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ImageMasonry arranges image cards with fixed or responsive shortest-column placement. Import from `@deweyou-design/react/image-masonry`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof ImageMasonry> = {
  args: {
    defaultContainerWidth: 640,
    images,
    maxColumnCount: 4,
    minColumnWidth: 180,
  },
  render: (args) => (
    <div style={{ width: 'min(40rem, 100%)' }}>
      <ImageMasonry {...args} />
    </div>
  ),
};

export const FixedColumns: StoryObj<typeof ImageMasonry> = {
  args: {
    columnCount: 3,
    defaultContainerWidth: 640,
    images,
  },
};

const InteractiveGallery = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <>
      <ImageMasonry
        columnCount={2}
        defaultContainerWidth={420}
        images={images}
        onItemClick={({ index: nextIndex }) => {
          setIndex(nextIndex);
          setOpen(true);
        }}
      />
      <ImagePreview
        currentIndex={index}
        images={images}
        onIndexChange={({ index: nextIndex }) => setIndex(nextIndex)}
        onOpenChange={setOpen}
        open={open}
      />
    </>
  );
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <InteractiveGallery />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Preview Teal gallery tile' }));
    await waitFor(async () => {
      await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    await expect(within(dialog).getByAltText('Teal gallery tile')).toBeInTheDocument();
  },
};
