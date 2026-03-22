# 实施计划：重构 Button 组件基础能力

**分支**：`20260320-button-variants` | **日期**：2026-03-20 | **规格**：[specs/20260320-button-variants/spec.md](specs/20260320-button-variants/spec.md)  
**输入**：来自 `/specs/20260320-button-variants/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

本次实现将把现有 `FoundationButton` 重构为以 `variant` 与 `color` 为中心的 `Button` 公开契约，统一对外命名为 `Button` 与 `ButtonProps`，并建立 `filled`、`outlined`、`ghost`、`link` 四类按钮与 `neutral`、`primary` 两类颜色模式的可复用能力模型。核心实现落在 `packages/components`，同时更新 `apps/storybook` 的内部评审矩阵和 `apps/website` 的官方精选示例。样式方案继续复用现有 `@deweyou-ui/styles` 公共颜色 token，但把页面和预览面的底色统一收敛为浅色白底、深夜模式黑底；`ghost` 与 `link` 则收敛到更轻的文本流内边距，不再对齐实体按钮密度。`shape` 对外支持 `rect`、`rounded`、`pill` 三档，但只适用于 `filled` 与 `outlined`；无可见文本场景只保留无障碍约束，不再自动触发布局特例；icon 默认继承字号，并通过方形 wrapper 与 `viewBox` 补方稳定占位。`loading`、`selected` 等能力后续应继续作为独立字段扩展。

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**主要依赖**：vite-plus、React、React DOM、Storybook 10.2.19、classnames、现有 `@deweyou-ui/styles` 主题产物  
**存储**：仅包含文件型源码、规格文档、package 元数据和生成出的构建产物  
**测试**：`vp check`、`vp test`、`packages/components/src/button/index.test.ts` 及相关新增单测、`vp run storybook#build`、`vp run website#build`  
**目标平台**：Node.js 开发环境，以及消费组件库的现代 evergreen 浏览器  
**项目类型**：带可复用 packages、内部 Storybook 评审 app 和公开 website 指导面的 monorepo UI library  
**性能目标**：按钮必须完全由本地 package 渲染，无运行时网络依赖；在 Storybook 与 website 的矩阵/示例中保持即时交互反馈；常规按钮状态切换不引入可感知延迟  
**约束**：必须使用 Vite+ 工作流；可复用行为必须先落在 `packages/components`；当前公共主题覆盖面仅开放颜色 token，布局/圆角/排版仍由库内部控制；需要显式记录 `FoundationButton` 到 `Button` 的公开 API 变更及 semver 影响；必须同时更新内部评审面和公开指导面；公开 `variant` 收敛为 `filled`、`outlined`、`ghost`、`link`；公开 `color` 收敛为 `neutral`、`primary`，默认值为 `neutral`；公开 `shape` 收敛为 `rect`、`rounded`、`pill`，且仅适用于 `filled` / `outlined`；无可见文本按钮必须满足可访问名称要求；本期不得为无可见文本按钮保留自动方形布局特例；Button 内默认 icon 必须随字号缩放  
**规模/范围**：一个已有组件 package 的公开 API 重构、一套新的按钮类型与形状矩阵、一个 Storybook story 更新、一个 website 精选示例更新、相关 README/文档与测试同步

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
  - 通过：`packages/components` 是按钮行为、样式和公开导出的唯一事实来源；`apps/storybook` 与 `apps/website` 只负责消费、评审和文档化。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants，以及 semver 影响。
  - 通过：`@deweyou-ui/components` 将发生 breaking public API 变化，包括 `FoundationButton` / `FoundationButtonProps` 向 `Button` / `ButtonProps` 收敛、`buttonCustomizationContract` 退出标准公开契约、公开 `variant` 收敛为 `filled` / `outlined` / `ghost` / `link`、公开 `color` 新增为 `neutral` / `primary` 且默认值为 `neutral`、公开 `shape` 收敛为 `rect` / `rounded` / `pill` 且限制支持矩阵；`ghost` / `link` 的轻量文本流密度和“无可见文本不再自动方形化”也已作为契约边界记录；`apps/storybook` 与 `apps/website` 仅为内部 app 更新，无对外 semver 影响；`packages/styles` 当前计划不新增公共 token，仅调整现有主题色值和页面基调。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：计划已明确原生 button 语义、键盘激活、focus-visible、disabled 非交互以及“任意无可见文本按钮都必须具备可访问名称”的要求；这些内容已在 spec、research 与 contract 中细化。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
  - 通过：当前计划优先复用 `@deweyou-ui/styles` 已公开的颜色 token，不扩大 spacing/radius/typography 的公共覆盖面；默认中性色、`primary` 主题强调色以及页面白底 / 黑底基调都通过现有 token surface 的取值调整完成。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：本计划包含 `vp check`、`vp test`、`vp run storybook#build`、`vp run website#build`，并要求同时更新 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx`。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：本计划及同级设计文档全部使用简体中文撰写。

**Phase 1 后复查**：通过。设计产物继续保持 package-first 边界，明确记录 breaking API 变化、无障碍契约、theme/token 决策和 `vp` 验证命令，未出现需额外豁免的宪章违反项。

## 项目结构

### 文档（本功能）

```text
specs/20260320-button-variants/
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
│   ├── .storybook/
│   │   └── preview.ts
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
│   ├── README.md
│   └── package.json
├── styles/
│   ├── README.md
│   └── src/
│       ├── css/
│       ├── less/
│       ├── primitives/
│       └── semantics/
└── hooks/

pnpm-workspace.yaml
package.json
```

**结构决策**：按钮重构只会把可复用能力放在 `packages/components/src/button/`，包括公开 props、`variant` / `color` / `shape` 规则、样式与测试；与按钮尺寸联动的 icon 基础渲染约束落在 `packages/icons/src/icon/`。`apps/storybook/src/stories/Button.stories.tsx` 负责内部评审矩阵，覆盖所有支持组合和边界状态；`apps/website/src/main.tsx` 负责公开指导与精选示例，不拥有组件逻辑。`packages/styles` 继续提供显式导入的 theme surface，供按钮实现复用现有颜色 token、页面白底 / 黑底基调和焦点语义。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
