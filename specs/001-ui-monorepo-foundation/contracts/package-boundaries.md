# Contract: Package Boundaries

## Purpose

Define the responsibility, audience, and dependency direction for each initial package and app boundary introduced by the UI monorepo foundation.

## Boundaries

### `packages/utils`

- **Purpose**: Framework-agnostic utility logic
- **Audience**: Other packages and maintainers
- **May depend on**: No higher-level package
- **Must not own**: React hooks, component implementations, app-specific documentation logic
- **Public contract**: Stable utility exports with no React runtime requirement

### `packages/hooks`

- **Purpose**: Reusable React hooks shared across components or apps
- **Audience**: `components`, `website`, and internal maintainers
- **May depend on**: React and lower-level utilities
- **Must not own**: Framework-agnostic helpers that belong in `utils`, component-specific hooks used by only one component
- **Public contract**: Stable hook exports and documented hook behavior

### `packages/styles`

- **Purpose**: Design token sources, theme definitions, reset or base CSS, and generated theme outputs
- **Audience**: Consumers, `components`, `website`, `storybook`, and maintainers
- **May depend on**: Tooling required for generation only
- **Must not own**: Component implementations or app-specific content
- **Public contract**:
  - Explicit global style entrypoint for consumers
  - Dedicated light and dark theme outputs
  - Documented default theme entrypoint
  - Token metadata intended for documentation and tooling

### `packages/components`

- **Purpose**: Reusable UI components and their component-local styles
- **Audience**: Application developers and app surfaces
- **May depend on**: `styles`, `hooks`, and `utils`
- **Must not own**: Global theme injection, app-specific demos as the only source of component behavior
- **Public contract**:
  - Component exports
  - Root `className` support
  - Limited component-level CSS variable overrides where explicitly documented

### `apps/website`

- **Purpose**: Public documentation, design rationale, curated demos, and limited interactive playground content
- **Audience**: Application developers, designers, and evaluators
- **May depend on**: Reusable packages
- **Must not own**: Reusable behavior that should live in packages, exhaustive internal validation content
- **Public contract**: Official user-facing guidance and examples

### `apps/storybook`

- **Purpose**: Internal state review, edge-case validation, and exploratory component development support
- **Audience**: Maintainers and reviewers
- **May depend on**: Reusable packages
- **Must not own**: The sole official documentation path for users
- **Public contract**: Internal review surface only

## Dependency Rules

- Dependency direction must flow from apps and high-level packages down to foundational packages.
- `components` may depend on `styles`, `hooks`, and `utils`.
- `hooks` may depend on `utils` but not on `components`.
- `styles` and `utils` remain foundational and must not depend on `components`, `website`, or `storybook`.
- Circular package dependencies are prohibited.
