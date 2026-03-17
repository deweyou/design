# Implementation Plan: Add Icon Package for UI Library

**Branch**: `004-icon-package` | **Date**: 2026-03-17 | **Spec**: [specs/004-icon-package/spec.md](specs/004-icon-package/spec.md)
**Input**: Feature specification from `/specs/004-icon-package/spec.md`

## Summary

Add a new `@deweyou-ui/icons` package that publishes a curated foundational icon catalog, exposes both a generic `Icon` entry point and `XxxIcon` named exports, and documents the catalog through `apps/storybook` review coverage plus `apps/website` usage guidance. The implementation will use `tdesign-icons-svg` as the initial SVG asset source, while keeping Deweyou UI in control of naming, sizing, accessibility, failure behavior, and future asset replacement.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x-compatible APIs, Node.js 24.14.0 baseline  
**Primary Dependencies**: vite-plus, React, React DOM, Storybook 10.2.19, `tdesign-icons-svg`, and existing `@deweyou-ui/styles` tokens  
**Storage**: File-based source, package metadata, and generated build artifacts only  
**Testing**: `vp check`, `vp test`, package unit tests under `packages/icons/src/**/*.test.ts`, `vp run storybook#build`, and `vp run website#build`  
**Target Platform**: Node.js development environment and modern evergreen browsers consuming the UI library  
**Project Type**: Monorepo UI library with reusable packages, internal Storybook review app, and public website guidance  
**Performance Goals**: Supported icons resolve from a bundled local registry with no runtime network lookup, remain lightweight enough for dense UI usage, and keep preview surfaces responsive during catalog browsing  
**Constraints**: Must use Vite+ workflows only, must ship a new reusable package before app-level consumption, must expose only an official curated catalog, must support both generic and named icon entry points, must use the fixed `IconProps` contract (`name`, `className`, `style`, `label`, `size`), must fail explicitly for unsupported names, must keep one coherent visual source family, and should reuse existing semantic color tokens via `currentColor` before adding new theme tokens  
**Scale/Scope**: One new publishable package, one foundational icon catalog for common action/status/navigation/feedback cases, one Storybook review surface, and one website documentation/update surface

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Target package boundaries are explicit, and reusable behavior is implemented in packages rather than only in `website`.
  - Pass: reusable icon behavior, catalog ownership, and public exports live in the new `packages/icons` package; `apps/storybook` and `apps/website` only consume and document it.
- Public API changes are listed for each affected package, including props, slots, events, variants, and semver impact.
  - Pass: the new public API is additive under `@deweyou-ui/icons` and includes a generic `Icon` component, `XxxIcon` named exports, and icon-related types. Existing packages have no breaking API changes planned.
- Accessibility expectations are specified for keyboard interaction, focus management, semantics, and state behavior.
  - Pass: the icon contract distinguishes decorative and meaningful usage, requires accessible names for meaningful icons, keeps standalone icons non-focusable by default, and documents behavior when icons appear inside interactive controls.
- Token and theming impact is identified, including any new or changed design tokens.
  - Pass: the first implementation reuses existing semantic text and link color tokens through inherited color and `currentColor`; no new global theme token is planned unless catalog review exposes a gap.
- Required verification is planned: `vp check`, relevant `vp test` or `vp run ...` commands, and preview or demo updates in `website`.
  - Pass: implementation includes `vp check`, `vp test`, `vp run storybook#build`, and `vp run website#build`, with Storybook used for internal catalog review and `apps/website` updated for official usage guidance.

**Post-Phase 1 Re-check**: Pass. The design artifacts keep reusable behavior in `packages/icons`, preserve an additive public package contract, document accessibility and token behavior, and retain Vite+ verification across package, Storybook, and website surfaces.

## Project Structure

### Documentation (this feature)

```text
specs/004-icon-package/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── icon-package-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── storybook/
│   ├── .storybook/
│   └── src/stories/
└── website/
    ├── public/
    └── src/

packages/
├── components/
├── hooks/
├── icons/
│   ├── src/
│   │   ├── icon/
│   │   ├── icon-registry/
│   │   ├── foundation-icons/
│   │   └── index.ts
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.json
│   └── vite.config.ts
├── styles/
└── utils/

pnpm-workspace.yaml
package.json
```

**Structure Decision**: Create a new publishable `packages/icons` package as the single source of truth for icon definitions, the generic renderer, and named exports. Keep review-only catalog browsing in `apps/storybook/src/stories`, and update `apps/website/src` plus `apps/website/public` only for official docs or curated demos. No reusable icon logic should live exclusively in either app. Existing packages remain consumers rather than owners of icon behavior.

## Complexity Tracking

No constitution violations are required for this change.
