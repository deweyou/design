# 数据模型：Storybook Story 结构

**分支**：`20260330-storybook-docs-upgrade` | **日期**：2026-03-30

本文档描述每个受影响 story 文件的目标结构——包括分类路径、argTypes 字段定义，以及组件公开 API 的 prop 列表。

---

## 通用 Story Meta 结构

```typescript
const meta = {
  title: '<Category>/<Name>',       // 例：'Components/Button'
  component: ComponentExport,
  tags: ['autodocs'],               // 触发 Storybook 自动文档生成
  argTypes: {
    [propName]: {
      description: string,           // 英文描述，说明 prop 用途
      control: { type: ControlType } | false,
      options?: string[],             // 用于 select/radio 控件
      table: {
        type: { summary: string },    // TypeScript 类型摘要
        defaultValue: { summary: string },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: string,            // 英文的组件级说明
      },
    },
  },
} satisfies Meta<typeof ComponentExport>;
```

---

## Button（`Components/Button`）

### argTypes 定义

| Prop       | Control | 类型摘要                                                           | 默认值      |
| ---------- | ------- | ------------------------------------------------------------------ | ----------- |
| `variant`  | select  | `'filled' \| 'outlined' \| 'ghost' \| 'link'`                      | `'filled'`  |
| `color`    | select  | `'neutral' \| 'primary' \| 'danger'`                               | `'neutral'` |
| `size`     | select  | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'medium'`  |
| `shape`    | select  | `'rect' \| 'rounded' \| 'pill'`                                    | `'auto'`    |
| `disabled` | boolean | `boolean`                                                          | `false`     |
| `loading`  | boolean | `boolean`                                                          | `false`     |
| `href`     | text    | `string \| undefined`                                              | —           |
| `target`   | text    | `string \| undefined`                                              | —           |
| `htmlType` | select  | `'button' \| 'submit' \| 'reset'`                                  | `'button'`  |
| `icon`     | —       | `ReactNode`                                                        | —           |
| `children` | text    | `ReactNode`                                                        | —           |

**约束说明**（在 component description 中体现）：

- `link` variant 不支持 `shape`
- `href` prop 存在时，根节点切换为 `<a>`
- `icon` + 无 `children` 时等价于 IconButton，需提供 `aria-label`

### IconButton（subcomponent 或独立 story section）

| Prop         | Control | 类型摘要                                                           | 默认值      |
| ------------ | ------- | ------------------------------------------------------------------ | ----------- |
| `icon`       | —       | `ReactNode`（必填）                                                | —           |
| `variant`    | select  | `'filled' \| 'outlined' \| 'ghost'`                                | `'filled'`  |
| `color`      | select  | `'neutral' \| 'primary' \| 'danger'`                               | `'neutral'` |
| `size`       | select  | `'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | `'medium'`  |
| `shape`      | select  | `'rect' \| 'rounded' \| 'pill'`                                    | `'auto'`    |
| `disabled`   | boolean | `boolean`                                                          | `false`     |
| `loading`    | boolean | `boolean`                                                          | `false`     |
| `aria-label` | text    | `string`（必要时）                                                 | —           |

---

## Typography（`Components/Typography`）

组件：`Text`（from `@deweyou-ui/components/text`）

| Prop            | Control | 类型摘要                                                                 | 默认值    |
| --------------- | ------- | ------------------------------------------------------------------------ | --------- |
| `variant`       | select  | `'plain' \| 'body' \| 'caption' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5'` | `'plain'` |
| `bold`          | boolean | `boolean`                                                                | `false`   |
| `italic`        | boolean | `boolean`                                                                | `false`   |
| `underline`     | boolean | `boolean`                                                                | `false`   |
| `strikethrough` | boolean | `boolean`                                                                | `false`   |
| `color`         | select  | `ColorFamilyName`（26 种色族）                                           | —         |
| `background`    | select  | `ColorFamilyName`                                                        | —         |
| `lineClamp`     | number  | `number \| undefined`                                                    | —         |
| `children`      | text    | `ReactNode`                                                              | —         |

**说明**：`variant` 决定渲染的 HTML 元素（`plain` → `<span>`，`body`/`caption` → `<div>`，`h1`-`h5` → 对应标题元素）。

---

## Popover（`Components/Popover`）

组件：`Popover`（from `@deweyou-ui/components/popover`）

| Prop                   | Control | 类型摘要                                          | 默认值      |
| ---------------------- | ------- | ------------------------------------------------- | ----------- |
| `content`              | —       | `ReactNode`（必填）                               | —           |
| `trigger`              | select  | `'click' \| 'hover' \| 'focus' \| 'context-menu'` | `'click'`   |
| `placement`            | select  | 8 种方位值                                        | `'bottom'`  |
| `shape`                | select  | `'rect' \| 'rounded'`                             | `'rounded'` |
| `mode`                 | select  | `'card' \| 'loose' \| 'pure'`                     | `'card'`    |
| `visible`              | boolean | `boolean \| undefined`                            | —           |
| `defaultVisible`       | boolean | `boolean`                                         | `false`     |
| `disabled`             | boolean | `boolean`                                         | `false`     |
| `offset`               | number  | `number`                                          | `8`         |
| `boundaryPadding`      | number  | `number`                                          | `16`        |
| `onVisibleChange`      | —       | `(visible, details) => void`                      | —           |
| `overlayClassName`     | text    | `string \| undefined`                             | —           |
| `popupPortalContainer` | —       | `HTMLElement \| ShadowRoot \| ...`                | —           |
| `children`             | —       | `ReactNode`（trigger 元素）                       | —           |

---

## Icon（`Components/Icon`）

组件：`Icon`（from `@deweyou-ui/icons`）

| Prop        | Control | 类型摘要                            | 默认值 |
| ----------- | ------- | ----------------------------------- | ------ |
| `name`      | select  | `IconName`（registry 中所有图标名） | —      |
| `size`      | select  | `IconSize`                          | —      |
| `label`     | text    | `string \| undefined`（无障碍标签） | —      |
| `className` | text    | `string \| undefined`               | —      |
| `style`     | —       | `CSSProperties \| undefined`        | —      |

**说明**：图标默认继承 `currentColor`；`label` 是唯一公开的无障碍钩子，若不传则图标为装饰性（aria-hidden）。

---

## Menu（`Components/Menu`）

组件：`Menu`、`MenuItem`、`MenuCheckboxItem`、`MenuRadioItem` 等（均来自 `@deweyou-ui/components/menu`）

### Menu（根容器）

| Prop           | Control | 类型摘要                         | 默认值      |
| -------------- | ------- | -------------------------------- | ----------- |
| `size`         | select  | `'small' \| 'medium' \| 'large'` | `'medium'`  |
| `shape`        | select  | `'rect' \| 'rounded'`            | `'rounded'` |
| `open`         | boolean | `boolean \| undefined`           | —           |
| `defaultOpen`  | boolean | `boolean`                        | `false`     |
| `onOpenChange` | —       | `(open: boolean) => void`        | —           |

### MenuItem

| Prop            | Control | 类型摘要         | 默认值  |
| --------------- | ------- | ---------------- | ------- |
| `value`         | text    | `string`（必填） | —       |
| `disabled`      | boolean | `boolean`        | `false` |
| `closeOnSelect` | boolean | `boolean`        | `true`  |
| `children`      | —       | `ReactNode`      | —       |

### MenuCheckboxItem

| Prop             | Control | 类型摘要               | 默认值  |
| ---------------- | ------- | ---------------------- | ------- |
| `value`          | text    | `string`（必填）       | —       |
| `checked`        | boolean | `boolean \| undefined` | —       |
| `defaultChecked` | boolean | `boolean`              | `false` |
| `disabled`       | boolean | `boolean`              | `false` |

### MenuRadioItem / MenuRadioGroup

| Prop       | Control | 类型摘要         | 默认值  |
| ---------- | ------- | ---------------- | ------- |
| `value`    | text    | `string`（必填） | —       |
| `disabled` | boolean | `boolean`        | `false` |

---

## Color（`Foundations/Color`）

无 argTypes（非组件 story，为设计 token 展示页）。仅更新 `title` 和 `description` 为英文。

| 属性                    | 当前值                | 目标值                          |
| ----------------------- | --------------------- | ------------------------------- |
| `title`                 | `'Foundations/Color'` | `'Foundations/Color'`（已正确） |
| `component description` | 含中文                | 全英文                          |
