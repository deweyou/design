# AGENTS

## Scope

Applies to `packages/utils`.

## Constraints

- Keep this package framework-agnostic.
- Each util must live in its own folder under `src/<util-name>/`.
- Use lowercase, hyphen-separated names for util folders and files in governed areas.
- Colocate each util's unit test with that util folder as `index.test.ts`.
- Use arrow functions by default for exported and local utility helpers in this package.
- Do not add React, component, or app-specific logic here.
- If no shared util is needed, keep the package minimal rather than adding speculative helpers.
- Top-level tests in `packages/utils/tests` are reserved for repository-wide convention and structure checks.
