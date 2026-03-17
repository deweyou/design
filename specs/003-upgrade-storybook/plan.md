# Implementation Plan: Upgrade Storybook to Latest

**Branch**: `003-upgrade-storybook` | **Date**: 2026-03-17 | **Spec**: [specs/003-upgrade-storybook/spec.md](specs/003-upgrade-storybook/spec.md)
**Input**: Feature specification from `/specs/003-upgrade-storybook/spec.md`

## Summary

Upgrade the internal Storybook review app from the current 8.6.x line to Storybook `10.2.19`, remove version skew across Storybook packages, preserve the existing internal review workflow in `apps/storybook`, and document any contributor-facing migration changes before broader component work starts.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x-compatible APIs, Node.js 24.14.0 baseline  
**Primary Dependencies**: vite-plus, Storybook 10.2.19, `@storybook/addon-docs`, React, React DOM, TypeScript  
**Storage**: File-based source, config, and generated preview artifacts only  
**Testing**: `vp check`, `vp test`, `vp run storybook#build`, and story-preview smoke validation  
**Target Platform**: Node.js development environment and modern evergreen desktop browsers for internal review  
**Project Type**: Monorepo UI library with internal preview app under `apps/storybook`  
**Performance Goals**: Maintainers can start or build the preview environment without version-mismatch failures and can reach representative stories quickly enough for routine review work  
**Constraints**: Must use Vite+ workflows, must preserve `apps/storybook` as an internal review surface, must keep global style import explicit, must not introduce reusable behavior that only lives in an app, must respect Storybook 10's ESM-only requirement, and must keep the maintainer dev entrypoint non-interactive by default  
**Scale/Scope**: One internal Storybook app, one existing starter story set, one shared dependency catalog entry set, and one migration-note surface for maintainers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Target package boundaries are explicit, and reusable behavior is implemented in packages rather than only in `website`.
  - Pass: this feature only upgrades `apps/storybook` and shared dependency catalog entries; no reusable component behavior moves into an app.
- Public API changes are listed for each affected package, including props, slots, events, variants, and semver impact.
  - Pass: no component package API change is planned; the affected public maintainer-facing contract is the Storybook authoring and preview workflow in `apps/storybook`, with semver impact documented as internal tooling change rather than package API breakage.
- Accessibility expectations are specified for keyboard interaction, focus management, semantics, and state behavior.
  - Pass: the spec requires keyboard and screen-reader review of the upgraded preview shell, docs view, and interactive controls.
- Token and theming impact is identified, including any new or changed design tokens.
  - Pass: no new tokens are planned; the existing `@deweyou-ui/styles/theme.css` import remains the preview theming contract unless migration findings require documentation updates.
- Required verification is planned: `vp check`, relevant `vp test` or `vp run ...` commands, and preview or demo updates in `website`.
  - Pass: implementation uses `vp check`, `vp test`, `vp run storybook#build`, and `vp run storybook#dev`. `apps/website` is unaffected because Storybook remains internal review only.

**Post-Phase 1 Re-check**: Pass. The research, data model, contract, and quickstart keep the change scoped to dependency catalog alignment and `apps/storybook`, preserve explicit accessibility and theming expectations, and maintain Vite+ workflow discipline.

## Project Structure

### Documentation (this feature)

```text
specs/003-upgrade-storybook/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── storybook-preview-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── storybook/
│   ├── .storybook/
│   ├── src/stories/
│   └── tests/
└── website/

packages/
├── components/
├── hooks/
├── styles/
└── utils/

package.json
pnpm-workspace.yaml
```

**Structure Decision**: Keep Storybook as a single internal review app in `apps/storybook`. Version alignment happens through the root dependency catalog in `pnpm-workspace.yaml` and the app's `package.json` catalog references. The implemented upgrade keeps docs support through `@storybook/addon-docs`, preserves the preview theme import, and sets the default dev workflow to port `6106`. No new package boundary is introduced, and no public documentation ownership moves from `apps/website`.

## Complexity Tracking

No constitution violations are required for this change.
