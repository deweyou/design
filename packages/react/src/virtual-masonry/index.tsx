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
import {
  buildMasonryLayout,
  findVisibleMasonryItems,
  resolveMasonryColumnCount,
  type MasonryLayoutItem,
} from '../image-masonry/layout.ts';
import type { ImageMasonryClickDetails, ImageMasonryImage } from '../image-masonry/index.tsx';
import styles from './index.module.less';

export type VirtualMasonryRenderDetails<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  image: TImage;
  index: number;
  virtualItem: MasonryLayoutItem<TImage>;
};

export type VirtualMasonryRange = {
  endIndex: number;
  overscanEndIndex: number;
  overscanStartIndex: number;
  startIndex: number;
};

export type VirtualMasonryScrollAlign = 'start' | 'center' | 'end' | 'auto';

export type VirtualMasonryScrollToIndexOptions = {
  align?: VirtualMasonryScrollAlign;
  offset?: number;
};

export type VirtualMasonryRef = {
  getScrollOffset: () => number;
  scrollToIndex: (index: number, options?: VirtualMasonryScrollToIndexOptions) => void;
  scrollToOffset: (offset: number) => void;
};

export type VirtualMasonryProps<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  height: number | string;
  images: TImage[];
  className?: string;
  columnCount?: number;
  defaultColumnCount?: number;
  defaultContainerWidth?: number;
  gap?: number;
  getImageKey?: (image: TImage, index: number) => string | number;
  itemClassName?: string | ((details: VirtualMasonryRenderDetails<TImage>) => string | undefined);
  itemRole?: string | null;
  itemStyle?:
    | CSSProperties
    | ((details: VirtualMasonryRenderDetails<TImage>) => CSSProperties | undefined);
  maxColumnCount?: number;
  minColumnWidth?: number;
  onItemClick?: (details: ImageMasonryClickDetails<TImage>) => void;
  onRangeChange?: (range: VirtualMasonryRange) => void;
  overscan?: number;
  renderItem?: (details: VirtualMasonryRenderDetails<TImage>) => ReactNode;
  role?: string;
  style?: CSSProperties;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

const DEFAULT_GAP = 16;
const DEFAULT_MIN_COLUMN_WIDTH = 240;

const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getViewportHeight = (height: number | string, viewport: HTMLDivElement | null) => {
  if (typeof height === 'number') {
    return height;
  }

  return viewport?.clientHeight ?? 0;
};

const getFallbackWidth = ({
  columnCount,
  defaultContainerWidth,
  gap,
  minColumnWidth,
}: {
  columnCount: number;
  defaultContainerWidth?: number;
  gap: number;
  minColumnWidth: number;
}) => {
  if (defaultContainerWidth !== undefined && defaultContainerWidth > 0) {
    return defaultContainerWidth;
  }

  return columnCount * minColumnWidth + Math.max(0, columnCount - 1) * gap;
};

const getScrollOffsetForItem = <TImage extends ImageMasonryImage>({
  align,
  currentOffset,
  item,
  viewportHeight,
}: {
  align: VirtualMasonryScrollAlign;
  currentOffset: number;
  item: MasonryLayoutItem<TImage>;
  viewportHeight: number;
}) => {
  const itemEnd = item.y + item.height;

  if (align === 'center') {
    return item.y - (viewportHeight - item.height) / 2;
  }

  if (align === 'end') {
    return itemEnd - viewportHeight;
  }

  if (align === 'auto') {
    if (item.y < currentOffset) {
      return item.y;
    }

    if (itemEnd > currentOffset + viewportHeight) {
      return itemEnd - viewportHeight;
    }

    return currentOffset;
  }

  return item.y;
};

const renderDefaultItem = <TImage extends ImageMasonryImage>({
  image,
  index,
  onItemClick,
}: {
  image: TImage;
  index: number;
  onItemClick?: (details: ImageMasonryClickDetails<TImage>) => void;
}) => {
  const imageNode = (
    <img
      alt={image.alt ?? ''}
      className={styles.defaultImage}
      decoding="async"
      loading="lazy"
      src={image.src}
    />
  );

  if (!onItemClick) {
    return imageNode;
  }

  return (
    <button
      aria-label={`Preview ${image.alt ?? index + 1}`}
      className={styles.defaultButton}
      onClick={() => onItemClick({ image, index })}
      type="button"
    >
      {imageNode}
    </button>
  );
};

export const VirtualMasonry = forwardRef<VirtualMasonryRef, VirtualMasonryProps>(
  (
    {
      height,
      images,
      className,
      columnCount,
      defaultColumnCount,
      defaultContainerWidth,
      gap = DEFAULT_GAP,
      getImageKey,
      itemClassName,
      itemRole,
      itemStyle,
      maxColumnCount,
      minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
      onItemClick,
      onRangeChange,
      overscan = 240,
      renderItem,
      role = 'list',
      style,
      viewportClassName,
      viewportStyle,
      'aria-label': ariaLabel = 'Virtual masonry',
      'aria-labelledby': ariaLabelledBy,
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const lastRangeRef = useRef<VirtualMasonryRange | null>(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [containerWidth, setContainerWidth] = useState(defaultContainerWidth ?? 0);

    useIsomorphicLayoutEffect(() => {
      const viewport = viewportRef.current;

      if (!viewport || !canUseDOM() || typeof ResizeObserver === 'undefined') {
        return undefined;
      }

      const updateWidth = (width: number) => {
        if (!Number.isFinite(width) || width <= 0) {
          return;
        }

        setContainerWidth((currentWidth) =>
          Math.abs(currentWidth - width) < 0.5 ? currentWidth : width,
        );
      };
      const observer = new ResizeObserver((entries) => {
        updateWidth(entries[0]?.contentRect.width ?? viewport.getBoundingClientRect().width);
      });

      observer.observe(viewport);
      updateWidth(viewport.getBoundingClientRect().width);

      return () => {
        observer.disconnect();
      };
    }, []);

    const measuredColumnCount = resolveMasonryColumnCount({
      columnCount: containerWidth > 0 ? columnCount : (columnCount ?? defaultColumnCount),
      containerWidth,
      maxColumnCount,
      minColumnWidth,
    });
    const layoutContainerWidth =
      containerWidth > 0
        ? containerWidth
        : getFallbackWidth({
            columnCount: measuredColumnCount,
            defaultContainerWidth,
            gap,
            minColumnWidth,
          });
    const layout = useMemo(
      () =>
        buildMasonryLayout({
          columnCount: measuredColumnCount,
          containerWidth: layoutContainerWidth,
          gap,
          getItemKey: getImageKey,
          items: images,
        }),
      [gap, getImageKey, images, layoutContainerWidth, measuredColumnCount],
    );
    const viewportHeight = getViewportHeight(height, viewportRef.current);
    const visibleItems = findVisibleMasonryItems({
      items: layout.items,
      overscan,
      scrollOffset,
      viewportHeight,
    });
    const startIndex =
      visibleItems.length > 0 ? Math.min(...visibleItems.map((item) => item.index)) : 0;
    const endIndex =
      visibleItems.length > 0 ? Math.max(...visibleItems.map((item) => item.index)) : 0;

    const readScrollOffset = useCallback(
      () => viewportRef.current?.scrollTop ?? scrollOffset,
      [scrollOffset],
    );

    const scrollToOffset = useCallback(
      (offset: number) => {
        const viewport = viewportRef.current;
        const maxOffset = Math.max(0, layout.totalHeight - viewportHeight);
        const nextOffset = clamp(offset, 0, maxOffset);

        if (viewport) {
          viewport.scrollTop = nextOffset;
        }

        setScrollOffset(nextOffset);
      },
      [layout.totalHeight, viewportHeight],
    );

    const scrollToIndex = useCallback(
      (index: number, options?: VirtualMasonryScrollToIndexOptions) => {
        const safeIndex = clamp(index, 0, Math.max(0, images.length - 1));
        const item = layout.items.find((layoutItem) => layoutItem.index === safeIndex);

        if (!item) {
          return;
        }

        const nextOffset =
          getScrollOffsetForItem({
            align: options?.align ?? 'start',
            currentOffset: scrollOffset,
            item,
            viewportHeight,
          }) - (options?.offset ?? 0);

        scrollToOffset(nextOffset);
      },
      [images.length, layout.items, scrollOffset, scrollToOffset, viewportHeight],
    );

    useImperativeHandle(
      ref,
      () => ({
        getScrollOffset: readScrollOffset,
        scrollToIndex,
        scrollToOffset,
      }),
      [readScrollOffset, scrollToIndex, scrollToOffset],
    );

    useEffect(() => {
      if (!onRangeChange) {
        return;
      }

      const range = {
        endIndex,
        overscanEndIndex: endIndex,
        overscanStartIndex: startIndex,
        startIndex,
      };
      const lastRange = lastRangeRef.current;

      if (
        lastRange?.startIndex === range.startIndex &&
        lastRange.endIndex === range.endIndex &&
        lastRange.overscanStartIndex === range.overscanStartIndex &&
        lastRange.overscanEndIndex === range.overscanEndIndex
      ) {
        return;
      }

      lastRangeRef.current = range;
      onRangeChange(range);
    }, [endIndex, onRangeChange, startIndex]);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      setScrollOffset(event.currentTarget.scrollTop);
    };

    const renderItems = () =>
      visibleItems.map((virtualItem) => {
        const details = {
          image: virtualItem.item,
          index: virtualItem.index,
          virtualItem,
        };
        const resolvedClassName =
          typeof itemClassName === 'function' ? itemClassName(details) : itemClassName;
        const resolvedStyle = typeof itemStyle === 'function' ? itemStyle(details) : itemStyle;
        const resolvedRole =
          itemRole === undefined ? (role === 'list' ? 'listitem' : undefined) : itemRole;

        return (
          <div
            key={virtualItem.key}
            aria-posinset={resolvedRole === 'listitem' ? virtualItem.index + 1 : undefined}
            aria-setsize={resolvedRole === 'listitem' ? images.length : undefined}
            className={classNames(styles.item, resolvedClassName)}
            data-column={virtualItem.column}
            data-index={virtualItem.index}
            role={resolvedRole ?? undefined}
            style={{ ...virtualItem.style, ...resolvedStyle }}
          >
            {renderItem
              ? renderItem(details)
              : renderDefaultItem({
                  image: virtualItem.item,
                  index: virtualItem.index,
                  onItemClick,
                })}
          </div>
        );
      });

    return (
      <ScrollArea.Root
        className={classNames(styles.root, className)}
        data-columns={layout.columnCount}
        data-testid="virtual-masonry"
        style={{ ...style, height }}
      >
        <ScrollArea.Viewport
          ref={viewportRef}
          aria-label={ariaLabelledBy ? undefined : ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={classNames(styles.viewport, viewportClassName)}
          data-testid="virtual-masonry-viewport"
          onScroll={handleScroll}
          role={role}
          style={viewportStyle}
        >
          <div className={styles.spacer} style={{ height: layout.totalHeight }}>
            {renderItems()}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  },
);

VirtualMasonry.displayName = 'VirtualMasonry';
