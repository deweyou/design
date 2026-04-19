import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type BreadcrumbRootProps = HTMLAttributes<HTMLElement> & {
  'aria-label'?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbRoot = ({
  'aria-label': ariaLabel = 'Breadcrumb',
  children,
  className,
  style,
  ...props
}: BreadcrumbRootProps) => (
  <nav
    {...props}
    aria-label={ariaLabel}
    className={classNames(styles.root, className)}
    style={style}
  >
    {children}
  </nav>
);

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbList = ({ children, className, style, ...props }: BreadcrumbListProps) => (
  <ol {...props} className={classNames(styles.list, className)} style={style}>
    {children}
  </ol>
);

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbItem = ({ children, className, style, ...props }: BreadcrumbItemProps) => (
  <li {...props} className={classNames(styles.item, className)} style={style}>
    {children}
  </li>
);

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbLink = ({ children, className, style, ...props }: BreadcrumbLinkProps) => (
  <a {...props} className={classNames(styles.link, className)} style={style}>
    {children}
  </a>
);

export type BreadcrumbCurrentProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbCurrent = ({ children, className, style, ...props }: BreadcrumbCurrentProps) => (
  <span
    {...props}
    aria-current="page"
    className={classNames(styles.current, className)}
    style={style}
  >
    {children}
  </span>
);

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbSeparator = ({
  children = '/',
  className,
  style,
  ...props
}: BreadcrumbSeparatorProps) => (
  <span
    {...props}
    aria-hidden="true"
    className={classNames(styles.separator, className)}
    style={style}
  >
    {children}
  </span>
);

export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Current: BreadcrumbCurrent,
  Separator: BreadcrumbSeparator,
};
