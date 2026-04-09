# 实施计划：新增 Text 排版组件

**分支**：`20260323-add-text-component` | **日期**：2026-03-24 | **规格**：[specs/20260323-add-text-component/spec.md](specs/20260323-add-text-component/spec.md)  
**输入**：来自 `/specs/20260323-add-text-component/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

本次实现将为 `@deweyou-ui/components` 新增统一的 `Text` 排版组件，用于覆盖普通文本、正文块、说明文字和五级视觉标题，并补齐文本高亮能力。组件公开能力聚焦在 `variant`、四个可叠加的布尔样式字段 `italic` / `bold` / `underline` / `strikethrough`、`color` / `background`、`lineClamp` 和原生节点属性透传。为满足宪章中的 token 约束，本次计划会在 `packages/styles` 中补齐共享排版尺寸与行高变量，并新增一套与 Tailwind colors 结构对齐的 26 色族 x 11 色阶共享色卡 token；`Text` 对外只暴露 26 个颜色家族名，由主题自动映射到较深文字色与较浅或较深背景色。`apps/storybook` 将补充色卡高亮与长文评审面，`apps/website` 负责公开示例，`packages/components/README.md` 同步记录新的公开 API 与接入边界。

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**主要依赖**：vite-plus、React、React DOM、classnames、`@deweyou-ui/styles`、Storybook 10.2.19  
**存储**：仅包含文件型源码、规格文档、package 元数据和生成构建产物  
**测试**：`vp check`、`vp test`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，以及新增或更新的 `packages/components/src/text/index.test.ts`、styles 测试和跨 workspace 断言  
**目标平台**：Node.js 开发环境，以及消费组件库的现代 evergreen 浏览器  
**项目类型**：带可复用 packages、内部 Storybook 评审 app 和公开 website 指导面的 monorepo UI library  
**性能目标**：文本渲染必须保持同步、纯 props 驱动；`lineClamp` 使用声明式样式限制，不引入运行时测量、布局探测或异步截断；`color` / `background` 只做 token 选择与主题映射，不引入运行时对比度计算；新增 Text 能力不得让普通未截断文本进入额外包装层或额外渲染路径  
**约束**：必须使用 Vite+ 工作流；可复用行为必须先落在 `packages/components` 与 `packages/styles`；`plain` 默认渲染 `span`，`body` / `caption` 默认渲染 `div`，`h1`-`h5` 默认渲染对应原生标题节点；本期不引入 `as` 等多态根节点能力；`color` / `background` 只暴露 26 个颜色家族名，不暴露 `50`-`950` 色阶编号；具体色阶必须随主题自动映射；`lineClamp` 仅在正整数输入下启用，其他输入按未设置处理；透传属性必须落到最终渲染节点，不得依赖中间包装层  
**规模/范围**：一个新增组件单元 `packages/components/src/text/`、一个组件包根级导出更新、一个样式包共享排版变量与色卡 token 扩展、一个 Storybook typography story 更新、一个 website 文本演示区更新，以及 README / 测试同步

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
  - 通过：`packages/components` 是 `Text` 组件、props 契约、默认节点映射、`color` / `background`、`lineClamp` 和样式叠加逻辑的唯一事实来源；`packages/styles` 负责共享排版与色卡 token；`apps/storybook` 与 `apps/website` 仅负责消费、评审和示例展示。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 以及 semver 影响。
  - 通过：`@deweyou-ui/components` 将新增 `Text` 与 `TextProps`，对外暴露 `variant`、`italic`、`bold`、`underline`、`strikethrough`、`color`、`background`、`lineClamp` 和节点属性透传，属于 additive public API change，预期为 minor。`@deweyou-ui/styles` 将新增排版尺寸 / 行高 theme surface 与共享色卡 token，也属于 additive public API change，预期为 minor。`apps/storybook` 与 `apps/website` 为内部 app 更新，无对外 semver 影响。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：计划已明确 `Text` 主要承担静态文本渲染，透传 `aria-*`、`role`、`tabIndex` 等节点属性；`h1`-`h5` 默认直接输出原生标题节点；`color` / `background` 通过主题映射保持浅色 / 深色模式下的文字可读性；`lineClamp` 不得破坏可读性或节点属性有效性。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
  - 通过：当前 `packages/styles` 已提供字体角色、字重和 `text-muted` 颜色，但缺少可复用的标题 / 正文 / caption 尺寸与行高变量，也缺少可供 `Text` 高亮能力直接消费的共享色卡；本计划明确补齐排版变量与 26 色族 x 11 色阶的共享色卡 token，再由 `Text` 组件消费。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：本计划包含 `vp check`、`vp test`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，并要求同步更新 `apps/storybook/src/stories/Typography.stories.tsx` 与 `apps/website/src/main.tsx`，覆盖色卡高亮与主题切换评审面。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：本计划及同级设计文档全部使用简体中文撰写。

**Phase 1 后复查**：通过。设计产物继续保持 package-first 边界，明确记录了 `@deweyou-ui/components` 与 `@deweyou-ui/styles` 的公开 API 变化、无障碍语义边界、排版 / 色卡 token 影响和 `vp` 验证命令，未出现需要豁免的宪章违反项。

## 项目结构

### 文档（本功能）

```text
specs/20260323-add-text-component/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── text-component-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   └── src/stories/
│       └── Typography.stories.tsx
└── website/
    └── src/
        ├── main.tsx
        └── style.css

packages/
├── components/
│   ├── src/
│   │   ├── index.ts
│   │   ├── button/
│   │   └── text/
│   │       ├── index.module.less
│   │       ├── index.test.ts
│   │       └── index.tsx
│   └── README.md
└── styles/
    ├── src/
    │   ├── css/
    │   │   ├── base.css
    │   │   ├── theme-dark.css
    │   │   ├── theme-light.css
    │   │   └── theme.css
    │   ├── primitives/
    │   │   └── index.ts
    │   ├── semantics/
    │   │   └── index.ts
    │   └── themes/
    │       └── index.ts
    └── tests/
        └── theme-outputs.test.ts

package.json
```

**结构决策**：`packages/components/src/text/` 负责 `Text` 的 props、默认节点映射、`color` / `background`、`lineClamp`、布尔样式叠加和本地样式模块；`packages/components/src/index.ts` 负责将 `Text` 纳入根级导出；`packages/styles/src/` 负责补齐共享排版尺寸 / 行高变量、26 色族 x 11 色阶共享色卡与主题映射 surface；`apps/storybook/src/stories/Typography.stories.tsx` 负责覆盖全部 `variant`、布尔字段组合、色卡高亮、主题切换与截断矩阵；`apps/website/src/main.tsx` 与 `style.css` 负责面向消费方的推荐示例；`packages/components/README.md` 负责记录 `Text` 的公开契约与验证方式。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
