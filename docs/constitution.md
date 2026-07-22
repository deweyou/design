# Deweyou UI Constitution

> Version: 1.4.0 | Created: 2026-03-15 | Last revised: 2026-05-17
>
> This file was established during repository initialization and is updated by later archive flows.
> `AGENTS.md` references this file as the governance baseline to read before feature work.

---

## Core Principles

### I. Package-First Component Architecture

All reusable UI capabilities must be implemented as monorepo packages before being consumed by the demo site or any downstream app. Each package must have a clear and focused responsibility, expose an explicit public API, and avoid implicit coupling to `website` internals. Shared logic, hooks, tokens, and primitives belong in packages, not duplicated across apps. Rationale: this monorepo exists to deliver a maintainable component library, not only a website.

**Ark UI behavior layer**: any component with complex interaction behavior, such as floating positioning, focus management, state machines, or ARIA output, must prefer Ark UI (`@ark-ui/react`) instead of hand-rolled equivalents. Styling remains CSS Modules with Less and design tokens, without relying on Ark UI default styles. Public APIs must be decoupled from Ark UI internals. Non-click trigger modes should be bridged through controlled mode with the `open` prop. Reference implementation: `packages/react/src/popover/index.tsx`.

### II. Accessibility And API Consistency

Every public component must define its accessibility contract and interaction model before implementation. Keyboard behavior, focus management, semantic markup, ARIA usage, disabled states, and localized text must be described and verified. Public APIs, including props, slots, events, variants, and controlled/uncontrolled behavior, must follow existing naming and composition patterns unless a documented exception is approved. Rationale: accessibility and API consistency are product requirements, not final polish.

### III. Tokens And Themes As Source Of Truth

Every reusable visual decision must be expressed through shared design tokens and theme primitives. Components must consume normalized tokens for color, typography, spacing, radius, motion, and state styles instead of hardcoding one-off values. Any new visual primitive must document its light/dark behavior, density impact, and override boundaries. `@deweyou-design/styles` is the sole source of truth for all `--ui-*` variables; components consume those variables directly and must not inline token values. Rationale: a token-driven style system keeps the component library consistent, themeable, and safely extensible.

### IV. Testing And Preview Gates

Every component package change must ship with automated verification and a human review surface. At minimum, functional changes need component logic unit tests, interaction or integration tests for user-visible behavior, and updated previews or demos that cover major states in `website`. If a defect is first found by manual QA and could have been caught by automation, the missing test must be added before the issue is closed. Rationale: repeatable tests plus visual review are the cheapest way to catch UI regressions.

### V. Vite+ Monorepo And Documentation Discipline

All dependency management, linting, formatting, testing, packaging, and build operations must use `vp` commands or `vp run` task entries. Unless a tooling capability gap is already documented, project workflows and docs must not call `pnpm`, `npm`, `yarn`, `npx`, standalone `vite`, or standalone `vitest` directly. Every package must be independently buildable and testable in the monorepo task graph.

All publishable packages under `packages/` must reuse Vite+ shared build conventions by default instead of assuming package-specific build config. Package-level build config is allowed only when public entrypoints, output structure, asset copying, or publish contracts cannot be satisfied by the shared conventions; the related spec, plan, or package documentation must explain why the default is insufficient. Rationale: Vite+ reduces maintenance cost by unifying build mental models, so exceptions must be explicit and constrained.

Durable repository documentation is written in English by default. This includes root routing docs, README content, design knowledge, testing standards, architecture notes, and future knowledge-base updates under `docs/`. Historical spec archives under `docs/specs/` and `docs/superpowers/` are exempt from retroactive translation unless a task explicitly targets them. Code identifiers, commands, file paths, environment variables, protocol fields, third-party API names, and semver versions should stay unchanged.

### VI. Repository Coding Standards

The following standards apply to all governed source units under `packages/`. Violations must be explained in the change.

**Function style**: use arrow functions by default. Function declarations are allowed only when a framework boundary, hoisting requirement, or external API constraint makes them safer, and the change must explain the reason.

**React component files**: React components must be written in `.tsx` files. Do not introduce `React.createElement` component implementations unless a clear toolchain limitation is documented.

**File and directory names**: new or renamed files and directories in governed areas must use lowercase kebab-case names.

**Source unit structure**: in `packages/react`, `packages/react-hooks`, and `packages/utils`, each governed source unit must live under `src/<unit-name>/` and keep its local entry and unit test as colocated `index.tsx` or `index.ts` and `index.test.tsx`.

**Commit format**: commit messages must use `<type>(<scope>): <summary>` when scope is meaningful, or `<type>: <summary>`. Recommended types are `feat`, `fix`, `refactor`, `docs`, `test`, `build`, and `chore`. Subjects use imperative mood, lowercase wording, and one logical change. `.vite-hooks/commit-msg` enforces the format. Rationale: consistent code style and commit format reduce review load and keep changelogs readable.

### VII. Design System Visual Standards

All component visual and interaction implementation must follow these constraints. During review, these values are non-negotiable. See [docs/design/system.md](design/system.md) for details.

**Component variant model**: interactive components must be modeled through four orthogonal dimensions:

| Dimension | Values                                             | Meaning                                    |
| --------- | -------------------------------------------------- | ------------------------------------------ |
| variant   | filled / outlined / ghost / link                   | visual hierarchy from solid to text        |
| color     | neutral / primary / danger                         | three semantic colors                      |
| size      | extra-small / small / medium / large / extra-large | five size levels                           |
| shape     | rect / float / pill                                | supported only by filled/outlined variants |

Ghost and link variants do not support the shape prop.

**Interaction state values**:

| Property               | Required value                                                                                          | Common mistake                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| disabled               | `opacity: 0.56`                                                                                         | 0.3, 0.4                                          |
| interaction transition | `140ms ease`                                                                                            | 200ms, 300ms                                      |
| floating motion        | `160ms`, cubic-bezier on enter and ease on exit                                                         | 200ms, 300ms                                      |
| focus ring             | deep emerald on compact controls; neutral border/inset feedback on app chrome and large content targets | exterior glow or brand-colored full-surface frame |
| hover mix              | `color-mix(in srgb, <color> 6-12%, transparent)`                                                        | direct background swap                            |
| active movement        | `translateY(1px)`                                                                                       | translateY(2px)                                   |

**Font families**: body/control uses Source Han Sans SC Web -> PingFang SC -> Heiti SC -> Microsoft YaHei -> Noto Sans CJK SC -> sans-serif; content/display uses Source Han Serif CN Web -> Songti SC -> STSong -> SimSun -> NSimSun -> serif.

**Radius levels**: rect (0), float (4px), auto (8px), pill (999px).

**Shadows**: cards are border-first and have no shadow by default. Floating surfaces use `--ui-shadow-sm`, `--ui-shadow-md`, or `--ui-shadow-lg` by layer. Do not hardcode shadow values.

**Focus**: every interactive element shows focus feedback only on `:focus-visible`, never from mouse click. Compact controls use the shared deep-emerald treatment. Application chrome, navigation utilities, icon or canvas tiles, clickable cards, and masonry items use the shared neutral treatment. Apply either treatment to the local target being operated, not to an entire menu, overlay, dialog, editor, scroll area, or tab panel.

**prefers-reduced-motion**: floating transforms are reset and link clip-path transitions are disabled.

Rationale: design-system value consistency directly affects user trust. Encoding values in the constitution gives checklists and code review a clear baseline.

---

## Package Standards

- Every publishable package must document its target consumers, entrypoints, and semver impact in its README or package-level docs.
- Any breaking API, style-token, or behavior change must include migration notes in the related spec, plan, or release note before merge.
- Demo-only code may live in `website`, but it cannot be the only source for reusable package behavior, styling, or documentation.
- Cross-package dependencies must point from higher-level components to lower-level primitives or utilities. Cyclic dependencies are forbidden.

---

## Workflow And Quality Gates

- Feature specs must identify the target package, public API changes, accessibility expectations, token or theme impact, and demo coverage plan.
- New or updated durable knowledge documents should be written in English. Historical spec archives may remain as-is unless explicitly targeted.
- If an implementation plan lacks package boundaries, accessible interaction definitions, required tests, `vp` verification commands, or compliance with Principle VI or VII, its Constitution Check must fail.
- Task breakdowns must include package-side work, website preview updates, and verification tasks with `vp check` plus relevant `vp test` or `vp run` commands.
- A change is complete only when affected packages build, tests pass, preview coverage is updated, and reviewer-facing docs reflect the change.

---

## Governance

This constitution overrides conflicting local practices and templates. Any revision must be recorded in `docs/constitution.md`, include a synchronization impact report, and update all affected templates or guidance files in the same change.

This constitution follows semantic versioning: MAJOR removes or redefines principles incompatibly, MINOR adds principles or materially expands governance scope, and PATCH clarifies wording without changing policy meaning. Every plan and pull request must run a compliance review: reviewers must confirm package-first architecture, accessibility, token usage, testing and preview coverage, Vite+ workflow compliance, repository coding standards, design-system values, and documentation-language compliance.

---

## VIII. Accumulated Learnings

> Full archive records for features live in [docs/specs/index.md](specs/index.md). Each spec directory's `archive.md` records key decisions, pitfalls, and reusable patterns.
> This section keeps only cross-feature insights that directly affect constitution decisions.

<!-- Archive entries that materially affect the constitution can be appended here. -->
