# 契约：`@deweyou-ui/components` Text 公开排版组件

## Package 目的

`@deweyou-ui/components` 中的 `Text` 用于表达组件库里的基础文本排版层级。它覆盖普通行内文本、块级正文、说明文字和五级视觉标题，并允许在不改变根节点契约的前提下叠加常见的文本装饰、色卡高亮与最大行数限制。

## 公开 API 变化

- 根级 package 必须新增导出 `Text` 与 `TextProps`。
- `Text` 必须作为单一入口覆盖 `plain`、`body`、`caption`、`h1`、`h2`、`h3`、`h4`、`h5` 八种 `variant`。
- `TextProps` 必须新增 `italic`、`bold`、`underline`、`strikethrough`、`color`、`background`、`lineClamp`。
- `TextProps` 必须继续接受并透传常见原生节点属性。
- 以上变化对 `@deweyou-ui/components` 属于 additive public API change，预期为 minor。

## `TextProps` 契约

| 属性                | 类型                                                                     | 必填 | 行为                                                 |
| ------------------- | ------------------------------------------------------------------------ | ---- | ---------------------------------------------------- |
| `variant`           | `'plain' \| 'body' \| 'caption' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5'` | 否   | 决定文本的视觉层级和默认渲染节点，默认值为 `plain`。 |
| `italic`            | `boolean`                                                                | 否   | 启用斜体样式，可与其他布尔字段叠加。                 |
| `bold`              | `boolean`                                                                | 否   | 启用加粗样式，可与其他布尔字段叠加。                 |
| `underline`         | `boolean`                                                                | 否   | 启用下划线样式，可与其他布尔字段叠加。               |
| `strikethrough`     | `boolean`                                                                | 否   | 启用删除线样式，可与其他布尔字段叠加。               |
| `color`             | 26 色族公开 union                                                        | 否   | 选择文字颜色家族；具体色阶由当前主题自动映射。       |
| `background`        | 26 色族公开 union                                                        | 否   | 选择背景高亮颜色家族；具体色阶由当前主题自动映射。   |
| `lineClamp`         | `number`                                                                 | 否   | 仅在正整数下生效，限制最大显示行数；超出时显示省略。 |
| `children`          | `ReactNode`                                                              | 否   | 文本或混合内容。                                     |
| `className`         | `string`                                                                 | 否   | 透传到最终渲染节点。                                 |
| `style`             | 原生节点样式属性                                                         | 否   | 透传到最终渲染节点。                                 |
| `id` / `title`      | 原生节点属性                                                             | 否   | 透传到最终渲染节点。                                 |
| `role` / `tabIndex` | 原生节点属性                                                             | 否   | 透传到最终渲染节点，用于补充额外语义或键盘导航。     |
| `aria-*`            | 原生 ARIA 属性                                                           | 否   | 透传到最终渲染节点。                                 |
| `data-*`            | 自定义数据属性                                                           | 否   | 透传到最终渲染节点。                                 |
| 事件属性            | 适用于最终渲染节点的原生事件属性                                         | 否   | 透传到最终渲染节点。                                 |

## `variant` 与默认节点契约

| `variant` | 默认节点 | 层级说明                       |
| --------- | -------- | ------------------------------ |
| `plain`   | `span`   | 默认普通文本，作为行内文本入口 |
| `body`    | `div`    | 与 `plain` 同级的块级正文      |
| `caption` | `div`    | 更小且更弱的说明文字           |
| `h1`      | `h1`     | 最强标题层级                   |
| `h2`      | `h2`     | 第二级标题层级                 |
| `h3`      | `h3`     | 第三级标题层级                 |
| `h4`      | `h4`     | 第四级标题层级                 |
| `h5`      | `h5`     | 第五级标题层级                 |

### 附加规则

- `h1`-`h5` 默认直接输出对应原生标题节点，同时承担标题样式和基础语义。
- 本期不新增 `as` 或其他多态根节点能力。

## 布尔样式契约

- `italic`、`bold`、`underline`、`strikethrough` 必须全部是独立布尔字段。
- 任意组合都必须可以叠加。
- 任意组合都不得改变当前 `variant` 的默认节点或层级定义。
- 任意组合都不得依赖额外包装节点才能生效。

## 色卡高亮契约

- `color` 与 `background` 的公开取值必须都只暴露 26 个颜色家族名。
- 公开颜色家族包括 `red`、`orange`、`amber`、`yellow`、`lime`、`green`、`emerald`、`teal`、`cyan`、`sky`、`blue`、`indigo`、`violet`、`purple`、`fuchsia`、`pink`、`rose`、`slate`、`gray`、`zinc`、`neutral`、`stone`、`taupe`、`mauve`、`mist`、`olive`。
- `color` 与 `background` 不得接受任意十六进制值、自由字符串或 `50`-`950` 色阶编号。
- 浅色主题下，`color` 必须映射到较深色阶，`background` 必须映射到较浅色阶。
- 深色主题下，`color` 必须映射到较浅色阶，`background` 必须映射到较深色阶。
- 同一颜色家族在主题切换后必须保持颜色语义连续。

## `lineClamp` 契约

- `lineClamp` 只在正整数输入下生效。
- `lineClamp` 有效且内容超出时，组件必须只显示指定的最大行数，并以省略形式提示仍有未显示内容。
- `lineClamp` 未设置时，文本必须自然延展，不得默认截断。
- `lineClamp` 为 `0`、负数、非整数、`NaN` 或无穷值时，必须按“未设置”处理。

## 节点透传契约

- 透传属性必须作用于最终渲染节点，而不是额外包装层。
- `className` 必须继续作为消费方首要样式扩展入口。
- `aria-*`、`role`、`tabIndex` 必须在所有 `variant` 下继续有效。
- 事件处理字段必须继续按最终渲染节点的原生语义触发。

## 无障碍契约

- `plain`、`body`、`caption` 必须保持普通文本可读性。
- `h1`-`h5` 必须清晰表达视觉层级，并与默认输出的原生标题节点保持一致。
- `color` / `background` 在浅色 / 深色主题下都必须保持高亮内容可读。
- `lineClamp` 不得阻断节点透传的语义属性。
- `caption` 在浅色 / 深色主题下都必须保持“弱于正文但仍可读”的结果。

## Token / 主题契约

- `Text` 必须复用 `packages/styles` 中现有的字体角色、字重和弱化文本语义色。
- `packages/styles` 必须补齐 `body`、`caption`、`h1`、`h2`、`h3`、`h4`、`h5` 对应的共享字号和行高变量。
- `packages/styles` 必须新增 26 色族 x 11 色阶的共享色卡 token，并为 `Text` 提供主题映射入口。
- `packages/styles` 必须为 `Text` 暴露 `--ui-text-color-<family>` 与 `--ui-text-background-<family>` 这组语义变量，供组件在当前主题下读取映射后的文字色与背景色。
- `Text` 不得直接把公开排版层级或公开色卡长期写死在私有样式常量中。

## 预览与文档契约

- `apps/storybook/src/stories/Typography.stories.tsx` 必须提供全部 `variant`、装饰组合、色卡高亮、主题切换和 `lineClamp` 状态的内部评审矩阵。
- `apps/website/src/main.tsx` 必须提供面向消费方的 Text 推荐写法、色卡高亮和长文本截断示例。
- `packages/components/README.md` 必须记录 `Text` 的公开 props、默认节点映射、heading 默认语义、色卡高亮和验证方式。

## 验证契约

在仓库根目录完成实现后，验证命令至少包括：

```bash
vp check
vp test
vp run components#build
vp run storybook#build
vp run website#build
```
