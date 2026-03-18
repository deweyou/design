# 实施计划：为 UI 组件库新增图标包

**分支**： `20260317-icon-package` | **日期**： 2026-03-17 | **规格**： [specs/20260317-icon-package/spec.md](specs/20260317-icon-package/spec.md)  
**输入**： 来自 `/specs/20260317-icon-package/spec.md` 的功能规格

## 摘要

新增 `@deweyou-ui/icons` package，用于发布一套精选的基础图标目录，同时支持泛型 `Icon` 入口与 `XxxIcon` 命名导出，并通过 `apps/storybook` 提供内部评审覆盖，通过 `apps/website` 提供官方使用说明。实现将以 `tdesign-icons-svg` 作为初始 SVG 资产来源，但 Deweyou UI 仍然掌控图标命名、尺寸、无障碍、失败行为以及后续替换资产来源的能力。

## 技术上下文

**Language/Version**： TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**Primary Dependencies**： vite-plus、React、React DOM、Storybook 10.2.19、`tdesign-icons-svg` 以及现有 `@deweyou-ui/styles` tokens  
**Storage**： 仅包含文件型源码、package 元数据和生成出的构建产物  
**Testing**： `vp check`、`vp test`、位于 `packages/icons/src/**/*.test.ts` 的 package 单测、`vp run storybook#build` 和 `vp run website#build`  
**Target Platform**： Node.js 开发环境，以及消费 UI 库的现代 evergreen 浏览器  
**Project Type**： 带可复用 packages、内部 Storybook 评审 app 和公开 website 指导的 monorepo UI library  
**Performance Goals**： 支持的图标应从本地打包目录中解析，无运行时网络查找；在密集 UI 使用中足够轻量；在浏览图标目录时保持预览表面流畅  
**Constraints**： 只能使用 Vite+ 工作流；必须先构建可复用 package，再在 app 中消费；只能暴露官方精选目录；必须同时支持泛型入口和命名导出；必须使用固定的 `IconProps` 契约（`name`、`className`、`style`、`label`、`size`）；对不支持图标名必须显式失败；必须保持单一一致的视觉来源家族；在新增新主题 token 之前应优先通过 `currentColor` 复用现有语义颜色 token  
**Scale/Scope**： 一个新可发布 package、一套覆盖常见动作 / 状态 / 导航 / 反馈场景的基础图标目录、一个 Storybook 评审面，以及一个 website 文档 / 示例更新面

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界明确，可复用行为实现在 packages 中，而不是只存在于 `website`。
  - 通过：可复用图标行为、目录所有权和公开导出都位于新建的 `packages/icons` 中；`apps/storybook` 与 `apps/website` 只负责消费和文档化。
- 已说明每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 与 semver 影响。
  - 通过：新增的公开 API 是 `@deweyou-ui/icons` 下的增量能力，包含泛型 `Icon` 组件、`XxxIcon` 命名导出以及图标相关类型；现有 packages 不计划产生 breaking API 变化。
- 已说明无障碍要求，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：图标契约区分装饰性与有意义图标使用方式；要求有意义图标提供可访问名称；独立图标默认不可聚焦；图标嵌入交互控件时会定义其责任边界。
- 已识别 token 与主题系统影响，包括新增或修改的设计 token。
  - 通过：首个实现优先通过继承颜色和 `currentColor` 复用现有语义文本和链接颜色 token；除非评审发现明确缺口，否则不新增全局主题 token。
- 已规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 的预览或 demo 更新。
  - 通过：实现将包含 `vp check`、`vp test`、`vp run storybook#build` 和 `vp run website#build`，其中 Storybook 用于内部目录评审，`apps/website` 用于官方使用指导。

**Phase 1 后复查**：通过。设计产物将可复用行为保持在 `packages/icons` 中，维持新增式的公开 package 契约，并保留无障碍、token 和 Vite+ 验证要求。

## 项目结构

### 文档（本功能）

```text
specs/20260317-icon-package/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── icon-package-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   ├── .storybook/
│   └── src/stories/
└── website/
    ├── public/
    └── src/

packages/
├── components/
├── hooks/
├── icons/
│   ├── src/
│   │   ├── icon/
│   │   ├── icon-registry/
│   │   ├── foundation-icons/
│   │   └── index.ts
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   └── vite.config.ts
├── styles/
└── utils/

pnpm-workspace.yaml
package.json
```

**结构决策**：创建一个新的可发布 `packages/icons` package，作为图标定义、泛型渲染器和命名导出的唯一事实来源。目录浏览与评审只放在 `apps/storybook/src/stories` 中；`apps/website/src` 和 `apps/website/public` 只用于官方文档或精选 demo。任何可复用图标逻辑都不应只存在于某个 app 中。现有 packages 保持为图标能力的消费者，而不是拥有者。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
