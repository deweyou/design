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
  resolveMasonryColumnCount,
  type MasonryLayoutItem,
} from '../image-masonry/layout.ts';
import type { ImageMasonryImage } from '../image-masonry/index.tsx';
import type {
  VirtualMasonryScrollAlign,
  VirtualMasonryScrollToIndexOptions,
} from '../virtual-masonry/index.tsx';
import styles from './index.module.less';
import { useGroupedVirtualMasonryLocaleText } from './locale/loader.ts';
import type { GroupedVirtualMasonryLocaleText } from './locale/types.ts';

export type GroupedVirtualMasonryGroup<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  images: TImage[];
  id?: string | number;
  title?: ReactNode;
};

export type GroupedVirtualMasonryHeaderDetails<
  TImage extends ImageMasonryImage = ImageMasonryImage,
> = {
  group: GroupedVirtualMasonryGroup<TImage>;
  groupIndex: number;
};

export type GroupedVirtualMasonryVirtualItem<TImage extends ImageMasonryImage = ImageMasonryImage> =
  MasonryLayoutItem<TImage> & {
    globalIndex: number;
    group: GroupedVirtualMasonryGroup<TImage>;
    groupIndex: number;
    imageIndex: number;
  };

export type GroupedVirtualMasonryRenderDetails<
  TImage extends ImageMasonryImage = ImageMasonryImage,
> = {
  globalIndex: number;
  group: GroupedVirtualMasonryGroup<TImage>;
  groupIndex: number;
  image: TImage;
  imageIndex: number;
  virtualItem: GroupedVirtualMasonryVirtualItem<TImage>;
};

export type GroupedVirtualMasonryClickDetails<
  TImage extends ImageMasonryImage = ImageMasonryImage,
> = {
  globalIndex: number;
  group: GroupedVirtualMasonryGroup<TImage>;
  groupIndex: number;
  image: TImage;
  imageIndex: number;
};

export type GroupedVirtualMasonryRangePosition =
  | {
      groupIndex: number;
      type: 'header';
    }
  | {
      groupIndex: number;
      imageIndex: number;
      type: 'item';
    };

export type GroupedVirtualMasonryRange = {
  end: GroupedVirtualMasonryRangePosition | null;
  overscanEnd: GroupedVirtualMasonryRangePosition | null;
  overscanStart: GroupedVirtualMasonryRangePosition | null;
  start: GroupedVirtualMasonryRangePosition | null;
};

export type GroupedVirtualMasonryRef = {
  getScrollOffset: () => number;
  scrollToGroup: (groupIndex: number, options?: VirtualMasonryScrollToIndexOptions) => void;
  scrollToItem: (
    groupIndex: number,
    imageIndex: number,
    options?: VirtualMasonryScrollToIndexOptions,
  ) => void;
  scrollToOffset: (offset: number) => void;
};

export type GroupedVirtualMasonryProps<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  groupHeaderHeight: number;
  groups: GroupedVirtualMasonryGroup<TImage>[];
  height: number | string;
  className?: string;
  columnCount?: number;
  defaultColumnCount?: number;
  defaultContainerWidth?: number;
  gap?: number;
  getGroupKey?: (group: GroupedVirtualMasonryGroup<TImage>, groupIndex: number) => string | number;
  getImageKey?: (
    image: TImage,
    imageIndex: number,
    group: GroupedVirtualMasonryGroup<TImage>,
    groupIndex: number,
  ) => string | number;
  groupGap?: number;
  groupHeaderClassName?:
    | string
    | ((details: GroupedVirtualMasonryHeaderDetails<TImage>) => string | undefined);
  groupHeaderRole?: string | null;
  groupHeaderStyle?:
    | CSSProperties
    | ((details: GroupedVirtualMasonryHeaderDetails<TImage>) => CSSProperties | undefined);
  itemClassName?:
    | string
    | ((details: GroupedVirtualMasonryRenderDetails<TImage>) => string | undefined);
  itemRole?: string | null;
  itemStyle?:
    | CSSProperties
    | ((details: GroupedVirtualMasonryRenderDetails<TImage>) => CSSProperties | undefined);
  maxColumnCount?: number;
  minColumnWidth?: number;
  onItemClick?: (details: GroupedVirtualMasonryClickDetails<TImage>) => void;
  onRangeChange?: (range: GroupedVirtualMasonryRange) => void;
  overscan?: number;
  renderGroupHeader?: (details: GroupedVirtualMasonryHeaderDetails<TImage>) => ReactNode;
  renderItem?: (details: GroupedVirtualMasonryRenderDetails<TImage>) => ReactNode;
  role?: string;
  style?: CSSProperties;
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  localeText?: Partial<GroupedVirtualMasonryLocaleText>;
};

type GroupedVirtualMasonryHeaderEntry<TImage extends ImageMasonryImage> = {
  group: GroupedVirtualMasonryGroup<TImage>;
  groupIndex: number;
  height: number;
  key: string;
  style: CSSProperties;
  type: 'header';
  y: number;
};

type GroupedVirtualMasonryItemEntry<TImage extends ImageMasonryImage> = {
  group: GroupedVirtualMasonryGroup<TImage>;
  groupIndex: number;
  height: number;
  imageIndex: number;
  key: string;
  type: 'item';
  virtualItem: GroupedVirtualMasonryVirtualItem<TImage>;
  y: number;
};

type GroupedVirtualMasonryEntry<TImage extends ImageMasonryImage> =
  | GroupedVirtualMasonryHeaderEntry<TImage>
  | GroupedVirtualMasonryItemEntry<TImage>;

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

const isRangePositionEqual = (
  current: GroupedVirtualMasonryRangePosition | null,
  next: GroupedVirtualMasonryRangePosition | null,
) => {
  if (!current || !next) {
    return current === next;
  }

  if (current.type !== next.type || current.groupIndex !== next.groupIndex) {
    return false;
  }

  if (current.type === 'header' && next.type === 'header') {
    return true;
  }

  if (current.type === 'item' && next.type === 'item') {
    return current.imageIndex === next.imageIndex;
  }

  return false;
};

const isRangeEqual = (
  current: GroupedVirtualMasonryRange | null,
  next: GroupedVirtualMasonryRange,
) =>
  !!current &&
  isRangePositionEqual(current.start, next.start) &&
  isRangePositionEqual(current.end, next.end) &&
  isRangePositionEqual(current.overscanStart, next.overscanStart) &&
  isRangePositionEqual(current.overscanEnd, next.overscanEnd);

const getScrollOffsetForEntry = ({
  align,
  currentOffset,
  entry,
  viewportHeight,
}: {
  align: VirtualMasonryScrollAlign;
  currentOffset: number;
  entry: { height: number; y: number };
  viewportHeight: number;
}) => {
  const entryEnd = entry.y + entry.height;

  if (align === 'center') {
    return entry.y - (viewportHeight - entry.height) / 2;
  }

  if (align === 'end') {
    return entryEnd - viewportHeight;
  }

  if (align === 'auto') {
    if (entry.y < currentOffset) {
      return entry.y;
    }

    if (entryEnd > currentOffset + viewportHeight) {
      return entryEnd - viewportHeight;
    }

    return currentOffset;
  }

  return entry.y;
};

const getEntryPosition = <TImage extends ImageMasonryImage>(
  entry: GroupedVirtualMasonryEntry<TImage> | undefined,
): GroupedVirtualMasonryRangePosition | null => {
  if (!entry) {
    return null;
  }

  if (entry.type === 'header') {
    return { groupIndex: entry.groupIndex, type: 'header' };
  }

  return {
    groupIndex: entry.groupIndex,
    imageIndex: entry.imageIndex,
    type: 'item',
  };
};

const findVisibleEntries = <TImage extends ImageMasonryImage>({
  entries,
  overscan = 0,
  scrollOffset,
  viewportHeight,
}: {
  entries: GroupedVirtualMasonryEntry<TImage>[];
  overscan?: number;
  scrollOffset: number;
  viewportHeight: number;
}) => {
  const visibleStart = Math.max(0, scrollOffset - overscan);
  const visibleEnd = Math.max(visibleStart, scrollOffset + viewportHeight + overscan);

  return entries.filter((entry) => entry.y + entry.height >= visibleStart && entry.y <= visibleEnd);
};

const renderDefaultHeader = <TImage extends ImageMasonryImage>(
  { group, groupIndex }: GroupedVirtualMasonryHeaderDetails<TImage>,
  localeText: GroupedVirtualMasonryLocaleText,
) => (
  <span className={styles.headerContent}>
    {group.title ?? group.id ?? localeText.defaultGroup(groupIndex + 1)}
  </span>
);

const renderDefaultItem = <TImage extends ImageMasonryImage>({
  details,
  localeText,
  onItemClick,
}: {
  details: GroupedVirtualMasonryRenderDetails<TImage>;
  localeText: GroupedVirtualMasonryLocaleText;
  onItemClick?: (details: GroupedVirtualMasonryClickDetails<TImage>) => void;
}) => {
  const imageNode = (
    <img
      alt={details.image.alt ?? ''}
      className={styles.defaultImage}
      decoding="async"
      loading="lazy"
      src={details.image.src}
    />
  );

  if (!onItemClick) {
    return imageNode;
  }

  return (
    <button
      aria-label={localeText.previewImage(details.image.alt ?? details.globalIndex + 1)}
      className={styles.defaultButton}
      onClick={() =>
        onItemClick({
          globalIndex: details.globalIndex,
          group: details.group,
          groupIndex: details.groupIndex,
          image: details.image,
          imageIndex: details.imageIndex,
        })
      }
      type="button"
    >
      {imageNode}
    </button>
  );
};

export const GroupedVirtualMasonry = forwardRef<
  GroupedVirtualMasonryRef,
  GroupedVirtualMasonryProps
>(
  (
    {
      groupHeaderHeight,
      groups,
      height,
      className,
      columnCount,
      defaultColumnCount,
      defaultContainerWidth,
      gap = DEFAULT_GAP,
      getGroupKey,
      getImageKey,
      groupGap,
      groupHeaderClassName,
      groupHeaderRole,
      groupHeaderStyle,
      itemClassName,
      itemRole,
      itemStyle,
      maxColumnCount,
      minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
      onItemClick,
      onRangeChange,
      overscan = 240,
      renderGroupHeader,
      renderItem,
      role = 'list',
      style,
      viewportClassName,
      viewportStyle,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      localeText,
    },
    ref,
  ) => {
    const text = useGroupedVirtualMasonryLocaleText(localeText);
    const viewportRef = useRef<HTMLDivElement>(null);
    const lastRangeRef = useRef<GroupedVirtualMasonryRange | null>(null);
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
    const layout = useMemo(() => {
      const entries: GroupedVirtualMasonryEntry<ImageMasonryImage>[] = [];
      const safeGroupHeaderHeight = Math.max(0, groupHeaderHeight);
      const safeGroupGap = Math.max(0, groupGap ?? gap);
      let offsetY = 0;
      let globalIndex = 0;

      groups.forEach((group, groupIndex) => {
        const groupKey = String(getGroupKey?.(group, groupIndex) ?? group.id ?? groupIndex);
        const headerY = offsetY;

        entries.push({
          group,
          groupIndex,
          height: safeGroupHeaderHeight,
          key: `header:${groupKey}`,
          style: {
            height: safeGroupHeaderHeight,
            transform: `translate3d(0px, ${headerY}px, 0)`,
            width: layoutContainerWidth,
          },
          type: 'header',
          y: headerY,
        });

        const masonryLayout = buildMasonryLayout({
          columnCount: measuredColumnCount,
          containerWidth: layoutContainerWidth,
          gap,
          getItemKey: (image, imageIndex) =>
            getImageKey?.(image, imageIndex, group, groupIndex) ?? image.id ?? imageIndex,
          items: group.images,
        });
        const contentY = headerY + safeGroupHeaderHeight;

        masonryLayout.items.forEach((layoutItem) => {
          const imageIndex = layoutItem.index;
          const itemY = contentY + layoutItem.y;
          const virtualItem = {
            ...layoutItem,
            globalIndex,
            group,
            groupIndex,
            imageIndex,
            style: {
              ...layoutItem.style,
              transform: `translate3d(${layoutItem.x}px, ${itemY}px, 0)`,
            },
            y: itemY,
          };

          entries.push({
            group,
            groupIndex,
            height: virtualItem.height,
            imageIndex,
            key: `item:${groupKey}:${layoutItem.key}`,
            type: 'item',
            virtualItem,
            y: itemY,
          });
          globalIndex += 1;
        });

        offsetY = contentY + masonryLayout.totalHeight;

        if (groupIndex < groups.length - 1) {
          offsetY += safeGroupGap;
        }
      });

      return {
        columnCount: measuredColumnCount,
        entries,
        totalHeight: offsetY,
        totalImageCount: globalIndex,
      };
    }, [
      gap,
      getGroupKey,
      getImageKey,
      groupGap,
      groupHeaderHeight,
      groups,
      layoutContainerWidth,
      measuredColumnCount,
    ]);
    const viewportHeight = getViewportHeight(height, viewportRef.current);
    const visibleEntries = useMemo(
      () =>
        findVisibleEntries({
          entries: layout.entries,
          scrollOffset,
          viewportHeight,
        }),
      [layout.entries, scrollOffset, viewportHeight],
    );
    const overscannedEntries = useMemo(
      () =>
        findVisibleEntries({
          entries: layout.entries,
          overscan,
          scrollOffset,
          viewportHeight,
        }),
      [layout.entries, overscan, scrollOffset, viewportHeight],
    );
    const range = useMemo(
      () => ({
        end: getEntryPosition(visibleEntries.at(-1)),
        overscanEnd: getEntryPosition(overscannedEntries.at(-1)),
        overscanStart: getEntryPosition(overscannedEntries[0]),
        start: getEntryPosition(visibleEntries[0]),
      }),
      [overscannedEntries, visibleEntries],
    );

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

    const scrollToEntry = useCallback(
      (
        entry: { height: number; y: number } | undefined,
        options?: VirtualMasonryScrollToIndexOptions,
      ) => {
        if (!entry) {
          return;
        }

        const nextOffset =
          getScrollOffsetForEntry({
            align: options?.align ?? 'start',
            currentOffset: scrollOffset,
            entry,
            viewportHeight,
          }) - (options?.offset ?? 0);

        scrollToOffset(nextOffset);
      },
      [scrollOffset, scrollToOffset, viewportHeight],
    );

    const scrollToGroup = useCallback(
      (groupIndex: number, options?: VirtualMasonryScrollToIndexOptions) => {
        const safeGroupIndex = clamp(groupIndex, 0, Math.max(0, groups.length - 1));
        const headerEntry = layout.entries.find(
          (entry) => entry.type === 'header' && entry.groupIndex === safeGroupIndex,
        );

        scrollToEntry(headerEntry, options);
      },
      [groups.length, layout.entries, scrollToEntry],
    );

    const scrollToItem = useCallback(
      (groupIndex: number, imageIndex: number, options?: VirtualMasonryScrollToIndexOptions) => {
        const safeGroupIndex = clamp(groupIndex, 0, Math.max(0, groups.length - 1));
        const group = groups[safeGroupIndex];
        const safeImageIndex = clamp(imageIndex, 0, Math.max(0, (group?.images.length ?? 0) - 1));
        const itemEntry = layout.entries.find(
          (entry) =>
            entry.type === 'item' &&
            entry.groupIndex === safeGroupIndex &&
            entry.imageIndex === safeImageIndex,
        );

        scrollToEntry(itemEntry, options);
      },
      [groups, layout.entries, scrollToEntry],
    );

    useImperativeHandle(
      ref,
      () => ({
        getScrollOffset: readScrollOffset,
        scrollToGroup,
        scrollToItem,
        scrollToOffset,
      }),
      [readScrollOffset, scrollToGroup, scrollToItem, scrollToOffset],
    );

    useEffect(() => {
      if (!onRangeChange || isRangeEqual(lastRangeRef.current, range)) {
        return;
      }

      lastRangeRef.current = range;
      onRangeChange(range);
    }, [onRangeChange, range]);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      setScrollOffset(event.currentTarget.scrollTop);
    };

    const renderHeader = (entry: GroupedVirtualMasonryHeaderEntry<ImageMasonryImage>) => {
      const details = {
        group: entry.group,
        groupIndex: entry.groupIndex,
      };
      const resolvedClassName =
        typeof groupHeaderClassName === 'function'
          ? groupHeaderClassName(details)
          : groupHeaderClassName;
      const resolvedStyle =
        typeof groupHeaderStyle === 'function' ? groupHeaderStyle(details) : groupHeaderStyle;
      const resolvedRole = groupHeaderRole === undefined ? 'presentation' : groupHeaderRole;

      return (
        <div
          key={entry.key}
          className={classNames(styles.header, resolvedClassName)}
          data-group-index={entry.groupIndex}
          role={resolvedRole ?? undefined}
          style={{ ...entry.style, ...resolvedStyle }}
        >
          {renderGroupHeader ? renderGroupHeader(details) : renderDefaultHeader(details, text)}
        </div>
      );
    };

    const renderMasonryItem = (entry: GroupedVirtualMasonryItemEntry<ImageMasonryImage>) => {
      const { virtualItem } = entry;
      const details = {
        globalIndex: virtualItem.globalIndex,
        group: virtualItem.group,
        groupIndex: virtualItem.groupIndex,
        image: virtualItem.item,
        imageIndex: virtualItem.imageIndex,
        virtualItem,
      };
      const resolvedClassName =
        typeof itemClassName === 'function' ? itemClassName(details) : itemClassName;
      const resolvedStyle = typeof itemStyle === 'function' ? itemStyle(details) : itemStyle;
      const resolvedRole =
        itemRole === undefined ? (role === 'list' ? 'listitem' : undefined) : itemRole;

      return (
        <div
          key={entry.key}
          aria-posinset={resolvedRole === 'listitem' ? virtualItem.globalIndex + 1 : undefined}
          aria-setsize={resolvedRole === 'listitem' ? layout.totalImageCount : undefined}
          className={classNames(styles.item, resolvedClassName)}
          data-column={virtualItem.column}
          data-global-index={virtualItem.globalIndex}
          data-group-index={virtualItem.groupIndex}
          data-index={virtualItem.imageIndex}
          role={resolvedRole ?? undefined}
          style={{ ...virtualItem.style, ...resolvedStyle }}
        >
          {renderItem
            ? renderItem(details)
            : renderDefaultItem({
                details,
                localeText: text,
                onItemClick,
              })}
        </div>
      );
    };

    return (
      <ScrollArea.Root
        className={classNames(styles.root, className)}
        data-columns={layout.columnCount}
        data-testid="grouped-virtual-masonry"
        style={{ ...style, height }}
      >
        <ScrollArea.Viewport
          ref={viewportRef}
          aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? text.groupedVirtualMasonry)}
          aria-labelledby={ariaLabelledBy}
          className={classNames(styles.viewport, viewportClassName)}
          data-testid="grouped-virtual-masonry-viewport"
          onScroll={handleScroll}
          role={role}
          style={viewportStyle}
        >
          <div className={styles.spacer} style={{ height: layout.totalHeight }}>
            {overscannedEntries.map((entry) =>
              entry.type === 'header' ? renderHeader(entry) : renderMasonryItem(entry),
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  },
);

GroupedVirtualMasonry.displayName = 'GroupedVirtualMasonry';

export type { GroupedVirtualMasonryLocaleText } from './locale/types.ts';
