# 归档：Menu 组件

**分支**：`20260329-menu-component`  
**完成时间**：2026-03-29  
**类型**：feat

---

## 交付摘要

基于 `@ark-ui/react` Menu 原语实现了完整的 Menu 组件体系，包括 `Menu`、`MenuItem`、`MenuGroup`、`MenuSeparator`、`MenuTriggerItem`（多级子菜单）、`MenuRadioGroup`/`MenuRadioItem`（单选）、`MenuCheckboxItem`（多选），以及 `ContextMenu` 右键菜单模式。组件支持受控/非受控开关状态，选中态（单选/多选）支持受控/非受控两种管理方式，选中项右侧展示 check 图标并呈现主题色。提供 `size`（`sm`/`md`/`lg`）和 `shape`（`rounded`/`rect`）属性，所有样式通过 CSS Modules + 现有设计 token 实现，不新增 token。

---

## 关键决策

| 决策            | 选择                                              | 理由                                                 | 备选方案                              |
| --------------- | ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| 行为层          | 完全基于 Ark UI Menu 原语                         | 遵循 Ark UI 集成范式，不自行实现状态机和 ARIA        | 自行实现                              |
| `disabled` 实现 | 不设置 `pointer-events: none`，由 Ark UI 内部控制 | 保留 `cursor: not-allowed` 视觉，Ark UI 负责禁用交互 | 组件层直接设置 `pointer-events: none` |
| check 图标来源  | `@deweyou-design/react-icons` 的 `check` 图标     | 复用共享图标包，不引入私有资产                       | 内联 SVG                              |

---

## 踩坑记录

- **问题**：`disabled` 菜单项需要显示 `cursor: not-allowed` 但又不能阻断 Ark UI 内部的交互禁用逻辑。  
  **解决方案**：样式层只设置 `cursor`，交互禁用由 Ark UI 的 `aria-disabled` 机制处理，不叠加 `pointer-events: none`。

---

## 可复用模式

- [多级子菜单嵌套]：通过 Ark UI `Menu.TriggerItem` + 嵌套 `Menu` 实现无限层级子菜单，定位由 Ark UI 内置浮层引擎处理，后续类似嵌套浮层场景可参考此模式。

---

## 宪章反馈

- [ ] 无需更新

---

## 后续待办

- 无
