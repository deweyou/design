# 任务：优化 Button 间距平衡

**输入**：来自 `/specs/20260323-refine-button-padding/`  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/button-component-contract.md`、`quickstart.md`

**测试**：根据宪章要求，组件逻辑、无障碍语义与预览覆盖必须提供测试。下列每个用户故事都包含自动化验证任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用于追踪的用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都必须包含精确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**：盘点当前隐式 icon-only 逻辑、验证入口和消费面改造范围，避免后续实现偏离已澄清的 API 方向。

- [x] T001 在 `packages/components/src/button/index.tsx`、`packages/components/src/button/index.test.ts`、`apps/storybook/src/stories/Button.stories.tsx`、`apps/website/src/main.tsx` 与 `packages/components/README.md` 中盘点当前隐式 icon-only 逻辑、旧示例和迁移触点
- [x] T002 在 `specs/20260323-refine-button-padding/plan.md`、`specs/20260323-refine-button-padding/contracts/button-component-contract.md` 与 `packages/components/README.md` 中对齐 `Button`、`IconButton`、`Button.Icon` 的公开契约和 breaking 迁移文案
- [x] T003 [P] 在 `package.json`、`packages/components/package.json` 与 `specs/20260323-refine-button-padding/quickstart.md` 中确认 `vp check`、`vp test`、`vp run storybook#build` 与 `vp run website#build` 的验证入口适用于本轮改造

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的公开类型、模式解析骨架、样式变量和根级导出入口。

**关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T004 在 `packages/components/src/button/index.tsx` 中建立 `icon`、`IconButtonProps`、图标按钮模式解析和共享支持矩阵的类型与辅助函数骨架
- [x] T005 [P] 在 `packages/components/src/button/index.module.less` 中建立内容按钮 `padding-block` / `padding-inline` 与图标按钮 square-size 的共享样式变量骨架
- [x] T006 [P] 在 `packages/components/src/index.ts` 中预留 `IconButton`、`IconButtonProps` 与 `Button.Icon` 的根级导出路径
- [x] T007 [P] 在 `apps/storybook/src/stories/Button.stories.tsx`、`apps/website/src/main.tsx` 与 `packages/components/README.md` 中预留纯文本 Button、带 `icon` 的文本 Button、`IconButton` 三类入口的展示区块与迁移位置

**检查点**：基础能力完成后，纯文本按钮、IconButton 和带图标文本按钮的故事可分别推进。

---

## Phase 3：用户故事 1 - 让纯文本按钮恢复视觉协调（优先级：P1）🎯 MVP

**目标**：修正纯文本 Button 在各尺寸下的纵横留白比例，让文本按钮恢复内容型视觉密度。

**独立测试**：查看纯文本 `filled` / `outlined` 代表性示例，并运行对应测试，确认按钮在默认、hover、focus-visible 和 disabled 状态下不再表现出明显的“上下显大、左右显小”失衡。

### 用户故事 1 的测试

- [x] T008 [P] [US1] 在 `packages/components/src/button/index.test.ts` 中新增纯文本 Button 的密度、状态稳定性和长短文案回归测试
- [x] T009 [P] [US1] 在 `packages/components/tests/button-density-contract.test.ts` 中新增纯文本 Button 的 block/inline 留白契约测试

### 用户故事 1 的实现

- [x] T010 [US1] 在 `packages/components/src/button/index.module.less` 中重构纯文本 Button 的 block/inline 间距、尺寸层级和状态下的稳定对齐规则
- [x] T011 [US1] 在 `packages/components/src/button/index.tsx` 中补充纯文本模式的数据属性、模式分支和渲染路径，确保文本模式不再被 icon-only 约束污染
- [x] T012 [US1] 在 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中更新纯文本 Button 的评审矩阵和精选示例，突出新的视觉平衡结果

**检查点**：用户故事 1 完成后，纯文本 Button 应已可独立验收并作为 MVP 交付。

---

## Phase 4：用户故事 2 - 保持 IconButton 的方形触达（优先级：P2）

**目标**：交付显式 `IconButton` / `Button.Icon` 入口，并保持图标按钮在各尺寸下的方形外观、居中对齐和无障碍命名。

**独立测试**：分别通过 `IconButton` 与 `Button.Icon` 渲染 icon-only 示例并运行测试，确认两个入口在尺寸、状态和无障碍要求上完全一致，且按钮保持方形目标。

### 用户故事 2 的测试

- [x] T013 [P] [US2] 在 `packages/components/src/button/index.test.ts` 中新增 `IconButton` 的显式入口、方形尺寸和可访问名称测试
- [x] T014 [P] [US2] 在 `packages/components/tests/package-entrypoint.test.ts` 中新增 `IconButton`、`IconButtonProps` 与 `Button.Icon` 根级导出和别名一致性测试

### 用户故事 2 的实现

- [x] T015 [US2] 在 `packages/components/src/button/index.tsx` 中实现 `icon` prop、`IconButton`、`IconButtonProps` 与 `Button.Icon` 的公开 API 和图标按钮渲染逻辑
- [x] T016 [US2] 在 `packages/components/src/index.ts` 中接通 `IconButton`、`IconButtonProps` 的根级导出，并保持 `Button.Icon` 指向同一组件实现
- [x] T017 [US2] 在 `packages/components/README.md` 中补充 `IconButton` / `Button.Icon` 的推荐写法、无障碍要求和从旧 icon-only `Button` 迁移的说明
- [x] T018 [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中新增 `IconButton` / `Button.Icon` 的示例、别名对照和 icon-only 迁移展示

**检查点**：用户故事 2 完成后，图标按钮应已具备清晰、显式且可迁移的 API。

---

## Phase 5：用户故事 3 - 带图标文本按钮不再被误判为方形模式（优先级：P3）

**目标**：让带 `icon` 的文本 Button 保持与纯文本 Button 一致的内容型密度，同时明确与 `IconButton` 的边界。

**独立测试**：分别渲染前置图标文本按钮、后置图标文本按钮和 `IconButton`，运行测试并查看预览，确认图标+文本按钮仍属于内容按钮层级，不会退化成方形按钮。

### 用户故事 3 的测试

- [x] T019 [P] [US3] 在 `packages/components/src/button/index.test.ts` 中新增带 `icon` 的文本 Button 模式解析、尺寸层级和无障碍回归测试
- [x] T020 [P] [US3] 在 `packages/components/tests/button-support-matrix.test.ts` 中新增 `Button` / `IconButton` 变体支持矩阵和 `Button.Icon` 一致性契约测试

### 用户故事 3 的实现

- [x] T021 [US3] 在 `packages/components/src/button/index.tsx` 中实现 `icon + 文本` 走内容型密度、`icon-only` 走 `IconButton` 模式以及 `link` 不支持 `IconButton` 的模式分支
- [x] T022 [US3] 在 `packages/components/src/button/index.module.less` 中实现带 `icon` 的文本 Button 间距、图文间隔和 `IconButton` 方形尺寸的分离规则
- [x] T023 [US3] 在 `apps/storybook/src/stories/Button.stories.tsx` 中补充纯文本 Button、带 `icon` 的文本 Button 与 `IconButton` 的并排对比矩阵
- [x] T024 [US3] 在 `apps/website/src/main.tsx` 与 `packages/components/README.md` 中补充 `Button icon=...` 与 `IconButton` 的选型说明、边界示例和推荐接入方式

**检查点**：用户故事 3 完成后，三种入口的边界应清晰可见，且带图标文本按钮不会再被误判为方形按钮。

---

## Phase 6：收尾与跨故事事项

**目的**：完成跨故事一致性、文档同步和最终验证。

- [x] T025 [P] 在 `specs/20260323-refine-button-padding/quickstart.md`、`specs/20260323-refine-button-padding/contracts/button-component-contract.md` 与 `packages/components/README.md` 中同步最终实现后的命名、迁移步骤和验证说明
- [x] T026 [P] 在 `packages/components/tests/workspace-boundaries.test.ts` 中补充 Button / IconButton 仍保持 package-owned 行为和导出边界的回归断言
- [x] T027 在仓库根目录对照 `package.json` 与 `specs/20260323-refine-button-padding/quickstart.md` 运行 `vp check` 和 `vp test`
- [x] T028 在仓库根目录对照 `package.json` 与 `specs/20260323-refine-button-padding/quickstart.md` 运行 `vp run storybook#build` 和 `vp run website#build`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，是文本按钮视觉修正的 MVP
- **Phase 4（US2）**：依赖 Phase 2，建议在共享类型和导出骨架稳定后推进
- **Phase 5（US3）**：依赖 Phase 2，并依赖 US2 提供显式 `icon` / `IconButton` API
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1（P1）**：基础阶段完成后即可开始，不依赖其他用户故事
- **US2（P2）**：基础阶段完成后即可开始，不依赖 US1 的实现细节
- **US3（P3）**：依赖 US2 提供显式图标入口，再在其上实现“图标+文本仍是内容按钮”的边界

### 每个用户故事内部顺序

- 先写测试，再落地对应实现
- 先完成 `packages/components/src/button/` 内的模式解析与样式，再更新 Storybook / website / README
- 根级导出要随实现同步接通，不能等到最后再补
- 迁移说明要与新入口一起落地，避免出现代码已变更但消费文档滞后的情况

### 并行机会

- **准备阶段**：T003 可与 T001、T002 并行
- **基础阶段**：T005、T006、T007 可在 T004 完成后并行
- **US1**：T008 与 T009 可并行；T010 与 T011 需要顺序协作后再执行 T012
- **US2**：T013 与 T014 可并行；T017 可在 T015/T016 完成后与 T018 并行
- **US3**：T019 与 T020 可并行；T023 可在 T021/T022 完成后与 T024 并行
- **收尾阶段**：T025 与 T026 可并行，T027 和 T028 顺序执行

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/components/src/button/index.test.ts 中新增纯文本 Button 的密度、状态稳定性和长短文案回归测试"
Task: "在 packages/components/tests/button-density-contract.test.ts 中新增纯文本 Button 的 block/inline 留白契约测试"

# 在不同文件上并行推进展示面更新
Task: "在 apps/storybook/src/stories/Button.stories.tsx 与 apps/website/src/main.tsx 中更新纯文本 Button 的评审矩阵和精选示例"
```

## 并行示例：用户故事 2

```bash
# 并行启动图标按钮测试
Task: "在 packages/components/src/button/index.test.ts 中新增 IconButton 的显式入口、方形尺寸和可访问名称测试"
Task: "在 packages/components/tests/package-entrypoint.test.ts 中新增 IconButton、IconButtonProps 与 Button.Icon 根级导出和别名一致性测试"

# 在实现稳定后并行更新文档与预览
Task: "在 packages/components/README.md 中补充 IconButton / Button.Icon 的推荐写法、无障碍要求和迁移说明"
Task: "在 apps/storybook/src/stories/Button.stories.tsx 与 apps/website/src/main.tsx 中新增 IconButton / Button.Icon 的示例和迁移展示"
```

## 并行示例：用户故事 3

```bash
# 并行覆盖模式边界和支持矩阵
Task: "在 packages/components/src/button/index.test.ts 中新增带 icon 的文本 Button 模式解析、尺寸层级和无障碍回归测试"
Task: "在 packages/components/tests/button-support-matrix.test.ts 中新增 Button / IconButton 变体支持矩阵和 Button.Icon 一致性契约测试"

# 在不同消费面同步更新选型说明
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中补充三种入口的并排对比矩阵"
Task: "在 apps/website/src/main.tsx 与 packages/components/README.md 中补充 Button icon 与 IconButton 的选型说明"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 通过纯文本 Button 的测试和预览验证新的内容型密度
5. 在确认文本按钮视觉平衡稳定后，再推进显式 IconButton API

### 渐进交付

1. 先建立共享类型、模式解析骨架和样式变量
2. 交付 US1，先解决最核心的纯文本按钮视觉问题
3. 交付 US2，提供显式 `IconButton` / `Button.Icon` 入口并完成迁移说明
4. 交付 US3，明确带图标文本按钮与 `IconButton` 的边界
5. 最后运行完整验证并同步文档

### 并行团队策略

1. 一位工程师负责 `packages/components/src/button/` 的 props、模式解析、样式和测试
2. 一位工程师在 API 稳定后负责 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx`
3. 一位工程师在实现接近完成时负责 `packages/components/README.md`、迁移说明和回归验证

---

## 备注

- 所有验证命令都必须使用 `vp` 工作流
- `Button.Icon` 只是 `IconButton` 的同义入口，不得演化成第二份实现
- Button 的可复用能力必须优先落在 `packages/components/src/button/`
- Storybook 负责内部评审矩阵，website 负责公开精选示例，两者都不是 Button 规则的唯一事实来源
