# 实施计划：升级 Storybook 到最新稳定版

**分支**： `20260317-upgrade-storybook` | **日期**： 2026-03-17 | **规格**： [specs/20260317-upgrade-storybook/spec.md](specs/20260317-upgrade-storybook/spec.md)  
**输入**： 来自 `/specs/20260317-upgrade-storybook/spec.md` 的功能规格

## 摘要

将内部 Storybook 评审应用从当前 8.6.x 版本线升级到 Storybook `10.2.19`，消除 Storybook 包之间的版本偏差，保留 `apps/storybook` 现有内部评审工作流，并在更大规模组件开发开始之前记录所有面向贡献者的迁移变化。

## 技术上下文

**Language/Version**： TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**Primary Dependencies**： vite-plus、Storybook 10.2.19、`@storybook/addon-docs`、React、React DOM、TypeScript  
**Storage**： 仅包含文件型源码、配置和生成出的预览产物  
**Testing**： `vp check`、`vp test`、`vp run storybook#build` 以及 story 预览冒烟验证  
**Target Platform**： Node.js 开发环境与现代 evergreen 桌面浏览器（供内部评审使用）  
**Project Type**： 在 `apps/storybook` 下包含内部预览 app 的 monorepo UI library  
**Performance Goals**： 维护者能够在没有版本不匹配失败的情况下启动或构建预览环境，并能足够快地进入代表性 stories 用于日常评审  
**Constraints**： 必须使用 Vite+ 工作流，必须保留 `apps/storybook` 作为内部评审面，必须保持显式全局样式导入，不得把本应复用的行为只实现于 app 内，必须满足 Storybook 10 的 ESM-only 要求，并保持默认维护者开发入口为非交互式  
**Scale/Scope**： 一个内部 Storybook app、一组现有 starter stories、一组共享依赖 catalog 条目，以及一处面向维护者的迁移说明

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界明确，可复用行为没有被塞进 `website` 或其他 app。
  - 通过：本功能只升级 `apps/storybook` 和共享依赖 catalog，不会把可复用组件行为迁入 app。
- 已说明每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 与 semver 影响。
  - 通过：不计划改动组件 package 的公开 API；本次主要影响的是 `apps/storybook` 的内部维护者工作流契约，属于内部工具变更。
- 已说明无障碍要求，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：规格要求对升级后的预览外壳、docs 视图与交互控件进行键盘和屏幕阅读器评审。
- 已识别 token 与主题系统影响，包括新增或修改的设计 token。
  - 通过：不计划新增 token；现有 `@deweyou-ui/styles/theme.css` 导入继续作为预览主题契约。
- 已规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 的预览或 demo 更新。
  - 通过：实现验证将使用 `vp check`、`vp test`、`vp run storybook#build` 和 `vp run storybook#dev`。`apps/website` 不受影响，因为 Storybook 仍是内部评审面。

**设计后复查**：通过。research、data-model、contract 与 quickstart 都将范围保持在依赖对齐与 `apps/storybook` 上，同时保留了显式的无障碍、主题和 Vite+ 工作流要求。

## 项目结构

### 文档（本功能）

```text
specs/20260317-upgrade-storybook/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── storybook-preview-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   ├── .storybook/
│   ├── src/stories/
│   └── tests/
└── website/

packages/
├── components/
├── hooks/
├── styles/
└── utils/

package.json
pnpm-workspace.yaml
```

**结构决策**：继续把 Storybook 保持为 `apps/storybook` 下的单一内部评审 app。版本对齐通过根级依赖 catalog 和 app 的 `package.json` 中的 catalog 引用完成。升级后继续通过 `@storybook/addon-docs` 支持 docs，保留预览主题导入，并把默认开发端口设置为 `6106`。不新增新的 package 边界，也不把官方文档归属从 `apps/website` 挪走。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
