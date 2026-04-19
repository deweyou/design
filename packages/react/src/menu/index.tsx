import {
  createContext,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  MenuRoot as ArkMenuRoot,
  MenuTrigger as ArkMenuTrigger,
  MenuContent as ArkMenuContent,
  MenuPositioner as ArkMenuPositioner,
  MenuItem as ArkMenuItem,
  MenuItemGroup as ArkMenuItemGroup,
  MenuItemGroupLabel as ArkMenuItemGroupLabel,
  MenuSeparator as ArkMenuSeparator,
  MenuTriggerItem as ArkMenuTriggerItem,
  MenuRadioItemGroup as ArkMenuRadioItemGroup,
  MenuRadioItem as ArkMenuRadioItem,
  MenuCheckboxItem as ArkMenuCheckboxItem,
  MenuItemIndicator as ArkMenuItemIndicator,
  MenuContextTrigger as ArkMenuContextTrigger,
} from '@ark-ui/react/menu';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Size / shape context
// ---------------------------------------------------------------------------

/** Size scale for the menu panel and its items. */
export type MenuSize = 'sm' | 'md' | 'lg';

/** Corner shape of the menu panel. */
export type MenuShape = 'rect' | 'rounded';

type MenuContextValue = { size: MenuSize; shape: MenuShape };

const MenuContext = createContext<MenuContextValue>({ size: 'md', shape: 'rounded' });

const sizeClassMap: Record<MenuSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const shapeClassMap: Record<MenuShape, string> = {
  rect: styles.shapeRect,
  rounded: styles.shapeRounded,
};

// ---------------------------------------------------------------------------
// Inline SVG icons (avoids cross-package dependency on @deweyou-ui/icons)
// ---------------------------------------------------------------------------

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <g id="check">
      <path
        id="stroke1"
        stroke="currentColor"
        d="M19.5708 7.37842L10.3785 16.5708L5.42871 11.6211"
        strokeLinecap="square"
        strokeWidth="2"
      />
    </g>
  </svg>
);

const ChevronRightSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <g id="chevron-right">
      <path
        id="stroke1"
        stroke="currentColor"
        d="M9.5 17.5L15 12L9.5 6.5"
        strokeLinecap="square"
        strokeWidth="2"
      />
    </g>
  </svg>
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MenuPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type MenuOpenChangeDetails = { open: boolean };
export type MenuSelectionDetails = { value: string };
export type MenuValueChangeDetails = { value: string };
export type MenuCheckedChangeDetails = { checked: boolean };

// ---------------------------------------------------------------------------
// Menu (root)
// ---------------------------------------------------------------------------

export type MenuProps = {
  /** Controlled open state. Use with onOpenChange for full control. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to false. */
  defaultOpen?: boolean;
  /** Callback fired when the menu opens or closes. */
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  /** Whether the menu closes when a MenuItem is selected. Defaults to true. */
  closeOnSelect?: boolean;
  /** Callback fired when a menu item is selected. */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** Preferred placement of the menu relative to its trigger. Defaults to 'bottom-start'. */
  placement?: MenuPlacement;
  /** Gap in pixels between the trigger and the panel. Defaults to 4. */
  gutter?: number;
  /** When true, the menu cannot be opened. */
  disabled?: boolean;
  /** Size scale for the panel content. 'sm' | 'md' | 'lg'. Defaults to 'md'. */
  size?: MenuSize;
  /** Corner shape of the panel. 'rounded' (default) | 'rect'. */
  shape?: MenuShape;
  /** Must include a MenuTrigger and a MenuContent as children. */
  children: ReactNode;
};

export const Menu = ({
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect,
  onSelect,
  placement = 'bottom-start',
  gutter = 4,
  disabled,
  size = 'md',
  shape = 'rounded',
  children,
}: MenuProps) => (
  <ArkMenuRoot
    open={disabled ? false : open}
    defaultOpen={disabled ? false : defaultOpen}
    onOpenChange={disabled ? undefined : onOpenChange}
    closeOnSelect={closeOnSelect}
    onSelect={onSelect}
    lazyMount
    unmountOnExit
    positioning={{ placement, gutter }}
  >
    <MenuContext.Provider value={{ size, shape }}>{children}</MenuContext.Provider>
  </ArkMenuRoot>
);

// ---------------------------------------------------------------------------
// MenuTrigger
// ---------------------------------------------------------------------------

export type MenuTriggerProps = {
  /** The trigger element. Must be a single focusable element (e.g. a Button). */
  children: ReactNode;
};

export const MenuTrigger = ({ children }: MenuTriggerProps) => (
  <ArkMenuTrigger asChild>{children}</ArkMenuTrigger>
);

// ---------------------------------------------------------------------------
// MenuContent (inner — rendered inside positioner context)
// ---------------------------------------------------------------------------

type MenuContentInnerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const MenuContentInner = ({ children, className, style }: MenuContentInnerProps) => (
  <ArkMenuPositioner>
    <ArkMenuContent className={classNames(styles.content, className)} style={style}>
      {children}
    </ArkMenuContent>
  </ArkMenuPositioner>
);

// ---------------------------------------------------------------------------
// MenuContent (public — portaled to document.body)
// ---------------------------------------------------------------------------

export type MenuContentProps = {
  /** Menu items and groups to display in the panel. */
  children: ReactNode;
  /** Additional CSS class applied to the panel element. */
  className?: string;
  /** Inline style applied to the panel element. */
  style?: CSSProperties;
  /** Override the portal target. Defaults to document.body. Pass null to disable portaling. */
  portalContainer?: HTMLElement | null;
};

export const MenuContent = ({ children, className, style, portalContainer }: MenuContentProps) => {
  const { size, shape } = useContext(MenuContext);
  const container =
    portalContainer !== undefined
      ? portalContainer
      : typeof document !== 'undefined'
        ? document.body
        : null;

  const inner = (
    <MenuContentInner
      className={classNames(sizeClassMap[size], shapeClassMap[shape], className)}
      style={style}
    >
      {children}
    </MenuContentInner>
  );

  return container ? createPortal(inner, container) : inner;
};

// ---------------------------------------------------------------------------
// MenuItem
// ---------------------------------------------------------------------------

export type MenuItemProps = {
  /** Unique identifier used by onSelect. Defaults to '' when omitted. */
  value?: string;
  /** When true, the item is not interactive. */
  disabled?: boolean;
  /** Callback fired when this specific item is selected. */
  onSelect?: () => void;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /** When true, renders a trailing checkmark to indicate this item is the active selection. */
  selected?: boolean;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style applied to the item element. */
  style?: CSSProperties;
};

export const MenuItem = ({
  value,
  disabled,
  onSelect,
  icon,
  selected,
  children,
  className,
  style,
}: MenuItemProps) => (
  <ArkMenuItem
    value={value ?? ''}
    disabled={disabled}
    onSelect={onSelect}
    className={classNames(styles.item, { [styles.itemSelected]: selected }, className)}
    style={style}
  >
    {icon !== undefined && <span className={styles.itemIcon}>{icon}</span>}
    <span className={styles.itemLabel}>{children}</span>
    {selected && (
      <span aria-hidden className={styles.itemCheckmark}>
        <CheckSvg />
      </span>
    )}
  </ArkMenuItem>
);

// ---------------------------------------------------------------------------
// MenuGroup
// ---------------------------------------------------------------------------

export type MenuGroupProps = {
  /** Optional id for the group element. Auto-generated when omitted. */
  id?: string;
  /** Optional group label rendered above the items. */
  label?: string;
  /** MenuItem elements belonging to this group. */
  children: ReactNode;
  /** Additional CSS class applied to the group element. */
  className?: string;
};

export const MenuGroup = ({ id: externalId, label, children, className }: MenuGroupProps) => {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <ArkMenuItemGroup id={id} className={classNames(styles.group, className)}>
      {label !== undefined && (
        <ArkMenuItemGroupLabel className={styles.groupLabel}>{label}</ArkMenuItemGroupLabel>
      )}
      {children}
    </ArkMenuItemGroup>
  );
};

// ---------------------------------------------------------------------------
// MenuGroupLabel (standalone — for manual control)
// ---------------------------------------------------------------------------

export type MenuGroupLabelProps = {
  children: ReactNode;
  className?: string;
};

export const MenuGroupLabel = ({ children, className }: MenuGroupLabelProps) => (
  <ArkMenuItemGroupLabel className={classNames(styles.groupLabel, className)}>
    {children}
  </ArkMenuItemGroupLabel>
);

// ---------------------------------------------------------------------------
// MenuSeparator
// ---------------------------------------------------------------------------

export type MenuSeparatorProps = {
  /** Additional CSS class applied to the separator element. */
  className?: string;
  /** Inline style applied to the separator element. */
  style?: CSSProperties;
};

export const MenuSeparator = ({ className, style }: MenuSeparatorProps) => (
  <ArkMenuSeparator className={classNames(styles.separator, className)} style={style} />
);

// ---------------------------------------------------------------------------
// MenuTriggerItem (submenu trigger item)
// ---------------------------------------------------------------------------

export type MenuTriggerItemProps = {
  /** When true, the trigger item is not interactive. */
  disabled?: boolean;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /** When true, styles the item as active (e.g. a sub-item is currently selected). */
  selected?: boolean;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the trigger item element. */
  className?: string;
  /** Inline style applied to the trigger item element. */
  style?: CSSProperties;
};

export const MenuTriggerItem = ({
  disabled,
  icon,
  selected,
  children,
  className,
  style,
}: MenuTriggerItemProps) => (
  <ArkMenuTriggerItem
    aria-disabled={disabled || undefined}
    data-disabled={disabled ? '' : undefined}
    className={classNames(
      styles.item,
      styles.triggerItem,
      { [styles.itemSelected]: selected },
      className,
    )}
    style={style}
  >
    {icon !== undefined && <span className={styles.itemIcon}>{icon}</span>}
    <span className={styles.itemLabel}>{children}</span>
    <span className={styles.triggerItemArrow} aria-hidden="true">
      <ChevronRightSvg />
    </span>
  </ArkMenuTriggerItem>
);

// ---------------------------------------------------------------------------
// MenuRadioGroup
// ---------------------------------------------------------------------------

export type MenuRadioGroupProps = {
  /** Controlled selected value. Use with onValueChange for full control. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the selected value changes. */
  onValueChange?: (details: MenuValueChangeDetails) => void;
  /** MenuRadioItem elements belonging to this group. */
  children: ReactNode;
  /** Additional CSS class applied to the group element. */
  className?: string;
};

export const MenuRadioGroup = ({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: MenuRadioGroupProps) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const resolvedValue = isControlled ? value : internalValue;

  const handleValueChange = (details: MenuValueChangeDetails) => {
    if (!isControlled) {
      setInternalValue(details.value);
    }
    onValueChange?.(details);
  };

  return (
    <ArkMenuRadioItemGroup
      value={resolvedValue}
      onValueChange={handleValueChange}
      className={className}
    >
      {children}
    </ArkMenuRadioItemGroup>
  );
};

// ---------------------------------------------------------------------------
// MenuRadioItem
// ---------------------------------------------------------------------------

export type MenuRadioItemProps = {
  /** The value this item represents within its MenuRadioGroup. */
  value: string;
  /** When true, the item is not interactive. */
  disabled?: boolean;
  /** Callback fired when this specific item is selected. */
  onSelect?: () => void;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style applied to the item element. */
  style?: CSSProperties;
};

export const MenuRadioItem = ({
  value,
  disabled,
  onSelect,
  icon,
  children,
  className,
  style,
}: MenuRadioItemProps) => (
  <ArkMenuRadioItem
    value={value}
    disabled={disabled}
    onSelect={onSelect}
    className={classNames(styles.item, styles.selectableItem, className)}
    style={style}
  >
    {icon !== undefined && <span className={styles.itemIcon}>{icon}</span>}
    <span className={styles.itemLabel}>{children}</span>
    <ArkMenuItemIndicator className={styles.itemIndicator}>
      <CheckSvg />
    </ArkMenuItemIndicator>
  </ArkMenuRadioItem>
);

// ---------------------------------------------------------------------------
// MenuCheckboxItem
// ---------------------------------------------------------------------------

export type MenuCheckboxItemProps = {
  /** Controlled checked state. Use with onCheckedChange for full control. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. Defaults to false. */
  defaultChecked?: boolean;
  /** Callback fired when the checked state changes. */
  onCheckedChange?: (details: MenuCheckedChangeDetails) => void;
  /** When true, the item is not interactive. */
  disabled?: boolean;
  /** Optional value identifier for this item. */
  value?: string;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style applied to the item element. */
  style?: CSSProperties;
};

export const MenuCheckboxItem = ({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  value,
  icon,
  children,
  className,
  style,
}: MenuCheckboxItemProps) => {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const resolvedChecked = isControlled ? checked : internalChecked;

  const handleCheckedChange = (nextChecked: boolean) => {
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }
    onCheckedChange?.({ checked: nextChecked });
  };

  return (
    <ArkMenuCheckboxItem
      checked={resolvedChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      value={value ?? ''}
      className={classNames(styles.item, styles.selectableItem, className)}
      style={style}
    >
      {icon !== undefined && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
      <ArkMenuItemIndicator className={styles.itemIndicator}>
        <CheckSvg />
      </ArkMenuItemIndicator>
    </ArkMenuCheckboxItem>
  );
};

// ---------------------------------------------------------------------------
// ContextMenu
// ---------------------------------------------------------------------------

export type ContextMenuProps = {
  /** Controlled open state. Use with onOpenChange for full control. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to false. */
  defaultOpen?: boolean;
  /** Callback fired when the context menu opens or closes. */
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  /** Whether the menu closes when a MenuItem is selected. Defaults to true. */
  closeOnSelect?: boolean;
  /** Callback fired when a menu item is selected. */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** Size scale for the panel content. 'sm' | 'md' | 'lg'. Defaults to 'md'. */
  size?: MenuSize;
  /** Corner shape of the panel. 'rounded' (default) | 'rect'. */
  shape?: MenuShape;
  /** Must include a ContextMenu.Trigger and a ContextMenu.Content as children. */
  children: ReactNode;
};

export type ContextMenuTriggerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

export type ContextMenuContentProps = MenuContentProps;

const ContextMenuTriggerInner = ({
  children,
  className,
  style,
  ...rest
}: ContextMenuTriggerProps) => (
  <ArkMenuContextTrigger
    className={classNames(styles.contextTrigger, className)}
    style={style}
    {...rest}
  >
    {children}
  </ArkMenuContextTrigger>
);

export const ContextMenu = ({
  open,
  defaultOpen,
  onOpenChange,
  closeOnSelect,
  onSelect,
  size = 'md',
  shape = 'rounded',
  children,
}: ContextMenuProps) => (
  <ArkMenuRoot
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    closeOnSelect={closeOnSelect}
    onSelect={onSelect}
    lazyMount
    unmountOnExit
  >
    <MenuContext.Provider value={{ size, shape }}>{children}</MenuContext.Provider>
  </ArkMenuRoot>
);

ContextMenu.Trigger = ContextMenuTriggerInner;
ContextMenu.Content = MenuContent;
