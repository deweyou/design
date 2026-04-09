# 公开 API 契约：@deweyou-ui/components — Popover

**版本影响**：`0.x.y` → 内部重构，无破坏性变更，semver patch 或 minor 均可（无公开 API 变化）
**日期**：2026-03-27

---

## 变更摘要

| 维度        | 变更前                                | 变更后                                   |
| ----------- | ------------------------------------- | ---------------------------------------- |
| 行为基础层  | 自行实现（基于 `@floating-ui/react`） | Ark UI 原语（`@ark-ui/react`）           |
| 公开 Props  | 不变                                  | 不变（向后兼容）                         |
| 导出类型    | 不变                                  | 不变                                     |
| 视觉表现    | 不变                                  | 不变（同等设计 token 驱动）              |
| 无障碍行为  | 自行实现                              | Ark UI 原生提供（改善）                  |
| 包 API 入口 | `@deweyou-ui/components/popover`      | `@deweyou-ui/components/popover`（不变） |

---

## 公开导出契约

```typescript
// 从 @deweyou-ui/components/popover 导出（保持不变）

export { Popover } from './index';

export {
  popoverTriggerOptions,
  popoverPlacementOptions,
  popoverModeOptions,
  popoverShapeOptions,
  popoverVisibilityChangeReasonOptions,
} from './index';

export type {
  PopoverProps,
  PopoverTrigger,
  PopoverPlacement,
  PopoverMode,
  PopoverShape,
  PopoverVisibilityChangeReason,
  PopoverVisibilityChangeDetails,
} from './index';
```

---

## Props 契约（向后兼容，无变更）

所有现有 props 保持不变，包括：

- 受控模式：`visible` / `defaultVisible` / `onVisibleChange`
- 触发类型：`trigger`（支持 `click` / `hover` / `focus` / `context-menu`）
- 放置方向：`placement`
- 视觉变体：`mode` / `shape`
- 约束配置：`offset` / `boundaryPadding` / `disabled`
- 样式透传：`overlayClassName` / `overlayStyle` / `className` / `style`
- Portal：`popupPortalContainer`

---

## DOM 契约（保持不变）

- 触发器：保留 `data-popover-reference="true"` 数据属性
- 浮层：保留 `data-popover-overlay="true"` 数据属性（供测试/消费方查询使用）
- 箭头：保留 `data-popover-arrow="true"` 数据属性

---

## 兼容性说明

- 不引入 breaking change
- 对消费方完全透明（无需修改任何调用侧代码）
- 行为差异：无障碍属性可能更完整（由 Ark UI 生成），但不影响现有功能
- 如 Ark UI 内部生成的 ARIA id 格式与现有不同，消费方如果依赖具体 id 格式应注意更新测试快照

---

## AGENTS.md 规范条款（新增）

### 组件开发范式（新增节）

```markdown
## 组件开发范式：基于 Ark UI 的行为基础层

本组件库使用 Ark UI（@ark-ui/react）作为交互型组件的行为基础层。

### 使用准则

**应当使用 Ark UI 的场景**：

- 浮层类组件（Popover、Tooltip、HoverCard、Menu、Dialog 等）
- 选择器类组件（Select、Combobox、DatePicker、ColorPicker 等）
- 表单增强组件（Checkbox、Switch、RadioGroup、Slider 等）
- 任何 Ark UI 有对应原语的交互型组件

**不需要使用 Ark UI 的场景**：

- 纯展示组件（Text、Icon 等）
- 纯样式封装（如 Button 当前实现已经足够）
- Ark UI 无对应覆盖的特定业务逻辑

### 实现约定

1. 使用 Ark UI 原语提供行为（状态机、ARIA、焦点管理、定位）
2. 所有样式通过 CSS Modules（Less）+ 设计 token 实现，不使用 Ark UI 提供的任何默认样式
3. 保持公开 API 与 Ark UI 原语解耦（不将 Ark UI props 直接透传给消费方）
4. 如需在 Ark UI 不支持的触发类型上叠加行为，使用受控模式（`open` prop）桥接
```
