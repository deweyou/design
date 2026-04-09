# 组件测试规范

> 版本：1.0.0 | 创建：2026-04-09  
> 每次实现或修改组件时，必须按本规范补齐对应的 Vitest 单测和 Storybook e2e。

---

## 组件分类

| 类型           | 定义                                                    | 示例                                          |
| -------------- | ------------------------------------------------------- | --------------------------------------------- |
| **纯展示组件** | 无内部状态机，输出由 props 完全决定                     | `Text`、`Badge`、`Icon`                       |
| **交互型组件** | 基于 Ark UI 行为层，有 open/close、焦点管理、键盘交互等 | `Menu`、`Popover`、`Tabs`、`Select`、`Dialog` |

---

## Vitest 单测规范

### 纯展示组件必覆盖项

| 编号    | 测试项                                                             | 方法                         |
| ------- | ------------------------------------------------------------------ | ---------------------------- |
| UT-P-01 | 默认 props 渲染输出符合预期（data 属性、class、HTML 结构）         | `renderToStaticMarkup`       |
| UT-P-02 | 每个文档化 variant/color/size/shape 渲染正确的 data 属性           | `renderToStaticMarkup`       |
| UT-P-03 | CSS 模块引用语义 token（`--ui-color-*`），未使用 raw palette token | 读取 `.module.less` 内容断言 |
| UT-P-04 | CSS 模块包含所有文档化的视觉状态 class                             | 读取 `.module.less` 内容断言 |
| UT-P-05 | disabled / loading 等特殊状态渲染正确的 HTML 属性和 aria           | `renderToStaticMarkup`       |
| UT-P-06 | 非法 prop 组合抛出明确错误                                         | `expect(...).toThrow(...)`   |
| UT-P-07 | ref 转发（若组件实现了 `forwardRef`）                              | 检查 `renderSurface().ref`   |

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

## Storybook e2e 规范

每个 `*.stories.tsx` 必须包含 `Interaction` story 并带有 `play` 函数。

### 纯展示组件 `Interaction` 必覆盖项

| 编号     | 测试项                                                           |
| -------- | ---------------------------------------------------------------- |
| E2E-P-01 | 默认状态组件可见，关键内容渲染正确                               |
| E2E-P-02 | disabled 状态具有 `disabled` 属性，键盘 Enter/Space 不触发 click |
| E2E-P-03 | loading 状态（若有）：loading 指示器存在，按钮不可重复激活       |

### 交互型组件 `Interaction` 必覆盖项

| 编号     | 测试项                                 |
| -------- | -------------------------------------- |
| E2E-I-01 | 主触发动作后内容区出现且可见           |
| E2E-I-02 | 主交互项可点击，触发预期结果           |
| E2E-I-03 | disabled 项不可交互                    |
| E2E-I-04 | Escape 键关闭浮层                      |
| E2E-I-05 | 嵌套结构（若有）覆盖一个嵌套层级的交互 |

### 职责边界

| 只在 Vitest             | 只在 Storybook e2e | 两者都可以          |
| ----------------------- | ------------------ | ------------------- |
| CSS 源码内容断言        | 真实浏览器渲染验证 | open/close 基本行为 |
| SSR 渲染输出            | 跨组件视觉集成     | disabled 状态       |
| callback payload 精确值 | 子菜单 hover 展开  | 键盘 Escape         |
| aria 属性细节           | —                  | —                   |
| 非法 prop 异常          | —                  | —                   |

---

## 100% 覆盖的操作性定义

以清单完整度为门禁，而非 Istanbul 行覆盖率：

- **纯展示组件**：UT-P-01 至 UT-P-07 中适用项全部有对应测试用例。
- **交互型组件**：UT-I-01 至 UT-I-07 中适用项全部有对应测试用例，且 E2E-I-01 至 E2E-I-05 中适用项全部有断言。
