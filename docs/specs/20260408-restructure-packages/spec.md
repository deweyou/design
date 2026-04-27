# 功能规格：重构 packages 结构以支持正式发包

**功能分支**：`20260408-restructure-packages`  
**创建时间**：2026-04-08  
**状态**：草稿  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 用户场景与测试（必填）

### 用户故事 1 - 消费方通过新包名安装并使用组件（优先级：P1）

作为一个使用该组件库的前端开发者，我希望能通过 `@deweyou-design/react` 这个包名安装并使用 Button、Popover、Tabs 等组件，而不是当前的 `@deweyou-ui/components`。包名是公开契约，目录名、包名、发布路径需完成迁移，消费方无需关心内部 monorepo 结构。

**为什么是这个优先级**：这是整个重构的核心目标，其余故事都依赖于此。

**独立测试**：可以在 `apps/website` 或 `apps/storybook` 中将内部引用切换为新包名后，执行 `vp run build -r` 验证产物完整性。

**验收场景**：

1. **假如** 本地构建 `@deweyou-design/react`，**当** 在 `apps/website` 中导入 `import { Button } from '@deweyou-design/react'`，**那么** 组件正常渲染，类型和样式均可用。
2. **假如** 执行 `vp run build -r`，**那么** 全量构建零报错，`@deweyou-design/react` 产物完整。

---

### 用户故事 2 - 图标可独立安装，不强依赖组件库（优先级：P2）

作为消费方开发者，我希望在不安装完整组件库的情况下单独使用图标。当前 `@deweyou-ui/icons` 已是独立包，此故事目标是完成改名并明确 React 组件暴露策略。

**为什么是这个优先级**：图标包体积大，独立可安装是正确的包设计原则；命名策略影响未来是否扩展多框架。

**独立测试**：可在不安装 `@deweyou-design/react` 的情况下单独安装并按需导入图标，bundle 不包含组件库代码。

**验收场景**：

1. **假如** 消费方只安装图标包，**当** 按名称导入单个图标并渲染，**那么** 图标正常显示，bundle 中不包含组件库代码。
2. **假如** 图标包完成改名，**当** `apps/website` 和 `apps/storybook` 更新引用，**那么** 所有图标展示页面正常，无 console 错误。

---

### 用户故事 3 - monorepo 内部引用全部切换为新包名（优先级：P2）

作为维护者，我希望 monorepo 内所有 `workspace:*` 引用和 import 路径均已更新为新包名，不再出现旧的 `@deweyou-ui/components`、`@deweyou-ui/hooks`、`@deweyou-ui/icons`、`@deweyou-ui/styles` 引用（`@deweyou-ui/infra` 作为内部 build 工具保留）。

**为什么是这个优先级**：内部引用不一致会导致构建混乱，是重构完整性的基本要求。

**独立测试**：全文搜索旧包名结果为空，`vp check` 和 `vp test` 全量通过。

**验收场景**：

1. **假如** 重构完成，**当** 全文搜索 `@deweyou-ui/components`，**那么** 结果为空。
2. **假如** 执行 `vp check` 和 `vp test`，**那么** 无类型错误、无 lint 错误、无测试失败。

---

### 边界情况

- `packages/infra`（原 `packages/utils`）是纯 build-time 工具，不对外发布消费，不进入 `@deweyou-design/*` scope。
- `packages/utils`（新建）初始为空包，仅建立目录和 package.json，为后续 runtime 工具提供落地点。
- `packages/hooks/package.json` 中已有僵尸依赖 `@deweyou-ui/utils`，本次已清理（PR 合并前完成）。
- 当前版本均为 `0.x`，不需要为旧包名发布 deprecation shim。

## 需求（必填）

### 功能需求

- **FR-001**：`packages/components` 目录必须重命名为 `packages/react`，`package.json` 中的 `name` 必须更新为 `@deweyou-design/react`。
- **FR-002**：`packages/icons` 目录必须重命名为 `packages/react-icons`，`package.json` 中的 `name` 必须更新为 `@deweyou-design/react-icons`；继续暴露 React 组件，暴露方式与现在保持一致。
- **FR-003**：`packages/hooks` 目录必须重命名为 `packages/react-hooks`，`package.json` 中的 `name` 必须更新为 `@deweyou-design/react-hooks`；保持为独立可发布包，消费方可单独安装而无需引入组件库。
- **FR-004**：`apps/website` 和 `apps/storybook` 中所有对旧包名的引用必须更新为新包名。
- **FR-005**：`packages/styles` 目录名保持不变，`package.json` 中的 `name` 必须更新为 `@deweyou-design/styles`；所有内部引用同步更新。
- **FR-005b**：`packages/utils` 必须重命名为 `packages/infra`，`package.json` 中的 `name` 更新为 `@deweyou-ui/infra`，并移除 `publishConfig`（不发布）；所有引用该目录的 build script 路径同步更新（如 `node ../utils/scripts/` → `node ../infra/scripts/`）。
- **FR-005c**：必须新建 `packages/utils`，`package.json` 中的 `name` 为 `@deweyou-design/utils`；初始为空包（仅 `src/index.ts` 导出占位），建立目录结构和 `publishConfig`，为后续 runtime 工具提供落地点。
- **FR-005d**：`packages/hooks/package.json` 中对 `@deweyou-ui/utils` 的僵尸依赖已在分支开始时清理，`workspace-boundaries.test.ts` 中对应断言已同步更新。
- **FR-006**：所有受影响 package 的 `exports` 字段必须与重构前语义等价，不删除或变更已有导出路径。
- **FR-006b**：本次重构必须在 `CLAUDE.md` 或 `docs/architecture/` 中新增一条「包职责分层」规则，明确：`infra` = monorepo build-time 工具（不发布）；`utils` = 消费方可安装的 runtime 工具（`@deweyou-design/utils`）；任何新的 build 脚本工具必须放入 `infra`，不得放入 `utils`。
- **FR-007**：本次为纯结构重构，不涉及 UI 或无障碍变更；所有组件无障碍契约保持不变。
- **FR-008**：本次不涉及新增或修改设计 token，现有组件变体模型（variant / color / size / shape）保持不变。
- **FR-009**：重构后 `apps/website` 组件预览页面必须正常显示，无需额外视觉变更。

### 无障碍与 UI 契约

本次为纯包结构重构，无 UI 变更，无障碍契约不变。

## 成功标准（必填）

### 可度量结果

- **SC-001**：`vp run build -r` 全量构建零报错，`vp check` 和 `vp test` 全量通过。
- **SC-002**：全文搜索 `@deweyou-ui/components`、`@deweyou-ui/hooks`、`@deweyou-ui/icons`、`@deweyou-ui/styles` 的结果均为空（`@deweyou-ui/utils` 保留）。
- **SC-003**：`@deweyou-design/react` 的 `dist/` 导出路径和类型与重构前 `@deweyou-ui/components` 完全等价。
- **SC-004**：图标包和 hooks 可独立构建，互不依赖；`packages/infra` 仍可作为各包 build script 的工具，但不出现在任何包的 `dependencies` 中。
- **SC-005**：`apps/website` 所有组件预览页面重构后正常渲染，无 console 错误。
- **SC-006**：每个面向消费方的包（`react`、`react-hooks`、`react-icons`、`styles`、`utils`）执行 `vp run build -r` 后，其 `dist/package.json` 中不得出现 `workspace:*` 或 `catalog:` 字符串；所有内部包依赖必须被解析为具体版本号（如 `^0.0.0`），所有 catalog 依赖必须被解析为对应的 semver 版本。

## 假设

- `@deweyou-ui/infra`（原 `@deweyou-ui/utils`）是纯 build 工具，消费方不直接安装，不进入 `@deweyou-design/*` scope。
- 当前版本均为 `0.x`，不需要为旧包名发布 deprecation shim。
- 所有受影响包（react、react-hooks、react-icons、styles）均未被外部消费方直接安装，改名不影响现有下游用户。
