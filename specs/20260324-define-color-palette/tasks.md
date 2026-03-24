# 任务：建立统一颜色 token 体系

**输入**：来自 `/specs/20260324-define-color-palette/`  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/color-token-contract.md`、`quickstart.md`
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章要求，token 输出、组件消费边界、主题切换表现和预览覆盖必须提供自动化验证。下列每个用户故事都包含独立测试任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用于追踪的用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都必须包含精确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**：为统一颜色体系创建实现挂点，并提前对齐 Storybook、website 与文档面的接入位置。

- [x] T001 在 `packages/styles/src/index.ts`、`packages/styles/src/primitives/index.ts` 与 `packages/styles/src/semantics/index.ts` 中预留通用颜色导出、兼容 alias 和命名边界骨架
- [x] T002 [P] 在 `apps/storybook/src/stories/Color.stories.tsx`、`apps/storybook/src/stories/Typography.stories.tsx` 与 `apps/storybook/src/stories/Button.stories.tsx` 中预留统一颜色评审入口和代表性消费挂点
- [x] T003 [P] 在 `apps/website/src/main.tsx`、`apps/website/src/style.css` 与 `packages/styles/README.md` 中预留颜色指导、治理规则和公开说明区块

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的通用颜色模型、组件消费边界和公开入口基座。

**关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T004 在 `packages/styles/src/primitives/index.ts` 中建立共享颜色家族、色阶与纯黑白基础颜色的类型和元数据骨架
- [x] T005 [P] 在 `packages/styles/src/semantics/index.ts` 与 `packages/styles/src/themes/index.ts` 中建立语义主题色追溯与浅色/深色映射骨架
- [x] T006 [P] 在 `packages/styles/tests/index.test.ts` 与 `packages/styles/tests/consumer-import.test.ts` 中建立公开导出、主题入口和 `less/bridge.less` 的基线断言
- [x] T007 [P] 在 `packages/components/src/button/index.tsx`、`packages/components/src/text/index.tsx` 与 `packages/components/tests/workspace-boundaries.test.ts` 中建立组件统一颜色来源的边界基线

**检查点**：基础能力完成后，用户故事可以按依赖关系独立推进。

---

## Phase 3：用户故事 1 - 维护统一色卡基础层（优先级：P1）🎯 MVP

**目标**：在 `@deweyou-ui/styles` 中建立可复用的共享基础色卡，完整覆盖 26 个颜色家族、11 个色阶，以及纯黑白两个基础颜色，并提供 Storybook 色卡总览。

**独立测试**：仅通过 `packages/styles` 的自动化测试和 Storybook 色卡 story，即可验证完整色卡、纯黑白、稳定命名和查找路径。

### 用户故事 1 的测试（必需）⚠️

- [x] T008 [P] [US1] 在 `packages/styles/tests/theme-outputs.test.ts` 中编写 26 色族 x 11 色阶、纯黑、纯白和稳定排序的主题输出回归测试
- [x] T009 [P] [US1] 在 `packages/styles/tests/index.test.ts` 中编写通用颜色导出与兼容 alias 的公开 API 回归测试

### 用户故事 1 的实现

- [x] T010 [US1] 在 `packages/styles/src/primitives/index.ts` 中实现共享基础色卡、纯黑白基础颜色以及通用颜色家族/色阶导出
- [x] T011 [P] [US1] 在 `packages/styles/src/index.ts` 与 `packages/styles/src/semantics/index.ts` 中暴露通用颜色导出、兼容 alias 和可检索的颜色命名 surface
- [x] T012 [P] [US1] 在 `packages/styles/src/css/theme-light.css`、`packages/styles/src/css/theme-dark.css` 与 `packages/styles/src/css/theme.css` 中输出完整色卡与纯黑白的评审用 CSS surface
- [x] T013 [P] [US1] 在 `apps/storybook/src/stories/Color.stories.tsx` 中实现完整色卡、纯黑白和检索路径说明的 Storybook 色卡 story
- [x] T014 [US1] 在 `packages/styles/README.md` 中记录共享基础色卡结构、查找方式和 Storybook 色卡 story 的评审入口

**检查点**：用户故事 1 完成后，共享基础色卡应可独立交付，并能在 Storybook 中完成总览评审。

---

## Phase 4：用户故事 2 - 让颜色依赖组件复用同一来源（优先级：P2）

**目标**：让 `Button`、`Text` 和代表性预览都统一回到共享基础色卡或语义主题色来源，不新增新的组件公开颜色轴。

**独立测试**：通过 `Button`、`Text` 的组件测试和 Storybook 代表性示例，验证组件继续使用现有公开 API，但颜色来源已经统一收敛到 `@deweyou-ui/styles`。

### 用户故事 2 的测试（必需）⚠️

- [x] T015 [P] [US2] 在 `packages/components/src/text/index.test.ts` 中编写 `Text` 的 `color` / `background` 继续消费共享语义变量而非直接暴露色阶编号的回归测试
- [x] T016 [P] [US2] 在 `packages/components/tests/workspace-boundaries.test.ts` 中编写 `Button` / `Text` 只复用共享 token 或语义主题色、不得引入组件私有颜色来源的边界回归测试

### 用户故事 2 的实现

- [x] T017 [US2] 在 `packages/components/src/text/index.tsx` 与 `packages/components/src/text/index.module.less` 中对齐 `Text` 的高亮与文字色消费路径到统一共享色卡命名
- [x] T018 [P] [US2] 在 `packages/components/src/button/index.tsx` 与 `packages/components/src/button/index.module.less` 中对齐 `Button` 的 `neutral`、`primary`、`danger`、`link` 和 focus 颜色来源到语义主题色
- [x] T019 [P] [US2] 在 `apps/storybook/src/stories/Typography.stories.tsx` 与 `apps/storybook/src/stories/Button.stories.tsx` 中更新代表性示例，明确展示统一颜色来源而非新增特化 token
- [x] T020 [US2] 在 `packages/components/README.md` 与 `packages/components/src/index.ts` 中记录 `Button` / `Text` 的统一颜色消费边界，并保持现有组件公开 API 不扩张

**检查点**：用户故事 2 完成后，`Button` 与 `Text` 应能在不扩张 API 的前提下共享同一颜色来源，并可独立完成回归测试。

---

## Phase 5：用户故事 3 - 让现有主题色回归统一治理（优先级：P3）

**目标**：把品牌色、危险色、链接色、焦点色和 `Text` 高亮语义全部纳入统一治理，并在 website 中给出明确的复用边界与“非必要不得新增特化 token”说明。

**独立测试**：通过 `packages/styles` 的主题输出测试、公开入口测试和 website / Storybook 示例，验证现有主题色都能追溯到共享基础色卡或纯黑白，并在浅色 / 深色主题下保持语义连续。

### 用户故事 3 的测试（必需）⚠️

- [x] T021 [P] [US3] 在 `packages/styles/tests/theme-outputs.test.ts` 中编写品牌色、危险色、链接色、焦点色与 `Text` 高亮语义追溯到共享色卡或纯黑白的浅色/深色回归测试
- [x] T022 [P] [US3] 在 `packages/styles/tests/consumer-import.test.ts` 中编写 `theme.css`、`theme-light.css`、`theme-dark.css` 与 `packages/styles/src/less/bridge.less` 稳定公开入口回归测试

### 用户故事 3 的实现

- [x] T023 [US3] 在 `packages/styles/src/semantics/index.ts` 与 `packages/styles/src/themes/index.ts` 中把现有语义主题色统一映射到共享基础色卡或纯黑白，并保留稳定命名
- [x] T024 [P] [US3] 在 `packages/styles/src/css/base.css`、`packages/styles/src/css/theme-light.css`、`packages/styles/src/css/theme-dark.css` 与 `packages/styles/src/less/bridge.less` 中同步受治理的语义 surface 和主题切换可读性
- [x] T025 [P] [US3] 在 `apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中新增公开颜色指导、语义层与基础色卡关系说明，以及“非必要不得新增特化 token”的规则
- [x] T026 [P] [US3] 在 `packages/styles/README.md` 与 `apps/storybook/src/stories/Color.stories.tsx` 中补充语义主题色追溯、例外申请边界和代表性组件消费关系说明

**检查点**：用户故事 3 完成后，现有主题色应已回归统一治理，并在 website / Storybook 中完成规则说明和主题切换评审。

---

## Phase 6：收尾与跨故事事项

**目的**：统一最终术语、补齐跨故事边界状态，并完成 workspace 级验证。

- [x] T027 [P] 在 `packages/styles/README.md`、`packages/components/README.md` 与 `apps/website/src/main.tsx` 中统一最终术语、治理边界和 semver 说明
- [x] T028 [P] 在 `apps/storybook/src/stories/Color.stories.tsx`、`apps/storybook/src/stories/Button.stories.tsx` 与 `apps/storybook/src/stories/Typography.stories.tsx` 中补齐最终边界状态和主题切换评审文案
- [x] T029 在 `package.json` 定义的 workspace 验证入口上运行 `vp check` 与 `vp test`
- [x] T030 在 `package.json` 定义的 workspace 验证入口上运行 `vp run styles#build`、`vp run components#build`、`vp run storybook#build` 与 `vp run website#build`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，是 MVP 的最小可交付范围
- **Phase 4（US2）**：依赖 US1 已稳定输出共享基础色卡与通用颜色命名
- **Phase 5（US3）**：依赖 US1 已稳定输出共享基础色卡；可与 US2 部分并行，但建议在组件消费路径稳定后收口
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1（P1）**：基础阶段完成后即可开始，不依赖其他用户故事
- **US2（P2）**：依赖 US1 已稳定输出共享基础色卡和兼容 alias
- **US3（P3）**：依赖 US1 已稳定输出共享基础色卡；与 US2 不强依赖，但最终示例建议在 US2 消费路径稳定后一起收口

### 每个用户故事内部顺序

- 先写测试，再落地对应实现
- 先完成 `packages/styles/src/` 中的共享颜色与语义层，再更新 `packages/components/src/` 的消费路径
- package 和 theme 层实现先于 Storybook / website 示例更新
- README 与公开说明应与对应故事一起更新，不能留到最后统一补
- 当前故事完成并通过独立测试后，再进入更低优先级故事

### 并行机会

- **准备阶段**：T002 与 T003 可并行
- **基础阶段**：T005、T006、T007 可在 T004 完成后并行
- **US1**：T008 与 T009 可并行；T011、T012、T013 可在 T010 完成后并行
- **US2**：T015 与 T016 可并行；T018 与 T019 可在 T017 完成后并行
- **US3**：T021 与 T022 可并行；T024、T025、T026 可在 T023 完成后并行
- **收尾阶段**：T027 与 T028 可并行，T029、T030 顺序执行

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/styles/tests/theme-outputs.test.ts 中编写 26 色族 x 11 色阶、纯黑、纯白和稳定排序的主题输出回归测试"
Task: "在 packages/styles/tests/index.test.ts 中编写通用颜色导出与兼容 alias 的公开 API 回归测试"

# 在不同文件上并行推进共享基础色卡
Task: "在 packages/styles/src/index.ts 与 packages/styles/src/semantics/index.ts 中暴露通用颜色导出、兼容 alias 和可检索的颜色命名 surface"
Task: "在 packages/styles/src/css/theme-light.css、packages/styles/src/css/theme-dark.css 与 packages/styles/src/css/theme.css 中输出完整色卡与纯黑白的评审用 CSS surface"
Task: "在 apps/storybook/src/stories/Color.stories.tsx 中实现完整色卡、纯黑白和检索路径说明的 Storybook 色卡 story"
```

## 并行示例：用户故事 2

```bash
# 并行启动用户故事 2 的测试
Task: "在 packages/components/src/text/index.test.ts 中编写 Text 的 color/background 继续消费共享语义变量而非直接暴露色阶编号的回归测试"
Task: "在 packages/components/tests/workspace-boundaries.test.ts 中编写 Button/Text 只复用共享 token 或语义主题色的边界回归测试"

# 在不同消费面并行收敛颜色来源
Task: "在 packages/components/src/button/index.tsx 与 packages/components/src/button/index.module.less 中对齐 Button 的 neutral、primary、danger、link 和 focus 颜色来源到语义主题色"
Task: "在 apps/storybook/src/stories/Typography.stories.tsx 与 apps/storybook/src/stories/Button.stories.tsx 中更新代表性示例，明确展示统一颜色来源而非新增特化 token"
```

## 并行示例：用户故事 3

```bash
# 并行启动用户故事 3 的测试
Task: "在 packages/styles/tests/theme-outputs.test.ts 中编写品牌色、危险色、链接色、焦点色与 Text 高亮语义追溯的浅色/深色回归测试"
Task: "在 packages/styles/tests/consumer-import.test.ts 中编写 theme.css、theme-light.css、theme-dark.css 与 packages/styles/src/less/bridge.less 稳定公开入口回归测试"

# 在实现完成后并行更新预览与公开指导
Task: "在 apps/website/src/main.tsx 与 apps/website/src/style.css 中新增公开颜色指导、语义层与基础色卡关系说明，以及非必要不得新增特化 token 的规则"
Task: "在 packages/styles/README.md 与 apps/storybook/src/stories/Color.stories.tsx 中补充语义主题色追溯、例外申请边界和代表性组件消费关系说明"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 通过 `vp check`、`vp test` 与 Storybook 色卡 story 验证共享基础色卡已可独立交付
5. 在共享基础色卡和兼容 alias 稳定后，再推进组件消费收敛和主题治理

### 渐进交付

1. 先稳定共享颜色模型、兼容 alias 和 theme 输出基座
2. 交付 US1，完成基础色卡与 Storybook 色卡总览
3. 交付 US2，让 `Button` / `Text` 回到统一颜色来源
4. 交付 US3，完成现有主题色治理和 website 公开指导
5. 最后执行完整 workspace 验证并统一术语

### 并行团队策略

1. 一位工程师负责 `packages/styles/src/` 中的共享基础色卡、语义主题色和主题输出
2. 一位工程师在共享颜色模型稳定后负责 `packages/components/src/button/` 与 `packages/components/src/text/` 的消费路径收敛
3. 一位工程师在 package API 稳定后负责 `apps/storybook/src/stories/Color.stories.tsx`、现有 story 更新、`apps/website/src/main.tsx` / `apps/website/src/style.css` 与 README 文档

---

## 备注

- 所有验证命令都必须使用 `vp` 工作流
- 共享颜色事实来源必须优先落在 `packages/styles/src/`
- `Button` 与 `Text` 应优先消费语义主题色，而不是直接耦合原始色阶编号
- Storybook 负责内部完整评审矩阵，website 负责公开指导，两者都不是规则唯一事实来源
- 非必要不得新增特化 token；任何例外都必须先证明共享基础色卡与现有语义主题色不足
