# Tasks: Add Icon Package for UI Library

**Input**: Design documents from `/specs/004-icon-package/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/icon-package-contract.md, quickstart.md

**Tests**: Tests are REQUIRED by the constitution for package logic, accessibility semantics, and preview coverage. Every user story below includes automated verification tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks in the same phase
- **[Story]**: User story label for traceability (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new package shell and workspace wiring required for all stories.

- [x] T001 Create the `packages/icons` workspace package structure in `packages/icons/package.json`, `packages/icons/tsconfig.json`, `packages/icons/vite.config.ts`, `packages/icons/README.md`, and `packages/icons/src/index.ts`
- [x] T002 Update workspace dependency catalog and package wiring for `tdesign-icons-svg` in `pnpm-workspace.yaml` and `packages/icons/package.json`
- [x] T003 [P] Add package-level guidance and local constraints for icons in `packages/icons/AGENTS.md`
- [x] T004 [P] Add the new package to consumer entrypoints and workspace usage docs in `apps/storybook/package.json` and `apps/website/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared registry, prop types, and package contract all stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T005 Define shared icon types, standard sizes, and accessibility helpers in `packages/icons/src/icon/types.ts`
- [x] T006 [P] Implement the canonical icon registry shape and catalog metadata in `packages/icons/src/icon-registry/index.ts`
- [x] T007 [P] Implement `tdesign-icons-svg` asset normalization utilities in `packages/icons/src/icon-registry/normalize.ts`
- [x] T008 Implement the base `Icon` renderer contract and runtime unsupported-name guard in `packages/icons/src/icon/index.tsx`
- [x] T009 [P] Wire package exports and root entrypoints for `Icon`, `IconName`, `IconProps`, and `IconSize` in `packages/icons/src/index.ts`
- [x] T010 [P] Add foundational package tests for type-safe sizing and unsupported-name failures in `packages/icons/src/icon/index.test.tsx`

**Checkpoint**: Foundation ready. User stories can now proceed independently.

---

## Phase 3: User Story 1 - Consume a shared icon set (Priority: P1) 🎯 MVP

**Goal**: Deliver a curated foundational icon catalog that consumers can use through `Icon` and `XxxIcon` exports.

**Independent Test**: Import `@deweyou-ui/icons` into a sample consumer, render several supported names through both `Icon` and named exports, and confirm they resolve to the same visuals without importing upstream assets directly.

### Tests for User Story 1 (REQUIRED) ⚠️

- [x] T011 [P] [US1] Add catalog uniqueness and export-alignment tests in `packages/icons/src/icon-registry/index.test.ts`
- [x] T012 [P] [US1] Add rendering tests for standard sizes, numeric sizing, and named export parity in `packages/icons/src/foundation-icons/index.test.tsx`

### Implementation for User Story 1

- [x] T013 [P] [US1] Populate the foundational catalog entries and source mappings in `packages/icons/src/icon-registry/foundation-catalog.ts`
- [x] T014 [P] [US1] Implement the foundational named icon exports in `packages/icons/src/foundation-icons/index.tsx`
- [x] T015 [US1] Integrate the foundational catalog with the base renderer in `packages/icons/src/icon/index.tsx`
- [x] T016 [US1] Finalize the public package surface for foundational icons in `packages/icons/src/index.ts`
- [x] T017 [US1] Document package installation, exports, and `XxxIcon` naming rules in `packages/icons/README.md`

**Checkpoint**: User Story 1 should now provide a usable icon package MVP.

---

## Phase 4: User Story 2 - Discover available icons quickly (Priority: P2)

**Goal**: Make the supported icon catalog easy to browse in Storybook and easy to understand in website docs.

**Independent Test**: Open the Storybook icon stories and website docs page, locate a target icon by name, and confirm usage guidance is visible without inspecting source files.

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T018 [P] [US2] Add Storybook-facing catalog coverage tests in `packages/icons/src/icon-registry/storybook-catalog.test.ts`
- [x] T019 [P] [US2] Add website-doc example coverage tests in `packages/icons/src/foundation-icons/docs-examples.test.tsx`

### Implementation for User Story 2

- [x] T020 [P] [US2] Add Storybook catalog and usage stories in `apps/storybook/src/stories/Icon.stories.tsx`
- [x] T021 [US2] Add official icon package usage guidance and curated examples in `apps/website/src/pages/icons.tsx`
- [x] T022 [P] [US2] Update website routing or entry wiring for the new icon docs surface in `apps/website/src/main.tsx`
- [x] T023 [US2] Add website styling for icon catalog and usage examples in `apps/website/src/style.css`

**Checkpoint**: User Story 2 should now provide complete discovery and usage guidance without blocking US1 consumption.

---

## Phase 5: User Story 3 - Handle accessibility and missing-icon cases safely (Priority: P3)

**Goal**: Enforce the `label`-driven accessibility contract and explicit failure behavior for unsupported names.

**Independent Test**: Render labeled and unlabeled icons, verify accessibility semantics, and confirm unsupported generic icon requests fail with a clear error.

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T024 [P] [US3] Add accessibility semantics tests for labeled and unlabeled icons in `packages/icons/src/icon/a11y.test.tsx`
- [x] T025 [P] [US3] Add unsupported-name and error-state preview tests in `packages/icons/src/icon/failure-states.test.tsx`

### Implementation for User Story 3

- [x] T026 [P] [US3] Refine `label`-driven semantics and ARIA behavior in `packages/icons/src/icon/index.tsx`
- [x] T027 [P] [US3] Add contributor-facing accessibility and replacement guidance metadata in `packages/icons/src/icon-registry/foundation-catalog.ts`
- [x] T028 [US3] Add Storybook coverage for unlabeled, labeled, and unsupported-name states in `apps/storybook/src/stories/Icon.stories.tsx`
- [x] T029 [US3] Document accessibility expectations, unsupported-name behavior, and source attribution in `packages/icons/README.md` and `apps/website/src/pages/icons.tsx`

**Checkpoint**: User Story 3 should now make accessibility and failure behavior explicit and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, cross-story verification, and release-readiness updates.

- [x] T030 [P] Add cross-package consumer coverage for icon usage from the components layer in `packages/components/tests/workspace-boundaries.test.ts`
- [x] T031 [P] Clean up icon package copy, semver notes, and migration wording in `specs/004-icon-package/quickstart.md` and `packages/icons/README.md`
- [x] T032 Run workspace validation commands `vp check`, `vp test`, `vp run storybook#build`, and `vp run website#build` from `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2 only
- **Phase 4 (US2)**: Depends on Phase 2 and can proceed after US1 package exports exist
- **Phase 5 (US3)**: Depends on Phase 2 and should be completed before final polish
- **Phase 6 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories; this is the MVP
- **US2 (P2)**: Depends on the catalog and exports from US1 but remains independently testable once the package exists
- **US3 (P3)**: Depends on the base renderer from US1 but remains independently testable through package tests and Storybook failure-state coverage

### Within Each User Story

- Tests should be written before implementation and should fail before code changes land
- Registry and type changes should land before higher-level consumer examples
- Package implementation should land before Storybook and website integration
- Documentation updates should follow the behavior they describe

### Parallel Opportunities

- **Setup**: T003 and T004 can run in parallel after T001/T002
- **Foundational**: T006, T007, T009, and T010 can run in parallel after T005
- **US1**: T011/T012 can run together; T013 and T014 can run in parallel before T015/T016
- **US2**: T018/T019 can run together; T020 and T022 can run in parallel before T021/T023
- **US3**: T024/T025 can run together; T026 and T027 can run in parallel before T028/T029
- **Polish**: T030 and T031 can run in parallel before T032

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together
Task: "Add catalog uniqueness and export-alignment tests in packages/icons/src/icon-registry/index.test.ts"
Task: "Add rendering tests for standard sizes, numeric sizing, and named export parity in packages/icons/src/foundation-icons/index.test.tsx"

# Launch US1 implementation tasks that touch different files
Task: "Populate the foundational catalog entries and source mappings in packages/icons/src/icon-registry/foundation-catalog.ts"
Task: "Implement the foundational named icon exports in packages/icons/src/foundation-icons/index.tsx"
```

## Parallel Example: User Story 2

```bash
# Build the review surfaces in parallel
Task: "Add Storybook catalog and usage stories in apps/storybook/src/stories/Icon.stories.tsx"
Task: "Update website routing or entry wiring for the new icon docs surface in apps/website/src/main.tsx"
```

## Parallel Example: User Story 3

```bash
# Cover accessibility and failure semantics together
Task: "Add accessibility semantics tests for labeled and unlabeled icons in packages/icons/src/icon/a11y.test.tsx"
Task: "Add unsupported-name and error-state preview tests in packages/icons/src/icon/failure-states.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the package through package tests and a local consumer example
5. Stop and review the public API before expanding docs and edge-state coverage

### Incremental Delivery

1. Ship the package shell and registry foundation
2. Deliver US1 as the first usable icon package
3. Add US2 discovery surfaces in Storybook and website
4. Add US3 accessibility and failure-state hardening
5. Run final workspace validation and polish docs

### Parallel Team Strategy

1. One engineer handles package shell and registry foundation
2. One engineer prepares Storybook and website surfaces once US1 exports stabilize
3. One engineer hardens accessibility and failure semantics once the base renderer exists

---

## Notes

- All tasks use `vp` workflows only
- Every story includes automated coverage plus reviewer-visible preview changes
- `packages/icons` is the only owner of icon registry logic and public icon exports
- `apps/storybook` is the internal review surface; `apps/website` holds official guidance
