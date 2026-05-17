import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { ChevronDownIcon, MenuIcon } from '@deweyou-design/react-icons';
import classNames from 'classnames';

import { IconButton } from '../button/index.tsx';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../menu/index.tsx';
import { NavOverlay } from '../nav-overlay/index.tsx';
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

// ── Nav.Responsive ────────────────────────────────────────────────────────

export type NavResponsiveSelectDetails = {
  value: string;
  item: NavResponsiveItem;
  event?: MouseEvent<HTMLElement>;
};

export type NavResponsiveItem = {
  value: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  onSelect?: (details: NavResponsiveSelectDetails) => void;
};

export type NavResponsiveBreakpoint = 'sm' | 'md' | 'lg';

export type NavResponsiveProps = {
  items: readonly NavResponsiveItem[];
  value?: string;
  'aria-label'?: string;
  collapseLabel?: string;
  collapseTrigger?: ReactNode;
  breakpoint?: NavResponsiveBreakpoint;
  size?: NavSize;
  className?: string;
  listClassName?: string;
  overlayClassName?: string;
  onSelect?: (details: NavResponsiveSelectDetails) => void;
};

const breakpointClassMap: Record<NavResponsiveBreakpoint, string> = {
  sm: styles.responsiveBreakpointSm,
  md: styles.responsiveBreakpointMd,
  lg: styles.responsiveBreakpointLg,
};

const isItemActive = (item: NavResponsiveItem, value: string | undefined) =>
  item.active ?? item.value === value;

const getTarget = (item: NavResponsiveItem) =>
  item.target ?? (item.external ? '_blank' : undefined);

const getRel = (item: NavResponsiveItem) =>
  item.rel ?? (item.external ? 'noopener noreferrer' : undefined);

const createSelectDetails = (
  item: NavResponsiveItem,
  event?: MouseEvent<HTMLElement>,
): NavResponsiveSelectDetails => ({
  event,
  item,
  value: item.value,
});

const shouldIgnoreLinkClick = (event: MouseEvent<HTMLElement>) =>
  event.defaultPrevented ||
  event.button > 0 ||
  event.metaKey ||
  event.altKey ||
  event.ctrlKey ||
  event.shiftKey;

const MORE_TRIGGER_SIZE_FALLBACK = 88;

const NavResponsive = ({
  items,
  value,
  'aria-label': ariaLabel = 'navigation',
  collapseLabel = 'Open navigation',
  collapseTrigger,
  breakpoint = 'sm',
  size = 'md',
  className,
  listClassName,
  overlayClassName,
  onSelect,
}: NavResponsiveProps) => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const responsiveRef = useRef<HTMLDivElement>(null);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const measuredLinkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const measuredLinkWidths = useRef(new Map<string, number>());

  const handleSelect = (item: NavResponsiveItem, event?: MouseEvent<HTMLElement>) => {
    const details = createSelectDetails(item, event);

    item.onSelect?.(details);
    onSelect?.(details);
  };

  const handleLinkClick = (item: NavResponsiveItem) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (shouldIgnoreLinkClick(event)) {
      return;
    }

    handleSelect(item, event);
  };

  const handleOverlayLinkClick =
    (item: NavResponsiveItem) => (event: MouseEvent<HTMLAnchorElement>) => {
      const shouldCloseOverlay = !item.disabled && !shouldIgnoreLinkClick(event);

      handleLinkClick(item)(event);

      if (shouldCloseOverlay) {
        setOverlayOpen(false);
      }
    };

  const measureOverflow = useCallback(() => {
    const container = responsiveRef.current;

    if (!container) {
      return;
    }

    const containerWidth = container.clientWidth;

    if (containerWidth <= 0) {
      return;
    }

    const itemWidths = items.map((item) => {
      const measuredNode = measuredLinkRefs.current.get(item.value);
      const measuredWidth = measuredNode?.getBoundingClientRect().width;

      if (measuredWidth && measuredWidth > 0) {
        measuredLinkWidths.current.set(item.value, measuredWidth);
        return measuredWidth;
      }

      return measuredLinkWidths.current.get(item.value) ?? 0;
    });
    const totalItemsWidth = itemWidths.reduce((total, width) => total + width, 0);

    if (totalItemsWidth <= containerWidth) {
      setVisibleCount(items.length);
      return;
    }

    const moreTriggerWidth =
      moreTriggerRef.current?.getBoundingClientRect().width || MORE_TRIGGER_SIZE_FALLBACK;
    let usedWidth = moreTriggerWidth;
    let nextVisibleCount = 0;

    for (const itemWidth of itemWidths) {
      if (usedWidth + itemWidth > containerWidth) {
        break;
      }

      usedWidth += itemWidth;
      nextVisibleCount += 1;
    }

    setVisibleCount(Math.min(items.length - 1, Math.max(0, nextVisibleCount)));
  }, [items]);

  useEffect(() => {
    setVisibleCount(items.length);
    measuredLinkWidths.current.clear();
  }, [items]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(measureOverflow);
    const container = responsiveRef.current;
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measureOverflow);

    if (container) {
      resizeObserver?.observe(container);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
    };
  }, [measureOverflow]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const hasOverflowItems = overflowItems.length > 0;
  const hasActiveOverflowItem = overflowItems.some((item) => isItemActive(item, value));
  const handleOverflowItemSelect = (item: NavResponsiveItem) => {
    if (item.disabled) {
      return;
    }

    handleSelect(item);

    if (!item.href || typeof window === 'undefined') {
      return;
    }

    const target = getTarget(item);

    if (target === '_blank') {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }

    window.location.assign(item.href);
  };

  return (
    <div
      ref={responsiveRef}
      className={classNames(styles.responsive, breakpointClassMap[breakpoint], className)}
    >
      <div aria-hidden="true" className={styles.responsiveMeasureList}>
        {items.map((item) => (
          <a
            key={item.value}
            ref={(node) => {
              if (node) {
                measuredLinkRefs.current.set(item.value, node);
                return;
              }

              measuredLinkRefs.current.delete(item.value);
            }}
            className={classNames(styles.link, styles.linkHorizontal)}
            tabIndex={-1}
          >
            {item.icon !== undefined && <span className={styles.linkIcon}>{item.icon}</span>}
            <span className={styles.linkLabel}>{item.label}</span>
          </a>
        ))}
      </div>
      <NavRoot
        aria-label={ariaLabel}
        className={classNames(styles.responsiveList, listClassName)}
        size={size}
      >
        {visibleItems.map((item) => (
          <NavLink
            key={item.value}
            active={isItemActive(item, value)}
            aria-disabled={item.disabled || undefined}
            className={item.disabled ? styles.linkDisabled : undefined}
            href={item.disabled ? undefined : item.href}
            icon={item.icon}
            rel={getRel(item)}
            tabIndex={item.disabled ? -1 : undefined}
            target={getTarget(item)}
            onClick={handleLinkClick(item)}
          >
            {item.label}
          </NavLink>
        ))}
      </NavRoot>

      {hasOverflowItems && (
        <Menu
          onSelect={({ value: selectedValue }) => {
            const selectedItem = overflowItems.find((item) => item.value === selectedValue);

            if (selectedItem) {
              handleOverflowItemSelect(selectedItem);
            }
          }}
        >
          <MenuTrigger>
            <button
              ref={moreTriggerRef}
              aria-label="More navigation items"
              className={classNames(styles.link, styles.linkHorizontal, styles.moreTrigger)}
              data-active={hasActiveOverflowItem ? '' : undefined}
              type="button"
            >
              <span className={styles.linkLabel}>More</span>
              <span aria-hidden className={styles.moreTriggerIcon}>
                <ChevronDownIcon size="xs" />
              </span>
            </button>
          </MenuTrigger>
          <MenuContent>
            {overflowItems.map((item) => (
              <MenuItem
                key={item.value}
                disabled={item.disabled}
                icon={item.icon}
                selected={isItemActive(item, value)}
                value={item.value}
              >
                {item.label}
              </MenuItem>
            ))}
          </MenuContent>
        </Menu>
      )}

      <div className={styles.responsiveOverlay}>
        <NavOverlay.Root open={overlayOpen} onOpenChange={setOverlayOpen}>
          <NavOverlay.Trigger>
            {collapseTrigger ?? (
              <IconButton
                aria-label={collapseLabel}
                icon={<MenuIcon />}
                size="sm"
                variant="ghost"
              />
            )}
          </NavOverlay.Trigger>
          <NavOverlay.Content
            className={classNames(styles.responsiveOverlayContent, overlayClassName)}
          >
            <NavOverlay.CloseButton className={styles.responsiveOverlayCloseButton} />
            <NavRoot
              aria-label={ariaLabel}
              className={styles.responsiveOverlayList}
              orientation="vertical"
              size={size}
            >
              {items.map((item) => (
                <NavLink
                  key={item.value}
                  active={isItemActive(item, value)}
                  aria-disabled={item.disabled || undefined}
                  className={classNames(
                    styles.responsiveOverlayLink,
                    item.disabled && styles.linkDisabled,
                  )}
                  href={item.disabled ? undefined : item.href}
                  icon={item.icon}
                  rel={getRel(item)}
                  tabIndex={item.disabled ? -1 : undefined}
                  target={getTarget(item)}
                  onClick={handleOverlayLinkClick(item)}
                >
                  {item.label}
                </NavLink>
              ))}
            </NavRoot>
          </NavOverlay.Content>
        </NavOverlay.Root>
      </div>
    </div>
  );
};

// ── Compound export ───────────────────────────────────────────────────────

export const Nav = {
  Root: NavRoot,
  Link: NavLink,
  Responsive: NavResponsive,
};
