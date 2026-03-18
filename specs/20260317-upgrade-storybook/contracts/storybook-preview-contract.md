# 契约：Storybook 预览升级

## 目的

定义 `apps/storybook` 升级到最新 Storybook 稳定版本线时，面向维护者必须保持稳定的契约。

## 依赖对齐契约

- `apps/storybook` 使用的所有 Storybook 相关包都必须解析到同一条共享稳定版本线。
- 共享版本归属位于 workspace catalog 中，`apps/storybook/package.json` 应通过 catalog 引用而不是硬编码单独版本。
- 升级完成后，已废弃或已移除的 Storybook 包不能继续处于活跃使用状态。
- 当前对齐后的版本线为：`storybook`、`@storybook/react`、`@storybook/react-vite` 和 `@storybook/addon-docs` 的 `10.2.19`。

## App 边界契约

- `apps/storybook` 继续作为内部评审和状态验证面。
- 此次升级不能把官方公开文档归属从 `apps/website` 挪走。
- 可复用的组件行为、tokens 或 hooks 仍必须位于 `packages/*` 中，不能只存在于 Storybook 专属源码里。

## 预览配置契约

- story 发现范围继续限定在 `apps/storybook/src` 下的内部评审 stories。
- 预览外壳继续通过显式方式从 `@deweyou-ui/styles/theme.css` 加载共享全局样式。
- main 与 preview 配置必须同时兼容目标 Storybook 版本和仓库的 Node baseline。

## Story 编写契约

- 现有具有代表性的 stories 必须仍能从 Storybook 导航中被发现。
- 当前 stories 使用的 canvas 与 docs 视图必须保持可用；如果有意替换，必须写入升级说明。
- story 标签与 docs 文案必须继续明确该 app 的“内部评审”定位。

## 验证契约

- 升级后的工作区必须通过 `vp check`。
- 升级后的工作区必须通过 `vp test`。
- 内部评审 app 必须能通过 `vp run storybook#build` 成功构建。
- 维护者必须能通过 `vp run storybook#dev` 打开预览应用，并验证代表性 stories、docs 可见性和交互控件，不存在未解决的依赖不匹配警告。
- 仓库标准的 Storybook 开发工作流默认监听 `6106` 端口，除非维护者主动覆盖。
