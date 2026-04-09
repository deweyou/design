# 实施计划：Storybook 文档升级与重组

**分支**：`20260330-storybook-docs-upgrade` | **日期**：2026-03-30 | **规格**：[spec.md](./spec.md)
**输入**：来自 `specs/20260330-storybook-docs-upgrade/spec.md` 的功能规格

---

## 摘要

本功能对 `apps/storybook` 进行三类改造：

1. **分类重组**：将 4 个 story 的 `title` 前缀从 `Internal review/` 改为 `Components/`；确认 Menu 和 Color 已在正确分类下。最终侧边栏只有 `Components/` 和 `Foundations/` 两个顶层分类。
2. **API 文档化**：为 Button、Typography、Popover、Icon、Menu 所有公开 props 在 `argTypes` 中添加英文描述、类型摘要和默认值；添加 `tags: ['autodocs']` 触发 Storybook 自动文档页面；同时将所有 story 内用户可见文本（component description、story names、gallery label）改为英文。
3. **版本升级**：在 `pnpm-workspace.yaml` 的 `catalog:` 节统一升级 `@storybook/*` 和 `storybook` 至最新稳定版，验证 6 个 story 无回归。

不修改任何 `packages/` 下组件源码，不引入新设计 token，`apps/website` 不在范围内。

---

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x、Node.js 24.14.0
**主要依赖**：Storybook 10.2.19（目标：最新稳定版）、`@storybook/addon-docs`、`@storybook/react-vite`
**存储**：N/A
**测试**：`vp check`（类型 + lint）；人工视觉评审（`vp run storybook#dev`）
**目标平台**：浏览器（Storybook 本地开发服务器）
**项目类型**：内部文档工具（apps/storybook）
**性能目标**：N/A（文档站点，非生产服务）
**约束**：不得修改任何 `packages/` 源码；不得引入 `@storybook/addon-docs` 以外的新 Storybook addon；保持 `catalog:` 统一版本管理
**规模/范围**：6 个 story 文件，5 个组件 + 1 个 design token 展示页

---

## 宪章检查

_门禁：Phase 0 research 已完成。以下检查通过后方可进入 Phase 1 实施。_

- ✅ **包边界**：本功能仅修改 `apps/storybook`，不跨 package 边界；无新增可复用行为需要落入 package。
- ✅ **公开 API 变化**：无 `packages/` 侧 API 变更；story 的 `argTypes` 是文档声明，不是组件 API 变更，semver 影响为零。
- ✅ **无障碍预期**：不修改组件行为，无新 ARIA 变化；story 中已有 accessibility 说明将翻译为英文保留。
- ✅ **Token 影响**：无新设计 token，无主题变更，`@deweyou-ui/styles/theme.css` 在 preview.ts 中的 import 不受影响。
- ✅ **验证规划**：`vp check` 保证类型与 lint 通过；`vp run storybook#dev` 提供人工视觉评审面；无组件逻辑变更，不需要单测更新。
- ⚠️ **文档语言例外**：`spec.md` 以英文撰写，与宪章原则 V（/specs/ 正文使用简体中文）存在偏差。例外原因见下方「复杂度追踪」。此例外仅限于本功能的 spec.md；plan.md、tasks.md、research.md 等均以中文撰写。
- ✅ **Vite+ 约定**：不新增 package 级构建配置；Storybook 版本升级通过 `pnpm-workspace.yaml` catalog 统一管理，符合 Vite+ 工作流。

---

## 项目结构

### 文档（本功能）

```text
specs/20260330-storybook-docs-upgrade/
├── plan.md              # 本文件
├── spec.md              # 功能规格（英文，用户授权例外）
├── research.md          # Phase 0 研究报告
├── data-model.md        # 各组件 argTypes 字段定义
├── quickstart.md        # 本地开发快速上手
├── contracts/
│   └── story-api-contract.md   # story 文档标准契约
└── tasks.md             # Phase 2 输出（/speckit.tasks 命令生成）
```

### 源代码（受影响目录）

```text
apps/storybook/
├── .storybook/
│   ├── main.ts          # 修改 docs.defaultName → 英文
│   └── preview.ts       # 升级后验证，不改逻辑
└── src/stories/
    ├── Button.stories.tsx      # title + argTypes + 英文化
    ├── Typography.stories.tsx  # title + argTypes + 英文化
    ├── Popover.stories.tsx     # title + argTypes + 英文化
    ├── Icon.stories.tsx        # title + argTypes + 英文化
    ├── Menu.stories.tsx        # argTypes + 英文化（title 已正确）
    └── Color.stories.tsx       # 英文化（title 已正确，无 argTypes）

pnpm-workspace.yaml             # 升级 @storybook/* catalog 版本
```

**结构决策**：仅触及 `apps/storybook`，无 package 侧变更，无 `apps/website` 变更。

---

## 复杂度追踪

| 违反项                             | 为什么需要                                                                                                                  | 为什么拒绝更简单的替代方案                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| spec.md 使用英文（违反宪章原则 V） | 用户明确要求「使用英文的」，且 spec 内容主要描述 Storybook story 文档规范——英文与目标内容语言一致，便于开发者直接参照实施。 | 将 spec 改回中文会导致规格与 story 目标语言脱节，需额外翻译工作；此例外范围明确（仅 spec.md），其余 /specs/ 文档（plan/tasks/research）照常使用中文。 |

---

## 实施阶段概览

> 详细任务拆解由 `/speckit.tasks` 命令生成于 `tasks.md`。

### 阶段 A：Storybook 版本升级

1. 查询当前最新稳定版（`npm view storybook version`）
2. 更新 `pnpm-workspace.yaml` catalog 中的 4 个 `@storybook/*` 条目
3. 运行 `vp install` 重新安装依赖
4. 启动 `vp run storybook#dev`，确认无启动错误

### 阶段 B：分类重组 + 配置英文化

1. 修改 `apps/storybook/.storybook/main.ts`：`docs.defaultName` → `'Overview'`
2. 修改 4 个 story 文件的 `title`（Button、Typography、Popover、Icon）
3. 确认 Menu 和 Color 的 title 已正确，无需变更

### 阶段 C：API 文档化（按组件逐一完成）

优先顺序：Button → Menu → Popover → Icon → Typography → Color（仅英文化）

每个组件的工作项：

- 添加 `tags: ['autodocs']`（Color 除外）
- 按 `data-model.md` 中的 prop 列表补全 `argTypes`
- 将 `parameters.docs.description.component` 改为英文
- 将所有 gallery 组件内的中文 label 改为英文

### 阶段 D：验证

1. `vp check` 无报错
2. `vp run storybook#dev` 全 6 个 story 正常加载
3. 逐一检查 Docs 页面 Props 表格
4. Light / Dark 主题切换验证
5. 对照 `contracts/story-api-contract.md` 逐条验收

---

## 验证命令

```bash
vp check                  # 类型检查 + lint
vp run storybook#dev      # 本地启动视觉验证（端口 6106）
```
