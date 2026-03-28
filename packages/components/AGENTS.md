# AGENTS

## 适用范围

适用于 `packages/components`。

## 约束

- 每个组件都应放在 `src/<component-name>/` 下的独立目录中。
- 每个组件目录内使用 `index.tsx` 作为实现入口，使用 `index.module.less` 承载局部样式。
- 组件单测应与源码同目录放置为 `src/<component-name>/index.test.ts`。
- 本包中的组件和辅助逻辑默认使用箭头函数。
- 除非存在明确的工具限制，否则使用标准 TSX，而不是 `React.createElement`。
- 直接使用 `classnames`，不要再套一层本地 `cx` 包装。
- 组件不得静默注入全局样式。
- 根节点 `className` 仍然是首要的公开样式钩子。
- `packages/components/tests` 下的顶层测试只用于跨 package 或 workspace 边界覆盖。

## 组件开发范式：基于 Ark UI 的行为基础层

本组件库使用 Ark UI（`@ark-ui/react`）作为交互型组件的行为基础层。

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
5. 在开发前安装 Ark UI MCP Server 以便直接查阅 API 文档：`claude mcp add ark-ui -- npx -y @ark-ui/mcp`

### 参考实现

`packages/components/src/popover/index.tsx` 是本范式的参考实现，展示了：

- Ark UI 原生触发（click 模式）的用法
- 受控模式下自定义触发器（hover / focus / context-menu）的桥接方式
- 样式层与 Ark UI 结构的对接方式
