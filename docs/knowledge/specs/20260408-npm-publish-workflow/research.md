# 研究报告：npm 发包工作流

**功能**：`20260408-npm-publish-workflow`
**日期**：2026-04-08

---

## 1. 现状分析

| 维度                 | 现状                                           |
| -------------------- | ---------------------------------------------- |
| 发包工具             | 无                                             |
| 版本管理             | 所有包固定 `0.0.0`                             |
| changelog 工具       | 无                                             |
| CI 发布流水线        | 无（仅 `pr-ready.yml`）                        |
| Conventional Commits | 已强制（`.vite-hooks/commit-msg`）             |
| 构建基础             | vite-plus；`write-published-manifest.mjs` 就绪 |
| publishConfig        | 所有包均配置 `directory: "dist"`               |
| npm 鉴权             | `.npmrc` 指向 public registry，token 未配置    |

`write-published-manifest.mjs` 在 **build 期间**运行（各包 `build` script 的最后一步），将 `workspace:*` / `catalog:*` 解析为具体版本号写入 `dist/package.json`。因此版本号必须在 build **之前**写入源码 `package.json`，才能被正确解析到产物中。

---

## 2. 工具选型

### 候选方案

| 工具                                                  | monorepo 支持          | 自动版本推断          | prerelease             | pnpm 兼容 | 复杂度 |
| ----------------------------------------------------- | ---------------------- | --------------------- | ---------------------- | --------- | ------ |
| **changelogen**                                       | ✅ 内置                | ✅ 从 commits         | ✅ `--prerelease beta` | ✅        | 低     |
| **release-it** + `@release-it/conventional-changelog` | 可配置（需脚本迭代包） | ✅                    | ✅                     | ✅        | 低~中  |
| **changesets**                                        | ✅ 原生                | ❌ 需手动写 changeset | ✅ `pre` 模式          | ✅ 原生   | 中     |
| **semantic-release** + `multi-semantic-release`       | 插件支持               | ✅                    | ✅                     | ✅        | 高     |

### 决策：`changelogen`（unjs）

**理由**：

- 项目已强制 Conventional Commits，changelogen 直接从 git log 解析，无需额外配置。
- 一个工具同时处理 bump 版本 + 生成 changelog，命令极简（`changelogen --release`）。
- `--prerelease beta` 原生支持 `X.Y.Z-beta.N` 格式，序号自动递增。
- 与项目技术栈（vite / unjs 生态）高度一致，是 Nuxt、unjs 系项目的实际在用工具。
- 相比 release-it，无需插件、无需两份配置文件，wrapper 脚本更简洁。

**放弃 release-it 的原因**：monorepo 是二等公民，需要自写脚本同步版本；插件生态更新节奏不一致。

**放弃 changesets 的原因**：核心模型是"手动声明变更意图"，与"从 commit 自动推断版本"的预期不匹配。

---

## 3. 版本管理策略

### 决策：独立版本（各包独立 bump）

**理由**：

- 各包变更频率差异大（`react-icons`、`styles` 可能长期不动），同步版本会制造无意义的版本号跳动。
- 消费者可以只升级真正有变更的包，语义更准确。
- 符合 Radix UI、Headless UI 等组件库的主流独立版本实践。

**实现方式**：

- 每个包独立 git tag，格式 `<package-name>@<version>`（如 `react@1.2.0`、`react-icons@1.0.0`）。
- changelogen 按包名 tag 推断自上次发版以来的变更范围（通过 `--from` 参数指定上一个包级 tag）。
- 每个包独立 `CHANGELOG.md`（位于 `packages/*/CHANGELOG.md`）。
- `write-published-manifest.mjs` 将 `workspace:*` 解析为 `^<当前包版本>`，各包版本不同时完全兼容。

**替代方案**：同步版本（所有包共享版本号）—— 简单，但 icon 包没有变更时也会升版，语义不准确。

---

## 4. 发布通道策略

### 决策：分支检测 + 双通道

| 分支      | 通道   | dist-tag | 版本格式       | 命令示例                       |
| --------- | ------ | -------- | -------------- | ------------------------------ |
| 非 `main` | beta   | `beta`   | `X.Y.Z-beta.N` | `release-it --preRelease=beta` |
| `main`    | stable | `latest` | `X.Y.Z`        | `release-it`                   |

分支检测通过包装脚本 `scripts/release.sh` 实现：

1. 读取当前 git 分支。
2. 若在 `main` 且请求 beta → 报错退出。
3. 若不在 `main` 且请求 stable → 报错退出。
4. 调用对应 changelogen 命令。

---

## 5. 完整发布流程

```text
scripts/release.sh [beta|stable]
  │
  ├── 1. 校验分支（main ↔ stable，非 main ↔ beta）
  ├── 2. 校验 npm 鉴权（npm whoami）
  ├── 3. 遍历每个可发布包：
  │     ├── 检测自上次包级 tag 以来是否有变更
  │     ├── 若无变更 → 跳过
  │     └── 若有变更：
  │           ├── changelogen --release [--prerelease beta]（在包目录下）
  │           │     ├── 推断版本号（conventional commits）
  │           │     ├── 更新该包的 package.json version
  │           │     └── 生成 / 更新 packages/*/CHANGELOG.md
  │           └── 记录"待发布包"列表
  ├── 4. git commit（所有版本变更 + changelog 一次提交）+ 打包级 tag + push
  ├── 5. vp run build -r（触发 write-published-manifest.mjs，读取各包新版本号）
  └── 6. 遍历"待发布包"列表，逐包执行 npm publish --tag [beta|latest]
```

### 为什么 build 在 bump 之后

`write-published-manifest.mjs` 读取源 `package.json` 的 `version` 字段写入 `dist/package.json`，因此必须先更新版本号再 build，确保产物 manifest 中版本正确。

---

## 6. GitHub Actions 集成

### 决策：手动触发（`workflow_dispatch`）+ 主分支自动触发

- **手动触发**（`workflow_dispatch`）：提供 `channel`（beta/stable）输入，适合初期灵活控制。
- **自动触发**（push to `main`，可选）：后续可启用，push 到 main 自动发 stable 包。
- CI 中通过 `NODE_AUTH_TOKEN` secret 注入 npm token。

---

## 7. 关键约束与边界

- `packages/infra` 不发布，发布列表：`react`、`react-hooks`、`react-icons`、`styles`、`utils`。
- `packages/react-icons` 和 `packages/styles` 的 build script 未调用 `write-published-manifest.mjs`（分别由 `organize-dist.mjs` 和 `copy-assets.mjs` 处理），需确认这两个脚本是否已处理版本写入，否则需补充。
- 独立版本时，`write-published-manifest.mjs` 将 `workspace:*` 解析为依赖包的**当前版本**（而非发布包自身版本），需确认脚本读取的是被依赖包的 package.json version，而非固定值。
- 每个包的初始版本需在实现时确定（`0.1.0` 或 `1.0.0`），本计划不约束。
- 不引入 pnpm publish 的 workspace 协议（避免与 `publishConfig.directory` 冲突），直接在 `dist/` 目录执行 `npm publish`。
- beta 通道下，包级 tag 格式为 `<package-name>@<version>-beta.<N>`（如 `react@1.0.0-beta.1`），与正式 tag 互不干扰。
