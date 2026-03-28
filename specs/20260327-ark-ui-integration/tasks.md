# 任务：引入 Ark UI 作为组件库基础层

**输入**：来自 `/specs/20260327-ark-ui-integration/` 的设计文档
**前置条件**：plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅、contracts/ ✅
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章，组件逻辑与用户可见行为必须有测试。本任务清单包含自动化测试更新与 Storybook 预览验证。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（US1、US2、US3）
- 描述中包含准确文件路径

---

## Phase 1：准备（依赖引入与环境验证）

**目的**：引入 `@ark-ui/react` 依赖并确认开发环境就绪

- [x] T001 在 `packages/components/package.json` 的 `dependencies` 中新增 `@ark-ui/react`，运行 `vp install` 完成安装
- [x] T002 [P] 确认 Ark UI MCP Server 已安装（`claude mcp add ark-ui -- npx -y @ark-ui/mcp`），用于开发阶段 API 查阅
- [x] T003 运行 `vp check` 确认依赖引入后类型检查和 lint 无新增报错

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：完成迁移所需的前期调研与基线确认，所有用户故事均依赖此阶段

**⚠️ 关键**：在本阶段完成前，任何用户故事不得开始

- [x] T004 [P] 通过 Ark UI MCP 查阅 Popover 组件 API，梳理 `positioning.placement` 与现有 `PopoverPlacement` 枚举值的对应关系，以及 `Popover.Arrow`、`Popover.Positioner`、`Popover.Content` 的组合用法
- [x] T005 [P] 运行 `vp test packages/components` 记录当前测试套件基线状态（确认所有测试绿色通过，作为迁移后回归对比基准）

**检查点**：T004、T005 完成后，用户故事 1、2、3 均可开始

---

## Phase 3：用户故事 1 - Popover 消费方无感知迁移（优先级：P1）🎯 MVP

**目标**：用 Ark UI 原语重写 `popover` 组件内部实现，保持公开 API、视觉风格与无障碍行为与迁移前完全一致，消费方零感知

**独立测试**：打开 `apps/storybook/src/stories/Popover.stories.tsx` 中现有所有 story，确认无需修改任何代码即可正常渲染、交互和无障碍操作

### 用户故事 1 的实现

- [x] T006 [US1] 在 `packages/components/src/popover/index.tsx` 中，用 `<Popover.Root>`（受控模式）+ `<Popover.Positioner>`（portal + 定位）+ `<Popover.Content>` 替换现有的 `<FloatingPortal>` + 手动定位结构；保留所有现有公开 props 及默认值不变
- [x] T007 [US1] 在 `packages/components/src/popover/index.tsx` 中，将 `trigger: 'click'`（默认）场景改为使用 Ark UI 原生 `<Popover.Trigger>`，使 Ark UI 状态机接管 click 触发的打开/关闭、Escape、外部点击关闭逻辑
- [x] T008 [US1] 在 `packages/components/src/popover/index.tsx` 中，保留 `trigger: 'hover' | 'focus' | 'context-menu'` 的自定义事件监听逻辑（mouseover/mouseleave + safePolygon、focus/blur 超时、contextmenu 阻止默认），通过 Ark UI 受控模式（外部管理 `open` state）驱动 `<Popover.Root open={...}>`
- [x] T009 [US1] 在 `packages/components/src/popover/index.tsx` 中，用 `<Popover.Arrow>` + `<Popover.ArrowTip>` 替换现有自定义 SVG 箭头，并将现有 arrowStyle（`--popover-arrow-offset-x/y` CSS 变量）映射到 Ark UI 箭头定位输出
- [x] T010 [US1] 在 `packages/components/src/popover/index.tsx` 中，将 Ark UI `data-state="open"/"closed"` 映射到组件现有三态（`open`/`closing`/`closed`）：通过监听 `onExitComplete` 或使用 `lazyMount` + `unmountOnExit` 驱动 `isOverlayMounted` 状态，确保关闭动画完整播放
- [x] T011 [P] [US1] 在 `packages/components/src/popover/index.module.less` 中，确认 `.overlay[data-state='...']`、`.overlay[data-side='...']` 等选择器与迁移后 Ark UI 输出的 data 属性一致；如有出入，按 Ark UI 实际输出微调选择器或在组件层设置自定义 data 属性
- [ ] T012 [US1] 在 `packages/components/package.json` 中，评估 `@floating-ui/react` 是否仍需保留为显式依赖（若 Ark UI 已内置其全部所需能力则移除），运行 `vp install` 同步 lockfile

### 用户故事 1 的测试与验证

- [x] T013 [US1] 在 `packages/components/src/popover/index.test.ts` 中，运行现有测试套件并修复因实现变更（如浮层 DOM 结构、data 属性命名）导致的测试失败；确保所有原有测试场景（click 打开/关闭、Escape、焦点归还、受控模式、portal 挂载、hover/focus/context-menu 触发）全部通过
- [ ] T014 [US1] 在 `packages/components/src/popover/index.test.ts` 中，补充针对 Ark UI 迁移后的回归用例：验证 `data-popover-overlay="true"` 仍存在（供消费方查询）、`aria-expanded`/`aria-controls`/`role="dialog"` 正确输出
- [ ] T015 [US1] 运行 `vp run build -r` 确认产物构建成功；运行 `vp run storybook#dev`（或等效命令）目视确认 `apps/storybook/src/stories/Popover.stories.tsx` 中所有 story 视觉与交互无回归

**检查点**：T006–T015 完成后，用户故事 1 应可独立验证：现有 Storybook story 无变化即可正常运行，所有单测绿色

---

## Phase 4：用户故事 2 - 开发者使用新范式新增组件（优先级：P2）

**目标**：在项目规范文件中明确 Ark UI 作为交互型组件行为基础层的开发范式，使后续贡献者查阅文档即可了解何时使用 Ark UI、如何使用，以及 MCP 工具的安装方法

**独立测试**：在 `AGENTS.md` 中搜索"Ark UI"，在 `.specify/memory/constitution.md` 中搜索"Ark UI"，均能找到明确条款；且 CLAUDE.md 中包含 MCP 安装命令

### 用户故事 2 的实现

- [ ] T016 [P] [US2] 在 `AGENTS.md` 中新增「组件开发范式：基于 Ark UI 的行为基础层」节，内容包含：使用准则（何时使用 Ark UI）、判断准则（何时可以例外）、实现约定（样式通过 CSS Modules + token、受控模式桥接、参考 `packages/components/src/popover/index.tsx`），参考 `specs/20260327-ark-ui-integration/contracts/popover-api.md` 中的条款草稿
- [ ] T017 [P] [US2] 在 `.specify/memory/constitution.md` 中，在现有原则「I. 包优先的组件架构」后新增「Ark UI 行为基础层」相关条款；更新版本号（patch），并在文件顶部注释中附同步影响报告（受影响模板、已更新文件清单）
- [ ] T018 [US2] 确认 `CLAUDE.md` 中「开发工具」节已包含 Ark UI MCP 安装命令（`claude mcp add ark-ui -- npx -y @ark-ui/mcp`）及说明（已由 `/speckit.clarify` 阶段写入，本任务仅做确认）
- [ ] T019 [US2] 运行 `vp check` 确认 `AGENTS.md` 和 `constitution.md` 更新后无格式异常

**检查点**：T016–T019 完成后，用户故事 2 可独立验证：`AGENTS.md`、`constitution.md`、`CLAUDE.md` 三处均可检索到 Ark UI 相关规范条款

---

## Phase 5：用户故事 3 - 无障碍能力通过 Ark UI 自动覆盖（优先级：P2）

**目标**：验证迁移后的 `popover` 无障碍能力（键盘操作、屏幕阅读器、焦点管理）通过 Ark UI 内置机制覆盖，无需手工实现

**独立测试**：在 `apps/storybook` 中使用键盘完整操作 popover（打开、Tab 切换焦点、Escape 关闭、焦点归还触发器），均符合预期；屏幕阅读器可正确播报展开状态

### 用户故事 3 的验证与补充

- [ ] T020 [P] [US3] 在 `packages/components/src/popover/index.test.ts` 中，验证并补充以下无障碍用例（若 T013/T014 尚未覆盖）：① 触发器上的 `aria-expanded` 随打开/关闭状态正确切换；② `role="dialog"` 在浮层内容元素上正确输出；③ `aria-controls` 指向正确的浮层元素 id；④ popover 打开后焦点自动移入内容区（Ark UI `autoFocus` 默认生效）；⑤ popover 关闭（Escape）后焦点返回触发器
- [ ] T021 [US3] 在 `packages/components/src/popover/index.tsx` 中，确认 Ark UI `autoFocus={true}`（默认值）已保留且未被覆盖，保证 popover 打开后焦点自动移入第一个可聚焦子元素
- [ ] T022 [US3] 在 `packages/components/src/popover/index.tsx` 中，确认 Ark UI `closeOnEscape={true}`（默认值）已保留，且关闭后 `returnFocusRef` 逻辑（焦点归还触发器）与 Ark UI 的焦点恢复机制不冲突（如有冲突，移除冗余的手动焦点管理代码，以 Ark UI 内置行为为准）
- [ ] T023 [US3] 运行 `vp test packages/components` 确认所有无障碍相关测试通过

**检查点**：T020–T023 完成后，用户故事 3 可独立验证：无障碍测试全部绿色，Storybook 中键盘操作符合预期

---

## Phase 6：打磨与横切关注点

**目的**：完整验证、清理与收尾

- [ ] T024 [P] 在 `apps/storybook/src/stories/Popover.stories.tsx` 中，目视确认所有 story 状态无视觉回归：click/hover/focus/context-menu 触发、受控模式、各 placement 方向、mode（card/loose/pure）、shape（rect/rounded）
- [ ] T025 [P] 运行 `vp check`（类型检查 + lint + 格式化）确认全量通过
- [ ] T026 [P] 运行 `vp test packages/components` 最终确认所有测试绿色，无遗漏回归
- [ ] T027 运行 `vp run build -r` 最终构建验证，确认 `@deweyou-ui/components` 产物结构与迁移前一致（入口、类型声明、样式文件）
- [ ] T028 创建 git commit，消息格式：`refactor(popover): migrate to ark-ui primitives`（或按本次实际变更范围调整 scope）

---

## 依赖与执行顺序

### 阶段依赖

- **准备阶段（Phase 1）**：无依赖，立即开始
- **基础阶段（Phase 2）**：依赖 Phase 1 完成；阻塞所有用户故事
- **用户故事阶段（Phase 3–5）**：均依赖 Phase 2 完成
  - US1（Phase 3）与 US2（Phase 4）可并行推进（文件不重叠）
  - US3（Phase 5）依赖 US1（Phase 3）完成（验证内容基于重写后的组件）
- **打磨阶段（Phase 6）**：依赖 Phase 3、4、5 全部完成

### 用户故事依赖

- **US1（P1）**：基础阶段完成后即可开始，不依赖其他故事
- **US2（P2）**：基础阶段完成后即可开始，与 US1 完全独立（操作不同文件）
- **US3（P2）**：依赖 US1 完成（验证需要重写后的组件实现）

### 并行机会

- T001–T003（Phase 1）：T002 可与 T001 并行
- T004–T005（Phase 2）：可并行
- T006–T012（US1 实现）：T011 可与 T006–T010 并行
- T016–T017（US2 实现）：可并行
- T020、T024、T025、T026（Phase 5/6）：可并行

---

## 并行示例：MVP（仅用户故事 1）

```bash
# Phase 1 - 依赖安装（T001 完成后，T002/T003 可并行）
Task: "在 packages/components/package.json 中新增 @ark-ui/react 并运行 vp install"
Task: "确认 Ark UI MCP Server 已安装"

# Phase 2 - 同时进行（T004/T005 并行）
Task: "通过 MCP 查阅 Ark UI Popover API，梳理 placement 映射"
Task: "运行 vp test packages/components 记录基线状态"

# Phase 3 US1 实现 - T011 可与核心重写并行
Task: "在 index.tsx 中重写 click 触发场景（T006/T007）"
Task: "在 index.module.less 中确认 data 属性选择器（T011）"
```

---

## 实施策略

**MVP 范围**（推荐优先完成）：Phase 1 → Phase 2 → Phase 3（US1）

US1 独立完成后即可交付核心价值：popover 组件已基于 Ark UI，API 零破坏。US2 和 US3 可作为独立后续增量。
