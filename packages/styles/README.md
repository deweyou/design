# @deweyou-design/styles

Shared color palette, semantic theme tokens, CSS theme outputs, and Less authoring utilities for Deweyou Design.

## Installation

```bash
npm install @deweyou-design/styles
```

## CSS Entry Points

| Import                                        | Description                                                            |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `@deweyou-design/styles/theme.css`            | Default consumer entry — reset, base, theme layers, and fallback fonts |
| `@deweyou-design/styles/theme-with-fonts.css` | Full Source Han Serif CN webfont entry for prototypes and previews     |
| `@deweyou-design/styles/theme-light.css`      | Light theme only                                                       |
| `@deweyou-design/styles/theme-dark.css`       | Dark theme only                                                        |
| `@deweyou-design/styles/color.css`            | Raw color palette — theme-invariant tokens                             |
| `@deweyou-design/styles/reset.css`            | Reset layer only                                                       |
| `@deweyou-design/styles/base.css`             | Base typography and element defaults                                   |

Import `theme.css` once at your app root:

```ts
import '@deweyou-design/styles/theme.css';
```

`theme.css` defines typography tokens and platform fallback stacks, but does not load the full bundled Source Han Serif CN files. Use `theme-with-fonts.css` only when the full webfont payload is acceptable.

## Font Subsets

For production apps that want Source Han Serif CN with a smaller payload, configure the build-time plugin and import the generated virtual CSS:

```ts
// vite.config.ts
import { fontSubset } from '@deweyou-design/styles/unplugin-font-subset';

export default {
  plugins: [
    fontSubset.vite({
      charset: ['./src/font-charset.md'],
      scan: {
        include: ['src/**/*.{ts,tsx,md,mdx,json}'],
        exclude: ['**/*.test.*', 'src/generated/**'],
      },
      weights: [400, 500, 600, 700],
    }),
  ],
};
```

```ts
// app entry
import '@deweyou-design/styles/theme.css';
import 'virtual:deweyou-font-subset.css';
```

The final character set is built from the built-in Latin/punctuation safelist, explicit charset files, optional scanned source files, user safelist additions, and blocklist removals. The plugin emits hashed `woff2` files and `@font-face` rules for the existing `Source Han Serif CN Web` family.

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
- `--ui-color-surface-raised` / `--ui-color-brand-text`

## 共享基础色卡（Color Palette）

26 color families, each with 11 steps (`50` to `950`):

`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`, `taupe`, `mauve`, `mist`, `olive`

Plus `baseMonochrome`: `black` and `white`.

## Typography Contract

- `--ui-font-body` and `--ui-font-display` default to a Source Han Serif CN stack, falling back to `Songti SC` / `STSong` on macOS and `SimSun` on Windows.
- `--ui-font-mono` is the explicit exception for code and fixed-width content.
- Bundled and subset webfont files are covered by the SIL Open Font License 1.1.

## Governance Rules

- Semantic tokens must trace back to the shared color palette or `black` / `white`.
- 非必要不得新增特化 token — do not add component-specific tokens without first proving the shared palette cannot serve the need.
- The canonical color review matrix lives in the Storybook `Color` story.

## License

MIT
