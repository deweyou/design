# 实施计划：建立统一颜色 token 体系

**分支**：`20260324-define-color-palette` | **日期**：2026-03-24 | **规格**：[specs/20260324-define-color-palette/spec.md](specs/20260324-define-color-palette/spec.md)  
**输入**：来自 `/specs/20260324-define-color-palette/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

本次实现将把当前主要服务于 `Text` 的色卡能力提升为 `packages/styles` 中的统一颜色基础设施：在共享 token 层维护 26 个颜色家族、每个家族 11 个色阶，并补齐纯黑、纯白两个基础颜色；同时保留并重建品牌色、危险色、链接色、焦点色以及 `Text` 专用高亮变量这类语义层，使它们都能追溯到统一色卡来源。实现上，`packages/styles` 负责基础色卡、语义主题色和主题输出；`packages/components` 中的 `Button` 与 `Text` 负责对齐现有消费路径，不新增公开 props；`apps/storybook` 新增专门的色卡 story 作为内部评审矩阵；`apps/website` 补充精简的颜色使用指导，满足宪章要求的公开 demo / guidance 更新。整体方向是 additive-first：新增通用颜色 surface，保留现有可见语义变量与组件 API，避免为“Text 专用”或单组件需求继续新增非必要特化 token。

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**主要依赖**：vite-plus、React、React DOM、classnames、Storybook 10.2.19、`@deweyou-ui/styles`、`@deweyou-ui/components`  
**存储**：仅包含文件型源码、规格文档、package 元数据和生成构建产物  
**测试**：`vp check`、`vp test`、`vp run styles#build`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，以及 `packages/styles/tests/theme-outputs.test.ts`、`packages/components/src/button/index.test.ts`、`packages/components/src/text/index.test.ts` 的回归验证  
**目标平台**：Node.js 开发环境，以及消费组件库的现代 evergreen 浏览器  
**项目类型**：带可复用 packages、内部 Storybook 评审 app 和公开 website 指导面的 monorepo UI library  
**性能目标**：颜色体系切换继续基于静态 token 与 CSS 变量完成，不引入运行时网络请求、按组件异步取色或用户可感知的主题切换延迟；Storybook 色卡 story 必须能在单次主题切换后立即反映全部色卡与代表性消费状态  
**约束**：必须使用 Vite+ 工作流；共享颜色事实来源只能落在 `packages/styles`；`Button`、`Text` 和后续组件默认只能消费共享基础色卡或其派生语义主题色；非必要不得新增特化 token；现有语义变量命名应尽量保持稳定，避免为了“泛化”而引入不必要 breaking rename；Storybook 必须新增专门的色卡 story；website 必须补充公开指导，但不能成为行为唯一事实来源  
**规模/范围**：一个 styles package 的颜色基础层重构与公开 surface 扩展、两个现有组件消费者的来源收敛、一个 Storybook 新 story、一个 website 指导区更新，以及 README / 测试 / 规格文档同步

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
  - 通过：`packages/styles` 是共享基础色卡、纯黑白和语义主题色的唯一事实来源；`packages/components` 只负责消费与对齐；`apps/storybook` 和 `apps/website` 只负责评审与指导，不承载可复用规则定义。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 以及 semver 影响。
  - 通过：`@deweyou-ui/styles` 将新增面向通用颜色体系的公开 token / 导出说明，并保留现有品牌色、危险色、链接色及 `Text` 语义变量作为兼容语义层；这是 additive public API change，预期为 minor。`@deweyou-ui/components` 的 `Button` / `Text` 不新增 props，但其颜色来源将统一收敛到共享 token 体系，属于非 breaking 的实现对齐与视觉契约收敛。`apps/storybook` 与 `apps/website` 为内部 app 更新，无对外 semver 影响。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：计划要求浅色 / 深色主题切换后，代表性按钮、文本高亮、链接和焦点反馈仍然保持可读、可分层和可聚焦；Storybook 色卡 story 将覆盖主题切换与代表性消费关系，验证颜色收敛不破坏既有可访问性。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
  - 通过：本计划的核心就是把颜色体系正式拆分为共享基础色卡、纯黑白基础色与语义主题色三层，并明确“非必要不新增特化 token”的治理规则。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：本计划包含 `vp check`、`vp test`、`vp run styles#build`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，并要求同步新增 `apps/storybook/src/stories/Color.stories.tsx` 和更新 `apps/website/src/main.tsx` 的颜色指导区。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：本计划及同级设计文档全部使用简体中文撰写。

**Phase 1 后复查**：通过。设计产物继续保持 package-first 边界，已明确 `@deweyou-ui/styles` 的公开颜色 surface、`@deweyou-ui/components` 的消费边界、Storybook / website 的评审分工、无障碍与主题切换验证要求，以及全部 `vp` 验证命令，未出现需要豁免的宪章违反项。

## 项目结构

### 文档（本功能）

```text
specs/20260324-define-color-palette/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── color-token-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   ├── .storybook/
│   │   └── preview.ts
│   └── src/stories/
│       ├── Button.stories.tsx
│       ├── Color.stories.tsx
│       └── Typography.stories.tsx
└── website/
    └── src/
        └── main.tsx

packages/
├── components/
│   └── src/
│       ├── button/
│       │   ├── index.module.less
│       │   ├── index.test.ts
│       │   └── index.tsx
│       ├── text/
│       │   ├── index.module.less
│       │   ├── index.test.ts
│       │   └── index.tsx
│       └── index.ts
└── styles/
    ├── README.md
    ├── src/
    │   ├── css/
    │   │   ├── base.css
    │   │   ├── theme.css
    │   │   ├── theme-light.css
    │   │   └── theme-dark.css
    │   ├── index.ts
    │   ├── primitives/
    │   │   └── index.ts
    │   ├── semantics/
    │   │   └── index.ts
    │   └── themes/
    │       └── index.ts
    └── tests/
        └── theme-outputs.test.ts
```

**结构决策**：`packages/styles/src/primitives/` 负责共享基础色卡、纯黑白和通用导出命名；`packages/styles/src/semantics/` 负责品牌色、危险色、链接色、焦点色与 `Text` 高亮语义变量这类派生 surface；`packages/styles/src/themes/` 负责浅色 / 深色主题映射；`packages/styles/src/index.ts` 负责根级导出与兼容 alias。`packages/components/src/button/` 与 `packages/components/src/text/` 只负责把现有颜色消费路径收敛到统一 token 来源，不新增组件公开配置轴。`apps/storybook/src/stories/Color.stories.tsx` 负责完整色卡、语义色与组件消费关系的内部评审矩阵；`apps/website/src/main.tsx` 负责面向消费方的颜色使用边界与推荐方式。`packages/styles/README.md` 负责记录新的公开颜色 surface、兼容语义层与“非必要不得新增特化 token”的治理规则。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
