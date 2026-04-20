import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColor = 'neutral' | 'primary' | 'danger' | 'success' | 'warning';
export type BadgeShape = 'pill' | 'rounded' | 'rect';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** 视觉变体：solid=实心，soft=浅色背景，outline=描边 */
  variant?: BadgeVariant;
  /** 色彩语义 */
  color?: BadgeColor;
  /** 圆角形状：pill=全圆角，rounded=小圆角，rect=直角 */
  shape?: BadgeShape;
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

const shapeClassMap: Record<BadgeShape, string> = {
  pill: styles.shapePill,
  rounded: styles.shapeRounded,
  rect: styles.shapeRect,
};

export const Badge = ({
  children,
  className,
  color = 'neutral',
  shape = 'pill',
  style,
  variant = 'soft',
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={classNames(
        styles.root,
        variantClassMap[variant],
        colorClassMap[color],
        shapeClassMap[shape],
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
};
