import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColor = 'neutral' | 'primary' | 'danger' | 'success' | 'warning';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** 视觉变体：solid=实心，soft=浅色背景，outline=描边 */
  variant?: BadgeVariant;
  /** 色彩语义 */
  color?: BadgeColor;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const variantClassMap: Record<BadgeVariant, string> = {
  soft: styles.soft,
  solid: styles.solid,
  outline: styles.outline,
};

const colorClassMap: Record<BadgeColor, string> = {
  neutral: styles.colorNeutral,
  primary: styles.colorPrimary,
  danger: styles.colorDanger,
  success: styles.colorSuccess,
  warning: styles.colorWarning,
};

export const Badge = ({
  children,
  className,
  color = 'neutral',
  style,
  variant = 'soft',
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={classNames(styles.root, variantClassMap[variant], colorClassMap[color], className)}
      style={style}
    >
      {children}
    </span>
  );
};
