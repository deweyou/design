# 调研报告：引入 Ark UI 作为组件库基础层

**分支**：`20260327-ark-ui-integration`
**日期**：2026-03-27

---

## 一、Ark UI 概览

### 决策

引入 `@ark-ui/react` 作为交互型组件的行为基础层，具体承担：浮层定位（Positioner）、箭头渲染（Arrow）、Portal 挂载、ARIA 语义、焦点管理、Escape 关闭、外部点击关闭，以及动画状态数据属性（`data-state`）。

### 理由

Ark UI 基于 Zag.js 状态机构建，内部使用 Floating UI 进行定位，为 React 提供语义完整、无样式的组件原语。与直接使用 `@floating-ui/react` 相比，Ark UI 封装了更完整的无障碍契约（ARIA roles、焦点陷阱、屏幕阅读器支持），减少自行实现的代码量，并为后续组件提供统一的基础层范式。

### 备选方案

- **继续使用 `@floating-ui/react`**：已有实现，但需要自行维护所有 ARIA、焦点管理、状态机逻辑；不建立统一基础层范式，不符合引入 Ark UI 的战略目标。
- **完全替换 + API 破坏性变更**：丢弃 hover/focus/context-menu 触发类型，只保留 click；会破坏现有消费方，且实际上 Ark UI 在受控模式下可以支持这些触发类型。

---

## 二、Ark UI Popover 能力边界

### Ark UI 原生提供

| 能力                | 实现方式                                                         |
| ------------------- | ---------------------------------------------------------------- |
| 受控/非受控打开状态 | `open` + `defaultOpen` + `onOpenChange`                          |
| 浮层定位            | `<Popover.Positioner positioning={...}>` (内部使用 Floating UI)  |
| Portal 挂载         | `<Popover.Positioner>` 默认使用 portal                           |
| 箭头渲染            | `<Popover.Arrow>` + `<Popover.ArrowTip>`                         |
| Escape 关闭         | `closeOnEscape`（默认 true）                                     |
| 外部点击关闭        | `closeOnInteractOutside`（默认 true）                            |
| 动画状态            | `data-state="open"/"closed"`                                     |
| ARIA 角色           | `role="dialog"`、`aria-expanded`、`aria-controls` 自动管理       |
| 初始焦点            | `autoFocus`（默认 true）、`initialFocusEl`                       |
| 模态焦点陷阱        | `modal={true}`                                                   |
| 懒挂载 / 卸载       | `lazyMount`、`unmountOnExit`                                     |
| 放置方向            | `positioning.placement`，支持 top/bottom/left/right + cross-axis |

### Ark UI 不原生支持（需自行实现）

| 能力                  | 处理策略                                                                             |
| --------------------- | ------------------------------------------------------------------------------------ |
| `hover` 触发器        | 受控模式：自行监听 mouseover/mouseleave，驱动 `open` 状态；使用 safePolygon 逻辑保留 |
| `focus` 触发器        | 受控模式：自行监听 focus/blur，驱动 `open` 状态                                      |
| `context-menu` 触发器 | 受控模式：自行监听 contextmenu，驱动 `open` 状态                                     |

---

## 三、迁移架构决策

### 决策：混合受控模式

- 对 `trigger: 'click'`（默认值）：直接使用 Ark UI 的 `<Popover.Trigger>`，由 Ark UI 状态机原生管理开关，获得最完整的无障碍支持
- 对 `trigger: 'hover' | 'focus' | 'context-menu'`：将 Ark UI 置于受控模式（`open` prop 由外部状态驱动），在触发器元素上附加自定义事件监听器；Ark UI 仍负责内容渲染、定位、ARIA 和焦点管理

### 理由

这种混合模式实现了：

1. 保持公开 API 完全向后兼容，消费方无感知
2. 利用 Ark UI 的核心价值（Portal、定位、ARIA、焦点）
3. 无需放弃已有的触发类型能力（hover 的 safePolygon 逻辑等）
4. 迁移成本可控，行为风险最小

---

## 四、依赖影响分析

### 新增

- `@ark-ui/react`：作为 `packages/components` 的 `dependencies`

### 可移除（待验证）

- `@floating-ui/react`：若 Ark UI 的 `positioning` prop 能完整覆盖现有的 flip/shift/arrow middleware 配置（预期可以），则可从直接依赖中移除
- 若 hover/focus/context-menu 触发保留，仍需部分 Floating UI 交互逻辑，但可从 `@ark-ui/react` 的内部依赖中间接获取，无需显式依赖

### 包体积

Ark UI 支持按组件树摇（tree-shaking），`@ark-ui/react` 的 Popover 按需导入不会引入整个库。

---

## 五、样式适配策略

### 现有样式系统

- 使用 CSS Modules（Less）
- 通过自定义 `data-*` 属性驱动状态样式（`data-state`、`data-side`、`data-placement`、`data-mode`、`data-shape`）

### 与 Ark UI data 属性的映射

Ark UI 在内容元素上输出 `data-state="open"/"closed"`，在 positioner 上输出 `data-placement`。我们的样式使用自定义 `data-state="open"/"closing"/"closed"`（包含 closing 动画过渡态）。

**策略**：保留现有自定义 data 属性，在组件实现层将 Ark UI 的状态映射到我们的 data 属性；不依赖 Ark UI 的默认 CSS 类名，确保样式层零变化。

---

## 六、项目规范更新内容

### AGENTS.md 新增条款

```
# 组件开发范式：基于 Ark UI 的行为层

交互型组件（含浮层、选择器、对话框、菜单等）必须基于 Ark UI 原语（@ark-ui/react）构建，
而非自行实现行为逻辑。判断准则：

- Ark UI 有对应组件（如 Popover、Dialog、Menu、Tooltip）→ 必须使用
- Ark UI 无对应覆盖（如纯展示组件、特定业务逻辑）→ 可自行实现，
  但需在 spec 或 plan 中说明理由

样式层继续使用 CSS Modules（Less）+ 设计 token，不使用 Ark UI 默认样式。
```

### 宪章新增原则

在宪章「I. 包优先的组件架构」或新增一节，明确 Ark UI 作为组件行为基础层的地位及使用边界。

---

## 七、结论

所有 NEEDS CLARIFICATION 已解决，可进入 Phase 1 设计阶段。
