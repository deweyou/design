# 调研报告：设计风格沉淀 + 文档迁移

**功能分支**：`20260329-distill-design-style`
**日期**：2026-03-29

---

## 决策一：目标文件结构

**决策**：将设计风格沉淀至根目录 `CLAUDE.md`（新增「设计风格」章节）和 `.specify/memory/design-style.md`（独立 memory 文件）。

**理由**：

- `CLAUDE.md` 是 Claude Code 的标准指导文件，Claude 每次对话均会加载。将设计风格写入其中，可在每次组件开发时自动生效，无需额外查询。
- `.specify/memory/` 是 Speckit 的长期记忆层，写入后可在 `/speckit.plan` 等工作流中被引用，保证规格与实现的一致性。
- 两处互补：`CLAUDE.md` 面向 Claude 的执行行为；memory 面向 Speckit 工作流的设计决策参考。

**备选方案**：在 `packages/styles/` 下创建 `DESIGN.md`——被否决，因为该文件不会被 Claude Code 自动加载。

---

## 决策二：AGENTS.md → CLAUDE.md 迁移策略

**决策**：将所有 `AGENTS.md` 内容迁移至同目录的 `CLAUDE.md`，迁移后删除 `AGENTS.md`。

**现有文件清单**（排除 `node_modules`）：

| 文件路径                        | 内容摘要                                            |
| ------------------------------- | --------------------------------------------------- |
| `AGENTS.md`（根）               | Vite+ 工作流文档、Ark UI 范式、技术栈历史、仓库约定 |
| `apps/storybook/AGENTS.md`      | 适用范围 + 5 条约束                                 |
| `apps/website/AGENTS.md`        | 适用范围 + 5 条约束                                 |
| `packages/components/AGENTS.md` | 适用范围 + 9 条约束 + Ark UI 使用指南               |
| `packages/hooks/AGENTS.md`      | 适用范围 + 7 条约束                                 |
| `packages/icons/AGENTS.md`      | 适用范围 + 6 条约束                                 |
| `packages/styles/AGENTS.md`     | 适用范围 + 5 条约束                                 |
| `packages/utils/AGENTS.md`      | 适用范围 + 8 条约束                                 |

**根目录迁移注意事项**：

- 根目录已有 `CLAUDE.md`，其内容比 `AGENTS.md` 更精简（无 Vite+ 详细文档，但结构更清晰）。
- 迁移策略：以现有 `CLAUDE.md` 为基础，将 `AGENTS.md` 中 `CLAUDE.md` 未涵盖的内容（仓库约定、Vite+ 命令详情）合并进来，同时新增「设计风格」章节。
- 避免重复：Ark UI 范式、技术栈、命令已在 `CLAUDE.md` 中，合并时以 `CLAUDE.md` 版本为准。

**子目录迁移注意事项**：

- 各子目录尚无 `CLAUDE.md`，直接创建即可，内容从 `AGENTS.md` 迁移。

**理由**：Claude Code 优先读取 `CLAUDE.md`，`AGENTS.md` 是 OpenAI Codex 的约定文件，不再需要同时维护两套。

---

## 决策三：Codex 文件清理

**决策**：删除 `.codex/` 目录（包含 `.codex/log/codex-tui.log`）。

**理由**：项目已切换至 Claude Code，`.codex/` 为 Codex CLI 遗留产物，无需保留。`.specify/init-options.json` 中的 `"ai": "codex"` 字段也应更新为 `"claude"`，以与当前工具链对齐。

---

## 决策四：设计风格内容范围

**决策**：从现有三个组件（Button、Popover、Text）及 `@deweyou-ui/styles` 中提炼以下 8 大风格维度，写入 `CLAUDE.md` 和 `.specify/memory/design-style.md`。

| 维度         | 核心规则（来源）                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 字体排印     | 思源宋体/宋体优先；字重四档（400/500/600/700）；caption 0.875rem/body 1rem/h1-h5 层级（`theme-light.css`）                            |
| 色彩         | 品牌色 emerald-700；语义色三档（neutral/primary/danger）；画布→表面→边框→文字层级体系（`theme-light.css`）                            |
| 圆角         | rect(0) / rounded(0.4rem) / auto(0.8rem) / pill(999px)；浮层默认 rounded；按钮填充态默认 auto（`button/index.module.less`）           |
| 阴影         | `--ui-shadow-soft`：`0 18px 40px rgba(24,33,29,0.12)`；用于浮层和卡片（`popover/index.module.less`）                                  |
| 交互反馈     | hover 6–12% 透明混色；active 10–18% 混色 + translateY(1px)；disabled opacity 0.56（`button/index.module.less`）                       |
| 过渡动效     | 交互元素 140ms ease；浮层入场 160ms cubic-bezier(0.22,1,0.36,1)；浮层出场 160ms ease（`popover/index.module.less`）                   |
| 焦点         | 2px emerald outline，2px offset，全组件统一（`button/index.module.less`）                                                             |
| 组件变体模型 | variant(filled/outlined/ghost/link) × color(neutral/primary/danger) × size(5档) × shape(rect/rounded/pill) 正交（`button/index.tsx`） |

**理由**：这 8 个维度覆盖了现有组件中所有可通过 token 或 prop 表达的视觉决策。写入 `CLAUDE.md` 后，Claude 在实现新组件时能直接应用，无需推断。

---

## 决策五：.specify/init-options.json 更新

**决策**：将 `"ai": "codex"` 更新为 `"ai": "claude"`，`"ai_skills": false` 更新为 `true`。

**理由**：项目已全面切换至 Claude Code，`init-options.json` 中的 AI 字段影响 Speckit 脚本的 agent context 更新行为（`update-agent-context.sh claude` vs `update-agent-context.sh codex`）。`ai_skills: true` 启用 Speckit 的技能集成（`/speckit.*` 命令），与当前 `.claude/` 配置对齐。

---

## 无需解决的问题

- node_modules 中的 `vite-plus/AGENTS.md`：不属于本仓库管辖，无需处理。
- 任何 `.gitignore` 变更：`.codex/` 不在 `.gitignore` 中，删除后无需额外处理。
