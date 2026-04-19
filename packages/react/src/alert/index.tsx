import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  /** 语义类型，控制颜色 */
  variant?: AlertVariant;
  /** 标题（可选）*/
  title?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const variantClassMap: Record<AlertVariant, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
};

export const Alert = ({
  children,
  className,
  style,
  title,
  variant = 'info',
  ...props
}: AlertProps) => {
  return (
    <div
      {...props}
      className={classNames(styles.root, variantClassMap[variant], className)}
      role={variant === 'danger' ? 'alert' : undefined}
      style={style}
    >
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
};
