# 实施计划：重构 packages 结构以支持正式发包

**分支**：`20260408-restructure-packages` | **日期**：2026-04-08 | **规格**：[spec.md](./spec.md)  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 摘要

将 monorepo 内所有面向消费方的 package 迁移到 `@deweyou-design/*` scope，并明确 build 工具与 runtime 工具的包职责边界：

- `packages/components` → `packages/react`（`@deweyou-design/react`）
- `packages/hooks` → `packages/react-hooks`（`@deweyou-design/react-hooks`）
- `packages/icons` → `packages/react-icons`（`@deweyou-design/react-icons`）
- `packages/styles` → 目录不变，`@deweyou-design/styles`
- `packages/utils` → `packages/infra`（`@deweyou-ui/infra`，不发布，build 专用）
- 新建 `packages/utils`（`@deweyou-design/utils`，runtime 工具，初始空包）

本次为纯结构重构，无 UI/API/无障碍变更。

## 技术上下文

**语言/版本**：TypeScript 5.x、Node.js 24.14.0  
**主要依赖**：vite-plus、pnpm workspaces  
**存储**：N/A  
**测试**：vp test（vitest）  
**目标平台**：monorepo 内部结构 + npm 发布产物  
**项目类型**：library（monorepo）  
**性能目标**：N/A（纯重命名，无性能影响）  
**约束**：所有现有 `exports` 路径语义不变；`vp check` 和 `vp test` 全量通过  
**规模/范围**：6 个 package、2 个 app、约 30 个文件需要更新引用

## 宪章检查

| 检查项                   | 状态 | 说明                                                    |
| ------------------------ | ---- | ------------------------------------------------------- |
| 目标 package 边界明确    | ✅   | 6 个 package 职责清晰，infra 不对外暴露                 |
| 公开 API 变化已列出      | ✅   | 仅包名变更，exports 路径语义不变（见 contracts/）       |
| 无障碍预期               | ✅   | 纯结构重构，无 UI 变更                                  |
| token/主题影响           | ✅   | 无新增或修改 token                                      |
| 验证命令                 | ✅   | `vp check`、`vp test`、`vp run build -r`                |
| 文档简体中文             | ✅   | spec/plan/tasks 均使用简体中文                          |
| Vite+ 统一构建约定       | ✅   | 所有包继续复用统一约定，无新增包级专用配置              |
| kebab-case 命名          | ✅   | 新目录名：react、react-hooks、react-icons、infra、utils |
| 设计系统数值（原则 VII） | ✅   | 无 UI 变更，不适用                                      |

## 项目结构

### 文档（本功能）

```text
specs/20260408-restructure-packages/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── contracts/
│   └── package-rename-contract.md   # Phase 1 输出
└── tasks.md             # Phase 2 输出（/speckit.tasks 命令）
```

### 受影响的源代码结构

```text
packages/
├── react/               # 原 components/，@deweyou-design/react
│   ├── package.json     # name、deps、build script 路径更新
│   ├── vite.config.ts   # externals 更新
│   ├── CLAUDE.md        # 路径引用更新
│   └── tests/workspace-boundaries.test.ts   # 断言更新
├── react-hooks/         # 原 hooks/，@deweyou-design/react-hooks
│   └── package.json     # name 更新
├── react-icons/         # 原 icons/，@deweyou-design/react-icons
│   ├── package.json     # name 更新
│   └── scripts/organize-dist.mjs   # ../../utils → ../../infra
├── styles/              # 目录不变，@deweyou-design/styles
│   ├── package.json     # name 更新
│   ├── scripts/copy-assets.mjs   # ../../utils → ../../infra
│   └── tests/consumer-import.test.ts   # 断言更新
├── infra/               # 原 utils/，@deweyou-ui/infra，不发布
│   ├── package.json     # name 更新，移除 publishConfig
│   └── tests/           # 断言更新
└── utils/               # 新建，@deweyou-design/utils，runtime 工具空包
    ├── package.json
    └── src/index.ts

apps/
├── storybook/
│   ├── package.json     # deps 更新
│   ├── tsconfig.json    # paths 更新
│   └── src/stories/*.tsx + .storybook/preview.ts   # import 更新
└── website/
    ├── package.json     # deps 更新
    ├── tsconfig.json    # paths 更新
    └── src/main.tsx + src/pages/icons.tsx   # import 更新

vite.config.ts           # lint 路径 packages/utils/src → packages/infra/src
docs/architecture/
└── package-layers.md    # 新增包职责分层规则文档
```

**结构决策**：纯重命名，无新目录层级。`infra` 保留在 `packages/` 下但移除 `publishConfig`，与消费方包共存但明确职责边界。新 `utils` 空包提前占位，确保后续 runtime 工具有正确落地点。

## Phase 0：Research

本次为确定性重构，无技术方向需调研。所有决策已在 spec 阶段确认。

**关键约束确认**：

- pnpm workspace 模式为 `packages/*`，目录改名后无需修改 `pnpm-workspace.yaml`
- `packages/infra` 移除 `publishConfig` 后，pnpm publish 不会发布该包
- `vite.config.ts` 的 lint 路径模式需从 `packages/utils/src/**` 改为 `packages/infra/src/**`
- styles/icons 的 build script 通过相对路径 `../../utils/scripts/write-published-manifest.mjs` 引用 infra，改名后需同步更新为 `../../infra/scripts/`
- `packages/react/vite.config.ts` 的 `external` 数组需将 `@deweyou-ui/hooks`、`@deweyou-ui/styles` 更新为新包名

**版本解析验证**：`write-published-manifest.mjs`（位于 `packages/infra/scripts/`）在 build 时动态扫描 `packages/*` 下所有包，将 `workspace:*` 解析为 `^{version}`，将 `catalog:` 解析为 `pnpm-workspace.yaml` 中对应的版本号。目录改名后该机制自动适配新包名，但需在实现阶段显式验证每个包的 `dist/package.json` 不含 `workspace:` 或 `catalog:` 字符串（对应 SC-006）。

**注意**：`packages/infra/src/` 中存在 TypeScript 版本的同一套逻辑，与 `.mjs` 脚本相互独立，存在漂移风险。本次不处理，但后续可考虑让脚本直接消费编译产物。

**执行顺序约束**：必须先完成目录重命名，再批量更新引用，再跑 `vp run build -r`，最后 `vp check` + `vp test` 验证。
