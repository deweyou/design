# Font Subset Unplugin Design

## Goal

Add a build-time font subsetting capability for `@deweyou-design/styles` so product applications can keep Deweyou's Source Han Serif CN typography while shipping only the characters they need.

The component library should continue to expose stable typography tokens such as `--ui-font-body`, `--ui-font-display`, and `--ui-font-mono`. Font file loading becomes an optional build asset layer: applications opt into generated subset fonts through a bundler plugin instead of always paying for the full vendored Source Han Serif CN files.

## Motivation

`packages/styles` currently vendors four Source Han Serif CN OTF files for weights 400, 500, 600, and 700. This gives predictable typography, but full Chinese font files are large. Applications often have a much smaller fixed character surface, especially for static UI chrome, documentation sites, and marketing pages.

The design system should provide the raw font contract and a repeatable subsetting pipeline, while each application remains responsible for defining or scanning the characters that belong in its final bundle.

## Scope

This design covers a first-class unplugin package or subpath owned by `packages/styles`.

It includes:

- A bundler-agnostic font subset core.
- An unplugin adapter for Vite first, with Rollup/Webpack/Rspack adapters following the same API.
- Explicit charset files.
- Optional source scanning through user-defined `include` and `exclude` globs.
- Built-in safelist characters for Latin letters, numbers, common English punctuation, common Chinese punctuation, and basic whitespace.
- Generated `woff2` assets and generated `@font-face` CSS.
- Explicit CSS consumption through a virtual CSS module by default, with optional automatic injection.

It does not include runtime glyph loading or automatic production defaults that scan an entire app without user configuration.

## Public API

The recommended app setup is an unplugin call plus an explicit virtual CSS import.

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

Options:

```ts
type DeweyouFontSubsetOptions = {
  family?: 'Source Han Serif CN Web';
  weights?: Array<400 | 500 | 600 | 700>;
  charset?: string | string[];
  scan?: {
    include: string | string[];
    exclude?: string | string[];
  };
  safelist?: {
    builtin?: boolean;
    chars?: string;
    files?: string | string[];
  };
  blocklist?: {
    chars?: string;
    files?: string | string[];
  };
  output?: {
    fontDir?: string;
    cssFileName?: string;
    format?: 'woff2';
  };
  inject?: boolean;
};
```

Default behavior:

- `family`: `'Source Han Serif CN Web'`
- `weights`: `[400, 500, 600, 700]`
- `safelist.builtin`: `true`
- `output.fontDir`: `assets/fonts`
- `output.cssFileName`: `deweyou-fonts.css`
- `output.format`: `woff2`
- `inject`: `false`

At least one of `charset`, `scan.include`, or `safelist.chars/files` must provide non-built-in application characters. The plugin should fail with a clear error if no application character source is configured and only the built-in safelist would be emitted.

## CSS Consumption

Base component and theme CSS remains separate from generated font CSS.

Applications continue importing the normal design-system CSS:

```ts
import '@deweyou-design/styles/theme.css';
```

That CSS continues to define typography tokens and platform fallback stacks. It must not force the full Source Han Serif CN font files into production bundles when the subset plugin is used.

Generated subset CSS is consumed explicitly by default:

```ts
import 'virtual:deweyou-font-subset.css';
```

This keeps font asset loading visible in the application entry and works better for multi-entry apps, SSR, documentation apps, and micro-frontends. The plugin may also support `inject: true` for migration convenience, but explicit import is the documented default.

The generated CSS declares one `@font-face` per requested weight:

```css
@font-face {
  font-family: 'Source Han Serif CN Web';
  src: url('./assets/fonts/source-han-serif-cn-400.subset.<hash>.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
```

The CSS does not redefine `--ui-font-body` or `--ui-font-display`; those remain owned by the theme. The generated CSS only makes the configured font family available to the existing token stack.

## Character Sources

The final character set is deterministic:

```text
built-in safelist
+ charset file characters
+ scanned source characters
+ user safelist characters
- blocklist characters
```

Charset files may be `.txt`, `.md`, or `.ts`. For `.ts`, the first version may treat the file as plain text to avoid executing application code. A later version can add an explicit exported charset API if needed.

Scanning is opt-in. The plugin only scans files matched by user-provided `scan.include`, then applies built-in and user-provided excludes. Built-in excludes should cover `node_modules`, `.git`, `dist`, `build`, coverage output, and the plugin's generated output directory.

The core should normalize characters by code point, de-duplicate them, preserve meaningful whitespace required by font tools, and sort output metadata for stable builds.

## Architecture

The implementation should separate core logic from bundler integration.

```text
packages/styles/src/font-subset/
├── charset.ts          # normalize, merge, safelist, blocklist
├── manifest.ts         # font family, weights, source font paths
├── subset.ts           # generate subset font files
├── css.ts              # generate @font-face CSS
└── index.ts            # build-tool-agnostic public API

packages/styles/src/unplugin-font-subset/
└── index.ts            # unplugin adapter
```

The build-tool-agnostic core exposes:

```ts
createFontSubset(options): Promise<FontSubsetResult>
```

The unplugin adapter handles:

- Resolving project-relative config paths.
- Watching charset and safelist files in dev.
- Watching scanned files when supported by the bundler.
- Emitting hashed font assets during build.
- Serving virtual CSS in dev.
- Exposing `.vite`, `.rollup`, `.webpack`, and `.rspack` adapters.

## Asset Policy

The source OTF files remain internal build inputs. Production output should prefer `woff2` subset files only.

Generated font filenames should include the family, weight, subset marker, and content hash:

```text
source-han-serif-cn-400.subset.<hash>.woff2
```

The hash should include the source font file, weight, normalized character set, and font generation options. This prevents stale browser cache when either the source font or character set changes.

## Error Handling

The plugin should fail fast when:

- A requested weight does not exist in the font manifest.
- A configured charset, safelist, or blocklist file cannot be read.
- `scan.include` matches no files and there is no explicit charset file.
- The font subsetting backend cannot create a valid `woff2`.
- The generated character set is empty after blocklist application.

Warnings are appropriate when:

- Scanned files contain no non-safelist characters.
- A blocklist removes characters that also appear in an explicit charset file.
- `inject: true` is used in an SSR or multi-entry build where explicit import would be clearer.

## Testing

Core unit tests should cover:

- Built-in safelist inclusion.
- Charset file parsing for `.txt`, `.md`, and `.ts` as text.
- Scanned include/exclude behavior.
- Safelist and blocklist merge order.
- Stable normalized charset output.
- CSS generation for all supported weights.

Contract tests should cover:

- `@deweyou-design/styles/unplugin-font-subset` export availability.
- Virtual module name `virtual:deweyou-font-subset.css`.
- Generated CSS uses `font-family: 'Source Han Serif CN Web'`.
- Generated CSS does not redefine theme tokens.
- Invalid weight and missing charset file errors.

Integration tests should run at least the Vite adapter and assert that importing the virtual CSS causes font assets to be emitted in build output.

## Migration

Existing applications can keep importing the normal theme CSS and rely on platform fallback fonts. Applications that want subset Source Han Serif CN add the plugin and import the virtual CSS.

The full bundled font CSS may remain available as a convenience and compatibility entry, but production documentation should recommend the subset plugin for apps that care about bundle size.

The first release should document three paths:

- No font assets: import theme CSS only and use platform fallback.
- Subset fonts: configure the plugin and import `virtual:deweyou-font-subset.css`.
- Full fonts: import the existing full font CSS entry for prototypes, local previews, or internal tools that do not care about payload size.

## Non-Goals

- Runtime glyph discovery or lazy glyph fetching.
- Per-route font subsets in the first version.
- Replacing `--ui-font-mono` or bundling a mono webfont.
- Expanding the public typography token surface beyond existing font roles.
- Executing user TypeScript charset files during plugin evaluation.
