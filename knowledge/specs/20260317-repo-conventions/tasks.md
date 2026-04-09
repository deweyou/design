# 任务：统一仓库约定

**输入**：来自 `/specs/20260317-repo-conventions/`
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/repository-governance.md`、`quickstart.md`

**测试**：根据宪章要求，此功能必须提供自动化验证，并确保治理类改动不会破坏预览安全性。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## Phase 1：准备阶段（共享基础设施）

**目的**：建立后续所有约束落地都会依赖的仓库治理界面。

- [x] T001 在 `AGENTS.md` 中更新仓库级贡献者指导
- [x] T002 [P] 在 `packages/components/AGENTS.md` 中对齐组件包指导
- [x] T003 [P] 在 `packages/hooks/AGENTS.md` 中对齐 hook 包指导
- [x] T004 [P] 在 `packages/utils/AGENTS.md` 中对齐 util 包指导

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：让测试与检查流水线具备校验测试就近放置规则的能力，再开始用户故事开发。

**⚠️ 关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T005 [P] 在 `packages/components/vite.config.ts` 中扩展组件测试发现范围，使其包含就近放置的测试
- [x] T006 [P] 在 `packages/hooks/vite.config.ts` 中扩展 hook 测试发现范围，使其包含就近放置的测试
- [x] T007 [P] 在 `packages/utils/vite.config.ts` 中扩展 util 测试发现范围，使其包含就近放置的测试
- [x] T008 [P] 在 `packages/utils/tests/repo-conventions.test.ts` 中创建仓库约定的回归覆盖
- [x] T009 在 `packages/utils/tests/repo-structure.test.ts` 中扩展受治理路径的结构边界覆盖

**检查点**：仓库检查现在能够发现约定回归，并识别就近放置的测试。

---

## Phase 3：用户故事 1 - 强制统一编写规则（优先级：P1）🎯 MVP

**目标**：让贡献者清楚看到推荐的函数风格、组件编写格式和命名模式，并在可行范围内通过机制强制执行。

**独立测试**：贡献者可以阅读仓库指导，看到由 lint 支撑的编写限制，并确认 website 主示例中不再出现 `React.createElement` 或非 TSX 的组件编写方式。

### 用户故事 1 的测试（必需）⚠️

- [x] T010 [P] [US1] 在 `packages/utils/tests/repo-conventions.test.ts` 中新增针对指导文档和示例代码的失败型编写规则断言
- [x] T011 [P] [US1] 在 `vite.config.ts` 中新增对不允许组件编写方式的失败型 lint 限制

### 用户故事 1 的实现

- [x] T012 [US1] 在 `AGENTS.md` 中完善仓库级编写、命名与例外规则
- [x] T013 [P] [US1] 在 `packages/components/AGENTS.md` 中完善组件编写约束
- [x] T014 [P] [US1] 在 `packages/hooks/AGENTS.md` 中完善 hook 编写约束
- [x] T015 [P] [US1] 在 `packages/utils/AGENTS.md` 中完善 util 命名与治理约束
- [x] T016 [US1] 在 `vite.config.ts` 中配置受治理编写规则的仓库级 lint 强制校验
- [x] T017 [US1] 将 website 入口从 `apps/website/src/main.ts` 重命名并改写为 `apps/website/src/main.tsx`

**检查点**：当指导文档、lint 规则以及 website 可见示例都在强化同一套编写规则时，用户故事 1 完成。

---

## Phase 4：用户故事 2 - 统一共享源码布局（优先级：P2）

**目标**：为现有共享源码单元引入受治理的 `src/<unit>/index` 目录布局，同时不丢失包导出的清晰性。

**独立测试**：维护者检查共享 packages 时，能够在独立的 `src/<unit>/` 目录中找到 hook 与组件实现，同时包入口仍能提供清晰稳定的导出。

### 用户故事 2 的测试（必需）⚠️

- [x] T018 [P] [US2] 在 `packages/utils/tests/repo-structure.test.ts` 中新增失败型受治理源码单元布局断言
- [x] T019 [P] [US2] 在 `packages/hooks/tests/index.test.ts` 中新增 hook 迁移后的导出稳定性失败型覆盖

### 用户故事 2 的实现

- [x] T020 [US2] 将主题 hook 实现迁移到 `packages/hooks/src/use-theme-mode/index.ts`，并从 `packages/hooks/src/index.ts` 重新导出
- [x] T021 [P] [US2] 将按钮契约测试从 `packages/components/tests/index.test.ts` 迁移到 `packages/components/src/button/index.test.ts`
- [x] T022 [US2] 在 `packages/components/AGENTS.md` 与 `packages/hooks/AGENTS.md` 中更新面向结构的包指导
- [x] T023 [US2] 在 `AGENTS.md` 中记录渐进式布局采纳策略与导入面防护规则

**检查点**：当受治理的源码单元使用独立目录，且包入口仍然暴露清晰明确的公开接口时，用户故事 2 完成。

---

## Phase 5：用户故事 3 - 将测试与源码单元就近放置（优先级：P3）

**目标**：将单元测试迁移到受治理源码单元旁边，并将顶层 `tests/` 目录限制为仅承载跨切面的覆盖。

**独立测试**：评审者打开任意受治理的 hook 或组件目录时，都能同时看到入口文件和单元测试；而保留的顶层测试目录应明确只承担跨切面覆盖，而不是重复的单元级测试。

### 用户故事 3 的测试（必需）⚠️

- [x] T024 [P] [US3] 在 `packages/utils/tests/repo-conventions.test.ts` 中新增失败型测试就近放置策略断言
- [x] T025 [P] [US3] 在 `packages/utils/tests/repo-structure.test.ts` 中新增针对旧顶层测试目录的失败型守卫覆盖

### 用户故事 3 的实现

- [x] T026 [US3] 将 hook 单元测试从 `packages/hooks/tests/index.test.ts` 迁移到 `packages/hooks/src/use-theme-mode/index.test.ts`
- [x] T027 [US3] 在将覆盖迁移到 `packages/components/src/button/index.test.ts` 后，移除已被替代的组件包级单元测试文件 `packages/components/tests/index.test.ts`
- [x] T028 [US3] 将 `packages/components/tests/workspace-boundaries.test.ts` 收窄为仅保留跨包边界覆盖，并在 `packages/components/AGENTS.md` 中记录该例外
- [x] T029 [US3] 在 `AGENTS.md` 与 `packages/utils/AGENTS.md` 中记录顶层测试目录仅用于跨切面检查的例外策略

**检查点**：当受治理单元的测试已完成就近放置，并且剩余顶层测试目录被明确保留给非单元级覆盖时，用户故事 3 完成。

---

## Phase 6：收尾与跨故事事项

**目的**：完成所有用户故事的最终验证与文档清理。

- [x] T030 [P] 在 `README.md` 中更新仓库使用说明，反映新的约定
- [x] T031 运行 `vp check` 完成验证
- [x] T032 运行 `vp test` 完成验证
- [x] T033 运行 `vp run website#build` 完成对预览安全的验证

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事工作
- **Phase 3（US1）**：依赖 Phase 2，是推荐的 MVP 起点
- **Phase 4（US2）**：依赖 Phase 2；可在 US1 完成后开始，也可在治理骨架稳定后并行推进
- **Phase 5（US3）**：依赖 Phase 4，因为测试就近放置建立在该阶段引入的 `src/<unit>/` 标准目录布局之上
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1**：基础阶段完成后即可开始，不依赖其他用户故事
- **US2**：功能上不依赖 US1，但会受益于 US1 中已经完成的指导文档与 lint 决策
- **US3**：依赖 US2，因为测试迁移应落在标准化后的 `src/<unit>/` 布局中

### 每个用户故事内部顺序

- 测试必须先新增，并应在实现前先处于失败状态
- 治理文件与自动化能力应先于依赖它们的示例或迁移清理落地
- 在移除旧文件位置前，必须先验证导出接口的稳定性

### 并行机会

- `T002`、`T003` 与 `T004` 可在 `T001` 完成后并行执行
- `T005`、`T006`、`T007` 与 `T008` 可在 Phase 2 并行执行
- `T013`、`T014` 与 `T015` 可在 US1 并行执行
- `T018` 与 `T019` 可在 US2 并行执行
- `T024` 与 `T025` 可在 US3 并行执行
- `T031`、`T032` 与 `T033` 应在实现完成后运行，若基础设施允许，也可分配执行

---

## 并行示例：用户故事 1

```text
Task: T013 [US1] 在 packages/components/AGENTS.md 中完善组件编写约束
Task: T014 [US1] 在 packages/hooks/AGENTS.md 中完善 hook 编写约束
Task: T015 [US1] 在 packages/utils/AGENTS.md 中完善 util 命名与治理约束
```

## 并行示例：用户故事 2

```text
Task: T018 [US2] 在 packages/utils/tests/repo-structure.test.ts 中新增失败型受治理源码单元布局断言
Task: T019 [US2] 在 packages/hooks/tests/index.test.ts 中新增 hook 迁移后的导出稳定性失败型覆盖
```

## 并行示例：用户故事 3

```text
Task: T024 [US3] 在 packages/utils/tests/repo-conventions.test.ts 中新增失败型测试就近放置策略断言
Task: T025 [US3] 在 packages/utils/tests/repo-structure.test.ts 中新增针对旧顶层测试目录的失败型守卫覆盖
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1
2. 完成 Phase 2
3. 完成 Phase 3（US1）
4. 使用 `vp check`、`vp test` 与 `vp run website#build` 验证结果
5. 如果当前目标只是先固化编写规则，可在结构迁移前先停在这里

### 渐进交付

1. 先落地治理指导与发现基础设施
2. 交付 US1，建立可见且自动化的编写规则
3. 交付 US2，将现有共享源码单元迁移到标准布局
4. 交付 US3，将单元测试就近放置，并将剩余顶层测试收窄为跨切面覆盖
5. 最后完成验证与文档清理

### 并行团队策略

1. 一位贡献者负责 `AGENTS.md` 中的根级治理，其余人同步调整各 package 的指导文件
2. 基础阶段完成后，一位贡献者可以处理 website 示例清理，另一位准备 hook 迁移
3. 当源码单元迁移完成后，测试就近放置与文档清理可以并行推进

---

## 备注

- 所有任务都遵循要求的清单格式，包含任务 ID 与明确文件路径
- 用户故事阶段的组织方式保证每个故事都可以独立测试
- `packages/utils/tests/repo-conventions.test.ts` 作为仓库级治理回归测试入口
- 在 US3 完成后，保留的顶层 `tests/` 目录只允许用于跨切面覆盖
- 验证与 workspace 工作流只允许使用 `vp` 命令
