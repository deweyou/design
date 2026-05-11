# React Icons TDesign Codegen Redesign

Date: 2026-05-11
Status: Proposed

## Context

`@deweyou-design/react-icons` currently exposes a curated set of `XxxIcon` React components backed by `@tabler/icons-react`. The public API is intentionally small: icon-related types and named icon exports only. The package should now move its visual asset source back to `tdesign-icons-svg` while keeping Deweyou Design ownership over the public icon list, component names, props, documentation, and release behavior.

This redesign is about visual asset ownership and long-term maintainability. `tdesign-icons-svg` should be named directly in package documentation as the default upstream SVG source. The package should not hide that relationship. It should also not expose or mirror the full upstream collection. Deweyou Design maintains its own curated icon list, and only icons in that list are generated and published.

## Goals

- Keep the public consumer API as named `XxxIcon` exports.
- Replace the Tabler-backed implementation with generated components sourced from `tdesign-icons-svg`.
- Maintain a Deweyou-owned registry as the only source of truth for supported icon exports.
- Generate icon components only from registry entries, never from the full upstream package.
- Allow future local SVG assets when Deweyou needs an icon that `tdesign-icons-svg` does not provide.
- Align icon `size` and `color` props with the existing design system semantics.
- Preserve predictable accessibility defaults while allowing common SVG props such as `id`, `className`, `aria-label`, `onClick`, and `data-*`.
- Keep the generated package tree-shakeable for consumers that import one or a few named icons.
- Update both Storybook and the public website so the review surface and documentation match the new source model.

## Non-Goals

- Do not restore a generic `<Icon name="..." />` registry component.
- Do not publish all icons from `tdesign-icons-svg`.
- Do not add subpath exports for every upstream icon.
- Do not make `tdesign-icons-svg` a runtime dependency of consumers.
- Do not introduce a broad icon color system outside the existing component color semantics.
- Do not require applications to import a generated runtime registry or icon map for normal icon usage.

## Public API

Consumers continue to import named icon components:

```tsx
import { SearchIcon, CheckIcon } from '@deweyou-design/react-icons';

<SearchIcon />
<SearchIcon size="sm" color="primary" />
<CheckIcon aria-label="已选择" />
```

The package exports:

- `XxxIcon` components generated from the curated registry.
- `IconProps`, `IconSize`, and `IconColor` types.

It does not export upstream `tdesign-icons-svg` keys, raw SVG data, a generic icon renderer, or upstream package APIs.

Consumer documentation should prefer direct named imports:

```tsx
import { SearchIcon } from '@deweyou-design/react-icons';
```

Namespace imports such as `import * as Icons` are acceptable only for catalog or documentation surfaces that intentionally render every supported icon.

## Props Contract

Each generated icon component accepts standard SVG props with a small Deweyou contract layered on top:

```ts
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'inherit' | 'neutral' | 'primary' | 'danger';

export type IconProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'children' | 'dangerouslySetInnerHTML' | 'color'
> & {
  size?: IconSize | number | string;
  color?: IconColor;
};
```

`id`, `className`, `style`, `aria-label`, `onClick`, `data-*`, and other normal SVG props pass through to the `<svg>` element. `children` and `dangerouslySetInnerHTML` are omitted so consumers cannot replace generated SVG content.

`size` uses design-system naming by default:

| Size | Intended use                          |
| ---- | ------------------------------------- |
| `xs` | Dense inline affordances              |
| `sm` | Compact controls and metadata         |
| `md` | Default component icon size           |
| `lg` | Prominent controls                    |
| `xl` | Empty states or larger visual moments |

The implementation may initially map these sizes inside `react-icons`, then later move the backing values to `@deweyou-design/styles` CSS variables without changing the public API.

`color` follows existing component semantics:

| Color     | Mapping                       |
| --------- | ----------------------------- |
| `inherit` | `currentColor`                |
| `neutral` | `var(--ui-color-text)`        |
| `primary` | `var(--ui-color-brand-text)`  |
| `danger`  | `var(--ui-color-danger-text)` |

The default is `inherit`, so icons continue to follow surrounding text unless a semantic color is requested.

## Accessibility

Generated icons keep the current accessibility model:

- Without `aria-label`, the icon is decorative and renders with `aria-hidden="true"`.
- With `aria-label`, the icon renders with `role="img"` and the provided accessible name.
- Consumers may explicitly override SVG props when needed, but documentation should recommend that clickable semantics live on a `button`, `IconButton`, or other interactive element rather than on the icon itself.

## Registry

The curated registry is the source of truth for supported icons. It should live under `packages/react-icons/src/icon-registry/` and be authored by maintainers.

Example shape:

```ts
export const iconRegistry = [
  {
    exportName: 'SearchIcon',
    source: 'tdesign',
    sourceKey: 'search',
    category: 'action',
    keywords: ['find', 'lookup'],
  },
  {
    exportName: 'BrandMarkIcon',
    source: 'local',
    sourcePath: './assets/brand-mark.svg',
    category: 'brand',
    keywords: ['deweyou'],
  },
] as const;
```

Rules:

- `exportName` must be unique and end with `Icon`.
- `source: 'tdesign'` entries must declare `sourceKey`.
- `source: 'local'` entries must declare `sourcePath`.
- The generator must fail on missing upstream keys, missing local assets, duplicate exports, malformed names, or unsupported sources.
- The generator must only read icons declared in `iconRegistry`.
- Adding an icon is a registry change first, not a bulk import from upstream.

## Source Types

### TDesign Source

`tdesign-icons-svg` is the default asset pool. The generator reads only the declared `sourceKey` values from the curated registry and converts those SVG definitions into Deweyou React components.

The README should explicitly state that default glyphs come from `tdesign-icons-svg` and that Deweyou Design owns the supported list, naming, props, accessibility behavior, and generated package surface.

`tdesign-icons-svg` should be a development or build-time dependency of `packages/react-icons`, not a runtime dependency of the published package.

### Local Source

Local SVGs live in `packages/react-icons/src/icon-registry/assets/*.svg`. They are used when Deweyou needs an icon that does not exist in `tdesign-icons-svg`.

Local SVG additions should be reviewed together with:

- The original SVG file.
- The registry entry.
- The generated component output.
- Any licensing or authorship note when relevant.

## Generation Output

The generator should produce the public icon components and keep generated files clearly marked.

Recommended structure:

```text
packages/react-icons/
├── src/
│   ├── icon-registry/
│   │   ├── index.ts
│   │   └── assets/
│   ├── icon-wrapper/
│   │   └── index.tsx
│   ├── icons/
│   │   ├── index.tsx
│   │   └── index.test.ts
│   └── index.ts
└── scripts/
    └── generate-icons.mjs
```

Generated icon files should be committed to source so registry changes, upstream glyph changes, and local SVG additions produce reviewable diffs. The generated component layer should preserve tree-shaking through named exports and `sideEffects: false`. It should not require runtime access to `tdesign-icons-svg`.

The generated output should avoid a public runtime icon map that references every icon. Normal consumption should be a direct named export path from the root package surface to the generated component. Implementation may use one generated index that re-exports per-icon modules, or another Vite+ compatible structure, as long as a consumer bundle that imports only `SearchIcon` can drop unrelated icon SVG bodies.

Generated component definitions should be side-effect-free. If the generator emits factory calls, those calls should be tree-shaking friendly, for example by using pure top-level component definitions or `/* @__PURE__ */` annotations where the bundler benefits from them.

## Build And Tree-Shaking

The redesign should include a build review of `packages/react-icons/vite.config.ts`, `package.json`, and generated module shape.

Build requirements:

- Keep `package.json` `sideEffects: false` for `@deweyou-design/react-icons`.
- Keep the public package export surface small: root export plus `./package.json`.
- Ensure generated icon code is ESM and free of top-level side effects.
- Ensure `tdesign-icons-svg` is not listed in published runtime `dependencies`.
- Avoid generated code that eagerly builds an object containing every icon for the public entrypoint.
- Prefer direct named re-exports that let downstream bundlers remove unused SVG bodies.

Verification should include a tree-shaking contract fixture that imports one icon from `@deweyou-design/react-icons`, bundles it with the repo build toolchain, and asserts that at least one unrelated icon's generated SVG body or export name is absent from the output. The exact fixture can live under `packages/react-icons/src` or `packages/react-icons/tests`, but it should run with the normal package test suite.

## Wrapper Behavior

`icon-wrapper` owns shared SVG behavior:

- Resolve design-system `size` values.
- Resolve semantic `color` values.
- Apply default decorative or meaningful accessibility props.
- Set SVG width and height consistently.
- Preserve generated SVG contents.
- Forward allowed SVG props to the root `<svg>`.

The wrapper should be generic enough for both `tdesign` and `local` source output.

## Documentation

`packages/react-icons/README.md` should be updated to say:

- The package provides Deweyou-curated React icon components.
- Default SVG glyphs are sourced from `tdesign-icons-svg`.
- Only registry-declared icons are generated and supported.
- The package intentionally does not mirror the full upstream icon set.
- Generated components are committed or otherwise reviewable to support maintainability and iteration.
- Local SVG assets may supplement the upstream source when needed.
- Icon-only interactions should use an accessible interactive component such as `IconButton`.
- Direct named imports are the recommended application usage for tree-shaking.
- Namespace imports are reserved for catalog pages that intentionally render the full icon list.

`docs/design/system.md` should continue to state that production components import icons from `@deweyou-design/react-icons`, and should be updated if the old Tabler-specific guidance remains.

## Storybook

`apps/storybook/src/stories/Icon.stories.tsx` should be updated with the new source model. Storybook is the internal review and state-validation surface, not the full public usage guide.

The icon story should cover:

- A curated catalog generated from the Deweyou registry.
- Named size examples for `xs`, `sm`, `md`, `lg`, and `xl`.
- Semantic color examples for `inherit`, `neutral`, `primary`, and `danger`.
- Accessibility examples for decorative and labeled icons.
- A local SVG example once the first local icon exists.
- An `Interaction` story with assertions that at least one icon renders, named size/color examples are present, and labeled icons expose `role="img"`.

Story text must remain English according to the app-level Storybook instructions.

## Website

`apps/website/src/pages/icons.tsx` should be synchronized with the new implementation and documentation language.

The public website should:

- Replace Tabler-specific wording with `tdesign-icons-svg` attribution.
- Explain that the visible catalog is Deweyou-curated and not the full upstream icon set.
- Keep the import-copy workflow for named `XxxIcon` exports.
- Show `size` and `color` usage examples aligned to the design system.
- Mention that namespace imports are used by the catalog page only because it intentionally renders every icon.
- Keep reusable logic in packages; website should only consume `@deweyou-design/react-icons`.

The website build should continue resolving the workspace source during local development and should not depend on any unpublished runtime registry API.

## Testing

The redesign should include focused tests for:

- Public surface exports match the registry.
- The generator fails on duplicate `exportName`.
- The generator fails on missing `tdesign` keys.
- The generator fails on missing local SVG files.
- Generated components render SVG content.
- `aria-label` controls decorative versus meaningful accessibility output.
- `id`, `className`, `onClick`, and `data-*` props pass through.
- `size` maps named values and still accepts numeric or string overrides.
- `color` maps only `inherit`, `neutral`, `primary`, and `danger`.
- A tree-shaking contract proves unused generated icon SVG bodies are dropped from a one-icon consumer bundle.

The implementation should also run:

- `vp check`
- `vp test`
- `vp run storybook#test` when `Icon.stories.tsx` changes
- `vp run website#build` or the relevant website verification command when the icon page changes
- `vp run build -r` when package build behavior or published manifests change

## Migration

Existing consumers should keep importing the same `XxxIcon` names where possible. The implementation may change from Tabler-backed components to generated TDesign-backed components without requiring call-site changes.

If a current public icon has no direct TDesign equivalent, the migration should either:

- Pick the closest TDesign source and document the visual change.
- Add a reviewed local SVG asset.
- Keep the export out of the redesign only if the breaking change is explicitly accepted.

## Implementation Notes

- The implementation plan must inspect the exact `tdesign-icons-svg` package export shape before writing the generator.
- Icon size values may start as an internal `react-icons` map behind the public `xs` / `sm` / `md` / `lg` / `xl` API. If `@deweyou-design/styles` later gains icon-size CSS variables, the backing map can move without changing consumers.
- The implementation plan must include a concrete tree-shaking verification step before changing icon generation.
