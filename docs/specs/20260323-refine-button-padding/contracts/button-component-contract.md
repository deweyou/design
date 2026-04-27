# 契约：`@deweyou-ui/components` Button / IconButton

## Package 目的

`@deweyou-ui/components` 中的 Button 体系用于表达文本操作与图标操作。本次契约将 Button 的图标能力改为显式建模：文本按钮继续通过 `Button` 表达，方形图标按钮通过 `IconButton` 与 `Button.Icon` 表达。

## 公开 API 变化

- 根级 package 必须继续导出 `Button` 与 `ButtonProps`。
- 根级 package 必须新增 `IconButton` 与 `IconButtonProps`。
- `Button` 必须暴露 `Button.Icon` 同义入口，且它与 `IconButton` 指向同一能力契约。
- `Button` 必须新增 `icon` prop，用于显式承载图标。
- 旧的“根据 icon-only `children` 自动进入方形模式”的行为不再是标准公开契约。
- 以上变化对 `@deweyou-ui/components` 属于 breaking public API / behavior change，必须在实现时附带迁移说明。

## `ButtonProps` 契约

`ButtonProps` 必须继承原生 `<button>` 语义，并保持文本按钮与带图标文本按钮的统一能力面。

| 属性                 | 类型                                                               | 必填 | 行为                                                                |
| -------------------- | ------------------------------------------------------------------ | ---- | ------------------------------------------------------------------- |
| `variant`            | `'filled' \| 'outlined' \| 'ghost' \| 'link'`                      | 否   | 决定文本按钮的视觉与交互模式，默认值为 `filled`。                   |
| `color`              | `'neutral' \| 'primary'`                                           | 否   | 决定按钮是否切换到主题强调色，默认值为 `neutral`。                  |
| `size`               | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | 否   | 决定文本按钮的标准尺寸级别，默认值为 `medium`。                     |
| `shape`              | `'rect' \| 'rounded' \| 'pill'`                                    | 否   | 仅在 `filled` 与 `outlined` 中可用。                                |
| `icon`               | `ReactNode`                                                        | 否   | 显式图标入口；有值且存在可见文本时，进入带图标文本按钮模式。        |
| `disabled`           | `boolean`                                                          | 否   | 进入 disabled 状态后必须表现为不可交互。                            |
| 其他原生 button 属性 | 原生 button 支持范围                                               | 否   | 保持语义化 button 的标准行为，例如 `type`、`onClick`、`aria-*` 等。 |

## `IconButtonProps` 契约

`IconButtonProps` 必须继承原生 `<button>` 语义，并表示显式的方形图标按钮模式。

| 属性                             | 类型                                                               | 必填 | 行为                                                           |
| -------------------------------- | ------------------------------------------------------------------ | ---- | -------------------------------------------------------------- |
| `variant`                        | `'filled' \| 'outlined' \| 'ghost'`                                | 否   | 决定图标按钮的视觉与交互模式，默认值为 `filled`。              |
| `color`                          | `'neutral' \| 'primary'`                                           | 否   | 决定图标按钮是否切换到主题强调色，默认值为 `neutral`。         |
| `size`                           | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | 否   | 决定图标按钮的标准尺寸级别，默认值为 `medium`。                |
| `shape`                          | `'rect' \| 'rounded' \| 'pill'`                                    | 否   | 仅在 `filled` 与 `outlined` 中可用；`ghost` 不支持。           |
| `icon`                           | `ReactNode`                                                        | 是   | 显式图标内容；没有 `icon` 的 `IconButton` 请求无效。           |
| `disabled`                       | `boolean`                                                          | 否   | 进入 disabled 状态后必须表现为不可交互。                       |
| `aria-label` / `aria-labelledby` | 原生 ARIA 命名属性                                                 | 是   | 没有可见文本时必须至少提供其一，作为图标按钮的可访问名称来源。 |

`Button.Icon` 必须接受与 `IconButton` 相同的公开 props，并在所有状态下表现一致。

## 模式解析契约

- 当 `Button` 没有 `icon` 且存在可见文本时，进入纯文本按钮模式。
- 当 `Button` 同时拥有 `icon` 和可见文本时，进入带图标文本按钮模式。
- 当 `Button` 拥有 `icon` 且不存在可见文本时，必须进入与 `IconButton` 完全一致的图标按钮模式。
- 仅通过 graphic-only `children` 不得再被视为请求图标按钮模式的标准方式。

## Variant / shape 支持矩阵

| 入口          | 支持的 `variant`                      | 支持 `shape`              | 备注                               |
| ------------- | ------------------------------------- | ------------------------- | ---------------------------------- |
| `Button`      | `filled`、`outlined`、`ghost`、`link` | `filled`、`outlined` 支持 | 纯文本和带图标文本共享内容型密度   |
| `IconButton`  | `filled`、`outlined`、`ghost`         | `filled`、`outlined` 支持 | 方形尺寸；`ghost` 沿用固定内部圆角 |
| `Button.Icon` | 与 `IconButton` 完全相同              | 与 `IconButton` 完全相同  | 只是别名入口，不是新的能力面       |

`IconButton` 不支持 `link`，因为 icon-only 情况下不存在文本下划线反馈语义。

## 间距与视觉密度契约

- 纯文本 Button 必须使用面向文本阅读的内容型密度，修正“line-height + 等边内边距”带来的上下偏重。
- 带 `icon` 的文本 Button 必须复用与纯文本 Button 相同的内容型密度，不得因为存在图标而退化为方形按钮节奏。
- `IconButton` 必须使用方形点击目标和稳定居中对齐，不受文本按钮内边距优化牵连。
- 组件内部可以拆分 block/inline padding 和 square size 变量，但默认不新增公共 spacing token。

## 无障碍契约

- `Button` 与 `IconButton` 都必须保持原生 button 语义。
- 键盘用户必须能够通过标准 button 交互完成聚焦与激活。
- `focus-visible` 状态必须清晰可见。
- `disabled` 状态不得继续响应交互，也不得制造与可交互态混淆的反馈。
- 任意 `IconButton` 或 `Button` 的 icon-only 模式都必须具备可访问名称。
- `Button.Icon` 必须继承与 `IconButton` 完全一致的无障碍要求。

## Token / 主题契约

- Button 体系应优先复用 `@deweyou-ui/styles` 已公开的颜色 token 和焦点语义。
- 本期不默认扩展公共 spacing/radius/typography token surface。
- 如果实现需要额外的间距拆分变量，应优先保持为组件内部私有变量，并在文档中说明未扩大公共 theme 面。

## 预览与文档契约

- `apps/storybook` 必须提供覆盖 `Button`、`IconButton`、`Button.Icon` 的评审矩阵。
- `apps/website` 必须提供推荐写法、迁移前后对照和 icon button 示例。
- 面向 `apps/website` 的消费方验证必须基于最新的 `@deweyou-ui/components` package 产物，避免根级导出契约与 `dist` 内容脱节。
- `packages/components/README.md` 必须更新导出说明、props 说明、无障碍要求和迁移路径。
