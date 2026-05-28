# VirtualList Dynamic Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dynamic-height measurement, window/custom scroll owners, offset-aware scrolling, range callbacks, and wrapper customization to `VirtualList`.

**Architecture:** Keep the enhancement inside `packages/react/src/virtual-list/`. The component owns a measured-size map layered over `estimateSize`, resolves the active scroll owner, and derives visible ranges from owner-relative offsets. Public docs and Storybook show the long-form content use case without adding a new component export.

**Tech Stack:** TypeScript, React 19, jsdom unit tests through `vite-plus/test`, CSS Modules, Storybook.

---

### Task 1: Spec And Plan

**Files:**

- Create: `docs/superpowers/specs/2026-05-28-virtual-list-dynamic-content-design.md`
- Create: `docs/superpowers/plans/2026-05-28-virtual-list-dynamic-content.md`

- [x] **Step 1: Record the approved design**

Write the spec with API additions, measurement behavior, scrolling behavior, accessibility, and tests.

- [x] **Step 2: Record this implementation plan**

Save this plan before editing component code.

### Task 2: Failing Unit Tests

**Files:**

- Modify: `packages/react/src/virtual-list/index.test.tsx`

- [x] **Step 1: Add tests before production code**

Add tests for measured height correction, `ResizeObserver` remeasurement, `scrollElement="window"`, offset-aware `scrollToIndex`, `onRangeChange`, `measureRef`, `itemClassName`, and `itemRole={null}`.

- [x] **Step 2: Run targeted tests and confirm failure**

Run: `vp test packages/react/src/virtual-list/index.test.tsx`

Expected: FAIL because the new props and render details do not exist yet.

### Task 3: VirtualList Implementation

**Files:**

- Modify: `packages/react/src/virtual-list/index.tsx`

- [x] **Step 1: Add public types**

Add `VirtualListRange`, `VirtualListScrollElement`, expanded render details, and expanded `scrollToIndex` options.

- [x] **Step 2: Add measured size ownership**

Layer measured sizes over estimates, attach callback refs, observe nodes with `ResizeObserver`, and clean observers when nodes unmount.

- [x] **Step 3: Add scroll owner resolution**

Support internal viewport, `window`, direct `HTMLElement`, and lazy element callbacks. Keep SSR-safe guards around `window`, `document`, and DOM reads.

- [x] **Step 4: Add range and scroll APIs**

Apply `scrollMargin` to visible range and `scrollToIndex`; emit `onRangeChange` only when the numeric range changes.

- [x] **Step 5: Add wrapper customization**

Apply `itemClassName`, `itemStyle`, `itemRole`, and expose `measureRef` to `renderItem`.

- [x] **Step 6: Run targeted tests and confirm pass**

Run: `vp test packages/react/src/virtual-list/index.test.tsx`

Expected: PASS.

### Task 4: Docs And Storybook

**Files:**

- Modify: `docs/design/components.md`
- Modify: `apps/storybook/src/stories/VirtualList.stories.tsx`

- [x] **Step 1: Update component guidance**

Document dynamic article feeds, window scrolling, scroll margins, `onRangeChange`, and wrapper role customization.

- [x] **Step 2: Add a dynamic content story**

Add a story with varied-height rows and `measureRef` usage.

### Task 5: Verification

**Files:**

- No direct edits.

- [x] **Step 1: Run targeted unit tests**

Run: `vp test packages/react/src/virtual-list/index.test.tsx`

Expected: PASS.

- [x] **Step 2: Run package verification**

Run: `vp check`

Expected: PASS.

- [x] **Step 3: Run Storybook tests if story execution is available**

Run: `vp run storybook#test`

Expected: PASS, or report the exact local blocker.
