# components

Reusable UI components with CSS Modules, root `className` support, and limited
component-level CSS variable overrides.

## Public Entrypoints

- `@deweyou-ui/components`: exports the foundation components and their customization contracts.

## Styling Contract

- Global styles are not injected automatically.
- Consumers import `@deweyou-ui/styles/theme.css` explicitly.
- Root `className` is the primary override hook.
- Internal CSS module class names are private implementation details.
