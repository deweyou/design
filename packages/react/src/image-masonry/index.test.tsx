// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { ImageMasonry, type ImageMasonryImage } from './index.tsx';
import { buildMasonryLayout, resolveMasonryColumnCount } from './layout.ts';

type ResizeObserverCallbackMap = Map<Element, ResizeObserverCallback>;

const resizeObserverCallbacks: ResizeObserverCallbackMap = new Map();

const images = [
  { alt: 'Harbor', height: 200, id: 'harbor', src: '/harbor.jpg', width: 200 },
  { alt: 'Forest', height: 300, id: 'forest', src: '/forest.jpg', width: 200 },
  { alt: 'Street', height: 100, id: 'street', src: '/street.jpg', width: 200 },
  { alt: 'Museum', height: 240, id: 'museum', src: '/museum.jpg', width: 180 },
];

const imageGeometryContract: ImageMasonryImage[] = [
  { aspectRatio: 1.5, src: '/ratio.jpg' },
  { height: 200, src: '/size.jpg', width: 300 },
  // @ts-expect-error ImageMasonry images need aspectRatio or positive width and height metadata.
  { src: '/missing-geometry.jpg' },
];

void imageGeometryContract;

beforeEach(() => {
  resizeObserverCallbacks.clear();
  window.ResizeObserver = class ResizeObserver {
    readonly #callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.#callback = callback;
    }

    observe = (target: Element) => {
      resizeObserverCallbacks.set(target, this.#callback);
    };

    unobserve = (target: Element) => {
      resizeObserverCallbacks.delete(target);
    };

    disconnect = () => {
      resizeObserverCallbacks.clear();
    };
  } as unknown as typeof ResizeObserver;
});

afterEach(() => {
  cleanup();
  resizeObserverCallbacks.clear();
});

const flushResize = (element: Element, width: number) => {
  resizeObserverCallbacks.get(element)?.(
    [
      {
        contentRect: {
          bottom: 0,
          height: 0,
          left: 0,
          right: width,
          top: 0,
          width,
          x: 0,
          y: 0,
          toJSON: () => {},
        },
        target: element,
      } as ResizeObserverEntry,
    ],
    {} as ResizeObserver,
  );
};

describe('ImageMasonry layout', () => {
  it('resolves fixed and responsive column counts from container width', () => {
    expect(resolveMasonryColumnCount({ columnCount: 3, containerWidth: 480 })).toBe(3);
    expect(
      resolveMasonryColumnCount({
        containerWidth: 860,
        maxColumnCount: 4,
        minColumnWidth: 220,
      }),
    ).toBe(3);
    expect(resolveMasonryColumnCount({ containerWidth: 120, minColumnWidth: 220 })).toBe(1);
  });

  it('places each image into the current shortest column', () => {
    const layout = buildMasonryLayout({
      columnCount: 2,
      containerWidth: 420,
      gap: 20,
      items: images,
    });

    expect(layout.totalHeight).toBeGreaterThan(0);
    expect(layout.items.map((item) => item.column)).toEqual([0, 1, 0, 1]);
    expect(layout.items[0]?.style).toMatchObject({
      height: 200,
      transform: 'translate3d(0px, 0px, 0)',
      width: 200,
    });
    expect(layout.items[1]?.style).toMatchObject({
      height: 300,
      transform: 'translate3d(220px, 0px, 0)',
      width: 200,
    });
  });
});

describe('ImageMasonry', () => {
  it('renders fixed-column image cards with list semantics', () => {
    render(
      <ImageMasonry
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        images={images}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    expect(screen.getByRole('list', { name: 'Image masonry' })).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(
      screen.getByAltText('Harbor').closest('[data-column="0"]')?.getAttribute('data-index'),
    ).toBe('0');
    expect(
      screen.getByAltText('Forest').closest('[data-column="1"]')?.getAttribute('style'),
    ).toContain('height: 300px');
    expect(
      screen.getByAltText('Forest').closest('[data-column="1"]')?.getAttribute('style'),
    ).toContain('width: 200px');
  });

  it('updates responsive columns from ResizeObserver width changes', () => {
    render(
      <ImageMasonry
        defaultContainerWidth={240}
        gap={20}
        images={images}
        minColumnWidth={200}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const root = screen.getByTestId('image-masonry');
    expect(root.getAttribute('data-columns')).toBe('1');

    act(() => {
      flushResize(root, 860);
    });

    expect(root.getAttribute('data-columns')).toBe('4');
    expect(
      screen.getByAltText('Forest').closest('[data-column="1"]')?.getAttribute('style'),
    ).toContain('width: 200px');
  });

  it('uses the default image renderer and reports item activation', () => {
    const onItemClick = vi.fn();

    render(<ImageMasonry columnCount={2} images={images} onItemClick={onItemClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Preview Harbor' }));

    expect(onItemClick).toHaveBeenCalledWith({
      image: images[0],
      index: 0,
    });
  });

  it('renders default non-interactive images with captions and fallback labels', () => {
    render(
      <ImageMasonry
        columnCount={1}
        images={[
          {
            aspectRatio: 1,
            caption: 'Untitled image',
            src: '/untitled.jpg',
          },
        ]}
      />,
    );

    expect(screen.getByAltText('')).toBeDefined();
    expect(screen.getByText('Untitled image')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('applies custom item semantics, styles, labels, and resize fallbacks', () => {
    render(
      <>
        <h2 id="gallery-heading">Gallery heading</h2>
        <ImageMasonry
          aria-labelledby="gallery-heading"
          className="gallery"
          defaultColumnCount={2}
          gap={20}
          images={images}
          itemClassName={({ index }) => (index === 0 ? 'featured' : undefined)}
          itemRole={null}
          itemStyle={({ index }) => (index === 0 ? { zIndex: 2 } : undefined)}
          maxColumnCount={2}
          role="grid"
          style={{ borderWidth: 1 }}
          renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
        />
      </>,
    );

    const root = screen.getByRole('grid', { name: 'Gallery heading' });
    expect(root.getAttribute('aria-label')).toBeNull();
    expect(root.className).toContain('gallery');
    expect(root.getAttribute('style')).toContain('border-width: 1px');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    const firstItem = screen.getByAltText('Harbor').closest('[data-index="0"]');
    expect(firstItem?.className).toContain('featured');
    expect(firstItem?.getAttribute('style')).toContain('z-index: 2');

    Object.defineProperty(root, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 640 }),
    });

    act(() => {
      resizeObserverCallbacks.get(root)?.([], {} as ResizeObserver);
    });

    expect(root.getAttribute('data-columns')).toBe('2');
  });
});
