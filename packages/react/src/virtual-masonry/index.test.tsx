// @vitest-environment jsdom

import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { VirtualMasonry, type VirtualMasonryRef } from './index.tsx';

type ResizeObserverCallbackMap = Map<Element, ResizeObserverCallback>;

const resizeObserverCallbacks: ResizeObserverCallbackMap = new Map();

const images = Array.from({ length: 60 }, (_, index) => ({
  alt: `Photo ${index + 1}`,
  height: 100,
  id: `photo-${index + 1}`,
  src: `/photo-${index + 1}.jpg`,
  width: 200,
}));

beforeEach(() => {
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  }

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

const flushResize = (element: Element, width: number, height = 240) => {
  resizeObserverCallbacks.get(element)?.(
    [
      {
        contentRect: {
          bottom: height,
          height,
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

describe('VirtualMasonry', () => {
  it('renders only visible masonry items', () => {
    render(
      <VirtualMasonry
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        height={240}
        images={images}
        overscan={0}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    expect(screen.getByRole('list', { name: 'Virtual masonry' })).toBeDefined();
    expect(screen.getByAltText('Photo 1')).toBeDefined();
    expect(screen.getByAltText('Photo 4')).toBeDefined();
    expect(screen.queryByAltText('Photo 20')).toBeNull();
  });

  it('updates the visible range when the internal viewport scrolls', () => {
    const onRangeChange = vi.fn();

    render(
      <VirtualMasonry
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        height={240}
        images={images}
        onRangeChange={onRangeChange}
        overscan={0}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const viewport = screen.getByTestId('virtual-masonry-viewport');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 360 });
    fireEvent.scroll(viewport);

    expect(screen.queryByAltText('Photo 1')).toBeNull();
    expect(screen.getByAltText('Photo 7')).toBeDefined();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      endIndex: 11,
      overscanEndIndex: 11,
      overscanStartIndex: 6,
      startIndex: 6,
    });
  });

  it('scrolls to an item and offset through the ref api', () => {
    const ref = createRef<VirtualMasonryRef>();

    render(
      <VirtualMasonry
        ref={ref}
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        height={240}
        images={images}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    act(() => {
      ref.current?.scrollToIndex(12);
    });

    expect(screen.getByTestId('virtual-masonry-viewport').scrollTop).toBe(720);

    act(() => {
      ref.current?.scrollToOffset(88);
    });

    expect(screen.getByTestId('virtual-masonry-viewport').scrollTop).toBe(88);
    expect(ref.current?.getScrollOffset()).toBe(88);
  });

  it('supports centered, end, and automatic scroll alignment through the ref api', () => {
    const ref = createRef<VirtualMasonryRef>();

    render(
      <VirtualMasonry
        ref={ref}
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        height={240}
        images={images}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const viewport = screen.getByTestId('virtual-masonry-viewport');

    act(() => {
      ref.current?.scrollToIndex(12, { align: 'center', offset: 10 });
    });

    expect(viewport.scrollTop).toBe(640);

    act(() => {
      ref.current?.scrollToIndex(12, { align: 'end' });
    });

    expect(viewport.scrollTop).toBe(580);

    act(() => {
      ref.current?.scrollToOffset(700);
    });

    act(() => {
      ref.current?.scrollToIndex(12, { align: 'auto' });
    });

    expect(viewport.scrollTop).toBe(700);

    act(() => {
      ref.current?.scrollToIndex(0, { align: 'auto' });
    });

    expect(viewport.scrollTop).toBe(0);
  });

  it('updates responsive columns from viewport ResizeObserver changes', () => {
    render(
      <VirtualMasonry
        defaultContainerWidth={220}
        gap={20}
        height={240}
        images={images}
        minColumnWidth={200}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const root = screen.getByTestId('virtual-masonry');
    const viewport = screen.getByTestId('virtual-masonry-viewport');
    expect(root.getAttribute('data-columns')).toBe('1');

    act(() => {
      flushResize(viewport, 640);
    });

    expect(root.getAttribute('data-columns')).toBe('3');
  });

  it('renders default clickable items with custom viewport semantics and styles', () => {
    const onItemClick = vi.fn();

    render(
      <>
        <h2 id="virtual-gallery-heading">Virtual gallery</h2>
        <VirtualMasonry
          aria-labelledby="virtual-gallery-heading"
          className="virtual-root"
          columnCount={2}
          defaultContainerWidth={420}
          gap={20}
          height="240px"
          images={[{ height: 100, src: '/fallback.jpg', width: 200 }, ...images.slice(1, 6)]}
          itemClassName={({ index }) => (index === 0 ? 'virtual-featured' : undefined)}
          itemRole={null}
          itemStyle={({ index }) => (index === 0 ? { opacity: 0.8 } : undefined)}
          onItemClick={onItemClick}
          overscan={0}
          role="grid"
          style={{ borderWidth: 1 }}
          viewportClassName="virtual-viewport"
          viewportStyle={{ maxHeight: 240 }}
        />
      </>,
    );

    const root = screen.getByTestId('virtual-masonry');
    const viewport = screen.getByRole('grid', { name: 'Virtual gallery' });
    expect(root.className).toContain('virtual-root');
    expect(root.getAttribute('style')).toContain('border-width: 1px');
    expect(viewport.className).toContain('virtual-viewport');
    expect(viewport.getAttribute('style')).toContain('max-height: 240px');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    const button = screen.getByRole('button', { name: 'Preview 1' });
    fireEvent.click(button);

    expect(onItemClick).toHaveBeenCalledWith({
      image: { height: 100, src: '/fallback.jpg', width: 200 },
      index: 0,
    });
    expect(button.closest('[data-index="0"]')?.className).toContain('virtual-featured');
    expect(button.closest('[data-index="0"]')?.getAttribute('style')).toContain('opacity: 0.8');
  });

  it('handles empty image lists and ignores missing scroll targets', () => {
    const ref = createRef<VirtualMasonryRef>();
    const onRangeChange = vi.fn();

    render(
      <VirtualMasonry
        ref={ref}
        columnCount={2}
        defaultContainerWidth={420}
        height={240}
        images={[]}
        onRangeChange={onRangeChange}
      />,
    );

    act(() => {
      ref.current?.scrollToIndex(4);
      ref.current?.scrollToOffset(120);
    });

    expect(screen.getByTestId('virtual-masonry-viewport').scrollTop).toBe(0);
    expect(onRangeChange).toHaveBeenCalledWith({
      endIndex: 0,
      overscanEndIndex: 0,
      overscanStartIndex: 0,
      startIndex: 0,
    });
  });
});
