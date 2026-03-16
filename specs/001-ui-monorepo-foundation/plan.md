# Implementation Plan: UI Monorepo Foundation

**Branch**: `001-ui-monorepo-foundation` | **Date**: 2026-03-16 | **Spec**: [specs/001-ui-monorepo-foundation/spec.md](specs/001-ui-monorepo-foundation/spec.md)
**Input**: Feature specification from `/specs/001-ui-monorepo-foundation/spec.md`

## Summary

Establish the v1 foundation for the Deweyou UI monorepo by separating reusable logic into `packages/utils`, `packages/hooks`, `packages/styles`, and `packages/components`, and by treating `apps/website` and `apps/storybook` as distinct app surfaces. The implementation will use Vite+ workflows, React plus TypeScript packages, Less-authored component styling with CSS Modules, direct `classnames` usage for component class composition, scoped publishable package names under `@deweyou-ui/*`, and a controlled token-driven theme system where TypeScript token sources generate light, dark, and default CSS theme outputs that consumers import explicitly.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x-compatible package APIs, Node.js 24.14.0 tooling baseline  
**Primary Dependencies**: vite-plus, React, Less, Storybook, TypeScript  
**Storage**: File-based source and generated style artifacts only  
**Testing**: `vp test`, package-level unit tests, and website or Storybook preview validation  
**Target Platform**: Modern evergreen browsers for website and component consumers; Node.js development environment  
**Project Type**: Monorepo UI library with package outputs and app surfaces  
**Performance Goals**: Fast local feedback for package development, theme switching without noticeable delay, and documentation surfaces that remain responsive during interactive preview use  
**Constraints**: Must use Vite+ workflows, must keep global styles explicit, must preserve an opinionated design language, must avoid circular package dependencies, and must keep public theme surface intentionally small  
**Scale/Scope**: 4 publishable foundation packages, 2 app surfaces, a controlled public theme color surface, and one shared documentation and planning model for future components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Target package boundaries are explicit, and reusable behavior is implemented in packages rather than only in `website`.
  - Pass: `utils`, `hooks`, `styles`, and `components` are the reusable layers; `website` and `storybook` are consumers.
- Public API changes are listed for each affected package, including props, slots, events, variants, and semver impact.
  - Pass: this change defines package responsibilities and public entrypoints, plus the styling contract for component `className`, component-level CSS vars, and explicit global style imports.
- Accessibility expectations are specified for keyboard interaction, focus management, semantics, and state behavior.
  - Pass: spec requires keyboard and screen-reader coverage for website demos, focus states, and theme behavior.
- Token and theming impact is identified, including any new or changed design tokens.
  - Pass: plan introduces TypeScript token sources, a small public color theme surface, and light/dark/default CSS outputs.
- Required verification is planned: `vp check`, relevant `vp test` or `vp run ...` commands, and preview or demo updates in `website`.
  - Pass: implementation will validate foundation packages and apps with `vp check`, package tests, and preview updates in `apps/website`.

**Post-Phase 1 Re-check**: Pass. The research, data model, contracts, and quickstart artifacts preserve package-first boundaries, explicit accessibility expectations, controlled token ownership, website preview obligations, and Vite+ workflow discipline.

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-monorepo-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── package-boundaries.md
│   └── styling-and-theme-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── storybook/
└── website/

packages/
├── components/
├── hooks/
├── styles/
└── utils/

specs/
└── 001-ui-monorepo-foundation/
```

**Structure Decision**: Use an app-and-package monorepo. Reusable assets live only in `packages/*`. `apps/website` becomes the public documentation and demo surface. `apps/storybook` becomes the internal state and development surface. `packages/styles` owns token sources, theme generation, and global CSS entrypoints, but publishes its CSS and Less assets from `dist/` for release-facing consumption. `packages/components` owns component implementations in per-component folders with colocated `index.tsx` and `index.module.less` files. `packages/hooks` isolates reusable React hooks from framework-agnostic utilities in `packages/utils`, and `packages/utils` stays minimal until a concrete shared helper is needed.

## Complexity Tracking

No constitution violations are required for this change.
