# Tasks: Upgrade Storybook to Latest

**Input**: Design documents from `/specs/003-upgrade-storybook/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by the constitution for workflow regressions, preview behavior, and Storybook compatibility checks. Each user story includes automated coverage where the change can regress contributor-visible behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Workspace metadata: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`
- Storybook app: `apps/storybook/.storybook/`, `apps/storybook/src/stories/`
- Feature docs: `specs/003-upgrade-storybook/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture the current Storybook surface and establish the upgrade execution baseline.

- [x] T001 Inventory current Storybook package ownership and version skew in `pnpm-workspace.yaml`, `apps/storybook/package.json`, and `pnpm-lock.yaml`
- [x] T002 [P] Capture current Storybook configuration and story usage patterns in `apps/storybook/.storybook/main.ts`, `apps/storybook/.storybook/preview.ts`, and `apps/storybook/src/stories/Button.stories.tsx`
- [x] T003 [P] Capture current validation and maintainer workflow expectations in `package.json`, `apps/storybook/README.md`, and `specs/003-upgrade-storybook/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Align workspace-wide Storybook dependencies and the app shell before story-specific migration work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Update the shared Storybook target release line and catalog entries in `pnpm-workspace.yaml`
- [x] T005 [P] Align Storybook app dependency consumption and scripts with the target release in `apps/storybook/package.json`
- [x] T006 [P] Refresh workspace lockfile state for the upgraded Storybook dependency graph in `pnpm-lock.yaml`
- [x] T007 Migrate the Storybook app shell and framework configuration for the target release in `apps/storybook/.storybook/main.ts` and `apps/storybook/.storybook/preview.ts`
- [x] T008 [P] Update repository-level maintainer workflow references if Storybook commands or expectations change in `package.json`, `README.md`, and `apps/storybook/README.md`

**Checkpoint**: Dependency alignment and base configuration are ready for story-level migration and validation.

---

## Phase 3: User Story 1 - Stabilize the preview baseline (Priority: P1) 🎯 MVP

**Goal**: Upgrade the internal Storybook app to the latest stable line and make sure it can build and run without version-mismatch failures.

**Independent Test**: Run `vp install`, `vp check`, `vp test`, `vp run storybook#build`, and `vp run storybook#dev`; then confirm the Storybook app starts and the main internal review story group loads.

### Implementation for User Story 1

- [x] T011 [US1] Resolve remaining Storybook 9/10 package, addon, and framework migration changes in `pnpm-workspace.yaml` and `apps/storybook/package.json`
- [x] T012 [P] [US1] Implement any required upgraded config shape and preview parameter changes in `apps/storybook/.storybook/main.ts` and `apps/storybook/.storybook/preview.ts`
- [x] T013 [US1] Update Storybook-specific build or startup expectations for the internal review app in `apps/storybook/README.md` and `specs/003-upgrade-storybook/quickstart.md`

**Checkpoint**: User Story 1 is complete when the upgraded Storybook app can build and run as the internal review baseline.

---

## Phase 4: User Story 2 - Preserve contributor workflow (Priority: P2)

**Goal**: Keep existing stories, docs, and interactive controls working so component contributors do not have to debug preview regressions before building components.

**Independent Test**: Open the upgraded Storybook app, load the representative button story in canvas and docs views, and confirm controls, autodocs, backgrounds, and shared theme styling still work.

### Implementation for User Story 2

- [x] T016 [US2] Migrate representative story definitions and any deprecated story metadata in `apps/storybook/src/stories/Button.stories.tsx`
- [x] T017 [P] [US2] Adjust preview-level parameters and docs behavior to preserve contributor workflow in `apps/storybook/.storybook/preview.ts`
- [x] T018 [US2] Update Storybook scope and contributor guidance for story authoring after the upgrade in `apps/storybook/AGENTS.md` and `apps/storybook/README.md`

**Checkpoint**: User Story 2 is complete when representative stories, docs, controls, and theme-backed preview behavior remain usable after the upgrade.

---

## Phase 5: User Story 3 - Make upgrade impact explicit (Priority: P3)

**Goal**: Document the migration scope, resolved breakages, and any remaining follow-up so future component work starts from a clear Storybook baseline.

**Independent Test**: Review the migration notes and confirm a maintainer can identify what changed, how to run Storybook, and what follow-up items remain without consulting external context.

### Implementation for User Story 3

- [x] T020 [US3] Record upgrade notes, resolved migration items, and deferred follow-ups in `specs/003-upgrade-storybook/research.md` and `specs/003-upgrade-storybook/quickstart.md`
- [x] T021 [P] [US3] Update maintainer-facing Storybook usage and migration guidance in `README.md` and `apps/storybook/README.md`
- [x] T022 [US3] Refresh the feature plan artifacts to reflect the implemented Storybook baseline in `specs/003-upgrade-storybook/plan.md` and `specs/003-upgrade-storybook/contracts/storybook-preview-contract.md`

**Checkpoint**: User Story 3 is complete when the upgrade scope and contributor-facing impact are documented clearly enough for subsequent component work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and end-to-end confirmation that Storybook actually runs after the upgrade.

- [x] T023 [P] Run the full workspace validation for the upgraded Storybook baseline and record outcomes in `specs/003-upgrade-storybook/quickstart.md`
- [x] T024 Start the upgraded Storybook dev server, manually verify run-time behavior, and capture the final run checklist in `apps/storybook/README.md` and `specs/003-upgrade-storybook/quickstart.md`
- [x] T025 [P] Clean up obsolete migration notes, stale package references, and temporary compatibility comments in `pnpm-workspace.yaml`, `apps/storybook/.storybook/main.ts`, `apps/storybook/.storybook/preview.ts`, and `apps/storybook/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all story work.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on User Story 1 having a running Storybook baseline.
- **User Story 3 (Phase 5)**: Depends on User Story 1 and User Story 2 so the documentation reflects actual migration outcomes.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: First deliverable and MVP. No dependency on later stories.
- **User Story 2 (P2)**: Builds on the upgraded baseline from US1.
- **User Story 3 (P3)**: Documents the outcome of US1 and US2.

### Within Each User Story

- Tests should be written or updated before implementation changes and should fail until the migration work is complete.
- Dependency and config alignment comes before story content adjustments.
- Story content and preview behavior are updated before maintainer documentation is finalized.
- Final run-time validation happens only after all upgrade changes are in place.

### Parallel Opportunities

- `T002` and `T003` can run in parallel during setup.
- `T005`, `T006`, and `T008` can run in parallel once the target release line is chosen.
- `T021` and `T022` can run in parallel for US3 documentation updates.
- `T023` and `T025` can run in parallel during final cleanup if the run-time check in `T024` is handled separately.

---

## Parallel Example: User Story 1

```bash
# Launch US1 implementation tasks that touch separate files:
Task: "Resolve package migration changes in pnpm-workspace.yaml and apps/storybook/package.json"
Task: "Implement upgraded config shape in apps/storybook/.storybook/main.ts and apps/storybook/.storybook/preview.ts"
```

## Parallel Example: User Story 2

```bash
# Launch US2 implementation tasks on separate files:
Task: "Migrate representative stories in apps/storybook/src/stories/Button.stories.tsx"
Task: "Adjust preview parameters in apps/storybook/.storybook/preview.ts"
```

## Parallel Example: User Story 3

```bash
# Launch US3 documentation updates together:
Task: "Update maintainer-facing Storybook usage in README.md and apps/storybook/README.md"
Task: "Refresh feature plan artifacts in specs/003-upgrade-storybook/plan.md and specs/003-upgrade-storybook/contracts/storybook-preview-contract.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate that `vp run storybook#build` and `vp run storybook#dev` both succeed.

### Incremental Delivery

1. Finish Setup and Foundational to establish the upgrade baseline.
2. Deliver User Story 1 to get Storybook building and running on the latest stable line.
3. Deliver User Story 2 to preserve story, docs, controls, and theme workflow.
4. Deliver User Story 3 to lock in migration notes and maintainer guidance.
5. Finish with Phase 6 validation and cleanup.

### Parallel Team Strategy

1. One contributor aligns root and app dependencies while another prepares config and regression tests.
2. After US1 is stable, one contributor can migrate stories and preview behavior while another updates maintainer docs.
3. Final validation should be done by a single owner to confirm the upgraded Storybook app actually runs end to end.

---

## Notes

- All tasks follow the required checklist format with IDs, optional `[P]`, story labels where applicable, and explicit file paths.
- User Story 1 is the recommended MVP because it establishes the upgraded, runnable Storybook baseline.
- User Story 2 and User Story 3 are intentionally sequenced after US1 because they depend on the new Storybook baseline being real, not theoretical.
- Use `vp` commands only for install, validation, build, and dev workflows.
