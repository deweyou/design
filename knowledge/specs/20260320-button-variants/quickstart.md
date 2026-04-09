# 快速开始：重构 Button 组件基础能力

## 目标

把现有 `FoundationButton` 重构为以 `variant` 与 `color` 为中心的 `Button` 公开契约，统一导出 `Button` 与 `ButtonProps`，并在 `packages/components`、`apps/storybook`、`apps/website` 三个层面同步落地新的按钮模型。

## 建议实现顺序

1. 在 `packages/components/src/button/` 中重构按钮公开 props、`variant` / `color` / `size` / `shape` 模型和无障碍行为。
2. 在 `packages/icons/src/icon/` 中稳定 icon 的默认尺寸继承、方形 wrapper 和 `viewBox` 补方逻辑，确保 Button `size` 变化时默认 icon 一起缩放。
3. 更新 `packages/components/src/index.ts`，将根级导出切换到 `Button` 与 `ButtonProps`，并补充迁移说明涉及的旧命名处理。
4. 更新 `packages/components/src/button/index.test.ts` 与 `packages/icons/src/icon/index.test.tsx`，覆盖 `variant`、`color`、`shape` 支持矩阵、无可见文本按钮命名、icon 随字号缩放和 `disabled` / `focus-visible` 等行为。
5. 更新 `apps/storybook/src/stories/Button.stories.tsx`，建立 `filled`、`outlined`、`ghost`、`link` 在 `neutral` / `primary` 下的内部评审矩阵，并明确纯图标示例只保留无障碍约束。
6. 更新 `apps/website/src/main.tsx` 或对应公开指导内容，展示 Button 的精选示例、默认中性色与主题色 opt-in 说明。
7. 同步更新 `packages/components/README.md` 或相关 package 文档，反映新的公开 API、状态字段方向、公开 props 注释约定和 theme 使用边界。

## 实现说明

- `variant` 只包含 `filled`、`outlined`、`ghost`、`link` 四类。
- `color` 公开支持 `neutral` 与 `primary`；默认是 `neutral`，只有 `primary` 才显式启用主题强调色。
- `shape` 公开支持 `rect`、`rounded`、`pill`，但只适用于 `filled` 与 `outlined`。
- `ghost` 与 `link` 都不支持 `shape`；传入时必须给出明确错误，而不是静默忽略。
- `filled` 与 `outlined` 使用统一的四边内边距；`ghost` 与 `link` 使用更轻的文本流内边距，不再强行对齐实体按钮的盒子尺寸。
- `filled`、`outlined` 与 `ghost` 默认保持单行不换行；只有 `link` 继续保留文本流里的可换行行为。
- 当 `filled`、`outlined` 或 `ghost` 遇到超长文案时，默认行为应为单行省略，而不是自动换行。
- `filled` 与 `outlined` 的高度现在由字号、行高和统一四边内边距共同决定，不再额外依赖固定 `min-height`。
- `ghost` 默认统一使用 `0.4rem` 圆角，这属于 variant 内部契约，不是 `shape` 对外能力。
- 默认 `neutral` 的 `filled` 保持黑白灰对比；`primary` 的 `filled` 使用主题前景色 token，保证在主题色背景上可读。
- icon 只是内容模式，不再是独立 `variant`；任何无可见文本按钮都必须具备可访问名称。
- 无可见文本不会自动触发专用 icon-only 方形布局；如果未来需要标准方形 icon button，应单独建模显式能力。
- icon 在未显式配置 `size` 时默认继承周围字号，并通过方形 wrapper 与 `viewBox` 补方降低按钮内容区的占位偏差。
- `loading`、`selected` 等能力后续应作为独立字段扩展，不应被折叠进 `variant`。
- 对外暴露的 `variant`、`color`、`size`、`shape`、`disabled` 语义要在源码中提供 JSDoc，避免消费者必须翻实现细节。
- 按钮样式优先复用 `@deweyou-ui/styles` 已公开的颜色 token，不在本期默认扩展公共 theme surface；website 与 Storybook 的页面底色同步收敛为浅色白底、深夜模式黑底。
- Storybook 负责完整状态矩阵，website 负责官方精选示例，两者都必须更新。
- `FoundationButton`、`FoundationButtonProps` 与 `buttonCustomizationContract` 退出标准公开契约；迁移时应统一改用 `Button`、`ButtonProps` 与 `variant` / `color` / `shape` 模型。

## 验证

在仓库根目录运行：

```bash
vp check
vp test
vp run storybook#build
vp run website#build
```

## 完成检查清单

- `@deweyou-ui/components` 对外暴露的是 `Button` 与 `ButtonProps`。
- `filled`、`outlined`、`ghost`、`link` 四类 `variant` 的能力边界已在 package 和预览中对齐。
- `neutral` 与 `primary` 两类 `color` 的默认值、用途和主题 opt-in 规则已在 package 和预览中对齐。
- `shape` 公开支持 `rect`、`rounded`、`pill`，且只在 `filled` / `outlined` 中生效。
- `ghost` / `link` 的不支持组合不会静默失效。
- `ghost` / `link` 已使用轻量文本流内边距，且 `ghost` 默认圆角固定为 `0.4rem`。
- 无可见文本按钮具备可访问名称，并经过自动化验证。
- icon 默认会跟随周围字号缩放，且非正方形源 `viewBox` 已通过渲染层补方处理。
- Storybook 已覆盖内部评审矩阵，website 已反映公开指导与精选示例。
- 迁移说明已明确记录 `FoundationButton` 到 `Button` 的 breaking change 影响与替换方式。
