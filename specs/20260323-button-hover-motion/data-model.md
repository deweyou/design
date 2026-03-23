# 数据模型：按钮 Hover 反馈整理

## 实体：Button Hover State

- `variant`：`filled` | `outlined` | `ghost` | `link`
- `color`：`neutral` | `primary`
- `size`：`extra-small` | `small` | `medium` | `large` | `extra-large`
- `shape`：`rect` | `rounded` | `pill` | `none`
- `interactionState`：`default` | `hover` | `active` | `focus-visible` | `disabled`
- `motionPreference`：`normal` | `reduced`

## 规则

- 仅 `link` 在 `hover` 时显示自定义下划线显现。
- 仅 `outlined` 在 `hover` 时改变真实 border 的颜色，不引入额外描边层。
- `disabled` 优先级高于 hover，不展示 hover 反馈。
- `focus-visible` 独立于 hover 存在，不依赖动画表达。
