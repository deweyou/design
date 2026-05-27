---
name: deweyou-design-components
description: Use when building, modifying, documenting, or inspecting Deweyou Design React components, component examples, website catalog entries, Storybook stories, design tokens, icons, or AI-facing context such as llms.txt and the Deweyou Design MCP server.
---

# Deweyou Design Components

Use this skill for Deweyou Design component, style, icon, and AI-facing context.

## Start Here

1. Inspect `AGENTS.md` and run `deweyou-cli agent context --format markdown`.
2. Read only the docs needed for the task:
   - `docs/design/components.md` for public component imports and composition contracts.
   - `docs/design/system.md` for visual language and token rules.
   - `docs/architecture/ark-ui.md` for interactive behavior-layer decisions.
   - `docs/architecture/package-layers.md` before touching package boundaries.
   - `docs/architecture/testing.md` for unit, contract, and Storybook e2e ownership.
3. For structured lookup, use the MCP server package:
   - Build: `pnpm --filter @deweyou-design/mcp build`
   - Run stdio server: `pnpm --filter @deweyou-design/mcp mcp`
   - External stdio server: `npx deweyou-design-mcp`

## Component Rules

- Keep React components in TSX files.
- Use arrow functions unless a framework boundary, hoisting need, or external API requires a function declaration.
- New or renamed governed files and directories use lowercase kebab-case names.
- In `packages/react`, each source unit lives under `src/<unit-name>/` with colocated `index` and `index.test`.
- Use `@ark-ui/react` for interactive behavior when it matches the component pattern.
- Style components with CSS Modules and `@deweyou-design/styles` tokens; avoid one-off hard-coded visual systems.
- Prefer root imports for multi-component consumer examples and subpath imports for single-component docs.
- Import `@deweyou-design/styles/theme.css` once at the app root.
- Use `@deweyou-design/react-icons` for icons; wrap interactive icons in `IconButton`, `Button.Icon`, or a native button.

## Public Component Checklist

When adding, removing, or changing the public import or behavior contract of a component, update all relevant surfaces:

- `packages/react/src/index.ts`
- `packages/react/package.json` exports
- `docs/design/components.md`
- root `README.md` and `README_ZH.md`
- `apps/website/src/data/component-catalog.tsx`
- Storybook stories and interaction coverage
- unit tests plus package/export/docs contract tests
- `packages/mcp/src/catalog/index.ts`, style/icon MCP metadata, and regenerated `apps/website/public/llms.txt` when public AI-facing context changes
- this repo-owned skill when the component change also changes workflow, routing, checklist, or verification guidance for future agents

## MCP Resources

The Deweyou Design MCP server is read-only. It exposes:

- `deweyou://design/overview`
- `deweyou://design/components`
- `deweyou://design/styles`
- `deweyou://design/icons`
- `deweyou://design/imports`
- `deweyou://design/rules`

Useful tools:

- `list_components`
- `get_component`
- `get_component_import`
- `list_style_entrypoints`
- `list_icons`
- `get_icon_import`

## Verification

Run the narrowest meaningful checks first, then broaden:

- `pnpm --filter @deweyou-design/mcp test` for MCP and llms context changes.
- `pnpm --filter @deweyou-design/react test` for component package changes.
- `vp run storybook#test` when adding or changing stories.
- `vp check` before claiming repository-level readiness.
