# 任务列表：组件测试用例规范

**分支**：`20260409-component-testing-standards`

---

## Phase 1 — Text CSS token 断言（GAP-T-01/02）

- [x] **TASK-01**：`packages/react/src/text/index.test.ts` — 移除 `void stylesheet`，新增独立测试用例断言 CSS token（`--ui-color-text`、`--ui-font-body`、`--ui-text-size-body`、`--ui-text-color-` 前缀、`--ui-text-background-` 前缀），并断言不含 `--ui-color-palette-`

## Phase 2 — Tabs 补测（GAP-TB-01/02）

- [x] **TASK-02** [P]：`packages/react/src/tabs/index.test.tsx` — 新增 `Tabs stylesheet` 测试用例，读取 `index.module.less`，断言 `--ui-color-focus-ring`、`--ui-color-border`、`--ui-color-brand-bg`、`--ui-color-text`，不含 `--ui-color-palette-`
- [x] **TASK-03** [P]：`packages/react/src/tabs/index.test.tsx` — 在 `Tabs — 边界状态` describe 中新增"两个 Tabs 实例互不干扰"测试：渲染两个独立 Tabs，切换第一个，断言第二个激活标签不变

## Phase 3 — Menu 多实例独立性（GAP-M-01）

- [x] **TASK-04**：`packages/react/src/menu/index.test.tsx` — 在 `Menu — 基础开关与菜单项` describe 中新增"两个 Menu 实例互不干扰"测试：渲染两个 Menu，打开第一个，断言第二个 menu 节点不存在

## Phase 4 — 规范文档落地

- [x] **TASK-05**：创建 `knowledge/testing-standards.md`，内容从 spec.md 中的规范正文章节提取整理为独立参考文档

## Phase 5 — 验证

- [x] **TASK-06**：运行 `vp test` 确认全部测试通过
