# AGENTS

## Scope

Applies to `packages/components`.

## Constraints

- Put each component in its own folder under `src/<component-name>/`.
- Inside each component folder, use `index.tsx` for implementation and `index.module.less` for scoped styles.
- Use standard TSX instead of `React.createElement` unless there is a concrete tooling limitation.
- Use `classnames` directly; do not add a local `cx` wrapper utility.
- Components must not silently inject global styles.
- Root `className` remains the primary public styling hook.
