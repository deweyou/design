# icons

Generated React icon components for Deweyou UI.

## Public Entrypoints

- `@deweyou-ui/icons`: exports the generic `Icon` component and icon-related
  types only.
- `@deweyou-ui/icons/<icon-name>`: exports one generated `XxxIcon` component
  per TDesign icon with ES module output to preserve tree-shaking.

Prefer subpath imports for normal component usage. Use the generic `Icon`
component only when the icon name is chosen dynamically at runtime.

## Public API

### `Icon`

Use the generic `Icon` component when the icon name is selected dynamically.
This path lazy-loads the matching icon definition at runtime, so it keeps the
root package entry light, but it is still not the best path for static icon
usage.

```tsx
import { Icon } from '@deweyou-ui/icons';

<Icon name="search" size="large" />;
<Icon label="Open menu" name="menu" />;
```

### Subpath icon exports

Use subpath icon exports for the most common component-level usage.

```tsx
import { AddIcon } from '@deweyou-ui/icons/add';
import { ChevronRightIcon } from '@deweyou-ui/icons/chevron-right';

<AddIcon />;
<ChevronRightIcon size="small" />;
```

All public icon components follow the `XxxIcon` convention.
Every upstream TDesign icon is exposed through this convention at its own
subpath entry.

## Props Contract

- `name`: supported icon name for the generic `Icon` component
- `className`: primary public styling hook
- `style`: inline override hook for width, height, color, and layout adjustments
- `label`: optional accessible name; when omitted, the icon is treated as decorative
- `size`: `number | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`

## Accessibility

- Icons with `label` expose an accessible name and render with `role="img"`.
- Icons without `label` render with `aria-hidden="true"`.
- Standalone icons are not keyboard-focusable by default.
- Interactive controls that include an icon remain responsible for the overall control label.

## Standard Sizes

- `extra-small`: 12px
- `small`: 14px
- `medium`: 16px
- `large`: 20px
- `extra-large`: 24px

## Unsupported Names

- Unsupported names are treated as contract errors.
- The generic `Icon` component throws a descriptive runtime error instead of rendering a fallback.
- During lazy loading, `Icon` renders a same-size placeholder instead of eagerly bundling the full icon set.

## Bundling Guidance

- Prefer `@deweyou-ui/icons/<icon-name>` in component code for the strongest
  tree-shaking and immediate render.
- Use `Icon` only for registry-driven, CMS-driven, or configuration-driven icon
  lookup.
- The generic `Icon` component lazy-loads icon modules; named icon subpaths do
  not.

## Updating Generated Exports

- After updating `tdesign-icons-svg`, run `vp run generate --filter @deweyou-ui/icons`
  from the repository root, or `node ./scripts/generate-icons.mjs` from
  `packages/icons`.
- The generator rewrites the full registry, shared generated modules, and
  public subpath entry files in `packages/icons/src/exports`.
- After `vp pack`, run `node ./scripts/organize-dist.mjs` if you need to refresh
  `dist/icons/*` wrappers and the generated subpath `exports` map manually.

## Source Attribution

- The initial SVG asset source is `tdesign-icons-svg` under the MIT license.
- Deweyou UI owns the public icon naming, package API, accessibility behavior,
  and long-term replacement strategy for individual assets.
