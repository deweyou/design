# 契约：Popover 公开组件

## 目的

定义 `@deweyou-ui/components` 新增 `Popover` 组件时必须保持稳定的公开 API、交互行为、无障碍规则和预览验证契约。

## Package 与导出契约

- 组件归属 `packages/components`，并从 `@deweyou-ui/components` 根入口导出。
- 根入口至少新增 `Popover` 和 `PopoverProps`。
- 同步导出 `PopoverTrigger`、`PopoverPlacement`、`PopoverMode`、`PopoverShape`、`PopoverVisibilityChangeReason` 与 `PopoverVisibilityChangeDetails` 这些公开类型。
- 初版不引入额外 compound API，例如 `Popover.Trigger` 或 `Popover.Content`。
- 本功能对现有导出不构成 breaking change，属于新增公开能力。

## 渲染契约

- `children` 作为触发元素。
- `content` 为必填，用于定义浮层内容。
- 根实例支持基础 DOM 属性透传，包括 `className`、`style`、`onClick` 等常见属性。
- 浮层外容器支持 `overlayClassName` 与 `overlayStyle` 透传。
- `popupPortalContainer` 用于覆盖默认 portal 挂载父节点。

## 位置与触发契约

- 默认触发方式为 `click`。
- 允许显式组合 `hover`、`focus`、`context-menu` 触发方式。
- 公开 placement 仅包含：
  - `top`
  - `bottom`
  - `left`
  - `right`
  - `left-top`
  - `left-bottom`
  - `right-top`
  - `right-bottom`
- `offset` 表示触发目标与浮层之间的间距。
- `boundaryPadding` 表示浮层与边界框之间的安全边距，默认值为 `16`。
- 当首选位置空间不足时，组件必须按文档化规则自动回退，不能直接裁切内容。

## 可见性契约

- 同时支持非受控与受控模式。
- 非受控模式使用 `defaultVisible` 作为初始值。
- 受控模式使用 `visible` 驱动，并通过 `onVisibleChange(visible, { reason, event? })` 反馈状态变化。
- 面板内部点击默认保持打开状态。
- 外部区域交互、显式关闭动作、`Escape` 或受控状态更新可以触发关闭。
- 同页其他 Popover 默认不受当前实例影响；如需互斥行为，由上层业务自行控制。

## 视觉契约

- Popover 默认具备 border、shadow 和小箭头。
- `shape` 仅支持 `rect` 与 `rounded` 两种模式。
- `mode` 仅支持 `card`、`loose`、`pure` 三种内容样式，默认 `card`。
- 显示与关闭必须支持动画。
- 默认应优先复用现有共享 token，包括但不限于 surface、border、radius、shadow 与 focus ring。

## 无障碍契约

- Popover 为非模态浮层，不得默认启用焦点陷阱。
- 键盘用户必须能够进入浮层内容、离开浮层内容，并在关闭后返回触发元素。
- 组件必须暴露清晰的打开状态与内容关系，供辅助技术识别。
- `disabled` 状态下不得打开浮层，也不得暴露误导性的交互反馈。

## 预览与验证契约

- `packages/components` 必须包含组件单测，覆盖默认值、受控/非受控行为、触发方式、关闭规则和边界回退。
- `packages/components/tests/package-entrypoint.test.ts` 必须覆盖新导出的根入口公开面。
- `apps/website` 必须新增公开 demo，覆盖主要状态与至少一个交互型场景。
- `apps/storybook` 必须新增内部 review story，覆盖位置矩阵、模式矩阵、边界回退、`disabled`、受控/非受控与自定义挂载容器。
- 合并前必须通过：
  - `vp check`
  - `vp test`
  - `vp run storybook#build`
  - `vp run website#build`

## 本次实现回填

- 已落地文件：
  - `packages/components/src/popover/index.tsx`
  - `packages/components/src/popover/index.module.less`
  - `packages/components/src/popover/index.test.ts`
  - `apps/storybook/src/stories/Popover.stories.tsx`
  - `apps/website/src/main.tsx`
- 公开实现保留了文档中的八向 placement 词汇，但内部映射到定位引擎的 `start/end` 对齐值以支持边界回退。
- 默认 `offset = 8`、`boundaryPadding = 16`、`mode = card`、`shape = rounded`。
- 非模态键盘行为通过 trigger 上的 `Tab` 进入面板和关闭后焦点返还 trigger 来保证。
- 最终自动化验证命令为：
  - `vp run components#build`
  - `vp run components#test`
  - `vp run website#build`
  - `vp run storybook#build`
  - `vp test`
