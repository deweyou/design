# 契约：`@deweyou-ui/components` Button / IconButton 公开属性补齐

## Package 目的

`@deweyou-ui/components` 中的 Button 体系用于表达文本动作与图标动作。本次契约在既有 `variant` / `color` / `size` / `shape` 能力之上，补齐高频业务属性、危险态颜色、加载态和 ref-forwarding，并保持 `Button` 与 `IconButton` 的一致性。

## 公开 API 变化

- 根级 package 必须继续导出 `Button`、`ButtonProps`、`IconButton`、`IconButtonProps`。
- `Button` 与 `IconButton` 必须继续共享 `color`、`size`、受支持的 `shape` 和显式 `icon` 模型。
- `ButtonColor` 必须从 `'neutral' | 'primary'` 扩展为 `'neutral' | 'primary' | 'danger'`。
- `ButtonProps` 与 `IconButtonProps` 必须新增 `htmlType`、`href`、`target`、`loading`。
- `Button` 与 `IconButton` 必须正式支持 ref-forwarding，ref 目标必须跟随实际渲染根节点。
- `onClick` 与 `onClickCapture` 继续继承原生 button 语义，但必须在文档、类型和验证中被显式覆盖。
- 以上变化对 `@deweyou-ui/components` 属于 additive public API / behavior change，预期为 minor。

## `ButtonProps` 契约

`ButtonProps` 必须继承原生 `<button>` 语义，并继续表示文本按钮与带图标文本按钮的统一能力面。

| 属性                 | 类型                                                               | 必填 | 行为                                                                  |
| -------------------- | ------------------------------------------------------------------ | ---- | --------------------------------------------------------------------- |
| `variant`            | `'filled' \| 'outlined' \| 'ghost' \| 'link'`                      | 否   | 决定文本按钮的视觉与交互模式，默认值为 `filled`。                     |
| `color`              | `'neutral' \| 'primary' \| 'danger'`                               | 否   | 决定按钮颜色语义，默认值为 `neutral`。                                |
| `size`               | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | 否   | 决定标准尺寸级别，默认值为 `medium`。                                 |
| `shape`              | `'rect' \| 'rounded' \| 'pill'`                                    | 否   | 仅在 `filled` 与 `outlined` 中可用。                                  |
| `icon`               | `ReactNode`                                                        | 否   | 显式图标入口；有值且同时存在可见文本时进入图文按钮模式。              |
| `htmlType`           | `'button' \| 'submit' \| 'reset'`                                  | 否   | 设置原生 button `type`，不影响视觉样式。                              |
| `href`               | `string`                                                           | 否   | 存在时将根节点切换为 `<a>`，并提供原生链接激活行为。                  |
| `target`             | `string`                                                           | 否   | 仅可与 `href` 一起使用；存在时透传到 `<a>` 根节点。                   |
| `loading`            | `boolean`                                                          | 否   | 进入处理中状态；显示前置 loading 图标、阻止重复触发、呈现禁用态视觉。 |
| `onClick`            | 原生 button 点击事件                                               | 否   | 在非 loading / 非 disabled 状态下按原生 button 契约触发。             |
| `onClickCapture`     | 原生 button 捕获阶段点击事件                                       | 否   | 在非 loading / 非 disabled 状态下按原生 button 契约触发。             |
| `disabled`           | `boolean`                                                          | 否   | 显式禁用；进入 disabled 后不得交互。                                  |
| `ref`                | `Ref<HTMLElement>`                                                 | 否   | 指向实际渲染的根节点。                                                |
| 其他原生 button 属性 | 原生 button 支持范围                                               | 否   | 保持语义化 button 的标准行为，例如 `aria-*`、`name`、`value` 等。     |

### `ButtonProps` 附加规则

- 若同时提供 `htmlType` 与原生 `type`，则以 `htmlType` 为准。
- `href` 存在时必须切换到 `<a>` 根节点，并保持与现有视觉样式系统一致。
- `target` 必须依赖 `href`；若单独传入 `target`，必须抛出描述性错误。
- `loading=true` 时，按钮必须保留原有可见文本，并在内容前显示 loading 图标。
- `loading=true` 时，按钮必须阻止用户重复激活。
- `loading=true` 时，button 根节点必须暴露处理中语义，例如 `aria-busy=true`。
- `loading=true` 时，按钮视觉采用 disabled 风格，但不得显示 `not-allowed` 鼠标指针。

## `IconButtonProps` 契约

`IconButtonProps` 必须继承原生 `<button>` 语义，并表示显式的方形图标按钮模式。

| 属性                             | 类型                                                               | 必填 | 行为                                                           |
| -------------------------------- | ------------------------------------------------------------------ | ---- | -------------------------------------------------------------- |
| `variant`                        | `'filled' \| 'outlined' \| 'ghost'`                                | 否   | 决定图标按钮的视觉与交互模式，默认值为 `filled`。              |
| `color`                          | `'neutral' \| 'primary' \| 'danger'`                               | 否   | 决定图标按钮颜色语义，默认值为 `neutral`。                     |
| `size`                           | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | 否   | 决定图标按钮尺寸级别，默认值为 `medium`。                      |
| `shape`                          | `'rect' \| 'rounded' \| 'pill'`                                    | 否   | 仅在 `filled` 与 `outlined` 中可用；`ghost` 不支持。           |
| `icon`                           | `ReactNode`                                                        | 是   | 显式图标内容；`loading=false` 时显示此图标。                   |
| `htmlType`                       | `'button' \| 'submit' \| 'reset'`                                  | 否   | 设置原生 button `type`，不影响视觉样式。                       |
| `href`                           | `string`                                                           | 否   | 存在时将根节点切换为 `<a>`，并提供原生链接激活行为。           |
| `target`                         | `string`                                                           | 否   | 仅可与 `href` 一起使用；存在时透传到 `<a>` 根节点。            |
| `loading`                        | `boolean`                                                          | 否   | 进入处理中状态；用 loading 图标替换原图标，并阻止重复触发。    |
| `onClick` / `onClickCapture`     | 原生 button 点击事件                                               | 否   | 在非 loading / 非 disabled 状态下按原生 button 契约触发。      |
| `disabled`                       | `boolean`                                                          | 否   | 显式禁用；进入 disabled 后不得交互。                           |
| `aria-label` / `aria-labelledby` | 原生 ARIA 命名属性                                                 | 是   | 没有可见文本时必须至少提供其一，作为图标按钮的可访问名称来源。 |
| `ref`                            | `Ref<HTMLElement>`                                                 | 否   | 指向实际渲染的根节点。                                         |

`Button.Icon` 必须接受与 `IconButton` 相同的公开 props，并在所有状态下表现一致。

## 状态与优先级契约

- `loading` 必须是独立状态字段，不得作为 `variant` 值表达。
- `disabled` 与 `loading` 可以同时存在；二者任一为真时都必须阻止激活。
- 当 `disabled=false` 且 `loading=true` 时，按钮必须显示 loading 反馈，并阻止激活。
- 当 `disabled=true` 且 `loading=true` 时，按钮仍必须显示 loading 图标，不得退回普通 disabled 呈现。
- `loading` 采用 disabled-like 视觉层级，但鼠标指针不得使用 disabled 专属样式。

## 事件与语义契约

- `Button` 与 `IconButton` 必须保持原生 button 语义。
- `onClick` 与 `onClickCapture` 必须在非 loading / 非 disabled 时保持现有原生触发路径。
- `htmlType` 只影响表单语义，不影响 `variant`、`color`、`size` 或 `shape`。
- `href` 存在时必须采用原生链接语义；无 `href` 时继续使用 button 语义。
- `target` 只在链接路径生效。
- ref 必须始终指向真实渲染根节点。

## 无障碍契约

- `Button` 与 `IconButton` 都必须保持原生 button 键盘交互。
- `focus-visible` 状态必须在默认、danger、loading 和 disabled 邻接状态下保持可辨识。
- 任意 icon-only 按钮在默认、danger、loading 状态下都必须具备可访问名称。
- loading 状态必须仍能让辅助技术理解当前控件是按钮，且处于处理中 / 不可重复触发的状态。
- 当前实现应通过 button 根节点上的 busy 语义向辅助技术表达处理中状态。

## Token / 主题契约

- danger 颜色不得在 Button 样式中以一次性硬编码成为唯一来源。
- `packages/styles` 必须新增供 Button 使用的 danger 语义色 surface，并覆盖浅色 / 深色主题。
- `packages/components` 必须继续复用现有 disabled、focus ring、link 等共享 theme surface。

## 预览与文档契约

- `apps/storybook` 必须提供覆盖 `Button`、`IconButton`、`Button.Icon` 的 danger / loading / ref / props 评审矩阵。
- `apps/website` 必须提供推荐写法，说明 `htmlType`、`loading`、`danger`、`href` / `target` 和 ref 的使用边界。
- `packages/components/README.md` 必须更新新增 props、danger 颜色、loading 行为、ref-forwarding 和验证命令。

## 验证契约

在仓库根目录完成实现后，验证命令至少包括：

```bash
vp check
vp test
vp run components#build
vp run storybook#build
vp run website#build
```
