# Responsive Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `Nav.Responsive` component and migrate the website header navigation to it.

**Architecture:** Keep `Nav.Root` and `Nav.Link` as low-level navigation primitives. Add `Nav.Responsive` in the same package unit so consumers can pass a data list that renders inline links on desktop and an icon-triggered overlay on small screens. Reuse existing `IconButton` and `NavOverlay` primitives instead of adding new interaction machinery.

**Tech Stack:** React 19, TypeScript, Less CSS Modules, Ark-backed `NavOverlay`, `vite-plus` tests.

---

## File Structure

- Modify `packages/react/src/nav/index.tsx`: add `NavResponsiveItem`, `NavResponsiveSelectDetails`, `NavResponsiveProps`, `NavResponsive`, and include it in the `Nav` compound export.
- Modify `packages/react/src/nav/index.module.less`: add responsive wrapper, inline list, mobile trigger, and overlay class names.
- Create `packages/react/src/nav/index.test.tsx`: package-level tests for inline rendering, active state, external defaults, mobile trigger/overlay behavior, and disabled selection.
- Modify `packages/react/src/index.ts`: export the new responsive nav public types.
- Modify `apps/website/src/components/navbar.tsx`: replace `Tabs` usage with `Nav.Responsive`; keep GitHub and theme as right-side `IconButton` actions.
- Modify `apps/website/src/components/navbar.test.tsx`: update assertions from tab roles to nav links and responsive trigger.
- Modify `apps/website/src/components/navbar.module.less`: remove tab-only selectors and wire wrapper spacing to responsive nav classes.

## Task 1: Package Tests

**Files:**

- Create: `packages/react/src/nav/index.test.tsx`

- [ ] **Step 1: Write failing package tests**

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Nav } from './index.tsx';

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

afterEach(() => {
  cleanup();
});

describe('Nav.Responsive', () => {
  it('renders nav links from items and marks the active value', () => {
    render(
      <Nav.Responsive
        aria-label="Primary"
        value="components"
        items={[
          { href: '/', label: 'Overview', value: 'overview' },
          { href: '/components', label: 'Components', value: 'components' },
        ]}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeTruthy();
  });

  it('applies safe external link defaults', () => {
    render(
      <Nav.Responsive
        items={[{ external: true, href: 'https://example.com', label: 'Docs', value: 'docs' }]}
      />,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the collapsed overlay and calls item and root selection handlers', async () => {
    const onSelect = vi.fn();
    const onItemSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <Nav.Responsive
        onSelect={onSelect}
        items={[
          { href: '/', label: 'Overview', value: 'overview' },
          { label: 'Components', onSelect: onItemSelect, value: 'components' },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    await user.click(within(dialog).getByRole('link', { name: 'Components' }));

    expect(onItemSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'components' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'components' }));
  });

  it('does not call selection handlers for disabled overlay items', async () => {
    const onSelect = vi.fn();
    render(
      <Nav.Responsive
        onSelect={onSelect}
        items={[{ disabled: true, label: 'Disabled', value: 'disabled' }]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const dialog = await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(within(dialog).getByText('Disabled'));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify red**

Run: `vp test packages/react/src/nav/index.test.tsx`

Expected: FAIL because `Nav.Responsive` is not defined.

## Task 2: Package Implementation

**Files:**

- Modify: `packages/react/src/nav/index.tsx`
- Modify: `packages/react/src/nav/index.module.less`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Implement `Nav.Responsive`**

Add the responsive item types, helper functions for active/external/default selection, and render:

- inline `Nav.Root` with `Nav.Link` for desktop links.
- `IconButton` trigger plus `NavOverlay` content for the collapsed branch.
- `collapseTrigger` support so consumers can replace the whole collapsed trigger control.
- overlay links with selected and disabled state.

- [ ] **Step 2: Run package tests to verify green**

Run: `vp test packages/react/src/nav/index.test.tsx`

Expected: PASS.

## Task 3: Website Migration

**Files:**

- Modify: `apps/website/src/components/navbar.tsx`
- Modify: `apps/website/src/components/navbar.module.less`
- Modify: `apps/website/src/components/navbar.test.tsx`

- [ ] **Step 1: Write/update website tests first**

Update navbar tests so they expect:

- route destinations as links inside the primary navigation.
- Storybook as an external link in navigation.
- GitHub as an action icon link outside navigation.
- no `role="tab"` assumptions for header navigation.

- [ ] **Step 2: Run navbar tests to verify red**

Run: `vp test apps/website/src/components/navbar.test.tsx`

Expected: FAIL until the website component uses `Nav.Responsive`.

- [ ] **Step 3: Replace website tabs with `Nav.Responsive`**

Use route items for Overview, Components, Icons and an external item for Storybook. Use item `onSelect` to preserve React Router client navigation for internal routes. Keep GitHub and theme in the right action cluster.

- [ ] **Step 4: Run navbar tests to verify green**

Run: `vp test apps/website/src/components/navbar.test.tsx`

Expected: PASS.

## Task 4: Verification

**Files:**

- No new files.

- [ ] **Step 1: Run focused package and website tests**

Run: `vp test packages/react/src/nav/index.test.tsx apps/website/src/components/navbar.test.tsx apps/website/src/components/navbar-style.test.ts`

Expected: PASS.

- [ ] **Step 2: Run full check**

Run: `vp check`

Expected: PASS.

- [ ] **Step 3: Browser verify**

Open `http://localhost:5173/components` and check desktop and small-width header behavior. Expected: desktop shows inline nav links, small width shows an overlay trigger for nav plus GitHub/theme actions, with no wrapped tab row.

## Self Review

- Spec coverage: package abstraction, website migration, accessibility, tests, and out-of-scope boundaries are covered.
- Placeholder scan: no placeholder tasks remain; implementation details are bounded by existing `Nav`, `NavOverlay`, and `IconButton`.
- Type consistency: public types use `NavResponsive*` names and are exported from the package root.
