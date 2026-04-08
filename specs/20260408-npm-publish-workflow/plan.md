# 实施计划：npm 发包工作流

**分支**：`20260408-npm-publish-workflow` | **日期**：2026-04-08 | **规格**：[spec.md](spec.md)
**输入**：来自 `/specs/20260408-npm-publish-workflow/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

---

## 摘要

为 Deweyou UI monorepo 建立完整的 npm 发包工作流，基于 `changelogen`（unjs），实现：

- 独立版本管理（各包独立 bump，只有有变更的包才升版发布）
- 分支感知的双通道发布（非 main → beta prerelease，main → stable latest）
- changelog 自动生成（基于已有的 Conventional Commits 强制约束）
- 本地脚本 + GitHub Actions 双入口触发

---

## 技术上下文

**语言/版本**：Node.js 24.14.0，TypeScript 5.x（release 脚本本身用 shell/JS）
**主要依赖**：

- `changelogen`（unjs，changelog 生成 + 版本 bump 一体）
- 新增到根 `package.json` devDependencies（不影响发布包）

**存储**：N/A（无数据库，版本状态由 git tag 维护）
**测试**：`--dry-run` 模式验证；CI 中通过预演运行验证配置正确性
**目标平台**：npm registry（public），GitHub Actions（Ubuntu）
**项目类型**：monorepo tooling / release automation
**性能目标**：完整发布（构建 + publish 5 包）在 10 分钟内完成（SC-002）
**约束**：vite-plus 统一构建约定，不绕过 `vp run build -r`；npm 鉴权必须在发布前校验

---

## 宪章检查

| 检查项                   | 状态   | 说明                                                                                                      |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------- |
| 目标 package 边界明确    | ✅     | 发包工具作为 root 级开发工具，不引入新发布包；`infra` 依然不发布                                          |
| 公开 API 变化            | ✅ N/A | 此功能不修改任何已发布包的公开 API                                                                        |
| 无障碍预期               | ✅ N/A | 纯 CLI/工具链功能，无 UI                                                                                  |
| Token 和主题影响         | ✅ N/A | 无 token 变更                                                                                             |
| 验证规划                 | ✅     | 使用 `--dry-run` 模式验证；CI 中预演通过才合并                                                            |
| 文档语言（简体中文）     | ✅     | 所有 `/specs/` 文档正文使用简体中文                                                                       |
| vite-plus 构建约定       | ✅     | 构建步骤通过 `vp run build -r` 调用，无例外                                                               |
| 文件命名（kebab-case）   | ✅     | 脚本文件命名：`scripts/release.sh`、`scripts/release-packages.mjs`，可选配置文件：`changelogen.config.ts` |
| 函数风格（箭头函数）     | ✅ N/A | release 脚本为 shell script；若有 JS 辅助脚本使用箭头函数                                                 |
| 设计系统数值（原则 VII） | ✅ N/A | 纯工具链功能，无 UI 组件                                                                                  |

---

## 项目结构

### 文档（本功能）

```text
specs/20260408-npm-publish-workflow/
├── spec.md
├── plan.md              ← 本文件
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── release-script.md
│   └── github-actions.md
└── tasks.md             ← 由 /speckit.tasks 生成
```

### 源代码变更（仓库根目录）

```text
/                                   ← 根目录
├── scripts/
│   ├── release.sh                  ← 新增：发布入口脚本（分支校验 + 遍历各包）
│   └── release-packages.mjs        ← 新增：检测各包变更、调用 changelogen、收集待发布列表
└── .github/
    └── workflows/
        └── release.yml             ← 新增：GitHub Actions 发布工作流

packages/
├── react/CHANGELOG.md              ← 新增（由 changelogen 各包独立维护）
├── react-hooks/CHANGELOG.md        ← 同上
├── react-icons/CHANGELOG.md        ← 同上
├── styles/CHANGELOG.md             ← 同上
└── utils/CHANGELOG.md              ← 同上
```

**结构决策**：

- `scripts/release.sh` 作为统一入口，负责分支校验、鉴权校验，调用 `release-packages.mjs`。
- `scripts/release-packages.mjs` 核心逻辑：遍历 5 个可发布包，对每个包检测自上次包级 tag 以来是否有 git 变更；有变更则调用 changelogen 在该包目录下 bump 版本 + 生成 `CHANGELOG.md`；收集待发布包列表后统一 git commit + 打包级 tag + push，再触发 build 和 publish。
- 每个包独立 `CHANGELOG.md`（`packages/*/CHANGELOG.md`），无根目录 changelog。
- 包级 git tag 格式：`<short-name>@<version>`（如 `react@1.2.0`、`react-icons@1.0.0-beta.1`）。
- build 在所有包 bump 完成后统一执行一次（`vp run build -r`），确保 `write-published-manifest.mjs` 读到各包新版本号。
- publish 只遍历"待发布包"列表（跳过无变更的包），传入 `--tag beta` 或 `--tag latest`。
- 发布脚本的自动化 git commit 使用 `--no-verify` 豁免 commit-msg hook，原因：release commit 格式固定（`chore: release packages`），属于工具链自动生成，不属于人工提交治理范围（宪章原则 VI 适用于人工提交）。
