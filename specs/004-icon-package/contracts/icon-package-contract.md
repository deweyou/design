# Contract: `@deweyou-ui/icons`

## Package Purpose

`@deweyou-ui/icons` is the single public package for Deweyou UI's officially supported icon catalog. It owns icon naming, rendering behavior, accessibility defaults, and contributor-facing catalog governance.

## Public Exports

- Root package export `@deweyou-ui/icons`: exposes the generic `Icon` React component and icon-related types only.
- Subpath exports `@deweyou-ui/icons/<icon-name>`: expose one generated `XxxIcon` component per supported icon, behaviorally equivalent to `Icon` with a fixed `name`, and named with the `XxxIcon` convention.
- `IconName`: TypeScript union of supported official icon names.
- `IconProps`: shared props contract for icon rendering, excluding `name` for named icon exports.
- `IconSize`: TypeScript union of the standard size names `extra-small`, `small`, `medium`, `large`, and `extra-large`.

## Generic Component Contract

### `Icon` props

| Prop        | Type                 | Required | Behavior                                                                                            |
| ----------- | -------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `name`      | `IconName`           | Yes      | Selects one icon from the official catalog.                                                         |
| `size`      | `number \| IconSize` | No       | Controls rendered icon size. Defaults to `medium`.                                                  |
| `label`     | string               | No       | When provided, supplies the icon's accessible name. When absent, the icon is treated as decorative. |
| `className` | string               | No       | Primary public styling hook for consumer overrides.                                                 |
| `style`     | React style object   | No       | Allows limited inline overrides consistent with package styling rules.                              |

### Semantics

- Icons without `label` render with `aria-hidden="true"` and are not announced by assistive technology.
- Icons with `label` render with an accessible name derived from `label`.
- Standalone icons are not keyboard-focusable by default.
- When an icon is placed inside an interactive control, the control remains responsible for the overall accessible name.

### Standard Sizes

- `extra-small`: 12px
- `small`: 14px
- `medium`: 16px
- `large`: 20px
- `extra-large`: 24px

### Failure Behavior

- Unsupported icon names are contract errors.
- The generic `Icon` component must throw a descriptive error when runtime input falls outside the official catalog.
- The package must not silently substitute placeholder icons or empty output for unsupported names.

## Named Export Contract

- Each named export maps to exactly one active official catalog entry.
- Each named export is consumed from its own package subpath, such as `@deweyou-ui/icons/search`.
- Named exports accept the same rendering and accessibility props as `Icon`, excluding `name`.
- Named exports and the generic `Icon` entry point must resolve to the same icon definition, semantics, and styling behavior.
- Public named exports must be published in the `XxxIcon` form, such as `AddIcon` or `ChevronRightIcon`.
- Static component usage should prefer subpath icon exports; the generic `Icon` entry point is reserved for dynamic icon lookup.

## Catalog Governance Contract

- The official catalog is curated and finite.
- New icons must follow the project naming convention, fit the chosen visual family, and include preview coverage plus accessibility guidance.
- Removing or renaming a published icon requires explicit migration notes before release.
- Deprecated icons should expose a documented replacement whenever possible.

## Review Surfaces

- `apps/storybook` must include internal review stories for the catalog, representative usage, and explicit failure handling.
- `apps/website` must include package-level usage guidance and curated examples for consumers.
