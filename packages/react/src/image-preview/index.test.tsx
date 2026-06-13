// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { ImagePreview } from './index.tsx';

const images = [
  {
    alt: 'Harbor dusk',
    caption: 'A calm harbor at dusk',
    src: '/harbor.jpg',
  },
  {
    alt: 'Forest path',
    caption: 'A green forest path',
    src: '/forest.jpg',
  },
];

afterEach(() => {
  cleanup();
});

describe('ImagePreview', () => {
  it('renders the active image in a dialog and supports zoom controls', () => {
    render(<ImagePreview defaultOpen images={images} />);

    expect(screen.getByRole('dialog', { name: 'Image preview' })).toBeDefined();
    expect(screen.getByAltText('Harbor dusk').getAttribute('style')).toContain('scale(1)');

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByAltText('Harbor dusk').getAttribute('style')).toContain('scale(1.25)');

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(screen.getByAltText('Harbor dusk').getAttribute('style')).toContain('scale(1)');

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(screen.getByAltText('Harbor dusk').getAttribute('style')).toContain('scale(1)');
  });

  it('moves between images with controls and keyboard arrows', () => {
    render(<ImagePreview defaultOpen images={images} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByAltText('Forest path')).toBeDefined();
    expect(screen.getByText('2 / 2')).toBeDefined();

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Harbor dusk')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
  });

  it('opens from a trigger and reports open changes', async () => {
    const onOpenChange = vi.fn();

    render(
      <ImagePreview
        images={images}
        onOpenChange={onOpenChange}
        trigger={<button type="button">Open preview</button>}
      />,
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open preview' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => {
      expect(screen.getByAltText('Harbor dusk')).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  it('supports controlled open and index state without mutating internal state', () => {
    const onIndexChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ImagePreview
        currentIndex={0}
        defaultZoom={3}
        images={images}
        maxZoom={1}
        minZoom={2}
        onIndexChange={onIndexChange}
        onOpenChange={onOpenChange}
        open
      />,
    );

    expect(screen.getByAltText('Harbor dusk').getAttribute('style')).toContain('scale(2)');

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onIndexChange).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onIndexChange).toHaveBeenCalledWith({
      image: images[1],
      index: 1,
      previousIndex: 0,
    });
    expect(screen.getByAltText('Harbor dusk')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('does not open when a custom trigger prevents the click default', () => {
    const onOpenChange = vi.fn();
    const onTriggerClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });

    render(
      <ImagePreview
        images={images}
        onOpenChange={onOpenChange}
        trigger={
          <button onClick={onTriggerClick} type="button">
            Block preview
          </button>
        }
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Block preview' }));

    expect(onTriggerClick).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders string triggers, empty states, and title fallbacks', async () => {
    render(<ImagePreview images={[]} trigger="Open empty preview" />);

    fireEvent.click(screen.getByRole('button', { name: 'Open empty preview' }));

    await waitFor(() => {
      expect(screen.getByText('No image')).toBeDefined();
    });
    expect(screen.getByText('0 / 0')).toBeDefined();

    cleanup();

    render(
      <ImagePreview
        defaultOpen
        images={[
          {
            src: '/title.jpg',
            title: 'Title only',
          },
        ]}
      />,
    );

    expect(screen.getByAltText('Title only')).toBeDefined();
    expect(screen.getByText('Title only')).toBeDefined();
  });
});
