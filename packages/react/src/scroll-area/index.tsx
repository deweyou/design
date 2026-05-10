import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';
import classNames from 'classnames';

import styles from './index.module.less';

export type ScrollAreaRootProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
};

export type ScrollAreaViewportProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<
  ComponentPropsWithoutRef<typeof ArkScrollArea.Viewport>,
  'children' | 'className' | 'style'
>;

export type ScrollAreaScrollbarSize = 'sm' | 'md' | 'lg';

export type ScrollAreaScrollbarProps = {
  orientation: 'vertical' | 'horizontal';
  /** Scrollbar thickness. Defaults to 'md' (8px). */
  size?: ScrollAreaScrollbarSize;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type ScrollAreaThumbProps = {
  className?: string;
  style?: CSSProperties;
};

const sizeClassMap: Record<ScrollAreaScrollbarSize, string | false> = {
  sm: styles.sizeSm,
  md: false,
  lg: styles.sizeLg,
};

const ScrollAreaRoot = ({ children, className, style, ...rest }: ScrollAreaRootProps) => (
  <ArkScrollArea.Root className={classNames(styles.root, className)} style={style} {...rest}>
    {children}
  </ArkScrollArea.Root>
);

const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  ({ children, className, style, ...rest }, ref) => (
    <ArkScrollArea.Viewport
      ref={ref}
      className={classNames(styles.viewport, className)}
      style={style}
      {...rest}
    >
      {children}
    </ArkScrollArea.Viewport>
  ),
);

ScrollAreaViewport.displayName = 'ScrollAreaViewport';

const ScrollAreaScrollbar = ({
  orientation,
  size = 'md',
  children,
  className,
  style,
}: ScrollAreaScrollbarProps) => (
  <ArkScrollArea.Scrollbar
    className={classNames(styles.scrollbar, sizeClassMap[size], className)}
    orientation={orientation}
    style={style}
  >
    {children}
  </ArkScrollArea.Scrollbar>
);

const ScrollAreaThumb = ({ className, style }: ScrollAreaThumbProps) => (
  <ArkScrollArea.Thumb className={classNames(styles.thumb, className)} style={style} />
);

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
};
