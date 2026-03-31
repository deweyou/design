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

export type MenuSize = 'sm' | 'md' | 'lg';
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
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  closeOnSelect?: boolean;
  onSelect?: (details: MenuSelectionDetails) => void;
  placement?: MenuPlacement;
  gutter?: number;
  disabled?: boolean;
  size?: MenuSize;
  shape?: MenuShape;
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
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
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
  value?: string;
  disabled?: boolean;
  onSelect?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const MenuItem = ({
  value,
  disabled,
  onSelect,
  icon,
  children,
  className,
  style,
}: MenuItemProps) => (
  <ArkMenuItem
    value={value ?? ''}
    disabled={disabled}
    onSelect={onSelect}
    className={classNames(styles.item, className)}
    style={style}
  >
    {icon !== undefined && <span className={styles.itemIcon}>{icon}</span>}
    <span className={styles.itemLabel}>{children}</span>
  </ArkMenuItem>
);

// ---------------------------------------------------------------------------
// MenuGroup
// ---------------------------------------------------------------------------

export type MenuGroupProps = {
  id?: string;
  label?: string;
  children: ReactNode;
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
  className?: string;
  style?: CSSProperties;
};

export const MenuSeparator = ({ className, style }: MenuSeparatorProps) => (
  <ArkMenuSeparator className={classNames(styles.separator, className)} style={style} />
);

// ---------------------------------------------------------------------------
// MenuTriggerItem (submenu trigger item)
// ---------------------------------------------------------------------------

export type MenuTriggerItemProps = {
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const MenuTriggerItem = ({
  disabled,
  icon,
  children,
  className,
  style,
}: MenuTriggerItemProps) => (
  <ArkMenuTriggerItem
    aria-disabled={disabled || undefined}
    data-disabled={disabled ? '' : undefined}
    className={classNames(styles.item, styles.triggerItem, className)}
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
  value?: string;
  defaultValue?: string;
  onValueChange?: (details: MenuValueChangeDetails) => void;
  children: ReactNode;
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
  value: string;
  disabled?: boolean;
  onSelect?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
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
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (details: MenuCheckedChangeDetails) => void;
  disabled?: boolean;
  value?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
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
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  closeOnSelect?: boolean;
  onSelect?: (details: MenuSelectionDetails) => void;
  size?: MenuSize;
  shape?: MenuShape;
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
