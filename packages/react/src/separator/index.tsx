import type { CSSProperties, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type SeparatorProps = HTMLAttributes<HTMLElement> & {
  /** 方向：horizontal（默认）或 vertical */
  orientation?: 'horizontal' | 'vertical';
  /** 标签文字（仅水平方向有效） */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export const Separator = ({
  className,
  label,
  orientation = 'horizontal',
  style,
  ...props
}: SeparatorProps) => {
  const isVertical = orientation === 'vertical';
  const hasLabel = Boolean(label) && !isVertical;

  if (isVertical) {
    return (
      <div
        {...props}
        aria-orientation="vertical"
        className={classNames(styles.root, styles.vertical, className)}
        role="separator"
        style={style}
      />
    );
  }

  if (hasLabel) {
    return (
      <div
        {...props}
        aria-orientation="horizontal"
        className={classNames(styles.root, styles.horizontal, styles.withLabel, className)}
        role="separator"
        style={style}
      >
        <span className={styles.labelText}>{label}</span>
      </div>
    );
  }

  return (
    <hr
      {...(props as HTMLAttributes<HTMLHRElement>)}
      className={classNames(styles.root, styles.horizontal, className)}
      style={style}
    />
  );
};
