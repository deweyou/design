import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { ImagePreview } from '@deweyou-design/react/image-preview';

const images = [
  {
    alt: 'Harbor dusk',
    caption: 'Harbor dusk',
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 800%22%3E%3Crect width=%221200%22 height=%22800%22 fill=%22%230f766e%22/%3E%3Ccircle cx=%22920%22 cy=%22220%22 r=%22120%22 fill=%22%23f59e0b%22/%3E%3Cpath d=%22M0 560h1200v240H0z%22 fill=%22%230f172a%22 opacity=%220.45%22/%3E%3C/svg%3E',
  },
  {
    alt: 'Forest path',
    caption: 'Forest path',
    src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 900 1200%22%3E%3Crect width=%22900%22 height=%221200%22 fill=%22%23166534%22/%3E%3Cpath d=%22M430 0h80l180 1200H250z%22 fill=%22%23f5f5f4%22 opacity=%220.58%22/%3E%3C/svg%3E',
  },
];

const meta: Meta<typeof ImagePreview> = {
  title: 'Components/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ImagePreview opens a Dialog-backed image viewer with zoom controls and gallery navigation. Import from `@deweyou-design/react/image-preview`.',
      },
    },
  },
};

export default meta;

export const Default: StoryObj<typeof ImagePreview> = {
  args: {
    images,
    trigger: (
      <Button data-testid="image-preview-trigger" variant="outlined">
        Open preview
      </Button>
    ),
  },
};

export const OpenGallery: StoryObj<typeof ImagePreview> = {
  args: {
    defaultIndex: 1,
    defaultOpen: true,
    images,
  },
};

export const Interaction: StoryObj<typeof ImagePreview> = {
  name: 'Interaction',
  render: () => (
    <ImagePreview
      images={images}
      trigger={
        <Button data-testid="image-preview-trigger" variant="outlined">
          Open preview
        </Button>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('image-preview-trigger'));
    await waitFor(async () => {
      await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    await expect(within(dialog).getByAltText('Harbor dusk')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Zoom in' }));
    await waitFor(async () => {
      await expect(within(dialog).getByAltText('Harbor dusk').getAttribute('style')).toContain(
        'scale(1.25)',
      );
    });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Next image' }));
    await expect(within(dialog).getByAltText('Forest path')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close preview' }));
    await waitFor(async () => {
      await expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });
  },
};
