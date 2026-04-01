# 实施计划：Tabs 组件

**分支**：`20260331-tabs-component` | **日期**：2026-03-31 | **规格**：[spec.md](./spec.md)  
**输入**：来自 `/specs/20260331-tabs-component/spec.md` 的功能规格  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

---

## 摘要

基于 Ark UI `Tabs` 原语构建 `@deweyou-ui/components` 中的 `Tabs` 组件，覆盖以下核心能力：

- **受控/非受控切换**（对齐 Ark UI `Tabs.Root`）、横排/竖排 `orientation`、自动/手动 `activationMode`
- **两种激活样式变体**：`line`（下划线/左边框 + 平滑滑动动画）与 `bg`（背景高亮）
- **Tab 下拉菜单**：单个 tab 可配置子菜单，复用现有 `Menu` 组件，横排向下、竖排向右弹出
- **内容面板开关**：默认渲染 `TabContent`，`hideContent` prop 仅保留标签栏
- **超长处理**：`scroll` 模式（横向/纵向滚动 + CSS `mask-image` 渐变遮罩）和 `collapse` 模式（`ResizeObserver` 检测溢出，收入"更多"菜单）
- 全部样式通过 CSS Modules（Less）+ 现有设计 token 实现，不引入新颜色 token

---

## 技术上下文

**语言/版本**：TypeScript 5.x，React 19.x，Node.js 24.14.0  
**主要依赖**：`@ark-ui/react`（Tabs 行为层）、`@deweyou-ui/styles`（token）、`classnames`、现有 `Menu` 组件（`packages/components/src/menu`）  
**存储**：N/A  
**测试**：`vp test`（Vitest）  
**目标平台**：现代浏览器（Chrome / Safari / Firefox 最新两版），web  
**项目类型**：UI 组件库（library）  
**性能目标**：指示器动画目视 60fps；`collapse` 模式溢出检测不引入可见抖动  
**约束**：不引入新颜色 token；样式不依赖 Ark UI 默认样式；公开 API 与 Ark UI 内部解耦；尺寸 token 如需新增须在 plan 中说明  
**规模/范围**：单个 package（`packages/components`）新增 `src/tabs/` 目录；`apps/website` 更新预览；`apps/storybook` 可选跟进

---

## 宪章检查

| 原则                               | 状态 | 说明                                                                                                               |
| ---------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| I. 包优先架构（Ark UI 行为基础层） | ✅   | 组件位于 `packages/components/src/tabs/`；强制使用 Ark UI `Tabs` 原语；参考 `popover` 实现范式                     |
| II. 无障碍与 API 一致性            | ✅   | 遵循 ARIA APG Tabs Pattern；`role="tablist/tab/tabpanel"`；方向键导航；焦点管理；API 命名对齐现有组件约定          |
| III. Token 与主题作为事实来源      | ✅   | 复用现有语义色 token（`--ui-color-brand-bg`、`--ui-color-border` 等）；不硬编码颜色；`prefers-reduced-motion` 处理 |
| IV. 测试与预览门禁                 | ✅   | 单测 `src/tabs/index.test.tsx`；`apps/website` 添加 tabs 预览页；`vp check` + `vp test` 验证                       |
| V. Vite+ Monorepo 与文档纪律       | ✅   | 使用 `vp` 命令；无包级专用构建配置；本文件及 spec 均以简体中文撰写                                                 |

**复杂度追踪**：无宪章违反项需说明。

---

## 项目结构

### 文档（本功能）

```text
specs/20260331-tabs-component/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/
│   └── tabs-api.md      # Phase 1 输出
└── tasks.md             # Phase 2 输出（/speckit.tasks 命令）
```

### 源代码（仓库根目录）

```text
packages/components/src/
├── tabs/
│   ├── index.tsx              # 组件实现入口（Tabs, TabList, TabTrigger, TabContent, TabIndicator）
│   ├── index.module.less      # 样式（CSS Modules + Less）
│   └── index.test.tsx         # 单测（colocate）
└── index.ts                   # 新增 tabs 导出

apps/website/src/
└── pages/tabs/                # 新增 Tabs 预览页（含各场景示例）
```

**结构决策**：采用 Option 1（单包新增目录），目标 package 为 `packages/components`，遵循 `src/<unit-name>/` colocate 规范。不新增独立 package，不需要 package 级构建配置。

---
