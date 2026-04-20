import type { CSSProperties, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** 宽度，默认 '100%' */
  width?: number | string;
  /** 高度，默认 '1em' */
  height?: number | string;
  /** 圆形模式，适用于头像占位 */
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

const resolveDimension = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export const Skeleton = ({
  circle = false,
  className,
  height,
  style,
  width,
  ...props
}: SkeletonProps) => {
  const resolvedWidth = resolveDimension(width);
  const resolvedHeight = resolveDimension(height);

  return (
    <div
      {...props}
      aria-hidden="true"
      className={classNames(styles.root, { [styles.circle]: circle }, className)}
      style={{
        ...style,
        ...(resolvedWidth ? { width: resolvedWidth } : {}),
        ...(resolvedHeight ? { height: resolvedHeight } : {}),
      }}
    />
  );
};
