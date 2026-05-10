# 组件测试规范

> 版本：1.0.0 | 创建：2026-04-09  
> 每次实现或修改组件时，必须按本规范补齐对应的 Vitest 单测、contract test 和 Storybook e2e。

---

## 默认交付门禁

新增或实质修改组件时，不需要额外提醒，开发者和 AI agent 必须默认交付：

- colocated Vitest 单测：保护组件自身运行时行为。
- Storybook `Interaction` e2e：保护用户可见路径。
- contract test：当改动影响 package export、subpath、文档同步、样式治理或跨包边界时必须补齐。
- README / 知识库同步：新增公开组件必须更新 `README.md` 和 `docs/design/components.md`；有新设计决策或后续演进方向时同步写入 `docs/superpowers/specs/` 和 `docs/superpowers/plans/`。
- 验证命令：默认运行 `vp check`、`vp test`、相关 Storybook e2e；新增或修改 Storybook story 时运行 `vp run storybook#test`。

如果某一项确实不适用，必须在 PR 描述或相关文档中写明原因。

---

## 组件分类

| 类型           | 定义                                                    | 示例                                          |
| -------------- | ------------------------------------------------------- | --------------------------------------------- |
| **纯展示组件** | 无内部状态机，输出由 props 完全决定                     | `Text`、`Badge`、`Icon`                       |
| **交互型组件** | 基于 Ark UI 行为层，有 open/close、焦点管理、键盘交互等 | `Menu`、`Popover`、`Tabs`、`Select`、`Dialog` |

---

## Vitest 单测规范

组件单测只覆盖组件自身的运行时行为。不要在 colocated `index.test.ts(x)` 中读取 `package.json`、文档、Storybook story 文本或 `.module.less` 源码。

### 纯展示组件必覆盖项

| 编号    | 测试项                                                     | 方法                       |
| ------- | ---------------------------------------------------------- | -------------------------- |
| UT-P-01 | 默认 props 渲染输出符合预期（data 属性、class、HTML 结构） | `renderToStaticMarkup`     |
| UT-P-02 | 每个文档化 variant/color/size/shape 渲染正确的 data 属性   | `renderToStaticMarkup`     |
| UT-P-03 | DOM class / data attribute 能表达文档化视觉状态            | `renderToStaticMarkup`     |
| UT-P-04 | 样式相关 class 只在它属于组件状态输出时断言                | CSS Modules class 断言     |
| UT-P-05 | disabled / loading 等特殊状态渲染正确的 HTML 属性和 aria   | `renderToStaticMarkup`     |
| UT-P-06 | 非法 prop 组合抛出明确错误                                 | `expect(...).toThrow(...)` |
| UT-P-07 | ref 转发（若组件实现了 `forwardRef`）                      | 检查 `renderSurface().ref` |

### 交互型组件必覆盖项

| 编号    | 测试项                                                   | 方法                              |
| ------- | -------------------------------------------------------- | --------------------------------- |
| UT-I-01 | 触发器触发后内容区出现，role 正确                        | jsdom + `fireEvent` / `userEvent` |
| UT-I-02 | Escape 键关闭组件，`onOpenChange` 携带 `{ open: false }` | jsdom + `fireEvent.keyDown`       |
| UT-I-03 | 受控 `open` prop：外部设为 `true`/`false` 时正确切换     | jsdom + `rerender`                |
| UT-I-04 | disabled 状态不触发回调，`aria-disabled="true"` 存在     | jsdom                             |
| UT-I-05 | 主回调携带正确 payload（`onSelect`、`onValueChange` 等） | jsdom + `vi.fn()`                 |
| UT-I-06 | 选中状态反映在 `aria-checked` / `aria-selected` 上       | jsdom                             |
| UT-I-07 | 多实例独立（修改一个不影响另一个的状态）                 | jsdom                             |

> 交互型组件测试文件顶部必须声明：`// @vitest-environment jsdom`

### 格式约定

```
packages/react/src/<component-name>/
├── index.tsx
├── index.module.less
└── index.test.ts(x)   # 纯展示用 .ts，交互型用 .tsx
```

- 纯展示组件使用 `renderToStaticMarkup` + Node 环境，不需要 jsdom。
- 不测试 Ark UI 内部逻辑；只测试封装层的输出。
- 断言使用具体的值，不用 `toBeTruthy()` 替代有意义的断言。
- "不适用"项必须在测试文件注释或 PR 描述中注明原因。

---

## Contract test 规范

跨文件、跨包、构建产物、文档同步和样式治理使用 `packages/<package>/tests/*-contract.test.ts(x)`，不要放进组件 colocated test。

| 类型            | 放置位置                | 示例                                                |
| --------------- | ----------------------- | --------------------------------------------------- |
| package 边界    | `packages/react/tests`  | exports、subpath、dependency、publish manifest      |
| SSR / import    | `packages/react/tests`  | portal SSR、root/subpath import smoke               |
| 样式治理        | `packages/react/tests`  | 禁止硬编码 hex、退役 token、集中式视觉源码 contract |
| 文档同步        | `packages/react/tests`  | 从 package exports 机械校验组件文档覆盖             |
| 仓库治理        | `packages/infra/tests`  | 文件结构、story interaction 覆盖、发布契约          |
| styles 输出产物 | `packages/styles/tests` | CSS 文件、字体资产、token object 与 manifest        |

优先解析结构化数据：能 `JSON.parse(package.json)` 就不要用字符串搜索。文档测试只检查可机械推导的事实，不检查编辑文案。

---

## 样式测试规范

样式源码检查只允许出现在集中式 contract test 中，例如 `packages/react/tests/component-style-contract.test.ts`。

允许的样式源码 contract：

- 禁止硬编码颜色字面量和退役 token。
- 确认跨组件共享的 token/mixin 约束。
- 保护无法用稳定 DOM contract 表达的关键视觉实现，例如 button link underline 或 loading overlay。

不允许的样式源码 contract：

- 在组件 `index.test.ts(x)` 中读取 `index.module.less`。
- 为每个组件重复断言 `--ui-color-*`、`flex`、`box-shadow` 等实现细节。
- 用 CSS substring 代替真实交互或可访问性断言。

---

## Storybook e2e 规范

每个 `*.stories.tsx` 必须包含 `Interaction` story 并带有 `play` 函数。

`Interaction.play` 是 Storybook 文件的 e2e 覆盖入口。新增、修改、删除 story 时，必须同步维护同文件的 `Interaction.play`，并让它覆盖该文件最关键的可用性路径。

### 纯展示组件 `Interaction` 必覆盖项

| 编号     | 测试项                                                           |
| -------- | ---------------------------------------------------------------- |
| E2E-P-01 | 默认状态组件可见，关键内容渲染正确                               |
| E2E-P-02 | disabled 状态具有 `disabled` 属性，键盘 Enter/Space 不触发 click |
| E2E-P-03 | loading 状态（若有）：loading 指示器存在，按钮不可重复激活       |
| E2E-P-04 | variant / size / shape 等矩阵至少覆盖一个代表性组合              |

### 交互型组件 `Interaction` 必覆盖项

| 编号     | 测试项                                 |
| -------- | -------------------------------------- |
| E2E-I-01 | 主触发动作后内容区出现且可见           |
| E2E-I-02 | 主交互项可点击，触发预期结果           |
| E2E-I-03 | disabled 项不可交互                    |
| E2E-I-04 | Escape 键关闭浮层                      |
| E2E-I-05 | 嵌套结构（若有）覆盖一个嵌套层级的交互 |
| E2E-I-06 | 键盘导航覆盖主轴移动、选择或关闭路径   |
| E2E-I-07 | 多实例或受控状态场景至少覆盖一条路径   |

### Storybook e2e 用例维护规则

- 每个 story 文件只需要一个 `Interaction` story，但它的 `play` 应覆盖本文件的关键状态，而不是只做存在性断言。
- 新增可交互 story 时，若涉及点击、键盘、焦点、打开/关闭、选择、禁用、loading 或错误态，必须在 `Interaction.play` 中补对应断言。
- 修改 DOM 文案、role、label 或 test id 时，必须同步更新 `Interaction.play`。
- 删除 story 时，必须删除 `Interaction.play` 中对该场景的断言。
- 不在 Storybook e2e 中测试内部实现细节；优先用 role、label、visible text、aria state 和用户事件。
- 视觉只能通过浏览器可观察结果验证；不要在 `play` 里读取源码或样式文件。

### 职责边界

| Colocated Vitest        | Contract test        | Storybook e2e      | 两者都可以          |
| ----------------------- | -------------------- | ------------------ | ------------------- |
| SSR 渲染输出            | CSS 源码治理         | 真实浏览器渲染验证 | open/close 基本行为 |
| callback payload 精确值 | package exports      | 跨组件视觉集成     | disabled 状态       |
| aria 属性细节           | dependency boundary  | 子菜单 hover 展开  | 键盘 Escape         |
| 非法 prop 异常          | docs mechanical sync | 用户路径可见性验证 | 选择/激活状态       |

---

## 100% 覆盖的操作性定义

以清单完整度为门禁，而非 Istanbul 行覆盖率：

- **纯展示组件**：UT-P-01 至 UT-P-07 中适用项全部有对应测试用例。
- **交互型组件**：UT-I-01 至 UT-I-07 中适用项全部有对应测试用例，且 E2E-I-01 至 E2E-I-05 中适用项全部有断言。
