# 任务：UI Monorepo Foundation

**输入**：来自 `/specs/20260316-ui-monorepo-foundation/`
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/`、`quickstart.md`

**测试**：根据宪章要求，组件逻辑与用户可见行为必须提供测试。本任务清单同时包含包级测试与预览验证工作。

**组织方式**：任务按用户故事分组，确保每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行，通常表示涉及不同文件且不存在直接依赖
- **[Story]**：该任务所属的用户故事，例如 `US1`、`US2`、`US3`
- 描述中必须包含精确的仓库相对路径

## Phase 1：准备阶段（共享基础设施）

**目的**：为新的 monorepo 布局和包级基线完成仓库准备工作。

- [x] T001 在 `pnpm-workspace.yaml` 和 `package.json` 中更新 workspace 包匹配规则与根任务入口
- [x] T002 [P] 在 `README.md` 中将 starter 仓库说明替换为 monorepo 基础说明
- [x] T003 [P] 在 `apps/website/package.json`、`apps/storybook/package.json`、`packages/hooks/package.json`、`packages/styles/package.json` 与 `packages/components/package.json` 中创建 package 与 app 目录骨架、初始 package manifest 及 TypeScript 配置
- [x] T004 [P] 在 `.nvmrc` 和 `AGENTS.md` 中对齐新的 monorepo 基线所需的根环境元信息

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的共享包基础设施与样式基础设施。

**⚠️ 关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T005 在 `packages/utils/README.md`、`packages/hooks/README.md`、`packages/styles/README.md` 与 `packages/components/README.md` 中定义包边界说明和包级 README 基线
- [x] T006 [P] 在 `vite.config.ts`、`packages/utils/vite.config.ts`、`packages/hooks/vite.config.ts`、`packages/styles/vite.config.ts` 与 `packages/components/vite.config.ts` 中更新根级与包级 Vite+ 配置，以支持新的 packages 和 apps
- [x] T007 [P] 在 `tsconfig.json`、`apps/website/tsconfig.json`、`apps/storybook/tsconfig.json`、`packages/hooks/tsconfig.json`、`packages/styles/tsconfig.json` 与 `packages/components/tsconfig.json` 中建立新的包与应用共享的 TypeScript 配置结构基线
- [x] T008 在 `packages/utils/package.json`、`packages/hooks/package.json`、`packages/styles/package.json` 与 `packages/components/package.json` 中建立可复用基础能力所需的包导出和依赖方向
- [x] T009 [P] 在 `packages/hooks/tests/index.test.ts`、`packages/styles/tests/index.test.ts` 与 `packages/components/tests/index.test.ts` 中新增面向新包骨架的自动化验证基线
- [x] T010 [P] 在 `apps/website/src/main.ts` 与 `apps/storybook/.storybook/main.ts` 中定义 website 与 Storybook 的应用壳入口，确保它们消费 packages 而不是承载可复用逻辑
- [x] T011 在 `specs/20260316-ui-monorepo-foundation/quickstart.md` 中记录并说明基础阶段共享验证命令

**检查点**：基础能力已就绪，用户故事可以并行展开实现。

---

## Phase 3：用户故事 1 - 建立清晰的包边界（优先级：P1）🎯 MVP

**目标**：让仓库结构和各 package 的职责边界清晰明确，为后续工作提供稳定归属。

**独立测试**：实现后审查仓库，确认每类职责只归属于一个 package 或 app，不存在重复所有权，并且依赖方向有明确文档说明。

### 用户故事 1 的测试（必需）⚠️

- [x] T012 [P] [US1] 在 `packages/components/tests/workspace-boundaries.test.ts` 中新增针对预期 workspace package 的边界验证测试
- [x] T013 [P] [US1] 在 `packages/utils/tests/repo-structure.test.ts` 中新增针对 app 与 package 存在性的仓库结构冒烟测试

### 用户故事 1 的实现

- [x] T014 [P] [US1] 将当前 website 应用迁移到 `apps` 布局，并更新 `apps/website/package.json` 与 `apps/website/index.html` 中的 package 元信息
- [x] T015 [P] [US1] 将当前 website 的源码和公共静态资源迁移到 `apps/website/src/main.ts`、`apps/website/src/style.css` 与 `apps/website/public/icons.svg`
- [x] T016 [P] [US1] 在 `packages/hooks/src/index.ts` 与 `packages/hooks/tests/index.test.ts` 中建立可复用 hooks 包的基础结构
- [x] T017 [P] [US1] 在 `packages/components/src/index.ts` 与 `packages/components/tests/index.test.ts` 中建立可复用组件包的基础结构
- [x] T018 [P] [US1] 在 `packages/utils/src/index.ts` 与 `packages/utils/tests/index.test.ts` 中将 utilities 包规范为与框架无关的职责范围
- [x] T019 [US1] 在 `README.md` 与 `apps/website/src/main.ts` 中记录 package 与 app 的职责边界以及依赖方向

**检查点**：当仓库已明确区分可复用 package 与可运行 app，并且该边界可被文档化、可被测试验证时，用户故事 1 完成。

---

## Phase 4：用户故事 2 - 建立可控的主题系统（优先级：P2）

**目标**：提供稳定的默认设计语言，包含显式的全局样式导入、公开的颜色主题 token，以及明暗主题输出。

**独立测试**：导入文档中规定的样式入口，渲染组件预览，切换亮色与暗色主题模式，并验证允许公开覆盖的品牌颜色不会影响布局或未公开的内部实现。

### 用户故事 2 的测试（必需）⚠️

- [x] T020 [P] [US2] 在 `packages/styles/tests/theme-outputs.test.ts` 中新增 token 与主题输出测试
- [x] T021 [P] [US2] 在 `packages/styles/tests/consumer-import.test.ts` 中新增针对显式全局样式导入的消费端接入验证

### 用户故事 2 的实现

- [x] T022 [P] [US2] 在 `packages/styles/src/primitives/index.ts`、`packages/styles/src/semantics/index.ts` 与 `packages/styles/src/themes/index.ts` 中建立内部 token 与公开主题 token 的 TypeScript 源文件
- [x] T023 [P] [US2] 在 `packages/styles/src/index.ts` 与 `packages/styles/tsdown.config.ts` 中建立样式生成工具与包导出
- [x] T024 [P] [US2] 在 `packages/styles/src/css/reset.css`、`packages/styles/src/css/base.css`、`packages/styles/src/css/theme.css`、`packages/styles/src/css/theme-light.css` 与 `packages/styles/src/css/theme-dark.css` 中新增全局样式入口和主题输出
- [x] T025 [P] [US2] 在 `packages/styles/src/less/bridge.less` 与 `packages/styles/src/less/mixins.less` 中新增供组件作者使用的 Less bridge 与 mixin 入口
- [x] T026 [US2] 在 `packages/styles/README.md` 与 `apps/website/src/main.ts` 中定义公开主题能力边界以及显式消费导入方式
- [x] T027 [US2] 在 `packages/components/src/index.ts` 与 `packages/components/package.json` 中接入样式依赖，并暴露根级自定义契约

**检查点**：当消费方拥有清晰文档化的样式入口、精简且公开的颜色主题表面，以及可正常工作的亮色/暗色输出时，用户故事 2 完成。

---

## Phase 5：用户故事 3 - 将公开文档与内部开发工具分离（优先级：P3）

**目标**：让 `apps/website` 承担公开文档与精选示例展示，让 `apps/storybook` 退回到内部状态评审工具角色。

**独立测试**：检查两个应用，确认 website 提供正式的安装与主题说明以及精选示例，而 Storybook 仅保留面向开发与评审的 stories，不再承载完整公开文档。

### 用户故事 3 的测试（必需）⚠️

- [x] T028 [P] [US3] 在 `apps/website/tests/docs-smoke.test.ts` 中新增面向安装与主题章节的 website 文档冒烟测试
- [x] T029 [P] [US3] 在 `apps/storybook/tests/story-scope.test.ts` 中新增面向内部评审 stories 范围的 Storybook 冒烟测试

### 用户故事 3 的实现

- [x] T030 [P] [US3] 在 `apps/website/src/main.ts` 与 `apps/website/src/style.css` 中构建公开文档结构和精选示例内容
- [x] T031 [P] [US3] 在 `apps/website/src/main.ts` 与 `apps/website/src/counter.ts` 中为 website 增加主题切换与精选预览覆盖
- [x] T032 [P] [US3] 在 `apps/storybook/.storybook/main.ts`、`apps/storybook/.storybook/preview.ts` 与 `apps/storybook/src/stories/Button.stories.tsx` 中建立内部 Storybook 配置和初始 stories
- [x] T033 [US3] 在 `README.md` 与 `apps/storybook/README.md` 中记录 website 与 Storybook 的职责分工

**检查点**：当公开说明集中在 website，且 Storybook 专注于内部评审与验证时，用户故事 3 完成。

---

## Phase 6：收尾与跨故事事项

**目的**：完成一致性整理、迁移清理与跨故事验证。

- [x] T034 [P] 在 `website/package.json`、`website/src/main.ts` 与 `website/src/style.css` 中移除已被 `apps` 布局替代的过时根级 website 文件与 starter 资源
- [x] T035 [P] 在 `packages/utils/package.json`、`packages/hooks/package.json`、`packages/styles/package.json` 与 `packages/components/package.json` 中对齐包元信息、脚本和面向发布的文档
- [x] T036 在 `specs/20260316-ui-monorepo-foundation/quickstart.md` 中记录执行 `vp check`、`vp test` 与相关 `vp run` 应用命令后的完整 monorepo 验证结果及后续备注

---

## 依赖与执行顺序

### 阶段依赖

- **准备阶段（Phase 1）**：无依赖，可立即开始
- **基础阶段（Phase 2）**：依赖准备阶段完成，并阻塞所有用户故事
- **用户故事 1（Phase 3）**：依赖基础阶段完成，是 MVP
- **用户故事 2（Phase 4）**：依赖基础阶段完成，并受益于用户故事 1 提供的包结构
- **用户故事 3（Phase 5）**：依赖基础阶段完成，并使用用户故事 1 与用户故事 2 的输出
- **收尾阶段（Phase 6）**：依赖所有目标用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**：基础阶段完成后即可开始，不依赖其他故事
- **用户故事 2（P2）**：基础阶段完成后即可开始，但应建立在用户故事 1 提供的包结构之上
- **用户故事 3（P3）**：基础阶段完成后即可开始，并使用用户故事 1 与用户故事 2 提供的包与主题基础

### 每个用户故事内部顺序

- 测试应先于实现创建，并在实现完成前先处于失败状态
- package manifest 与 exports 应先落地，再进行更高层的 app 集成
- 主题基础应先完成，再推进组件与 website 的主题消费
- 应用内容应先完成，再补充最终职责说明文档

### 并行机会

- T002、T003 与 T004 可在准备阶段并行执行
- T006、T007、T009 与 T010 可在基础阶段并行执行
- 在用户故事 1 中，T014 到 T018 可在边界测试建立后并行执行
- 在用户故事 2 中，T022 到 T025 可在文档与包集成前并行执行
- 在用户故事 3 中，T030 到 T032 可在职责说明编写前并行执行

---

## 并行示例：用户故事 2

```bash
# 并行启动用户故事 2 的测试任务
Task: "在 packages/styles/tests/theme-outputs.test.ts 中新增 token 与主题输出测试"
Task: "在 packages/styles/tests/consumer-import.test.ts 中新增针对显式全局样式导入的消费端接入验证"

# 并行启动用户故事 2 的实现任务
Task: "在 packages/styles/src/primitives/index.ts、packages/styles/src/semantics/index.ts 与 packages/styles/src/themes/index.ts 中建立 TypeScript token 源文件"
Task: "在 packages/styles/src/css/reset.css、base.css、theme.css、theme-light.css 与 theme-dark.css 中新增全局样式入口和主题输出"
Task: "在 packages/styles/src/less/bridge.less 与 packages/styles/src/less/mixins.less 中新增 Less bridge 与 mixin 入口"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 验证仓库边界、包所有权与依赖方向
5. 如有需要，可在此暂停，并基于稳定的 monorepo 基础继续推进组件工作

### 渐进交付

1. 先交付 package 与 app 的边界划分
2. 第二步交付可控的主题与样式基础设施
3. 第三步交付 website 与 Storybook 的职责分离
4. 最后完成清理、验证与过时文件移除

### 并行团队策略

如果有多位开发者协作：

1. 一位开发者负责 workspace 与 package manifest
2. 一位开发者负责样式系统与主题输出
3. 一位开发者在共享基础落地后负责 website 与 Storybook 的应用界面

---

## 备注

- 所有任务都遵循要求的清单格式，并包含精确的仓库相对路径
- 验证流程仅允许使用 `vp` 命令
- website 预览工作是用户可见基础能力的一部分，不能省略
- Storybook 被视为内部应用界面，而不是主要的公开文档系统
