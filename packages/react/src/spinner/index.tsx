import type { CSSProperties, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  /** 尺寸（px 数值或 CSS 字符串），默认 '1em' */
  size?: number | string;
  /** 无障碍标签；提供时加 role="status"，否则加 aria-hidden */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
};

export const Spinner = ({
  'aria-label': ariaLabel,
  className,
  size,
  style,
  ...props
}: SpinnerProps) => {
  const resolvedSize =
    size === undefined ? undefined : typeof size === 'number' ? `${size}px` : size;

  const accessibilityProps = ariaLabel
    ? { role: 'status' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const };

  return (
    <span
      {...props}
      {...accessibilityProps}
      className={classNames(styles.root, className)}
      style={{
        ...style,
        ...(resolvedSize ? { width: resolvedSize, height: resolvedSize } : {}),
      }}
    />
  );
};
