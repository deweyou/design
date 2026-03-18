# 任务：为 UI Library 新增图标包

**输入**：来自 `/specs/20260317-icon-package/`
**前置条件**：`plan.md`、`spec.md`、`research.md`、`data-model.md`、`contracts/icon-package-contract.md`、`quickstart.md`

**测试**：根据宪章要求，包逻辑、无障碍语义与预览覆盖必须提供测试。下列每个用户故事都包含自动化验证任务。

**组织方式**：任务按用户故事分组，使每个故事都可以独立实现、独立验证。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可与同阶段其他已标记任务并行执行
- **[Story]**：用于追踪的用户故事标签，例如 `[US1]`、`[US2]`、`[US3]`
- 每个任务都必须包含精确文件路径

## Phase 1：准备阶段（共享基础设施）

**目的**：建立所有用户故事都需要的新 package 外壳与 workspace 接线。

- [x] T001 在 `packages/icons/package.json`、`packages/icons/tsconfig.json`、`packages/icons/vite.config.ts`、`packages/icons/README.md` 与 `packages/icons/src/index.ts` 中创建 `packages/icons` workspace package 结构
- [x] T002 在 `pnpm-workspace.yaml` 与 `packages/icons/package.json` 中更新 `tdesign-icons-svg` 所需的 workspace 依赖目录与包接线
- [x] T003 [P] 在 `packages/icons/AGENTS.md` 中新增面向图标包的包级说明与本地约束
- [x] T004 [P] 在 `apps/storybook/package.json` 与 `apps/website/package.json` 中将新包接入消费端入口与 workspace 使用文档

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都会依赖的共享 registry、属性类型与包契约。

**⚠️ 关键要求**：在本阶段完成前，不应开始任何用户故事开发。

- [x] T005 在 `packages/icons/src/icon/types.ts` 中定义共享图标类型、标准尺寸与无障碍辅助方法
- [x] T006 [P] 在 `packages/icons/src/icon-registry/index.ts` 中实现规范化的图标 registry 结构与目录元数据
- [x] T007 [P] 在 `packages/icons/src/icon-registry/normalize.ts` 中实现 `tdesign-icons-svg` 资源归一化工具
- [x] T008 在 `packages/icons/src/icon/index.tsx` 中实现基础 `Icon` 渲染契约与运行时不支持名称保护
- [x] T009 [P] 在 `packages/icons/src/index.ts` 中接通 `Icon`、`IconName`、`IconProps` 与 `IconSize` 的包导出和根入口
- [x] T010 [P] 在 `packages/icons/src/icon/index.test.tsx` 中新增针对尺寸类型安全与不支持名称失败行为的基础测试

**检查点**：基础能力已准备完成，用户故事可以独立推进。

---

## Phase 3：用户故事 1 - 消费共享图标集（优先级：P1）🎯 MVP

**目标**：交付一组精选的基础图标目录，使消费方能够通过 `Icon` 与 `XxxIcon` 导出使用它们。

**独立测试**：在一个示例消费端中引入 `@deweyou-ui/icons`，分别通过 `Icon` 和具名导出渲染多个支持的图标名称，并确认它们展示一致，且不需要直接引入上游资源。

### 用户故事 1 的测试（必需）⚠️

- [x] T011 [P] [US1] 在 `packages/icons/src/icon-registry/index.test.ts` 中新增目录唯一性与导出对齐测试
- [x] T012 [P] [US1] 在 `packages/icons/src/foundation-icons/index.test.tsx` 中新增标准尺寸、数值尺寸以及具名导出一致性的渲染测试

### 用户故事 1 的实现

- [x] T013 [P] [US1] 在 `packages/icons/src/icon-registry/foundation-catalog.ts` 中补齐基础图标目录项与源映射
- [x] T014 [P] [US1] 在 `packages/icons/src/foundation-icons/index.tsx` 中实现基础图标的具名导出
- [x] T015 [US1] 在 `packages/icons/src/icon/index.tsx` 中将基础目录与基础渲染器整合起来
- [x] T016 [US1] 在 `packages/icons/src/index.ts` 中完成基础图标对外公开的包接口
- [x] T017 [US1] 在 `packages/icons/README.md` 中记录包安装方式、导出说明和 `XxxIcon` 命名规则

**检查点**：完成后，用户故事 1 应提供一个可直接使用的图标包 MVP。

---

## Phase 4：用户故事 2 - 快速发现可用图标（优先级：P2）

**目标**：让支持的图标目录在 Storybook 中易于浏览，在 website 文档中易于理解。

**独立测试**：打开 Storybook 图标 stories 与 website 文档页面，按名称定位目标图标，并确认无需查看源码即可看到使用说明。

### 用户故事 2 的测试（必需）⚠️

- [x] T018 [P] [US2] 在 `packages/icons/src/icon-registry/storybook-catalog.test.ts` 中新增面向 Storybook 图标目录的覆盖测试
- [x] T019 [P] [US2] 在 `packages/icons/src/foundation-icons/docs-examples.test.tsx` 中新增 website 文档示例覆盖测试

### 用户故事 2 的实现

- [x] T020 [P] [US2] 在 `apps/storybook/src/stories/Icon.stories.tsx` 中新增 Storybook 图标目录与使用示例 stories
- [x] T021 [US2] 在 `apps/website/src/pages/icons.tsx` 中新增正式的图标包使用说明与精选示例
- [x] T022 [P] [US2] 在 `apps/website/src/main.tsx` 中更新 website 路由或入口接线，以接入新的图标文档界面
- [x] T023 [US2] 在 `apps/website/src/style.css` 中新增图标目录与使用示例所需的 website 样式

**检查点**：完成后，用户故事 2 应提供完整的图标发现与使用指导能力，且不会阻塞用户故事 1 的消费场景。

---

## Phase 5：用户故事 3 - 安全处理无障碍与缺失图标场景（优先级：P3）

**目标**：强制执行由 `label` 驱动的无障碍契约，并为不支持的图标名称提供明确失败行为。

**独立测试**：渲染带 `label` 和不带 `label` 的图标，验证无障碍语义，并确认通用图标在传入不支持名称时会抛出清晰错误。

### 用户故事 3 的测试（必需）⚠️

- [x] T024 [P] [US3] 在 `packages/icons/src/icon/a11y.test.tsx` 中新增带标签与不带标签图标的无障碍语义测试
- [x] T025 [P] [US3] 在 `packages/icons/src/icon/failure-states.test.tsx` 中新增不支持名称和错误状态预览测试

### 用户故事 3 的实现

- [x] T026 [P] [US3] 在 `packages/icons/src/icon/index.tsx` 中完善由 `label` 驱动的语义与 ARIA 行为
- [x] T027 [P] [US3] 在 `packages/icons/src/icon-registry/foundation-catalog.ts` 中新增面向贡献者的无障碍与替换指导元数据
- [x] T028 [US3] 在 `apps/storybook/src/stories/Icon.stories.tsx` 中新增无标签、有标签及不支持名称场景的 Storybook 覆盖
- [x] T029 [US3] 在 `packages/icons/README.md` 与 `apps/website/src/pages/icons.tsx` 中记录无障碍要求、不支持名称行为与来源说明

**检查点**：完成后，用户故事 3 应让无障碍与失败行为都变得清晰且可测试。

---

## Phase 6：收尾与跨故事事项

**目的**：完成最终清理、跨故事验证与发布前整理。

- [x] T030 [P] 在 `packages/components/tests/workspace-boundaries.test.ts` 中新增从组件层消费图标包的跨包覆盖测试
- [x] T031 [P] 在 `specs/20260317-icon-package/quickstart.md` 与 `packages/icons/README.md` 中清理图标包文案、语义化版本说明与迁移措辞
- [x] T032 在 `package.json` 中记录执行 `vp check`、`vp test`、`vp run storybook#build` 与 `vp run website#build` 的 workspace 验证命令

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备阶段）**：无依赖
- **Phase 2（基础阶段）**：依赖 Phase 1，并阻塞所有用户故事
- **Phase 3（US1）**：仅依赖 Phase 2
- **Phase 4（US2）**：依赖 Phase 2，并需要在 US1 的包导出可用后推进
- **Phase 5（US3）**：依赖 Phase 2，且应在最终收尾前完成
- **Phase 6（收尾阶段）**：依赖所有目标用户故事完成

### 用户故事依赖

- **US1（P1）**：不依赖其他用户故事，是 MVP
- **US2（P2）**：依赖 US1 提供的目录与导出，但在 package 建立后仍可独立测试
- **US3（P3）**：依赖 US1 提供的基础渲染器，但可通过包测试与 Storybook 错误状态覆盖独立验证

### 每个用户故事内部顺序

- 测试应先于实现编写，并在代码落地前先处于失败状态
- registry 与类型改动应先完成，再推进更高层的消费端示例
- package 实现应先完成，再接入 Storybook 与 website
- 文档更新应跟随其所描述的行为一起落地

### 并行机会

- **准备阶段**：T003 与 T004 可在 T001/T002 完成后并行执行
- **基础阶段**：T006、T007、T009 与 T010 可在 T005 完成后并行执行
- **US1**：T011/T012 可同时推进；T013 与 T014 可在 T015/T016 前并行执行
- **US2**：T018/T019 可同时推进；T020 与 T022 可在 T021/T023 前并行执行
- **US3**：T024/T025 可同时推进；T026 与 T027 可在 T028/T029 前并行执行
- **收尾阶段**：T030 与 T031 可在 T032 前并行执行

---

## 并行示例：用户故事 1

```bash
# 并行启动用户故事 1 的测试
Task: "在 packages/icons/src/icon-registry/index.test.ts 中新增目录唯一性与导出对齐测试"
Task: "在 packages/icons/src/foundation-icons/index.test.tsx 中新增标准尺寸、数值尺寸以及具名导出一致性的渲染测试"

# 并行启动用户故事 1 的实现任务，这些任务涉及不同文件
Task: "在 packages/icons/src/icon-registry/foundation-catalog.ts 中补齐基础图标目录项与源映射"
Task: "在 packages/icons/src/foundation-icons/index.tsx 中实现基础图标的具名导出"
```

## 并行示例：用户故事 2

```bash
# 并行构建评审界面
Task: "在 apps/storybook/src/stories/Icon.stories.tsx 中新增 Storybook 图标目录与使用示例 stories"
Task: "在 apps/website/src/main.tsx 中更新 website 路由或入口接线，以接入新的图标文档界面"
```

## 并行示例：用户故事 3

```bash
# 同时覆盖无障碍与失败语义
Task: "在 packages/icons/src/icon/a11y.test.tsx 中新增带标签与不带标签图标的无障碍语义测试"
Task: "在 packages/icons/src/icon/failure-states.test.tsx 中新增不支持名称和错误状态预览测试"
```

---

## 实施策略

### 先做 MVP（仅用户故事 1）

1. 完成 Phase 1：准备阶段
2. 完成 Phase 2：基础阶段
3. 完成 Phase 3：用户故事 1
4. 通过包测试和本地消费端示例验证 package 行为
5. 在扩展文档与边界场景前，先审查公开 API

### 渐进交付

1. 先交付 package 外壳与 registry 基础
2. 交付 US1，形成第一版可用图标包
3. 再补齐 US2 的 Storybook 与 website 发现界面
4. 接着补齐 US3 的无障碍与失败状态加固
5. 最后执行 workspace 验证并整理文档

### 并行团队策略

1. 一位工程师负责 package 外壳与 registry 基础
2. 一位工程师在 US1 导出稳定后负责 Storybook 与 website 展示界面
3. 一位工程师在基础渲染器可用后负责无障碍与失败语义加固

---

## 备注

- 所有任务都只使用 `vp` 工作流命令
- 每个用户故事都包含自动化覆盖和评审可见的预览改动
- `packages/icons` 是图标 registry 逻辑与公开图标导出的唯一归属方
- `apps/storybook` 是内部评审界面，`apps/website` 承担正式使用说明
