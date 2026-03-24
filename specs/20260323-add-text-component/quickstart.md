# 快速开始：新增 Text 排版组件

## 目标

在 `@deweyou-ui/components` 中新增统一的 `Text` 入口，覆盖普通文本、正文块、说明文字和五级视觉标题，同时支持 `italic`、`bold`、`underline`、`strikethrough`、`color`、`background`、`lineClamp` 与原生节点属性透传。

## 建议实现顺序

1. 在 `packages/styles/src/` 中补齐共享排版尺寸与行高变量，并新增 26 色族 x 11 色阶的共享色卡 token，确保 `body`、`caption`、`h1`-`h5` 与 `color` / `background` 都有统一来源。
2. 在 `packages/components/src/text/` 下新增 `index.tsx`、`index.module.less`、`index.test.ts`，实现 `Text`、`TextProps`、默认节点映射、布尔装饰样式、`color` / `background` 主题映射和 `lineClamp` 归一逻辑。
3. 在 `packages/components/src/index.ts` 中补充 `Text` 与 `TextProps` 的根级导出。
4. 在 `packages/components/src/text/index.module.less` 中对接排版 token 与色卡 token，完成 `plain`、`body`、`caption`、`h1`-`h5`、四个装饰字段、`color` / `background` 和截断状态的样式覆盖。
5. 在 `packages/components/src/text/index.test.ts` 中补齐根节点映射、默认值、布尔样式组合、色卡高亮、主题映射、`lineClamp` 归一和节点属性透传的单测。
6. 在 `packages/styles/tests/theme-outputs.test.ts` 中补充新增排版变量与色卡变量的断言，确认浅色 / 深色主题输出完整。
7. 在 `apps/storybook/src/stories/Typography.stories.tsx` 中补充 `Text` 的内部评审矩阵，覆盖全部 `variant`、组合样式、色卡高亮、主题切换和截断状态。
8. 在 `apps/website/src/main.tsx` 与 `apps/website/src/style.css` 中新增面向消费方的 Text 示例区，展示推荐用法、标题层级、局部高亮和长文本截断。
9. 更新 `packages/components/README.md`，记录 `Text` 公开 API、默认 heading 节点、色卡高亮、`lineClamp` 规则和验证方式。

## 实现说明

- `Text` 的默认 `variant` 是 `plain`，默认节点是 `span`。
- `body` 与 `plain` 共享基础字号层级，但默认节点是 `div`。
- `caption` 默认节点是 `div`，并且比正文更小、视觉强调更弱。
- `h1`-`h5` 默认节点是对应的原生 `h1` 到 `h5`，同时承担标题层级与基础语义。
- `italic`、`bold`、`underline`、`strikethrough` 都是可叠加的布尔能力。
- `color` 与 `background` 都只接受 26 个颜色家族名，不直接接受色阶编号或任意颜色值。
- 具体色阶由主题自动映射：浅色主题使用 `800` / `100`，深色主题使用 `200` / `900`。
- `lineClamp` 只在正整数时生效；无效值按未设置处理。
- 原生节点属性必须直接透传到最终渲染节点。
- 共享排版变量最终落在 `--ui-text-size-body`、`--ui-text-line-height-body`、`--ui-text-size-caption`、`--ui-text-line-height-caption`、`--ui-text-size-h1` 到 `--ui-text-line-height-h5` 这组 theme surface 上；色卡变量则对齐 26 色族 x 11 色阶的共享 palette surface，并额外输出 `--ui-text-color-<family>` 与 `--ui-text-background-<family>`。
- `lineClamp` 需要同时依赖 `-webkit-line-clamp` 与基于行高的 `max-block-size` fallback，避免只出现省略号但后续行仍然漏出。

## 验证

在仓库根目录运行：

```bash
vp check
vp test
vp run components#build
vp run storybook#build
vp run website#build
```

说明：

- `packages/components` 的 root export 和 `packages/styles` 的主题输出都需要先通过构建验证，才能确保 website / Storybook 消费面不脱节。
- Storybook 通过意味着内部状态矩阵完整；website 通过意味着公开示例和根级导出保持一致。

## 完成检查清单

- `@deweyou-ui/components` 已新增并导出 `Text` 与 `TextProps`。
- `Text` 已覆盖 `plain`、`body`、`caption`、`h1`、`h2`、`h3`、`h4`、`h5`。
- `italic`、`bold`、`underline`、`strikethrough` 都可以独立和组合使用。
- `color`、`background` 已支持 26 色族公开 union，并在浅色 / 深色主题下自动映射。
- `lineClamp` 在有效值下可截断，在无效值下不会产生不可读结果。
- 原生节点属性能落到最终渲染节点。
- `packages/styles` 已提供 Text 所需的共享排版变量与色卡变量。
- Storybook 与 website 已覆盖主要状态和边界状态。
- README 已同步记录公开 API、默认 heading 语义与色卡高亮规则。
