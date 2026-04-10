---
description: '功能实现任务清单模板'
---

# 任务：[功能名称]

**输入**：来自 `/specs/[###-feature-name]/` 的设计文档  
**前置条件**：plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；
代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章，组件逻辑与用户可见行为必须有测试。生成的任务必须包含适用的自动化测试与预览更新。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（例如 US1、US2、US3）
- 描述中必须包含准确文件路径

## 路径约定

- **单项目**：仓库根目录下的 `src/`、`tests/`
- **Web 应用**：`backend/src/`、`frontend/src/`
- **移动端**：`api/src/`、`ios/src/` 或 `android/src/`
- 下方展示的路径默认按单项目结构书写，请根据 plan.md 的真实结构调整

<!--
  ============================================================================
  重要：下面的任务仅为说明格式的示例。

  /speckit.tasks 命令必须根据以下内容替换成真实任务：
  - spec.md 中的用户故事（含其优先级 P1、P2、P3...）
  - plan.md 中的功能需求
  - data-model.md 中的实体
  - contracts/ 中的接口或契约

  任务必须按用户故事组织，以便每个故事都可以：
  - 独立实现
  - 独立测试
  - 作为 MVP 增量交付

  不要在最终生成的 tasks.md 中保留这些示例任务。
  ============================================================================
-->

## Phase 1：准备（共享基础设施）

**目的**：初始化项目并建立基础结构

- [ ] T001 按实施计划创建项目结构
- [ ] T002 使用 [framework] 依赖初始化 [language] 项目
- [ ] T003 [P] 配置 lint 和格式化工具
- [ ] T004 [P] 识别受影响 package 的 entrypoint 和 `website` 预览路径

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都依赖的核心基础设施

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

基础任务示例（请按项目实际情况调整）：

- [ ] T005 定义共享 token、主题原语或样式钩子
- [ ] T006 [P] 建立组件 API 契约与 package 导出
- [ ] T007 [P] 搭建无障碍辅助能力、测试工具或交互测试基座
- [ ] T008 创建所有故事都依赖的基础 primitive、hook 或 utility
- [ ] T009 配置 `website` 中的预览路由或 demo 外壳
- [ ] T010 使用 `vp` 配置校验命令和 workspace 任务串联

**检查点**：基础阶段完成后，用户故事即可并行实现

---

## Phase 3：用户故事 1 - [标题]（优先级：P1）🎯 MVP

**目标**： [简要描述该故事交付的内容]

**独立测试**： [如何单独验证该故事]

### 用户故事 1 的测试（必需）⚠️

> **注意：先写这些测试，并确保它们在实现前失败**

- [ ] T011 [P] [US1] 在 [package]/tests/[name].test.ts 中编写组件逻辑单测
- [ ] T012 [P] [US1] 在 [package]/tests/[name].test.ts 中编写用户旅程交互/集成测试

### 用户故事 1 的实现

- [ ] T013 [P] [US1] 在 [package]/src/[file].ts 中实现 package API 面
- [ ] T014 [P] [US1] 在 [package]/src/[file].css.ts 中实现组件样式或 token
- [ ] T015 [US1] 在 [package]/src/[file].tsx 中实现无障碍交互和状态处理
- [ ] T016 [US1] 在 website/src/[file].tsx 中为主要状态补充 `website` 预览
- [ ] T017 [US1] 为受影响 package API 补充使用文档和 semver 说明

**检查点**：此时用户故事 1 应可独立运行并可测试

---

## Phase 4：用户故事 2 - [标题]（优先级：P2）

**目标**： [简要描述该故事交付的内容]

**独立测试**： [如何单独验证该故事]

### 用户故事 2 的测试（必需）⚠️

- [ ] T018 [P] [US2] 在 [package]/tests/[name].test.ts 中编写组件逻辑单测
- [ ] T019 [P] [US2] 在 [package]/tests/[name].test.ts 中编写用户旅程交互/集成测试

### 用户故事 2 的实现

- [ ] T020 [P] [US2] 在 [package]/src/[file].ts 中扩展 package API 或 variants
- [ ] T021 [US2] 在 [package]/src/[file].tsx 中实现 UI 行为
- [ ] T022 [US2] 在 [package]/src/[file].ts 中补充主题、token 或样式更新
- [ ] T023 [US2] 更新 `website` 预览和使用文档

**检查点**：此时用户故事 1 和 2 都应可独立工作

---

## Phase 5：用户故事 3 - [标题]（优先级：P3）

**目标**： [简要描述该故事交付的内容]

**独立测试**： [如何单独验证该故事]

### 用户故事 3 的测试（必需）⚠️

- [ ] T024 [P] [US3] 在 [package]/tests/[name].test.ts 中编写组件逻辑单测
- [ ] T025 [P] [US3] 在 [package]/tests/[name].test.ts 中编写用户旅程交互/集成测试

### 用户故事 3 的实现

- [ ] T026 [P] [US3] 在 [package]/src/[file].ts 中实现可复用 primitive 或 hook
- [ ] T027 [US3] 在 [package]/src/[file].tsx 中实现组件或组合行为
- [ ] T028 [US3] 更新 `website` demo 和 package 文档

**检查点**：此时所有用户故事都应可独立运行

---

[如有更多用户故事，可继续按相同模式补充]

---

## Phase N：打磨与横切关注点

**目的**：处理影响多个用户故事的改进项

- [ ] TXXX [P] 更新 docs/ 中的文档
- [ ] TXXX 清理与重构代码
- [ ] TXXX 跨所有故事做性能优化
- [ ] TXXX [P] 增补边界状态、无障碍和回归覆盖
- [ ] TXXX 安全加固
- [ ] TXXX 运行 `vp check` 以及相关 `vp test` 或 `vp run ...` 验证
- [ ] TXXX [P] 对照宪章原则 VII 核查设计系统数值（disabled 0.56、过渡 140ms、浮层 160ms、焦点环 2px）
- [ ] TXXX [P] 确认文件命名 kebab-case、组件使用 `.tsx`、函数为箭头函数风格（原则 VI）

### Storybook（新增组件必填）

> 宪章原则 IV 要求：新增组件必须同步创建 Storybook story 文件。

- [ ] TXXX 在 `apps/storybook/src/stories/<ComponentName>.stories.tsx` 中创建 story 文件：
  - `meta` 中声明所有文档化 props 的 `argTypes`
  - 为每个主要状态/变体创建独立 story（Basic、Color、Size 等）
  - 新增 prop 时同步在 `Basic` story 的 `args` 中声明默认值
- [ ] TXXX 在 `Interaction` story 中补充 `play` 函数，按 `testing-standards.md` E2E 规范覆盖：
  - 组件渲染正确（关键 DOM 结构、data attribute）
  - 新增 prop 的行为断言（如 `autoHide` → `data-auto-hide` 属性存在）
  - 无状态变化的展示组件至少覆盖 E2E-P-01

---

## 依赖与执行顺序

### 阶段依赖

- **准备阶段（Phase 1）**：无依赖，可立即开始
- **基础阶段（Phase 2）**：依赖准备阶段完成，并阻塞所有用户故事
- **用户故事阶段（Phase 3+）**：都依赖基础阶段完成
  - 若团队资源允许，可并行推进
  - 或按优先级顺序串行推进（P1 -> P2 -> P3）
- **打磨阶段（最终阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **用户故事 1（P1）**：基础阶段完成后即可开始，不依赖其他故事
- **用户故事 2（P2）**：基础阶段完成后即可开始，可能与 US1 集成，但必须可独立测试
- **用户故事 3（P3）**：基础阶段完成后即可开始，可能与 US1/US2 集成，但必须可独立测试

### 每个用户故事内部顺序

- 测试必须先写，并在实现前失败
- 共享 API 和 token 先于更高层组件
- package 实现先于 `website` 预览集成
- 核心实现先于文档打磨
- 当前故事完成后再进入下一个优先级

### 并行机会

- 所有标记为 [P] 的准备阶段任务都可并行
- 所有标记为 [P] 的基础阶段任务都可并行（限 Phase 2 内）
- 基础阶段完成后，所有用户故事都可并行开始（若团队容量允许）
- 同一用户故事下标记为 [P] 的测试任务可并行
- 同一故事中标记为 [P] 的 package 任务可并行
- 不同用户故事可由不同成员并行推进

---

## 并行示例：用户故事 1

```bash
# 同时启动用户故事 1 的所有测试：
Task: "在 [package]/tests/[name].test.ts 中编写组件逻辑单测"
Task: "在 [package]/tests/[name].test.ts 中编写用户旅程交互测试"

# 同时启动用户故事 1 的 package 任务：
Task: "在 [package]/src/[file].ts 中实现 package API 面"
Task: "在 [package]/src/[file].ts 中实现组件样式或 token"
```

---
