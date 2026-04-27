# 任务：npm 发包工作流

**输入**：来自 `/specs/20260408-npm-publish-workflow/` 的设计文档
**前置条件**：plan.md、spec.md、research.md、data-model.md、contracts/
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 格式：`[ID] [P?] [Story?] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（US1～US4）

---

## Phase 1：准备

**目的**：安装依赖、创建目录结构、核查现有基础设施

- [x] T001 安装 `changelogen` 为根目录 devDependency，在 `package.json` 中新增 `"changelogen": "latest"`，并运行 `vp install`
- [x] T002 [P] 在仓库根目录创建 `scripts/` 目录，并创建空文件 `scripts/release.sh`（设置可执行权限）和 `scripts/release-packages.mjs`
- [x] T003 逐一检查 `packages/react-icons/scripts/organize-dist.mjs` 和 `packages/styles/scripts/copy-assets.mjs`，确认是否已将源 `package.json` 的 `version` 字段写入 `dist/package.json`；若未写入，在对应脚本末尾补充写入逻辑（保持与 `write-published-manifest.mjs` 一致的方式）

**检查点**：`changelogen` 可通过 `./node_modules/.bin/changelogen --help` 调用；`scripts/` 目录存在

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：实现各包变更检测、版本 bump 和发布列表收集的核心逻辑

**⚠️ 关键**：US1～US4 的实现均依赖本阶段完成

- [x] T004 在 `scripts/release-packages.mjs` 中定义可发布包列表常量（包含 `react`、`react-hooks`、`react-icons`、`styles`、`utils` 的包名与目录路径）
- [x] T005 在 `scripts/release-packages.mjs` 中实现 `getLastTag(pkgShortName)` 函数：通过 `git tag --list "<pkgShortName>@*" --sort=-v:refname` 按版本号降序列出所有匹配 tag，取第一行作为最新 tag（格式 `react@1.0.0`），若结果为空则返回 `null`（代表首次发布）
- [x] T006 在 `scripts/release-packages.mjs` 中实现 `hasChanges(pkgDir, lastTag)` 函数：执行 `git log <lastTag>..HEAD -- <pkgDir>` 判断自上次 tag 以来是否有 commit；首次发布（`lastTag` 为 `null`）视为有变更
- [x] T007 在 `scripts/release-packages.mjs` 中实现 `bumpPackage(pkgDir, channel)` 函数：调用 `changelogen --dir <pkgDir> --output <pkgDir>/CHANGELOG.md [--prerelease beta] --bump --no-commit --no-tag` 更新该包的 `package.json` version 和 `CHANGELOG.md`（使用包目录的绝对路径作为 `--output`，确保 changelog 写入包目录而非仓库根目录），返回新版本号
- [x] T008 在 `scripts/release-packages.mjs` 中实现主流程 `releasePackages(channel)`：遍历包列表 → 检测变更 → 调用 `bumpPackage` → 收集待发布包列表，最终返回 `{ name, dir, version }[]`

**检查点**：`node scripts/release-packages.mjs beta` 可正确输出待发布包列表（`{ name, dir, version }[]` 格式），无变更的包被跳过，无报错退出

---

## Phase 3：用户故事 1 — 开发分支发布 beta（优先级：P1）🎯 MVP

**目标**：维护者在非 `main` 分支执行 `scripts/release.sh beta` 后，包以 `-beta.N` 版本发布到 npm `beta` dist-tag

**独立测试**：在 feature 分支执行 `scripts/release.sh beta --dry-run`，确认脚本通过分支校验、输出正确的 beta 版本号和 `--tag beta` 参数，不实际发包

### 用户故事 1 的实现

- [x] T009 [US1] 在 `scripts/release.sh` 中实现参数解析：接收 `<channel>`（`beta`/`stable`）和可选 `--dry-run`，非法参数时打印用法并以退出码 `1` 退出
- [x] T010 [US1] 在 `scripts/release.sh` 中实现分支校验：读取 `git branch --show-current`，若在 `main` 分支且 channel 为 `beta` 则以退出码 `1` 退出并打印明确错误信息
- [x] T011 [US1] 在 `scripts/release.sh` 中实现 npm 鉴权校验：执行 `npm whoami`，失败则以退出码 `2` 退出并提示用户检查 token（`--dry-run` 模式下跳过此步）
- [x] T012 [US1] 在 `scripts/release.sh` 中调用 `node scripts/release-packages.mjs beta [--dry-run]`，获取待发布包列表；若列表为空则打印"无包需要发布"并正常退出
- [x] T013 [US1] 在 `scripts/release.sh` 中（非 dry-run）实现 git commit + 打包级 tag + push：对所有 bump 后的变更执行一次 `git commit --no-verify`（message 格式 `chore: release packages`，使用 `--no-verify` 豁免 commit-msg hook，因为这是自动化提交而非人工提交），然后为每个待发布包打 `<shortName>@<version>` tag，最后 `git push --follow-tags`
- [x] T014 [US1] 在 `scripts/release.sh` 中（非 dry-run）执行 `vp run build -r` 完成全量构建
- [x] T015 [US1] 在 `scripts/release.sh` 中（非 dry-run）遍历待发布包列表，在每个包的 `dist/` 目录执行 `npm publish --tag beta`；任一包发布失败则以退出码 `4` 退出并标明失败包名；已成功发布的包**不回滚**，重试路径为修复失败原因后重新运行 `release.sh`，对"版本已存在"错误静默跳过继续执行剩余包
- [x] T016 [US1] 在 `scripts/release.sh` 末尾输出发布摘要（包名、版本号、dist-tag），格式参见 `contracts/release-script.md`

**检查点**：`scripts/release.sh beta --dry-run` 在 feature 分支可完整运行，无错误退出，输出预期的版本和 tag 信息

---

## Phase 4：用户故事 2 — main 分支发布正式版（优先级：P1）

**目标**：维护者在 `main` 分支执行 `scripts/release.sh stable` 后，包以正式 semver 版本发布到 npm `latest` dist-tag

**独立测试**：在 `main` 分支执行 `scripts/release.sh stable --dry-run`，确认通过分支校验、输出正确正式版本号和 `--tag latest`；在非 `main` 分支执行同命令，确认以退出码 `1` 拒绝

### 用户故事 2 的实现

- [x] T017 [US2] 在 `scripts/release.sh` 中补充 stable 通道的分支校验：若不在 `main` 分支且 channel 为 `stable` 则以退出码 `1` 退出并打印"正式版只能从 main 分支发布"
- [x] T018 [US2] 在 `scripts/release-packages.mjs` 中确保 `stable` 通道调用 `changelogen` 时**不**传 `--prerelease`，生成纯 semver 版本号（如 `1.2.0`）
- [x] T019 [US2] 在 `scripts/release.sh` 中对 `stable` 通道使用 `npm publish --tag latest`（不传 `--tag` 时默认也是 `latest`，但需显式传入以保证清晰）

**检查点**：`scripts/release.sh stable --dry-run` 在 `main` 分支输出正式版本号；在非 `main` 分支运行时以退出码 `1` 正确拒绝

---

## Phase 5：用户故事 3 — 自动生成 changelog（优先级：P2）

**目标**：每次发布后，各包目录下存在更新的 `CHANGELOG.md`，内容按 `feat`/`fix`/`BREAKING CHANGE` 分组

**独立测试**：在有 `feat` 和 `fix` commit 的包目录下执行 `changelogen --dir <pkgDir> --output CHANGELOG.md --bump --no-commit --no-tag`，检查生成的 `CHANGELOG.md` 是否包含正确的分组条目

### 用户故事 3 的实现

- [x] T020 [P] [US3] 在各可发布包目录（`packages/react`、`packages/react-hooks`、`packages/react-icons`、`packages/styles`、`packages/utils`）创建初始 `CHANGELOG.md` 占位文件，内容仅含标题 `# Changelog`
- [x] T021 [US3] 验证 `bumpPackage()` 中 `changelogen` 的 `--output CHANGELOG.md` 参数能正确在包目录生成分组 changelog；如需自定义 changelog 标题或格式，创建 `changelogen.config.ts` 于仓库根目录并配置 `output` 选项
- [x] T022 [US3] 确认不符合约定式提交格式的 commit（如无 scope 的普通 commit）不会导致 changelog 生成报错，而是被归入"其他变更"或静默跳过

**检查点**：对一个有 `feat:` commit 的包手动运行 changelogen，生成的 `CHANGELOG.md` 中包含该 commit 的条目

---

## Phase 6：用户故事 4 — commit 类型自动推断版本增量（优先级：P2）

**目标**：发布时版本号根据 commit 类型自动推断，无需手动指定

**独立测试**：分别在只有 `fix:` commit 和只有 `feat:` commit 的测试场景下执行 `bumpPackage()` dry-run，验证版本号分别升 patch 和 minor

### 用户故事 4 的实现

- [x] T023 [US4] 验证 changelogen 的版本推断规则与项目 commit 规范匹配：`fix` → patch，`feat` → minor，`feat` + `BREAKING CHANGE` footer → major；若默认规则不匹配，在 `changelogen.config.ts` 中配置自定义规则
- [x] T024 [US4] 在 `scripts/release-packages.mjs` 的 `bumpPackage()` 中验证 prerelease 序号自动递增逻辑：若 `react@1.0.0-beta.1` tag 已存在，再次 beta 发布时版本应为 `1.0.0-beta.2`（changelogen 原生支持，验证无需额外代码）

**检查点**：`--dry-run` 模式下输出的版本号与预期 commit 类型对应的 semver 增量一致

---

## Phase 7：打磨与横切关注点

**目的**：CI 集成、用户体验、文档、合规检查

- [x] T025 创建 `.github/workflows/release.yml`，配置 `workflow_dispatch` 触发（输入：`channel` 选择 beta/stable，`dry_run` 布尔值），使用 `NPM_TOKEN` secret 注入鉴权，调用 `scripts/release.sh`；参见 `contracts/github-actions.md`
- [x] T026 [P] 在根 `package.json` 的 `scripts` 中新增 `"release": "scripts/release.sh"` 便捷入口（不替代直接调用脚本）
- [x] T027 [P] 在 `.npmrc` 中补充 `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}` 行，使 CI 中的 token 注入生效（本地 `npm login` 场景不受影响）
- [x] T028 [P] 在 `specs/20260408-npm-publish-workflow/quickstart.md` 中补充本地首次发布前的初始版本号设置说明（各包从 `0.1.0` 还是 `1.0.0` 开始）
- [x] T029a 在 `scripts/release-packages.mjs` 的发布前检查中，对每个待发布包执行 `npm view <pkgName> version` 获取 registry 上已有的最新版本，若待发布版本不高于已有版本（semver 比较）则中止并打印"版本倒退"错误（退出码 `1`）；首次发布（`npm view` 返回 404）视为正常，跳过此检查
- [x] T029 端到端 dry-run 验证：在 feature 分支运行 `scripts/release.sh beta --dry-run`，在 `main` 分支运行 `scripts/release.sh stable --dry-run`，确认全流程无报错、输出符合预期
- [x] T030 [P] 确认 `scripts/` 下所有文件命名符合 kebab-case（原则 VI）；JS 脚本中的函数使用箭头函数风格
- [x] T031 运行 `vp check` 确认无 lint/类型错误

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备）**：无依赖，可立即开始
- **Phase 2（基础）**：依赖 Phase 1 完成，T004～T008 阻塞所有用户故事
- **Phase 3（US1 beta）**：依赖 Phase 2；MVP 优先实现
- **Phase 4（US2 stable）**：依赖 Phase 2；可与 Phase 3 并行（修改不同代码路径）
- **Phase 5（US3 changelog）**：依赖 Phase 2；changelogen 已在基础阶段接入，本阶段为验证与配置
- **Phase 6（US4 版本推断）**：依赖 Phase 5；changelog 生成正确后再验证推断规则
- **Phase 7（打磨）**：依赖 Phase 3～6 全部完成

### 用户故事依赖

- **US1（beta）**：基础完成后即可开始，不依赖 US2
- **US2（stable）**：基础完成后即可开始，可与 US1 并行（stable 路径 vs beta 路径）
- **US3（changelog）**：基础完成后即可独立验证，不依赖 US1/US2
- **US4（版本推断）**：依赖 US3 的 changelogen 配置完成

### 并行机会

- T001、T002、T003 可全部并行
- T004～T008 内部有依赖关系，需顺序执行
- Phase 3（US1）和 Phase 4（US2）可并行（两人分工）
- Phase 5（US3）可与 Phase 3/4 并行
- T025、T026、T027、T028、T030 均可并行

---

## 执行顺序说明：Phase 3 → Phase 4（串行）

Phase 3 和 Phase 4 均修改 `scripts/release.sh`，**不可并行**。建议完成 Phase 3 后再扩展 Phase 4。

```bash
# Phase 3 内部可并行的任务（修改不同文件）：
Task A: "在 scripts/release-packages.mjs 中实现 stable 通道逻辑（T018）"
Task B: "在 scripts/release.sh 末尾实现发布摘要输出（T016）"
```

---

## 实现策略

1. **MVP（Phase 1～3）**：先跑通 beta 发布的完整路径（干跑验证），这是最高价值的切片
2. **增量（Phase 4）**：在 beta 路径通过后，复用同一脚本扩展 stable 路径
3. **配置补全（Phase 5～6）**：changelog 格式与版本推断规则大多依赖 changelogen 默认行为，多为验证而非新增代码
4. **CI（Phase 7）**：GitHub Actions workflow 是锦上添花，本地脚本可用后再接入
