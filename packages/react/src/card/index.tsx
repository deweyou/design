import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShape = 'auto' | 'rect';

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** 内边距大小，默认 'md' */
  padding?: CardPadding;
  /** 圆角形状，'auto' 使用标准圆角，'rect' 为直角，默认 'auto' */
  shape?: CardShape;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * 有 href 时渲染为 <a>，否则渲染为 <div>（默认行为）。
   */
  href?: string;
  /**
   * 仅在 href 存在时有效。缺少 href 时会抛出错误。
   */
  target?: string;
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
  href,
  padding = 'md',
  shape = 'auto',
  style,
  target,
  ...props
}: CardProps) => {
  if (target !== undefined && href === undefined) {
    throw new Error('Card: target requires href.');
  }

  const sharedClassName = classNames(
    styles.root,
    paddingClassMap[padding],
    shape === 'rect' && styles.shapeRect,
    className,
  );

  if (href !== undefined) {
    return (
      <a
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={sharedClassName}
        href={href}
        style={style}
        target={target}
      >
        {children}
      </a>
    );
  }

  return (
    <div {...(props as HTMLAttributes<HTMLDivElement>)} className={sharedClassName} style={style}>
      {children}
    </div>
  );
};
