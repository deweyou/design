/**
 * Menu 组件公开 API 契约
 *
 * 本文件定义 `@deweyou-ui/components` 中 Menu 组件族的 TypeScript 类型接口。
 * 这些类型代表消费方可见的公开 API 面，不暴露 Ark UI 内部类型。
 *
 * 文件路径（实现阶段）：packages/components/src/menu/index.tsx
 */

import type { CSSProperties, ReactNode } from 'react';

// ---------------------------------------------------------------------------
// 基础类型
// ---------------------------------------------------------------------------

/** 菜单浮层位置（Ark UI Placement 子集） */
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

/** 菜单开关状态变化详情 */
export type MenuOpenChangeDetails = {
  open: boolean;
};

/** 菜单项选中详情 */
export type MenuSelectionDetails = {
  /** 被选中的菜单项 value */
  value: string;
};

/** 单选分组值变化详情 */
export type MenuValueChangeDetails = {
  /** 新的选中值 */
  value: string;
};

/** 多选项 checked 变化详情 */
export type MenuCheckedChangeDetails = {
  /** 新的选中状态 */
  checked: boolean;
};

// ---------------------------------------------------------------------------
// Menu（根容器）
// ---------------------------------------------------------------------------

export type MenuProps = {
  /** 受控：菜单是否展开 */
  open?: boolean;
  /** 非受控初始展开状态（默认 false） */
  defaultOpen?: boolean;
  /** 开关状态变化回调 */
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  /** 点击菜单项后是否自动关闭（默认 true） */
  closeOnSelect?: boolean;
  /** 全局选中回调，携带被激活项的 value */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** 菜单浮层相对触发器的位置（默认 'bottom-start'） */
  placement?: MenuPlacement;
  /** 触发器与菜单面板之间的间距 px（默认 4） */
  gutter?: number;
  /** 禁用触发，不响应任何交互（默认 false） */
  disabled?: boolean;
  /** 必填：包含 MenuTrigger + MenuContent */
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// MenuTrigger
// ---------------------------------------------------------------------------

export type MenuTriggerProps = {
  /** 触发元素，通常是 Button 组件 */
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// MenuContent
// ---------------------------------------------------------------------------

export type MenuContentProps = {
  /** 菜单项列表 */
  children: ReactNode;
  /** 额外 CSS 类 */
  className?: string;
  /** 内联样式 */
  style?: CSSProperties;
  /** 自定义 Portal 挂载容器（默认 document.body） */
  portalContainer?: HTMLElement | null;
};

// ---------------------------------------------------------------------------
// MenuItem
// ---------------------------------------------------------------------------

export type MenuItemProps = {
  /** 唯一标识，用于 onSelect 回调 */
  value?: string;
  /** 禁用态，不响应交互（默认 false） */
  disabled?: boolean;
  /** 该项被激活时的回调 */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** 前置图标（可选） */
  icon?: ReactNode;
  /** 菜单项标签内容 */
  children: ReactNode;
  /** 额外 CSS 类 */
  className?: string;
};

// ---------------------------------------------------------------------------
// MenuGroup
// ---------------------------------------------------------------------------

export type MenuGroupProps = {
  /** 分组唯一 ID（用于 ARIA 关联） */
  id?: string;
  /** 可选分组标签文字，存在时自动渲染 MenuGroupLabel */
  label?: string;
  /** 包含的 MenuItem 或 MenuSeparator 列表 */
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// MenuGroupLabel
// ---------------------------------------------------------------------------

export type MenuGroupLabelProps = {
  /** 关联的 MenuGroup id */
  htmlFor?: string;
  /** 标签文字 */
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// MenuSeparator
// ---------------------------------------------------------------------------

export type MenuSeparatorProps = {
  /** 额外 CSS 类 */
  className?: string;
};

// ---------------------------------------------------------------------------
// MenuTriggerItem（子菜单触发项）
// ---------------------------------------------------------------------------

export type MenuTriggerItemProps = {
  /** 禁用态（默认 false） */
  disabled?: boolean;
  /** 前置图标（可选） */
  icon?: ReactNode;
  /** 菜单项标签内容 */
  children: ReactNode;
  /** 额外 CSS 类 */
  className?: string;
};

// ---------------------------------------------------------------------------
// MenuRadioGroup
// ---------------------------------------------------------------------------

export type MenuRadioGroupProps = {
  /** 受控选中值 */
  value?: string;
  /** 非受控初始选中值 */
  defaultValue?: string;
  /** 选中值变化回调 */
  onValueChange?: (details: MenuValueChangeDetails) => void;
  /** 包含的 MenuRadioItem 列表 */
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// MenuRadioItem
// ---------------------------------------------------------------------------

export type MenuRadioItemProps = {
  /** 必填：与 RadioGroup 当前 value 比对以确定选中态 */
  value: string;
  /** 禁用态（默认 false） */
  disabled?: boolean;
  /** 被激活时的额外回调 */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** 前置图标（可选） */
  icon?: ReactNode;
  /** 菜单项标签内容 */
  children: ReactNode;
  /** 额外 CSS 类 */
  className?: string;
};

// ---------------------------------------------------------------------------
// MenuCheckboxItem
// ---------------------------------------------------------------------------

export type MenuCheckboxItemProps = {
  /** 受控选中状态 */
  checked?: boolean;
  /** 非受控初始选中状态（默认 false） */
  defaultChecked?: boolean;
  /** 选中状态变化回调 */
  onCheckedChange?: (details: MenuCheckedChangeDetails) => void;
  /** 禁用态（默认 false） */
  disabled?: boolean;
  /** 可选唯一标识，用于 onSelect 回调 */
  value?: string;
  /** 前置图标（可选） */
  icon?: ReactNode;
  /** 菜单项标签内容 */
  children: ReactNode;
  /** 额外 CSS 类 */
  className?: string;
};

// ---------------------------------------------------------------------------
// ContextMenu（右键菜单）
// ---------------------------------------------------------------------------

export type ContextMenuProps = {
  /** 受控开关 */
  open?: boolean;
  /** 非受控初始展开状态（默认 false） */
  defaultOpen?: boolean;
  /** 开关状态变化回调 */
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  /** 点击菜单项后是否自动关闭（默认 true） */
  closeOnSelect?: boolean;
  /** 全局选中回调 */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** 必填：包含 ContextMenu.Trigger + ContextMenu.Content */
  children: ReactNode;
};

export type ContextMenuTriggerProps = {
  /** 右键触发目标区域 */
  children: ReactNode;
  /** 额外 CSS 类 */
  className?: string;
};

export type ContextMenuContentProps = MenuContentProps;

// ---------------------------------------------------------------------------
// 组合导出（对应 packages/components/src/index.ts 导出面）
// ---------------------------------------------------------------------------

/**
 * 预期从 @deweyou-ui/components 导出的成员：
 *
 * export {
 *   Menu,
 *   MenuTrigger,
 *   MenuContent,
 *   MenuItem,
 *   MenuGroup,
 *   MenuGroupLabel,
 *   MenuSeparator,
 *   MenuTriggerItem,
 *   MenuRadioGroup,
 *   MenuRadioItem,
 *   MenuCheckboxItem,
 *   ContextMenu,
 *   type MenuProps,
 *   type MenuTriggerProps,
 *   type MenuContentProps,
 *   type MenuItemProps,
 *   type MenuGroupProps,
 *   type MenuGroupLabelProps,
 *   type MenuSeparatorProps,
 *   type MenuTriggerItemProps,
 *   type MenuRadioGroupProps,
 *   type MenuRadioItemProps,
 *   type MenuCheckboxItemProps,
 *   type ContextMenuProps,
 *   type ContextMenuTriggerProps,
 *   type ContextMenuContentProps,
 *   type MenuPlacement,
 *   type MenuOpenChangeDetails,
 *   type MenuSelectionDetails,
 *   type MenuValueChangeDetails,
 *   type MenuCheckedChangeDetails,
 * } from './menu/index.tsx';
 */
