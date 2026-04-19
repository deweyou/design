import { type CSSProperties, type ReactNode } from 'react';
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
};

export type ScrollAreaScrollbarProps = {
  orientation: 'vertical' | 'horizontal';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type ScrollAreaThumbProps = {
  className?: string;
  style?: CSSProperties;
};

const ScrollAreaRoot = ({ children, className, style, ...rest }: ScrollAreaRootProps) => (
  <ArkScrollArea.Root className={classNames(styles.root, className)} style={style} {...rest}>
    {children}
  </ArkScrollArea.Root>
);

const ScrollAreaViewport = ({ children, className, style }: ScrollAreaViewportProps) => (
  <ArkScrollArea.Viewport className={classNames(styles.viewport, className)} style={style}>
    {children}
  </ArkScrollArea.Viewport>
);

const ScrollAreaScrollbar = ({
  orientation,
  children,
  className,
  style,
}: ScrollAreaScrollbarProps) => (
  <ArkScrollArea.Scrollbar
    className={classNames(styles.scrollbar, className)}
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
