# 实施计划：[功能名称]

**分支**：`[###-feature-name]` | **日期**： [日期] | **规格**： [链接]  
**输入**：来自 `/specs/[###-feature-name]/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、
文件路径、协议字段和第三方 API 名称可保留原文。

**说明**：该模板由 `/speckit.plan` 命令填充。执行流程见 `.specify/templates/plan-template.md`。

## 摘要

[从功能规格中提取：主要需求 + 来自 research 的技术方案]

## 技术上下文

<!--
  需要操作：请将本节内容替换为项目的真实技术细节。
  这里的结构仅用于指导迭代过程。
-->

**语言/版本**： [例如 Python 3.11、Swift 5.9、Rust 1.75，或 NEEDS CLARIFICATION]  
**主要依赖**： [例如 FastAPI、UIKit、LLVM，或 NEEDS CLARIFICATION]  
**存储**： [如适用，例如 PostgreSQL、CoreData、files，或 N/A]  
**测试**： [例如 pytest、XCTest、cargo test，或 NEEDS CLARIFICATION]  
**目标平台**： [例如 Linux server、iOS 15+、WASM，或 NEEDS CLARIFICATION]  
**项目类型**： [例如 library/cli/web-service/mobile-app/compiler/desktop-app，或 NEEDS CLARIFICATION]  
**性能目标**： [领域相关，例如 1000 req/s、10k lines/sec、60 fps，或 NEEDS CLARIFICATION]  
**约束**： [领域相关，例如 <200ms p95、<100MB memory、offline-capable，或 NEEDS CLARIFICATION]  
**规模/范围**： [领域相关，例如 10k users、1M LOC、50 screens，或 NEEDS CLARIFICATION]

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界必须明确，可复用行为必须落在 package 中，而不是只存在于 `website`。
- 必须列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 以及 semver 影响。
- 必须说明无障碍预期，包括键盘交互、焦点管理、语义结构与状态行为。
- 必须识别 token 和主题系统影响，包括新增或修改的设计 token。
- 必须规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 中的预览或 demo 更新。
- 必须确认本功能相关的 `spec`、`plan`、`tasks` 及其他 `/specs/` 文档均以简体中文撰写。
- 必须优先采用 Vite+ 的统一构建约定；如保留 package 级专用构建配置，必须在计划中说明默认约定为何不足以及该例外的边界。
- 必须确认新增文件与目录使用 kebab-case 命名；React 组件使用 `.tsx` 文件；函数默认采用箭头函数风格（原则 VI）。
- 交互组件实现必须对照设计系统数值规范（原则 VII）：disabled opacity 0.56、交互过渡 140ms、浮层动效 160ms、焦点环 2px emerald-500，不得随意偏差。

## 项目结构

### 文档（本功能）

```text
specs/[###-feature]/
├── plan.md              # 本文件（/speckit.plan 命令输出）
├── research.md          # Phase 0 输出（/speckit.plan 命令）
├── data-model.md        # Phase 1 输出（/speckit.plan 命令）
├── quickstart.md        # Phase 1 输出（/speckit.plan 命令）
├── contracts/           # Phase 1 输出（/speckit.plan 命令）
└── tasks.md             # Phase 2 输出（/speckit.tasks 命令，不由 /speckit.plan 创建）
```

### 源代码（仓库根目录）

<!--
  需要操作：请将下面的占位树替换为本功能对应的真实目录结构。
  删除未使用选项，并将选中的结构扩展为真实路径（例如 apps/admin、packages/something）。
  最终交付的计划中不要保留 Option 标签。
-->

```text
# [如未使用请删除] Option 1：单项目（默认）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [如未使用请删除] Option 2：Web 应用（检测到 frontend + backend 时）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [如未使用请删除] Option 3：移动端 + API（检测到 iOS/Android 时）
api/
└── [与上方 backend 相同]

ios/ 或 android/
└── [平台特定结构：功能模块、UI 流程、平台测试]
```

**结构决策**： [说明最终选择的结构，标出目标 packages、任何 `website` 预览工作，并引用上方记录的真实目录]

## 复杂度追踪

> **仅当宪章检查存在必须说明的违反项时填写**

| 违反项                    | 为什么需要 | 为什么拒绝更简单的替代方案 |
| ------------------------- | ---------- | -------------------------- |
| [例如第 4 个项目]         | [当前需求] | [为什么 3 个项目不够]      |
| [例如 Repository pattern] | [具体问题] | [为什么直接访问 DB 不够]   |
