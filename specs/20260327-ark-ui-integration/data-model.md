# 数据模型：引入 Ark UI 作为组件库基础层

**分支**：`20260327-ark-ui-integration`
**日期**：2026-03-27

---

## 说明

本功能是纯 UI 组件层改造，不涉及持久化数据存储或后端服务。「数据模型」在此语境下描述的是 **组件状态模型** 和 **公开 API 类型契约**。

---

## 一、Popover 状态模型

### 核心状态

| 状态字段            | 类型                              | 说明                                                               |
| ------------------- | --------------------------------- | ------------------------------------------------------------------ |
| `open`              | `boolean`                         | 浮层是否处于打开状态                                               |
| `isOverlayMounted`  | `boolean`                         | 浮层 DOM 是否已挂载（含关闭动画阶段）                              |
| `isControlled`      | `boolean`                         | 是否为受控模式（`visible` prop 被传入）                            |
| `currentState`      | `'open' \| 'closing' \| 'closed'` | 用于驱动 CSS 动画的三态状态                                        |
| `resolvedPlacement` | `PopoverPlacement`                | Floating UI 计算后的实际放置方向（可能因边界翻转而不同于请求方向） |

### 状态转换

```
closed → open：触发器激活（click / hover / focus / context-menu）
open → closing：dismiss 事件触发（外部点击 / Escape / 触发器再次激活）
closing → closed：关闭动画完成后（160ms 后 DOM 卸载）
open ←→ closing：关闭过程中重新触发可回到 open
```

### 触发模式

| 触发类型       | 打开条件           | 关闭条件                            |
| -------------- | ------------------ | ----------------------------------- |
| `click`        | 点击触发器         | 再次点击触发器 / 外部点击 / Escape  |
| `hover`        | 鼠标进入触发器区域 | 鼠标离开触发器 + 浮层安全多边形区域 |
| `focus`        | 触发器获得焦点     | 焦点离开触发器 + 浮层区域           |
| `context-menu` | 右键点击触发器     | 外部点击 / Escape                   |

---

## 二、公开 API 类型（保持向后兼容）

### 枚举型选项集

```typescript
// 触发方式
popoverTriggerOptions = ['click', 'hover', 'focus', 'context-menu']
type PopoverTrigger = 'click' | 'hover' | 'focus' | 'context-menu'

// 放置位置
popoverPlacementOptions = ['top', 'bottom', 'left', 'right', 'left-top', 'left-bottom', 'right-top', 'right-bottom']
type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'

// 内容模式
popoverModeOptions = ['card', 'loose', 'pure']
type PopoverMode = 'card' | 'loose' | 'pure'

// 形状变体
popoverShapeOptions = ['rect', 'rounded']
type PopoverShape = 'rect' | 'rounded'

// 可见性变更原因
popoverVisibilityChangeReasonOptions = ['trigger', 'context-menu', 'outside-press', 'escape', 'explicit-action', 'controlled-update', 'disabled-reference']
type PopoverVisibilityChangeReason = ...
```

### PopoverProps（与现有保持完全兼容）

| Prop                   | 类型                                                                  | 默认值      | 说明                     |
| ---------------------- | --------------------------------------------------------------------- | ----------- | ------------------------ |
| `children`             | `ReactNode`                                                           | —           | 触发器元素               |
| `content`              | `ReactNode`                                                           | 必填        | 浮层内容                 |
| `visible`              | `boolean`                                                             | —           | 受控打开状态             |
| `defaultVisible`       | `boolean`                                                             | `false`     | 非受控初始状态           |
| `disabled`             | `boolean`                                                             | `false`     | 是否禁用                 |
| `trigger`              | `PopoverTrigger \| readonly PopoverTrigger[]`                         | `'click'`   | 触发方式                 |
| `placement`            | `PopoverPlacement`                                                    | `'bottom'`  | 首选放置方向             |
| `offset`               | `number`                                                              | `8`         | 触发器与浮层的间距（px） |
| `boundaryPadding`      | `number`                                                              | `16`        | 边界安全距离（px）       |
| `mode`                 | `PopoverMode`                                                         | `'card'`    | 内容区 padding 样式      |
| `shape`                | `PopoverShape`                                                        | `'rounded'` | 圆角变体                 |
| `onVisibleChange`      | `(visible: boolean, details: PopoverVisibilityChangeDetails) => void` | —           | 可见性变更回调           |
| `overlayClassName`     | `string`                                                              | —           | 浮层容器附加 class       |
| `overlayStyle`         | `CSSProperties`                                                       | —           | 浮层容器附加 style       |
| `popupPortalContainer` | `HTMLElement \| ShadowRoot \| null \| { current: ... }`               | —           | 自定义 Portal 挂载节点   |

---

## 三、视觉状态模型

### data 属性（浮层元素）

| 属性                       | 可选值                                                 | 说明                                 |
| -------------------------- | ------------------------------------------------------ | ------------------------------------ |
| `data-state`               | `open` / `closing` / `closed`                          | 驱动 CSS 入场/离场动画               |
| `data-placement`           | `top` / `bottom` / `left` / `right` / `left-top` / ... | 实际放置方向（Floating UI 计算结果） |
| `data-requested-placement` | 同上                                                   | 请求的首选放置方向                   |
| `data-side`                | `top` / `bottom` / `left` / `right`                    | 用于箭头定位                         |
| `data-mode`                | `card` / `loose` / `pure`                              | 内容模式                             |
| `data-shape`               | `rect` / `rounded`                                     | 形状变体                             |

### data 属性（触发器元素）

| 属性            | 可选值           | 说明            |
| --------------- | ---------------- | --------------- |
| `data-disabled` | `true` / `false` | 是否禁用        |
| `data-visible`  | `true` / `false` | 浮层是否打开    |
| `aria-expanded` | `true` / `false` | 无障碍展开状态  |
| `aria-haspopup` | `dialog`         | 无障碍弹出类型  |
| `aria-controls` | `{floatingId}`   | 指向浮层内容 id |
