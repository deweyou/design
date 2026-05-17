# Component Development Pattern: Ark UI Behavior Layer

Interactive components, including floating surfaces, selectors, dialogs, and menus, must be built on Ark UI primitives from `@ark-ui/react` instead of hand-rolled behavior logic.

## Decision Rules

- Ark UI has a matching component, such as Popover, Dialog, Menu, or Tooltip: use Ark UI.
- Ark UI does not cover the need, such as presentational components or specific business logic: custom implementation is allowed, but explain the reason in the spec or plan.

## Implementation Rules

1. Use Ark UI primitives for behavior: state machines, ARIA, focus management, and positioning.
2. Implement all styling through CSS Modules with Less and design tokens. Do not use Ark UI default styles.
3. Keep the public API decoupled from Ark UI primitives. Do not pass Ark UI props straight through to consumers as the public contract.
4. When a trigger mode is not directly supported by Ark UI, bridge the behavior with controlled mode through the `open` prop.

Reference implementation: `packages/react/src/popover/index.tsx`.

## Development Tooling

Before implementing Ark UI-backed components, install the Ark UI MCP Server in Claude Code:

```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

After installation, use the conversation to inspect Ark UI component APIs, props, and usage patterns.
