// @vitest-environment jsdom

import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { GroupedVirtualMasonry, type GroupedVirtualMasonryRef } from './index.tsx';

type ResizeObserverCallbackMap = Map<Element, ResizeObserverCallback>;

const resizeObserverCallbacks: ResizeObserverCallbackMap = new Map();

const createImages = (group: string, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    alt: `${group} Photo ${index + 1}`,
    height: 100,
    id: `${group}-${index + 1}`,
    src: `/${group}-${index + 1}.jpg`,
    width: 200,
  }));

const groups = [
  {
    id: 'today',
    images: createImages('Today', 12),
    title: 'Today',
  },
  {
    id: 'yesterday',
    images: createImages('Yesterday', 12),
    title: 'Yesterday',
  },
];

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

describe('GroupedVirtualMasonry', () => {
  it('renders visible group headers and masonry items', () => {
    render(
      <GroupedVirtualMasonry
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        groupHeaderHeight={40}
        groups={groups}
        height={240}
        overscan={0}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    expect(screen.getByRole('list', { name: 'Grouped virtual masonry' })).toBeDefined();
    expect(screen.getByText('Today')).toBeDefined();
    expect(screen.getByAltText('Today Photo 1')).toBeDefined();
    expect(screen.getByAltText('Today Photo 4')).toBeDefined();
    expect(screen.queryByText('Yesterday')).toBeNull();
    expect(screen.queryByAltText('Yesterday Photo 1')).toBeNull();
  });

  it('updates range positions when the internal viewport scrolls', () => {
    const onRangeChange = vi.fn();

    render(
      <GroupedVirtualMasonry
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        groupHeaderHeight={40}
        groups={groups}
        height={240}
        onRangeChange={onRangeChange}
        overscan={0}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const viewport = screen.getByTestId('grouped-virtual-masonry-viewport');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 760 });
    fireEvent.scroll(viewport);

    expect(screen.queryByText('Today')).toBeNull();
    expect(screen.getByText('Yesterday')).toBeDefined();
    expect(screen.getByAltText('Yesterday Photo 1')).toBeDefined();
    expect(onRangeChange).toHaveBeenLastCalledWith({
      end: { groupIndex: 1, imageIndex: 3, type: 'item' },
      overscanEnd: { groupIndex: 1, imageIndex: 3, type: 'item' },
      overscanStart: { groupIndex: 1, type: 'header' },
      start: { groupIndex: 1, type: 'header' },
    });
  });

  it('scrolls to groups, items, and offsets through the ref api', () => {
    const ref = createRef<GroupedVirtualMasonryRef>();

    render(
      <GroupedVirtualMasonry
        ref={ref}
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        groupHeaderHeight={40}
        groups={groups}
        height={200}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    act(() => {
      ref.current?.scrollToGroup(1);
    });

    expect(screen.getByTestId('grouped-virtual-masonry-viewport').scrollTop).toBe(760);

    act(() => {
      ref.current?.scrollToItem(1, 4);
    });

    expect(screen.getByTestId('grouped-virtual-masonry-viewport').scrollTop).toBe(1040);

    act(() => {
      ref.current?.scrollToOffset(88);
    });

    expect(screen.getByTestId('grouped-virtual-masonry-viewport').scrollTop).toBe(88);
    expect(ref.current?.getScrollOffset()).toBe(88);
  });

  it('supports centered, end, and automatic group scroll alignment', () => {
    const ref = createRef<GroupedVirtualMasonryRef>();

    render(
      <GroupedVirtualMasonry
        ref={ref}
        columnCount={2}
        defaultContainerWidth={420}
        gap={20}
        groupHeaderHeight={40}
        groups={groups}
        height={200}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const viewport = screen.getByTestId('grouped-virtual-masonry-viewport');

    act(() => {
      ref.current?.scrollToGroup(1, { align: 'center' });
    });

    expect(viewport.scrollTop).toBe(680);

    act(() => {
      ref.current?.scrollToGroup(1, { align: 'end' });
    });

    expect(viewport.scrollTop).toBe(600);

    act(() => {
      ref.current?.scrollToOffset(700);
    });

    act(() => {
      ref.current?.scrollToGroup(1, { align: 'auto' });
    });

    expect(viewport.scrollTop).toBe(700);

    act(() => {
      ref.current?.scrollToGroup(0, { align: 'auto' });
    });

    expect(viewport.scrollTop).toBe(0);
  });

  it('updates responsive columns from viewport ResizeObserver changes', () => {
    render(
      <GroupedVirtualMasonry
        defaultContainerWidth={220}
        gap={20}
        groupHeaderHeight={40}
        groups={groups}
        height={240}
        minColumnWidth={200}
        renderItem={({ image }) => <img alt={image.alt} src={image.src} />}
      />,
    );

    const root = screen.getByTestId('grouped-virtual-masonry');
    const viewport = screen.getByTestId('grouped-virtual-masonry-viewport');
    expect(root.getAttribute('data-columns')).toBe('1');

    act(() => {
      flushResize(viewport, 640);
    });

    expect(root.getAttribute('data-columns')).toBe('3');
  });

  it('renders JSX titles and default header fallbacks', () => {
    render(
      <GroupedVirtualMasonry
        columnCount={2}
        defaultContainerWidth={420}
        groupHeaderHeight={40}
        groups={[
          {
            id: 'archive',
            images: [],
          },
          {
            images: [],
            title: <strong>JSX title</strong>,
          },
          {
            images: [],
          },
        ]}
        height={240}
        overscan={1000}
      />,
    );

    expect(screen.getByText('archive')).toBeDefined();
    expect(screen.getByText('JSX title')).toBeDefined();
    expect(screen.getByText('Group 3')).toBeDefined();
  });

  it('applies custom header and item rendering contracts', () => {
    const onItemClick = vi.fn();
    const customGroups = [
      {
        images: [
          {
            height: 100,
            src: '/first.jpg',
            width: 200,
          },
        ],
        title: <span>Custom group</span>,
      },
    ];

    render(
      <>
        <h2 id="grouped-heading">Grouped gallery</h2>
        <GroupedVirtualMasonry
          aria-labelledby="grouped-heading"
          className="grouped-root"
          columnCount={1}
          defaultContainerWidth={200}
          groupGap={-8}
          groupHeaderClassName={({ groupIndex }) =>
            groupIndex === 0 ? 'custom-header' : undefined
          }
          groupHeaderHeight={40}
          groupHeaderRole={null}
          groupHeaderStyle={() => ({ zIndex: 3 })}
          groups={customGroups}
          height={200}
          itemClassName={({ globalIndex }) => (globalIndex === 0 ? 'custom-item' : undefined)}
          itemRole={null}
          itemStyle={() => ({ opacity: 0.9 })}
          onItemClick={onItemClick}
          overscan={1000}
          renderGroupHeader={({ group }) => <span>{group.title}</span>}
          role="grid"
          style={{ borderWidth: 1 }}
          viewportClassName="grouped-viewport"
          viewportStyle={{ maxHeight: 200 }}
        />
      </>,
    );

    const root = screen.getByTestId('grouped-virtual-masonry');
    const viewport = screen.getByRole('grid', { name: 'Grouped gallery' });
    expect(root.className).toContain('grouped-root');
    expect(root.getAttribute('style')).toContain('border-width: 1px');
    expect(viewport.className).toContain('grouped-viewport');
    expect(viewport.getAttribute('style')).toContain('max-height: 200px');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    const header = screen.getByText('Custom group').closest('[data-group-index="0"]');
    expect(header?.className).toContain('custom-header');
    expect(header?.getAttribute('role')).toBeNull();
    expect(header?.getAttribute('style')).toContain('z-index: 3');

    const button = screen.getByRole('button', { name: 'Preview 1' });
    fireEvent.click(button);

    expect(onItemClick).toHaveBeenCalledWith({
      globalIndex: 0,
      group: customGroups[0],
      groupIndex: 0,
      image: customGroups[0]?.images[0],
      imageIndex: 0,
    });
    expect(button.closest('[data-global-index="0"]')?.className).toContain('custom-item');
    expect(button.closest('[data-global-index="0"]')?.getAttribute('style')).toContain(
      'opacity: 0.9',
    );
  });

  it('reports empty ranges once and ignores missing group targets', () => {
    const ref = createRef<GroupedVirtualMasonryRef>();
    const onRangeChange = vi.fn();

    render(
      <GroupedVirtualMasonry
        ref={ref}
        columnCount={2}
        defaultContainerWidth={420}
        groupHeaderHeight={40}
        groups={[]}
        height={240}
        onRangeChange={onRangeChange}
      />,
    );

    expect(onRangeChange).toHaveBeenCalledWith({
      end: null,
      overscanEnd: null,
      overscanStart: null,
      start: null,
    });

    const viewport = screen.getByTestId('grouped-virtual-masonry-viewport');

    act(() => {
      ref.current?.scrollToGroup(2);
      ref.current?.scrollToItem(2, 4);
      ref.current?.scrollToOffset(120);
    });

    fireEvent.scroll(viewport);

    expect(viewport.scrollTop).toBe(0);
    expect(onRangeChange).toHaveBeenCalledTimes(1);
  });
});
