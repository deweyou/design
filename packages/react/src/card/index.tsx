import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShape = 'auto' | 'rect';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** 内边距大小，默认 'md' */
  padding?: CardPadding;
  /** 圆角形状，'auto' 使用标准圆角，'rect' 为直角，默认 'auto' */
  shape?: CardShape;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const paddingClassMap: Record<CardPadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

export const Card = ({
  children,
  className,
  padding = 'md',
  shape = 'auto',
  style,
  ...props
}: CardProps) => {
  return (
    <div
      {...props}
      className={classNames(
        styles.root,
        paddingClassMap[padding],
        shape === 'rect' && styles.shapeRect,
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
};
