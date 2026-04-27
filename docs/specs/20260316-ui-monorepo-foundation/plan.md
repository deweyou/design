# 实施计划：UI Monorepo 基础建设

**分支**： `20260316-ui-monorepo-foundation` | **日期**： 2026-03-16 | **规格**： [specs/20260316-ui-monorepo-foundation/spec.md](specs/20260316-ui-monorepo-foundation/spec.md)  
**输入**： 来自 `/specs/20260316-ui-monorepo-foundation/spec.md` 的功能规格

## 摘要

为 Deweyou UI monorepo 建立 v1 基础设施：将可复用逻辑拆分到 `packages/utils`、`packages/hooks`、`packages/styles` 和 `packages/components` 中，并将 `apps/website` 与 `apps/storybook` 视为职责不同的 app 表面。实现上将采用 Vite+ 工作流、React + TypeScript packages、基于 Less 的组件样式与 CSS Modules、直接使用 `classnames` 进行类名组合，以及一个受控、以 token 驱动的主题系统，其中 TypeScript token 源生成亮色、暗色和默认 CSS 主题输出，供消费者显式导入。

## 技术上下文

**Language/Version**： TypeScript 5.x、React 19.x 兼容 package API、Node.js 24.14.0 tooling baseline  
**Primary Dependencies**： vite-plus、React、Less、Storybook、TypeScript  
**Storage**： 仅包含文件型源码和生成出的样式产物  
**Testing**： `vp test`、package 级单测，以及 website 或 Storybook 预览验证  
**Target Platform**： 面向 website 和组件消费者的现代 evergreen 浏览器，以及 Node.js 开发环境  
**Project Type**： 带 package 输出和 app 表面的 monorepo UI library  
**Performance Goals**： package 开发需具备快速本地反馈；主题切换不应有明显延迟；文档表面在交互式预览中仍应保持响应流畅  
**Constraints**： 必须使用 Vite+ 工作流；必须保持全局样式显式导入；必须保留明确设计立场；必须避免 package 循环依赖；必须将公开主题面控制在较小范围内  
**Scale/Scope**： 4 个可发布基础 package、2 个 app 表面、一组受控的公开主题色面，以及一套面向未来组件的共享文档与规划模型

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界明确，可复用行为实现在 packages 中，而不是只存在于 `website`。
  - 通过：`utils`、`hooks`、`styles` 和 `components` 是可复用层；`website` 与 `storybook` 是消费方。
- 已列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 和 semver 影响。
  - 通过：本变更定义了 package 职责和公开入口，也定义了组件 `className`、组件级 CSS 变量以及显式全局样式导入的样式契约。
- 已说明无障碍要求，包括键盘交互、焦点管理、语义结构和状态行为。
  - 通过：spec 要求对 website demos、焦点状态和主题行为进行键盘与屏幕阅读器覆盖。
- 已识别 token 与主题系统影响，包括新增或修改的设计 token。
  - 通过：计划引入 TypeScript token 源、一小块公开颜色主题面，以及亮色 / 暗色 / 默认 CSS 输出。
- 已规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：实现阶段将通过 `vp check`、package 测试和 `apps/website` 中的预览更新验证基础设施。

**Phase 1 后复查**：通过。research、data model、contracts 与 quickstart 都保持了 package-first 边界、显式无障碍要求、受控 token 所有权、website 预览义务以及 Vite+ 工作流纪律。

## 项目结构

### 文档（本功能）

```text
specs/20260316-ui-monorepo-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── package-boundaries.md
│   └── styling-and-theme-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
└── website/

packages/
├── components/
├── hooks/
├── styles/
└── utils/

specs/
└── 20260316-ui-monorepo-foundation/
```

**结构决策**：采用 app + package 的 monorepo 结构。所有可复用资产都只放在 `packages/*` 中。`apps/website` 作为公开文档和 demo 表面；`apps/storybook` 作为内部状态评审与开发表面。`packages/styles` 负责 token 源、主题生成和全局 CSS 入口，但其 CSS 与 Less 资产通过 `dist/` 对外发布。`packages/components` 按组件目录组织实现文件，目录内共置 `index.tsx` 与 `index.module.less`。`packages/hooks` 负责可复用 React hooks，与 `packages/utils` 中的框架无关 utilities 保持分离；`packages/utils` 在没有明确共享需求前保持最小化。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
