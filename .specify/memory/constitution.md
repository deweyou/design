<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Principle 1 -> I. Package-First Component Architecture
  - Principle 2 -> II. Accessibility and API Consistency
  - Principle 3 -> III. Tokens and Theming as Source of Truth
  - Principle 4 -> IV. Test and Preview Gates
  - Principle 5 -> V. Vite+ Monorepo Discipline
- Added sections:
  - Package Standards
  - Workflow and Quality Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated .specify/templates/plan-template.md
  - ✅ updated .specify/templates/spec-template.md
  - ✅ updated .specify/templates/tasks-template.md
  - ✅ updated README.md
  - ⚠ pending .specify/templates/commands/*.md (directory absent; no files to update)
- Follow-up TODOs:
  - None
-->

# Deweyou UI Constitution

## Core Principles

### I. Package-First Component Architecture

Every reusable UI capability MUST be implemented as a package in the monorepo
before it is consumed by the demo site or any downstream application. Each
package MUST own a narrow responsibility, expose an explicit public API, and
avoid hidden coupling to `website` internals. Shared logic, hooks, tokens, and
primitives MUST live in packages, not be duplicated across apps. Rationale:
the monorepo exists to ship a maintainable component library rather than a
single website.

### II. Accessibility and API Consistency

Every public component MUST define its accessibility contract and interaction
model before implementation. Keyboard behavior, focus management, semantic
markup, ARIA usage, disabled states, and localization-sensitive text MUST be
specified and verified. Public APIs for props, slots, events, variants, and
controlled or uncontrolled behavior MUST follow existing naming and composition
patterns unless a documented exception is approved. Rationale: accessibility
and API consistency are product requirements, not polish work.

### III. Tokens and Theming as Source of Truth

Visual decisions MUST be expressed through shared design tokens and theme
primitives wherever reuse is expected. Components MUST consume canonical tokens
for color, typography, spacing, radius, motion, and state styling instead of
hard-coded one-off values. Any new visual primitive MUST document dark or light
theme behavior, density implications, and override boundaries. Rationale:
token-driven styling keeps the library coherent, themeable, and safe to scale.

### IV. Test and Preview Gates

Every component package change MUST ship with automated verification and a human
review surface. At minimum, feature work MUST include unit tests for component
logic, interaction or integration tests for user-visible behavior, and an
updated preview or demo entry in `website` covering primary states. Defects
found first in manual QA that could have been caught by automated tests MUST
result in new tests before closure. Rationale: UI regressions are cheapest to
catch through repeatable tests plus visual review.

### V. Vite+ Monorepo Discipline

All dependency management, linting, formatting, testing, packing, and build
operations MUST use `vp` commands or `vp run` task entrypoints. Direct use of
`pnpm`, `npm`, `yarn`, `npx`, standalone `vite`, or standalone `vitest` is not
allowed in project workflows or documentation unless a tool gap is documented.
Packages MUST remain buildable and testable within the monorepo task graph.
Rationale: a single toolchain reduces drift between packages and keeps CI,
local development, and agent automation aligned.

## Package Standards

- Every publishable package MUST declare its intended consumers, entrypoints,
  and semver impact surface in its README or package-level docs.
- Breaking API, styling token, or behavior changes MUST include migration notes
  in the relevant spec, plan, or release notes before merge.
- Demo-only code MAY live in `website`, but it MUST NOT become the only source
  of component behavior, styling, or documentation for reusable packages.
- Cross-package dependencies MUST point from higher-level components to lower-
  level primitives or utilities; circular dependencies are prohibited.

## Workflow and Quality Gates

- Feature specs MUST identify the target package(s), public API changes,
  accessibility expectations, token or theme impact, and demo coverage plan.
- Implementation plans MUST fail Constitution Check if they omit package
  boundaries, accessible interaction definitions, required tests, or `vp`
  validation commands.
- Task breakdowns MUST include package work, website preview updates, and
  verification tasks for `vp check` plus the relevant `vp test` or `vp run`
  commands.
- A change is not complete until affected packages build, tests pass, preview
  coverage is updated, and reviewer-visible documentation reflects the change.

## Governance

This constitution overrides conflicting local practices and templates. Amendments
MUST be documented in `.specify/memory/constitution.md`, include a Sync Impact
Report, and update all affected templates or guidance files in the same change.

Versioning policy for this constitution follows semantic versioning: MAJOR for
removing or redefining a principle in a backward-incompatible way, MINOR for
adding a principle or materially expanding governance, and PATCH for wording
clarifications that do not change policy. Compliance review is mandatory for
every plan and pull request: reviewers MUST verify package-first architecture,
accessibility, token usage, test and preview coverage, and Vite+ workflow
compliance before approval.

**Version**: 1.0.0 | **Ratified**: 2026-03-15 | **Last Amended**: 2026-03-15
