# @deweyou-design/styles

Shared color palette, semantic theme tokens, CSS theme outputs, and Less authoring utilities for Deweyou Design.

## Installation

```bash
npm install @deweyou-design/styles
```

## CSS Entry Points

| Import                                   | Description                                            |
| ---------------------------------------- | ------------------------------------------------------ |
| `@deweyou-design/styles/theme.css`       | Default consumer entry — reset, base, and theme layers |
| `@deweyou-design/styles/theme-light.css` | Light theme only                                       |
| `@deweyou-design/styles/theme-dark.css`  | Dark theme only                                        |
| `@deweyou-design/styles/color.css`       | Raw color palette — theme-invariant tokens             |
| `@deweyou-design/styles/reset.css`       | Reset layer only                                       |
| `@deweyou-design/styles/base.css`        | Base typography and element defaults                   |

Import `theme.css` once at your app root:

```ts
import '@deweyou-design/styles/theme.css';
```

## Less Authoring Utilities

```less
@import '@deweyou-design/styles/less/bridge'; // CSS custom property aliases as Less variables
@import '@deweyou-design/styles/less/mixins'; // Authoring mixins for component authors
```

## JavaScript / TypeScript API

```ts
import {
  colorFamilyNames, // 26 color family names
  colorPalette, // colorPalette.<family>.<step> lookup
  colorPaletteStepNames, // '50' | '100' | … | '950'
  baseMonochrome, // { black, white }
  publicThemeTokens, // governed semantic token names
  createThemeStyleSheets,
} from '@deweyou-design/styles';
```

## Semantic Theme Tokens

Governed tokens that components may consume. These map to theme-specific values in light and dark mode:

- `--ui-color-black` / `--ui-color-white`
- `--ui-color-brand-bg` / `--ui-color-brand-bg-hover` / `--ui-color-brand-bg-active`
- `--ui-color-text-on-brand`
- `--ui-color-danger-bg` / `--ui-color-danger-bg-hover` / `--ui-color-danger-bg-active`
- `--ui-color-danger-text` / `--ui-color-text-on-danger`
- `--ui-color-focus-ring`
- `--ui-color-link`

## Color Palette

26 color families, each with 11 steps (`50` to `950`):

`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`, `taupe`, `mauve`, `mist`, `olive`

Plus `baseMonochrome`: `black` and `white`.

## Typography Contract

- `--ui-font-body` and `--ui-font-display` default to a vendored Source Han Serif CN stack, falling back to `Songti SC` / `STSong` on macOS and `SimSun` on Windows.
- `--ui-font-mono` is the explicit exception for code and fixed-width content.
- Bundled webfont files are covered by the SIL Open Font License 1.1.

## Governance Rules

- Semantic tokens must trace back to the shared color palette or `black` / `white`.
- Do not add component-specific tokens without first proving the shared palette cannot serve the need.
- The canonical color review matrix lives in the Storybook `Color` story.

## License

MIT
