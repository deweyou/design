import type { CSSProperties } from 'react';

export type MasonryItemLike = {
  aspectRatio?: number;
  height?: number;
  id?: string | number;
  width?: number;
};

export type MasonryLayoutItem<TItem extends MasonryItemLike> = {
  column: number;
  height: number;
  index: number;
  item: TItem;
  key: string | number;
  style: CSSProperties;
  width: number;
  x: number;
  y: number;
};

export type MasonryLayout<TItem extends MasonryItemLike> = {
  columnCount: number;
  columnHeights: number[];
  columnWidth: number;
  gap: number;
  items: MasonryLayoutItem<TItem>[];
  totalHeight: number;
};

export type ResolveMasonryColumnCountOptions = {
  columnCount?: number;
  containerWidth?: number;
  maxColumnCount?: number;
  minColumnWidth?: number;
};

export type BuildMasonryLayoutOptions<TItem extends MasonryItemLike> = {
  columnCount: number;
  containerWidth: number;
  gap?: number;
  getItemKey?: (item: TItem, index: number) => string | number;
  items: TItem[];
};

export type FindVisibleMasonryItemsOptions<TItem extends MasonryItemLike> = {
  items: MasonryLayoutItem<TItem>[];
  overscan?: number;
  scrollOffset: number;
  viewportHeight: number;
};

const DEFAULT_MIN_COLUMN_WIDTH = 240;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toSafePositiveNumber = (value: number | undefined, fallback: number) => {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return value;
};

export const resolveMasonryColumnCount = ({
  columnCount,
  containerWidth,
  maxColumnCount,
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
}: ResolveMasonryColumnCountOptions) => {
  const resolvedMaxColumnCount =
    maxColumnCount === undefined
      ? Number.POSITIVE_INFINITY
      : Math.max(1, Math.floor(maxColumnCount));

  if (columnCount !== undefined) {
    return clamp(Math.floor(columnCount), 1, resolvedMaxColumnCount);
  }

  const safeContainerWidth = toSafePositiveNumber(containerWidth, 0);
  const safeMinColumnWidth = toSafePositiveNumber(minColumnWidth, DEFAULT_MIN_COLUMN_WIDTH);

  if (safeContainerWidth <= 0) {
    return 1;
  }

  return clamp(Math.floor(safeContainerWidth / safeMinColumnWidth), 1, resolvedMaxColumnCount);
};

export const getMasonryItemAspectRatio = (item: MasonryItemLike) => {
  const explicitAspectRatio = toSafePositiveNumber(item.aspectRatio, 0);

  if (explicitAspectRatio > 0) {
    return explicitAspectRatio;
  }

  const width = toSafePositiveNumber(item.width, 0);
  const height = toSafePositiveNumber(item.height, 0);

  if (width > 0 && height > 0) {
    return width / height;
  }

  return 1;
};

export const buildMasonryLayout = <TItem extends MasonryItemLike>({
  columnCount,
  containerWidth,
  gap = 16,
  getItemKey = (item, index) => item.id ?? index,
  items,
}: BuildMasonryLayoutOptions<TItem>): MasonryLayout<TItem> => {
  const safeColumnCount = Math.max(1, Math.floor(columnCount));
  const safeGap = Math.max(0, gap);
  const safeContainerWidth = Math.max(0, containerWidth);
  const columnWidth = Math.max(
    0,
    (safeContainerWidth - safeGap * Math.max(0, safeColumnCount - 1)) / safeColumnCount,
  );
  const columnHeights = Array.from({ length: safeColumnCount }, () => 0);
  const layoutItems = items.map((item, index) => {
    const column = columnHeights.reduce((shortestColumn, columnHeight, columnIndex) => {
      if (columnHeight < (columnHeights[shortestColumn] ?? 0)) {
        return columnIndex;
      }

      return shortestColumn;
    }, 0);
    const x = column * (columnWidth + safeGap);
    const y = columnHeights[column] ?? 0;
    const key = getItemKey(item, index);
    const height = columnWidth / getMasonryItemAspectRatio(item);

    columnHeights[column] = y + height + safeGap;

    return {
      column,
      height,
      index,
      item,
      key,
      style: {
        height,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: columnWidth,
      },
      width: columnWidth,
      x,
      y,
    };
  });
  const totalHeight = Math.max(
    0,
    ...columnHeights.map((columnHeight) => Math.max(0, columnHeight - safeGap)),
  );

  return {
    columnCount: safeColumnCount,
    columnHeights,
    columnWidth,
    gap: safeGap,
    items: layoutItems,
    totalHeight,
  };
};

export const findVisibleMasonryItems = <TItem extends MasonryItemLike>({
  items,
  overscan = 0,
  scrollOffset,
  viewportHeight,
}: FindVisibleMasonryItemsOptions<TItem>) => {
  const visibleStart = Math.max(0, scrollOffset - overscan);
  const visibleEnd = Math.max(visibleStart, scrollOffset + viewportHeight + overscan);

  return items.filter((item) => item.y + item.height >= visibleStart && item.y <= visibleEnd);
};
