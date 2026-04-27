# 实施计划：仓库规范统一

**分支**： `20260317-repo-conventions` | **日期**： 2026-03-17 | **规格**： [spec.md](/Users/bytedance/Documents/code/ui/specs/20260317-repo-conventions/spec.md)  
**输入**： 来自 `/specs/20260317-repo-conventions/spec.md` 的功能规格

## 摘要

统一仓库中函数写法、React 组件源码文件、命名规则以及源码与测试共置方式，覆盖共享 packages 的主要开发路径。实现策略是：对可机械检查的规则尽量做仓库级自动化约束；对仍需要人工判断的结构规则，通过根级和 package 级 `AGENTS.md` 提供指导；同时补足预览与测试侧校验，使这些结构规则在评审时可见、可验证。

## 技术上下文

**Language/Version**： TypeScript 5.x、React 19.x 兼容 package API、Node.js 24.14.0 baseline  
**Primary Dependencies**： `vite-plus`、React、Less、Storybook、CSS Modules、monorepo package workspaces  
**Storage**： 文件型源码树和生成出的 package 产物；无持久运行时存储  
**Testing**： `vp test`、共置单测、现有 package / app 测试覆盖，以及 `website` 中的预览验证  
**Target Platform**： 运行于现代浏览器环境的 monorepo UI packages 与 demo apps  
**Project Type**： 含可复用 packages 与 demo apps 的 UI 组件 monorepo  
**Performance Goals**： 贡献者应用规则时不应拖慢常规评审或预览流程；lint 与 check 命令仍应适合日常本地和 CI 使用  
**Constraints**： 必须使用 `vp` 工作流、保持 package 边界、避免未文档化的公开 API 破坏、保留无障碍和预览要求，并且只对可可靠检查的规则做自动化强制  
**Scale/Scope**： 覆盖整个仓库的编写策略，影响根级指导文件以及 `packages/components`、`packages/hooks`、`packages/utils`，同时也影响那些不应继续示范被禁止模式的 demo app 示例

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- 目标 package 边界明确，可复用行为实现在 package 中，而不是只放在 `website`。
  - 通过：计划聚焦共享 packages 与顶层治理文件；`website` 中的改动仅作为对齐工作，而不是规则唯一来源。
- 已列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 与 semver 影响。
  - 通过：本变更不新增运行时组件 API；计划明确要求在文件移动时补充导入面审查。
- 已说明无障碍要求，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：组件预览与评审要求仍在范围内，因此结构清理不能破坏无障碍行为覆盖。
- 已识别 token 与主题系统影响，包括新增或修改的设计 token。
  - 通过：本次不预期新增 token；计划明确要求保持现有 token 与主题行为不变。
- 已规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 的预览或 demo 更新。
  - 通过：验证包括 `vp check`、`vp test` 和有针对性的预览 / demo 校验。

## 项目结构

### 文档（本功能）

```text
specs/20260317-repo-conventions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── repository-governance.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
AGENTS.md
vite.config.ts
apps/
├── website/
│   ├── AGENTS.md
│   └── src/
└── storybook/
    └── AGENTS.md
packages/
├── components/
│   ├── AGENTS.md
│   ├── src/
│   └── tests/
├── hooks/
│   ├── AGENTS.md
│   ├── src/
│   └── tests/
└── utils/
    ├── AGENTS.md
    ├── src/
    └── tests/
```

**结构决策**：该功能横跨仓库治理文件和共享 package 边界，因此规则定义与执行主要落在根级 lint 配置和 agent 指导文件中，而 package 级 `AGENTS.md` 与 package 源码树负责表达 package 层结构要求。`website` 继续作为评审面和示例消费者，但在实现阶段必须停止示范诸如 `createElement` 这类被禁止的模式。

## Phase 0：研究

研究重点是明确每条规则应放在哪一层执行：

1. 哪些规则适合做仓库级 lint 强制，哪些更适合作为文档指导。
2. 对 lint 难以可靠表达的结构规则，如何通过 package `AGENTS.md`、根级 `AGENTS.md` 和评审门禁落地。
3. 如何支持增量采纳，避免一次性高风险地重排整个仓库。

## Phase 1：设计与契约

设计产物将描述受治理实体、贡献者与仓库自动化之间的契约，以及新增或迁移源码单元时的贡献流程。

## 设计后宪章检查

- 目标 package 边界明确，可复用行为实现在 package 中，而不是只放在 `website`。
  - 通过：设计范围覆盖根级治理与共享 package 规范，`website` 仅承担预览和示例对齐。
- 已列出每个受影响 package 的公开 API 变化，包括 props、slots、events、variants 与 semver 影响。
  - 通过：契约要求在移动或重命名 package 文件时检查 API 导入面影响。
- 已说明无障碍要求，包括键盘交互、焦点管理、语义结构与状态行为。
  - 通过：设计将无障碍要求保留在预览、测试和评审义务中。
- 已识别 token 与主题系统影响，包括新增或修改的设计 token。
  - 通过：本次不新增 token 工作；设计文件中明确说明 token 行为保持不变。
- 已规划必要验证：`vp check`、相关 `vp test` 或 `vp run ...` 命令，以及 `website` 的预览或 demo 更新。
  - 通过：quickstart 和契约都要求执行这些验证步骤。

## 复杂度追踪

本次变更没有需要额外论证的宪章违反项。
