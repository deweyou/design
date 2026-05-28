// @vitest-environment jsdom

import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { VirtualList, type VirtualListRef } from './index.tsx';

type ResizeObserverCallbackMap = Map<Element, ResizeObserverCallback>;

const resizeObserverCallbacks: ResizeObserverCallbackMap = new Map();

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

const setElementHeight = (element: Element, height: number) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      bottom: height,
      height,
      left: 0,
      right: 0,
      top: 0,
      width: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    }),
  });
};

const flushResize = (element: Element) => {
  resizeObserverCallbacks.get(element)?.([], {} as ResizeObserver);
};

describe('VirtualList', () => {
  it('renders only the visible items plus overscan', () => {
    render(
      <VirtualList
        count={100}
        estimateSize={() => 20}
        height={100}
        overscan={1}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    expect(screen.getByText('Row 0')).toBeDefined();
    expect(screen.getByText('Row 5')).toBeDefined();
    expect(screen.queryByText('Row 20')).toBeNull();
  });

  it('updates the visible range when scrolling', () => {
    render(
      <VirtualList
        count={100}
        estimateSize={() => 20}
        height={100}
        overscan={0}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    const viewport = screen.getByTestId('virtual-list-viewport');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 200 });
    fireEvent.scroll(viewport);

    expect(screen.getByText('Row 10')).toBeDefined();
    expect(screen.queryByText('Row 0')).toBeNull();
  });

  it('renders ScrollArea-aligned scrollbar parts', () => {
    render(
      <VirtualList
        count={20}
        estimateSize={() => 20}
        height={100}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    expect(document.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it('exposes list semantics for virtualized rows by default', () => {
    render(
      <VirtualList
        count={20}
        estimateSize={() => 20}
        height={100}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    expect(screen.getByRole('list', { name: 'Virtualized list' })).toBeDefined();
    expect(screen.getAllByRole('listitem')[0]?.getAttribute('aria-posinset')).toBe('1');
    expect(screen.getAllByRole('listitem')[0]?.getAttribute('aria-setsize')).toBe('20');
  });

  it('scrolls to a specific item and offset through the ref api', () => {
    const ref = createRef<VirtualListRef>();
    render(
      <VirtualList
        ref={ref}
        count={100}
        estimateSize={() => 20}
        height={100}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    ref.current?.scrollToIndex(12);
    expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(240);

    ref.current?.scrollToOffset(88);
    expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(88);
  });

  it('updates item positions from measured heights and resize observer changes', () => {
    render(
      <VirtualList
        count={4}
        estimateSize={() => 20}
        height={120}
        overscan={0}
        renderItem={({ index, measureRef }) => (
          <article ref={measureRef} data-testid={`article-${index}`}>
            Article {index}
          </article>
        )}
      />,
    );

    const firstArticle = screen.getByTestId('article-0');
    setElementHeight(firstArticle, 80);

    act(() => {
      flushResize(firstArticle);
    });

    const secondWrapper = screen.getByText('Article 1').closest('[data-index="1"]');
    expect(secondWrapper?.getAttribute('style')).toContain('translateY(80px)');

    setElementHeight(firstArticle, 100);

    act(() => {
      flushResize(firstArticle);
    });

    expect(secondWrapper?.getAttribute('style')).toContain('translateY(100px)');
  });

  it('uses window as the scroll owner and reports visible range changes', () => {
    const onRangeChange = vi.fn();
    const originalScrollY = window.scrollY;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });

    render(
      <VirtualList
        count={20}
        estimateSize={() => 50}
        height={100}
        onRangeChange={onRangeChange}
        overscan={1}
        renderItem={({ index }) => <div>Row {index}</div>}
        scrollElement="window"
      />,
    );

    Object.defineProperty(screen.getByTestId('virtual-list'), 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        bottom: 1000,
        height: 1000,
        left: 0,
        right: 200,
        top: -120,
        width: 200,
        x: 0,
        y: -120,
        toJSON: () => {},
      }),
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.getByText('Row 2')).toBeDefined();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      endIndex: 4,
      overscanEndIndex: 5,
      overscanStartIndex: 1,
      startIndex: 2,
    });

    Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
  });

  it('applies scroll margin and per-call offset when scrolling to an index', () => {
    const ref = createRef<VirtualListRef>();

    render(
      <VirtualList
        ref={ref}
        count={100}
        estimateSize={() => 20}
        height={100}
        renderItem={({ index }) => <div>Row {index}</div>}
        scrollMargin={32}
      />,
    );

    ref.current?.scrollToIndex(12, { offset: 8 });

    expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(200);
  });

  it('realigns a pending scroll target after dynamic measurement reveals drift', () => {
    const ref = createRef<VirtualListRef>();

    render(
      <VirtualList
        ref={ref}
        count={100}
        estimateSize={() => 20}
        height={100}
        overscan={2}
        renderItem={({ index }) => <div>Row {index}</div>}
      />,
    );

    act(() => {
      ref.current?.scrollToIndex(40);
    });

    const viewport = screen.getByTestId('virtual-list-viewport');
    const targetWrapper = screen.getByText('Row 40').closest('[data-index="40"]');

    expect(viewport.scrollTop).toBe(800);
    expect(targetWrapper).toBeTruthy();

    Object.defineProperty(viewport, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        bottom: 100,
        height: 100,
        left: 0,
        right: 200,
        top: 0,
        width: 200,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
    });
    Object.defineProperty(targetWrapper, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        bottom: 104,
        height: 32,
        left: 0,
        right: 200,
        top: 72,
        width: 200,
        x: 0,
        y: 72,
        toJSON: () => {},
      }),
    });

    act(() => {
      flushResize(targetWrapper as Element);
    });

    expect(viewport.scrollTop).toBe(872);
  });

  it('allows item wrapper role and class customization', () => {
    render(
      <VirtualList
        count={5}
        estimateSize={() => 20}
        height={100}
        itemClassName={({ index }) => `timeline-entry timeline-entry-${index}`}
        itemRole={null}
        renderItem={({ index, measureRef }) => (
          <article ref={measureRef} id={`note-${index}`}>
            Note {index}
          </article>
        )}
      />,
    );

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText('Note 0').closest('[data-index="0"]')?.className).toContain(
      'timeline-entry-0',
    );
  });
});
