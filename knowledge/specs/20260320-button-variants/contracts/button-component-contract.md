# 契约：`@deweyou-ui/components` Button

## Package 目的

`@deweyou-ui/components` 中的 Button 是 Deweyou UI 的基础交互组件，用于表达主操作、次级操作和两类轻量文本操作。该契约定义其公开命名、`variant` 选择、`color` 模式、`shape` 支持矩阵、无障碍要求和评审覆盖范围。

## 公开 API 变化

- 根级 package 导出必须以 `Button` 作为组件主入口。
- 根级 package 导出必须以 `ButtonProps` 作为该组件的主要 props 类型。
- `FoundationButton`、`FoundationButtonProps` 和 `buttonCustomizationContract` 不再作为该组件的标准公开契约。
- 这组导出变更对 `@deweyou-ui/components` 属于 breaking public API change，必须在实现时附带迁移说明。

## `ButtonProps` 契约

`ButtonProps` 必须继承原生 `<button>` 的语义行为，并在此基础上增加与设计系统相关的公开配置项。

| 属性                 | 类型                                                               | 必填 | 行为                                                                 |
| -------------------- | ------------------------------------------------------------------ | ---- | -------------------------------------------------------------------- |
| `variant`            | `'filled' \| 'outlined' \| 'ghost' \| 'link'`                      | 否   | 决定按钮的主要视觉与交互模式，默认值为 `filled`。                    |
| `color`              | `'neutral' \| 'primary'`                                           | 否   | 决定按钮保持中性色还是切换到主题强调色，默认值为 `neutral`。         |
| `size`               | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | 否   | 决定按钮的标准尺寸级别，默认值为 `medium`。                          |
| `shape`              | `'rect' \| 'rounded' \| 'pill'`                                    | 否   | 仅在 `filled` 与 `outlined` 中可用；对不支持的组合必须给出明确反馈。 |
| `disabled`           | `boolean`                                                          | 否   | 进入 disabled 状态后必须表现为不可交互。                             |
| `className`          | `string`                                                           | 否   | 允许消费者附加根级类名，但不暴露内部私有类名契约。                   |
| 其他原生 button 属性 | 原生 button 支持范围                                               | 否   | 保持语义化 button 的标准行为，例如 `type`、`onClick`、`aria-*` 等。  |

后续若引入 `loading`、`selected` 等能力，也必须作为独立字段，而不是新的 `variant`。

## Variant / color / shape 矩阵

| Variant    | `neutral` 行为         | `primary` 行为         | 支持 shape                | 默认 shape | 备注                                         |
| ---------- | ---------------------- | ---------------------- | ------------------------- | ---------- | -------------------------------------------- |
| `filled`   | 黑白灰实心层级反馈     | 主题色实心层级反馈     | `rect`、`rounded`、`pill` | `rounded`  | 用于主操作                                   |
| `outlined` | 中性色描边与文字反馈   | 主题色描边与文字反馈   | `rect`、`rounded`、`pill` | `rounded`  | 用于次级操作                                 |
| `ghost`    | 中性色背景 hover 反馈  | 主题色背景 hover 反馈  | 不支持                    | N/A        | 轻量文本操作，默认圆角固定为 `0.4rem`        |
| `link`     | 中性色文本与下划线反馈 | 主题色文本与下划线反馈 | 不支持                    | N/A        | 像链接一样的轻量操作，使用更轻的文本流内边距 |

## 内容与 icon 契约

- 无可见文本只是内容与无障碍条件，不是独立公开 props，也不会自动触发方形按钮等专用布局模式。
- `filled` 与 `outlined` 使用统一的四边内边距模型，实体按钮高度由字号、行高和 padding 共同驱动，不再额外依赖固定 `min-height`；`ghost` 与 `link` 必须使用更轻的文本流内边距和更紧凑的 icon / 文本间距。
- `filled`、`outlined` 与 `ghost` 默认应保持单行不换行；`link` 作为文本流动作可以在受限宽度下换行。
- 当 `filled`、`outlined` 或 `ghost` 的文案过长且容器宽度受限时，文本应以单行省略号截断，而不是自动换行到多行。
- `ghost` 的默认圆角固定为 `0.4rem`，适用于所有内容模式，而不是只针对纯图标内容做特化。
- 当 icon 未显式传入 `size` 时，必须默认继承周围字号，以便随 Button `size` 一起缩放。
- icon 渲染器必须使用稳定的方形 wrapper，并在源 `viewBox` 非正方形时补齐为正方形视口，降低按钮内容区中的占位偏差。

## 无障碍契约

- Button 必须保持原生 button 语义。
- 键盘用户必须能够通过标准 button 交互方式完成聚焦与激活。
- `focus-visible` 状态必须清晰可见。
- `disabled` 状态不得继续响应交互，也不得制造与可交互态混淆的反馈。
- 任何没有可见文本的 Button 都必须具备可访问名称。
- `ghost` 与 `link` 都必须保持足够清晰的交互反馈与可点击目标。
- 无可见文本按钮的可访问名称要求独立于布局实现存在，即使未来调整 icon 呈现方式，也不得回退这条校验。

## Token / 主题契约

- Button 应优先复用 `@deweyou-ui/styles` 已公开的颜色 token。
- `color="neutral"` 必须保持在库拥有的黑白灰中性色规则内；`color="primary"` 才允许切换到主题强调色 token。
- Button 不应在本期默认扩展公共 radius、spacing 或 typography token surface。
- website 与 Storybook 的页面底色和 surface 应与主题方向保持一致，并收敛为浅色白底、深夜模式黑底。
- 若实现确实需要新增公共 token，必须在 package 文档和迁移说明中明确记录其用途与覆盖边界。

## 预览与文档契约

- `apps/storybook` 必须提供覆盖全部 `variant`、`color`、size、支持 `shape`、`disabled`、focus-visible、纯图标内容及边界说明的内部评审故事。
- `apps/website` 必须提供面向消费者的 Button 精选示例与使用指导，并明确说明默认 `neutral` 与显式 `primary` 的选择规则。
- Storybook 与 website 中的纯图标示例必须反映“仅保留无障碍约束、不自动切换专用方形布局”的当前契约。
- website 文档不能成为 Button 行为的唯一事实来源；可复用规则必须首先定义在 package 契约中。
