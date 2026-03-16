# Tasks: UI Monorepo Foundation

**Input**: Design documents from `/specs/001-ui-monorepo-foundation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED by the constitution for component logic and user-visible behavior. This task list includes package-level tests plus preview validation work.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact repository-relative file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the repository for the new monorepo layout and package baseline.

- [x] T001 Update workspace package globs and root task entrypoints in pnpm-workspace.yaml and package.json
- [x] T002 [P] Replace starter repository guidance with monorepo foundation guidance in README.md
- [x] T003 [P] Create package and app directory scaffolds with starter package manifests and TypeScript configs in apps/website/package.json, apps/storybook/package.json, packages/hooks/package.json, packages/styles/package.json, and packages/components/package.json
- [x] T004 [P] Align root environment metadata with the new monorepo baseline in .nvmrc and AGENTS.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared package and style infrastructure that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define package boundary documentation and package-level README baselines in packages/utils/README.md, packages/hooks/README.md, packages/styles/README.md, and packages/components/README.md
- [x] T006 [P] Update root and package Vite+ configs for the new packages and apps in vite.config.ts, packages/utils/vite.config.ts, packages/hooks/vite.config.ts, packages/styles/vite.config.ts, and packages/components/vite.config.ts
- [x] T007 [P] Establish baseline TypeScript config structure for the new packages and apps in tsconfig.json, apps/website/tsconfig.json, apps/storybook/tsconfig.json, packages/hooks/tsconfig.json, packages/styles/tsconfig.json, and packages/components/tsconfig.json
- [x] T008 Create baseline package exports and dependency direction for reusable foundations in packages/utils/package.json, packages/hooks/package.json, packages/styles/package.json, and packages/components/package.json
- [x] T009 [P] Add baseline automated validation coverage for the new package scaffolds in packages/hooks/tests/index.test.ts, packages/styles/tests/index.test.ts, and packages/components/tests/index.test.ts
- [x] T010 [P] Define website and Storybook app shell entrypoints that consume packages instead of owning reusable logic in apps/website/src/main.ts and apps/storybook/.storybook/main.ts
- [x] T011 Run and document shared validation commands for the foundation baseline in specs/001-ui-monorepo-foundation/quickstart.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Establish Package Boundaries (Priority: P1) 🎯 MVP

**Goal**: Make the repository structure and package responsibilities unambiguous so future work has a stable home.

**Independent Test**: Review the repo after implementation and verify each concern maps to one package or app with no duplicated ownership and with documented dependency direction.

### Tests for User Story 1 (REQUIRED) ⚠️

- [x] T012 [P] [US1] Add a package boundary verification test for expected workspace packages in packages/components/tests/workspace-boundaries.test.ts
- [x] T013 [P] [US1] Add a repository structure smoke test for app and package presence in packages/utils/tests/repo-structure.test.ts

### Implementation for User Story 1

- [x] T014 [P] [US1] Move the current website app into the apps layout and update its package metadata in apps/website/package.json and apps/website/index.html
- [x] T015 [P] [US1] Move the current website source and public assets into the app layout at apps/website/src/main.ts, apps/website/src/style.css, and apps/website/public/icons.svg
- [x] T016 [P] [US1] Create the reusable hooks package baseline in packages/hooks/src/index.ts and packages/hooks/tests/index.test.ts
- [x] T017 [P] [US1] Create the reusable components package baseline in packages/components/src/index.ts and packages/components/tests/index.test.ts
- [x] T018 [P] [US1] Normalize the utilities package to framework-agnostic scope in packages/utils/src/index.ts and packages/utils/tests/index.test.ts
- [x] T019 [US1] Document package and app responsibilities plus dependency direction in README.md and apps/website/src/main.ts

**Checkpoint**: User Story 1 is complete when the repo clearly separates reusable packages from runnable apps and that boundary is documented and testable.

---

## Phase 4: User Story 2 - Establish a Controlled Theme System (Priority: P2)

**Goal**: Provide a stable default design language with explicit global style imports, public color theme tokens, and light/dark theme outputs.

**Independent Test**: Import the documented styles entrypoint, render a component preview, switch light/dark theme modes, and verify approved brand color overrides work without changing layout or undocumented internals.

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T020 [P] [US2] Add token and theme output tests in packages/styles/tests/theme-outputs.test.ts
- [x] T021 [P] [US2] Add consumer setup verification for explicit global style import in packages/styles/tests/consumer-import.test.ts

### Implementation for User Story 2

- [x] T022 [P] [US2] Create TypeScript token source files for internal and public theme tokens in packages/styles/src/primitives/index.ts, packages/styles/src/semantics/index.ts, and packages/styles/src/themes/index.ts
- [x] T023 [P] [US2] Create style generation utilities and package exports in packages/styles/src/index.ts and packages/styles/tsdown.config.ts
- [x] T024 [P] [US2] Add global style entrypoints and theme outputs in packages/styles/src/css/reset.css, packages/styles/src/css/base.css, packages/styles/src/css/theme.css, packages/styles/src/css/theme-light.css, and packages/styles/src/css/theme-dark.css
- [x] T025 [P] [US2] Add the Less bridge and mixin entrypoints for component authors in packages/styles/src/less/bridge.less and packages/styles/src/less/mixins.less
- [x] T026 [US2] Define the documented public theme surface and explicit consumer import guidance in packages/styles/README.md and apps/website/src/main.ts
- [x] T027 [US2] Wire the components package to consume styles explicitly and expose a root customization contract in packages/components/src/index.ts and packages/components/package.json

**Checkpoint**: User Story 2 is complete when consumers have a documented styles entrypoint, a small public color theme surface, and working light/dark outputs.

---

## Phase 5: User Story 3 - Separate Public Documentation from Internal Development Tooling (Priority: P3)

**Goal**: Make `apps/website` the public documentation and curated demo surface while `apps/storybook` becomes the internal state-review tool.

**Independent Test**: Review both apps and confirm the website contains official setup/theme guidance and curated demos, while Storybook contains development-focused stories without duplicating full public documentation.

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T028 [P] [US3] Add a website documentation smoke test for installation and theming sections in apps/website/tests/docs-smoke.test.ts
- [x] T029 [P] [US3] Add a Storybook scope smoke test for internal review stories in apps/storybook/tests/story-scope.test.ts

### Implementation for User Story 3

- [x] T030 [P] [US3] Build the public documentation structure and curated demo content in apps/website/src/main.ts and apps/website/src/style.css
- [x] T031 [P] [US3] Add theme switching and curated preview coverage to the website app in apps/website/src/main.ts and apps/website/src/counter.ts
- [x] T032 [P] [US3] Create the internal Storybook configuration and starter stories in apps/storybook/.storybook/main.ts, apps/storybook/.storybook/preview.ts, and apps/storybook/src/stories/Button.stories.tsx
- [x] T033 [US3] Document the responsibility split between website and Storybook in README.md and apps/storybook/README.md

**Checkpoint**: User Story 3 is complete when public guidance lives in the website and Storybook remains focused on internal review and validation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, migration cleanup, and validation across all stories

- [x] T034 [P] Remove obsolete root website files and starter assets replaced by the apps layout in website/package.json, website/src/main.ts, and website/src/style.css
- [x] T035 [P] Align package metadata, scripts, and release-facing docs across all affected packages in packages/utils/package.json, packages/hooks/package.json, packages/styles/package.json, and packages/components/package.json
- [x] T036 Run full monorepo validation with `vp check`, `vp test`, and relevant `vp run` app commands and record any follow-up notes in specs/001-ui-monorepo-foundation/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion and benefits from User Story 1 package structure
- **User Story 3 (Phase 5)**: Depends on Foundational completion and uses outputs from User Story 1 and User Story 2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational - should layer on the package structure delivered by US1
- **User Story 3 (P3)**: Can start after Foundational - uses the package and theme foundations from US1 and US2 for final app surfaces

### Within Each User Story

- Tests should be created before implementation and must fail before the implementation is considered complete
- Package manifests and exports should land before higher-level app integration
- Theme foundations should land before component and website theme consumption
- App content should be added before final responsibility documentation

### Parallel Opportunities

- T002, T003, and T004 can run in parallel during Setup
- T006, T007, T009, and T010 can run in parallel during Foundational work
- In US1, T014 through T018 can run in parallel after boundary tests are in place
- In US2, T022 through T025 can run in parallel before documentation and package integration
- In US3, T030 through T032 can run in parallel before responsibility documentation

---

## Parallel Example: User Story 2

```bash
# Launch User Story 2 test work together:
Task: "Add token and theme output tests in packages/styles/tests/theme-outputs.test.ts"
Task: "Add consumer setup verification for explicit global style import in packages/styles/tests/consumer-import.test.ts"

# Launch User Story 2 implementation work together:
Task: "Create TypeScript token source files in packages/styles/src/primitives/index.ts, packages/styles/src/semantics/index.ts, and packages/styles/src/themes/index.ts"
Task: "Add global style entrypoints and theme outputs in packages/styles/src/css/reset.css, base.css, theme.css, theme-light.css, and theme-dark.css"
Task: "Add the Less bridge and mixin entrypoints in packages/styles/src/less/bridge.less and packages/styles/src/less/mixins.less"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate repository boundaries, package ownership, and dependency direction
5. Stop if needed and begin component work on a stable monorepo foundation

### Incremental Delivery

1. Deliver package and app boundaries first
2. Add controlled theme and styles infrastructure second
3. Add website and Storybook responsibility split third
4. Finish with cleanup, validation, and obsolete file removal

### Parallel Team Strategy

With multiple developers:

1. One developer handles workspace and package manifests
2. One developer handles style system and theme outputs
3. One developer handles website and Storybook app surfaces after the shared foundations land

---

## Notes

- All tasks follow the required checklist format with exact repository-relative file paths
- `vp` commands remain the only allowed workflow commands for validation
- Website preview work is required for user-visible foundations
- Storybook is treated as an internal app surface, not the primary public documentation system
