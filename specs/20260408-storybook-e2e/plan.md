# 实施计划：Storybook E2E 测试覆盖

**分支**：`20260408-storybook-e2e` | **日期**：2026-04-08 | **规格**：[spec.md](./spec.md)
**输入**：来自 `/specs/20260408-storybook-e2e/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、
文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

为全部现有组件添加基于 `@storybook/test-runner` 的 E2E 测试：

- **交互测试**：Button、Popover、Menu、Tabs（含 `play` 函数，验证交互行为和 ARIA）
- **Smoke test**：Typography、Color、Icon（验证渲染正确性，无 JavaScript 错误）

测试以 Storybook `play` 函数为载体，test-runner 自动执行所有 Story。
整个实施仅涉及 `apps/storybook`，不修改任何 `packages/` 下的组件代码。

## 技术上下文

**语言/版本**：TypeScript 5.x，Node.js 24.x
**主要依赖**：`@storybook/test-runner@0.24.3`、`@playwright/test`（由 test-runner 引入）
**存储**：N/A
**测试**：`@storybook/test-runner`（play 函数 + Playwright headless Chromium）
**目标平台**：本地开发（macOS）、CI（Linux headless）
**项目类型**：测试基础设施，属于 `apps/storybook`
**性能目标**：完整测试套件耗时 ≤ 3 分钟（含 Storybook 静态构建）
**约束**：仅修改 `apps/storybook`，不侵入 `packages/`；使用 `vp` 工具链
**规模/范围**：Button、Popover、Menu、Tabs（各 1 个交互 Story + play 函数）、
Typography / Color / Icon（smoke test）；共约 25 个 Story 测试用例

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后重新确认。_

- ✅ **Package 边界**：所有测试代码位于 `apps/storybook`，不向 `packages/` 暴露
  任何接口，不影响组件包的 semver。
- ✅ **公开 API 变化**：无。现有组件 API 不变，仅在 Story 文件中新增 `play` 函数。
- ✅ **无障碍预期**：E2E 测试显式验证 Popover 的焦点管理和 Button 的 `aria-disabled`
  属性，符合宪章原则 II。
- ✅ **Token/主题影响**：无 token 变更，测试不涉及视觉样式。
- ✅ **验证命令**：`vp run storybook#test`（新增脚本）；`vp check` 验证 TypeScript
  和 lint；`vp run storybook#build` 用于 CI 前置构建。
- ✅ **文档语言**：本 spec、plan、tasks 均以简体中文撰写。
- ✅ **Vite+ 约定**：测试脚本通过 `vp run storybook#test` 调用，符合统一工具链要求；
  `apps/storybook` 无专用构建配置覆盖，继续使用统一约定。
- ✅ **编码规范（原则 VI）**：新增文件使用 kebab-case 命名，Story 文件使用 `.tsx`，
  函数使用箭头函数风格。
- ✅ **设计系统数值（原则 VII）**：本功能不涉及 UI 组件实现，原则 VII 不适用。

## 项目结构

### 文档（本功能）

```text
specs/20260408-storybook-e2e/
├── spec.md
├── plan.md          ← 本文件
├── research.md
└── tasks.md         ← 由 /speckit.tasks 生成
```

### 源代码变更

```text
apps/storybook/
├── package.json                          ← 新增 @storybook/test-runner，新增 test 脚本
├── .storybook/
│   └── test-runner.ts                    ← 新增（全局 setup，可选）
└── src/
    └── stories/
        ├── Button.stories.tsx            ← 新增 Interaction Story（含 play 函数）
        ├── Popover.stories.tsx           ← 新增 Interaction Story（含 play 函数）
        ├── Menu.stories.tsx              ← 新增 Interaction Story（含 play 函数）
        ├── Tabs.stories.tsx              ← 新增 Interaction Story（含 play 函数）
        ├── Typography.stories.tsx        ← 无修改（smoke test 自动覆盖）
        ├── Color.stories.tsx             ← 无修改（smoke test 自动覆盖）
        └── Icon.stories.tsx              ← 无修改（smoke test 自动覆盖）
```

**结构决策**：交互测试 Story 以新 Story export 的形式追加到现有文件末尾，
命名为 `Interaction`，避免新建文件增加维护分散度。Typography / Color / Icon
无需 play 函数，test-runner 自动执行 smoke test。test-runner 配置文件
位于 `.storybook/test-runner.ts`，保持与其他 Storybook 配置同目录。

## play 函数设计

### Button — `Interaction` Story

验证点击交互 + 禁用态 `aria-disabled`。

### Popover — `Interaction` Story

验证点击打开、Escape 关闭、`role="dialog"` 可见性变化。

### Menu — `Interaction` Story

验证触发器点击打开菜单、方向键导航菜单项（`role="menuitem"` 焦点移动）、
禁用项被跳过、Escape 关闭。

### Tabs — `Interaction` Story

验证点击 Tab 切换面板（`aria-selected` 变化）、左右方向键在 Tab 间导航。

> 具体 `play` 函数实现在任务阶段根据实际 Story 结构确定，
> 以上为行为契约，不是最终代码。

## 验证命令

| 场景                                | 命令                                              |
| ----------------------------------- | ------------------------------------------------- |
| 本地开发（Storybook 已运行于 6106） | `vp run storybook#test`                           |
| CI（构建后测试）                    | `vp run storybook#build && vp run storybook#test` |
| 类型检查                            | `vp check`                                        |

## 复杂度追踪

无宪章违反项，无需说明。
