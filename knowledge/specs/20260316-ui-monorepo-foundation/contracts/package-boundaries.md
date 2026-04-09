# 契约：Package 边界

## 目的

定义 UI monorepo 基础建设中每个初始 package 与 app 边界的职责、受众和依赖方向。

## 边界

### `packages/utils`

- **目的**：框架无关的 utility 逻辑
- **受众**：其他 packages 与维护者
- **可依赖**：不能依赖任何更高层 package
- **不得承担**：React hooks、组件实现、app 特定文档逻辑
- **公开契约**：稳定的 utility 导出，且不要求 React 运行时

### `packages/hooks`

- **目的**：在多个组件或 apps 之间共享的可复用 React hooks
- **受众**：`components`、`website` 和内部维护者
- **可依赖**：React 与更底层 utilities
- **不得承担**：应放在 `utils` 中的框架无关 helper，以及只服务于某一个组件的组件特定 hook
- **公开契约**：稳定的 hook 导出与被文档化的 hook 行为

### `packages/styles`

- **目的**：设计 token 源、主题定义、reset / base CSS，以及生成出的主题产物
- **受众**：消费者、`components`、`website`、`storybook` 和维护者
- **可依赖**：仅限生成所需的工具
- **不得承担**：组件实现或 app 特定内容
- **公开契约**：
  - 面向消费者的显式全局样式入口
  - 独立的亮色与暗色主题输出
  - 文档化的默认主题入口
  - 面向文档与工具的 token 元数据

### `packages/components`

- **目的**：可复用 UI 组件及其组件本地样式
- **受众**：应用开发者与 app 表面
- **可依赖**：`styles`、`hooks` 和 `utils`
- **不得承担**：全局主题注入，或只在 app 中存在的组件 demo 作为唯一行为来源
- **公开契约**：
  - 组件导出
  - 根级 `className` 支持
  - 在有文档说明时，允许有限的组件级 CSS 变量覆盖

### `apps/website`

- **目的**：公开文档、设计理念、精选 demo 和有限交互式 playground 内容
- **受众**：应用开发者、设计师和评估者
- **可依赖**：可复用 packages
- **不得承担**：本应进入 packages 的可复用行为，以及穷举式的内部验证内容
- **公开契约**：面向用户的官方指导和示例

### `apps/storybook`

- **目的**：内部状态评审、边界情况验证与探索式组件开发支持
- **受众**：维护者和评审者
- **可依赖**：可复用 packages
- **不得承担**：作为用户唯一官方文档入口
- **公开契约**：仅面向内部评审的表面

## 依赖规则

- 依赖方向必须从 apps 和高层 packages 指向底层基础 packages。
- `components` 可以依赖 `styles`、`hooks` 和 `utils`。
- `hooks` 可以依赖 `utils`，但不能依赖 `components`。
- `styles` 和 `utils` 作为底层基础存在，不能依赖 `components`、`website` 或 `storybook`。
- 禁止循环 package 依赖。
