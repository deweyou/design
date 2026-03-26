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
