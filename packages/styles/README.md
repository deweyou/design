# styles

Token sources, theme outputs, and the explicit global style contract for consumers.

## Public Entrypoints

- `@deweyou-ui/styles/theme.css`: default consumer entrypoint with reset, base, and theme layers.
- `@deweyou-ui/styles/theme-light.css`: dedicated light theme output.
- `@deweyou-ui/styles/theme-dark.css`: dedicated dark theme output.
- `@deweyou-ui/styles/less/bridge.less`: Less variables mapped onto CSS custom properties.
- `@deweyou-ui/styles/less/mixins.less`: mixins for component authors.

## Public Theme Surface

- `--ui-color-brand-bg`
- `--ui-color-brand-bg-hover`
- `--ui-color-brand-bg-active`
- `--ui-color-text-on-brand`
- `--ui-color-focus-ring`
- `--ui-color-link`

Consumers should override only these color tokens in v1. Layout, spacing, radius,
typography, and motion remain internal.
