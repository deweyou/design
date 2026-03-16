# utils

Framework-agnostic helpers that other workspace packages can safely depend on.

## Source Layout

- Each util must live in its own folder under `src/<util-name>/`.
- Each util folder should colocate its logic and unit tests.
- Keep `src/index.ts` as a thin barrel only.

## Public Entrypoints

- `@deweyou-ui/utils`: shared non-React helpers when the workspace actually needs them.

## Dependency Direction

- May depend on: platform APIs only.
- Must not depend on: `@deweyou-ui/hooks`, `@deweyou-ui/styles`, `@deweyou-ui/components`, or app packages.
