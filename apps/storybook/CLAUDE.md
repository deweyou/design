# CLAUDE

## 适用范围

适用于 `apps/storybook`。

## 约束

- `apps/storybook` 仅用于内部评审和状态验证。
- 不要复制 `apps/website` 中完整的公开文档内容。
- 必须显式从 `@deweyou-ui/styles/theme.css` 导入全局样式。
- stories 应聚焦组件状态、边界情况和评审工作流。
- Storybook 相关依赖应保持在同一发布线，避免重新引入已废弃的 legacy add-on 包。
