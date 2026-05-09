# Component Coverage Roadmap

## Summary

This spec defines the next component coverage increments for `@deweyou-design/react` after the API, SSR, Field semantics, and AI documentation repair work. It prioritizes primitives that reduce repeated app-side composition without expanding into heavy product-specific components.

## Goals

- Add small, reusable primitives that appear across forms, navigation, feedback, and empty states.
- Keep every new component aligned with the existing unit layout: `packages/react/src/<unit>/index.tsx`, `index.module.less`, and colocated `index.test.ts(x)`.
- Require Storybook `Interaction` coverage, package subpath export, root export, and `docs/design/components.md` documentation for every new component.
- Preserve the current design language: semantic tokens, low decoration, restrained motion, and Ark UI for interactive behavior when an Ark primitive exists.

## Non-Goals

- Do not add DataTable, Calendar, DatePicker, chart, command palette, rich editor, or virtualized collection primitives in this roadmap.
- Do not introduce a second styling system, Tailwind dependency, runtime CSS-in-JS layer, or raw palette values in component styles.
- Do not expose Ark UI props wholesale as the public API.

## Prioritized Additions

| Priority | Component     | Purpose                                                                  | Behavior Layer         |
| -------- | ------------- | ------------------------------------------------------------------------ | ---------------------- |
| P0       | `Fieldset`    | Group related form fields with legend, hint, error, disabled semantics   | Native + local context |
| P0       | `InputGroup`  | Attach prefix/suffix text or icons to Input/Textarea-compatible controls | Local composition      |
| P1       | `Alert`       | Inline status feedback for info/success/warning/danger                   | Presentational         |
| P1       | `Empty`       | Standard empty-state layout with title, description, and action slot     | Presentational         |
| P1       | `Kbd`         | Keyboard shortcut token for docs and command surfaces                    | Presentational         |
| P1       | `ButtonGroup` | Adjacent action grouping and segmented visual joining                    | Local composition      |
| P2       | `Avatar`      | User or entity image/fallback display                                    | Presentational         |
| P2       | `Collapsible` | Disclosure content with controlled/uncontrolled open state               | Ark UI if available    |

## Acceptance Criteria

Each component addition must include:

- Source file at `packages/react/src/<component>/index.tsx`
- CSS module at `packages/react/src/<component>/index.module.less`
- Colocated test at `packages/react/src/<component>/index.test.ts` or `index.test.tsx`
- Storybook story with `Interaction` play function
- Root export in `packages/react/src/index.ts`
- Subpath export in `packages/react/package.json`
- Import matrix and component note in `docs/design/components.md`
- No `vp check` warnings
- Passing `vp test`

## Design Rules

- Use `variant`, `color`, `size`, and `shape` only where those axes are meaningful and already established by sibling components.
- For form-related components, reuse `Field` semantics instead of duplicating label, hint, error, and aria wiring.
- For interactive components, use Ark UI when there is a matching primitive; otherwise document why local behavior is sufficient.
- Keep default markup semantic and accessible before adding visual variants.

## Suggested Sequence

1. Implement `Fieldset` to complete the form semantics layer around the new `Field`.
2. Implement `InputGroup` because it directly composes with existing `Input`, `Textarea`, and `Select` work.
3. Implement `Alert`, `Empty`, and `Kbd` as presentational primitives with low behavioral risk.
4. Implement `ButtonGroup` once button grouping rules are documented.
5. Reassess `Avatar` and `Collapsible` after the first four additions are stable in Storybook and website usage.
