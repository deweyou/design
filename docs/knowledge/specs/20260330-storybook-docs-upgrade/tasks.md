# 任务：Storybook 文档升级与重组

**输入**：来自 `specs/20260330-storybook-docs-upgrade/` 的设计文档
**前置条件**：plan.md、spec.md、research.md、data-model.md、contracts/story-api-contract.md

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事

---

## Phase 1：准备 — Storybook 版本升级（US3，P2）

> **说明**：版本升级作为基础设施先行，避免在旧版本上完成文档改造后再切换环境引入回归。升级完成后才开始 story 文件的改动。

**目标**：将所有 `@storybook/*` 包升级至最新稳定版，验证 6 个 story 无回归。

**独立测试**：运行 `vp run storybook#dev`，6 个 story 全部加载无错误；控制台无缺失依赖警告；Light / Dark 主题切换正常。

- [x] T001 [US3] 查询当前最新 Storybook 稳定版本（`npm view storybook version`），更新 `pnpm-workspace.yaml` catalog 节中的 4 个条目：`storybook`、`@storybook/react`、`@storybook/react-vite`、`@storybook/addon-docs`
- [x] T002 [US3] 运行 `vp install` 重新安装依赖，确认 lockfile 中 `@storybook/*` 版本统一
- [x] T003 [US3] 运行 `vp run storybook#dev`，逐一打开全部 6 个 story，记录并修复升级后的兼容性报错（如有）
- [x] T004 [US3] 运行 `vp check`，修复升级引入的类型或 lint 报错（如有）

**检查点**：T001–T004 完成后，Storybook 以新版本正常运行，所有既有 story 无回归。

---

## Phase 2：基础阶段 — 配置清理

> **说明**：修改 Storybook 配置中的中文字符串，为后续所有 story 文件的英文化建立基准。此阶段无依赖，可与 Phase 1 并行执行。

**⚠️ 关键**：Phase 3 和 Phase 4 的任何改动均依赖 Phase 1 和 Phase 2 完成。

- [x] T005 [P] 将 `apps/storybook/.storybook/main.ts` 中的 `docs.defaultName` 从当前中文字符串改为 `'Overview'`
- [x] T006 [P] 检查 `apps/storybook/.storybook/preview.ts`，将所有面向用户的中文字符串（toolbar item title、description 等）改为英文

**检查点**：完成后重新运行 Storybook，顶部文档标签名称显示为英文。

---

## Phase 3：用户故事 1 — 侧边栏分类重组（P1）🎯 最快可见成果

**目标**：将 4 个 story 的 `title` 前缀从 `Internal review/` 改为 `Components/`，确保侧边栏仅出现 `Components/` 和 `Foundations/` 两个顶层分类。

**独立测试**：运行 `vp run storybook#dev`，打开侧边栏，确认仅存在 `Components`（5 项）和 `Foundations`（1 项）两个顶层分类，无 `Internal review` 分组。

- [x] T007 [P] [US1] 将 `apps/storybook/src/stories/Button.stories.tsx` 中 `meta.title` 从 `'Internal review/Button'` 改为 `'Components/Button'`
- [x] T008 [P] [US1] 将 `apps/storybook/src/stories/Typography.stories.tsx` 中 `meta.title` 从 `'Internal review/Typography'` 改为 `'Components/Typography'`
- [x] T009 [P] [US1] 将 `apps/storybook/src/stories/Popover.stories.tsx` 中 `meta.title` 从 `'Internal review/Popover'` 改为 `'Components/Popover'`
- [x] T010 [P] [US1] 将 `apps/storybook/src/stories/Icon.stories.tsx` 中 `meta.title` 从 `'Internal review/Icon'` 改为 `'Components/Icon'`
- [x] T011 [US1] 验证 `apps/storybook/src/stories/Menu.stories.tsx`（`Components/Menu`）和 `apps/storybook/src/stories/Color.stories.tsx`（`Foundations/Color`）的 title 已正确，无需改动；若发现偏差则修正

**检查点**：侧边栏结构符合 contracts/story-api-contract.md 契约一的要求。

---

## Phase 4：用户故事 2 — API 文档化与英文化（P1）

**目标**：为全部 5 个 component story 添加完整 `argTypes`（英文描述 + 类型摘要 + 默认值）；将所有 story 内用户可见文本改为英文；为 Color story 仅做英文化。

**独立测试**：打开 Storybook 任意组件的 Docs 页面，Props 表格完整，无中文字符串；Controls 面板对 select/boolean prop 显示对应控件类型。

### 4A：Button（含 IconButton）

- [x] T012 [P] [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 中为 `Button` meta 添加 `tags: ['autodocs']` 和完整 `argTypes`（`variant`、`color`、`size`、`shape`、`disabled`、`loading`、`href`、`target`、`htmlType`、`icon`、`children`），依照 `data-model.md` 中的 Button prop 定义；将所有 gallery 内中文 label 改为英文；将 `parameters.docs.description.component` 改为英文
- [x] T013 [P] [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 中为 `Button.Icon`（IconButton）添加独立的 `argTypes` 文档段（subcomponents 字段或单独的 meta export），覆盖 `icon`（必填）、`variant`（不含 link）、`color`、`size`、`shape`、`disabled`、`loading`、`aria-label`；在英文描述中标注 `icon` 为必填项及 aria-label 的无障碍要求

### 4B：Typography

- [x] T014 [P] [US2] 在 `apps/storybook/src/stories/Typography.stories.tsx` 中为 `Text` meta 添加 `tags: ['autodocs']` 和完整 `argTypes`（`variant`、`bold`、`italic`、`underline`、`strikethrough`、`color`、`background`、`lineClamp`、`children`），依照 `data-model.md`；将所有中文 label 和描述改为英文

### 4C：Popover

- [x] T015 [P] [US2] 在 `apps/storybook/src/stories/Popover.stories.tsx` 中为 `Popover` meta 添加 `tags: ['autodocs']` 和完整 `argTypes`（`content`、`trigger`、`placement`、`shape`、`mode`、`visible`、`defaultVisible`、`disabled`、`offset`、`boundaryPadding`、`onVisibleChange`、`overlayClassName`、`popupPortalContainer`、`children`），依照 `data-model.md`；将所有中文描述改为英文；在 component description 中说明受控模式（`visible` prop）用法

### 4D：Icon

- [x] T016 [P] [US2] 在 `apps/storybook/src/stories/Icon.stories.tsx` 中为 `Icon` meta 添加 `tags: ['autodocs']` 和完整 `argTypes`（`name`、`size`、`label`、`className`、`style`），依照 `data-model.md`；在 `label` 的 description 中说明无障碍语义（有值=提供 aria-label，无值=装饰性 aria-hidden）；将所有中文文本改为英文

### 4E：Menu

- [x] T017 [P] [US2] 在 `apps/storybook/src/stories/Menu.stories.tsx` 中为 `Menu` meta 添加 `tags: ['autodocs']` 和根级 `argTypes`（`size`、`shape`、`open`、`defaultOpen`、`onOpenChange`）；使用 `subcomponents` 字段为 `MenuItem`（`value`、`disabled`、`closeOnSelect`）、`MenuCheckboxItem`（`value`、`checked`、`defaultChecked`、`disabled`）、`MenuRadioItem`（`value`、`disabled`）分别添加 argTypes，依照 `data-model.md`；将所有中文 label（菜单项文字、分组标题、描述）改为英文

### 4F：Color（仅英文化）

- [x] T018 [P] [US2] 在 `apps/storybook/src/stories/Color.stories.tsx` 中将 `parameters.docs.description.component` 及 story 内所有面向读者的中文说明文字改为英文；确认 title（`Foundations/Color`）无需变动

**检查点**：完成后对照 contracts/story-api-contract.md 契约二、三、四逐条验收；`vp check` 无报错。

---

## Phase 5：打磨与全量验证

**目的**：跨所有用户故事的最终验收，确保整体一致性。

- [x] T019 [P] 运行 `vp check`，修复任何新引入的类型或 lint 错误
- [ ] T020 [P] 运行 `vp run storybook#dev`，按以下清单对全部 6 个 story 做人工验收：
  - 侧边栏仅显示 `Components/`（5 项）和 `Foundations/`（1 项）
  - 每个 component story 的 Docs 页面 Props 表格完整
  - Controls 面板 select/boolean prop 显示正确控件类型
  - 所有用户可见文本为英文
  - Light 和 Dark 主题切换正常
  - 升级后版本号显示正确
- [x] T021 对照 `contracts/story-api-contract.md` 逐条核查 6 项契约，记录任何未满足项并修复

---

## 依赖与执行顺序

### 阶段依赖

```
Phase 1（Storybook 升级） ─────────────────────────────────┐
Phase 2（配置清理）  ──── 可与 Phase 1 并行 ───────────────┤
                                                           ▼
Phase 3（US1：分类重组）  ─────────────────── 依赖 Phase 1+2 完成
Phase 4（US2：API 文档化） ──────────────── 依赖 Phase 1+2 完成
                                                           ▼
Phase 5（打磨与全量验证） ─────────────── 依赖 Phase 3+4 全部完成
```

### 用户故事依赖

- **US3（Storybook 升级，P2）**：无依赖，最先执行（作为基础设施）
- **US1（分类重组，P1）**：依赖 Phase 1+2，不依赖 US2
- **US2（API 文档化，P1）**：依赖 Phase 1+2，不依赖 US1（可与 US1 并行）

### 并行机会

- Phase 1 和 Phase 2 可并行（T005/T006 与 T001–T004 无文件冲突）
- Phase 3 中 T007–T010 全部可并行（各操作不同文件）
- Phase 4 中 T012–T018 全部可并行（各操作不同文件或不同代码段）
- Phase 3 和 Phase 4 可并行（一旦 Phase 1+2 完成即可同时开始）

---

## 并行示例

```bash
# Phase 3 + Phase 4 同时启动（Phase 1+2 完成后）：

# US1 分类重组（全部并行）
Task T007: Button.stories.tsx title → Components/Button
Task T008: Typography.stories.tsx title → Components/Typography
Task T009: Popover.stories.tsx title → Components/Popover
Task T010: Icon.stories.tsx title → Components/Icon

# US2 API 文档化（全部并行）
Task T012: Button argTypes + 英文化
Task T014: Typography argTypes + 英文化
Task T015: Popover argTypes + 英文化
Task T016: Icon argTypes + 英文化
Task T017: Menu argTypes + 英文化
Task T018: Color 英文化
```

---

## 实施策略

**MVP 范围建议**：Phase 1 + Phase 2 + Phase 3（US3 + US1）— 约 11 个任务，可快速交付侧边栏重组和升级成果，API 文档化（Phase 4）作为第二批次。

**逐组件实施建议**（Phase 4 单人操作时）：Button → Menu → Popover → Icon → Typography → Color，按 API 复杂度从高到低排列，确保早期学习 argTypes 模式后后续任务更快。
