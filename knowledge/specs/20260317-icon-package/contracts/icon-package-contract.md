# 契约：`@deweyou-ui/icons`

## Package 目的

`@deweyou-ui/icons` 是 Deweyou UI 官方受支持图标目录的唯一公开 package。它负责图标命名、渲染行为、无障碍默认值以及面向贡献者的目录治理。

## 公开导出

- 根级 package 导出 `@deweyou-ui/icons`：仅暴露泛型 `Icon` React 组件和图标相关类型。
- Subpath 导出 `@deweyou-ui/icons/<icon-name>`：为每个受支持图标暴露一个生成出的 `XxxIcon` 组件；其行为等价于固定 `name` 的 `Icon`，并统一遵循 `XxxIcon` 命名规则。
- `IconName`：受支持官方图标名组成的 TypeScript 联合类型。
- `IconProps`：图标渲染共享 props 契约；对于命名图标导出，不包含 `name`。
- `IconSize`：标准尺寸 `extra-small`、`small`、`medium`、`large` 和 `extra-large` 的 TypeScript 联合类型。

## 通用组件契约

### `Icon` 属性

| 属性        | 类型                 | 必填 | 行为                                                  |
| ----------- | -------------------- | ---- | ----------------------------------------------------- |
| `name`      | `IconName`           | 是   | 从官方目录中选择一个图标。                            |
| `size`      | `number \| IconSize` | 否   | 控制渲染尺寸，默认值为 `medium`。                     |
| `label`     | `string`             | 否   | 提供时作为图标的可访问名称；未提供时视为装饰性图标。  |
| `className` | `string`             | 否   | 供消费者覆盖样式的主要公开钩子。                      |
| `style`     | React style object   | 否   | 用于有限的内联样式覆盖，前提是符合 package 样式规则。 |

### 语义

- 未提供 `label` 的图标以 `aria-hidden="true"` 渲染，不会被辅助技术朗读。
- 提供 `label` 的图标将以 `label` 派生出的可访问名称渲染。
- 独立图标默认不可被键盘聚焦。
- 当图标出现在交互控件内部时，整个控件仍然负责提供完整的可访问名称。

### 标准尺寸

- `extra-small`：12px
- `small`：14px
- `medium`：16px
- `large`：20px
- `extra-large`：24px

### 失败行为

- 不受支持的图标名属于契约错误。
- 当运行时输入超出官方目录时，泛型 `Icon` 组件必须抛出具有描述性的错误。
- package 不得静默替换为占位图标或空输出。

## 命名导出契约

- 每个命名导出都精确映射到一个活跃官方目录项。
- 每个命名导出都通过自身的 package subpath 被消费，例如 `@deweyou-ui/icons/search`。
- 命名导出接受与 `Icon` 相同的渲染与无障碍 props，只是不包含 `name`。
- 命名导出与泛型 `Icon` 入口必须解析到同一图标定义、同一语义和同一样式行为。
- 公开命名导出必须统一采用 `XxxIcon` 形式，例如 `AddIcon`、`ChevronRightIcon`。
- 对静态组件使用场景，应优先采用按图标 subpath 导入；泛型 `Icon` 入口保留给动态图标查找。

## 图标目录治理契约

- 官方目录必须是有限且经过维护的。
- 新增图标必须遵循项目命名规则、符合选定视觉家族，并提供预览覆盖和无障碍指导。
- 移除或重命名已发布图标前，必须明确提供迁移说明。
- 图标废弃时应尽可能给出文档化替代项。

## 评审面

- `apps/storybook` 必须包含目录浏览、代表性使用方式和显式失败行为的内部评审 stories。
- `apps/website` 必须包含 package 级使用说明和面向消费者的精选示例。
