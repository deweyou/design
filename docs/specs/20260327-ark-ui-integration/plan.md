# 实施计划：引入 Ark UI 作为组件库基础层

**分支**：`20260327-ark-ui-integration` | **日期**：2026-03-27 | **规格**：[spec.md](./spec.md)
**输入**：来自 `/specs/20260327-ark-ui-integration/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

---

## 摘要

本计划将 `@ark-ui/react` 引入为 `packages/components` 的行为基础层，并将现有 `popover` 组件的内部实现从自行基于 `@floating-ui/react` 的方式迁移至 Ark UI 原语驱动。公开 API 保持完全向后兼容，设计风格与视觉表现不变。同时，本次变更将在 AGENTS.md 和宪章中明确 Ark UI 作为后续交互型组件开发范式的地位。

**关键架构决策（来自 research.md）**：

- `trigger: 'click'`（默认）：使用 Ark UI 原生 `<Popover.Trigger>`，获得最完整无障碍支持
- `trigger: 'hover' | 'focus' | 'context-menu'`：使用 Ark UI 受控模式（`open` prop 外部驱动）+ 自定义事件监听器；Ark UI 仍负责内容渲染、定位、ARIA 和焦点管理
- 样式层零变化：继续使用 CSS Modules（Less）+ 自定义 data 属性驱动

---

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x、Node.js 24.14.0
**主要依赖**：`@ark-ui/react`（新增）、`@floating-ui/react`（待评估是否可移除）、`classnames`、`vite-plus`、Less
**存储**：N/A
**测试**：`vp test`（Vitest + jsdom，现有测试套件维持覆盖）
**目标平台**：Web 组件库（browser），monorepo package
**项目类型**：library（React UI 组件库）
**性能目标**：组件渲染与现有版本无可感知差异；Ark UI 按需导入，无全量打包
**约束**：公开 API 向后兼容（无 breaking change）；样式/视觉与现有完全一致
**规模/范围**：1 个组件迁移（popover），2 个规范文件更新（AGENTS.md、宪章）

---

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后已重新检查。_

- ✅ **目标 package 边界明确**：变更范围为 `packages/components`（popover 子目录）；样式/token 来自 `@deweyou-ui/styles`；行为层引入 `@ark-ui/react` 作为依赖，不在 website 中实现可复用能力
- ✅ **公开 API 变化已列出**：详见 `contracts/popover-api.md`；无 breaking change，semver patch 影响
- ✅ **无障碍预期已说明**：ARIA 由 Ark UI 原生管理；键盘行为（Escape、Tab、焦点归还）通过 Ark UI + 自定义逻辑覆盖；见 spec.md FR-007
- ✅ **Token/主题影响已识别**：无新增 token；继续复用现有 `@deweyou-ui/styles` token；`@floating-ui/react` 如移除需确认无间接 token 影响
- ✅ **验证计划已规划**：`vp check`（类型 + lint）、`vp test packages/components`（单测回归）、`vp run build -r`（构建验证）、website 目视评审
- ✅ **文档语言合规**：本文件及所有同级 `/specs/` 文档以简体中文撰写
- ✅ **构建约定**：`packages/components` 保持现有 Vite+ 统一约定，无新增 package 级构建配置

---

## 项目结构

### 文档（本功能）

```text
specs/20260327-ark-ui-integration/
├── plan.md              # 本文件
├── spec.md              # 功能规格
├── research.md          # Phase 0 调研输出
├── data-model.md        # Phase 1 数据/状态模型
├── quickstart.md        # Phase 1 快速上手
├── contracts/
│   └── popover-api.md   # Phase 1 公开 API 契约
└── checklists/
    └── requirements.md  # 规格质量校验
```

### 源代码（受影响文件）

```text
packages/components/
├── package.json                        # 新增 @ark-ui/react 依赖，评估移除 @floating-ui/react
└── src/
    └── popover/
        ├── index.tsx                   # 核心改动：基于 Ark UI 重写内部实现
        ├── index.module.less           # 无变化（或仅微调 data 属性映射）
        └── index.test.ts               # 维持测试覆盖，按新实现细节调整

AGENTS.md                               # 新增「组件开发范式：基于 Ark UI」节
.specify/memory/constitution.md         # 新增 Ark UI 相关原则
```

**结构决策**：单 package 改造，无新增 package；所有实现在 `packages/components/src/popover/` 下完成；website 预览文件（若有）同步验证视觉一致性。

---

## 实施分解

### 阶段 A：依赖引入与环境验证

1. 在 `packages/components/package.json` 中新增 `@ark-ui/react` 依赖
2. 运行 `vp install` 安装依赖
3. 验证 `vp check` 通过

### 阶段 B：Popover 组件重写

**目标**：用 Ark UI 原语替换内部实现，保持公开 API 和视觉效果不变

实现要点：

1. **Ark UI 结构**：
   - `<Popover.Root open={open} onOpenChange={...} positioning={{placement, offset}} lazyMount unmountOnExit={false}>`
   - `<Popover.Trigger>` 仅用于 click 触发器
   - `<Popover.Positioner>` 替代 `<FloatingPortal>` + 手动浮层定位
   - `<Popover.Content>` 替代浮层容器 div
   - `<Popover.Arrow>` + `<Popover.ArrowTip>` 替代自定义 SVG 箭头

2. **非 click 触发器处理**：
   - 保留现有 hover/focus/context-menu 事件逻辑
   - 通过受控模式驱动 Ark UI（外部管理 `open` state）
   - Ark UI 的 `closeOnInteractOutside` 和 `closeOnEscape` 仍然生效

3. **data 属性映射**：
   - 在组件层将 Ark UI 的 `data-state`（`open`/`closed`）映射到我们的三态（`open`/`closing`/`closed`）
   - 保留 `data-side`、`data-mode`、`data-shape` 等自定义属性
   - 保留 `data-popover-overlay="true"` 供测试查询

4. **移除依赖**：评估 `@floating-ui/react` 是否可从显式依赖中移除（若 Ark UI 已内置其所有使用到的能力）

### 阶段 C：测试更新与回归验证

1. 运行现有测试套件，确认全部通过：`vp test packages/components`
2. 按需调整测试中依赖内部实现细节的部分（如 floating 动作序列）
3. 确认所有公开 API 测试场景均通过

### 阶段 D：规范文件更新

1. 更新 `AGENTS.md`：新增「组件开发范式：基于 Ark UI 的行为基础层」节（内容见 `contracts/popover-api.md`）
2. 更新 `.specify/memory/constitution.md`：在现有原则「I. 包优先的组件架构」后新增关于 Ark UI 作为行为基础层的条款，并记录同步影响报告

### 阶段 E：构建与预览验证

1. `vp run build -r` — 全量构建，确认产物无异常
2. `vp run website#dev` — 启动预览，人工目视确认 popover 视觉与交互与迁移前一致
3. `vp check` — 确认类型检查和 lint 通过

---

## 复杂度追踪

> 仅记录需要说明的非标准决策

| 决策                                              | 理由                                                                                                        | 为什么不选更简单方案                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| hover/focus/context-menu 触发仍保留自定义事件逻辑 | Ark UI Popover 原语仅原生支持 click 触发；这三种触发类型是现有公开 API 的一部分，去除会引入 breaking change | 去除这三种触发类型是 breaking change，且用户明确要求 API 向后兼容 |
| 保留 `@floating-ui/react` 作为过渡（视评估结果）  | Ark UI 内部已使用 Floating UI，但某些高级 middleware（如自定义 safePolygon）可能仍需直接引用                | 待实现阶段评估后确认是否可完全移除                                |
