# 实施计划：优化 Button 间距平衡

**分支**：`20260323-refine-button-padding` | **日期**：2026-03-23 | **规格**：[specs/20260323-refine-button-padding/spec.md](specs/20260323-refine-button-padding/spec.md)  
**输入**：来自 `/specs/20260323-refine-button-padding/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

本次实现将把 Button 的图标能力从“根据 `children` 猜测是否 icon-only”改为显式公开契约：`Button` 新增 `icon` prop，并新增 `IconButton` / `Button.Icon` 两个等价入口来表达方形图标按钮。文本按钮与带图标文本按钮继续走内容型密度，`IconButton` 单独走方形密度；因此按钮间距不再被 icon-only 场景倒逼为统一四边等值。实现核心落在 `packages/components`，同时更新 `apps/storybook` 的内部评审矩阵、`apps/website` 的公开示例以及 `packages/components/README.md` 的迁移说明。当前方案默认不新增公共 spacing token，而是在组件内部建立明确的 block/inline 间距和方形尺寸规则；公开 API 层面新增 `IconButton`、`IconButtonProps` 和 `Button.Icon`，并把旧的隐式 icon-only 推断视为 breaking 行为变化。

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x 兼容 API、Node.js 24.14.0 baseline  
**主要依赖**：vite-plus、React、React DOM、classnames、Storybook 10.2.19、现有 `@deweyou-ui/styles` 主题产物  
**存储**：仅包含文件型源码、规格文档、package 元数据和生成出的构建产物  
**测试**：`vp check`、`vp test`、`packages/components/src/button/index.test.ts` 及新增单测、`vp run storybook#build`、`vp run website#build`  
**目标平台**：Node.js 开发环境，以及消费组件库的现代 evergreen 浏览器  
**项目类型**：带可复用 packages、内部 Storybook 评审 app 和公开 website 指导面的 monorepo UI library  
**性能目标**：按钮模式判断必须完全由 props 和可见内容存在性同步完成，不引入运行时测量、异步布局探测或网络依赖；在 Storybook 与 website 预览中保持即时交互反馈  
**约束**：必须使用 Vite+ 工作流；可复用行为必须先落在 `packages/components`；不得通过 `variant="icon"` 表达图标按钮；`Button.Icon` 与 `IconButton` 必须完全等价；`IconButton` 必须保持方形点击目标并继续满足可访问名称要求；文本按钮和带图标文本按钮必须共享内容型密度；当前优先复用现有 theme surface，不默认新增公共 spacing/radius token；当前隐式 icon-only 推断退出标准公开契约并视为 breaking 迁移项  
**规模/范围**：一个已有组件 package 的公开 API 增量与行为重构、一个 Button/IconButton 契约文档更新、一个 Storybook story 更新、一个 website 精选示例更新、相关 README/迁移说明与测试同步

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
  - 通过：`packages/components` 是 `Button`、`IconButton`、`Button.Icon`、图标入口和密度规则的唯一事实来源；`apps/storybook` 与 `apps/website` 只负责消费、评审和文档化。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 以及 semver 影响。
  - 通过：`@deweyou-ui/components` 将新增 `icon`、`IconButton`、`IconButtonProps` 和 `Button.Icon`，并把隐式 icon-only children 推断退出标准公开契约；这属于 breaking public API / behavior change，需要迁移说明。`apps/storybook` 与 `apps/website` 仅为内部 app 更新，无对外 semver 影响；`packages/styles` 当前计划不新增公共 token。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：计划已明确原生 button 语义、键盘激活、focus-visible、disabled 行为，以及所有 `IconButton` 必须提供可访问名称；`Button.Icon` 必须继承同一无障碍要求。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
  - 通过：当前计划优先复用 `@deweyou-ui/styles` 已公开的 theme surface，不默认新增公共 spacing/radius token；若实现必须拆分新的间距变量，优先保持为组件内部私有变量。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
  - 通过：本计划包含 `vp check`、`vp test`、`vp run storybook#build`、`vp run website#build`，并要求同步更新 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx`。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
  - 通过：本计划及同级设计文档全部使用简体中文撰写。

**Phase 1 后复查**：通过。设计产物继续保持 package-first 边界，明确记录新增导出、breaking 迁移影响、无障碍契约、theme/token 策略和 `vp` 验证命令，未出现需额外豁免的宪章违反项。

## 项目结构

### 文档（本功能）

```text
specs/20260323-refine-button-padding/
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
        ├── less/
        ├── primitives/
        └── semantics/

package.json
pnpm-workspace.yaml
```

**结构决策**：按钮显式图标入口、密度模式判定、别名导出和样式规则都放在 `packages/components/src/button/` 内；根级 package 导出更新放在 `packages/components/src/index.ts`；`apps/storybook/src/stories/Button.stories.tsx` 负责完整的 Button / IconButton 评审矩阵；`apps/website/src/main.tsx` 负责面向消费者的精选示例和迁移说明；`packages/components/README.md` 负责记录 semver 影响、公开 API 和推荐接入方式。`packages/styles` 只提供被复用的主题 surface，不承载按钮私有逻辑。

## 复杂度追踪

本次变更没有需要额外说明的宪章违反项。
