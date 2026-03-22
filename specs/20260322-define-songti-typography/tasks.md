# 任务：定义组件库宋体字体系统

**输入**：来自 `/specs/20260322-define-songti-typography/` 的设计文档  
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/typography-theme-contract.md`、`quickstart.md`  
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径和第三方 API 名称可保留原文。

**测试**：根据宪章要求，共享样式逻辑、用户可见行为与预览覆盖必须提供自动化验证与评审面更新。下列每个用户故事都包含测试任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都包含精确文件路径，便于直接执行

## Phase 1：准备阶段（共享基础设施）

**目的**：建立字体资源、回归测试和预览更新的准备条件，避免后续实现分散在 app 私有逻辑中。

- [x] T001 在 `packages/styles/src/assets/fonts/README.md` 中建立思源宋字体资产与许可证占位说明
- [x] T002 [P] 在 `packages/styles/README.md` 中记录本次字体系统改造涉及的现有入口 `theme.css`、`theme-light.css`、`theme-dark.css` 与 `base.css`
- [x] T003 [P] 在 `packages/styles/tests/theme-outputs.test.ts` 与 `packages/styles/tests/index.test.ts` 中准备字体回归断言骨架
- [x] T004 [P] 在 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中预留字体评审区块占位内容

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的共享字体角色、主题接线、基础 CSS 入口和资产分发链路。

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

- [x] T005 在 `packages/styles/src/primitives/index.ts` 中定义共享字体角色元数据、思源宋默认栈与平台回退顺序
- [x] T006 [P] 在 `packages/styles/src/themes/index.ts` 与 `packages/styles/src/index.ts` 中接通新的字体角色值和主题序列化输出
- [x] T007 [P] 在 `packages/styles/src/css/fonts.css` 与 `packages/styles/src/css/theme.css` 中建立共享 `@font-face` 和字体入口导入链路
- [x] T008 [P] 在 `packages/styles/src/css/base.css`、`packages/styles/src/css/theme-light.css` 与 `packages/styles/src/css/theme-dark.css` 中建立全局宋体默认值和等宽例外入口
- [x] T009 在 `packages/styles/package.json`、`packages/styles/scripts/copy-assets.mjs` 与 `packages/styles/tests/consumer-import.test.ts` 中接通字体资产分发与导入覆盖

**检查点**：基础阶段完成后，US1 可以作为 MVP 开始，US2 与 US3 也具备共同的实现基座。

---

## Phase 3：用户故事 1 - 统一中文字体基调（优先级：P1）🎯 MVP

**目标**：让整套组件默认采用统一的思源宋体系方向，并在字体未就绪或不可用时稳定退回平台系统宋体。

**独立测试**：仅通过 `@deweyou-ui/styles` 的默认主题入口和两套预览面，确认标题、正文、按钮、表单和数据展示都切换到统一宋体方向，且回退顺序符合 `macOS -> Songti SC, STSong`、`Windows -> SimSun, NSimSun`。

### 用户故事 1 的测试

- [x] T010 [P] [US1] 在 `packages/styles/tests/theme-outputs.test.ts` 中新增思源宋默认栈与平台回退顺序的回归测试
- [x] T011 [P] [US1] 在 `packages/styles/tests/consumer-import.test.ts` 与 `packages/styles/tests/index.test.ts` 中新增默认主题字体入口的导入与使用回归测试

### 用户故事 1 的实现

- [x] T012 [US1] 在 `packages/styles/src/assets/fonts/` 与 `packages/styles/src/css/fonts.css` 中加入思源宋字体资源和 `@font-face` 声明
- [x] T013 [US1] 在 `packages/styles/src/primitives/index.ts` 与 `packages/styles/src/css/base.css` 中把 `--ui-font-body`、`--ui-font-display` 切换到思源宋默认栈与系统宋体回退
- [x] T014 [US1] 在 `packages/styles/src/themes/index.ts`、`packages/styles/src/css/theme-light.css` 与 `packages/styles/src/css/theme-dark.css` 中同步统一后的默认字体值
- [x] T015 [P] [US1] 在 `apps/storybook/src/stories/Button.stories.tsx` 中加入标题、正文、按钮、表单与数据展示的基线字体评审样例
- [x] T016 [P] [US1] 在 `packages/styles/README.md`、`apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中加入默认宋体方向和平台回退说明

**检查点**：此时用户故事 1 应可独立验证，默认字体方向和平台回退都已稳定成立。

---

## Phase 4：用户故事 2 - 建立可复用的字重层级（优先级：P2）

**目标**：为正文、次强调、标题和强强调建立清晰的四档语义字重层级，并在默认字体与平台回退下都保持层级可辨。

**独立测试**：打开 Storybook 与 website 的字体评审区域，确认四档层级在标题、正文和紧凑控件中都能明确区分，并且平台回退状态下仍然保持主次关系。

### 用户故事 2 的测试

- [x] T017 [P] [US2] 在 `packages/styles/tests/index.test.ts` 中新增正文、次强调、标题和强强调四档层级的回归测试
- [x] T018 [P] [US2] 在 `packages/styles/tests/theme-outputs.test.ts` 中新增默认主题四档层级映射的输出测试

### 用户故事 2 的实现

- [x] T019 [US2] 在 `packages/styles/src/primitives/index.ts` 中定义正文、次强调、标题和强强调的语义字重层级元数据
- [x] T020 [US2] 在 `packages/styles/src/css/base.css` 与 `apps/website/src/style.css` 中把四档层级应用到标题、正文和紧凑控件文本
- [x] T021 [P] [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 中加入四档字重层级评审样例和回退对照说明
- [x] T022 [P] [US2] 在 `apps/website/src/main.tsx` 中加入面向消费者的四档层级使用说明和示例

**检查点**：此时用户故事 2 应可独立验证，设计师和开发者可以直接在预览面确认字重层级。

---

## Phase 5：用户故事 3 - 处理中西文与数字混排（优先级：P3）

**目标**：确保中文、英文和数字默认跟随同一套思源宋体系内置字形，并为日期、价格、百分比、版本号和等宽例外提供稳定规则。

**独立测试**：查看 Storybook 与 website 的混排示例，确认中文、英文、数字、日期、价格、百分比和版本号无需额外西文字体即可协调显示，同时代码与固定宽度编号仍保持等宽例外。

### 用户故事 3 的测试

- [x] T023 [P] [US3] 在 `packages/styles/tests/theme-outputs.test.ts` 中新增中西文数字混排与平台回退的回归测试
- [x] T024 [P] [US3] 在 `packages/styles/tests/index.test.ts` 中新增等宽例外与混排场景的回归测试

### 用户故事 3 的实现

- [x] T025 [US3] 在 `packages/styles/src/primitives/index.ts` 与 `packages/styles/src/css/base.css` 中固化英文数字跟随思源宋内置字形和 `mono` 例外规则
- [x] T026 [P] [US3] 在 `apps/storybook/src/stories/Button.stories.tsx` 中加入中文、英文、数字、日期、价格、百分比、版本号和等宽例外的评审样例
- [x] T027 [P] [US3] 在 `apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中加入混排指导、平台回退说明和等宽例外展示
- [x] T028 [US3] 在 `packages/styles/README.md` 中补充中西文数字融合策略与 `mono` 例外说明

**检查点**：此时用户故事 3 应可独立验证，中西文与数字混排规则和例外边界都已清晰可评审。

---

## Phase 6：打磨与横切关注点

**目的**：完成跨故事一致性收尾、资产分发复核和最终验证。

- [x] T029 [P] 在 `packages/styles/package.json` 与 `packages/styles/scripts/copy-assets.mjs` 中复核字体资产分发、文件清单和构建输出一致性
- [x] T030 [P] 在 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/website/src/main.tsx` 中统一跨故事评审文案、场景顺序和验收提示
- [x] T031 在 `package.json` 上下文中从仓库根目录运行 `vp check`
- [x] T032 在 `package.json` 上下文中从仓库根目录运行 `vp test`
- [x] T033 在 `apps/storybook/package.json` 与 `apps/website/package.json` 上下文中从仓库根目录运行 `vp run storybook#build` 和 `vp run website#build`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖，可立即开始
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2，是本功能的 MVP
- **Phase 4（US2）**：依赖 US1 提供稳定的默认字体基线
- **Phase 5（US3）**：依赖 US1 提供稳定的默认字体与回退基线，可与 US2 并行
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**：不依赖其他用户故事，是最小可交付范围
- **用户故事 2（P2）**：依赖用户故事 1 已建立统一的默认字体与回退基线
- **用户故事 3（P3）**：依赖用户故事 1 已建立统一的默认字体与回退基线，但不依赖用户故事 2

### 每个用户故事内部顺序

- 先写测试，再落地对应实现
- 先完成 `packages/styles` 内的共享字体逻辑，再更新 Storybook 与 website
- 先固化默认字体和回退规则，再扩展层级和混排示例
- 对外说明必须与对应行为一起落地，不能延后到最后统一补写

### 并行机会

- **准备阶段**：T002、T003、T004 可并行
- **基础阶段**：T006、T007、T008 可在 T005 完成后并行
- **US1**：T010 与 T011 可并行；T015 与 T016 可在 T014 完成后并行
- **US2**：T017 与 T018 可并行；T021 与 T022 可在 T020 完成后并行
- **US3**：T023 与 T024 可并行；T026 与 T027 可在 T025 完成后并行
- **收尾阶段**：T029 与 T030 可并行，然后再执行 T031、T032、T033

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/styles/tests/theme-outputs.test.ts 中新增思源宋默认栈与平台回退顺序的回归测试"
Task: "在 packages/styles/tests/consumer-import.test.ts 与 packages/styles/tests/index.test.ts 中新增默认主题字体入口的导入与使用回归测试"

# 并行推进两个消费面的预览更新
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中加入标题、正文、按钮、表单与数据展示的基线字体评审样例"
Task: "在 packages/styles/README.md、apps/website/src/main.tsx 与 apps/website/src/style.css 中加入默认宋体方向和平台回退说明"
```

## 并行示例：用户故事 2

```bash
# 并行启动用户故事 2 的测试
Task: "在 packages/styles/tests/index.test.ts 中新增正文、次强调、标题和强强调四档层级的回归测试"
Task: "在 packages/styles/tests/theme-outputs.test.ts 中新增默认主题四档层级映射的输出测试"

# 并行更新两个评审面
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中加入四档字重层级评审样例和回退对照说明"
Task: "在 apps/website/src/main.tsx 中加入面向消费者的四档层级使用说明和示例"
```

## 并行示例：用户故事 3

```bash
# 并行启动用户故事 3 的测试
Task: "在 packages/styles/tests/theme-outputs.test.ts 中新增中西文数字混排与平台回退的回归测试"
Task: "在 packages/styles/tests/index.test.ts 中新增等宽例外与混排场景的回归测试"

# 并行更新混排评审面
Task: "在 apps/storybook/src/stories/Button.stories.tsx 中加入中文、英文、数字、日期、价格、百分比、版本号和等宽例外的评审样例"
Task: "在 apps/website/src/main.tsx 与 apps/website/src/style.css 中加入混排指导、平台回退说明和等宽例外展示"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 在 Storybook 与 website 中验证统一默认字体和平台回退
5. 通过后再扩展字重层级与混排规则

### 渐进交付

1. 先稳定字体资产、主题入口、默认栈和平台回退
2. 交付 US1，建立统一的默认宋体方向
3. 交付 US2，建立四档语义字重层级
4. 交付 US3，完善中西文数字融合与 `mono` 例外
5. 最后复核资产分发并执行 workspace 验证

### 并行团队策略

1. 一位工程师负责 `packages/styles/src/` 下的字体资产、主题输出和测试
2. 一位工程师在共享字体基线稳定后负责 `apps/storybook/src/stories/Button.stories.tsx`
3. 一位工程师在共享字体基线稳定后负责 `apps/website/src/main.tsx`、`apps/website/src/style.css` 与 `packages/styles/README.md`

---

## 备注

- 所有验证命令都必须使用 `vp` 工作流
- `packages/styles` 是字体系统的唯一事实来源，`apps/storybook` 与 `apps/website` 只负责评审和展示
- 本功能的最小可交付范围是统一默认字体与平台回退，不包含新的公开 typography token surface
- `mono` 是明确例外角色，任何实现都不能让代码或固定宽度编号被默认宋体方向覆盖
