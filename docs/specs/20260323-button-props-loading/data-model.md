# 数据模型：补齐 Button 公开属性与加载态

## 实体：按钮公开入口

- **目的**：表示 `@deweyou-ui/components` 在本次功能中对外暴露的按钮入口集合。
- **字段**：
  - `buttonComponentName`：主文本按钮组件名，固定为 `Button`
  - `iconButtonComponentName`：主图标按钮组件名，固定为 `IconButton`
  - `iconAliasPath`：图标按钮同义入口，固定为 `Button.Icon`
  - `buttonPropsTypeName`：文本按钮 props 类型名，固定为 `ButtonProps`
  - `iconButtonPropsTypeName`：图标按钮 props 类型名，固定为 `IconButtonProps`
  - `refTarget`：暴露给消费方的 DOM 节点类型，随实际渲染根节点解析
  - `semverImpact`：本次公开 API 变化对应的版本语义
- **校验规则**：
  - `Button`、`IconButton`、`Button.Icon` 必须保持一致的命名体系。
  - `Button.Icon` 必须继续指向与 `IconButton` 相同的实现和契约。
  - `refTarget` 必须与最终渲染根节点一致。
  - `semverImpact` 必须记录为 additive public API change，而不是 breaking rename。

## 实体：按钮颜色模式

- **目的**：表示按钮在视觉语义上支持的颜色轴。
- **字段**：
  - `name`：`neutral`、`primary` 或 `danger`
  - `isDefault`：是否为默认颜色
  - `filledBehavior`：对 `filled` 背景和文本色的影响
  - `nonFilledBehavior`：对 `outlined`、`ghost`、`link` 的边框、hover、文字或下划线影响
  - `themeSurface`：该颜色模式依赖的共享 token / theme surface
- **校验规则**：
  - `neutral` 必须仍是默认值。
  - `danger` 必须与现有 `color` 轴并列，而不是新 `variant`。
  - `danger` 不得依赖 Button 私有硬编码作为唯一颜色来源。

## 实体：按钮公开属性集

- **目的**：表示消费方一次对 `Button` 或 `IconButton` 的公开属性配置请求。
- **字段**：
  - `variant`：按钮视觉类型
  - `color`：`neutral`、`primary` 或 `danger`
  - `size`：`extra-small`、`small`、`medium`、`large`、`extra-large`
  - `shape`：仅对允许组合有效
  - `htmlType`：`button`、`submit` 或 `reset`
  - `nativeType`：原生 `type` 透传输入，用于兼容现有调用
  - `href`：透传给按钮根节点的字符串字段，可为空
  - `target`：透传给按钮根节点的字符串字段，可为空
  - `onClick`：点击激活回调，可为空
  - `onClickCapture`：捕获阶段点击回调，可为空
  - `disabled`：显式禁用状态
  - `loading`：处理中状态
  - `icon`：显式图标内容
  - `children`：可见文本或混合内容
  - `accessibleNameProvided`：在没有可见文本时是否提供了可访问名称
- **校验规则**：
  - `htmlType` 存在时，必须优先于 `nativeType` 决定最终 button type。
  - `href` 存在时必须把根节点切换为 `<a>`，但不得改变样式选择逻辑。
  - `target` 只有在 `href` 存在时才有效。
  - `loading` 与 `disabled` 必须彼此独立输入，但二者任一为真时都必须阻止激活。
  - 没有可见文本的请求必须满足 `accessibleNameProvided=true`。

## 实体：按钮加载态

- **目的**：表示按钮进入处理中后的展示、交互和状态优先级。
- **字段**：
  - `isLoading`：是否处于处理中
  - `effectiveInteractivity`：当前是否允许激活
  - `visualTreatment`：当前视觉层级，取值为 `default`、`disabled-like`
  - `cursorTreatment`：当前鼠标指针策略，取值为 `default-pointer`、`disabled-pointer`
  - `iconStrategy`：`prepend-spinner`、`replace-icon-with-spinner` 或 `none`
  - `contentRetention`：处理中文本是否保留
  - `announcesBusyState`：是否需要向辅助技术表达 busy / processing 语义
- **校验规则**：
  - `isLoading=true` 时，`effectiveInteractivity` 必须为不可激活。
  - `isLoading=true` 时，`visualTreatment` 必须为 `disabled-like`。
  - `isLoading=true` 时，`cursorTreatment` 不得为 `disabled-pointer`。
  - `isLoading=true` 时，`announcesBusyState` 必须为真，并由 button 根节点表达。
  - `Button` 的 `iconStrategy` 必须为 `prepend-spinner`。
  - `IconButton` / `Button.Icon` 的 `iconStrategy` 必须为 `replace-icon-with-spinner`。

## 实体：状态优先级规则

- **目的**：描述 `default`、`disabled`、`loading` 之间的组合与解析顺序。
- **字段**：
  - `baseState`：默认状态
  - `disabledInput`：显式禁用输入
  - `loadingInput`：处理中输入
  - `effectiveState`：最终对外表现的状态
  - `blocksActivation`：是否阻止用户激活
  - `showsSpinner`：是否显示 loading 图标
- **校验规则**：
  - `disabledInput=false` 且 `loadingInput=false` 时，`effectiveState=default`。
  - `disabledInput=true` 且 `loadingInput=false` 时，`effectiveState=disabled`。
  - `loadingInput=true` 时，`effectiveState` 必须体现 loading，并继续阻止激活。
  - `disabledInput=true` 且 `loadingInput=true` 时，必须仍显示 spinner，且不可激活。

## 实体：预览场景

- **目的**：表示 Storybook 或 website 中一个用于评审的按钮示例。
- **字段**：
  - `scenarioId`：稳定的示例标识
  - `surface`：`storybook` 或 `website`
  - `entryType`：`Button`、`IconButton` 或 `Button.Icon`
  - `statesCovered`：该示例覆盖的状态列表
  - `propsCovered`：该示例覆盖的关键 props 列表
  - `purpose`：内部评审矩阵、公开指导、回归验证或错误边界示例
- **校验规则**：
  - Storybook 必须覆盖 `danger`、`loading`、事件、ref、`htmlType`、`href` / `target`。
  - website 必须覆盖推荐写法和至少一组 loading / danger 精选示例。
  - 至少一个场景必须覆盖 icon-only 按钮在 `loading` 下的可访问名称要求。

## 状态迁移

- `default -> hover`：仅适用于可交互按钮。
- `default -> focus-visible`：适用于键盘或等效焦点导航场景。
- `hover -> active`：适用于用户正在触发动作的交互瞬间。
- `default/hover/focus-visible/active -> disabled`：允许，进入后不得继续激活。
- `default/hover/focus-visible/active -> loading`：允许，进入后必须阻止激活并显示 loading 图标。
- `disabled -> loading`：允许；视觉以 loading-disabled 混合状态表达，并继续显示 spinner。
- `loading -> default`：允许；结束后恢复原始 `variant`、`color`、`size` 和内容表现。
