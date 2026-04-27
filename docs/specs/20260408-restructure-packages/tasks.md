# 任务：重构 packages 结构以支持正式发包

**输入**：来自 `/specs/20260408-restructure-packages/` 的设计文档  
**前置条件**：plan.md、spec.md、research.md、contracts/package-rename-contract.md  
**语言要求**：任务名称、描述、目标、检查点必须使用简体中文；命令、文件路径可保留原文。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（不同文件、无依赖）
- **[Story]**：所属用户故事（US1/US2/US3）

---

## Phase 1：准备 — 目录重命名

**目的**：用 `git mv` 一次性完成所有目录级重命名，保留 git 历史

- [x] T001 将 `packages/components` 重命名为 `packages/react`，使用 `git mv packages/components packages/react`
- [x] T002 将 `packages/hooks` 重命名为 `packages/react-hooks`，使用 `git mv packages/hooks packages/react-hooks`
- [x] T003 将 `packages/icons` 重命名为 `packages/react-icons`，使用 `git mv packages/icons packages/react-icons`
- [x] T004 将 `packages/utils` 重命名为 `packages/infra`，使用 `git mv packages/utils packages/infra`

---

## Phase 2：基础阶段 — infra/utils 分层 + apps 引用批量更新

**目的**：确立 infra/utils 职责边界，一次性完成 apps 共享文件更新（消除跨阶段写冲突），刷新 workspace 解析

**⚠️ 关键**：本阶段完成前，用户故事阶段不得开始

- [ ] T005 更新 `packages/infra/package.json`：将 `name` 改为 `@deweyou-ui/infra`，删除 `publishConfig` 字段
- [ ] T006 [P] 新建 `packages/utils/` 空包：创建 `package.json`（`name: @deweyou-design/utils`，含 `publishConfig: { directory: dist }`、`exports: { ".": "./dist/index.mjs" }`，不声明 peerDependencies）和 `src/index.ts`（空文件占位）
- [ ] T007 [P] 更新根目录 `vite.config.ts` 中的 lint 路径：`packages/utils/src/**` → `packages/infra/src/**`
- [ ] T008 [P] 更新 `packages/infra/tests/publish-contract.test.ts` 的包名断言，反映 `@deweyou-ui/infra` 新名称
- [ ] T009 更新 `apps/storybook/package.json` 和 `apps/website/package.json`：将所有旧包名一次性替换（`@deweyou-ui/components` → `@deweyou-design/react`，`@deweyou-ui/hooks` → `@deweyou-design/react-hooks`，`@deweyou-ui/icons` → `@deweyou-design/react-icons`，`@deweyou-ui/styles` → `@deweyou-design/styles`）
- [ ] T010 更新 `apps/storybook/tsconfig.json` 和 `apps/website/tsconfig.json` 中的 paths：将所有旧包名路径一次性替换为新包名
- [ ] T011 执行 `vp install` 刷新 workspace 依赖解析，确保新包名被正确识别

**检查点**：infra 不含 publishConfig，新 `packages/utils` 结构正确，apps 共享文件已更新，`vp install` 完成

---

## Phase 3：用户故事 1 — 消费方通过 `@deweyou-design/react` 安装使用组件（优先级：P1）🎯 MVP

**目标**：`packages/react` 包名、依赖、构建配置更新；apps 中组件 import 切换；`vp run build -r` 通过

**独立测试**：`vp run build -r` 零报错，`apps/website` 组件页面正常渲染

### 用户故事 1 的实现

- [ ] T012 [US1] 更新 `packages/react/package.json`：`name` 改为 `@deweyou-design/react`；`dependencies` 中 `@deweyou-ui/hooks` → `@deweyou-design/react-hooks`，`@deweyou-ui/styles` → `@deweyou-design/styles`；`build` script 中 `../utils/scripts/` → `../infra/scripts/`
- [ ] T013 [P] [US1] 更新 `packages/react/vite.config.ts`：`external` 数组中 `@deweyou-ui/hooks` → `@deweyou-design/react-hooks`，`@deweyou-ui/styles` → `@deweyou-design/styles`
- [ ] T014 [P] [US1] 更新 `packages/react/src/text/index.tsx` 和 `packages/react/src/text/index.test.ts`：`@deweyou-ui/styles` → `@deweyou-design/styles`
- [ ] T015 [P] [US1] 批量更新 `apps/storybook/src/stories/Button.stories.tsx`、`Menu.stories.tsx`、`Popover.stories.tsx`、`Tabs.stories.tsx`、`Typography.stories.tsx` 中的 `@deweyou-ui/components/*` import → `@deweyou-design/react/*`
- [ ] T016 [US1] 更新 `apps/website/src/main.tsx`：一次性替换所有旧包名 import（`@deweyou-ui/components` → `@deweyou-design/react`，`@deweyou-ui/hooks` → `@deweyou-design/react-hooks`，`@deweyou-ui/styles` → `@deweyou-design/styles`，`@deweyou-ui/icons/*` → `@deweyou-design/react-icons/*`）

**检查点**：`packages/react` 独立构建通过；`apps/website` 组件页面正常渲染

---

## Phase 4：用户故事 2 — 图标包独立安装（优先级：P2）

**目标**：`packages/react-icons` 包名更新；apps 图标 import 切换；独立构建通过

**独立测试**：`packages/react-icons` 独立 `vp run build` 通过；`apps/website` 图标页面无报错

### 用户故事 2 的实现

- [ ] T017 [US2] 更新 `packages/react-icons/package.json`：`name` 改为 `@deweyou-design/react-icons`
- [ ] T018 [P] [US2] 更新 `packages/react-icons/scripts/organize-dist.mjs`：`../../utils/scripts/` → `../../infra/scripts/`
- [ ] T019 [P] [US2] 批量更新 `apps/storybook/src/stories/Icon.stories.tsx`、`Button.stories.tsx`（icons import 部分）、`Popover.stories.tsx` 中 `@deweyou-ui/icons/*` → `@deweyou-design/react-icons/*`
- [ ] T020 [P] [US2] 更新 `apps/website/src/pages/icons.tsx`：`@deweyou-ui/icons/*` → `@deweyou-design/react-icons/*`

**检查点**：图标包独立构建通过；apps 图标页面正常渲染

---

## Phase 5：用户故事 3 — monorepo 内部引用完整切换（优先级：P2）

**目标**：全仓库搜索旧包名结果为空；`vp check` 和 `vp test` 全量通过

**独立测试**：`grep -r "@deweyou-ui/components\|@deweyou-ui/hooks\|@deweyou-ui/icons\|@deweyou-ui/styles" --include="*.json" --include="*.ts" --include="*.tsx" --include="*.mjs" --exclude-dir=dist --exclude-dir=node_modules .` 结果为空

### 用户故事 3 的实现

- [ ] T021 [US3] 更新 `packages/react-hooks/package.json`：`name` 改为 `@deweyou-design/react-hooks`；`build` script 中 `../utils/scripts/` → `../infra/scripts/`
- [ ] T022 [P] [US3] 更新 `packages/styles/package.json`：`name` 改为 `@deweyou-design/styles`
- [ ] T023 [P] [US3] 更新 `packages/styles/scripts/copy-assets.mjs`：`../../utils/scripts/` → `../../infra/scripts/`
- [ ] T024 [P] [US3] 更新 `apps/storybook/.storybook/preview.ts`、`apps/storybook/src/stories/Color.stories.tsx`、`Typography.stories.tsx`：`@deweyou-ui/styles` → `@deweyou-design/styles`
- [ ] T025 [US3] 更新 `packages/react/tests/workspace-boundaries.test.ts`：所有包名断言（如 `@deweyou-ui/components` → `@deweyou-design/react`）和文件路径读取（如 `packages/components` → `packages/react`）全部同步
- [ ] T026 [P] [US3] 更新 `packages/styles/tests/consumer-import.test.ts`：`@deweyou-ui/components/*` → `@deweyou-design/react/*`，`@deweyou-ui/styles` → `@deweyou-design/styles`
- [ ] T027 [P] [US3] 更新 `packages/react/CLAUDE.md` 中的包名引用

**检查点**：全仓库旧包名搜索结果为空；`vp check` 通过

---

## Phase 6：打磨与验证

**目的**：补充治理文档，全量构建验证版本解析，确认所有 SC 通过

- [ ] T028 新建 `docs/architecture/package-layers.md`：写入包职责分层规则（infra = build-time 工具不发布；utils = runtime 工具；判断准则；禁止将 infra 列为 dependencies）
- [ ] T029 [P] 更新 `CLAUDE.md` 中对旧包名（`@deweyou-ui/components` 等）的引用，替换为新包名
- [ ] T030 执行 `vp run build -r` 完成全量构建
- [ ] T031 验证 SC-006：执行 `grep "workspace:\|catalog:" packages/react/dist/package.json packages/react-hooks/dist/package.json packages/react-icons/dist/package.json packages/styles/dist/package.json`，结果必须为空
- [ ] T032 执行 `vp check` 和 `vp test` 确认全量通过
- [ ] T033 [P] 确认 `packages/infra/package.json` 不含 `publishConfig`，且全仓库任何包的 `dependencies` 中均不出现 `@deweyou-ui/infra`

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1**：无依赖，所有 git mv 一次性完成
- **Phase 2**：依赖 Phase 1；T006/T007/T008 可并行；T009/T010 顺序执行（同文件）；T011 在 T009/T010 后执行
- **Phase 3/4/5**：依赖 Phase 2 全部完成；三个 Phase 可并行，US1 优先
- **Phase 6**：依赖 Phase 3、4、5 全部完成

### 并行机会

```bash
# Phase 2 并行组：
T006 新建 packages/utils/  ||  T007 更新 vite.config.ts  ||  T008 更新 infra tests

# Phase 3 并行组（T012 完成后）：
T013 vite.config.ts  ||  T014 text 组件  ||  T015 storybook stories

# Phase 4 并行组（T017 完成后）：
T018 organize-dist.mjs  ||  T019 storybook stories  ||  T020 icons.tsx

# Phase 5 并行组（T021 完成后）：
T022 styles package.json  ||  T023 copy-assets.mjs  ||  T024 storybook preview/stories  ||  T026/T027
```

---

## 实现策略

1. **先 git mv（Phase 1）**：所有目录重命名一次性完成，避免中间状态
2. **apps 共享文件集中更新（Phase 2 T009/T010）**：package.json 和 tsconfig 一次性处理所有包名，消除跨阶段写冲突
3. **main.tsx 一次性更新（T016）**：所有 import 在同一任务中完成，不跨阶段分散
4. **US1 优先完成**：核心包可用后即可验证，US2/US3 并行跟进
5. **SC-006 版本解析验证是关键门禁（T031）**：全量构建后必须确认 dist/package.json 中无 workspace/catalog 字符串
