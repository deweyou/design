# 任务：将 Storybook 升级到最新版本

**输入**：来自 `/specs/20260317-upgrade-storybook/`
**前置条件**：`plan.md`（必需）、`spec.md`（用户故事必需）、`research.md`、`data-model.md`、`contracts/`

**测试**：根据宪章要求，工作流回归、预览行为和 Storybook 兼容性检查必须提供测试。每个用户故事都包含在该变更可能影响贡献者可见行为时所需的自动化覆盖。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行，通常表示涉及不同文件且无直接依赖
- **[Story]**：该任务所属的用户故事，例如 `US1`、`US2`、`US3`
- 描述中必须包含精确文件路径

## 路径约定

- Workspace 元数据：`package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`
- Storybook 应用：`apps/storybook/.storybook/`、`apps/storybook/src/stories/`
- 功能文档：`specs/20260317-upgrade-storybook/`

## Phase 1：准备阶段（共享基础设施）

**目的**：盘点当前 Storybook 界面与能力范围，并建立升级执行基线。

- [x] T001 在 `pnpm-workspace.yaml`、`apps/storybook/package.json` 与 `pnpm-lock.yaml` 中盘点当前 Storybook 包归属和版本偏差
- [x] T002 [P] 在 `apps/storybook/.storybook/main.ts`、`apps/storybook/.storybook/preview.ts` 与 `apps/storybook/src/stories/Button.stories.tsx` 中记录当前 Storybook 配置与 story 使用模式
- [x] T003 [P] 在 `package.json`、`apps/storybook/README.md` 与 `specs/20260317-upgrade-storybook/quickstart.md` 中记录当前验证方式与维护者工作流预期

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：在开始 story 级迁移之前，先对齐整个 workspace 的 Storybook 依赖与应用壳配置。

**⚠️ 关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T004 在 `pnpm-workspace.yaml` 中更新共享的 Storybook 目标版本线与依赖目录项
- [x] T005 [P] 在 `apps/storybook/package.json` 中对齐 Storybook 应用的依赖消费方式与脚本，使其匹配目标版本
- [x] T006 [P] 在 `pnpm-lock.yaml` 中刷新升级后 Storybook 依赖图对应的 lockfile 状态
- [x] T007 在 `apps/storybook/.storybook/main.ts` 与 `apps/storybook/.storybook/preview.ts` 中迁移 Storybook 应用壳和框架配置，使其适配目标版本
- [x] T008 [P] 如果 Storybook 命令或预期发生变化，则在 `package.json`、`README.md` 与 `apps/storybook/README.md` 中更新仓库级维护者工作流引用

**检查点**：依赖对齐和基础配置已完成，可以开始 story 级迁移与验证。

---

## Phase 3：用户故事 1 - 稳定预览基线（优先级：P1）🎯 MVP

**目标**：将内部 Storybook 应用升级到最新稳定版本线，并确保它能够正常构建和启动，不出现版本不匹配失败。

**独立测试**：运行 `vp install`、`vp check`、`vp test`、`vp run storybook#build` 和 `vp run storybook#dev`，然后确认 Storybook 应用可以启动，并能加载主要的内部评审 story 分组。

### 用户故事 1 的实现

- [x] T011 [US1] 在 `pnpm-workspace.yaml` 与 `apps/storybook/package.json` 中解决剩余的 Storybook 9/10 包、addon 与框架迁移问题
- [x] T012 [P] [US1] 在 `apps/storybook/.storybook/main.ts` 与 `apps/storybook/.storybook/preview.ts` 中实现升级后所需的配置结构与预览参数变更
- [x] T013 [US1] 在 `apps/storybook/README.md` 与 `specs/20260317-upgrade-storybook/quickstart.md` 中更新面向内部评审应用的 Storybook 构建与启动预期

**检查点**：当升级后的 Storybook 应用可以作为内部评审基线正常构建和运行时，用户故事 1 完成。

---

## Phase 4：用户故事 2 - 保留贡献者工作流（优先级：P2）

**目标**：保持现有 stories、docs 和交互控件继续可用，避免组件贡献者在开发组件前先处理预览回归问题。

**独立测试**：打开升级后的 Storybook 应用，在 canvas 与 docs 视图中加载代表性的 button story，并确认 controls、autodocs、backgrounds 以及共享主题样式仍然正常工作。

### 用户故事 2 的实现

- [x] T016 [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 中迁移代表性 story 定义以及任何已废弃的 story 元数据
- [x] T017 [P] [US2] 在 `apps/storybook/.storybook/preview.ts` 中调整预览级参数与 docs 行为，以保持贡献者工作流稳定
- [x] T018 [US2] 在 `apps/storybook/AGENTS.md` 与 `apps/storybook/README.md` 中更新升级后的 Storybook 作用范围和 story 编写指导

**检查点**：当代表性 stories、docs、controls 以及依赖主题的预览行为在升级后仍可用时，用户故事 2 完成。

---

## Phase 5：用户故事 3 - 明确升级影响（优先级：P3）

**目标**：记录迁移范围、已解决的破坏性问题以及剩余待跟进项，让后续组件工作可以基于清晰的 Storybook 基线展开。

**独立测试**：审查迁移说明，确认维护者无需查阅外部上下文，就能明确知道发生了什么变化、如何运行 Storybook，以及还剩哪些后续事项。

### 用户故事 3 的实现

- [x] T020 [US3] 在 `specs/20260317-upgrade-storybook/research.md` 与 `specs/20260317-upgrade-storybook/quickstart.md` 中记录升级说明、已解决的迁移事项以及延后处理项
- [x] T021 [P] [US3] 在 `README.md` 与 `apps/storybook/README.md` 中更新面向维护者的 Storybook 使用方式和迁移指导
- [x] T022 [US3] 在 `specs/20260317-upgrade-storybook/plan.md` 与 `specs/20260317-upgrade-storybook/contracts/storybook-preview-contract.md` 中刷新功能计划产物，使其反映最终落地的 Storybook 基线

**检查点**：当升级范围和面向贡献者的影响被记录得足够清晰，足以支撑后续组件工作时，用户故事 3 完成。

---

## Phase 6：收尾与跨故事事项

**目的**：完成最终验证、清理，并端到端确认 Storybook 在升级后确实可以运行。

- [x] T023 [P] 在 `specs/20260317-upgrade-storybook/quickstart.md` 中记录升级后 Storybook 基线的完整 workspace 验证结果
- [x] T024 启动升级后的 Storybook 开发服务器，手动验证运行时行为，并在 `apps/storybook/README.md` 与 `specs/20260317-upgrade-storybook/quickstart.md` 中记录最终运行检查清单
- [x] T025 [P] 在 `pnpm-workspace.yaml`、`apps/storybook/.storybook/main.ts`、`apps/storybook/.storybook/preview.ts` 与 `apps/storybook/README.md` 中清理过时迁移说明、陈旧包引用和临时兼容性注释

---

## 依赖与执行顺序

### 阶段依赖

- **准备阶段（Phase 1）**：无依赖，可立即开始
- **基础阶段（Phase 2）**：依赖准备阶段完成，并阻塞所有 story 相关工作
- **用户故事 1（Phase 3）**：依赖基础阶段完成
- **用户故事 2（Phase 4）**：依赖用户故事 1 提供可运行的 Storybook 基线
- **用户故事 3（Phase 5）**：依赖用户故事 1 与用户故事 2，使文档反映真实迁移结果
- **收尾阶段（Phase 6）**：依赖所有用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**：首个可交付成果，也是 MVP，不依赖后续故事
- **用户故事 2（P2）**：建立在用户故事 1 提供的升级基线之上
- **用户故事 3（P3）**：用于记录用户故事 1 与用户故事 2 的最终结果

### 每个用户故事内部顺序

- 测试应先于实现新增或更新，并在迁移完成前先处于失败状态
- 依赖与配置对齐应先于 story 内容调整
- story 内容与预览行为调整应先于维护者文档定稿
- 只有在所有升级改动落地后，才进行最终运行时验证

### 并行机会

- `T002` 与 `T003` 可在准备阶段并行执行
- `T005`、`T006` 与 `T008` 可在确定目标版本线后并行执行
- `T021` 与 `T022` 可在用户故事 3 中并行推进文档更新
- 若 `T024` 的运行时检查由单独负责人处理，则 `T023` 与 `T025` 可在最终清理阶段并行执行

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 中涉及不同文件的实现任务
Task: "在 pnpm-workspace.yaml 和 apps/storybook/package.json 中处理包迁移变更"
Task: "在 apps/storybook/.storybook/main.ts 和 apps/storybook/.storybook/preview.ts 中实现升级后的配置结构"
```

## 并行示例：用户故事 2

```bash
# 并行启动用户故事 2 中涉及不同文件的实现任务
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中迁移代表性 stories"
Task: "在 apps/storybook/.storybook/preview.ts 中调整预览参数"
```

## 并行示例：用户故事 3

```bash
# 同时推进用户故事 3 的文档更新
Task: "在 README.md 和 apps/storybook/README.md 中更新面向维护者的 Storybook 使用说明"
Task: "在 specs/20260317-upgrade-storybook/plan.md 和 specs/20260317-upgrade-storybook/contracts/storybook-preview-contract.md 中刷新功能计划产物"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 停下来验证 `vp run storybook#build` 与 `vp run storybook#dev` 都能成功执行

### 渐进交付

1. 先完成准备阶段与基础阶段，建立升级基线
2. 交付用户故事 1，使 Storybook 在最新稳定版本线上可构建、可运行
3. 交付用户故事 2，保留 stories、docs、controls 与主题工作流
4. 交付用户故事 3，固化迁移说明与维护者指导
5. 最后完成 Phase 6 的验证与清理

### 并行团队策略

1. 一位贡献者负责对齐根级与应用级依赖，另一位负责准备配置和回归测试
2. 当用户故事 1 稳定后，一位贡献者可以迁移 stories 与预览行为，另一位更新维护者文档
3. 最终验证应由单一负责人完成，以确认升级后的 Storybook 应用确实能够端到端运行

---

## 备注

- 所有任务都遵循要求的清单格式，包含任务 ID、可选的 `[P]`、适用时的故事标签以及明确文件路径
- 用户故事 1 是推荐的 MVP，因为它先建立一个升级后、可运行的 Storybook 基线
- 用户故事 2 与用户故事 3 被有意安排在用户故事 1 之后，因为它们依赖的是已经真实落地的新基线，而不是理论设计
- 安装、验证、构建与开发流程只允许使用 `vp` 命令
