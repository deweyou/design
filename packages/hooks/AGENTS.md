# AGENTS

## Scope

Applies to `packages/hooks`.

## Constraints

- Only reusable React hooks belong here.
- Do not move framework-agnostic helpers into this package.
- Put each hook in its own folder under `src/<hook-name>/` with `index.ts` and `index.test.ts`.
- Use arrow functions by default for exported hooks and local helpers in this package.
- Prefer standard TSX/TypeScript patterns over workaround-style React element factories.
- Hooks may depend on `utils`, but not on `components`.
- Keep top-level tests only for cross-cutting coverage once a hook has a colocated unit test.
