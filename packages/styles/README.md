# styles

共享基础色卡、语义主题色、theme 输出和全局样式契约都由 `@deweyou-ui/styles` 维护。

## 共享基础色卡

- `colorFamilyNames` 提供 26 个颜色家族：`red` 到 `olive`
- `colorPaletteStepNames` 固定提供 11 个色阶：`50` 到 `950`
- `baseMonochrome` 提供 `black` / `white`
- `colorPalette` 提供完整的 `colorPalette.<family>.<step>` 访问路径
- `textColorFamilyNames` 与 `textPaletteStepNames` 作为兼容 alias 继续保留，旧消费面无需立刻迁移

这套共享基础色卡是所有颜色相关能力的事实来源。`Button`、`Text` 和后续新增组件都应先复用这层事实来源，而不是直接新增组件私有颜色集合。

## 治理规则

- 语义主题色必须追溯到共享基础色卡或纯黑白
- 非必要不得新增特化 token
- 若出现新的颜色诉求，必须先证明共享基础色卡与现有语义主题色不足
- 完整评审矩阵统一放在 Storybook 的 `Color` story，website 只保留公开指导

## Public Entrypoints

- `@deweyou-ui/styles/color.css`: shared raw color foundation for palette, monochrome, and cross-theme-invariant color tokens
- `@deweyou-ui/styles/theme.css`: default consumer entrypoint with reset, base, and theme layers
- `@deweyou-ui/styles/theme-light.css`: dedicated light theme output
- `@deweyou-ui/styles/theme-dark.css`: dedicated dark theme output
- `@deweyou-ui/styles/less/bridge.less`: Less variables mapped onto CSS custom properties
- `@deweyou-ui/styles/less/mixins.less`: mixins for component authors

## 受治理的语义主题色

- `--ui-color-black`
- `--ui-color-white`
- `--ui-color-brand-bg`
- `--ui-color-brand-bg-hover`
- `--ui-color-brand-bg-active`
- `--ui-color-text-on-brand`
- `--ui-color-danger-bg`
- `--ui-color-danger-bg-hover`
- `--ui-color-danger-bg-active`
- `--ui-color-danger-text`
- `--ui-color-text-on-danger`
- `--ui-color-focus-ring`
- `--ui-color-link`

这些语义主题色应优先服务共享消费场景。除非治理规则允许，不要为单个组件新增新的颜色 token。

其中，共享基础色卡、纯黑白，以及深浅主题下不变的颜色 token 会沉到 `color.css`；`theme-light.css` 与 `theme-dark.css` 只保留会随主题切换的语义映射。

## Default Typography Contract

- `--ui-font-body` and `--ui-font-display` now default to a vendored Source Han Serif CN stack
- The default stack prefers the bundled Source Han Serif CN files and falls back to `Songti SC` /
  `STSong` on `macOS`, then `SimSun` / `NSimSun` on `Windows`
- English letters and numerals intentionally stay in the same serif family instead of switching to
  a second Latin font
- `--ui-font-mono` remains the explicit exception for code, fixed-width identifiers, and similar
  content
- The bundled webfont files are extracted from the official Adobe Source Han Serif release and
  remain covered by the included `SIL Open Font License 1.1`
