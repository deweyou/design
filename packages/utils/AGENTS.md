# AGENTS

## Scope

Applies to `packages/utils`.

## Constraints

- Keep this package framework-agnostic.
- Each util must live in its own folder under `src/<util-name>/`.
- Colocate each util's unit test with that util folder when possible.
- Do not add React, component, or app-specific logic here.
- If no shared util is needed, keep the package minimal rather than adding speculative helpers.
