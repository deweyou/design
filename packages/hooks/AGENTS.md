# AGENTS

## Scope

Applies to `packages/hooks`.

## Constraints

- Only reusable React hooks belong here.
- Do not move framework-agnostic helpers into this package.
- Prefer standard TSX/TypeScript patterns over workaround-style React element factories.
- Hooks may depend on `utils`, but not on `components`.
