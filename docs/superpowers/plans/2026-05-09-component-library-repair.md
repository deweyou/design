# Component Library Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the component library's published API, SSR behavior, lint signal, form semantics, and AI-facing documentation after the self-review.

**Architecture:** Ship low-risk contract repairs first, then add a shared field layer, then generate durable component documentation. Keep Ark UI as the behavior layer, CSS Modules + design tokens as the visual layer, and package exports as the published API source of truth.

**Tech Stack:** TypeScript 5, React 19, Ark UI, Less CSS Modules, vite-plus, Vitest, Storybook.

---

## File Structure

- Modify `packages/react/package.json` to align subpath exports with root exports.
- Modify `packages/react/tests/subpath-entrypoint.test.ts` to lock `Nav` and `NavOverlay` subpath contracts.
- Add `packages/react/tests/ssr-portal-contract.test.tsx` to lock SSR-safe portal behavior.
- Modify `packages/react/src/dialog/index.tsx`, `packages/react/src/nav-overlay/index.tsx`, and `packages/react/src/toast/index.tsx` to avoid direct `document.body` access during render when `document` is absent.
- Modify Storybook `*.stories.tsx` files only to remove existing lint warning noise; keep behavior unchanged.
- Create `packages/react/src/field/` later for shared label, hint, error, required, and aria wiring.
- Update `packages/react/README.md` and add component docs later with composition trees and import matrices.

---

### Task 1: Published API And SSR Contract

**Files:**

- Modify: `packages/react/package.json`
- Modify: `packages/react/tests/subpath-entrypoint.test.ts`
- Add: `packages/react/tests/ssr-portal-contract.test.tsx`
- Modify: `packages/react/src/dialog/index.tsx`
- Modify: `packages/react/src/nav-overlay/index.tsx`
- Modify: `packages/react/src/toast/index.tsx`

- [x] **Step 1: Write failing subpath export tests**

Add `nav` and `nav-overlay` to `packages/react/tests/subpath-entrypoint.test.ts`:

```ts
import * as navEntry from '../src/nav/index.tsx';
import * as navOverlayEntry from '../src/nav-overlay/index.tsx';

expect(packageJson.exports).toMatchObject({
  './nav': {
    default: './dist/nav/index.js',
    import: './dist/nav/index.js',
    types: './dist/nav/index.d.ts',
  },
  './nav-overlay': {
    default: './dist/nav-overlay/index.js',
    import: './dist/nav-overlay/index.js',
    types: './dist/nav-overlay/index.d.ts',
  },
});

expect(navEntry.Nav).toBe(rootEntry.Nav);
expect(navOverlayEntry.NavOverlay).toBe(rootEntry.NavOverlay);
```

- [x] **Step 2: Write failing SSR portal tests**

Create `packages/react/tests/ssr-portal-contract.test.tsx`:

```tsx
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { Dialog, NavOverlay, Toaster } from '../src';

describe('SSR portal contract', () => {
  it('renders Dialog content without document.body access', () => {
    expect(() =>
      renderToStaticMarkup(
        <Dialog.Root open>
          <Dialog.Content>
            <Dialog.Title>SSR dialog</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      ),
    ).not.toThrow();
  });

  it('renders NavOverlay content without document.body access', () => {
    expect(() =>
      renderToStaticMarkup(
        <NavOverlay.Root open>
          <NavOverlay.Content>SSR navigation</NavOverlay.Content>
        </NavOverlay.Root>,
      ),
    ).not.toThrow();
  });

  it('renders Toaster without document.body access', () => {
    expect(() => renderToStaticMarkup(createElement(Toaster))).not.toThrow();
  });
});
```

- [x] **Step 3: Run red tests**

Run: `vp test packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/ssr-portal-contract.test.tsx`

Expected: fails because `./nav` and `./nav-overlay` are missing from `package.json`; SSR tests may fail on `document is not defined`.

- [x] **Step 4: Implement minimal export and portal fixes**

Add `./nav` and `./nav-overlay` export entries to `packages/react/package.json`.

Use this helper pattern in portaled components:

```tsx
const getDefaultPortalContainer = () => {
  return typeof document === 'undefined' ? null : document.body;
};
```

Render inline or `null` when no portal container exists, depending on the component's SSR contract.

- [x] **Step 5: Run green tests**

Run: `vp test packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/ssr-portal-contract.test.tsx`

Expected: PASS.

---

### Task 2: Lint Signal Cleanup

**Files:**

- Modify: `packages/react/src/dialog/index.test.tsx`
- Modify: `apps/storybook/src/stories/*.stories.tsx`
- Modify: `packages/react/scripts/concat-style.mjs`

- [x] **Step 1: Remove unused imports and variables**

Remove unused `vi`, `act`, and unused local variables reported by `vp check`.

- [x] **Step 2: Normalize Storybook async assertions**

Convert bare Storybook `expect(...)` calls to awaited assertions where vite-plus types them as promise-like:

```ts
await expect(control).toBeInTheDocument();
await expect(control.getAttribute('data-state')).toBe('unchecked');
```

- [x] **Step 3: Fix deterministic sort warning**

Change `cssFiles.sort();` in `packages/react/scripts/concat-style.mjs` to:

```js
cssFiles.sort((a, b) => a.localeCompare(b));
```

- [x] **Step 4: Run check**

Run: `vp check`

Expected: PASS with zero warnings.

---

### Task 3: Shared Field Semantics

**Files:**

- Create: `packages/react/src/field/index.tsx`
- Create: `packages/react/src/field/index.module.less`
- Create: `packages/react/src/field/index.test.tsx`
- Modify: `packages/react/src/input/index.tsx`
- Modify: `packages/react/src/textarea/index.tsx`
- Modify: `packages/react/src/select/index.tsx`
- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/package.json`

- [x] **Step 1: Add Field tests**

Tests must cover generated ids, explicit ids, `aria-describedby`, `aria-invalid`, required marker, disabled state, and error precedence over hint.

- [x] **Step 2: Implement Field**

Expose `Field.Root`, `Field.Label`, `Field.Control`, `Field.Description`, and `Field.ErrorText` with a context hook used internally by Input/Textarea/Select.

- [x] **Step 3: Migrate Input and Textarea**

Keep existing props working, but wire generated ids and aria attributes through Field.

- [x] **Step 4: Add Select label/error support**

Add optional `label`, `hint`, `error`, and `required` props to `Select.Root`, then wire trigger aria through Field.

- [x] **Step 5: Verify**

Run: `vp test packages/react/src/field/index.test.tsx packages/react/src/input/index.test.ts packages/react/src/textarea/index.test.ts packages/react/src/select/index.test.tsx`

Expected: PASS.

---

### Task 4: AI-Friendly Component Documentation

**Files:**

- Modify: `packages/react/README.md`
- Create or modify: `docs/design/components.md`

- [x] **Step 1: Document every public component**

For each public component, include import paths, composition tree, controlled/uncontrolled props, accessibility contract, and a minimal example.

- [x] **Step 2: Add composition trees**

Use this shape for compound components:

```text
Dialog
├── Dialog.Root
├── Dialog.Trigger
├── Dialog.Content
│   ├── Dialog.Title
│   ├── Dialog.Description
│   └── Dialog.CloseTrigger
```

- [x] **Step 3: Add import matrix**

List root import and subpath import for all exported components.

- [x] **Step 4: Verify docs stay synchronized**

Add a lightweight test that compares documented subpaths with `packages/react/package.json` exports.

---

### Task 5: Component Coverage Roadmap

**Files:**

- Modify: `docs/specs/index.md`
- Create: `docs/specs/YYYYMMDD-component-coverage-roadmap/spec.md`

- [x] **Step 1: Define near-term additions**

Prioritize `Field`, `Fieldset`, `Alert`, `Empty`, `Kbd`, `ButtonGroup`, `InputGroup`, `Avatar`, and `Collapsible`.

- [x] **Step 2: Define explicit non-goals**

Defer DataTable, Calendar, DatePicker, charts, and rich editor primitives until the lower-level contracts are stable.

- [x] **Step 3: Add acceptance criteria**

Each new component must include source, CSS module, colocated unit test, Storybook story with Interaction, docs entry, and subpath export.

---

## Self-Review

- Spec coverage: covers published API, SSR safety, lint signal, form semantics, documentation, AI-friendliness, and roadmap.
- Placeholder scan: no `TBD`, `TODO`, or undefined task handoffs remain.
- Type consistency: names match existing exported component names and package paths.
