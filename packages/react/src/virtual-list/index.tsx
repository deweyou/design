import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
} from 'react';
import classNames from 'classnames';

import { ScrollArea } from '../scroll-area/index.tsx';
import styles from './index.module.less';

export type VirtualItem = {
  index: number;
  key: string | number;
  start: number;
  end: number;
  size: number;
  style: CSSProperties;
};

export type VirtualListRenderDetails = {
  index: number;
  virtualItem: VirtualItem;
};

export type VirtualListScrollAlign = 'start' | 'center' | 'end' | 'auto';

export type VirtualListRef = {
  scrollToIndex: (index: number, options?: { align?: VirtualListScrollAlign }) => void;
  scrollToOffset: (offset: number) => void;
  getScrollOffset: () => number;
};

export type VirtualListProps = {
  count: number;
  estimateSize: (index: number) => number;
  renderItem: (details: VirtualListRenderDetails) => ReactNode;
  height: number | string;
  overscan?: number;
  getItemKey?: (index: number) => string | number;
  className?: string;
  style?: CSSProperties;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

type SizeMap = {
  starts: number[];
  sizes: number[];
  totalSize: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const buildSizeMap = (count: number, estimateSize: (index: number) => number): SizeMap => {
  const starts: number[] = [];
  const sizes: number[] = [];
  let totalSize = 0;

  for (let index = 0; index < count; index += 1) {
    const size = Math.max(0, estimateSize(index));
    starts.push(totalSize);
    sizes.push(size);
    totalSize += size;
  }

  return { starts, sizes, totalSize };
};

const findStartIndex = (starts: number[], sizes: number[], offset: number) => {
  let low = 0;
  let high = starts.length - 1;
  let match = 0;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const start = starts[middle] ?? 0;
    const end = start + (sizes[middle] ?? 0);

    if (end <= offset) {
      low = middle + 1;
    } else {
      match = middle;
      high = middle - 1;
    }
  }

  return match;
};

const getViewportHeight = (height: number | string, viewport: HTMLDivElement | null) => {
  if (typeof height === 'number') {
    return height;
  }

  return viewport?.clientHeight ?? 0;
};

const getScrollOffsetForIndex = ({
  align,
  index,
  sizeMap,
  viewportSize,
  currentOffset,
}: {
  align: VirtualListScrollAlign;
  index: number;
  sizeMap: SizeMap;
  viewportSize: number;
  currentOffset: number;
}) => {
  const itemStart = sizeMap.starts[index] ?? 0;
  const itemSize = sizeMap.sizes[index] ?? 0;
  const itemEnd = itemStart + itemSize;

  if (align === 'center') {
    return itemStart - (viewportSize - itemSize) / 2;
  }

  if (align === 'end') {
    return itemEnd - viewportSize;
  }

  if (align === 'auto') {
    if (itemStart < currentOffset) {
      return itemStart;
    }

    if (itemEnd > currentOffset + viewportSize) {
      return itemEnd - viewportSize;
    }

    return currentOffset;
  }

  return itemStart;
};

export const VirtualList = forwardRef<VirtualListRef, VirtualListProps>(
  (
    {
      count,
      estimateSize,
      renderItem,
      height,
      overscan = 2,
      getItemKey = (index) => index,
      className,
      style,
      viewportClassName,
      viewportStyle,
      role = 'list',
      'aria-label': ariaLabel = 'Virtualized list',
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const sizeMap = useMemo(() => buildSizeMap(count, estimateSize), [count, estimateSize]);
    const viewportSize = getViewportHeight(height, viewportRef.current);

    const scrollToOffset = useCallback(
      (offset: number) => {
        const viewport = viewportRef.current;
        const maxOffset = Math.max(0, sizeMap.totalSize - viewportSize);
        const nextOffset = clamp(offset, 0, maxOffset);

        if (viewport) {
          viewport.scrollTop = nextOffset;
        }

        setScrollOffset(nextOffset);
      },
      [sizeMap.totalSize, viewportSize],
    );

    const scrollToIndex = useCallback(
      (index: number, options?: { align?: VirtualListScrollAlign }) => {
        const safeIndex = clamp(index, 0, Math.max(0, count - 1));
        const nextOffset = getScrollOffsetForIndex({
          align: options?.align ?? 'start',
          index: safeIndex,
          sizeMap,
          viewportSize,
          currentOffset: scrollOffset,
        });

        scrollToOffset(nextOffset);
      },
      [count, scrollOffset, scrollToOffset, sizeMap, viewportSize],
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex,
        scrollToOffset,
        getScrollOffset: () => viewportRef.current?.scrollTop ?? scrollOffset,
      }),
      [scrollOffset, scrollToIndex, scrollToOffset],
    );

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      setScrollOffset(event.currentTarget.scrollTop);
    };

    const startIndex =
      count === 0 ? 0 : findStartIndex(sizeMap.starts, sizeMap.sizes, scrollOffset);
    let endIndex = startIndex;
    const visibleEnd = scrollOffset + viewportSize;

    while (endIndex < count - 1 && (sizeMap.starts[endIndex] ?? 0) < visibleEnd) {
      endIndex += 1;
    }

    const renderStart = clamp(startIndex - overscan, 0, Math.max(0, count - 1));
    const renderEnd = clamp(endIndex + overscan, 0, Math.max(0, count - 1));
    const virtualItems: VirtualItem[] = [];

    for (let index = renderStart; index <= renderEnd && count > 0; index += 1) {
      const start = sizeMap.starts[index] ?? 0;
      const size = sizeMap.sizes[index] ?? 0;

      virtualItems.push({
        index,
        key: getItemKey(index),
        start,
        end: start + size,
        size,
        style: {
          height: size,
          transform: `translateY(${start}px)`,
        },
      });
    }

    return (
      <ScrollArea.Root
        className={classNames(styles.root, className)}
        style={{ ...style, height }}
        data-testid="virtual-list"
      >
        <ScrollArea.Viewport
          ref={viewportRef}
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={classNames(styles.viewport, viewportClassName)}
          data-testid="virtual-list-viewport"
          onScroll={handleScroll}
          role={role}
          style={viewportStyle}
        >
          <div className={styles.spacer} style={{ height: sizeMap.totalSize }}>
            {virtualItems.map((virtualItem) => (
              <div
                key={virtualItem.key}
                aria-posinset={role === 'list' ? virtualItem.index + 1 : undefined}
                aria-setsize={role === 'list' ? count : undefined}
                className={styles.item}
                role={role === 'list' ? 'listitem' : undefined}
                style={virtualItem.style}
              >
                {renderItem({ index: virtualItem.index, virtualItem })}
              </div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  },
);

VirtualList.displayName = 'VirtualList';
