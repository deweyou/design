# 实施计划：从现有组件中沉淀设计风格指南

**分支**：`20260329-distill-design-style` | **日期**：2026-03-29 | **规格**：[spec.md](./spec.md)
**输入**：来自 `/specs/20260329-distill-design-style/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

---

## 摘要

本功能分三条主线并行推进：

1. **设计风格沉淀**：将从 Button、Popover、Text 组件及 `@deweyou-ui/styles` 中提炼出的 8 大设计维度（字体排印、色彩、圆角、阴影、交互反馈、动效、焦点、变体模型）写入根目录 `CLAUDE.md` 和 `.specify/memory/design-style.md`，使 Claude Code 在每次对话中自动具备设计上下文，Speckit 工作流也能引用。
2. **文档迁移**：将仓库中所有 `AGENTS.md`（7 个包/应用目录）重命名为 `CLAUDE.md`，根目录的 `AGENTS.md` 内容合并入现有 `CLAUDE.md`；迁移完成后删除全部 `AGENTS.md`。
3. **Codex 清理**：删除 `.codex/` 遗留目录，将 `.specify/init-options.json` 中的 AI 字段由 `"codex"` 更新为 `"claude"`。

本功能不涉及任何 React 组件代码、package API 或测试变更。

---

## 技术上下文

**语言/版本**：TypeScript 5.x、Node.js 24.14.0
**主要依赖**：vite-plus、`@ark-ui/react`、`@deweyou-ui/styles`
**存储**：N/A（仅文件系统变更）
**测试**：`vp check`（格式化 + lint + 类型检查）；无组件逻辑变更，无需新增单测
**目标平台**：开发工具链（Claude Code、Speckit）
**项目类型**：monorepo 文档/配置迁移
**性能目标**：N/A
**约束**：所有 `/specs/` 文档正文必须使用简体中文
**规模/范围**：8 个 AGENTS.md 文件、1 个 CLAUDE.md（根）合并、2 个新 memory/style 文件、1 个 init-options.json 更新、1 个 .codex/ 目录删除

---

## 宪章检查

_门禁：Phase 0 research 前通过。_

- ✅ **包边界**：本功能不新增/修改任何 package，不涉及包边界问题。
- ✅ **公开 API 变化**：无任何 React 组件 API 变更，semver 影响为零。
- ✅ **无障碍预期**：无组件交互逻辑变更；现有组件的无障碍契约不受影响。
- ✅ **Token/主题影响**：不新增或修改设计 token，仅将现有 token 规律文档化。
- ✅ **验证计划**：运行 `vp check` 确保无格式/lint/类型错误；无需新增单测。
- ✅ **文档语言**：所有 `/specs/` 文档使用简体中文，符合宪章第 V 条。
- ✅ **Vite+ 合规**：无构建配置变更；所有构建操作继续通过 `vp` 命令执行。

---

## 项目结构

### 文档（本功能）

```text
specs/20260329-distill-design-style/
├── plan.md              ← 本文件
├── spec.md              ← 功能规格
├── research.md          ← Phase 0 调研报告
└── checklists/
    └── requirements.md  ← 规格质量检查清单
```

### 变更文件（仓库）

```text
CLAUDE.md                          ← 合并 AGENTS.md 内容 + 新增「设计风格」章节
AGENTS.md                          ← 删除
.specify/init-options.json         ← ai: "codex" → "claude"，ai_skills: false → true
.specify/memory/design-style.md    ← 新建（设计风格 memory）

apps/storybook/CLAUDE.md           ← 新建（从 AGENTS.md 迁移）
apps/storybook/AGENTS.md           ← 删除
apps/website/CLAUDE.md             ← 新建（从 AGENTS.md 迁移）
apps/website/AGENTS.md             ← 删除
packages/components/CLAUDE.md      ← 新建（从 AGENTS.md 迁移）
packages/components/AGENTS.md      ← 删除
packages/hooks/CLAUDE.md           ← 新建（从 AGENTS.md 迁移）
packages/hooks/AGENTS.md           ← 删除
packages/icons/CLAUDE.md           ← 新建（从 AGENTS.md 迁移）
packages/icons/AGENTS.md           ← 删除
packages/styles/CLAUDE.md          ← 新建（从 AGENTS.md 迁移）
packages/styles/AGENTS.md          ← 删除
packages/utils/CLAUDE.md           ← 新建（从 AGENTS.md 迁移）
packages/utils/AGENTS.md           ← 删除

.codex/                            ← 整个目录删除
```

**结构决策**：纯文档/配置迁移，不涉及 `src/` 目录下任何源码变更。

---

## Phase 0：调研结论

详见 [research.md](./research.md)。核心决策：

| 决策               | 结论                                                        |
| ------------------ | ----------------------------------------------------------- |
| 设计风格沉淀位置   | 根 `CLAUDE.md` 新增章节 + `.specify/memory/design-style.md` |
| AGENTS.md 迁移策略 | 子目录：直接重命名；根目录：合并至现有 CLAUDE.md            |
| Codex 清理范围     | `.codex/` 目录 + `init-options.json` AI 字段                |
| 设计风格维度       | 8 大维度（见 research.md 决策四）                           |

---

## Phase 1：设计与契约

### 数据模型（变更文件的内容规划）

#### 根目录 CLAUDE.md 新增章节

在「最近变更」章节前，新增「## 设计风格」章节，包含：

```markdown
## 设计风格

> 本节从 Button、Popover、Text 组件及 `@deweyou-ui/styles` 提炼，
> 是新组件开发的视觉与交互基准。

### 字体排印

- 正文/标题统一使用宋体（serif）：思源宋体 → Songti SC → STSong → SimSun
- 字重四档：400（正文）/ 500（强调）/ 600（标题）/ 700（重标题）
- 字号层级：caption 0.875rem / body 1rem / h5 1.15rem / h4 1.45rem / h3 1.85rem / h2 2.3rem / h1 clamp(2.8–4.6rem)

### 色彩系统

- 品牌色：emerald-700（`--ui-color-brand-bg`）；危险色：red-700；焦点环：emerald-500
- 画布（白）→ 表面（neutral-50）→ 边框（slate-300）→ 文字（neutral-950）四层体系
- 语义色三档：neutral（默认）/ primary（品牌绿）/ danger（红）

### 圆角档位

- rect: 0 | rounded: 0.4rem（浮层/ghost 按钮默认）| auto: 0.8rem（filled/outlined 按钮默认）| pill: 999px

### 阴影

- 柔和大模糊：`0 18px 40px rgba(24,33,29,0.12)`（`--ui-shadow-soft`），用于浮层和卡片

### 交互反馈

- hover：`color-mix(in srgb, <color> 6–12%, transparent)`
- active：`color-mix(in srgb, <color> 10–18%, transparent)` + `translateY(1px)`
- disabled：`opacity: 0.56`，`cursor: not-allowed`

### 过渡与动效

- 交互元素：`140ms ease`（background, border-color, color, box-shadow, transform）
- 浮层入场：`160ms cubic-bezier(0.22, 1, 0.36, 1)`，translateY/X(6px) + scale(0.98) → 归零
- 浮层出场：`160ms ease forwards`，归零 → translateY/X(4.2px) + scale(0.98)
- prefers-reduced-motion：交互过渡不变；浮层 transform 归零

### 焦点

- 统一：`outline: 2px solid var(--ui-color-focus-ring); outline-offset: 2px`

### 组件变体模型

- variant（视觉层级）：filled / outlined / ghost / link
- color（语义色）：neutral / primary / danger
- size（尺寸）：extra-small / small / medium / large / extra-large
- shape（形状，仅 filled/outlined）：rect / rounded / pill
```

#### .specify/memory/design-style.md 内容

```markdown
---
name: design-style
description: 从 Button、Popover、Text 组件提炼的设计风格——字体/色彩/圆角/动效/焦点规则
type: project
---

[上述设计风格内容的精简版，作为 Speckit memory 格式文件]
```

#### 子目录 CLAUDE.md

各子目录 CLAUDE.md 从对应 AGENTS.md 直接迁移，无内容修改：

- 文件名：`AGENTS.md` → `CLAUDE.md`
- 内容：原样保留

### 契约

本功能为纯文档/配置迁移，无对外 API，无需生成 contracts/。

### Agent Context 更新

运行：`.specify/scripts/bash/update-agent-context.sh claude`

---

## 实施顺序

建议任务执行顺序（见 tasks.md）：

1. 更新 `.specify/init-options.json`（AI 字段）
2. 新建 `.specify/memory/design-style.md`
3. 合并根 `AGENTS.md` → `CLAUDE.md`（含设计风格章节）
4. 删除根 `AGENTS.md`
5. 为每个子目录创建 `CLAUDE.md`（从 AGENTS.md 内容迁移）
6. 删除所有子目录 `AGENTS.md`
7. 删除 `.codex/` 目录
8. 运行 `vp check` 验证

---

## 验证计划

```bash
vp check    # 类型检查 + lint + 格式化，确保无文件变更引发的报错
```

无需运行 `vp test`，因为本次变更不涉及任何 TypeScript 源码。
