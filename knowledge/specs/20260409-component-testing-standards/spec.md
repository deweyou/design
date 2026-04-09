# 功能规格：组件测试用例规范

**功能分支**：`20260409-component-testing-standards`  
**创建时间**：2026-04-09  
**状态**：草稿  
**输入**：用户描述："现在需要形成一套测试用例规范。每次实现一个组件，都需要补齐对应的vitest UT 和 storybook e2e，并且需要达到100%覆盖率。"  
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

---

## 背景与现状

当前项目已形成两套互补测试机制：

1. **Vitest 单测**（`packages/react/src/<component>/index.test.ts`）：覆盖 SSR 输出、CSS 源码约束、callback payload、aria 细节、边界行为。
2. **Storybook e2e**（`apps/storybook/src/stories/<Component>.stories.tsx` 中的 `Interaction` story，由 `@storybook/test-runner` 驱动）：覆盖真实浏览器中的用户交互流程。

两者分工已经清晰，本规范的目标是将这套分工**成文为强制标准**，使每个新组件的开发都默认达到 100% 覆盖。

---

## 用户场景与测试

### 用户故事 1 - 新组件开发时有明确的测试清单（优先级：P1）

开发者实现一个新组件时，能够按照明确的规范文档，知道必须写哪些 Vitest 单测、必须覆盖哪些 Storybook e2e 场景，而不需要依靠经验判断。

**为什么是这个优先级**：这是规范的核心价值。没有清单，测试覆盖率会因人而异，回归风险随组件数量线性增长。

**独立测试**：可通过"给定一个新组件的实现，使用本规范文档作为 checklist，逐条验证是否全部满足"来完整测试。

**验收场景**：

1. **假如**开发者新增一个纯展示组件（如 `Text`、`Badge`），**当**参照本规范，**那么**能找到对应的"纯展示组件"测试要求分类，明确需要覆盖的 Vitest 用例类型。
2. **假如**开发者新增一个交互型组件（如 `Select`、`Dialog`），**当**参照本规范，**那么**能找到对应的"交互型组件"测试要求分类，明确需要覆盖的 jsdom 单测 + Storybook `Interaction.play` 要求。
3. **假如**已有组件新增一个 prop 或行为分支，**当**参照本规范，**那么**能确认哪些测试需要新增或更新。

---

### 用户故事 2 - 测试覆盖率可被客观验证（优先级：P1）

PR 评审者和 CI 系统都能客观地判断某个组件是否达到了规范要求的测试覆盖，无需主观判断"这个测试够不够"。

**为什么是这个优先级**：无法客观验证的规范等于没有规范。

**独立测试**：可通过"运行 `vp test` 和 `vp run storybook#test-runner` 后，检查输出是否满足规范中定义的覆盖门禁"来验证。

**验收场景**：

1. **假如**某个组件缺少必要的 Vitest 单测，**当**运行 `vp test`，**那么**覆盖率未达门禁，CI 失败。
2. **假如** `Interaction` story 的 `play` 函数缺失或为空，**当**运行 `test-runner`，**那么**报告中体现该 story 无交互断言，违反规范。
3. **假如**所有测试都已补齐，**当**运行完整测试套件，**那么**两者均通过。

---

### 用户故事 3 - 存量组件可按规范进行补测（优先级：P2）

已有组件（`Button`、`Menu`、`Popover`、`Tabs`）可以对照本规范自查是否存在覆盖缺口，并在后续迭代中补齐。

**为什么是这个优先级**：规范对新旧组件都有价值，但新组件优先，存量组件按迭代机会补充。

**独立测试**：可通过"对照规范逐条检查现有组件的 `index.test.ts` 和 `Interaction.play`"来验证。

**验收场景**：

1. **假如**某个存量组件的 `Interaction.play` 缺少键盘操作断言，**当**对照规范，**那么**能识别出这是覆盖缺口并提 issue。
2. **假如**某个存量组件的 Vitest 单测没有覆盖 CSS token 约束，**当**对照规范，**那么**能识别为缺口。

---

### 边界情况

- 纯图标组件（`react-icons`）：几乎无行为，只需验证渲染输出，无需 jsdom 测试。
- 完全受控于 Ark UI 的组件：行为层不需重复测试 Ark UI 内部逻辑，只需测试我们封装层的行为（prop 映射、回调转换、样式输出）。
- 没有 Story 的组件：必须先补 Story 再补 e2e，规范要求两者同时存在。

---

## 需求

### 功能需求

- **FR-001**：规范必须将组件分为两类，并为每类分别定义测试要求：**纯展示组件**（无交互状态机）和**交互型组件**（基于 Ark UI 行为层）。
- **FR-002**：规范必须明确 Vitest 单测的必覆盖项清单（按组件类型区分）。
- **FR-003**：规范必须明确 Storybook `Interaction` story 的必覆盖项清单（按组件类型区分）。
- **FR-004**：规范必须定义"100% 覆盖"的操作性定义：不是 Istanbul 行覆盖率，而是针对组件公开行为的清单完整度。
- **FR-005**：规范必须规定测试文件的放置位置、命名、环境声明（`// @vitest-environment jsdom`）等格式约定。
- **FR-006**：规范必须说明 Vitest 单测与 Storybook e2e 的职责边界，避免重复断言同一行为。
- **FR-007**：规范必须包含一个可直接使用的 checklist 模板，供组件 PR 评审时使用。
- **FR-008**：规范必须与宪章第 IV 条（测试与预览门禁）保持一致，并在 checklist 中引用该条。

### 无障碍与 UI 契约

- **参与方**：组件开发者（主要使用者）、PR 评审者（验证者）、CI（自动门禁）。
- **交互模型**：本规范本身是文档，无 UI 交互。
- **需要覆盖的状态**：本规范约束的是"组件测试状态覆盖"，见下方成功标准。
- **主题 / token 影响**：无（本规范为文档型产物）。

---

## 测试规范正文

### 组件分类

| 类型           | 定义                                                    | 示例                                          |
| -------------- | ------------------------------------------------------- | --------------------------------------------- |
| **纯展示组件** | 无内部状态机，输出由 props 完全决定                     | `Text`、`Badge`、`Icon`                       |
| **交互型组件** | 基于 Ark UI 行为层，有 open/close、焦点管理、键盘交互等 | `Menu`、`Popover`、`Tabs`、`Select`、`Dialog` |

### Vitest 单测规范

#### 纯展示组件必覆盖项

| 编号    | 测试项                                                                     | 方法                             |
| ------- | -------------------------------------------------------------------------- | -------------------------------- |
| UT-P-01 | 默认 props 渲染输出符合预期（data 属性、class、HTML 结构）                 | `renderToStaticMarkup`           |
| UT-P-02 | 每个文档化 variant/color/size/shape 组合渲染正确的 data 属性               | `renderToStaticMarkup`           |
| UT-P-03 | CSS 模块引用了正确的语义 token（`--ui-color-*`），未使用 raw palette token | 读取 `.module.less` 文件内容断言 |
| UT-P-04 | CSS 模块包含所有文档化的视觉状态 class（disabled、loading 等）             | 读取 `.module.less` 文件内容断言 |
| UT-P-05 | disabled / loading 等特殊状态渲染正确的 HTML 属性和 aria                   | `renderToStaticMarkup`           |
| UT-P-06 | 非法 prop 组合抛出明确错误（如 ghost + shape）                             | `expect(...).toThrow(...)`       |
| UT-P-07 | ref 转发：公开 API 接受 `HTMLElement` ref 且正确传递                       | 检查 `renderSurface().ref`       |

#### 交互型组件必覆盖项

| 编号    | 测试项                                                                        | 方法                              |
| ------- | ----------------------------------------------------------------------------- | --------------------------------- |
| UT-I-01 | 触发器触发后浮层/内容区出现（role 正确）                                      | jsdom + `fireEvent` / `userEvent` |
| UT-I-02 | Escape 键关闭组件，`onOpenChange` 携带 `{ open: false }`                      | jsdom + `fireEvent.keyDown`       |
| UT-I-03 | 受控 `open` prop：外部设为 `true`/`false` 时正确切换                          | jsdom + `rerender`                |
| UT-I-04 | disabled 状态：不触发回调，`aria-disabled="true"` 存在                        | jsdom                             |
| UT-I-05 | 主回调（`onSelect` / `onValueChange` / `onCheckedChange` 等）携带正确 payload | jsdom + `vi.fn()` 断言            |
| UT-I-06 | 选中状态反映在 `aria-checked` / `aria-selected` 上                            | jsdom                             |
| UT-I-07 | 多实例独立（修改一个不影响另一个的状态）                                      | jsdom                             |

> 交互型组件测试文件顶部必须声明：`// @vitest-environment jsdom`

#### 通用格式约定

```
packages/react/src/<component-name>/
├── index.tsx          # 实现
├── index.module.less  # 样式
└── index.test.ts(x)   # 单测（纯展示用 .ts，交互型用 .tsx）
```

- 纯展示组件使用 `renderToStaticMarkup` + Node 环境，**不需要** `@vitest-environment jsdom`。
- 交互型组件使用 `@testing-library/react` + jsdom，顶部声明环境。
- 不测试 Ark UI 内部逻辑（状态机细节）；只测试我们封装层的输出。
- 断言应使用具体的值（`'primary'`、`{ value: 'item1' }`），不用 `toBeTruthy()` 替代有意义的断言。

---

### Storybook e2e 规范

#### 每个 `*.stories.tsx` 文件必须包含 `Interaction` story

```ts
export const Interaction: Story = {
  name: 'Interaction',
  render: () => <...>,
  play: async ({ canvasElement }) => {
    // 断言在此
  },
};
```

#### 纯展示组件 `Interaction` 必覆盖项

| 编号     | 测试项                                                           |
| -------- | ---------------------------------------------------------------- |
| E2E-P-01 | 默认状态组件可见，关键内容渲染正确                               |
| E2E-P-02 | disabled 状态具有 `disabled` 属性，键盘 Enter/Space 不触发 click |
| E2E-P-03 | 如有 loading 状态，验证 loading 指示器存在且按钮不可重复激活     |

#### 交互型组件 `Interaction` 必覆盖项

| 编号     | 测试项                                                   |
| -------- | -------------------------------------------------------- |
| E2E-I-01 | 主触发动作后，内容区出现且可见                           |
| E2E-I-02 | 主交互项可点击，触发预期结果（菜单关闭 / 选项被选中等）  |
| E2E-I-03 | disabled 项不可交互                                      |
| E2E-I-04 | Escape 键关闭浮层                                        |
| E2E-I-05 | 如有嵌套结构（子菜单、多级 tab），覆盖一个嵌套层级的交互 |

#### e2e 与 Vitest 的职责边界

| 只在 Vitest 单测中      | 只在 Storybook e2e 中 | 两者都可以          |
| ----------------------- | --------------------- | ------------------- |
| CSS 源码内容断言        | 真实浏览器渲染验证    | open/close 基本行为 |
| SSR 渲染输出            | 跨组件视觉集成        | disabled 状态       |
| callback payload 精确值 | 子菜单 hover 展开     | 键盘 Escape         |
| aria 属性细节           | —                     | —                   |
| 非法 prop 异常          | —                     | —                   |

**原则**：e2e 关注"用户能否完成操作"，Vitest 关注"组件行为是否精确"。避免在 e2e 中用 `vi.fn()` 断言 callback payload（测试环境差异风险）。

---

### 100% 覆盖的操作性定义

本规范不以 Istanbul 行覆盖率作为门禁，而以以下清单完整度作为标准：

**纯展示组件**：UT-P-01 至 UT-P-07 中，适用于该组件的项全部有对应测试用例。

**交互型组件**：UT-I-01 至 UT-I-07 中，适用于该组件的项全部有对应测试用例，且 E2E-I-01 至 E2E-I-05 中适用项全部有断言。

"不适用"必须在 PR 描述或测试文件注释中注明原因。

---

---

## 存量组件覆盖缺口（本次同步补齐）

通过对现有 5 个组件测试文件的逐项比对，发现以下缺口：

### Text（纯展示组件）

| 缺口编号 | 对应规范项 | 说明                                                                                                                              |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GAP-T-01 | UT-P-03    | `stylesheet` 在文件顶部被 `void` 掉，CSS token 断言缺失（未验证 `--ui-text-color-*`、`--ui-text-background-*` 等语义 token 存在） |
| GAP-T-02 | UT-P-04    | 同上，loading/disabled 等状态 CSS class 未从 stylesheet 断言                                                                      |
| GAP-T-03 | UT-P-07    | 无 ref 转发测试                                                                                                                   |

### Tabs（交互型组件）

| 缺口编号  | 对应规范项 | 说明                                                        |
| --------- | ---------- | ----------------------------------------------------------- |
| GAP-TB-01 | UT-P-03/04 | 无任何 CSS token / class 断言（未读取 `index.module.less`） |
| GAP-TB-02 | UT-I-07    | 无多实例独立性测试                                          |

### Menu（交互型组件）

| 缺口编号 | 对应规范项 | 说明               |
| -------- | ---------- | ------------------ |
| GAP-M-01 | UT-I-07    | 无多实例独立性测试 |

### Button / Popover

无缺口，已完整覆盖所有适用规范项。

---

## 成功标准

- **SC-001**：本规范文档发布后，新增组件的 PR 必须在描述中引用本规范 checklist，并逐项确认。
- **SC-002**：本次同步补齐 Text、Tabs、Menu 的上述缺口，`vp test` 全部通过。
- **SC-003**：`vp test` 和 `vp run storybook#test-runner`（或等效命令）在 CI 中全部通过，是合并的硬性门禁。
- **SC-004**：评审者在批准组件 PR 时，应能在 PR checklist 中看到测试规范合规项。
