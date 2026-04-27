# 任务：补齐 Button 公开属性与加载态

**输入**：来自 `/specs/20260323-button-props-loading/`  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/button-component-contract.md`、`quickstart.md`

**测试**：根据宪章要求，组件逻辑、无障碍语义与预览覆盖必须提供测试。下列每个用户故事都包含自动化验证任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用于追踪的用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都必须包含精确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**：盘点当前 Button / IconButton、样式 token 和消费面示例的差距，确保后续实现严格围绕本期 spec。

- [x] T001 在 `packages/components/src/button/index.tsx`、`packages/components/src/button/index.module.less`、`apps/storybook/src/stories/Button.stories.tsx`、`apps/website/src/main.tsx` 与 `packages/components/README.md` 中盘点当前 props、状态和示例触点
- [x] T002 在 `specs/20260323-button-props-loading/plan.md`、`specs/20260323-button-props-loading/research.md`、`specs/20260323-button-props-loading/contracts/button-component-contract.md` 与 `specs/20260323-button-props-loading/quickstart.md` 中对齐 `htmlType`、`href` / `target`、`danger`、`loading` 与 ref 的实现边界
- [x] T003 [P] 在 `packages/icons/src/exports/loading.ts`、`package.json`、`packages/components/package.json` 与 `packages/styles/src/themes/index.ts` 中确认 loading 图标复用点和 `vp` 验证入口

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的共享状态解析、样式钩子和公开入口骨架。

**关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T004 在 `packages/components/src/button/index.tsx` 中建立共享的原生属性归一化、loading 阻断和 ref-forwarding 骨架
- [x] T005 [P] 在 `packages/components/src/button/index.module.less` 中建立 danger / loading 状态、spinner 插槽和 cursor 覆盖的共享样式钩子
- [x] T006 [P] 在 `packages/components/src/index.ts`、`apps/storybook/src/stories/Button.stories.tsx`、`apps/website/src/main.tsx` 与 `packages/components/README.md` 中预留新增 props 与状态的根级导出和展示占位

**检查点**：基础能力完成后，用户故事可以按优先级独立推进。

---

## Phase 3：用户故事 1 - 以统一 API 接入按钮行为（优先级：P1）🎯 MVP

**目标**：补齐 `Button` / `IconButton` 的点击事件、`htmlType`、`href`、`target` 与 ref，让消费方可直接接入原生 button / anchor 语义和命令式 DOM 能力。

**独立测试**：在不增加包装组件的前提下，分别渲染 `Button` 与 `IconButton`，验证 `onClick`、`onClickCapture`、`htmlType`、`href`、`target` 与 ref 行为正确，且不改变现有样式选择逻辑。

### 用户故事 1 的测试

- [x] T007 [P] [US1] 在 `packages/components/src/button/index.test.ts` 中新增 `htmlType` 优先级、`href` / `target` 链接语义和点击事件触发回归测试
- [x] T008 [P] [US1] 在 `packages/components/tests/package-entrypoint.test.ts` 中新增 `Button` / `IconButton` 根级导出与实际根节点 ref-forwarding 回归测试

### 用户故事 1 的实现

- [x] T009 [US1] 在 `packages/components/src/button/index.tsx` 中实现 `htmlType`、`href`、`target`、显式点击属性支持和 `Button` / `IconButton` 的 ref-forwarding
- [x] T010 [P] [US1] 在 `packages/components/src/index.ts` 与 `packages/components/README.md` 中更新根级导出、props 表和 ref 使用说明
- [x] T011 [P] [US1] 在 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中新增 `htmlType`、`href` / `target` 链接模式、点击事件和 ref 的代表性示例

**检查点**：用户故事 1 完成后，Button 公开 API 的语义能力补齐应可独立交付。

---

## Phase 4：用户故事 2 - 用危险态和加载态表达关键操作（优先级：P2）

**目标**：交付 `danger` 颜色和 `loading` 状态，让普通按钮与图标按钮都能表达危险动作与处理中反馈。

**独立测试**：分别渲染 `Button` 与 `IconButton` 的 `danger`、`loading` 与 `danger + loading` 组合，验证普通按钮前置 spinner、图标按钮替换 spinner、重复点击阻断和非 disabled 光标行为。

### 用户故事 2 的测试

- [x] T012 [P] [US2] 在 `packages/components/src/button/index.test.ts` 中新增 `danger` 颜色、spinner 呈现策略和 loading 重复触发阻断测试
- [x] T013 [P] [US2] 在 `packages/components/tests/button-support-matrix.test.ts` 中新增 `danger` / `loading` 支持矩阵和 `loading + disabled` 状态优先级回归测试

### 用户故事 2 的实现

- [x] T014 [P] [US2] 在 `packages/styles/src/primitives/index.ts`、`packages/styles/src/semantics/index.ts`、`packages/styles/src/themes/index.ts`、`packages/styles/src/css/theme-light.css` 与 `packages/styles/src/css/theme-dark.css` 中补齐 danger 语义色 surface
- [x] T015 [US2] 在 `packages/components/src/button/index.tsx` 中实现 `color="danger"`、`loading`、普通按钮前置 spinner、图标按钮替换 spinner 和重复激活阻断
- [x] T016 [P] [US2] 在 `packages/components/src/button/index.module.less` 中实现 danger / loading 视觉分支、disabled-like 外观和非 `not-allowed` 光标规则
- [x] T017 [US2] 在 `packages/components/README.md`、`apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中补充 danger / loading 的公开说明和代表性示例

**检查点**：用户故事 2 完成后，Button 体系应已能稳定表达危险动作与处理中状态。

---

## Phase 5：用户故事 3 - 在预览与无障碍场景下保持一致（优先级：P3）

**目标**：让新增属性和状态在 `Button`、`IconButton`、Storybook、website 和无障碍场景下保持一致。

**独立测试**：验证 icon-only 按钮在 `loading` / `danger` 下仍具备可访问名称，`loading + disabled` 状态表现可预测，且 Storybook / website 已覆盖主要 props 与边界状态。

### 用户故事 3 的测试

- [x] T018 [P] [US3] 在 `packages/components/src/button/index.test.ts` 中新增 icon-only loading 可访问名称、focus-visible 和 `loading + disabled` 回归测试
- [x] T019 [P] [US3] 在 `packages/components/tests/workspace-boundaries.test.ts` 中新增 package-owned 预览覆盖和公开能力边界回归测试

### 用户故事 3 的实现

- [x] T020 [US3] 在 `packages/components/src/button/index.tsx` 中完善 loading 场景下的可访问名称校验、状态说明和 `disabled` / `loading` 组合行为
- [x] T021 [P] [US3] 在 `apps/storybook/src/stories/Button.stories.tsx` 中扩展默认、danger、loading、disabled、icon-only 和 ref 场景的内部评审矩阵
- [x] T022 [P] [US3] 在 `apps/website/src/main.tsx` 中扩展 `loading` 与 `disabled` 关系、icon-only 命名和 prop 边界的公开指导示例
- [x] T023 [US3] 在 `packages/components/README.md` 与 `specs/20260323-button-props-loading/quickstart.md` 中同步最终无障碍要求、状态规则和消费建议

**检查点**：用户故事 3 完成后，新增 props 和状态在 package、预览和无障碍层面都应保持一致。

---

## Phase 6：收尾与跨故事事项

**目的**：完成最终契约同步、跨故事回归和 workspace 级验证。

- [x] T024 [P] 在 `specs/20260323-button-props-loading/contracts/button-component-contract.md`、`specs/20260323-button-props-loading/data-model.md` 与 `specs/20260323-button-props-loading/research.md` 中回填最终落地后的 API 与状态契约
- [x] T025 [P] 在 `packages/components/tests/package-entrypoint.test.ts` 与 `packages/components/tests/workspace-boundaries.test.ts` 中补充最终的根级导出和 package 边界回归断言
- [x] T026 在 `package.json` 定义的 workspace 验证入口上运行 `vp check` 与 `vp test`
- [x] T027 在 `package.json` 定义的 workspace 验证入口上运行 `vp run components#build`、`vp run storybook#build` 与 `vp run website#build`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，是 MVP 的最小可交付范围
- **Phase 4（US2）**：依赖 Phase 2，建议在 US1 的公开属性骨架稳定后推进
- **Phase 5（US3）**：依赖 US1 和 US2 的行为落地后推进，因为它负责统一预览和无障碍一致性
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1（P1）**：基础阶段完成后即可开始，不依赖其他用户故事
- **US2（P2）**：基础阶段完成后即可开始，但会与 US1 共享 `packages/components/src/button/` 改动面，建议在 US1 主体逻辑落稳后衔接
- **US3（P3）**：依赖 US1 / US2 已经把公开 props 和状态行为落地，再对预览和无障碍一致性做收口

### 每个用户故事内部顺序

- 先写测试，再落地对应实现
- 先完成 `packages/components/src/button/` 与 `packages/styles/src/` 中的共享逻辑，再更新 Storybook、website 和 README
- 公开导出和 README 说明应随功能一起更新，不能留到最后统一补
- 用户故事完成后再进入下一个更低优先级故事

### 并行机会

- **准备阶段**：T003 可与 T001、T002 并行
- **基础阶段**：T005 与 T006 可在 T004 完成后并行
- **US1**：T007 与 T008 可并行；T010 与 T011 可在 T009 完成后并行
- **US2**：T012 与 T013 可并行；T014 与 T016 可并行，随后汇合到 T015 与 T017
- **US3**：T018 与 T019 可并行；T021 与 T022 可在 T020 完成后并行
- **收尾阶段**：T024 与 T025 可并行，验证命令 T026、T027 顺序执行

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/components/src/button/index.test.ts 中新增 htmlType 优先级、href/target 链接语义和点击事件触发回归测试"
Task: "在 packages/components/tests/package-entrypoint.test.ts 中新增 Button/IconButton 根级导出与实际根节点 ref-forwarding 回归测试"

# 在不同文件上并行更新公开面
Task: "在 packages/components/src/index.ts 与 packages/components/README.md 中更新根级导出、props 表和 ref 使用说明"
Task: "在 apps/storybook/src/stories/Button.stories.tsx 与 apps/website/src/main.tsx 中新增 htmlType、href/target 链接模式、点击事件和 ref 的代表性示例"
```

## 并行示例：用户故事 2

```bash
# 并行启动用户故事 2 的测试
Task: "在 packages/components/src/button/index.test.ts 中新增 danger 颜色、spinner 呈现策略和 loading 重复触发阻断测试"
Task: "在 packages/components/tests/button-support-matrix.test.ts 中新增 danger/loading 支持矩阵和 loading+disabled 状态优先级回归测试"

# 并行推进 token 与样式实现
Task: "在 packages/styles/src/primitives/index.ts、packages/styles/src/semantics/index.ts、packages/styles/src/themes/index.ts、packages/styles/src/css/theme-light.css 与 packages/styles/src/css/theme-dark.css 中补齐 danger 语义色 surface"
Task: "在 packages/components/src/button/index.module.less 中实现 danger/loading 视觉分支、disabled-like 外观和非 not-allowed 光标规则"
```

## 并行示例：用户故事 3

```bash
# 并行覆盖一致性与消费面
Task: "在 packages/components/src/button/index.test.ts 中新增 icon-only loading 可访问名称、focus-visible 和 loading+disabled 回归测试"
Task: "在 packages/components/tests/workspace-boundaries.test.ts 中新增 package-owned 预览覆盖和公开能力边界回归测试"

# 并行更新两个预览面
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中扩展默认、danger、loading、disabled、icon-only 和 ref 场景的内部评审矩阵"
Task: "在 apps/website/src/main.tsx 中扩展 loading 与 disabled 关系、icon-only 命名和 prop 边界的公开指导示例"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 通过 `vp check`、`vp test` 与最小预览示例验证统一 API 已可独立接入
5. 在确认公开属性骨架稳定后，再推进 danger / loading 和预览一致性

### 渐进交付

1. 先稳定共享属性解析、ref-forwarding 骨架和预览占位
2. 交付 US1，先解决最阻塞接入的原生属性缺口
3. 交付 US2，补齐 danger / loading 业务状态
4. 交付 US3，收口预览和无障碍一致性
5. 最后执行完整 workspace 验证并同步设计文档

### 并行团队策略

1. 一位工程师负责 `packages/components/src/button/` 的 props、状态、测试和 ref-forwarding
2. 一位工程师在共享行为稳定后负责 `packages/styles/src/` 的 danger surface 与按钮样式联动
3. 一位工程师在 package API 稳定后负责 `apps/storybook/src/stories/Button.stories.tsx`、`apps/website/src/main.tsx` 与 `packages/components/README.md`

---

## 备注

- 所有验证命令都必须使用 `vp` 工作流
- `Button` 与 `IconButton` 的可复用行为必须优先落在 `packages/components/src/button/`
- danger 颜色必须通过共享 token / theme surface 暴露，不能只写在按钮私有样式里
- Storybook 负责内部评审矩阵，website 负责公开指导，两者都不是组件规则的唯一事实来源
