# Focus Visibility Refinement Implementation Plan

**Goal:** Remove visually heavy brand focus frames while retaining accessible deep-emerald focus on compact controls and neutral focus on application chrome or large content targets.

**Alignment:** Confirmed by the user on 2026-07-22. Remove the large surface outline, keep compact-control focus green but darker, and use neutral focus for Website chrome and large content targets.

### Task 1: Protect the visual contract with tests

- [x] Assert light and dark themes expose the approved focus token steps.
- [x] Assert large focusable surfaces do not apply full-container brand frames.
- [x] Assert representative local targets keep focus-visible styling.

### Task 2: Refine theme tokens and component surfaces

- [x] Change the light focus token to `emerald-800`.
- [x] Change the dark focus token to `emerald-700`.
- [x] Remove full-surface focus frames from the approved overlay and container set.
- [x] Preserve component behavior and local focus feedback.

### Task 3: Update durable design guidance

- [x] Document the deep emerald focus steps.
- [x] Document the boundary between local interactive focus and container focus.

### Task 4: Verify

- [x] Run focused style and theme tests.
- [x] Run formatting, lint, and type checks for the changed files.
- [x] Inspect representative compact controls, Website chrome, Explore menu items, icon cells, and mobile navigation in light and dark themes.
- [x] Run broader repository tests in proportion to the shared token impact.

### Task 5: Neutralize application chrome and large targets

- [x] Add a shared neutral focus mixin to the current and legacy Less entry points.
- [x] Apply neutral focus to Website navigation, utility controls, mobile navigation, and icon cells.
- [x] Apply neutral focus to clickable Card and the ImageMasonry, VirtualMasonry, and GroupedVirtualMasonry default item buttons.
- [x] Protect the boundary with Website and component style contracts.
- [x] Verify representative Website targets in light and dark themes.

_Last updated: 2026-07-22 | Reason: extend the approved focus refinement to application chrome and large content targets_
