# Number Input Implementation Plan

**Goal:** Deliver the approved Ark UI-backed `NumberInput` as a complete public component across code, tests, Storybook, website, docs, exports, and MCP context.

**Execution mode:** Inline fallback. The required Superpowers skills and subagent-driven-development are unavailable in this environment; follow the same spec-first, TDD, task-by-task, and verification gates directly.

---

### Task 1: Add failing component behavior tests

**Files:**

- Create: `packages/react/src/number-input/index.test.tsx`

- [ ] Cover spinbutton and field ARIA wiring.
- [ ] Cover increment/decrement and Arrow Up/Down.
- [ ] Cover controlled and uncontrolled value callbacks.
- [ ] Cover min/max trigger state, disabled, read-only, error, and required state.
- [ ] Cover precision/format option merging and commit/invalid callbacks.
- [ ] Run the focused test and confirm it fails because the component is absent.

### Task 2: Implement NumberInput

**Files:**

- Create: `packages/react/src/number-input/index.tsx`
- Create: `packages/react/src/number-input/index.module.less`

- [ ] Compose Ark UI Number Input with the repository `Field` contract.
- [ ] Implement the Deweyou-owned public prop and callback types.
- [ ] Render connected decrement, input, and increment controls with library icons.
- [ ] Apply semantic tokens for size, state, focus, error, disabled, read-only, coarse-pointer, and reduced-motion behavior.
- [ ] Run the focused tests until green.

### Task 3: Publish the API and contracts

**Files:**

- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/package.json`
- Modify: `packages/react/tests/package-entrypoint.test.ts`
- Modify: `packages/react/tests/subpath-entrypoint.test.ts`
- Modify: `packages/react/tests/workspace-boundaries.test.ts`
- Modify: `packages/react/tests/component-docs-contract.test.ts`

- [ ] Add root and `./number-input` exports.
- [ ] Extend package, subpath, workspace, and documentation contract coverage.
- [ ] Run the focused contract tests.

### Task 4: Add Storybook Interaction coverage

**Files:**

- Create: `apps/storybook/src/stories/NumberInput.stories.tsx`

- [ ] Add default, sizes/variants, formatting, and state stories.
- [ ] Add an `Interaction` story covering typing, buttons, keyboard, boundaries, error, and disabled behavior.
- [ ] Keep examples container-relative for narrow viewport review.

### Task 5: Update website, docs, and MCP context

**Files:**

- Modify: `README.md`
- Modify: `README_ZH.md`
- Modify: `docs/design/components.md`
- Modify: `apps/website/src/data/component-catalog.tsx`
- Modify: `apps/website/src/data/component-catalog.test.tsx`
- Modify: `packages/mcp/src/catalog/index.ts`
- Modify: relevant MCP catalog tests
- Regenerate: `apps/website/public/llms.txt`

- [ ] Add synchronized import and behavior documentation.
- [ ] Add website and MCP catalog entries with the Storybook route.
- [ ] Regenerate and verify canonical LLM context.

### Task 6: Verify rendered and repository behavior

- [ ] Run focused component and contract tests.
- [ ] Run `vp check`.
- [ ] Run `vp test`.
- [ ] Run `vp run storybook#test`.
- [ ] Run `vp run build -r`.
- [ ] Start the relevant local surface and inspect desktop/narrow layout, focus, hover, press, error, disabled, read-only, boundaries, dark mode, and reduced motion.

### Task 7: Memory and delivery readiness

- [ ] Run the `repo-memory` incremental pass against the final diff.
- [ ] Update only durable design/component guidance if the existing spec and component docs do not already capture it.
- [ ] Leave unrelated work untouched and offer commit, push, PR, and CI follow-up after verification.
