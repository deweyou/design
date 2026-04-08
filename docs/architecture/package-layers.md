# Package Layers

## Published packages (`@deweyou-design/*`)

These packages are published to npm and consumed externally.

| Package                       | Path                    | Purpose                                               |
| ----------------------------- | ----------------------- | ----------------------------------------------------- |
| `@deweyou-design/react`       | `packages/react/`       | React component library — primary consumer entrypoint |
| `@deweyou-design/react-hooks` | `packages/react-hooks/` | Reusable React hooks, independent of components       |
| `@deweyou-design/react-icons` | `packages/react-icons/` | React icon components backed by tdesign-icons-svg     |
| `@deweyou-design/styles`      | `packages/styles/`      | Design tokens, theme CSS, Less bridge                 |
| `@deweyou-design/utils`       | `packages/utils/`       | Runtime utilities for external consumers              |

All published packages must:

- Have `publishConfig.directory: "dist"` in `package.json`
- Run `write-published-manifest.mjs` in their build script to resolve `workspace:*` and `catalog:` specifiers to concrete version numbers in `dist/package.json`
- Not reference `@deweyou-ui/infra` in runtime `dependencies`

## Build-time infrastructure (`@deweyou-ui/infra`)

`packages/infra/` contains build scripts and monorepo tooling used **only during development and CI**. It is not published.

- No `publishConfig` in `package.json`
- No `files` field
- Must never appear in the `dependencies` of a published package
- May appear in `devDependencies` of workspace packages that need its scripts

Key scripts in `packages/infra/scripts/`:

- `write-published-manifest.mjs` — resolves `workspace:*` / `catalog:` in `dist/package.json`

## Dependency rules

```
apps/*            → @deweyou-design/* (workspace:*)
@deweyou-design/react   → @deweyou-design/react-hooks, @deweyou-design/styles
@deweyou-design/react-hooks → @deweyou-design/utils (optional, runtime)
@deweyou-design/react-icons → (no design system deps)
@deweyou-design/styles  → (no deps)
@deweyou-design/utils   → (no deps)
@deweyou-ui/infra       → (build-only, never in published deps)
```

Cross-layer violations are caught by `packages/react/tests/workspace-boundaries.test.ts`.
