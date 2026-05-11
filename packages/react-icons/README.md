# @deweyou-design/react-icons

React icon components for Deweyou Design. The package generates named `XxxIcon` components from a Deweyou-maintained registry. Default SVG glyphs are sourced from `tdesign-icons-svg`, and local SVG assets can supplement that source when Deweyou needs an icon that upstream does not provide.

The current registry includes the full `tdesign-icons-svg` source set while still keeping Deweyou-owned public names, search metadata, and future local additions in one explicit list.

## Installation

```bash
npm install @deweyou-design/react-icons
```

## Usage

Prefer direct named imports for application code:

```tsx
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@deweyou-design/react-icons';

<SearchIcon />
<ChevronDownIcon size="sm" />
<CheckIcon aria-label="Selected" color="primary" />
```

Namespace imports are reserved for catalog surfaces that intentionally render every supported icon.

## Props

| Prop         | Type                                                       | Description                                                                                |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number \| string` | Icon size. Defaults to `md`.                                                               |
| `color`      | `'inherit' \| 'neutral' \| 'primary' \| 'danger'`          | Design-system icon color. Defaults to `inherit`.                                           |
| `aria-label` | `string`                                                   | Accessible name. When set, renders with `role="img"`; when omitted, renders as decorative. |
| `id`         | `string`                                                   | Forwarded to the SVG root.                                                                 |
| `className`  | `string`                                                   | Styling hook.                                                                              |
| `style`      | `CSSProperties`                                            | Inline style override.                                                                     |
| `onClick`    | `MouseEventHandler<SVGSVGElement>`                         | Forwarded SVG event handler. Prefer buttons for interactive semantics.                     |

All standard SVG props except `children`, `dangerouslySetInnerHTML`, and raw `color` pass through to the SVG root.

## Size

Named sizes align to the Deweyou component scale:

- `xs`: dense inline affordances
- `sm`: compact controls and metadata
- `md`: default component icon size
- `lg`: prominent controls
- `xl`: larger visual moments

Numeric and CSS length values remain available for precise composition needs.

## Color

`color="inherit"` uses `currentColor`. Semantic colors map to Deweyou theme tokens:

- `neutral`: `var(--ui-color-text)`
- `primary`: `var(--ui-color-brand-text)`
- `danger`: `var(--ui-color-danger-text)`

Prefer surrounding text color or these semantic values over hard-coded colors.

## Accessibility

- Icons without `aria-label` render with `aria-hidden="true"`.
- Icons with `aria-label` render with `role="img"`.
- Interactive controls should own interaction semantics. Use `IconButton`, `Button.Icon`, or a native button instead of making an icon SVG behave like a button.

## Adding Icons

Add icons by editing `src/icon-registry/icons.json`, then run:

```bash
pnpm --dir packages/react-icons run generate-icons
```

Use `source: 'tdesign'` with a `sourceKey` for upstream glyphs. Use `source: 'local'` with a checked-in SVG under `src/icon-registry/assets/` when an icon is not available upstream.

To resync the registry from the installed `tdesign-icons-svg` package, run:

```bash
pnpm --dir packages/react-icons run sync-tdesign-registry
pnpm --dir packages/react-icons run generate-icons
```

`sourceKey` preserves the upstream SVG filename. `exportName` is Deweyou's public API and may be renamed for readability, for example `loading` maps to `LoadingIcon` and `menu` maps to `MenuIcon`.

## Source Attribution

Default icon glyphs are provided by `tdesign-icons-svg` under the MIT license. Deweyou Design owns the curated registry, public names, generated React components, props contract, accessibility behavior, and release policy.

## License

MIT
