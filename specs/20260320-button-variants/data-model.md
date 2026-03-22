# 数据模型：重构 Button 组件基础能力

## 实体：按钮公开契约

- **目的**：表示 `@deweyou-ui/components` 对外暴露的 Button API 表面。
- **字段**：
  - `componentName`：公开组件名，固定为 `Button`
  - `propsTypeName`：公开 props 类型名，固定为 `ButtonProps`
  - `variantNames`：支持的 `variant` 列表
  - `colorNames`：支持的 `color` 列表
  - `sizeNames`：支持的尺寸列表
  - `shapeNames`：支持的 `shape` 列表
  - `deprecatedExports`：本次重构后不再作为主要公开契约的旧导出名
  - `futureStateFields`：后续扩展时必须以独立字段存在的状态/语义能力，例如 `loading`、`selected`
  - `semverImpact`：本次公开 API 变化对应的版本语义
- **校验规则**：
  - `componentName` 与 `propsTypeName` 必须与 spec 一致。
  - `variantNames`、`colorNames`、`sizeNames`、`shapeNames` 中的值必须唯一。
  - `deprecatedExports` 中的项目必须与迁移说明同步出现。

## 实体：按钮 Color 定义

- **目的**：表示按钮是否保持黑白灰中性色，还是显式切换到主题强调色。
- **字段**：
  - `name`：`neutral` 或 `primary`
  - `isDefault`：是否为默认 color
  - `filledBehavior`：对 `filled` 的背景与文字色影响
  - `nonFilledBehavior`：对 `outlined`、`ghost`、`link` 的边框、hover、文字或下划线影响
- **校验规则**：
  - `neutral` 必须是默认值。
  - `primary` 必须显式复用 theme accent token，而不是引入新的 `variant`。

## 实体：按钮 Variant 定义

- **目的**：表示单个 `variant` 的视觉层级、交互反馈与适用边界。
- **字段**：
  - `name`：`filled`、`outlined`、`ghost` 或 `link`
  - `emphasisLevel`：该 variant 的视觉强调等级
  - `hoverFeedback`：hover 的主要反馈方式，例如背景变化或下划线
  - `contentDensityRole`：该 variant 在内容流中的密度角色，例如实体按钮或轻量文本动作
  - `supportsShape`：该 variant 是否暴露 `shape` 能力
  - `supportedShapes`：允许的 `shape` 列表
  - `defaultShape`：当该 variant 支持 `shape` 时的默认值
- **校验规则**：
  - `name` 必须来自公开支持列表。
  - `supportsShape=false` 时，`supportedShapes` 必须为空。
  - `name=ghost` 或 `name=link` 时，`supportsShape=false`。
  - `name=ghost` 或 `name=link` 时，`contentDensityRole` 必须为轻量文本动作，而不是实体按钮。
  - `filled` 与 `outlined` 的默认 `shape` 必须一致。

## 实体：按钮尺寸定义

- **目的**：表示按钮在不同密度下的标准尺寸级别。
- **字段**：
  - `name`：`extra-small`、`small`、`medium`、`large`、`extra-large`
  - `densityRole`：该尺寸对应的界面密度定位
  - `isDefault`：是否为默认尺寸
  - `supportedVariants`：该尺寸允许出现的 variant 列表
- **校验规则**：
  - 尺寸名称必须唯一。
  - 默认尺寸必须且只能有一个。
  - 所有公开 `variant` 都必须至少支持一个标准尺寸。

## 实体：按钮形状定义

- **目的**：表示 `filled` / `outlined` 按钮外轮廓的标准 `shape` 及其适用范围。
- **字段**：
  - `name`：`rect`、`rounded`、`pill`
  - `availableForVariants`：可使用该 `shape` 的 variant 列表
  - `isDefaultFor`：默认使用该 `shape` 的 variant 列表
  - `visualIntent`：该 `shape` 的主要视觉用途
- **校验规则**：
  - `ghost` 与 `link` 不得出现在任何 `availableForVariants` 中。
  - `filled` 与 `outlined` 的默认 `shape` 必须一致。

## 实体：按钮状态字段

- **目的**：表示不属于 `variant` 的语义或状态能力。
- **字段**：
  - `name`：例如 `disabled`、`loading`、`selected`
  - `kind`：`state` 或 `semantic`
  - `isInScopeNow`：是否属于当前阶段必须实现的字段
  - `mustStayIndependentFromVariant`：是否必须保持与 `variant` 解耦
- **校验规则**：
  - `disabled` 必须存在，且 `isInScopeNow=true`。
  - `loading`、`selected` 可以暂不完整实现，但 `mustStayIndependentFromVariant` 必须为 `true`。

## 实体：按钮使用请求

- **目的**：表示消费者一次具体的按钮配置请求，用于约束支持矩阵和无障碍规则。
- **字段**：
  - `variant`：消费者选择的 `variant`
  - `color`：消费者选择的颜色模式，`neutral` 或 `primary`
  - `size`：消费者选择的尺寸
  - `shape`：可选 `shape`，仅在支持该能力的 variant 中可用
  - `disabled`：是否禁用
  - `hasVisibleText`：是否存在可见文字内容
  - `hasIconGraphic`：是否存在 icon 图形内容
  - `accessibleNameProvided`：在无可见文本时是否提供可访问名称
  - `loading`：可选加载状态字段，占位表示未来扩展方向
  - `selected`：可选选中状态字段，占位表示未来扩展方向
- **校验规则**：
  - 当 `hasVisibleText=false` 时，必须满足 `accessibleNameProvided=true`。
  - 仅当 `variant` 支持 `shape` 时，`shape` 才允许出现。
  - `ghost` 与 `link` 请求出现 `shape` 时必须被视为无效组合。
  - `hasVisibleText=false` 不得被解释为自动启用专用布局模式；它只表示内容边界和无障碍要求。
  - `color`、`loading`、`selected` 不得影响 `variant` 的取值集合；`color` 只能在 `neutral` 与 `primary` 中取值。

## 实体：按钮预览场景

- **目的**：表示 Storybook 或 website 中一个用于评审的按钮示例。
- **字段**：
  - `scenarioId`：稳定的示例标识
  - `surface`：`storybook` 或 `website`
  - `variantsCovered`：该示例覆盖的 variant 列表
  - `colorsCovered`：该示例覆盖的 `color` 列表
  - `sizesCovered`：该示例覆盖的尺寸列表
  - `shapesCovered`：该示例覆盖的 `shape` 列表
  - `statesCovered`：该示例覆盖的状态列表
  - `contentMode`：`text-only`、`text-with-icon` 或 `icon-only`
  - `purpose`：该示例是用于内部矩阵评审还是公开指导
- **校验规则**：
  - `storybook` 必须覆盖所有支持的 `variant`、`color` 和边界状态。
  - `website` 必须至少覆盖一组精选使用方式和主题/安装指导语境。
  - 至少一个场景必须覆盖无可见文本按钮的可访问名称要求。
  - `contentMode=icon-only` 仅用于描述示例内容，不代表 Button 对外暴露了独立 icon-only 布局模式。
  - 任何不支持组合的说明都必须至少在一个预览场景中可见。

## 实体：图标渲染约束

- **目的**：表示 Button 内 icon 在未显式传入尺寸时的缩放与占位规则。
- **字段**：
  - `defaultSizeMode`：默认尺寸策略，当前为“继承周围字号”
  - `wrapperShape`：icon 外层占位 wrapper 的几何约束，当前为正方形
  - `normalizesViewBox`：当源 `viewBox` 非正方形时是否自动补方
- **校验规则**：
  - `defaultSizeMode` 必须允许 icon 在 Button `size` 变化时一起缩放。
  - `wrapperShape` 必须稳定为正方形，避免直接受行高环境影响。
  - `normalizesViewBox=true` 时，补方逻辑不得改变原始 path 数据，只能调整视口。

## 状态迁移

- `default -> hover`：仅适用于可交互按钮。
- `default -> focus-visible`：适用于键盘或等效焦点导航场景。
- `hover -> active`：适用于用户正在触发按钮动作的交互瞬间。
- `default/hover/focus-visible/active -> disabled`：允许，但进入 disabled 后不得再响应交互。
- `disabled -> default`：允许，用于重新启用按钮；恢复后仍需满足所属 `variant` 的默认状态规则。
