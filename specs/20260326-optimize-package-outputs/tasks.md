# 任务：包构建与发布产物治理

**输入**：来自 `/specs/20260326-optimize-package-outputs/` 的设计文档  
**前置条件**：plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/  
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章，组件逻辑与用户可见行为必须有测试。生成的任务包含自动化测试与预览更新。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（例如 US1、US2、US3）
- 描述中必须包含准确文件路径

## 路径约定

- Monorepo 包：`packages/<name>/...`
- 预览应用：`apps/website/...`、`apps/storybook/...`
- 规格文档：`specs/20260326-optimize-package-outputs/...`

## Phase 1：准备（共享基础设施）

**目的**：建立跨包发布契约和组件子路径契约的共享实现基座

- [x] T001 在 `packages/utils/src/package-manifest/index.ts` 创建发布清单归一化工具单元
- [x] T002 [P] 在 `packages/utils/src/index.ts` 导出 `packages/utils/src/package-manifest/index.ts` 的共享发布工具
- [x] T003 [P] 在 `packages/utils/tests/publish-contract.test.ts` 建立跨包发布清单契约测试基座
- [x] T004 [P] 在 `packages/components/tests/subpath-entrypoint.test.ts` 建立组件子路径导出契约测试基座

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事共用的构建约束、例外边界和预览壳

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

- [x] T005 在 `packages/components/package.json` 与 `packages/components/vite.config.ts` 定义组件子路径导出和样式交付的基础构建约束
- [x] T006 [P] 在 `packages/hooks/vite.config.ts` 与 `packages/utils/vite.config.ts` 建立默认 Vite+ pack 约定基线
- [x] T007 [P] 在 `packages/icons/vite.config.ts` 与 `packages/styles/vite.config.ts` 标注允许保留的多入口和资产复制例外边界
- [x] T008 在 `apps/storybook/src/stories/Button.stories.tsx` 与 `apps/storybook/src/stories/Typography.stories.tsx` 建立根入口与子路径入口的共享预览壳

**检查点**：基础阶段完成后，US1、US2、US3 可以按优先级独立推进

---

## Phase 3：用户故事 1 - 直接按组件消费（优先级：P1）🎯 MVP

**目标**：让消费者可以直接通过单组件入口导入 `@deweyou-ui/components` 的公开组件，并在不额外导入组件样式入口的情况下正常使用

**独立测试**：仅通过 `@deweyou-ui/components/<component-name>` 接入组件，验证组件可渲染、样式完整，且根入口 `@deweyou-ui/components` 仍保持兼容

### 用户故事 1 的测试（必需）⚠️

- [x] T009 [P] [US1] 在 `packages/components/tests/subpath-entrypoint.test.ts` 编写组件子路径导出与根入口兼容测试
- [x] T010 [P] [US1] 在 `packages/styles/tests/consumer-import.test.ts` 编写单组件消费无需额外样式导入的回归测试

### 用户故事 1 的实现

- [x] T011 [P] [US1] 在 `packages/components/src/button/index.tsx`、`packages/components/src/popover/index.tsx`、`packages/components/src/text/index.tsx` 落实公开子路径实现入口
- [x] T012 [US1] 在 `packages/components/src/index.ts` 与 `packages/components/package.json` 补充根入口兼容和子路径 `exports`
- [x] T013 [US1] 在 `packages/components/vite.config.ts` 与 `packages/components/tsconfig.build.json` 实现 `preserveModules` 和 CSS split 产物规则
- [x] T014 [US1] 在 `apps/storybook/src/stories/Button.stories.tsx`、`apps/storybook/src/stories/Popover.stories.tsx`、`apps/storybook/src/stories/Typography.stories.tsx` 补充单组件入口消费示例

**检查点**：此时 US1 应可独立交付，消费者仅导入目标组件入口即可获得完整组件能力

---

## Phase 4：用户故事 2 - 统一包级构建约定（优先级：P2）

**目标**：让拟发布包默认复用 Vite+ 统一构建约定，只为明确的多入口、样式资产、发布产物要求或仓库治理文档语言统一保留必要改动

**独立测试**：逐个审查 `packages/` 下受影响包的构建配置和仓库自有 `AGENTS.md`，确认每个包都能被判定为“默认约定”或“有明确理由的例外”，且团队参考文档正文统一为简体中文

### 用户故事 2 的测试（必需）⚠️

- [x] T015 [P] [US2] 在 `packages/utils/tests/repo-conventions.test.ts` 编写“默认复用 Vite+ 约定”治理规则测试
- [x] T016 [P] [US2] 在 `packages/components/tests/workspace-boundaries.test.ts` 编写例外包原因和默认包收敛边界测试
- [x] T017 [P] [US2] 在 `packages/utils/tests/repo-conventions.test.ts` 编写仓库自有 `AGENTS.md` 简体中文化范围测试

### 用户故事 2 的实现

- [x] T018 [P] [US2] 在 `packages/hooks/vite.config.ts` 与 `packages/hooks/package.json` 收敛 hooks 包到默认 Vite+ pack 流程
- [x] T019 [P] [US2] 在 `packages/utils/vite.config.ts`、`packages/utils/package.json`、`packages/utils/tsdown.config.ts` 收敛 utils 包配置并移除冗余代理层
- [x] T020 [US2] 在 `packages/styles/vite.config.ts`、`packages/styles/tsdown.config.ts`、`packages/styles/scripts/copy-assets.mjs` 仅保留样式资产复制所需的例外行为
- [x] T021 [US2] 在 `packages/icons/vite.config.ts` 与 `packages/components/vite.config.ts` 仅保留多入口和组件样式交付所需的例外行为
- [x] T022 [P] [US2] 在 `AGENTS.md`、`apps/storybook/AGENTS.md`、`apps/website/AGENTS.md` 完成仓库级与 app 级 AGENTS 文档中文化
- [x] T023 [P] [US2] 在 `packages/components/AGENTS.md`、`packages/hooks/AGENTS.md`、`packages/icons/AGENTS.md`、`packages/styles/AGENTS.md`、`packages/utils/AGENTS.md` 完成 package 级 AGENTS 文档中文化
- [x] T024 [US2] 在 `packages/styles/README.md` 与 `apps/website/src/main.tsx` 记录统一构建约定、例外边界和 AGENTS 文档语言规则

**检查点**：此时 US2 应可独立交付，维护者可以快速判断任何一个包是否真的需要保留专用构建配置，且仓库自有 AGENTS 文档已统一为简体中文

---

## Phase 5：用户故事 3 - 发布时输出可安装依赖契约（优先级：P3）

**目标**：让所有拟发布包在最终产物中对外呈现可安装的依赖清单，并把 React 运行时明确交给宿主安装

**独立测试**：审查受影响包的最终清单，确认 `react`/`react-dom` 已转为宿主安装契约，内部依赖被解析为明确版本范围，且不再暴露 `workspace:*` 或 `catalog:`

### 用户故事 3 的测试（必需）⚠️

- [x] T025 [P] [US3] 在 `packages/utils/tests/publish-contract.test.ts` 编写 React peer/runtime 分类测试
- [x] T026 [P] [US3] 在 `packages/styles/tests/theme-outputs.test.ts` 编写最终发布清单版本解析测试

### 用户故事 3 的实现

- [x] T027 [P] [US3] 在 `packages/components/package.json`、`packages/hooks/package.json`、`packages/icons/package.json` 将 React 运行时要求调整为 `peerDependencies`
- [x] T028 [P] [US3] 在 `packages/styles/package.json` 与 `packages/utils/package.json` 归并运行时依赖、开发依赖和发布字段
- [x] T029 [US3] 在 `packages/styles/scripts/copy-assets.mjs` 与 `packages/utils/src/package-manifest/index.ts` 实现发布时的清单重写和版本解析逻辑
- [x] T030 [US3] 在 `packages/components/package.json`、`packages/hooks/package.json`、`packages/icons/package.json`、`packages/styles/package.json`、`packages/utils/package.json` 应用内部包依赖的对外版本策略
- [x] T031 [US3] 在 `packages/styles/README.md` 与 `apps/website/src/main.tsx` 更新宿主安装责任和发布检查说明

**检查点**：此时 US3 应可独立交付，拟发布包的最终清单能够被外部宿主直接安装和理解

---

## Phase 6：打磨与横切关注点

**目的**：补齐跨故事回归覆盖并完成最终验证

- [x] T032 [P] 在 `packages/components/tests/package-entrypoint.test.ts` 与 `packages/utils/tests/publish-contract.test.ts` 补齐根入口、子路径入口和发布契约的综合回归覆盖
- [x] T033 在 `package.json` 所在工作区运行 `vp check`、`vp test`、`vp run build -r` 完成最终验证

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1**：无依赖，可立即开始
- **Phase 2**：依赖 Phase 1 完成，并阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2 完成，是建议的 MVP 范围
- **Phase 4（US2）**：依赖 Phase 2 完成，可在 US1 之后或与其并行推进
- **Phase 5（US3）**：依赖 Phase 2 完成，可在 US1 之后或与其并行推进
- **Phase 6**：依赖目标用户故事完成

### 用户故事依赖

- **US1**：基础阶段完成后即可开始，不依赖 US2 或 US3
- **US2**：基础阶段完成后即可开始，不依赖 US1 或 US3 的业务结果
- **US3**：基础阶段完成后即可开始，但建议在 US1 明确组件入口契约后落地最终清单规则

### 每个用户故事内部顺序

- 先写测试并确保测试先失败
- 再修改 package 构建和清单实现
- 然后补预览、文档或宿主说明
- 当前故事通过独立测试后，再进入下一优先级故事

## 并行机会

- Phase 1 中的 T002、T003、T004 可并行
- Phase 2 中的 T006、T007 可并行
- US1 中的 T009、T010 可并行，T011 可与测试并行准备
- US2 中的 T015、T016、T017、T018、T019、T022、T023 可并行
- US3 中的 T025、T026、T027、T028 可并行
- Phase 6 中的 T032 可在最终命令验证前单独推进

## 并行示例：用户故事 1

```bash
# 同时启动 US1 测试
Task: "在 packages/components/tests/subpath-entrypoint.test.ts 编写组件子路径导出与根入口兼容测试"
Task: "在 packages/styles/tests/consumer-import.test.ts 编写单组件消费无需额外样式导入的回归测试"

# 同时启动 US1 的子路径入口实现
Task: "在 packages/components/src/button/index.ts、packages/components/src/popover/index.ts、packages/components/src/text/index.ts 创建公开子路径入口"
Task: "在 packages/components/src/index.ts 与 packages/components/package.json 补充根入口兼容和子路径 exports"
```

## 并行示例：用户故事 2

```bash
# 同时启动 US2 测试
Task: "在 packages/utils/tests/repo-conventions.test.ts 编写默认复用 Vite+ 约定治理规则测试"
Task: "在 packages/components/tests/workspace-boundaries.test.ts 编写例外包原因和默认包收敛边界测试"
Task: "在 packages/utils/tests/repo-conventions.test.ts 编写仓库自有 AGENTS.md 简体中文化范围测试"

# 同时推进 US2 的治理文档与默认约定收敛
Task: "在 packages/hooks/vite.config.ts 与 packages/hooks/package.json 收敛 hooks 包到默认 Vite+ pack 流程"
Task: "在 packages/utils/vite.config.ts、packages/utils/package.json、packages/utils/tsdown.config.ts 收敛 utils 包配置并移除冗余代理层"
Task: "在 AGENTS.md、apps/storybook/AGENTS.md、apps/website/AGENTS.md 完成仓库级与 app 级 AGENTS 文档中文化"
Task: "在 packages/components/AGENTS.md、packages/hooks/AGENTS.md、packages/icons/AGENTS.md、packages/styles/AGENTS.md、packages/utils/AGENTS.md 完成 package 级 AGENTS 文档中文化"
```

## 并行示例：用户故事 3

```bash
# 同时启动 US3 测试
Task: "在 packages/utils/tests/publish-contract.test.ts 编写 React peer/runtime 分类测试"
Task: "在 packages/styles/tests/theme-outputs.test.ts 编写最终发布清单版本解析测试"

# 同时整理 package manifests
Task: "在 packages/components/package.json、packages/hooks/package.json、packages/icons/package.json 将 React 运行时要求调整为 peerDependencies"
Task: "在 packages/styles/package.json 与 packages/utils/package.json 归并运行时依赖、开发依赖和发布字段"
```

## 实施策略

### MVP 优先

1. 先完成 Phase 1 和 Phase 2，建立共享测试基座和构建约束
2. 优先交付 US1，先让单组件入口和样式自带能力成立
3. 只有在 US1 独立测试通过后，再推进 US2 和 US3

### 增量交付

1. 完成 US1 后即可向消费者演示单组件直接导入体验
2. 完成 US2 后即可向维护者演示默认构建约定、例外边界和 AGENTS 文档语言统一
3. 完成 US3 后即可进行最终的发布清单审查和外部安装验证

### 完成定义

- 每个用户故事都有对应的自动化测试和明确检查点
- 每个任务都带有精确文件路径并可直接执行
- 最终以 `vp check`、`vp test`、`vp run build -r` 作为收尾验证
