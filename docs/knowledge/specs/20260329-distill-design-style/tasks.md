# 任务：从现有组件中沉淀设计风格指南

**输入**：来自 `/specs/20260329-distill-design-style/` 的设计文档
**前置条件**：plan.md ✅、spec.md ✅、research.md ✅
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：本功能为纯文档/配置迁移，不涉及组件逻辑变更；使用 `vp check` 作为唯一自动化验证门禁。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（US1、US2、US3）
- 描述中必须包含准确文件路径

---

## Phase 1：准备（配置与清理）

**目的**：更新 Speckit 配置以对齐 Claude Code 工具链，并清理 Codex 遗留产物，为后续所有阶段建立正确基础。

- [x] T001 将 `.specify/init-options.json` 中的 `"ai"` 字段由 `"codex"` 更新为 `"claude"`，`"ai_skills"` 由 `false` 更新为 `true`
- [x] T002 [P] 删除 `.codex/` 目录（包含 `.codex/log/codex-tui.log`）

**检查点**：`.specify/init-options.json` 中 `ai` 字段为 `"claude"`；`.codex/` 目录不再存在

---

## Phase 2：基础阶段（设计风格 memory 文件）

**目的**：建立 Speckit memory 层的设计风格基准，后续所有 `/speckit.*` 工作流均可引用。

**⚠️ 关键**：本阶段完成后，US1/US2 才能基于统一的设计风格描述来填充 CLAUDE.md 内容。

- [x] T003 新建 `.specify/memory/design-style.md`，将 8 大设计维度（字体、色彩、圆角、阴影、交互反馈、动效、焦点、变体模型）以 Speckit memory 格式写入，并在 `.specify/memory/MEMORY.md`（如存在）中添加索引条目

**检查点**：`.specify/memory/design-style.md` 存在且包含所有 8 个维度的描述

---

## Phase 3：用户故事 1 - 设计师可查阅风格规则（优先级：P1）🎯 MVP

**目标**：在根目录 `CLAUDE.md` 中新增「设计风格」章节，使设计师无需阅读组件源码即可获取完整的视觉与交互规范。

**独立测试**：阅读更新后的 `CLAUDE.md`，确认能在不查阅任何组件源码的情况下，找到字体、色彩、圆角、动效、焦点的完整规则。

### 用户故事 1 的实现

- [x] T004 [US1] 在根目录 `CLAUDE.md` 的「最近变更」章节前，新增「## 设计风格」章节，包含 8 大维度（字体排印、色彩系统、圆角档位、阴影、交互反馈、过渡与动效、焦点、组件变体模型）；内容来源：`packages/components/src/button/index.module.less`、`packages/components/src/popover/index.module.less`、`packages/styles/src/css/theme-light.css`
- [x] T005 [US1] 在根目录 `CLAUDE.md` 中补充「## 仓库约定」章节（如尚未包含），从根目录 `AGENTS.md` 的仓库约定部分迁移内容（箭头函数优先、TSX-first、kebab-case、colocate 单测、commit 格式等规则）

**检查点**：根目录 `CLAUDE.md` 包含「设计风格」和「仓库约定」两个新章节，内容完整且无 NEEDS CLARIFICATION 标记

---

## Phase 4：用户故事 2 - 开发者实现新组件时可对齐风格（优先级：P1）

**目标**：完成全部 AGENTS.md → CLAUDE.md 迁移，并删除旧文件，使 Claude Code 在所有目录下均读取 `CLAUDE.md`，开发者实现新组件时能获得完整的约束和风格上下文。

**独立测试**：确认仓库中（排除 `node_modules`）已无 `AGENTS.md` 文件；每个包/应用目录均有 `CLAUDE.md`；根目录 `AGENTS.md` 已删除。

### 用户故事 2 的实现

- [x] T006 [P] [US2] 将 `apps/storybook/AGENTS.md` 全部内容迁移至新建的 `apps/storybook/CLAUDE.md`，内容原样保留
- [x] T007 [P] [US2] 将 `apps/website/AGENTS.md` 全部内容迁移至新建的 `apps/website/CLAUDE.md`，内容原样保留
- [x] T008 [P] [US2] 将 `packages/components/AGENTS.md` 全部内容迁移至新建的 `packages/components/CLAUDE.md`，内容原样保留
- [x] T009 [P] [US2] 将 `packages/hooks/AGENTS.md` 全部内容迁移至新建的 `packages/hooks/CLAUDE.md`，内容原样保留
- [x] T010 [P] [US2] 将 `packages/icons/AGENTS.md` 全部内容迁移至新建的 `packages/icons/CLAUDE.md`，内容原样保留
- [x] T011 [P] [US2] 将 `packages/styles/AGENTS.md` 全部内容迁移至新建的 `packages/styles/CLAUDE.md`，内容原样保留
- [x] T012 [P] [US2] 将 `packages/utils/AGENTS.md` 全部内容迁移至新建的 `packages/utils/CLAUDE.md`，内容原样保留
- [x] T013 [US2] 删除根目录 `AGENTS.md`（根目录内容已于 T004/T005 合并至 `CLAUDE.md`）
- [x] T014 [US2] 删除全部子目录 `AGENTS.md`（`apps/storybook/`、`apps/website/`、`packages/components/`、`packages/hooks/`、`packages/icons/`、`packages/styles/`、`packages/utils/`，共 7 个文件）

**检查点**：`git status` 显示 8 个 `AGENTS.md` 文件已删除，8 个 `CLAUDE.md` 文件已新建（含根目录更新）；运行 `find . -name AGENTS.md -not -path "*/node_modules/*"` 结果为空

---

## Phase 5：用户故事 3 - 审查者可检查组件是否符合设计风格（优先级：P2）

**目标**：在根目录 `CLAUDE.md` 中补充「设计风格合规检查」快速参考，使审查者在 Code Review 时能直接对照具体数值（opacity 0.56、140ms、2px outline 等），无需记忆。

**独立测试**：给出一个带有风格偏差（如 opacity: 0.3、动画 300ms）的组件描述，确认仅凭 `CLAUDE.md` 中的设计风格章节即可识别所有偏差。

### 用户故事 3 的实现

- [x] T015 [US3] 在根目录 `CLAUDE.md` 的「设计风格」章节末尾，新增「### 常见风格偏差速查」小节，列举审查时最易出错的具体数值（disabled opacity: **0.56**、交互过渡: **140ms**、浮层动效: **160ms**、焦点环: **2px / 2px offset**、hover 混色: **6–12%**、active 位移: **translateY(1px)**）

**检查点**：`CLAUDE.md` 中存在「常见风格偏差速查」小节，包含上述 6 项具体数值

---

## Phase 6：打磨与验证

**目的**：确保所有变更通过 lint/类型检查，无遗留文件。

- [x] T016 [P] 运行 `vp check` 确认格式化、lint 和类型检查全部通过，无因文件变更引发的报错
- [x] T017 运行 `find . -name AGENTS.md -not -path "*/node_modules/*"` 确认结果为空，确认迁移完整
- [x] T018 [P] 在根目录 `CLAUDE.md` 的「最近变更」章节中，新增 `20260329-distill-design-style` 条目，说明：引入设计风格章节、完成 AGENTS.md → CLAUDE.md 全面迁移、清理 Codex 遗留文件

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备）**：无依赖，可立即开始
- **Phase 2（基础）**：依赖 Phase 1 完成（`init-options.json` 正确后 Speckit memory 才有效）
- **Phase 3（US1）**：依赖 Phase 2 完成；是 MVP，可独立交付
- **Phase 4（US2）**：依赖 Phase 1 完成；与 Phase 3 可并行（文件不重叠）
- **Phase 5（US3）**：依赖 Phase 3 完成（在 US1 的「设计风格」章节基础上追加内容）
- **Phase 6（打磨）**：依赖所有前置阶段完成

### 用户故事依赖

- **US1（P1）**：Phase 2 完成后即可开始，不依赖 US2
- **US2（P1）**：Phase 1 完成后即可开始，可与 US1 并行
- **US3（P2）**：US1 完成后开始

### Phase 4 内部并行机会

T006–T012（7 个子目录 CLAUDE.md 新建）均可完全并行执行，因为文件路径互不重叠：

```bash
# 可同时启动：
Task T006: apps/storybook/CLAUDE.md
Task T007: apps/website/CLAUDE.md
Task T008: packages/components/CLAUDE.md
Task T009: packages/hooks/CLAUDE.md
Task T010: packages/icons/CLAUDE.md
Task T011: packages/styles/CLAUDE.md
Task T012: packages/utils/CLAUDE.md
```

T013（删除根目录 AGENTS.md）必须在 T004/T005 完成后执行。
T014（删除子目录 AGENTS.md）必须在 T006–T012 全部完成后执行。
