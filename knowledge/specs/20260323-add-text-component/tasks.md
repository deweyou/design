# 任务：新增 Text 排版组件

**输入**：来自 `/specs/20260323-add-text-component/`  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/text-component-contract.md`、`quickstart.md`
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章要求，组件逻辑、无障碍语义、token 输出、主题映射和预览覆盖必须提供自动化验证。下列每个用户故事都包含独立测试任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用于追踪的用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都包含精确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**：创建 Text 组件工作骨架，并为 Storybook、website 与文档面预留接入点。

- [x] T001 在 `packages/components/src/text/index.tsx`、`packages/components/src/text/index.module.less` 与 `packages/components/src/text/index.test.ts` 对齐 Text 组件单元骨架
- [x] T002 [P] 在 `apps/storybook/src/stories/Typography.stories.tsx`、`apps/website/src/main.tsx` 与 `apps/website/src/style.css` 预留 Text 评审与公开示例挂点
- [x] T003 [P] 在 `packages/components/src/index.ts` 与 `packages/components/README.md` 预留 Text 根级导出和文档章节

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的共享排版 token、默认节点映射和样式组合基座。

**关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T004 在 `packages/styles/src/primitives/index.ts`、`packages/styles/src/themes/index.ts`、`packages/styles/src/css/theme-light.css` 与 `packages/styles/src/css/theme-dark.css` 定义 Text 共享字号、行高和标题垂直节奏 token
- [x] T005 [P] 在 `packages/styles/src/semantics/index.ts`、`packages/styles/src/css/base.css` 与 `packages/styles/tests/theme-outputs.test.ts` 暴露并验证 Text 排版 theme surface
- [x] T006 [P] 在 `packages/components/src/text/index.tsx` 与 `packages/components/src/text/index.module.less` 建立 `TextProps` 基座、默认节点映射和共享 className 组合逻辑

**检查点**：基础能力完成后，用户故事可以按依赖关系独立推进。

---

## Phase 3：用户故事 1 - 用统一入口渲染常见文本层级（优先级：P1）🎯 MVP

**目标**：交付 `Text` 的基础排版层级，让消费方通过单一入口渲染 `plain`、`body`、`caption` 和 `h1`-`h5`，并默认获得正确的原生标题节点。

**独立测试**：仅通过 `Text` 的根级导出与 Storybook / website 示例，即可验证默认 `variant`、默认节点映射、标题原生语义和各层级排版差异。

### 用户故事 1 的测试（必需）⚠️

- [x] T007 [P] [US1] 在 `packages/components/src/text/index.test.ts` 编写 `plain`、`body`、`caption`、`h1`-`h5` 默认节点、默认 `variant` 与标题间距回归测试
- [x] T008 [P] [US1] 在 `packages/components/tests/package-entrypoint.test.ts` 编写 `Text` 与 `TextProps` 根级导出及标题原生语义回归测试

### 用户故事 1 的实现

- [x] T009 [US1] 在 `packages/components/src/text/index.tsx` 中实现基础 `variant` 渲染、默认节点选择和 `h1`-`h5` 原生标题节点映射
- [x] T010 [P] [US1] 在 `packages/components/src/text/index.module.less` 中实现 `plain`、`body`、`caption`、`h1`、`h2`、`h3`、`h4`、`h5` 的 token 驱动排版样式与标题上下间距
- [x] T011 [P] [US1] 在 `apps/storybook/src/stories/Typography.stories.tsx` 中新增 Text 基础层级矩阵和长文标题层级预览
- [x] T012 [P] [US1] 在 `apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中新增 Text 基础用法、标题示例和默认节点说明
- [x] T013 [US1] 在 `packages/components/src/index.ts` 与 `packages/components/README.md` 中完成 Text 基础导出并记录 `variant` 默认值与标题语义

**检查点**：用户故事 1 完成后，`Text` 的基础层级能力应可独立交付并可视化评审。

---

## Phase 4：用户故事 2 - 组合文本装饰与高亮色卡（优先级：P2）

**目标**：让 `Text` 支持 `italic`、`bold`、`underline`、`strikethrough` 的组合使用，并通过受控的 `color` / `background` 消费 26 色族共享色卡完成文字强调与高亮。

**独立测试**：对任意 `variant` 启用单个或多个布尔样式字段，并设置 `color`、`background` 的合法颜色家族时，文本装饰和高亮都能独立生效；非法输入不会产生未文档化颜色来源。

### 用户故事 2 的测试（必需）⚠️

- [x] T014 [P] [US2] 在 `packages/components/src/text/index.test.ts` 编写 `italic`、`bold`、`underline`、`strikethrough`、`color`、`background` 的单独与组合回归测试
- [x] T015 [P] [US2] 在 `packages/styles/tests/theme-outputs.test.ts` 编写 26 色族 x 11 色阶共享色卡输出和主题映射回归测试
- [x] T016 [P] [US2] 在 `packages/components/tests/workspace-boundaries.test.ts` 编写 `color` / `background` 根级消费面和预览覆盖回归测试

### 用户故事 2 的实现

- [x] T017 [US2] 在 `packages/styles/src/primitives/index.ts`、`packages/styles/src/themes/index.ts`、`packages/styles/src/css/theme-light.css` 与 `packages/styles/src/css/theme-dark.css` 中实现 26 色族 x 11 色阶共享色卡 token 与主题映射
- [x] T018 [P] [US2] 在 `packages/styles/src/semantics/index.ts` 与 `packages/styles/src/css/base.css` 中暴露 `Text` 可消费的文字色和背景色语义 surface
- [x] T019 [US2] 在 `packages/components/src/text/index.tsx` 中实现 `color` / `background` props、颜色家族 union 和装饰字段组合逻辑
- [x] T020 [P] [US2] 在 `packages/components/src/text/index.module.less` 中实现高亮背景、文字色映射与 `caption` 组合可读性规则
- [x] T021 [P] [US2] 在 `apps/storybook/src/stories/Typography.stories.tsx` 中新增色卡高亮矩阵、主题切换和中英数混排评审示例
- [x] T022 [P] [US2] 在 `apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中新增高亮用法、颜色家族说明和推荐搭配示例
- [x] T023 [US2] 在 `packages/components/README.md` 与 `specs/20260323-add-text-component/contracts/text-component-contract.md` 中记录 `color` / `background` API、26 色族清单和主题映射约定

**检查点**：用户故事 2 完成后，Text 的装饰和高亮色卡能力应可独立接入并完成浅色 / 深色主题评审。

---

## Phase 5：用户故事 3 - 控制长文本和透传节点能力（优先级：P3）

**目标**：补齐 `lineClamp` 和节点属性透传，让 `Text` 可以处理长文本摘要，同时保留 `className`、`id`、`aria-*`、`data-*` 等基础接入能力。

**独立测试**：使用超长文本和代表性节点属性，验证 `lineClamp` 的有效 / 无效输入处理一致，且透传属性都落到最终渲染节点上。

### 用户故事 3 的测试（必需）⚠️

- [x] T024 [P] [US3] 在 `packages/components/src/text/index.test.ts` 编写 `lineClamp` 有效值、无效值、自然展开与省略提示回归测试
- [x] T025 [P] [US3] 在 `packages/components/tests/workspace-boundaries.test.ts` 编写 `className`、`id`、`role`、`aria-*`、`data-*` 透传与长文本消费面回归测试

### 用户故事 3 的实现

- [x] T026 [US3] 在 `packages/components/src/text/index.tsx` 中实现 `lineClamp` 归一逻辑和最终渲染节点属性透传
- [x] T027 [P] [US3] 在 `packages/components/src/text/index.module.less` 中实现截断与未截断状态样式以及多行省略 fallback
- [x] T028 [P] [US3] 在 `apps/storybook/src/stories/Typography.stories.tsx` 中扩展长文本截断、节点透传和混合标题阅读面示例
- [x] T029 [P] [US3] 在 `apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中扩展长文本、省略显示和透传属性指导示例
- [x] T030 [US3] 在 `packages/components/README.md` 与 `specs/20260323-add-text-component/quickstart.md` 中补充 `lineClamp`、无效输入处理和节点透传说明

**检查点**：用户故事 3 完成后，Text 的长文本与透传能力应可独立交付并完成无障碍评审。

---

## Phase 6：收尾与跨故事事项

**目的**：同步最终设计文档、清理过期说明，并完成 workspace 级验证。

- [x] T031 [P] 在 `specs/20260323-add-text-component/data-model.md` 与 `specs/20260323-add-text-component/research.md` 中回填最终 API、色卡 token 和主题映射结论
- [x] T032 [P] 在 `packages/components/README.md`、`apps/storybook/src/stories/Typography.stories.tsx` 与 `apps/website/src/main.tsx` 中统一最终文案并删除过期的 heading 语义说明
- [x] T033 在 `package.json` 定义的 workspace 验证入口上运行 `vp check`、`vp test`、`vp run components#build`、`vp run storybook#build` 与 `vp run website#build`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，是 MVP 的最小可交付范围
- **Phase 4（US2）**：依赖 US1 已建立稳定的 `variant` 渲染和默认节点映射
- **Phase 5（US3）**：依赖 US1 已建立稳定的根节点渲染骨架，但不依赖 US2 的高亮色卡能力
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1（P1）**：基础阶段完成后即可开始，不依赖其他用户故事
- **US2（P2）**：依赖 US1 已稳定输出 `variant`、标题原生节点和基础文本样式
- **US3（P3）**：依赖 US1 已稳定输出根节点渲染骨架，但不依赖 US2 的色卡高亮能力

### 每个用户故事内部顺序

- 先写测试，再落地对应实现
- 先完成 `packages/styles/src/` 与 `packages/components/src/text/` 中的共享能力，再更新 Storybook、website 和 README
- 根级导出、公开文档和契约说明应随功能一起更新，不能留到最后统一补
- 当前故事完成并通过独立测试后，再进入更低优先级或相关依赖故事

### 并行机会

- **准备阶段**：T002 与 T003 可并行
- **基础阶段**：T005 与 T006 可在 T004 完成后并行
- **US1**：T007 与 T008 可并行；T010、T011、T012 可在 T009 完成后并行
- **US2**：T014、T015、T016 可并行；T018、T020、T021、T022 可在 T017 与 T019 完成后并行
- **US3**：T024 与 T025 可并行；T027、T028、T029 可在 T026 完成后并行
- **收尾阶段**：T031 与 T032 可并行，T033 最后执行

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/components/src/text/index.test.ts 编写 plain/body/caption/h1-h5 默认节点与标题间距回归测试"
Task: "在 packages/components/tests/package-entrypoint.test.ts 编写 Text 与 TextProps 根级导出及标题原生语义回归测试"

# 在不同文件上并行推进基础层级能力
Task: "在 packages/components/src/text/index.module.less 中实现 plain/body/caption/h1-h5 的 token 驱动排版样式与标题上下间距"
Task: "在 apps/storybook/src/stories/Typography.stories.tsx 中新增 Text 基础层级矩阵和长文标题层级预览"
Task: "在 apps/website/src/main.tsx 与 apps/website/src/style.css 中新增 Text 基础用法、标题示例和默认节点说明"
```

## 并行示例：用户故事 2

```bash
# 并行启动用户故事 2 的测试
Task: "在 packages/components/src/text/index.test.ts 编写 italic、bold、underline、strikethrough、color、background 组合回归测试"
Task: "在 packages/styles/tests/theme-outputs.test.ts 编写 26 色族 x 11 色阶共享色卡输出和主题映射回归测试"
Task: "在 packages/components/tests/workspace-boundaries.test.ts 编写 color/background 根级消费面和预览覆盖回归测试"

# 在不同消费面并行扩展高亮能力
Task: "在 packages/styles/src/semantics/index.ts 与 packages/styles/src/css/base.css 中暴露 Text 可消费的文字色和背景色语义 surface"
Task: "在 packages/components/src/text/index.module.less 中实现高亮背景、文字色映射与 caption 组合可读性规则"
Task: "在 apps/storybook/src/stories/Typography.stories.tsx 中新增色卡高亮矩阵、主题切换和中英数混排评审示例"
Task: "在 apps/website/src/main.tsx 与 apps/website/src/style.css 中新增高亮用法、颜色家族说明和推荐搭配示例"
```

## 并行示例：用户故事 3

```bash
# 并行启动用户故事 3 的测试
Task: "在 packages/components/src/text/index.test.ts 编写 lineClamp 有效值、无效值、自然展开与省略提示回归测试"
Task: "在 packages/components/tests/workspace-boundaries.test.ts 编写 className、id、role、aria-*、data-* 透传与长文本消费面回归测试"

# 在实现完成后并行更新两个预览面
Task: "在 packages/components/src/text/index.module.less 中实现截断与未截断状态样式以及多行省略 fallback"
Task: "在 apps/storybook/src/stories/Typography.stories.tsx 中扩展长文本截断、节点透传和混合标题阅读面示例"
Task: "在 apps/website/src/main.tsx 与 apps/website/src/style.css 中扩展长文本、省略显示和透传属性指导示例"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 通过 `vp check`、`vp test` 与最小预览示例验证基础排版入口已可独立交付
5. 在确认 `variant`、默认节点映射和标题语义稳定后，再推进高亮色卡和长文本能力

### 渐进交付

1. 先稳定共享排版 token、主题输出和 `TextProps` 骨架
2. 交付 US1，先解决基础排版层级和原生标题节点
3. 交付 US2，补齐装饰字段、`color` / `background` 与共享色卡
4. 交付 US3，补齐长文本和节点透传能力
5. 最后执行完整 workspace 验证并同步设计文档

### 并行团队策略

1. 一位工程师负责 `packages/styles/src/` 中的排版 token、色卡 token 和主题输出
2. 一位工程师负责 `packages/components/src/text/` 中的组件实现与单测
3. 一位工程师在 package API 稳定后负责 `apps/storybook/src/stories/Typography.stories.tsx`、`apps/website/src/main.tsx`、`apps/website/src/style.css` 与 `packages/components/README.md`

---

## 备注

- 所有验证命令都必须使用 `vp` 工作流
- 可复用排版和色卡能力必须优先落在 `packages/components/src/text/` 与 `packages/styles/src/`
- Storybook 负责内部评审矩阵，website 负责公开指导，两者都不是组件规则的唯一事实来源
- `h1`-`h5` 在 `Text` 中默认渲染对应原生标题节点，并同时承担视觉层级与标题语义
- `color` / `background` 只暴露 26 个颜色家族名，具体色阶由主题自动映射
