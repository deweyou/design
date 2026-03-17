# Implementation Plan: Repository Conventions Standardization

**Branch**: `002-repo-conventions` | **Date**: 2026-03-17 | **Spec**: [spec.md](/Users/bytedance/Documents/code/ui/specs/002-repo-conventions/spec.md)
**Input**: Feature specification from `/specs/002-repo-conventions/spec.md`

## Summary

Standardize repository authoring conventions for functions, React component source files, naming, and source-test colocation across shared packages. The implementation approach combines repository-level enforcement where rules are mechanically checkable, package- or repo-level `AGENTS.md` guidance where human judgment is still needed, and preview plus test updates so structural rules remain visible during review.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x-compatible package APIs, Node.js 24.14.0 baseline  
**Primary Dependencies**: `vite-plus`, React, Less, Storybook, CSS Modules, monorepo package workspaces  
**Storage**: File-based source tree and generated package artifacts; no persistent runtime storage  
**Testing**: `vp test`, colocated unit tests, existing package and app test coverage, preview verification in `website`  
**Target Platform**: Monorepo UI packages and demo applications consumed in modern browser environments  
**Project Type**: UI component monorepo with reusable packages and demo apps  
**Performance Goals**: Contributors can apply the structure without slowing standard review or preview workflows; lint and check commands remain suitable for routine local and CI use  
**Constraints**: Must use `vp` workflows, preserve package boundaries, avoid undocumented public API breaks, keep accessibility and preview expectations intact, and prefer automated enforcement only for rules that can be checked reliably  
**Scale/Scope**: Repository-wide authoring policy affecting root guidance plus `packages/components`, `packages/hooks`, `packages/utils`, and any demo-app examples that should stop modeling disallowed patterns

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Target package boundaries are explicit, and reusable behavior is implemented in packages rather than only in `website`.
  Pass: the plan targets shared packages plus top-level guidance, and any example cleanup in `website` is treated as alignment work rather than the sole source of policy.
- Public API changes are listed for each affected package, including props, slots, events, variants, and semver impact.
  Pass: no new runtime component APIs are proposed; the plan records documentation and structure impacts and requires import-surface review if files move.
- Accessibility expectations are specified for keyboard interaction, focus management, semantics, and state behavior.
  Pass: component preview and review expectations remain in scope so structural cleanup cannot drop accessible interaction coverage.
- Token and theming impact is identified, including any new or changed design tokens.
  Pass: no new tokens are expected; the plan explicitly preserves current token and theming behavior.
- Required verification is planned: `vp check`, relevant `vp test` or `vp run ...` commands, and preview or demo updates in `website`.
  Pass: verification includes `vp check`, `vp test`, and targeted preview/demo validation.

## Project Structure

### Documentation (this feature)

```text
specs/002-repo-conventions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── repository-governance.md
└── tasks.md
```

### Source Code (repository root)

```text
AGENTS.md
vite.config.ts
apps/
├── website/
│   ├── AGENTS.md
│   └── src/
└── storybook/
    └── AGENTS.md
packages/
├── components/
│   ├── AGENTS.md
│   ├── src/
│   └── tests/
├── hooks/
│   ├── AGENTS.md
│   ├── src/
│   └── tests/
└── utils/
    ├── AGENTS.md
    ├── src/
    └── tests/
```

**Structure Decision**: The feature spans repository governance files and the shared package boundaries that the constitution prioritizes. Enforcement work belongs in root-level lint and agent guidance, while package-level `AGENTS.md` files and package source trees carry the package-specific structure rules. `website` remains a review surface and example consumer that should stop demonstrating disallowed patterns such as `createElement` when the implementation phase begins.

## Phase 0: Research

Research focuses on where each convention should live:

1. Which requested rules are strong candidates for repository-level lint enforcement versus documentation-only guidance.
2. How to represent structural rules that lint cannot enforce reliably, including package `AGENTS.md`, root `AGENTS.md`, and review gates.
3. How to handle incremental adoption without forcing risky repository-wide moves in one pass.

## Phase 1: Design & Contracts

Design outputs describe the governed entities, the contract between contributors and repository automation, and the contributor workflow for adding or migrating source units under the new standard.

## Post-Design Constitution Check

- Target package boundaries are explicit, and reusable behavior is implemented in packages rather than only in `website`.
  Pass: the design targets root governance plus shared package conventions, with `website` limited to preview/example alignment.
- Public API changes are listed for each affected package, including props, slots, events, variants, and semver impact.
  Pass: the contract requires API-surface review when moving or renaming package files that could affect imports.
- Accessibility expectations are specified for keyboard interaction, focus management, semantics, and state behavior.
  Pass: the design keeps accessibility expectations in preview, test, and review obligations.
- Token and theming impact is identified, including any new or changed design tokens.
  Pass: no new token work is introduced; the design documents that token behavior remains unchanged.
- Required verification is planned: `vp check`, relevant `vp test` or `vp run ...` commands, and preview or demo updates in `website`.
  Pass: the quickstart and contract both require these verification steps.

## Complexity Tracking

No constitution violations require justification.
