# 数据模型：实现 Popover 组件

## Popover 公开实例

**说明**：表示一个对外暴露的 `Popover` 组件实例，负责承接触发元素、内容面板、公开 props 和状态行为。

**字段**：

- `children`：触发元素，作为公开实例的交互入口
- `content`：必填的浮层内容
- `disabled`：是否阻止打开与交互
- `className` / `style`：根实例级样式透传
- `overlayClassName` / `overlayStyle`：浮层外容器级样式透传
- `mode`：内容样式模式，可为 `card`、`loose`、`pure`
- `shape`：视觉圆角模式，可为 `rect` 或 `rounded`
- `trigger`：触发方式集合，可包含 `click`、`hover`、`context-menu`、`focus`
- `placement`：公开位置选项，可为 `top`、`bottom`、`left`、`right`、`left-top`、`left-bottom`、`right-top`、`right-bottom`
- `offset`：触发目标与浮层之间的偏移量
- `boundaryPadding`：与边界框之间的安全边距，默认 `16`
- `popupPortalContainer`：浮层挂载父节点

**关系**：

- 一个 `Popover 公开实例` 关联一个 `触发元素契约`
- 一个 `Popover 公开实例` 在打开时生成一个 `浮层面板契约`
- 一个 `Popover 公开实例` 受一个 `可见性状态契约` 驱动

**校验规则**：

- `content` 必填
- `mode` 默认 `card`
- `shape` 不允许扩展到 `pill` 或其他未文档化值
- `boundaryPadding` 缺省时必须回落到 `16`
- `disabled=true` 时不得打开浮层

## 触发元素契约

**说明**：描述 Popover 触发元素的角色、交互来源和与浮层之间的关联方式。

**字段**：

- `referenceNode`：被锚定的目标节点
- `triggerTypes`：生效的触发方式集合
- `isFocusable`：是否支持键盘进入
- `ariaRelationship`：与浮层内容建立的语义关系
- `openFeedback`：打开状态对应的可感知反馈

**关系**：

- 一个 `触发元素契约` 只属于一个 `Popover 公开实例`
- 一个 `触发元素契约` 可驱动一个 `可见性状态契约` 发生变化

**校验规则**：

- 默认触发方式必须包含 `click`
- 仅当显式配置时才允许追加 `hover`、`focus`、`context-menu`
- 关闭后焦点必须能够回到该触发元素

## 浮层面板契约

**说明**：表示真正渲染出来的 Popover 面板，包括箭头、容器样式、动画和挂载位置。

**字段**：

- `surfaceMode`：内容内边距样式，对应 `card`、`loose`、`pure`
- `surfaceShape`：外层圆角样式，对应 `rect`、`rounded`
- `hasArrow`：是否显示指向触发目标的小箭头
- `portalContainer`：最终挂载父节点
- `animationState`：显示周期，可为 `closed`、`opening`、`open`、`closing`
- `resolvedPlacement`：最终实际位置
- `resolvedOffset`：实际应用的目标间距
- `resolvedBoundaryPadding`：实际应用的边界安全边距

**关系**：

- 一个 `浮层面板契约` 由一个 `Popover 公开实例` 生成
- 一个 `浮层面板契约` 在不同时刻反映一个 `可见性状态契约`

**校验规则**：

- 面板必须保持与触发元素的视觉关联
- 面板内部点击默认不得触发关闭
- 面板在空间不足时必须根据边界规则回退，而不是直接裁切

## 可见性状态契约

**说明**：定义 Popover 的受控与非受控可见性模型，以及状态切换来源。

**字段**：

- `mode`：状态管理模式，可为 `uncontrolled` 或 `controlled`
- `defaultVisible`：非受控初始状态
- `visible`：受控可见状态
- `onVisibleChange`：状态变更回调
- `closeReason`：关闭原因，可为 `outside-press`、`escape`、`explicit-action`、`controlled-update`、`disabled-reference`
- `isOpen`：当前是否可见

**关系**：

- 一个 `可见性状态契约` 绑定一个 `Popover 公开实例`
- 一个 `可见性状态契约` 会驱动一个 `浮层面板契约` 的挂载与卸载

**校验规则**：

- 非受控模式使用 `defaultVisible`
- 受控模式由 `visible` 驱动，并通过 `onVisibleChange` 对外反馈
- 同页其他 Popover 默认不得被此实例隐式关闭

## 挂载容器契约

**说明**：定义 Popover 默认 portal 行为，以及切换到自定义挂载父节点时必须保持稳定的规则。

**字段**：

- `defaultRoot`：默认挂载根节点
- `customRoot`：来自 `popupPortalContainer` 的自定义父节点
- `supportsOverflowEscape`：是否能脱离裁切容器
- `supportsBoundaryDetection`：是否继续参与边界检测
- `supportsOutsideDismiss`：是否继续参与外部点击关闭判断

**关系**：

- 一个 `挂载容器契约` 可被多个 `Popover 公开实例` 复用
- 一个 `挂载容器契约` 会影响 `浮层面板契约` 的层级和关闭行为

**校验规则**：

- 自定义挂载父节点不能破坏边界检测
- 自定义挂载父节点不能破坏外部关闭行为
- 自定义挂载父节点不能让浮层失去与触发元素的锚定关系
