# UI 合约：Button Hover 反馈整理

## 范围

- 受影响 package：`@deweyou-ui/components`
- 受影响评审面：`apps/storybook`、`apps/website`
- 不受影响公共 API：`IconButtonProps`、`Button.Icon`

## 公共 API

- `ButtonProps` 不新增 `animated` 或其他 hover 开关属性。
- `IconButtonProps` 无变化。

## 行为矩阵

| Variant    | 默认状态             | Hover 状态                                               |
| ---------- | -------------------- | -------------------------------------------------------- |
| `filled`   | 保持当前行为         | 保持当前行为                                             |
| `outlined` | 真实 border 为低色度 | 真实 border 平滑过渡到与文字一致的颜色                   |
| `ghost`    | 保持当前行为         | 保持当前行为                                             |
| `link`     | 无常驻下划线         | 显示从左到右显现的下划线；`icon + text` 时覆盖整条内容行 |

## 无障碍契约

- 组件继续保留原生 `<button>` 语义，不新增自定义角色。
- 键盘激活、禁用态和 focus-visible 行为不因本次 hover 整理而改变。
- hover 反馈不能成为识别状态的唯一方式。
- reduced-motion 下仍需保留可识别但更克制的反馈。

## 验收要求

- `packages/components` 必须补充或更新行为测试。
- `apps/storybook` 与 `apps/website` 必须展示新的默认行为。
- README 必须移除已废弃的 `animated` 描述。
