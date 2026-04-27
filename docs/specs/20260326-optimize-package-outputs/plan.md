# 实施计划：包构建与发布产物治理

**分支**：`20260326-optimize-package-outputs` | **日期**：2026-03-26 | **规格**：[spec.md](./spec.md)  
**输入**：来自 `/specs/20260326-optimize-package-outputs/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、
文件路径、协议字段和第三方 API 名称可保留原文。

**说明**：该模板由 `/speckit.plan` 命令填充。执行流程见 `.specify/templates/plan-template.md`。

## 摘要

本次计划聚焦于 `packages/` 下可发布包的构建与发布产物治理，目标是同时解决四类问题：`@deweyou-ui/components` 的单组件独立入口与样式自带、Vite+ 统一构建约定下的包级配置收敛、`react`/`react-dom` 的宿主安装契约，以及发布产物中工作区占位版本的最终解析。设计上将以 Vite+ 默认约定为基线，只在公开入口、多入口产物、静态资产复制或发布契约无法被默认约定覆盖时保留专用构建配置；同时建立组件入口契约与发布清单契约，约束未来新增包沿用同一治理模型。

## 技术上下文

**语言/版本**：TypeScript 5.x，Node.js >= 24.14.0  
**主要依赖**：`vite-plus`、React 19.x、React DOM 19.x、Storybook 10.2、`@tsdown/css`、Less  
**存储**：N/A（仅文件、包清单与构建产物）  
**测试**：`vp check`、`vp test`、按包的 `vp run build -r` 构建验证  
**目标平台**：npm 包消费者、`apps/website`、`apps/storybook`  
**项目类型**：monorepo 组件库与预览应用  
**性能目标**：单组件消费不需要额外样式导入；发布前审查中 100% 的拟发布包不泄漏内部版本占位符  
**约束**：默认复用 Vite+ 统一构建约定；保留根入口兼容性；所有运行时依赖 React 的拟发布包改为宿主安装契约；`/specs/` 文档使用简体中文  
**规模/范围**：主要涉及 `packages/components`、`packages/hooks`、`packages/icons`、`packages/styles`、`packages/utils`，以及 `apps/website` 和 `apps/storybook` 的验证入口

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后需重新检查。_

- Phase 0 初检：通过。
- Package 边界：本次变更落在 `packages/components`、`packages/hooks`、`packages/icons`、`packages/styles`、`packages/utils`，验证面落在 `apps/website` 与 `apps/storybook`，不存在把可复用行为只留在 app 内的方案。
- 公开 API 与 semver：`@deweyou-ui/components` 将新增稳定的组件子路径导出并保留根入口；各发布包的 `peerDependencies`、`dependencies`、`exports` 与 `types` 视为公开契约，任何重分类或移除都按 semver 处理。
- 无障碍预期：本次不改变现有组件的键盘行为、焦点管理、语义结构与状态行为；新增的单组件入口必须与根入口保持相同的无障碍表现。
- Token / 主题影响：不引入新的设计 token；继续复用 `@deweyou-ui/styles` 现有 token 与主题文件，仅调整样式交付方式和对外消费契约。
- 验证门禁：计划包含 `vp check`、`vp test`、`vp run build -r`，并要求在 `apps/website` 或 `apps/storybook` 中补充单组件入口与根入口兼容验证。
- 文档语言：本计划及派生产物均使用简体中文。
- Vite+ 统一构建约定：默认以 Vite+ 统一约定为基线；仅 `packages/components`、`packages/icons`、`packages/styles` 预计可能保留专用构建行为，原因分别是组件样式交付、多入口图标产物和静态样式资产复制。`packages/hooks` 与 `packages/utils` 以默认约定为目标。
- Phase 1 设计复检：通过。研究与契约设计已将“默认约定/例外条件/发布清单规则”显式化，未发现需豁免的宪章冲突。

## 项目结构

### 文档（本功能）

```text
specs/20260326-optimize-package-outputs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── component-entry-contract.md
│   └── package-manifest-contract.md
└── tasks.md
```

### 源代码（仓库根目录）

```text
apps/
├── storybook/
│   └── src/
└── website/
    └── src/

packages/
├── components/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.build.json
│   └── vite.config.ts
├── hooks/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── icons/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── styles/
│   ├── scripts/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── tsdown.config.ts
│   └── vite.config.ts
└── utils/
    ├── src/
    ├── tests/
    ├── package.json
    ├── tsdown.config.ts
    └── vite.config.ts
```

**结构决策**：本功能采用 monorepo library + preview apps 结构。核心实现集中在 `packages/components` 的导出面与样式交付、`packages/hooks`/`packages/icons`/`packages/styles`/`packages/utils` 的依赖契约与发布清单、以及少量 `apps/website` 或 `apps/storybook` 验证入口。构建治理规则优先落在各 package 的 `package.json` 与 `vite.config.ts`，只有在默认约定不足时才保留独立脚本或专用配置。

## 复杂度追踪

> **仅当宪章检查存在必须说明的违反项时填写**

| 违反项 | 为什么需要 | 为什么拒绝更简单的替代方案 |
| ------ | ---------- | -------------------------- |
| 无     | N/A        | N/A                        |
