import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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
  measureRef: (node: HTMLElement | null) => void;
};

export type VirtualListScrollAlign = 'start' | 'center' | 'end' | 'auto';

export type VirtualListScrollElement = 'window' | HTMLElement | (() => HTMLElement | null);

export type VirtualListRange = {
  startIndex: number;
  endIndex: number;
  overscanStartIndex: number;
  overscanEndIndex: number;
};

export type VirtualListScrollToIndexOptions = {
  align?: VirtualListScrollAlign;
  offset?: number;
};

export type VirtualListRef = {
  scrollToIndex: (index: number, options?: VirtualListScrollToIndexOptions) => void;
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
  scrollElement?: VirtualListScrollElement;
  scrollMargin?: number;
  onRangeChange?: (range: VirtualListRange) => void;
  itemClassName?: string | ((details: VirtualListRenderDetails) => string | undefined);
  itemStyle?: CSSProperties | ((details: VirtualListRenderDetails) => CSSProperties | undefined);
  itemRole?: string | null;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

type SizeMap = {
  starts: number[];
  sizes: number[];
  totalSize: number;
};

type PendingScrollTarget = {
  align: VirtualListScrollAlign;
  correctionCount: number;
  index: number;
  offset: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const buildSizeMap = (
  count: number,
  estimateSize: (index: number) => number,
  measuredSizes: Record<number, number>,
): SizeMap => {
  const starts: number[] = [];
  const sizes: number[] = [];
  let totalSize = 0;

  for (let index = 0; index < count; index += 1) {
    const measuredSize = measuredSizes[index];
    const size = Math.max(0, measuredSize ?? estimateSize(index));
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

const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;

type BrowserWindow = Window & typeof globalThis;

type ResolvedScrollElement = BrowserWindow | HTMLElement | null;

const resolveScrollElement = (
  scrollElement: VirtualListScrollElement | undefined,
): ResolvedScrollElement => {
  if (!scrollElement) {
    return null;
  }

  if (scrollElement === 'window') {
    return canUseDOM() ? window : null;
  }

  if (typeof scrollElement === 'function') {
    return scrollElement();
  }

  return scrollElement;
};

const isWindowScrollElement = (scrollOwner: ResolvedScrollElement): scrollOwner is BrowserWindow =>
  canUseDOM() && scrollOwner === window;

const getElementScrollOffset = ({
  root,
  scrollOwner,
  scrollMargin,
}: {
  root: HTMLElement | null;
  scrollOwner: ResolvedScrollElement;
  scrollMargin: number;
}) => {
  if (!root || !scrollOwner) {
    return 0;
  }

  if (isWindowScrollElement(scrollOwner)) {
    return Math.max(0, -root.getBoundingClientRect().top + scrollMargin);
  }

  const ownerRect = scrollOwner.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();

  return Math.max(0, scrollOwner.scrollTop - (rootRect.top - ownerRect.top) + scrollMargin);
};

const getScrollOwnerViewportSize = ({
  height,
  scrollOwner,
  viewport,
}: {
  height: number | string;
  scrollOwner: ResolvedScrollElement;
  viewport: HTMLDivElement | null;
}) => {
  if (!scrollOwner) {
    return getViewportHeight(height, viewport);
  }

  if (isWindowScrollElement(scrollOwner)) {
    return window.innerHeight;
  }

  return scrollOwner.clientHeight;
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
      scrollElement,
      scrollMargin = 0,
      onRangeChange,
      itemClassName,
      itemStyle,
      itemRole,
      'aria-label': ariaLabel = 'Virtualized list',
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [measuredSizes, setMeasuredSizes] = useState<Record<number, number>>({});
    const observedElementsRef = useRef<Map<Element, ResizeObserver>>(new Map());
    const itemElementsRef = useRef<Map<number, HTMLDivElement>>(new Map());
    const measureRefCacheRef = useRef<Map<number, (node: HTMLElement | null) => void>>(new Map());
    const lastRangeRef = useRef<VirtualListRange | null>(null);
    const pendingScrollTargetRef = useRef<PendingScrollTarget | null>(null);
    const scrollOwner = resolveScrollElement(scrollElement);
    const isInternalScroll = !scrollElement;
    const sizeMap = useMemo(
      () => buildSizeMap(count, estimateSize, measuredSizes),
      [count, estimateSize, measuredSizes],
    );
    const viewportSize = getScrollOwnerViewportSize({
      height,
      scrollOwner,
      viewport: viewportRef.current,
    });

    const updateMeasuredSize = useCallback((index: number, node: HTMLElement) => {
      const nextSize = node.getBoundingClientRect().height;

      if (!Number.isFinite(nextSize) || nextSize <= 0) {
        return;
      }

      setMeasuredSizes((currentSizes) => {
        const currentSize = currentSizes[index];

        if (currentSize !== undefined && Math.abs(currentSize - nextSize) < 0.5) {
          return currentSizes;
        }

        return { ...currentSizes, [index]: nextSize };
      });
    }, []);

    const createMeasureRef = useCallback(
      (index: number) => {
        const cachedMeasureRef = measureRefCacheRef.current.get(index);

        if (cachedMeasureRef) {
          return cachedMeasureRef;
        }

        const measureRef = (node: HTMLElement | null) => {
          if (!node) {
            return;
          }

          updateMeasuredSize(index, node);

          if (!canUseDOM() || typeof ResizeObserver === 'undefined') {
            return;
          }

          const observedElements = observedElementsRef.current;

          if (observedElements.has(node)) {
            return;
          }

          const observer = new ResizeObserver(() => {
            updateMeasuredSize(index, node);
          });

          observer.observe(node);
          observedElements.set(node, observer);
        };

        measureRefCacheRef.current.set(index, measureRef);

        return measureRef;
      },
      [updateMeasuredSize],
    );

    useEffect(
      () => () => {
        observedElementsRef.current.forEach((observer) => {
          observer.disconnect();
        });
        observedElementsRef.current.clear();
        measureRefCacheRef.current.clear();
      },
      [],
    );

    const readScrollOffset = useCallback(() => {
      if (isInternalScroll) {
        return (viewportRef.current?.scrollTop ?? 0) + scrollMargin;
      }

      return getElementScrollOffset({
        root: rootRef.current,
        scrollOwner,
        scrollMargin,
      });
    }, [isInternalScroll, scrollMargin, scrollOwner]);

    useEffect(() => {
      if (isInternalScroll || !scrollOwner) {
        return undefined;
      }

      const handleOwnerScroll = () => {
        setScrollOffset(readScrollOffset());
      };

      handleOwnerScroll();
      scrollOwner.addEventListener('scroll', handleOwnerScroll, { passive: true });
      window.addEventListener('resize', handleOwnerScroll);

      return () => {
        scrollOwner.removeEventListener('scroll', handleOwnerScroll);
        window.removeEventListener('resize', handleOwnerScroll);
      };
    }, [isInternalScroll, readScrollOffset, scrollOwner]);

    const scrollToOffset = useCallback(
      (offset: number) => {
        const maxOffset = Math.max(0, sizeMap.totalSize - viewportSize);
        const nextOffset = clamp(offset, 0, maxOffset);
        const ownerOffset = Math.max(0, nextOffset - scrollMargin);

        if (isInternalScroll) {
          const viewport = viewportRef.current;

          if (viewport) {
            viewport.scrollTop = ownerOffset;
          }

          setScrollOffset(ownerOffset + scrollMargin);
          return;
        }

        if (!rootRef.current || !scrollOwner) {
          setScrollOffset(nextOffset);
          return;
        }

        if (isWindowScrollElement(scrollOwner)) {
          const rootTop = rootRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: rootTop + ownerOffset });
        } else {
          const ownerRect = scrollOwner.getBoundingClientRect();
          const rootRect = rootRef.current.getBoundingClientRect();
          scrollOwner.scrollTop =
            scrollOwner.scrollTop + (rootRect.top - ownerRect.top) + ownerOffset;
        }

        setScrollOffset(nextOffset);
      },
      [isInternalScroll, scrollMargin, scrollOwner, sizeMap.totalSize, viewportSize],
    );

    const scrollToIndex = useCallback(
      (index: number, options?: VirtualListScrollToIndexOptions) => {
        const safeIndex = clamp(index, 0, Math.max(0, count - 1));
        pendingScrollTargetRef.current = {
          align: options?.align ?? 'start',
          correctionCount: 0,
          index: safeIndex,
          offset: options?.offset ?? 0,
        };
        const nextOffset = getScrollOffsetForIndex({
          align: options?.align ?? 'start',
          index: safeIndex,
          sizeMap,
          viewportSize,
          currentOffset: scrollOffset,
        });

        scrollToOffset(nextOffset - (options?.offset ?? 0));
      },
      [count, scrollOffset, scrollToOffset, sizeMap, viewportSize],
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex,
        scrollToOffset,
        getScrollOffset: () => readScrollOffset(),
      }),
      [readScrollOffset, scrollToIndex, scrollToOffset],
    );

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      setScrollOffset(event.currentTarget.scrollTop + scrollMargin);
    };

    const startIndex =
      count === 0 ? 0 : findStartIndex(sizeMap.starts, sizeMap.sizes, scrollOffset);
    let endIndex = startIndex;
    const visibleEnd = scrollOffset + viewportSize;

    while (endIndex < count - 1 && (sizeMap.starts[endIndex + 1] ?? 0) < visibleEnd) {
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
          minHeight: size,
          transform: `translateY(${start}px)`,
        },
      });
    }

    useEffect(() => {
      if (!onRangeChange) {
        return;
      }

      const lastRange = lastRangeRef.current;

      if (
        lastRange?.startIndex === startIndex &&
        lastRange.endIndex === endIndex &&
        lastRange.overscanStartIndex === renderStart &&
        lastRange.overscanEndIndex === renderEnd
      ) {
        return;
      }

      const range: VirtualListRange = {
        startIndex,
        endIndex,
        overscanStartIndex: renderStart,
        overscanEndIndex: renderEnd,
      };

      lastRangeRef.current = range;
      onRangeChange(range);
    }, [endIndex, onRangeChange, renderEnd, renderStart, startIndex]);

    useIsomorphicLayoutEffect(() => {
      const pendingScrollTarget = pendingScrollTargetRef.current;

      if (!pendingScrollTarget || pendingScrollTarget.align !== 'start') {
        return;
      }

      const targetElement = itemElementsRef.current.get(pendingScrollTarget.index);

      if (!targetElement) {
        return;
      }

      let viewportTop = 0;

      if (isInternalScroll) {
        const viewportElement = viewportRef.current;

        if (!viewportElement) {
          return;
        }

        viewportTop = viewportElement.getBoundingClientRect().top;
      } else if (!isWindowScrollElement(scrollOwner)) {
        if (!scrollOwner) {
          return;
        }

        viewportTop = scrollOwner.getBoundingClientRect().top;
      }

      const targetInset = targetElement.getBoundingClientRect().top - viewportTop;
      const expectedInset = scrollMargin + pendingScrollTarget.offset;
      const delta = targetInset - expectedInset;
      const isTargetMeasured = measuredSizes[pendingScrollTarget.index] !== undefined;

      if (Math.abs(delta) <= 1) {
        if (isTargetMeasured) {
          pendingScrollTargetRef.current = null;
        }

        return;
      }

      if (pendingScrollTarget.correctionCount >= 4) {
        pendingScrollTargetRef.current = null;
        return;
      }

      pendingScrollTargetRef.current = {
        ...pendingScrollTarget,
        correctionCount: pendingScrollTarget.correctionCount + 1,
      };
      scrollToOffset(readScrollOffset() + delta);
    }, [
      isInternalScroll,
      measuredSizes,
      readScrollOffset,
      renderEnd,
      renderStart,
      scrollMargin,
      scrollOwner,
      scrollToOffset,
    ]);

    const renderItems = () =>
      virtualItems.map((virtualItem) => {
        const measureRef = createMeasureRef(virtualItem.index);
        const details = { index: virtualItem.index, measureRef, virtualItem };
        const resolvedItemClassName =
          typeof itemClassName === 'function' ? itemClassName(details) : itemClassName;
        const resolvedItemStyle = typeof itemStyle === 'function' ? itemStyle(details) : itemStyle;
        const resolvedItemRole =
          itemRole === undefined ? (role === 'list' ? 'listitem' : undefined) : itemRole;

        return (
          <div
            ref={(node) => {
              if (node) {
                itemElementsRef.current.set(virtualItem.index, node);
              } else {
                itemElementsRef.current.delete(virtualItem.index);
              }

              measureRef(node);
            }}
            key={virtualItem.key}
            aria-posinset={resolvedItemRole === 'listitem' ? virtualItem.index + 1 : undefined}
            aria-setsize={resolvedItemRole === 'listitem' ? count : undefined}
            className={classNames(styles.item, resolvedItemClassName)}
            data-index={virtualItem.index}
            role={resolvedItemRole ?? undefined}
            style={{ ...virtualItem.style, ...resolvedItemStyle }}
          >
            {renderItem(details)}
          </div>
        );
      });

    const spacer = (
      <div className={styles.spacer} style={{ height: sizeMap.totalSize }}>
        {renderItems()}
      </div>
    );

    if (!isInternalScroll) {
      return (
        <div
          ref={rootRef}
          className={classNames(styles.root, className)}
          style={{ ...style, height: sizeMap.totalSize }}
          data-testid="virtual-list"
        >
          <div
            ref={viewportRef}
            aria-label={ariaLabelledBy ? undefined : ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className={classNames(styles.viewport, viewportClassName)}
            data-testid="virtual-list-viewport"
            role={role}
            style={viewportStyle}
          >
            {spacer}
          </div>
        </div>
      );
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
          {spacer}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  },
);

VirtualList.displayName = 'VirtualList';
