# 实施计划：组件测试用例规范

**分支**：`20260409-component-testing-standards` | **日期**：2026-04-09 | **规格**：`spec.md`  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径可保留原文。

---

## 技术上下文

- 语言：TypeScript 5.x，React 19.x
- 测试框架：`vite-plus/test`（Vitest）
- 验证命令：`vp test`
- 单测文件位置：`packages/react/src/<component>/index.test.ts(x)`

---

## 宪章合规检查

| 原则                    | 状态 | 说明                                           |
| ----------------------- | ---- | ---------------------------------------------- |
| I. 包优先架构           | ✅   | 仅修改 `packages/react` 内的测试文件，不新增包 |
| II. 无障碍与 API 一致性 | ✅   | 补充 aria 断言                                 |
| III. Token 作为事实来源 | ✅   | 补充 CSS token 断言，验证无 raw palette 使用   |
| IV. 测试与预览门禁      | ✅   | 本次变更正是补足该原则要求的覆盖               |
| V. Vite+ 工作流         | ✅   | 使用 `vp test` 验证                            |
| VI. 编码规范            | ✅   | 测试文件沿用现有风格，无新函数声明引入         |
| VII. 设计系统数值       | ✅   | CSS 断言验证 token 引用符合规范                |

---

## 变更范围

本次只修改测试文件，不修改组件实现。

### 需要修改的文件

| 文件                                     | 变更内容                                                            |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `packages/react/src/text/index.test.ts`  | 移除 `void stylesheet`，补充 CSS token 断言（GAP-T-01/02）          |
| `packages/react/src/tabs/index.test.tsx` | 新增 CSS token 断言（GAP-TB-01），新增多实例独立性测试（GAP-TB-02） |
| `packages/react/src/menu/index.test.tsx` | 新增多实例独立性测试（GAP-M-01）                                    |

### 新增文件

| 文件                             | 说明                         |
| -------------------------------- | ---------------------------- |
| `docs/testing-standards.md` | 规范正文，供后续组件开发引用 |

---

## 各组件补测详情

### Text — GAP-T-01/02（CSS token 断言）

移除 `void stylesheet`，新增测试用例断言：

- `--ui-color-text`（根节点默认文字色）
- `--ui-font-body`（字体族）
- `--ui-text-size-body`（正文字号）
- `--ui-text-color-` 前缀（动态 color family token）
- `--ui-text-background-` 前缀（动态 background family token）
- 不含 `--ui-color-palette-`（不得使用 raw palette）

UT-P-07（ref 转发）：Text 未实现 `forwardRef`，标注**不适用**。

### Tabs — GAP-TB-01（CSS token 断言）

新增独立测试，读取 `index.module.less`，断言：

- `--ui-color-focus-ring`（焦点环）
- `--ui-color-border`（分割线）
- `--ui-color-brand-bg`（激活 indicator 颜色）
- `--ui-color-text`（标签文字色）
- 不含 `--ui-color-palette-`

### Tabs — GAP-TB-02（多实例独立性）

渲染两个独立 `<Tabs>` 实例，切换第一个的标签，断言第二个的激活状态不受影响。

### Menu — GAP-M-01（多实例独立性）

渲染两个独立 `<Menu>` 实例，打开第一个，断言第二个的 menu 角色节点不存在。
