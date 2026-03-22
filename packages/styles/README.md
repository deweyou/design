# styles

Token sources, theme outputs, and the explicit global style contract for consumers.

## Public Entrypoints

- `@deweyou-ui/styles/theme.css`: default consumer entrypoint with reset, base, and theme layers.
- `@deweyou-ui/styles/theme-light.css`: dedicated light theme output.
- `@deweyou-ui/styles/theme-dark.css`: dedicated dark theme output.
- `@deweyou-ui/styles/less/bridge.less`: Less variables mapped onto CSS custom properties.
- `@deweyou-ui/styles/less/mixins.less`: mixins for component authors.

## Default Typography Contract

- `--ui-font-body` and `--ui-font-display` now default to a vendored Source Han Serif CN stack.
- The default stack prefers the bundled Source Han Serif CN files and falls back to
  `Songti SC` / `STSong` on `macOS`, then `SimSun` / `NSimSun` on `Windows`.
- English letters and numerals intentionally stay in the same serif family instead of switching to
  a second Latin font.
- `--ui-font-mono` remains the explicit exception for code, fixed-width identifiers, and similar
  content.
- The bundled webfont files are extracted from the official Adobe Source Han Serif release and
  remain covered by the included `SIL Open Font License 1.1`.

## Public Theme Surface

- `--ui-color-brand-bg`
- `--ui-color-brand-bg-hover`
- `--ui-color-brand-bg-active`
- `--ui-color-text-on-brand`
- `--ui-color-focus-ring`
- `--ui-color-link`

Consumers should override only these color tokens in v1. Layout, spacing, radius,
typography, and motion remain internal.
