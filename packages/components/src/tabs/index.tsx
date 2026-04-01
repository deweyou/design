import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Tabs as ArkTabs,
  type TabsFocusChangeDetails as ArkFocusChangeDetails,
} from '@ark-ui/react/tabs';
import classNames from 'classnames';

import { Menu, MenuContent, MenuItem, MenuTrigger, MenuTriggerItem } from '../menu/index.tsx';
import styles from './index.module.less';

// ─── Type exports ─────────────────────────────────────────────────────────────

export const tabsVariantOptions = ['line', 'bg'] as const;
export type TabsVariant = (typeof tabsVariantOptions)[number];

export const tabsColorOptions = ['neutral', 'primary'] as const;
export type TabsColor = (typeof tabsColorOptions)[number];

export const tabsSizeOptions = ['small', 'medium', 'large'] as const;
export type TabsSize = (typeof tabsSizeOptions)[number];

export const tabsOrientationOptions = ['horizontal', 'vertical'] as const;
export type TabsOrientation = (typeof tabsOrientationOptions)[number];

export const tabsActivationModeOptions = ['automatic', 'manual'] as const;
export type TabsActivationMode = (typeof tabsActivationModeOptions)[number];

export const tabsOverflowModeOptions = ['scroll', 'collapse'] as const;
export type TabsOverflowMode = (typeof tabsOverflowModeOptions)[number];

export type TabMenuItemDef = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type TabsValueChangeDetails = {
  value: string;
};

export type TabsFocusChangeDetails = {
  value: string | null;
};

export type TabRegistration = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Sub-items for menu-tab triggers — carried through to the collapse overflow menu. */
  menuItems?: TabMenuItemDef[];
};

// ─── Props ────────────────────────────────────────────────────────────────────

export type TabsProps = {
  /** Controlled active tab value. */
  value?: string;
  /** Default tab value for uncontrolled usage. */
  defaultValue?: string;
  onValueChange?: (details: TabsValueChangeDetails) => void;
  onFocusChange?: (details: TabsFocusChangeDetails) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  loopFocus?: boolean;
  /** Visual variant: 'line' shows a sliding indicator, 'bg' uses background highlight. */
  variant?: TabsVariant;
  /** Semantic color emphasis for the active indicator. */
  color?: TabsColor;
  size?: TabsSize;
  /** How to handle tabs that overflow the container. */
  overflowMode?: TabsOverflowMode;
  /** When true, no TabContent panels are rendered (tabs-only mode). */
  hideContent?: boolean;
  lazyMount?: boolean;
  unmountOnExit?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export type TabListProps = {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export type TabTriggerProps = {
  /** Unique identifier that matches a TabContent value. */
  value: string;
  disabled?: boolean;
  /** When provided, renders as a dropdown menu tab instead of a plain trigger. */
  menuItems?: TabMenuItemDef[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export type TabContentProps = {
  /** Must match the corresponding TabTrigger value. */
  value: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export type TabIndicatorProps = {
  className?: string;
  style?: CSSProperties;
};

// ─── Internal context ─────────────────────────────────────────────────────────

type TabsContextValue = {
  variant: TabsVariant;
  color: TabsColor;
  size: TabsSize;
  orientation: TabsOrientation;
  overflowMode: TabsOverflowMode;
  hideContent: boolean;
  currentValue: string;
  onTabMenuSelect: (value: string) => void;
  registerTab: (tab: TabRegistration) => void;
  unregisterTab: (value: string) => void;
  tabs: TabRegistration[];
};

const TabsContext = createContext<TabsContextValue>({
  variant: 'line',
  color: 'neutral',
  size: 'medium',
  orientation: 'horizontal',
  overflowMode: 'scroll',
  hideContent: false,
  currentValue: '',
  onTabMenuSelect: () => {},
  registerTab: () => {},
  unregisterTab: () => {},
  tabs: [],
});

// ─── Inline SVG helpers ───────────────────────────────────────────────────────

const ChevronDownSvg = () => (
  <svg aria-hidden="true" fill="none" height="1em" viewBox="0 0 24 24" width="1em">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
  </svg>
);

// ─── Tabs (root) ──────────────────────────────────────────────────────────────

export const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  onFocusChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  loopFocus = true,
  variant = 'line',
  color = 'neutral',
  size = 'medium',
  overflowMode = 'scroll',
  hideContent = false,
  lazyMount = false,
  unmountOnExit = false,
  className,
  style,
  children,
}: TabsProps) => {
  const isControlled = value !== undefined;
  // Always manage an internal value so menu-tab selections can be applied programmatically.
  // Note: when neither value nor defaultValue is provided, internalValue starts as '' and
  // Ark UI is passed undefined (auto-selects first tab via its own defaultValue logic).
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');

  // Sync internalValue when external controlled value changes.
  useEffect(() => {
    if (isControlled) setInternalValue(value);
  }, [isControlled, value]);

  // Registry of tab registrations used by the collapse overflow menu.
  const [tabs, setTabs] = useState<TabRegistration[]>([]);

  const registerTab = useCallback((tab: TabRegistration) => {
    setTabs((prev) => {
      if (prev.some((t) => t.value === tab.value)) return prev;
      return [...prev, tab];
    });
  }, []);

  const unregisterTab = useCallback((tabValue: string) => {
    setTabs((prev) => prev.filter((t) => t.value !== tabValue));
  }, []);

  const resolvedValue = isControlled ? value : internalValue;

  const handleValueChange = ({ value: newValue }: { value: string }) => {
    if (!isControlled) setInternalValue(newValue);
    onValueChange?.({ value: newValue });
  };

  const handleTabMenuSelect = (newValue: string) => {
    if (!isControlled) setInternalValue(newValue);
    onValueChange?.({ value: newValue });
  };

  // Pass a value to Ark only when it's non-empty so Ark can auto-select the
  // first tab when no defaultValue is provided by the consumer.
  const arkValue = resolvedValue || undefined;

  return (
    <TabsContext.Provider
      value={{
        color,
        currentValue: resolvedValue,
        hideContent,
        onTabMenuSelect: handleTabMenuSelect,
        orientation,
        overflowMode,
        registerTab,
        size,
        tabs,
        unregisterTab,
        variant,
      }}
    >
      <ArkTabs.Root
        activationMode={activationMode}
        className={classNames(styles.root, className)}
        data-color={color}
        data-orientation={orientation}
        data-size={size}
        data-variant={variant}
        lazyMount={lazyMount}
        loopFocus={loopFocus}
        onFocusChange={
          onFocusChange
            ? (details: ArkFocusChangeDetails) => onFocusChange({ value: details.focusedValue })
            : undefined
        }
        onValueChange={handleValueChange}
        orientation={orientation}
        style={style}
        unmountOnExit={unmountOnExit}
        value={arkValue}
      >
        {children}
      </ArkTabs.Root>
    </TabsContext.Provider>
  );
};

// ─── TabList ──────────────────────────────────────────────────────────────────

const MORE_BUTTON_SIZE_FALLBACK = 88; // px fallback when More button isn't in DOM yet
const TAB_GAP = 8; // px gap between tabs (matches @tabs-tab-gap in CSS)

// Selector for all tab trigger elements inside the list.
// Ark renders ArkTabs.Trigger with role="tab"; our menu-tab buttons also use role="tab".
const TAB_ROLE_SELECTOR = '[role="tab"]';

export const TabList = ({ className, style, children }: TabListProps) => {
  const { variant, overflowMode, orientation, tabs, currentValue, onTabMenuSelect } =
    useContext(TabsContext);

  // Outer wrapper ref — used for ResizeObserver in collapse mode.
  const outerRef = useRef<HTMLDivElement>(null);
  // List scroller ref — also observed so that when the More button appears and causes the
  // scroller to shrink, we re-measure with the actual More button width.
  const scrollerRef = useRef<HTMLDivElement>(null);
  // Inner list ref — the actual scrollable ArkTabs.List element.
  const listRef = useRef<HTMLDivElement>(null);
  // Custom indicator ref — we position it ourselves so it works for menu-tab selections too.
  const indicatorRef = useRef<HTMLDivElement>(null);
  // More button wrapper ref — so we can measure its actual rendered size.
  const moreRef = useRef<HTMLDivElement>(null);

  // ── scroll mode: edge state ──────────────────────────────────────────────────
  const [scrollAtStart, setScrollAtStart] = useState(true);
  const [scrollAtEnd, setScrollAtEnd] = useState(true);

  const updateScrollEdges = useCallback(() => {
    const el = listRef.current;
    if (!el || overflowMode !== 'scroll') return;
    const isHoriz = orientation !== 'vertical';
    const pos = isHoriz ? el.scrollLeft : el.scrollTop;
    const max = isHoriz ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    setScrollAtStart(pos <= 1);
    setScrollAtEnd(max <= 1 || pos >= max - 1);
  }, [overflowMode, orientation]);

  useEffect(() => {
    if (overflowMode !== 'scroll') return;
    updateScrollEdges();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollEdges, { passive: true });
    const resizeObs = new ResizeObserver(updateScrollEdges);
    resizeObs.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollEdges);
      resizeObs.disconnect();
    };
  }, [overflowMode, updateScrollEdges]);

  // ── scroll mode: scroll active tab into view ─────────────────────────────────
  useEffect(() => {
    if (!currentValue || overflowMode !== 'scroll') return;
    const id = window.setTimeout(() => {
      const activeEl = listRef.current?.querySelector<HTMLElement>(
        `[data-value="${CSS.escape(currentValue)}"]`,
      );
      activeEl?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }, 16);
    return () => window.clearTimeout(id);
  }, [currentValue, overflowMode]);

  // ── custom indicator: position under active tab (works for menu tabs too) ────
  const updateIndicator = useCallback(() => {
    if (variant !== 'line') return;
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const isHoriz = orientation !== 'vertical';

    // Find the active trigger: a plain Ark trigger (data-value matches) OR
    // a menu-tab button that is currently selected (data-has-menu + data-selected).
    // Exclude overflow-hidden tabs — they have display:none so offsetLeft/offsetTop = 0,
    // which would wrongly animate the indicator all the way to the left edge.
    const activeEl =
      list.querySelector<HTMLElement>(
        `[data-value="${CSS.escape(currentValue)}"]:not([data-overflow-hidden="true"])`,
      ) ?? list.querySelector<HTMLElement>('[data-has-menu="true"][data-selected]');

    if (!activeEl || !currentValue) {
      // Active tab is in the overflow set. Animate the indicator just past the last
      // visible tab so it slides rightward (toward the More button) and disappears.
      // When returning to a visible tab the animation will start from this right-edge
      // position, giving a natural right-to-target slide.
      const visibleTabs = Array.from(
        list.querySelectorAll<HTMLElement>(
          `${TAB_ROLE_SELECTOR}:not([data-overflow-hidden="true"])`,
        ),
      );
      const lastVisible = visibleTabs[visibleTabs.length - 1];
      if (isHoriz) {
        if (lastVisible) {
          indicator.style.left = `${lastVisible.offsetLeft + lastVisible.offsetWidth}px`;
        }
        indicator.style.width = '0px';
      } else {
        if (lastVisible) {
          indicator.style.top = `${lastVisible.offsetTop + lastVisible.offsetHeight}px`;
        }
        indicator.style.height = '0px';
      }
      return;
    }

    if (isHoriz) {
      indicator.style.left = `${activeEl.offsetLeft}px`;
      indicator.style.width = `${activeEl.offsetWidth}px`;
    } else {
      indicator.style.top = `${activeEl.offsetTop}px`;
      indicator.style.height = `${activeEl.offsetHeight}px`;
    }
  }, [variant, orientation, currentValue]);

  // Update indicator after every value/layout change.
  useEffect(() => {
    const id = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(id);
  }, [updateIndicator]);

  // Also update when tab widths change (e.g., font load, resize).
  useEffect(() => {
    if (variant !== 'line') return;
    const list = listRef.current;
    if (!list) return;
    const obs = new ResizeObserver(updateIndicator);
    obs.observe(list);
    return () => obs.disconnect();
  }, [variant, updateIndicator]);

  // ── collapse mode: ResizeObserver overflow detection ─────────────────────────
  const [overflowFrom, setOverflowFrom] = useState(Infinity);

  useEffect(() => {
    if (overflowMode !== 'collapse') return;
    const outer = outerRef.current;
    const list = listRef.current;
    if (!outer || !list) return;

    const measure = () => {
      const isHoriz = orientation !== 'vertical';
      const containerSize = isHoriz ? outer.clientWidth : outer.clientHeight;
      // Use role="tab" selector — Ark adds this to ArkTabs.Trigger; our menu buttons also use it.
      const triggerEls = Array.from(list.querySelectorAll<HTMLElement>(TAB_ROLE_SELECTOR));
      // Use actual rendered More button size when available and non-zero (zero = jsdom / unmeasured).
      const moreRaw = moreRef.current
        ? isHoriz
          ? moreRef.current.getBoundingClientRect().width
          : moreRef.current.getBoundingClientRect().height
        : 0;
      const moreSize = moreRaw > 0 ? moreRaw : MORE_BUTTON_SIZE_FALLBACK;
      let used = 0;
      let firstOverflow = triggerEls.length;

      for (let i = 0; i < triggerEls.length; i++) {
        const el = triggerEls[i];
        const bcr = el.getBoundingClientRect();
        const live = isHoriz ? bcr.width : bcr.height;
        // Cache the natural size while the tab is visible; use the cache when it's hidden
        // (display:none → getBCR returns 0, which would corrupt the measurement).
        if (live > 0) el.dataset.naturalSize = String(live);
        const sz = live > 0 ? live : parseFloat(el.dataset.naturalSize ?? '0');
        used += sz + TAB_GAP;
        // `used - TAB_GAP` = actual extent of tabs 0..i (CSS gap is between items, not trailing).
        // If that extent + the More button exceeds the container, tab i must overflow.
        if (used - TAB_GAP + moreSize > containerSize && i < triggerEls.length - 1) {
          firstOverflow = i;
          break;
        }
      }

      setOverflowFrom(firstOverflow < triggerEls.length ? firstOverflow : Infinity);
    };

    const obs = new ResizeObserver(measure);
    obs.observe(outer);
    // Also observe the scroller: when the More button appears/disappears it causes
    // the scroller (flex:1) to resize, triggering a re-measurement with actual button size.
    if (scrollerRef.current) obs.observe(scrollerRef.current);
    measure();
    return () => obs.disconnect();
  }, [overflowMode, orientation, tabs.length]);

  // ── collapse mode: mark DOM elements hidden ───────────────────────────────────
  useEffect(() => {
    if (overflowMode !== 'collapse') return;
    const list = listRef.current;
    if (!list) return;
    const triggerEls = Array.from(list.querySelectorAll<HTMLElement>(TAB_ROLE_SELECTOR));
    triggerEls.forEach((te, i) => {
      if (i >= overflowFrom) {
        te.setAttribute('data-overflow-hidden', 'true');
        te.setAttribute('aria-hidden', 'true');
        te.setAttribute('tabindex', '-1');
      } else {
        te.removeAttribute('data-overflow-hidden');
        te.removeAttribute('aria-hidden');
        te.removeAttribute('tabindex');
      }
    });
  }, [overflowFrom, overflowMode]);

  const overflowTabs =
    overflowFrom < Infinity && overflowFrom < tabs.length ? tabs.slice(overflowFrom) : [];

  // Active overflow: matches either a plain overflow tab or a sub-item of a menu-tab in overflow.
  const hasActiveOverflow = overflowTabs.some(
    (t) => t.value === currentValue || t.menuItems?.some((item) => item.value === currentValue),
  );
  const menuPlacement = orientation === 'vertical' ? 'right-start' : 'bottom-start';

  return (
    <div
      ref={outerRef}
      className={classNames(styles.listOuter, className)}
      data-orientation={orientation}
      style={style}
    >
      <div
        ref={scrollerRef}
        className={styles.listScroller}
        data-orientation={orientation}
        data-overflow-mode={overflowMode}
        data-scroll-at-end={String(scrollAtEnd)}
        data-scroll-at-start={String(scrollAtStart)}
      >
        <ArkTabs.List ref={listRef} className={styles.list} data-overflow-mode={overflowMode}>
          {children}
          {variant === 'line' && (
            <div ref={indicatorRef} className={styles.indicator} data-part="indicator" />
          )}
        </ArkTabs.List>
      </div>

      {overflowMode === 'collapse' && overflowTabs.length > 0 && (
        <div
          ref={moreRef}
          className={styles.moreButtonWrapper}
          data-has-active-overflow={String(hasActiveOverflow)}
          data-orientation={orientation}
        >
          <Menu
            onSelect={({ value: v }) => onTabMenuSelect(v)}
            placement={menuPlacement as 'bottom-start' | 'right-start'}
          >
            <MenuTrigger>
              <button
                className={styles.moreButton}
                data-has-active-overflow={String(hasActiveOverflow)}
                type="button"
              >
                More
                <span aria-hidden className={styles.moreButtonArrow}>
                  <ChevronDownSvg />
                </span>
              </button>
            </MenuTrigger>
            <MenuContent>
              {overflowTabs.map((tab) => {
                // Menu-tab in overflow: render as nested sub-menu.
                if (tab.menuItems && tab.menuItems.length > 0) {
                  const isSubActive = tab.menuItems.some((item) => item.value === currentValue);
                  return (
                    <Menu
                      key={tab.value}
                      onSelect={({ value: v }) => onTabMenuSelect(v)}
                      placement="right-start"
                    >
                      <MenuTriggerItem selected={isSubActive}>{tab.label}</MenuTriggerItem>
                      <MenuContent>
                        {tab.menuItems.map((item) => (
                          <MenuItem
                            key={item.value}
                            disabled={item.disabled}
                            selected={item.value === currentValue}
                            value={item.value}
                          >
                            {item.label}
                          </MenuItem>
                        ))}
                      </MenuContent>
                    </Menu>
                  );
                }
                // Plain overflow tab.
                return (
                  <MenuItem
                    key={tab.value}
                    disabled={tab.disabled}
                    selected={tab.value === currentValue}
                    value={tab.value}
                  >
                    {tab.label}
                  </MenuItem>
                );
              })}
            </MenuContent>
          </Menu>
        </div>
      )}
    </div>
  );
};

// ─── TabTrigger ───────────────────────────────────────────────────────────────

export const TabTrigger = ({
  value,
  disabled = false,
  menuItems,
  className,
  style,
  children,
}: TabTriggerProps) => {
  const { currentValue, orientation, onTabMenuSelect, registerTab, unregisterTab } =
    useContext(TabsContext);

  // Register this tab so the collapse overflow menu can display its label and sub-items.
  useEffect(() => {
    registerTab({ disabled, label: children, menuItems, value });
    return () => unregisterTab(value);
    // children and menuItems are intentionally excluded — they are set once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, disabled, registerTab, unregisterTab]);

  // ── Menu tab ──────────────────────────────────────────────────────────────────
  if (menuItems && menuItems.length > 0) {
    const isMenuActive = menuItems.some((item) => item.value === currentValue);
    const menuPlacement = orientation === 'vertical' ? 'right-start' : 'bottom-start';

    return (
      <Menu
        onSelect={({ value: v }) => onTabMenuSelect(v)}
        placement={menuPlacement as 'bottom-start' | 'right-start'}
      >
        <MenuTrigger>
          <button
            aria-haspopup="menu"
            aria-selected={isMenuActive}
            className={classNames(styles.trigger, styles.triggerMenu, className, {
              [styles.triggerMenuActive]: isMenuActive,
            })}
            data-has-menu="true"
            data-selected={isMenuActive ? '' : undefined}
            disabled={disabled}
            role="tab"
            style={style}
            type="button"
          >
            <span className={styles.triggerLabel}>{children}</span>
            <span aria-hidden className={styles.triggerMenuArrow}>
              <ChevronDownSvg />
            </span>
          </button>
        </MenuTrigger>
        <MenuContent>
          {menuItems.map((item) => (
            <MenuItem
              key={item.value}
              disabled={item.disabled}
              selected={item.value === currentValue}
              value={item.value}
            >
              {item.label}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    );
  }

  // ── Standard tab ─────────────────────────────────────────────────────────────
  return (
    <ArkTabs.Trigger
      className={classNames(styles.trigger, className)}
      data-value={value}
      disabled={disabled}
      style={style}
      value={value}
    >
      <span className={styles.triggerLabel}>{children}</span>
    </ArkTabs.Trigger>
  );
};

// ─── TabContent ───────────────────────────────────────────────────────────────

export const TabContent = ({ value, className, style, children }: TabContentProps) => {
  const { hideContent } = useContext(TabsContext);
  if (hideContent) return null;

  return (
    <ArkTabs.Content className={classNames(styles.content, className)} style={style} value={value}>
      {children}
    </ArkTabs.Content>
  );
};

// ─── TabIndicator ─────────────────────────────────────────────────────────────

export const TabIndicator = ({ className, style }: TabIndicatorProps) => (
  <ArkTabs.Indicator className={classNames(styles.indicator, className)} style={style} />
);
