---
description: 'Storybook E2E 测试覆盖任务清单'
---

# 任务：Storybook E2E 测试覆盖

**输入**：来自 `/specs/20260408-storybook-e2e/` 的设计文档
**前置条件**：plan.md（必需）、spec.md（用户故事必需）、research.md
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；
代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：所有交互测试通过 `play` 函数在 Storybook 中执行，test-runner 负责运行。

**组织方式**：任务按用户故事分组，基础设施先行，交互测试（US1）→ 无障碍增强（US2）→ 工作流集成（US3）。

## 格式：`[ID] [P?] [Story?] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（US1、US2、US3）
- 描述中必须包含准确文件路径

---

## Phase 1：准备（依赖安装与配置）

**目的**：安装 `@storybook/test-runner`，配置 `package.json` 和测试入口。

- [x] T001 在 `apps/storybook/package.json` 的 `devDependencies` 中添加 `"@storybook/test-runner": "0.24.3"`
- [x] T002 在 `apps/storybook/package.json` 的 `scripts` 中新增 `"test": "test-storybook --url http://localhost:6106 --ci"` 脚本（T001 完成后执行，同一文件不可并行）
- [x] T003 [P] 在 `apps/storybook/.storybook/test-runner.ts` 中创建最小配置文件（导出空配置对象即可，为后续 setup/teardown 预留扩展点）
- [x] T004 在仓库根目录运行 `vp install` 安装新依赖，随后执行 `playwright install chromium` 安装 Playwright 浏览器

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：验证测试基础设施可正常运行，阻塞所有用户故事。

**⚠️ 关键**：在本阶段完成前，任何用户故事的 play 函数编写都不能开始。

- [x] T005 运行 `vp run storybook#build` 确认 Storybook 静态产物构建成功（无 TypeScript 或 Vite 错误）
- [x] T006 启动 Storybook（`vp run storybook#dev`），运行 `test-storybook --url http://localhost:6106` 确认 test-runner 可连接并执行现有 Story（均为 smoke test，应全部通过）

**检查点**：T006 通过后，用户故事阶段可并行推进。

---

## Phase 3：用户故事 1 — 组件交互行为回归测试（优先级：P1）🎯 MVP

**目标**：为 Button、Popover、Menu、Tabs 各添加一个 `Interaction` Story，
通过 `play` 函数验证鼠标点击交互行为。

**独立测试**：运行 `vp run storybook#test`，所有 Interaction Story play 函数通过
即可验证本故事，Typography / Color / Icon smoke test 同步覆盖。

### 用户故事 1 的实现

- [x] T007 [P] [US1] 在 `apps/storybook/src/stories/Button.stories.tsx` 末尾追加 `Interaction` Story：渲染一个可点击 Button 和一个 disabled Button，play 函数验证点击可点击按钮后组件无报错，disabled Button 具有 `disabled` 属性
- [x] T008 [P] [US1] 在 `apps/storybook/src/stories/Popover.stories.tsx` 末尾追加 `Interaction` Story：渲染一个带触发器的 Popover，play 函数验证点击触发器后浮层出现（`role="dialog"` 可见），再次点击或 Escape 后浮层消失
- [x] T009 [P] [US1] 在 `apps/storybook/src/stories/Menu.stories.tsx` 末尾追加 `Interaction` Story：渲染一个带触发器且包含子菜单的 Menu，play 函数验证：① 点击触发器后菜单出现（`role="menu"` 可见）；② hover 或 ArrowRight 到含子菜单的菜单项后，子菜单展开（嵌套 `role="menu"` 可见）；③ Escape 后菜单关闭
- [x] T010 [P] [US1] 在 `apps/storybook/src/stories/Tabs.stories.tsx` 末尾追加 `Interaction` Story：包含两个场景：① 非受控模式（渲染默认 Tabs），play 函数验证点击第二个 Tab 后对应面板显示，`aria-selected="true"` 转移到第二个 Tab；② 受控模式（使用现有 `Controlled` Story 或复用其 render 逻辑），play 函数验证外部 `value` 变化后对应面板正确切换

### 用户故事 1 的验证

- [x] T011 [US1] 运行 `vp run storybook#test`，确认 T007–T010 新增的 Interaction Story 全部通过，Typography / Color / Icon smoke test 同步通过；运行 `vp check` 确认 TypeScript 无报错

**检查点**：T011 通过后，US1 可独立演示，US2 可开始。

---

## Phase 4：用户故事 2 — 无障碍行为自动化验证（优先级：P2）

**目标**：在已有 `Interaction` Story 的 play 函数中追加键盘交互断言和 ARIA 属性验证。

**独立测试**：运行 `vp run storybook#test`，键盘导航相关断言全部通过即可验证本故事。

### 用户故事 2 的实现

- [x] T012 [P] [US2] 在 `apps/storybook/src/stories/Button.stories.tsx` 的 `Interaction` Story play 函数中追加：Tab 聚焦 disabled Button，断言 `aria-disabled="true"`，模拟 Enter/Space 不触发点击事件
- [x] T013 [P] [US2] 在 `apps/storybook/src/stories/Popover.stories.tsx` 的 `Interaction` Story play 函数中追加：Tab 聚焦触发器，按 Enter 展开浮层，断言焦点进入浮层内容区（`role="dialog"` 内第一个可聚焦元素获得焦点）
- [x] T014 [P] [US2] 在 `apps/storybook/src/stories/Menu.stories.tsx` 的 `Interaction` Story play 函数中追加：菜单打开后模拟 ArrowDown 导航菜单项，断言焦点在 `role="menuitem"` 间移动；若存在 disabled 菜单项，断言方向键跳过该项
- [x] T015 [P] [US2] 在 `apps/storybook/src/stories/Tabs.stories.tsx` 的 `Interaction` Story play 函数中追加：聚焦第一个 Tab 后按 ArrowRight，断言第二个 Tab 获得焦点且 `aria-selected` 同步更新

### 用户故事 2 的验证

- [x] T016 [US2] 运行 `vp run storybook#test`，确认所有键盘交互和 ARIA 断言通过；运行 `vp check` 确认无类型错误

**检查点**：T016 通过后，US1 和 US2 均可独立工作。

---

## Phase 5：用户故事 3 — 集成到 Vite+ 工作流（优先级：P3）

**目标**：确认 `vp run storybook#test` 完整可用，CI 退出码正确。

**独立测试**：在不启动 Storybook dev server 的情况下，先执行 build 再运行 test，
验证完整 CI 流程。

### 用户故事 3 的实现

- [x] T017 [US3] 验证完整 CI 流程：`vp run storybook#build && test-storybook --url http://localhost:6106 --ci`，确认测试全部通过且退出码为 0；人为注释掉一个 play 函数断言使其失败，确认退出码非零
- [x] T018 [P] [US3] 在 `apps/storybook/README.md` 中补充测试运行说明（本地命令和 CI 命令各一行）

**检查点**：T017 通过后，所有用户故事均可独立工作。

---

## Phase 6：打磨与横切关注点

**目的**：最终合规验证。

- [x] T019 [P] 运行 `vp check` 确认全量类型检查和 lint 通过
- [x] T020 [P] 确认所有新增文件使用 kebab-case 命名、Story 文件使用 `.tsx` 扩展名、play 函数使用箭头函数风格（宪章原则 VI）
- [x] T021 确认 `apps/storybook/package.json` 中 `@storybook/test-runner` 版本固定为 `0.24.3`（非范围版本），防止 CI 自动升级导致不兼容

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备）**：无依赖，立即开始
- **Phase 2（基础）**：依赖 Phase 1 完成，阻塞所有用户故事
- **Phase 3（US1）**：依赖 Phase 2 完成，T007–T010 可并行
- **Phase 4（US2）**：依赖 Phase 3 完成，T012–T015 可并行
- **Phase 5（US3）**：依赖 Phase 4 完成
- **Phase 6（打磨）**：依赖所有用户故事完成

### 并行机会

- Phase 1：T002、T003 与 T001 可并行（不同文件）
- Phase 3：T007、T008、T009、T010 完全并行（不同 Story 文件）
- Phase 4：T012、T013、T014、T015 完全并行（不同 Story 文件）
- Phase 6：T019、T020 可并行

### 并行示例：Phase 3

```bash
# 同时启动四个 Interaction Story 编写任务：
Task: "在 Button.stories.tsx 末尾追加 Interaction Story（T007）"
Task: "在 Popover.stories.tsx 末尾追加 Interaction Story（T008）"
Task: "在 Menu.stories.tsx 末尾追加 Interaction Story（T009）"
Task: "在 Tabs.stories.tsx 末尾追加 Interaction Story（T010）"
```
