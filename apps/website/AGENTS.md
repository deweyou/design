# AGENTS

## 适用范围

适用于 `apps/website`。

## 约束

- `apps/website` 是公开文档和精选 demo 的承载面。
- 不要把可复用逻辑从 packages 挪到这个应用里。
- 必须显式从 `@deweyou-ui/styles/theme.css` 导入全局样式。
- React UI 代码优先使用标准 TSX。
- 官方安装、主题和使用指南应保留在这里，而不是放到 Storybook。
