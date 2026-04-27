# Feature Spec: Storybook Docs Upgrade and Organization

**Feature Branch**: `20260330-storybook-docs-upgrade`
**Created**: 2026-03-30
**Status**: Draft
**Input**: "帮我优化现有所有的 storybook 页面，color 归一类，然后 components 归一类。然后补齐所有 api 的文档说明，使其更符合一个组件库的接入文档。使用英文的。然后顺便升级一下 storybook 版本。"

## User Scenarios & Testing (Required)

### User Story 1 — Navigating by Category (Priority: P1)

A developer opening Storybook for the first time wants to quickly find the right story. Currently, stories are scattered across "Internal review", "Components", and "Foundations" with no consistent naming — Button and Popover sit under "Internal review" while Menu sits under "Components". The reorganization ensures a predictable two-section hierarchy: all design-token / color stories under **Foundations**, and all component stories under **Components**.

**Why this priority**: Navigation is the entry point; until the hierarchy is coherent, every other improvement is harder to benefit from.

**Independent testing**: Can be verified by opening Storybook and confirming the sidebar shows exactly two top-level groups — Foundations and Components — each containing the expected items.

**Acceptance scenarios**:

1. **Given** Storybook is running, **when** a user opens the sidebar, **then** they see a "Foundations" group containing "Color" and a "Components" group containing "Button", "Typography", "Popover", "Icon", and "Menu".
2. **Given** a user navigates to any story, **when** they look at the breadcrumb, **then** it reflects the new category path (e.g., "Components / Button").
3. **Given** the prior "Internal review" category exists, **when** the reorganization is complete, **then** no stories remain under "Internal review".

---

### User Story 2 — Reading API Documentation in English (Priority: P1)

A developer integrating a component needs to know what props are available, what values are accepted, and what the defaults are. Currently no `argTypes` or prop-level descriptions exist in any story file — all descriptions are embedded at the component level in a gallery-review style. After this feature, every component story exposes its full public API with English descriptions, accepted values, and default values surfaced through Storybook's Controls and Docs panels.

**Why this priority**: API documentation is the primary reason a developer opens a component library's Storybook; without it the stories serve only the internal team.

**Independent testing**: Can be verified by opening any component's Docs page in Storybook and confirming each prop is listed with a description, type, and default value without needing to read source code.

**Acceptance scenarios**:

1. **Given** a developer opens the Docs page for Button, **when** they scroll to the Props table, **then** every public prop (`variant`, `color`, `size`, `shape`, `disabled`, `loading`, `iconStart`, `iconEnd`, `href`) has an English description, accepted value list, and default value.
2. **Given** a developer opens the Docs page for Menu, **when** they view the props table for `MenuItem`, **then** key props (`disabled`, `value`, `closeOnSelect`) are documented with descriptions and types.
3. **Given** a developer opens the Docs page for Popover, **when** they view the props table, **then** `trigger`, `content`, `open`, `defaultOpen`, `placement`, and `shape` are documented.
4. **Given** a developer opens Typography or Icon stories, **when** they view the Docs page, **then** all exported props have English descriptions.
5. **Given** all story descriptions are currently in mixed Chinese/English, **when** the update is complete, **then** all user-facing text in stories (titles, descriptions, argType labels, story names) is written in English.

---

### User Story 3 — Storybook Version Upgrade (Priority: P2)

The team wants to stay current with Storybook to benefit from bug fixes, performance improvements, and new features. After this feature, Storybook is upgraded to the latest stable version in the same major line (or next major if available), and all existing stories continue to work without regressions.

**Why this priority**: The upgrade is a maintainability improvement; it does not block usage of documentation or navigation, but it should ship together to avoid double-touching the config.

**Independent testing**: Can be verified by running Storybook after the upgrade and confirming all stories load, the Controls panel works, and the Docs page renders correctly.

**Acceptance scenarios**:

1. **Given** Storybook is currently at version 10.2.19, **when** the upgrade is applied, **then** all `@storybook/*` packages are updated to the latest compatible stable version.
2. **Given** the upgrade is applied, **when** Storybook is started, **then** no console errors or missing-dependency warnings appear for any story.
3. **Given** the upgrade is applied, **when** all 6 stories (Button, Typography, Popover, Icon, Menu, Color) are opened, **then** each renders correctly with no visual regressions.

---

### Edge Cases

- Stories that import internal types or cross-package aliases must continue to resolve correctly after the version upgrade.
- The `argTypes` additions must not break existing gallery-based stories that render custom layout components.
- Removing the "Internal review" title category must not break any deep-link URLs used in CI preview checks.
- The light/dark theme toggle in Storybook preview must continue to work after the upgrade.
- `IconButton` (exported alongside `Button`) must have its own props documented, not share the same argTypes table as `Button`.

## Requirements (Required)

### Functional Requirements

- **FR-001**: All component stories must be reorganized under a single "Components" top-level category: Button, Typography, Popover, Icon, Menu.
- **FR-002**: All design-token / color stories must be reorganized under a single "Foundations" top-level category: Color.
- **FR-003**: No story must remain under the "Internal review" category after the reorganization.
- **FR-004**: Every public prop of every component story must be documented in `argTypes` with: an English `description`, a `type` or `control` definition, and a `defaultValue` where applicable.
- **FR-005**: All user-facing text in story files — component descriptions, story names, argType labels, inline comments intended for readers — must be written in English.
- **FR-006**: Each story's `component` metadata field must reference the primary component so that Storybook's auto-docs prop table generates correctly.
- **FR-007**: `IconButton` must have its props documented separately from `Button` (either as a subcomponent or a dedicated story section).
- **FR-008**: All `@storybook/*` and `storybook` packages must be upgraded to the latest stable version available at upgrade time; the upgrade must be applied consistently across `apps/storybook/package.json` and the monorepo catalog.
- **FR-009**: After the upgrade, all existing story exports (galleries, screenshots, state matrices) must continue to render without errors or visual regressions.
- **FR-010**: The Storybook `docs.defaultName` configuration must be updated from the current Chinese string to an appropriate English label.

### Accessibility & UI Contract

- **Participants**: Component library consumers (external developers) reading Storybook as integration documentation; internal reviewers validating component states.
- **Interaction model**: Read-only Docs pages + interactive Controls panel (knobs).
- **States to cover per component**: default, hover, focus-visible, disabled, loading (Button), error (where applicable).
- **Token/theme impact**: No new design tokens introduced; existing `@deweyou-ui/styles/theme.css` import in preview must be verified post-upgrade.

### Key Entities

- **Story File**: A `*.stories.tsx` file that describes a component's API and states for Storybook.
- **argTypes**: Storybook metadata that maps component props to documentation fields (description, type, default, control).
- **Story Category**: The top-level path segment in the `title` field (e.g., `Components/Button` → category is `Components`).

## Success Criteria (Required)

### Measurable Outcomes

- **SC-001**: 100% of the 6 story files are assigned to either "Foundations" or "Components" — no story remains under "Internal review" or any other ad-hoc category.
- **SC-002**: Every component story documents all public props in its `argTypes`; a reviewer can identify accepted values and defaults without opening source code.
- **SC-003**: All user-facing text in story files is written in English — zero Chinese-language strings in `title`, `description`, story export names, or argType descriptions.
- **SC-004**: All `@storybook/*` packages share a single upgraded version; the monorepo catalog reflects the new version consistently.
- **SC-005**: All 6 stories load without console errors after the upgrade, verified by running Storybook locally.

## Assumptions

- The current Storybook version is 10.2.19; the upgrade target will be the latest stable version in the same major line unless a newer major is available and non-breaking.
- The gallery-style story layouts (custom React components rendering state matrices) are kept intact — this feature documents the API surface, it does not redesign the visual layout of stories.
- The `apps/website` public documentation site is out of scope; this feature only touches `apps/storybook`.
- Where a component does not expose a fully public API (e.g., internal icon primitives), only documented/exported props need `argTypes` entries.
- The monorepo uses a `catalog:` dependency pattern; the upgrade will update the catalog entry and any pinned version references together.
