# 数据模型：优化 Button 间距平衡

## 实体：按钮公开入口

- **目的**：表示 `@deweyou-ui/components` 在本次功能中对外暴露的按钮入口集合。
- **字段**：
  - `primaryComponentName`：主文本按钮组件名，固定为 `Button`
  - `iconComponentName`：主图标按钮组件名，固定为 `IconButton`
  - `iconAliasPath`：图标按钮的同义入口，固定为 `Button.Icon`
  - `buttonPropsTypeName`：文本按钮 props 类型名，固定为 `ButtonProps`
  - `iconButtonPropsTypeName`：图标按钮 props 类型名，固定为 `IconButtonProps`
  - `semverImpact`：本次公开 API 与行为变更对应的版本语义
- **校验规则**：
  - `primaryComponentName`、`iconComponentName`、`buttonPropsTypeName`、`iconButtonPropsTypeName` 必须与 package 实际导出一致。
  - `Button.Icon` 必须是 `IconButton` 的同义入口，而不是第二份实现。
  - `semverImpact` 必须记录 icon-only children 隐式模式退出标准契约的 breaking 影响。

## 实体：按钮请求

- **目的**：表示消费方一次对 `Button` 的配置请求。
- **字段**：
  - `variant`：`filled`、`outlined`、`ghost`、`link`
  - `color`：`neutral` 或 `primary`
  - `size`：`extra-small`、`small`、`medium`、`large`、`extra-large`
  - `shape`：`rect`、`rounded`、`pill`，仅对允许的组合有效
  - `icon`：显式图标内容，可为空
  - `children`：可见文本或自定义内容，可为空
  - `label`：旧的文本别名输入，仅作为迁移兼容信息
  - `disabled`：是否禁用
  - `accessibleNameProvided`：在没有可见文本时是否提供了可访问名称
- **校验规则**：
  - 当 `icon` 为空且不存在可见文本时，请求无效。
  - 当 `icon` 有值且存在可见文本时，请求必须进入“带图标文本按钮”模式。
  - 当 `icon` 有值且不存在可见文本时，请求必须进入 `IconButton` 模式。
  - `link` 仍只作为文本按钮 variant 使用，不得与 `IconButton` 模式组合。
  - 没有可见文本的请求必须满足 `accessibleNameProvided=true`。

## 实体：IconButton 请求

- **目的**：表示消费方一次对 `IconButton` 或 `Button.Icon` 的配置请求。
- **字段**：
  - `variant`：`filled`、`outlined`、`ghost`
  - `color`：`neutral` 或 `primary`
  - `size`：`extra-small`、`small`、`medium`、`large`、`extra-large`
  - `shape`：仅对 `filled` / `outlined` 有效
  - `icon`：必填图标内容
  - `disabled`：是否禁用
  - `accessibleNameSource`：`aria-label` 或 `aria-labelledby`
- **校验规则**：
  - `icon` 必须存在。
  - `children` 不属于 `IconButton` 的标准输入。
  - `variant=ghost` 时不得出现 `shape`。
  - `variant=link` 不得出现。
  - 必须始终存在可访问名称来源。

## 实体：密度模式规则

- **目的**：表示按钮根据公开入口和内容形态选择的视觉密度规则。
- **字段**：
  - `modeName`：`text-only`、`text-with-icon`、`icon-button`
  - `entryTrigger`：进入该模式的公开条件
  - `paddingStrategy`：该模式的横向与纵向留白策略
  - `squareTarget`：是否要求宽高相等
  - `supportsTextTruncation`：是否要求单行截断
  - `supportsTextWrap`：是否允许文本流换行
- **校验规则**：
  - `text-only` 与 `text-with-icon` 必须共享内容型密度，不得启用 `squareTarget=true`。
  - `icon-button` 必须启用 `squareTarget=true`。
  - `icon-button` 不得通过对 `children` 的结构猜测进入。
  - `text-with-icon` 必须保留文本优先的阅读节奏和图文间距。

## 实体：Variant 支持矩阵

- **目的**：表示 `Button` 与 `IconButton` 在视觉类型上的支持边界。
- **字段**：
  - `surface`：`button` 或 `icon-button`
  - `variantName`：公开 `variant` 名称
  - `isSupported`：该入口是否支持该 `variant`
  - `supportsShape`：是否支持 `shape`
  - `defaultShape`：支持 `shape` 时的默认值
  - `feedbackModel`：主要交互反馈方式
- **校验规则**：
  - `button` 必须支持 `filled`、`outlined`、`ghost`、`link`。
  - `icon-button` 必须支持 `filled`、`outlined`、`ghost`，且不支持 `link`。
  - `ghost` 在任一入口下都不支持 `shape`。
  - `filled` 与 `outlined` 在 `button` 和 `icon-button` 下都必须共享同一 `shape` 语义。

## 实体：预览场景

- **目的**：表示 Storybook 或 website 中一个用于评审的按钮示例。
- **字段**：
  - `scenarioId`：稳定的示例标识
  - `surface`：`storybook` 或 `website`
  - `entryType`：`Button`、`IconButton`、`Button.Icon`
  - `densityMode`：`text-only`、`text-with-icon`、`icon-button`
  - `variantsCovered`：该示例覆盖的 `variant` 列表
  - `statesCovered`：该示例覆盖的状态列表
  - `purpose`：内部评审矩阵、公开指导、迁移示例或错误示例
- **校验规则**：
  - Storybook 必须覆盖三个入口及其关键状态。
  - website 必须覆盖推荐写法、迁移前后对照和至少一组 IconButton 示例。
  - 至少一个场景必须校验 `IconButton` 与 `Button.Icon` 的行为一致性。

## 状态迁移

- `default -> hover`：适用于所有可交互的 `Button` / `IconButton`。
- `default -> focus-visible`：适用于键盘或等效焦点导航场景。
- `hover -> active`：适用于用户正在触发动作的交互瞬间。
- `default/hover/focus-visible/active -> disabled`：允许，但进入 disabled 后不得再响应交互。
- `Button(icon + text) <-> Button(text-only)`：允许，通过是否提供 `icon` 切换。
- `Button(icon-only explicit) <-> IconButton/Button.Icon`：必须表现为同一 `icon-button` 模式，而不是两个不同状态机。
