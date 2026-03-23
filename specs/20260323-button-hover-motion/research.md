# 研究结论：按钮 Hover 反馈整理

## 决策 1：移除 `animated` 公开属性

- **Decision**：不向 `ButtonProps` 暴露 hover 动画开关。
- **Rationale**：该属性会让公共 API 承担纯视觉试验性开关，且与最终需求“默认开启且不给用户关”相冲突。
- **Alternatives considered**：
  - 保留布尔属性：会放大 API 复杂度并留下旧文档负担。
  - 保留仅内部使用的状态标记：不必要，默认行为即可满足需求。

## 决策 2：`link` 继续使用装饰层下划线，但避免原生下划线叠加

- **Decision**：`link` 下划线使用独立装饰层，并通过裁切式 reveal 控制显现过程。
- **Rationale**：这样可以保持线条厚度稳定，避免 `scaleX` 或原生 `text-decoration` 叠加导致的视觉变粗。
- **Alternatives considered**：
  - 直接动画化 `text-decoration`：方向与厚度控制不足。
  - 保留 `scaleX`：在动画尾段更容易产生粗细不稳定的视觉感受。

## 决策 3：`outlined` 只做真实 border 的颜色过渡

- **Decision**：取消环绕描边动画、SVG 路径与伪边框方案，只调整默认 border 色度并在 hover 时过渡到文字颜色。
- **Rationale**：真实 border 天然贴合组件半径与尺寸，不会出现额外边框层的间距、圆角或性能问题。
- **Alternatives considered**：
  - SVG 路径描边：更容易出现尺寸同步和圆角对齐问题。
  - mask / conic-gradient 伪边框：视觉上像内嵌了一圈新边框。
