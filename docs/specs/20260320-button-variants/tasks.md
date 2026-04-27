# 任务：重构 Button 组件基础能力

**输入**：来自 `/specs/20260320-button-variants/`  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/button-component-contract.md`、`quickstart.md`

**测试**：根据宪章要求，组件逻辑、无障碍语义与预览覆盖必须提供测试。下列每个用户故事都包含自动化验证任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用于追踪的用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都必须包含精确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**：清点当前实现与新 spec 的偏差，确保后续重构围绕 `variant + color + shape` 新模型推进。

- [x] T001 在 `packages/components/src/button/index.tsx`、`apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中盘点旧 `icon` variant、旧 shape 值和当前公开 props 的替换范围
- [x] T002 在 `specs/20260320-button-variants/contracts/button-component-contract.md`、`specs/20260320-button-variants/quickstart.md` 与 `packages/components/README.md` 中对齐新的 `variant` / `shape` 模型、迁移文案和验证门禁
- [x] T003 [P] 在 `package.json` 与 `packages/components/package.json` 中确认 `vp check`、`vp test`、`vp run storybook#build` 与 `vp run website#build` 的验证入口仍适用于本轮重构
- [x] T004 [P] 在 `packages/components/tests/workspace-boundaries.test.ts` 中确认 Button 重构不会引入新的跨 package 依赖或 app-only 逻辑

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的新 Button 类型、支持矩阵、公开注释基线与迁移约束。

**关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T005 在 `packages/components/src/button/index.tsx` 中重建 `Button` / `ButtonProps`、`variant` / `size` / `shape` 类型、默认值与支持矩阵骨架
- [x] T006 [P] 在 `packages/components/src/button/index.tsx` 中为所有对外暴露的 props、类型别名和支持矩阵常量补齐 JSDoc 注释，重点说明 `variant`、`size`、`shape`、`disabled` 的语义与限制
- [x] T007 [P] 在 `packages/components/src/button/index.module.less` 中建立 `filled`、`outlined`、`ghost`、`link` 四类 variant 与 `rect`、`rounded`、`pill` 三类 shape 的共享样式骨架
- [x] T008 [P] 在 `packages/components/src/index.ts` 中接通 `Button`、`ButtonProps` 根级导出并移除旧 `buttonCustomizationContract` 主入口
- [x] T009 [P] 在 `packages/components/README.md` 中建立新的公开契约、props 说明、shape 支持矩阵与 semver 迁移说明基线

**检查点**：基础能力已准备完成，用户故事可以独立推进。

---

## Phase 3：用户故事 1 - 用统一 API 使用标准按钮（优先级：P1）

**目标**：交付新的 `Button` / `ButtonProps` 公开入口，让消费方用 `variant + color + size + shape` 完成标准按钮接入。

**独立测试**：仅通过 `@deweyou-ui/components` 根级导出，分别渲染 `filled`、`outlined`、`ghost`、`link` 的代表性示例，并确认默认 `color="neutral"`、显式 `color="primary"`、`filled` / `outlined` 的 `shape` 配置和旧命名移除后的接入路径都可直接使用。

### 用户故事 1 的测试

- [x] T010 [P] [US1] 在 `packages/components/src/button/index.test.ts` 中新增 `filled`、`outlined`、`ghost`、`link` 的代表性渲染、默认 props 和 `shape` 默认值测试
- [x] T011 [P] [US1] 在 `packages/components/tests/package-entrypoint.test.ts` 中新增 `@deweyou-ui/components` 仅暴露 `Button` 与 `ButtonProps` 的根级导出测试

### 用户故事 1 的实现

- [x] T012 [US1] 在 `packages/components/src/button/index.tsx` 中实现新的 `Button` 组件、`variant` / `size` / `shape` API 和 `label` / `children` 合并策略
- [x] T013 [P] [US1] 在 `packages/components/src/button/index.module.less` 中完成四种 `variant` 的核心视觉样式、五档尺寸和三档 `shape` 实现
- [x] T014 [US1] 在 `packages/components/src/index.ts` 中移除 `FoundationButton` / `FoundationButtonProps` 旧公开入口并切换到 `Button` / `ButtonProps`
- [x] T015 [US1] 在 `packages/components/README.md` 与 `apps/website/src/main.tsx` 中更新主入口示例，只展示 `Button`、`ButtonProps` 和新的 `shape` 用法
- [x] T031 [US1] 在 `packages/components/src/button/index.tsx`、`packages/components/src/button/index.test.ts` 与 `packages/components/tests/button-support-matrix.test.ts` 中新增 `color` 公开字段、默认 `neutral` 行为与 `primary` opt-in 测试
- [x] T032 [US1] 在 `packages/components/src/button/index.module.less` 中实现 `neutral` / `primary` 两套颜色模式，并确保默认 `filled` 保持黑白灰、显式 `primary` 才切换主题色

**检查点**：用户故事 1 完成后，消费方应能仅通过统一的根级 API 使用按钮 MVP。

---

## Phase 4：用户故事 2 - 在支持矩阵内选择合适的按钮样式（优先级：P2）

**目标**：让设计师和开发者能在 Storybook 与 website 中直接查看 `variant` / `color` / `size` / `shape` 支持矩阵，以及 `ghost` / `link` 的非支持组合说明。

**独立测试**：打开 Storybook 与 website 的 Button 入口，逐一确认四种 `variant`、两种 `color`、五种 size、三种 `shape` 支持范围，以及 `ghost` / `link` 不支持 `shape` 的明确说明都可直接查看。

### 用户故事 2 的测试

- [x] T016 [US2] 在 `packages/components/src/button/index.test.ts` 中新增 `variant`-size-shape 支持矩阵、默认 `shape` 和不支持组合反馈测试
- [x] T017 [P] [US2] 在 `packages/components/tests/button-support-matrix.test.ts` 中新增面向 Storybook 与 website 共享矩阵数据的契约测试

### 用户故事 2 的实现

- [x] T018 [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 中建立覆盖四种 `variant`、五种 size、受支持 `shape` 与不支持组合说明的内部评审矩阵
- [x] T019 [P] [US2] 在 `apps/website/src/main.tsx` 中新增面向消费者的 Button 精选示例、`ghost` / `link` 区分说明与 `shape` 支持矩阵摘要
- [x] T020 [P] [US2] 在 `apps/website/src/style.css` 中新增 Button 预览区、矩阵说明卡片与不支持组合提示样式
- [x] T021 [US2] 在 `packages/components/README.md` 中补充支持矩阵、默认值与 `ghost` / `link` / `shape` 的使用边界说明
- [x] T033 [US2] 在 `apps/storybook/src/stories/Button.stories.tsx`、`apps/website/src/main.tsx` 与 `packages/components/README.md` 中补充 `neutral` / `primary` 颜色模式、默认值与主题色 opt-in 说明

**检查点**：用户故事 2 完成后，支持矩阵与能力边界应在预览和文档中一眼可见。

---

## Phase 5：用户故事 3 - 在边界与无障碍场景下保持可预测（优先级：P3）

**目标**：让按钮在 `disabled`、`focus-visible`、纯图标内容、长文案和不支持组合场景下都保持明确且可测试的行为。

**独立测试**：验证所有支持 `variant` 的默认、hover、focus-visible、active、disabled 状态，并确认无可见文本按钮必须具备可访问名称，`ghost` / `link` 传入 `shape` 不会静默失效。

### 用户故事 3 的测试

- [x] T022 [P] [US3] 在 `packages/components/src/button/index.test.ts` 中新增键盘激活、`disabled`、`focus-visible`、长文案与无可见文本按钮无障碍测试
- [x] T023 [P] [US3] 在 `packages/components/tests/button-support-matrix.test.ts` 中新增 `ghost` / `link` 不支持 `shape`、缺失可访问名称与显式失败消息的契约测试

### 用户故事 3 的实现

- [x] T024 [US3] 在 `packages/components/src/button/index.tsx` 中实现无可见文本按钮可访问名称校验、无效 `shape` 组合显式反馈与 `disabled` 非交互逻辑
- [x] T025 [P] [US3] 在 `packages/components/src/button/index.module.less` 中完善 `focus-visible`、`disabled`、长文案与纯图标内容状态样式
- [x] T026 [P] [US3] 在 `apps/storybook/src/stories/Button.stories.tsx` 中补充纯图标内容、`disabled`、长文案、`focus-visible` 与 invalid-combo 边界 stories
- [x] T027 [US3] 在 `packages/components/README.md` 与 `apps/website/src/main.tsx` 中补充无障碍要求、纯图标内容命名示例和错误组合提示

**检查点**：用户故事 3 完成后，边界与无障碍语义应对消费方和维护者都清晰可见。

---

## Phase 6：收尾与跨故事事项

**目的**：完成跨故事回归、验收文档与最终验证流程整理。

- [x] T028 [P] 在 `packages/components/tests/workspace-boundaries.test.ts` 中补充 Button 重构后仍保持 package-first 边界和 style token 依赖约束的回归断言
- [x] T029 [P] 在 `specs/20260320-button-variants/quickstart.md` 与 `packages/components/README.md` 中整理最终 smoke test、迁移说明与公开 props 注释规范
- [x] T030 在 `package.json` 中确认 `ready`、`check`、`test` 与 `build` 脚本和 `specs/20260320-button-variants/quickstart.md` 中的验证流程保持一致
- [x] T034 [P] 在 `packages/styles/src/primitives/index.ts`、`packages/styles/src/themes/index.ts`、`packages/styles/src/css/base.css` 与 `apps/storybook/.storybook/preview.ts` 中把页面与预览底色统一调整为浅色白底、深夜模式黑底
- [x] T035 [P] 在 `specs/20260320-button-variants/spec.md`、`plan.md`、`data-model.md`、`quickstart.md`、`research.md` 与 `contracts/button-component-contract.md` 中同步 `color` 公开能力、默认中性色和主题色 opt-in 契约
- [x] T036 [P] 在 `packages/components/src/button/index.module.less` 中收紧 `filled` / `outlined` 的统一四边内边距，并将 `ghost` / `link` 调整为更轻的文本流密度与 `ghost=0.4rem` 默认圆角
- [x] T037 [P] 在 `packages/components/src/button/index.tsx`、`packages/components/src/button/index.test.ts` 与 `apps/storybook/src/stories/Button.stories.tsx` 中移除 icon-only 自动布局特例，仅保留无可见文本按钮的可访问名称约束和边界示例
- [x] T038 [P] 在 `packages/icons/src/icon/base-icon.tsx`、`packages/icons/src/icon/index.tsx`、`packages/icons/src/icon/types.ts` 与 `packages/icons/scripts/organize-dist.mjs` 中让 icon 默认继承字号，并通过方形 wrapper 与 `viewBox` 补方稳定占位
- [x] T039 [P] 在 `packages/icons/src/icon/index.test.tsx`、`packages/icons/src/foundation-icons/index.test.tsx` 与 `specs/20260320-button-variants/` 同级文档中补齐 icon 随字号缩放、wrapper 占位稳定和最新按钮密度契约的回归说明

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，是 MVP 的最小可交付范围
- **Phase 4（US2）**：依赖 Phase 2，并建议在 US1 的公开 API 稳定后推进
- **Phase 5（US3）**：依赖 Phase 2，并建议在 US1 的基础组件可渲染后推进
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1（P1）**：不依赖其他用户故事，是按钮重构的 MVP
- **US2（P2）**：依赖 US1 提供稳定的 `Button` / `ButtonProps` 根级用法，但可以独立验证预览矩阵
- **US3（P3）**：依赖 US1 提供基础渲染能力，但可与 US2 并行推进无障碍和边界约束

### 每个用户故事内部顺序

- 先写测试，再落地对应实现
- 先完成 package 内的 API、矩阵和样式，再更新 Storybook 与 website
- 对外暴露的 props、类型和常量要随实现同步补齐注释，不能留到最后再补
- 迁移说明和 README 要与对应行为一起落地，不能滞后到最后才补

### 并行机会

- **准备阶段**：T003 与 T004 可并行
- **基础阶段**：T006、T007、T008 与 T009 可在 T005 完成后并行
- **US1**：T010 与 T011 可并行；T013 可与 T014 并行，然后汇合到 T015
- **US2**：T017 可与 T016 并行；T019 与 T020 可并行，然后汇合到 T021
- **US3**：T022 与 T023 可并行；T025 与 T026 可并行，然后汇合到 T027
- **收尾阶段**：T028 与 T029 可并行，然后再完成 T030

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/components/src/button/index.test.ts 中新增 filled、outlined、ghost、link 的代表性渲染与默认 props 测试"
Task: "在 packages/components/tests/package-entrypoint.test.ts 中新增 @deweyou-ui/components 仅暴露 Button 与 ButtonProps 的根级导出测试"

# 并行推进不同文件上的实现
Task: "在 packages/components/src/button/index.tsx 中为所有对外暴露的 props、类型别名和支持矩阵常量补齐 JSDoc 注释"
Task: "在 packages/components/src/button/index.module.less 中完成四种 variant 的核心视觉样式、五档尺寸和三档 shape 实现"
```

## 并行示例：用户故事 2

```bash
# 同时构建两个消费端预览面
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中建立覆盖四种 variant、五种 size、受支持 shape 与不支持组合说明的内部评审矩阵"
Task: "在 apps/website/src/main.tsx 中新增面向消费者的 Button 精选示例、ghost/link 区分说明与 shape 支持矩阵摘要"

# 同时补齐 website 的结构与样式
Task: "在 apps/website/src/style.css 中新增 Button 预览区、矩阵说明卡片与不支持组合提示样式"
Task: "在 packages/components/README.md 中补充支持矩阵、默认值与 ghost/link/shape 的使用边界说明"
```

## 并行示例：用户故事 3

```bash
# 并行覆盖行为测试与边界预览
Task: "在 packages/components/src/button/index.test.ts 中新增键盘激活、disabled、focus-visible、长文案与无可见文本按钮无障碍测试"
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中补充纯图标内容、disabled、长文案、focus-visible 与 invalid-combo 边界 stories"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 通过 package 级测试和 website 主入口示例验证统一 API
5. 在确认 `Button` / `ButtonProps` 公开表面稳定后，再扩展矩阵和边界故事

### 渐进交付

1. 先稳定公开 API、类型、JSDoc 注释和样式骨架
2. 交付 US1，消除 `FoundationButton` 与 `buttonCustomizationContract` 的主要公开入口
3. 交付 US2，建立 Storybook 与 website 的能力矩阵
4. 交付 US3，补齐无障碍与不支持组合保护
5. 最后执行 workspace 验证并整理迁移文档

### 并行团队策略

1. 一位工程师负责 `packages/components/src/button/` 的 API、公开 props 注释、样式与测试
2. 一位工程师在 US1 API 稳定后负责 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx`
3. 一位工程师在共享矩阵稳定后负责 README、quickstart 与边界回归测试

---

## 备注

- 所有验证命令都必须使用 `vp` 工作流
- Storybook 负责内部评审矩阵，website 负责公开精选示例，两者都不是 Button 规则的唯一事实来源
- Button 的可复用能力必须优先落在 `packages/components/src/button/`
- 对外暴露的 props、类型别名和支持矩阵常量应提供简洁、准确的代码注释，避免消费者必须阅读实现细节才理解 API
