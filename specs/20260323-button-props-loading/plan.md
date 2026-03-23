# 实施计划：补齐 Button 公开属性与加载态

**分支**：`20260323-button-props-loading` | **日期**：2026-03-23 | **规格**：[specs/20260323-button-props-loading/spec.md](specs/20260323-button-props-loading/spec.md)  
**输入**：来自 `/specs/20260323-button-props-loading/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

本次实现将在现有 `Button` / `IconButton` 契约上补齐一组业务高频但仍缺口明显的公开能力：显式文档化并验证 `onClick`、`onClickCapture`，新增 `htmlType`、`href`、`target`、`loading` 和 `danger`，并把 `Button` 与 `IconButton` 改为暴露实际渲染根节点的 ref。行为上，`loading` 作为独立状态字段进入 Button 体系，普通按钮显示前置内建 spinner，`IconButton` 以同一 spinner 替换原图标；视觉采用 disabled 风格，但不再显示 `not-allowed` 鼠标指针，并阻止重复触发。带 `href` 的场景将切换为真实 `<a>` 根节点，`target` 只在该路径下生效。由于当前 `packages/styles` 尚无公开的 danger 语义色，本次计划默认同时补齐 `packages/styles` 的 danger token / theme surface，再由 `packages/components` 消费；`apps/storybook` 和 `apps/website` 则负责同步提供评审矩阵与公开示例。

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**主要依赖**：vite-plus、React、React DOM、classnames、`@deweyou-ui/styles`、`@deweyou-ui/icons`、Storybook 10.2.19  
**存储**：仅包含文件型源码、规格文档、package 元数据和生成构建产物  
**测试**：`vp check`、`vp test`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，以及 `packages/components/src/button/index.test.ts` 的按钮契约单测  
**目标平台**：Node.js 开发环境，以及消费组件库的现代 evergreen 浏览器  
**项目类型**：带可复用 packages、内部 Storybook 评审 app 和公开 website 指导面的 monorepo UI library  
**性能目标**：按钮状态切换必须同步完成，不引入运行时测量或异步布局探测；`loading` 图标切换与禁用态反馈在 Storybook 和 website 中保持即时可感知；新增 props 不得改变现有按钮默认样式选择路径  
**约束**：必须使用 Vite+ 工作流；可复用行为必须先落在 `packages/components` 与 `packages/styles`；`Button` 与 `IconButton` 的 ref 必须指向真实渲染根节点；`htmlType` 只影响 button 语义而不影响样式；`href` 存在时必须切换为 `<a>` 根节点；`target` 必须依赖 `href`；`loading` 必须阻止重复触发，但不能显示 disabled 专属鼠标指针；danger 颜色不得以硬编码孤岛样式绕过 theme/token 体系  
**规模/范围**：一个已有组件 package 的公开 API 增量、一个 styles package 的新增语义色 surface、一个 Button 契约文档更新、一个 Storybook story 更新、一个 website 示例更新，以及 README / 测试同步

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
  - 通过：`packages/components` 是 `Button` / `IconButton` props、ref、loading 行为和状态渲染的唯一事实来源；`packages/styles` 承担新增 danger 语义色；`apps/storybook` 与 `apps/website` 只负责消费、评审和文档化。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 以及 semver 影响。
  - 通过：`@deweyou-ui/components` 将新增 `htmlType`、`href`、`target`、`loading`、`danger` color、ref-forwarding 契约，并显式记录 `onClick` / `onClickCapture`；这属于 additive public API / behavior change，预期为 minor。`@deweyou-ui/styles` 将新增 danger 语义色与主题变量 surface，也属于 additive public API change，预期为 minor。`apps/storybook` 与 `apps/website` 仅为内部 app 更新，无对外 semver 影响。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：计划已明确默认 button / 带 `href` 的 anchor 语义、键盘激活、focus-visible、disabled / loading 非交互行为，以及 icon-only 按钮在 `danger` / `loading` 下仍需保持可访问名称。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
  - 通过：当前计划明确识别到 `packages/styles` 尚无公开 danger token，因此需要新增 danger 语义色 surface；disabled / focus / link 等现有 token 继续复用。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：本计划包含 `vp check`、`vp test`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，并要求同步更新 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx`。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：本计划及同级设计文档全部使用简体中文撰写。

**Phase 1 后复查**：通过。设计产物继续保持 package-first 边界，明确记录 `@deweyou-ui/components` 与 `@deweyou-ui/styles` 的公开 API 变化、无障碍契约、theme/token 影响和 `vp` 验证命令，未出现需额外豁免的宪章违反项。

## 项目结构

### 文档（本功能）

```text
specs/20260323-button-props-loading/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── button-component-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   └── src/stories/
│       └── Button.stories.tsx
└── website/
    └── src/
        └── main.tsx

packages/
├── components/
│   ├── src/
│   │   ├── button/
│   │   │   ├── index.module.less
│   │   │   ├── index.test.ts
│   │   │   └── index.tsx
│   │   └── index.ts
│   └── README.md
└── styles/
    └── src/
        ├── css/
        │   ├── theme-dark.css
        │   └── theme-light.css
        ├── primitives/
        │   └── index.ts
        ├── semantics/
        │   └── index.ts
        └── themes/
            └── index.ts

package.json
```

**结构决策**：`packages/components/src/button/` 负责 Button / IconButton 的 props、ref-forwarding、`href -> <a>` 分支、loading 状态与样式规则；`packages/components/src/index.ts` 负责根级导出；`packages/styles/src/` 负责补齐 danger theme surface；`apps/storybook/src/stories/Button.stories.tsx` 负责覆盖默认、danger、loading、事件和 ref 的内部评审矩阵；`apps/website/src/main.tsx` 负责面向消费方的推荐接入示例；`packages/components/README.md` 负责记录新增 props、ref 行为、loading 契约和验证方式。loading 指示器作为组件内建 spinner 插槽实现，不新增额外的 icons package 依赖。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
