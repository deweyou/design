# Tasks: Repository Conventions Standardization

**Input**: Design documents from `/specs/002-repo-conventions/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/repository-governance.md`, `quickstart.md`

**Tests**: Tests are required for this feature because the constitution requires automated verification and preview-safe governance changes.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the repository governance surfaces that all later enforcement work depends on.

- [x] T001 Update repository-wide contributor guidance in `AGENTS.md`
- [x] T002 [P] Align component package guidance in `packages/components/AGENTS.md`
- [x] T003 [P] Align hook package guidance in `packages/hooks/AGENTS.md`
- [x] T004 [P] Align util package guidance in `packages/utils/AGENTS.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Make the test and check pipeline capable of validating colocated governance rules before story work begins.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T005 [P] Expand component test discovery to include colocated tests in `packages/components/vite.config.ts`
- [x] T006 [P] Expand hook test discovery to include colocated tests in `packages/hooks/vite.config.ts`
- [x] T007 [P] Expand util test discovery to include colocated tests in `packages/utils/vite.config.ts`
- [x] T008 [P] Create repository convention regression coverage in `packages/utils/tests/repo-conventions.test.ts`
- [x] T009 Extend structure-boundary coverage for governed paths in `packages/utils/tests/repo-structure.test.ts`

**Checkpoint**: Repository checks can now detect convention regressions and discover colocated tests.

---

## Phase 3: User Story 1 - Enforce Shared Authoring Rules (Priority: P1) 🎯 MVP

**Goal**: Make the preferred function style, component authoring format, and naming pattern visible to contributors and mechanically enforced where practical.

**Independent Test**: A contributor can read the repository guidance, see lint-backed authoring restrictions, and verify that the main website example no longer demonstrates `React.createElement` or non-TSX component authoring.

### Tests for User Story 1 (REQUIRED) ⚠️

- [x] T010 [P] [US1] Add failing authoring-rule assertions for guidance and example code in `packages/utils/tests/repo-conventions.test.ts`
- [x] T011 [P] [US1] Add failing lint restrictions for disallowed component authoring in `vite.config.ts`

### Implementation for User Story 1

- [x] T012 [US1] Refine repository authoring, naming, and exception rules in `AGENTS.md`
- [x] T013 [P] [US1] Refine component authoring constraints in `packages/components/AGENTS.md`
- [x] T014 [P] [US1] Refine hook authoring constraints in `packages/hooks/AGENTS.md`
- [x] T015 [P] [US1] Refine util naming and governance constraints in `packages/utils/AGENTS.md`
- [x] T016 [US1] Configure repository lint enforcement for governed authoring rules in `vite.config.ts`
- [x] T017 [US1] Rename and rewrite the website entry from `apps/website/src/main.ts` to `apps/website/src/main.tsx`

**Checkpoint**: User Story 1 is complete when guidance, lint, and the visible website example all reinforce the same authoring rules.

---

## Phase 4: User Story 2 - Standardize Shared Source Layout (Priority: P2)

**Goal**: Introduce the governed `src/<unit>/index` layout for existing shared source units without losing package export clarity.

**Independent Test**: A maintainer can inspect the shared packages and find the hook and component implementations inside dedicated `src/<unit>/` directories, with exports still resolving through package entrypoints.

### Tests for User Story 2 (REQUIRED) ⚠️

- [x] T018 [P] [US2] Add failing governed-source-unit layout assertions in `packages/utils/tests/repo-structure.test.ts`
- [x] T019 [P] [US2] Add failing export-stability coverage for hook relocation in `packages/hooks/tests/index.test.ts`

### Implementation for User Story 2

- [x] T020 [US2] Move the theme hook implementation into `packages/hooks/src/use-theme-mode/index.ts` and re-export it from `packages/hooks/src/index.ts`
- [x] T021 [P] [US2] Move the button contract test from `packages/components/tests/index.test.ts` to `packages/components/src/button/index.test.ts`
- [x] T022 [US2] Update structure-specific package guidance in `packages/components/AGENTS.md` and `packages/hooks/AGENTS.md`
- [x] T023 [US2] Document incremental layout adoption and import-surface guardrails in `AGENTS.md`

**Checkpoint**: User Story 2 is complete when governed source units use dedicated directories and package entrypoints still present an unambiguous public surface.

---

## Phase 5: User Story 3 - Co-locate Tests With Source Units (Priority: P3)

**Goal**: Move unit tests beside their governed source units and limit top-level `tests/` directories to cross-cutting coverage only.

**Independent Test**: A reviewer can open a governed hook or component directory and find its entry file and unit test together, while any remaining top-level tests are clearly cross-cutting rather than unit-level duplicates.

### Tests for User Story 3 (REQUIRED) ⚠️

- [x] T024 [P] [US3] Add failing colocated-test policy assertions in `packages/utils/tests/repo-conventions.test.ts`
- [x] T025 [P] [US3] Add failing legacy-test-directory guard coverage in `packages/utils/tests/repo-structure.test.ts`

### Implementation for User Story 3

- [x] T026 [US3] Move the hook unit test from `packages/hooks/tests/index.test.ts` to `packages/hooks/src/use-theme-mode/index.test.ts`
- [x] T027 [US3] Remove the superseded package-level component unit test file `packages/components/tests/index.test.ts` after migrating its coverage to `packages/components/src/button/index.test.ts`
- [x] T028 [US3] Narrow `packages/components/tests/workspace-boundaries.test.ts` to cross-package boundary coverage only and document that exception in `packages/components/AGENTS.md`
- [x] T029 [US3] Document the top-level test-directory exception policy for cross-cutting checks in `AGENTS.md` and `packages/utils/AGENTS.md`

**Checkpoint**: User Story 3 is complete when governed unit tests are colocated and any remaining top-level test directories are clearly reserved for non-unit coverage.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation cleanup across all stories.

- [x] T030 [P] Update repository usage guidance to reflect the new conventions in `README.md`
- [x] T031 Run validation with `vp check`
- [x] T032 Run validation with `vp test`
- [x] T033 Run preview-safe verification with `vp run website#build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all story work.
- **Phase 3 (US1)**: Depends on Phase 2; recommended MVP starting point.
- **Phase 4 (US2)**: Depends on Phase 2; can start after US1 or in parallel once governance scaffolding is stable.
- **Phase 5 (US3)**: Depends on Phase 4 because test colocation relies on the source-unit directories introduced there.
- **Phase 6 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1**: No dependency on other stories after Foundational.
- **US2**: No functional dependency on US1, but benefits from the guidance and lint decisions completed in US1.
- **US3**: Depends on US2 because colocated test moves should target the standardized `src/<unit>/` layout.

### Within Each User Story

- Tests must be added first and should fail before implementation changes.
- Governance files and automation should land before example or migration cleanup that relies on them.
- Export-surface preservation must be verified before removing legacy file locations.

### Parallel Opportunities

- `T002`, `T003`, and `T004` can run in parallel after `T001`.
- `T005`, `T006`, `T007`, and `T008` can run in parallel in Phase 2.
- `T013`, `T014`, and `T015` can run in parallel in US1.
- `T018` and `T019` can run in parallel in US2.
- `T024` and `T025` can run in parallel in US3.
- `T031`, `T032`, and `T033` should run after implementation is complete and can be distributed if infrastructure allows.

---

## Parallel Example: User Story 1

```text
Task: T013 [US1] Refine component authoring constraints in packages/components/AGENTS.md
Task: T014 [US1] Refine hook authoring constraints in packages/hooks/AGENTS.md
Task: T015 [US1] Refine util naming and governance constraints in packages/utils/AGENTS.md
```

## Parallel Example: User Story 2

```text
Task: T018 [US2] Add failing governed-source-unit layout assertions in packages/utils/tests/repo-structure.test.ts
Task: T019 [US2] Add failing export-stability coverage for hook relocation in packages/hooks/tests/index.test.ts
```

## Parallel Example: User Story 3

```text
Task: T024 [US3] Add failing colocated-test policy assertions in packages/utils/tests/repo-conventions.test.ts
Task: T025 [US3] Add failing legacy-test-directory guard coverage in packages/utils/tests/repo-structure.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1).
4. Validate with `vp check`, `vp test`, and `vp run website#build`.
5. Stop if the immediate goal is to codify authoring rules before structural migration.

### Incremental Delivery

1. Land governance guidance and discovery infrastructure.
2. Deliver US1 to establish visible and automated authoring rules.
3. Deliver US2 to move existing shared source units into the standardized layout.
4. Deliver US3 to colocate unit tests and narrow remaining top-level tests to cross-cutting coverage.
5. Finish with validation and documentation cleanup.

### Parallel Team Strategy

1. One contributor handles root governance in `AGENTS.md` while others align package guidance files.
2. After Foundational is complete, one contributor can handle website example cleanup while another prepares hook relocation.
3. After source-unit moves land, test colocation and documentation cleanup can proceed in parallel.

---

## Notes

- All tasks follow the required checklist format with task IDs and exact file paths.
- Story phases are organized to keep each user story independently testable.
- `packages/utils/tests/repo-conventions.test.ts` is used as the repository-level governance regression harness.
- Remaining top-level `tests/` directories are allowed only for cross-cutting coverage after US3.
- Use `vp` commands only for validation and workspace workflows.
