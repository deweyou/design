import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

// ── Context ───────────────────────────────────────────────────────────────

export type NavOrientation = 'horizontal' | 'vertical';
export type NavSize = 'sm' | 'md' | 'lg';

type NavContextValue = { orientation: NavOrientation; size: NavSize };

const NavContext = createContext<NavContextValue>({ orientation: 'horizontal', size: 'md' });

// ── Class maps ────────────────────────────────────────────────────────────

const sizeClassMap: Record<NavSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const orientationClassMap: Record<NavOrientation, string> = {
  horizontal: styles.orientationHorizontal,
  vertical: styles.orientationVertical,
};

// ── Nav.Root ──────────────────────────────────────────────────────────────

export type NavRootProps = HTMLAttributes<HTMLElement> & {
  /** Accessible label for the nav landmark. Defaults to 'navigation'. */
  'aria-label'?: string;
  /** Layout direction of the nav items. Defaults to 'horizontal'. */
  orientation?: NavOrientation;
  /** Size scale for font and spacing. Defaults to 'md'. */
  size?: NavSize;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const NavRoot = ({
  'aria-label': ariaLabel = 'navigation',
  orientation = 'horizontal',
  size = 'md',
  children,
  className,
  style,
  ...props
}: NavRootProps) => (
  <NavContext.Provider value={{ orientation, size }}>
    <nav
      {...props}
      aria-label={ariaLabel}
      className={classNames(
        styles.root,
        orientationClassMap[orientation],
        sizeClassMap[size],
        className,
      )}
      style={style}
    >
      {children}
    </nav>
  </NavContext.Provider>
);

// ── Nav.Link ──────────────────────────────────────────────────────────────

export type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** When true, applies active styles and adds data-active attribute. */
  active?: boolean;
  /** Optional leading icon rendered before the label. */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const NavLink = ({ active, icon, children, className, style, ...props }: NavLinkProps) => {
  const { orientation } = useContext(NavContext);

  return (
    <a
      {...props}
      aria-current={active ? 'page' : undefined}
      className={classNames(
        styles.link,
        orientation === 'vertical' ? styles.linkVertical : styles.linkHorizontal,
        className,
      )}
      data-active={active ? '' : undefined}
      style={style}
    >
      {icon !== undefined && <span className={styles.linkIcon}>{icon}</span>}
      <span className={styles.linkLabel}>{children}</span>
    </a>
  );
};

// ── Compound export ───────────────────────────────────────────────────────

export const Nav = {
  Root: NavRoot,
  Link: NavLink,
};
