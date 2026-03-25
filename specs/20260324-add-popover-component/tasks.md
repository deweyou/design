# 任务：实现 Popover 组件

**输入**：来自 `/specs/20260324-add-popover-component/` 的设计文档  
**前置条件**：plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/  
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章，组件逻辑与用户可见行为必须有测试。生成的任务包含 package 单测、入口测试、Storybook/website 预览更新，以及最终 `vp` 验证。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（例如 US1、US2、US3）
- 描述中必须包含准确文件路径

## 路径约定

- 组件 package：`packages/components/src/` 与 `packages/components/tests/`
- 公开预览：`apps/website/src/`
- 内部评审：`apps/storybook/src/stories/`
- 规格与契约：`specs/20260324-add-popover-component/`

## Phase 1：准备（共享基础设施）

**目的**：建立 Popover 实现所需的工作区依赖、目录和文档入口

- [x] T001 在 `packages/components/package.json` 中新增 `@floating-ui/react` 依赖并更新相关 workspace 清单
- [x] T002 [P] 创建 `packages/components/src/popover/index.tsx`
- [x] T003 [P] 创建 `packages/components/src/popover/index.module.less`
- [x] T004 [P] 创建 `packages/components/src/popover/index.test.ts`
- [x] T005 [P] 创建 `apps/storybook/src/stories/Popover.stories.tsx`

**检查点**：Popover 目标目录和依赖入口已经存在，可以进入基础实现

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事共享的公开 API、样式基座与验证入口

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

- [x] T006 在 `packages/components/src/popover/index.tsx` 中定义 `PopoverProps`、placement、trigger、mode 与 shape 的公开类型
- [x] T007 [P] 在 `packages/components/src/popover/index.module.less` 中建立基于 `@deweyou-ui/styles` token 的 surface、arrow、focus 与动画样式基座
- [x] T008 [P] 在 `packages/components/src/index.ts` 中新增 `Popover` 与 `PopoverProps` 的根入口导出
- [x] T009 [P] 在 `packages/components/tests/package-entrypoint.test.ts` 中补充 `Popover` 根导出与示例 props 的入口测试
- [x] T010 在 `packages/components/src/popover/index.test.ts` 中建立共享测试基座，覆盖默认 props、根节点透传和受控/非受控状态入口
- [x] T011 在 `packages/components/README.md` 中为即将新增的 `Popover` 预留公开 API 与使用约束章节

**检查点**：基础阶段完成后，用户故事即可并行实现

---

## Phase 3：用户故事 1 - 展示锚定浮层内容（优先级：P1）🎯 MVP

**目标**：交付一个默认 click 触发的基础 Popover，能够稳定打开、关闭、锚定定位，并具备基础视觉和无障碍能力。

**独立测试**：在 `apps/website/src/main.tsx` 中渲染一个信息型 Popover，验证 click 打开/关闭、外部点击收起、内容面板锚定显示、键盘可进入内容并关闭后返回触发元素。

### 用户故事 1 的测试（必需）⚠️

- [x] T012 [P] [US1] 在 `packages/components/src/popover/index.test.ts` 中编写默认 click 触发、外部点击关闭与 `content` 必填的组件逻辑测试
- [x] T013 [P] [US1] 在 `packages/components/src/popover/index.test.ts` 中编写基础键盘流程测试，验证打开、进入内容、关闭与焦点返回

### 用户故事 1 的实现

- [x] T014 [US1] 在 `packages/components/src/popover/index.tsx` 中实现默认 click 触发、`content` 渲染、`defaultVisible` / `visible` / `onVisibleChange` 状态模型
- [x] T015 [P] [US1] 在 `packages/components/src/popover/index.tsx` 中实现默认 portal 挂载、外部关闭、`Escape` 关闭和非模态焦点返回逻辑
- [x] T016 [P] [US1] 在 `packages/components/src/popover/index.module.less` 中实现默认 border、shadow、arrow、`rect` / `rounded` 与基础开关动画样式
- [x] T017 [US1] 在 `apps/website/src/main.tsx` 中新增信息型 Popover demo，覆盖默认打开/关闭与基础视觉
- [x] T018 [US1] 在 `packages/components/README.md` 中补充 Popover 的 MVP 使用说明、非模态边界与 semver 说明

**检查点**：此时用户故事 1 应可独立运行并可测试，可作为 MVP 交付

---

## Phase 4：用户故事 2 - 适配不同触发、定位与开关方式（优先级：P2）

**目标**：扩展 Popover 的多触发方式、位置矩阵、边界回退、portal 容器和自定义内容样式，使组件适用于更复杂的业务布局。

**独立测试**：在 `apps/storybook/src/stories/Popover.stories.tsx` 中验证多触发方式、八向位置、`offset`、`boundaryPadding`、`popupPortalContainer`、`card/loose/pure` 与 `disabled` 的独立状态矩阵。

### 用户故事 2 的测试（必需）⚠️

- [x] T019 [P] [US2] 在 `packages/components/src/popover/index.test.ts` 中编写 placement 映射、边界回退、`offset` 与 `boundaryPadding` 的定位逻辑测试
- [x] T020 [P] [US2] 在 `packages/components/src/popover/index.test.ts` 中编写 `hover`、`focus`、`context-menu`、`disabled` 与 `popupPortalContainer` 的交互测试

### 用户故事 2 的实现

- [x] T021 [US2] 在 `packages/components/src/popover/index.tsx` 中实现八向 placement 映射、自动回退、`offset` 与 `boundaryPadding` 规则
- [x] T022 [P] [US2] 在 `packages/components/src/popover/index.tsx` 中实现 `hover`、`focus`、`context-menu` 组合触发、`disabled` 阻断和自定义 `popupPortalContainer`
- [x] T023 [P] [US2] 在 `packages/components/src/popover/index.module.less` 中实现 `card`、`loose`、`pure` 模式与不同 placement 的箭头/动画样式适配
- [x] T024 [US2] 在 `apps/storybook/src/stories/Popover.stories.tsx` 中新增位置矩阵、触发矩阵、portal 容器、`disabled` 和边界回退的内部评审 story
- [x] T025 [US2] 在 `apps/website/src/main.tsx` 中扩展公开 demo，展示位置切换、内容模式和 `disabled` 场景

**检查点**：此时用户故事 2 应可独立工作，并能验证高级触发、定位与样式契约

---

## Phase 5：用户故事 3 - 满足无障碍与评审覆盖（优先级：P3）

**目标**：完善 Popover 的无障碍语义、交互型内容行为和评审覆盖，确保键盘、读屏和多实例场景都稳定可评审。

**独立测试**：仅使用键盘在 `apps/storybook/src/stories/Popover.stories.tsx` 的交互场景中完成打开、进入内容、面板内点击保持打开、离开内容与关闭返回；同时验证同页多个 Popover 默认互不影响。

### 用户故事 3 的测试（必需）⚠️

- [x] T026 [P] [US3] 在 `packages/components/src/popover/index.test.ts` 中编写非焦点陷阱、面板内点击保持打开和多实例互不影响的无障碍/交互测试
- [x] T027 [P] [US3] 在 `packages/components/src/popover/index.test.ts` 中编写读屏关系、关闭后焦点返回和交互型内容场景测试

### 用户故事 3 的实现

- [x] T028 [US3] 在 `packages/components/src/popover/index.tsx` 中完善无障碍语义、焦点进入/离开规则、面板内点击保持打开和多实例独立状态逻辑
- [x] T029 [P] [US3] 在 `apps/storybook/src/stories/Popover.stories.tsx` 中补充键盘流程、交互型内容、多实例和读屏评审状态
- [x] T030 [US3] 在 `apps/website/src/main.tsx` 中补充轻量操作型 Popover demo，展示交互内容与关闭反馈
- [x] T031 [US3] 在 `packages/components/README.md` 中补充无障碍契约、交互边界和 Tooltip/Dropdown/Dialog 的使用区分

**检查点**：此时所有用户故事都应可独立运行，并完成无障碍与评审覆盖

---

## Phase 6：打磨与横切关注点

**目的**：处理影响多个用户故事的整合、文档和最终验证

- [x] T032 [P] 在 `specs/20260324-add-popover-component/contracts/popover-public-contract.md` 中回填最终实现对应的公开 API 与验证结论
- [x] T033 在 `specs/20260324-add-popover-component/quickstart.md` 中补充最终验证记录与维护者使用说明
- [x] T034 [P] 在 `apps/storybook/src/stories/Popover.stories.tsx` 与 `apps/website/src/main.tsx` 中统一整理文案、状态命名和评审顺序
- [x] T035 对 `packages/components/src/popover/`、`apps/storybook/src/stories/Popover.stories.tsx` 与 `apps/website/src/main.tsx` 运行 `vp check`、`vp test`、`vp run storybook#build` 与 `vp run website#build` 完成最终验证

---

## 依赖与执行顺序

### 阶段依赖

- **准备阶段（Phase 1）**：无依赖，可立即开始
- **基础阶段（Phase 2）**：依赖准备阶段完成，并阻塞所有用户故事
- **用户故事阶段（Phase 3-5）**：都依赖基础阶段完成
  - 建议按优先级顺序推进 `US1 -> US2 -> US3`
  - 若团队容量允许，US2 与 US3 可在 US1 稳定后部分并行
- **打磨阶段（Phase 6）**：依赖所有目标用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**：基础阶段完成后即可开始，不依赖其他故事；是建议 MVP
- **用户故事 2（P2）**：基础阶段完成后即可开始，但最佳实践是建立在 US1 已交付的基础 Popover 之上
- **用户故事 3（P3）**：基础阶段完成后即可开始，但其无障碍和评审覆盖依赖 US1/US2 的可交付面

### 每个用户故事内部顺序

- 先写当前故事的测试任务，并确保实现前失败
- 核心组件逻辑先于 story/demo 集成
- `packages/components` 实现先于 `apps/website` 和 `apps/storybook` 预览集成
- 当前故事完成后再推进更低优先级故事

### 并行机会

- Phase 1 中 `T002`、`T003`、`T004`、`T005` 可并行
- Phase 2 中 `T007`、`T008`、`T009` 可并行
- US1 中 `T012` 与 `T013` 可并行，`T015` 与 `T016` 可并行
- US2 中 `T019` 与 `T020` 可并行，`T022` 与 `T023` 可并行
- US3 中 `T026` 与 `T027` 可并行，`T029` 与 `T030` 可并行
- Phase 6 中 `T032` 与 `T034` 可并行

---

## 并行示例：用户故事 1

```bash
# 同时启动用户故事 1 的测试：
Task: "在 packages/components/src/popover/index.test.ts 中编写默认 click 触发、外部点击关闭与 content 必填的组件逻辑测试"
Task: "在 packages/components/src/popover/index.test.ts 中编写基础键盘流程测试，验证打开、进入内容、关闭与焦点返回"

# 同时启动用户故事 1 的实现：
Task: "在 packages/components/src/popover/index.tsx 中实现默认 portal 挂载、外部关闭、Escape 关闭和非模态焦点返回逻辑"
Task: "在 packages/components/src/popover/index.module.less 中实现默认 border、shadow、arrow、rect / rounded 与基础开关动画样式"
```

## 并行示例：用户故事 2

```bash
# 同时启动用户故事 2 的测试：
Task: "在 packages/components/src/popover/index.test.ts 中编写 placement 映射、边界回退、offset 与 boundaryPadding 的定位逻辑测试"
Task: "在 packages/components/src/popover/index.test.ts 中编写 hover、focus、context-menu、disabled 与 popupPortalContainer 的交互测试"

# 同时启动用户故事 2 的实现：
Task: "在 packages/components/src/popover/index.tsx 中实现 hover、focus、context-menu 组合触发、disabled 阻断和自定义 popupPortalContainer"
Task: "在 packages/components/src/popover/index.module.less 中实现 card、loose、pure 模式与不同 placement 的箭头/动画样式适配"
```

## 并行示例：用户故事 3

```bash
# 同时启动用户故事 3 的测试：
Task: "在 packages/components/src/popover/index.test.ts 中编写非焦点陷阱、面板内点击保持打开和多实例互不影响的无障碍/交互测试"
Task: "在 packages/components/src/popover/index.test.ts 中编写读屏关系、关闭后焦点返回和交互型内容场景测试"

# 同时启动用户故事 3 的实现：
Task: "在 apps/storybook/src/stories/Popover.stories.tsx 中补充键盘流程、交互型内容、多实例和读屏评审状态"
Task: "在 apps/website/src/main.tsx 中补充轻量操作型 Popover demo，展示交互内容与关闭反馈"
```

---

## 实施策略

### MVP 优先

先完成 **用户故事 1**。这会交付一个可用的基础 Popover：默认 click 触发、受控/非受控状态、基础视觉、外部关闭和非模态键盘流程，足够支撑最小可演示版本。

### 增量交付

1. 完成准备与基础阶段，建立依赖、导出与测试基座。
2. 交付 US1，形成最小可用 Popover。
3. 在 US1 基础上扩展 US2 的触发矩阵、位置矩阵和 portal/boundary 能力。
4. 最后补齐 US3 的无障碍强化、交互内容规则和多实例评审覆盖。

### 格式校验

本文件中的所有任务均遵循严格 checklist 格式：

- 以 `- [ ]` 开头
- 包含顺序 Task ID（`T001` 到 `T035`）
- 仅在可并行任务上标记 `[P]`
- 用户故事阶段任务均带有 `[US1]`、`[US2]` 或 `[US3]`
- 每条任务都包含明确文件路径
