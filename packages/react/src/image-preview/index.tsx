import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RefreshIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@deweyou-design/react-icons';

import { IconButton } from '../button/index.tsx';
import { Dialog } from '../dialog/index.tsx';
import styles from './index.module.less';
import { useImagePreviewLocaleText } from './locale/loader.ts';
import type { ImagePreviewLocaleText } from './locale/types.ts';

export type ImagePreviewImage = {
  alt?: string;
  caption?: ReactNode;
  src: string;
  title?: string;
};

export type ImagePreviewIndexChangeDetails = {
  image: ImagePreviewImage | undefined;
  index: number;
  previousIndex: number;
};

export type ImagePreviewProps = {
  images: ImagePreviewImage[];
  currentIndex?: number;
  defaultIndex?: number;
  defaultOpen?: boolean;
  defaultZoom?: number;
  maxZoom?: number;
  minZoom?: number;
  onIndexChange?: (details: ImagePreviewIndexChangeDetails) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  trigger?: ReactNode;
  zoomStep?: number;
  'aria-label'?: string;
  localeText?: Partial<ImagePreviewLocaleText>;
};

type TriggerElementProps = {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getSafeIndex = (index: number, imageCount: number) =>
  clamp(Math.floor(index), 0, Math.max(0, imageCount - 1));

export const ImagePreview = ({
  images,
  currentIndex,
  defaultIndex = 0,
  defaultOpen = false,
  defaultZoom = 1,
  maxZoom = 4,
  minZoom = 0.25,
  onIndexChange,
  onOpenChange,
  open,
  trigger,
  zoomStep = 0.25,
  'aria-label': ariaLabel,
  localeText,
}: ImagePreviewProps) => {
  const text = useImagePreviewLocaleText(localeText);
  const isOpenControlled = open !== undefined;
  const isIndexControlled = currentIndex !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [zoom, setZoom] = useState(defaultZoom);
  const imageCount = images.length;
  const currentOpen = isOpenControlled ? open : uncontrolledOpen;
  const activeIndex = getSafeIndex(
    isIndexControlled ? currentIndex : uncontrolledIndex,
    imageCount,
  );
  const activeImage = images[activeIndex];
  const canGoPrevious = imageCount > 1 && activeIndex > 0;
  const canGoNext = imageCount > 1 && activeIndex < imageCount - 1;
  const safeMinZoom = Math.min(minZoom, maxZoom);
  const safeMaxZoom = Math.max(minZoom, maxZoom);
  const safeDefaultZoom = useMemo(
    () => clamp(defaultZoom, safeMinZoom, safeMaxZoom),
    [defaultZoom, safeMaxZoom, safeMinZoom],
  );

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isOpenControlled, onOpenChange],
  );

  const setIndex = useCallback(
    (nextIndex: number) => {
      const safeIndex = getSafeIndex(nextIndex, imageCount);
      const previousIndex = activeIndex;

      if (safeIndex === previousIndex) {
        return;
      }

      if (!isIndexControlled) {
        setUncontrolledIndex(safeIndex);
      }

      onIndexChange?.({
        image: images[safeIndex],
        index: safeIndex,
        previousIndex,
      });
    },
    [activeIndex, imageCount, images, isIndexControlled, onIndexChange],
  );

  const zoomBy = useCallback(
    (delta: number) => {
      setZoom((currentZoom) => clamp(currentZoom + delta, safeMinZoom, safeMaxZoom));
    },
    [safeMaxZoom, safeMinZoom],
  );

  const renderTrigger = () => {
    if (!trigger) {
      return null;
    }

    if (isValidElement<TriggerElementProps>(trigger)) {
      return cloneElement(trigger, {
        onClick: (event: MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);

          if (!event.defaultPrevented) {
            setOpen(true);
          }
        },
      });
    }

    return (
      <button onClick={() => setOpen(true)} type="button">
        {trigger}
      </button>
    );
  };

  useEffect(() => {
    if (!currentOpen) {
      return;
    }

    setZoom(safeDefaultZoom);
  }, [activeIndex, currentOpen, safeDefaultZoom]);

  useEffect(() => {
    if (isIndexControlled || imageCount === 0) {
      return;
    }

    setUncontrolledIndex((index) => getSafeIndex(index, imageCount));
  }, [imageCount, isIndexControlled]);

  useEffect(() => {
    if (!currentOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setIndex(activeIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        setIndex(activeIndex + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, currentOpen, setIndex]);

  return (
    <Dialog.Root open={currentOpen} onOpenChange={setOpen}>
      {renderTrigger()}
      <Dialog.Content aria-label={ariaLabel ?? text.imagePreview} className={styles.content}>
        <div className={styles.frame}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
              <IconButton
                aria-label={text.previousImage}
                disabled={!canGoPrevious}
                icon={<ArrowLeftIcon />}
                onClick={() => setIndex(activeIndex - 1)}
                size="sm"
                variant="ghost"
              />
              <span className={styles.counter}>
                {imageCount === 0 ? '0 / 0' : `${activeIndex + 1} / ${imageCount}`}
              </span>
              <IconButton
                aria-label={text.nextImage}
                disabled={!canGoNext}
                icon={<ArrowRightIcon />}
                onClick={() => setIndex(activeIndex + 1)}
                size="sm"
                variant="ghost"
              />
            </div>
            <div className={styles.toolbarGroup}>
              <IconButton
                aria-label={text.zoomOut}
                disabled={zoom <= safeMinZoom}
                icon={<ZoomOutIcon />}
                onClick={() => zoomBy(-zoomStep)}
                size="sm"
                variant="ghost"
              />
              <IconButton
                aria-label={text.resetZoom}
                disabled={zoom === safeDefaultZoom}
                icon={<RefreshIcon />}
                onClick={() => setZoom(safeDefaultZoom)}
                size="sm"
                variant="ghost"
              />
              <IconButton
                aria-label={text.zoomIn}
                disabled={zoom >= safeMaxZoom}
                icon={<ZoomInIcon />}
                onClick={() => zoomBy(zoomStep)}
                size="sm"
                variant="ghost"
              />
              <Dialog.CloseTrigger>
                <IconButton
                  aria-label={text.closePreview}
                  icon={<XIcon />}
                  size="sm"
                  variant="ghost"
                />
              </Dialog.CloseTrigger>
            </div>
          </div>
          <div className={styles.stage}>
            {activeImage ? (
              <img
                alt={activeImage.alt ?? activeImage.title ?? ''}
                className={styles.image}
                src={activeImage.src}
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <span className={styles.empty}>{text.noImage}</span>
            )}
          </div>
          <p className={styles.caption}>
            {activeImage?.caption ?? activeImage?.title ?? activeImage?.alt ?? null}
          </p>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export type { ImagePreviewLocaleText } from './locale/types.ts';
