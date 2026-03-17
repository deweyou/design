# AGENTS

## Scope

Applies to `packages/icons`.

## Constraints

- Keep the public package surface limited to `Icon`, icon-related types, and
  named `XxxIcon` exports.
- Upstream asset package details must stay internal to `packages/icons`.
- `label` is the only public accessibility switch; do not add a separate
  `decorative` prop.
- Default icon color should inherit from surrounding UI via `currentColor`.
- Keep the icon registry as the single source of truth for supported names and
  named export alignment.
- Unit tests live next to source units as `index.test.ts` or `index.test.tsx`.
