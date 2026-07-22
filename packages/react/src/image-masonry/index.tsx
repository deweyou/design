import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import classNames from 'classnames';

import { buildMasonryLayout, resolveMasonryColumnCount, type MasonryLayoutItem } from './layout.ts';
import styles from './index.module.less';
import { useImageMasonryLocaleText } from './locale/loader.ts';
import type { ImageMasonryLocaleText } from './locale/types.ts';

export type ImageMasonryImageGeometry =
  | {
      aspectRatio: number;
      height?: number;
      width?: number;
    }
  | {
      aspectRatio?: number;
      height: number;
      width: number;
    };

export type ImageMasonryImage = ImageMasonryImageGeometry & {
  alt?: string;
  caption?: ReactNode;
  id?: string | number;
  src: string;
};

export type ImageMasonryClickDetails<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  image: TImage;
  index: number;
};

export type ImageMasonryRenderDetails<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  image: TImage;
  index: number;
  layoutItem: MasonryLayoutItem<TImage>;
};

export type ImageMasonryProps<TImage extends ImageMasonryImage = ImageMasonryImage> = {
  images: TImage[];
  className?: string;
  columnCount?: number;
  defaultColumnCount?: number;
  defaultContainerWidth?: number;
  gap?: number;
  getImageKey?: (image: TImage, index: number) => string | number;
  itemClassName?: string | ((details: ImageMasonryRenderDetails<TImage>) => string | undefined);
  itemRole?: string | null;
  itemStyle?:
    | CSSProperties
    | ((details: ImageMasonryRenderDetails<TImage>) => CSSProperties | undefined);
  maxColumnCount?: number;
  minColumnWidth?: number;
  onItemClick?: (details: ImageMasonryClickDetails<TImage>) => void;
  renderItem?: (details: ImageMasonryRenderDetails<TImage>) => ReactNode;
  role?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  localeText?: Partial<ImageMasonryLocaleText>;
};

const DEFAULT_GAP = 16;
const DEFAULT_MIN_COLUMN_WIDTH = 240;

const canUseDOM = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const useIsomorphicLayoutEffect = canUseDOM() ? useLayoutEffect : useEffect;

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

const renderDefaultItem = <TImage extends ImageMasonryImage>({
  image,
  index,
  localeText,
  onItemClick,
}: {
  image: TImage;
  index: number;
  localeText: ImageMasonryLocaleText;
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
  const captionNode = image.caption ? (
    <span className={styles.caption}>{image.caption}</span>
  ) : null;

  if (!onItemClick) {
    return (
      <>
        {imageNode}
        {captionNode}
      </>
    );
  }

  return (
    <button
      aria-label={localeText.previewImage(image.alt ?? index + 1)}
      className={styles.defaultButton}
      onClick={() => onItemClick({ image, index })}
      type="button"
    >
      {imageNode}
      {captionNode}
    </button>
  );
};

export const ImageMasonry = <TImage extends ImageMasonryImage = ImageMasonryImage>({
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
  renderItem,
  role = 'list',
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  localeText,
}: ImageMasonryProps<TImage>) => {
  const text = useImageMasonryLocaleText(localeText);
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(defaultContainerWidth ?? 0);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;

    if (!root || !canUseDOM() || typeof ResizeObserver === 'undefined') {
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
      updateWidth(entries[0]?.contentRect.width ?? root.getBoundingClientRect().width);
    });

    observer.observe(root);
    updateWidth(root.getBoundingClientRect().width);

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
  const renderItems = () =>
    layout.items.map((layoutItem) => {
      const details = {
        image: layoutItem.item,
        index: layoutItem.index,
        layoutItem,
      };
      const resolvedClassName =
        typeof itemClassName === 'function' ? itemClassName(details) : itemClassName;
      const resolvedStyle = typeof itemStyle === 'function' ? itemStyle(details) : itemStyle;
      const resolvedRole =
        itemRole === undefined ? (role === 'list' ? 'listitem' : undefined) : itemRole;

      return (
        <div
          key={layoutItem.key}
          aria-posinset={resolvedRole === 'listitem' ? layoutItem.index + 1 : undefined}
          aria-setsize={resolvedRole === 'listitem' ? images.length : undefined}
          className={classNames(styles.item, resolvedClassName)}
          data-column={layoutItem.column}
          data-index={layoutItem.index}
          role={resolvedRole ?? undefined}
          style={{ ...layoutItem.style, ...resolvedStyle }}
        >
          {renderItem
            ? renderItem(details)
            : renderDefaultItem({
                image: layoutItem.item,
                index: layoutItem.index,
                localeText: text,
                onItemClick,
              })}
        </div>
      );
    });

  return (
    <div
      ref={rootRef}
      aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? text.imageMasonry)}
      aria-labelledby={ariaLabelledBy}
      className={classNames(styles.root, className)}
      data-columns={layout.columnCount}
      data-testid="image-masonry"
      role={role}
      style={style}
    >
      <div className={styles.spacer} style={{ height: layout.totalHeight }}>
        {renderItems()}
      </div>
    </div>
  );
};

export type { ImageMasonryLocaleText } from './locale/types.ts';
