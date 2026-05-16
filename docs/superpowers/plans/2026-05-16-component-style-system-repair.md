# Component Style System Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair component-library style foundations and integrations for touch targets, focus visibility, motion, overlay layering, Storybook coverage, and website density.

**Architecture:** Add shared style tokens in `@deweyou-design/styles`, then migrate affected `@deweyou-design/react` components to consume those tokens. Storybook and website changes verify the repaired defaults in realistic desktop/mobile surfaces rather than relying only on centered isolated stories.

**Tech Stack:** TypeScript 5.x, React 19.x, Less CSS Modules, Ark UI, Storybook 10, vite-plus tests.

---

## File Structure

| Path                                                    | Responsibility                                                                                     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/styles/src/css/theme-light.css`               | Light/default semantic CSS variables, including new size/motion/z-index tokens.                    |
| `packages/styles/src/css/theme-dark.css`                | Dark theme CSS variables where theme-specific values exist.                                        |
| `packages/styles/src/semantics/index.ts`                | Public token export surface for TypeScript consumers.                                              |
| `packages/styles/tests/theme-outputs.test.ts`           | Contract tests for emitted CSS token values.                                                       |
| `packages/styles/tests/index.test.ts`                   | Contract tests for public token export surface.                                                    |
| `packages/react/src/*/index.module.less`                | Component style migrations to shared sizing, motion, and layering tokens.                          |
| `packages/react/tests/component-style-contract.test.ts` | Cross-component style contracts for hardcoded z-index, focus, motion, and reduced-motion coverage. |
| `packages/react/tests/button-density-contract.test.ts`  | Button/IconButton size ladder contract.                                                            |
| `apps/storybook/.storybook/preview.ts`                  | Full-viewport story support.                                                                       |
| `apps/storybook/src/stories/Nav.stories.tsx`            | Responsive nav interaction and viewport coverage.                                                  |
| `apps/storybook/src/stories/Field.stories.tsx`          | Field ARIA interaction coverage.                                                                   |
| `apps/storybook/src/stories/Icon.stories.tsx`           | Keep preview smoke test light; move catalog-heavy checks to catalog/interaction stories.           |
| `apps/storybook/src/stories/Tabs.stories.tsx`           | Make basic story/test stable and keep heavier matrices separate.                                   |
| `apps/website/src/components/navbar.*`                  | Mobile header density and responsive nav integration checks.                                       |
| `apps/website/src/pages/components.*`                   | Component gallery demo density checks.                                                             |

## Task 1: Add Shared Style Tokens

**Files:**

- Modify: `packages/styles/tests/theme-outputs.test.ts`
- Modify: `packages/styles/tests/index.test.ts`
- Modify: `packages/styles/src/css/theme-light.css`
- Modify: `packages/styles/src/css/theme-dark.css`
- Modify: `packages/styles/src/semantics/index.ts`

- [ ] **Step 1: Write failing token output tests**

Add these tests to `packages/styles/tests/theme-outputs.test.ts`:

```ts
test('exposes control sizing and touch target tokens in lightTheme', () => {
  expect(lightTheme['--ui-control-height-xs']).toBe('2rem');
  expect(lightTheme['--ui-control-height-sm']).toBe('2.5rem');
  expect(lightTheme['--ui-control-height-md']).toBe('2.75rem');
  expect(lightTheme['--ui-control-height-lg']).toBe('3rem');
  expect(lightTheme['--ui-control-height-xl']).toBe('3.5rem');
  expect(lightTheme['--ui-touch-target-min']).toBe('2.75rem');
});

test('exposes motion tokens in lightTheme', () => {
  expect(lightTheme['--ui-motion-duration-fast']).toBe('140ms');
  expect(lightTheme['--ui-motion-duration-base']).toBe('160ms');
  expect(lightTheme['--ui-motion-duration-slow']).toBe('260ms');
  expect(lightTheme['--ui-motion-ease-standard']).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  expect(lightTheme['--ui-motion-ease-exit']).toBe('ease');
});

test('exposes layered overlay z-index tokens in lightTheme', () => {
  expect(lightTheme['--ui-z-dropdown']).toBe('1080');
  expect(lightTheme['--ui-z-tooltip']).toBe('1090');
  expect(lightTheme['--ui-z-popover']).toBe('1100');
  expect(lightTheme['--ui-z-dialog']).toBe('1200');
  expect(lightTheme['--ui-z-toast']).toBe('1300');
});
```

Extend `packages/styles/tests/index.test.ts` in `styles package exposes the documented semantic and foundational color token surface`:

```ts
expect(publicCssVars).toContain('--ui-control-height-md');
expect(publicCssVars).toContain('--ui-touch-target-min');
expect(publicCssVars).toContain('--ui-motion-duration-base');
expect(publicCssVars).toContain('--ui-motion-ease-standard');
expect(publicCssVars).toContain('--ui-z-dropdown');
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
vp test packages/styles/tests/theme-outputs.test.ts packages/styles/tests/index.test.ts
```

Expected: failing assertions because the new token names are not present in `lightTheme` / `publicThemeTokens`.

- [ ] **Step 3: Add CSS variables**

In `packages/styles/src/css/theme-light.css`, add the new variables inside the existing `:root, [data-theme='light']` block near spacing and z-index:

```css
/* control sizing — shared across component packages */
--ui-control-height-xs: 2rem;
--ui-control-height-sm: 2.5rem;
--ui-control-height-md: 2.75rem;
--ui-control-height-lg: 3rem;
--ui-control-height-xl: 3.5rem;
--ui-touch-target-min: 2.75rem;
/* motion — shared component rhythm */
--ui-motion-duration-fast: 140ms;
--ui-motion-duration-base: 160ms;
--ui-motion-duration-slow: 260ms;
--ui-motion-ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
--ui-motion-ease-exit: ease;
/* z-index 层级 — 不随主题变化 */
--ui-z-dropdown: 1080;
--ui-z-tooltip: 1090;
--ui-z-popover: 1100;
--ui-z-dialog: 1200;
--ui-z-toast: 1300;
```

In `packages/styles/src/css/theme-dark.css`, add the same control and motion variables to `[data-theme='dark']`. Dark can share the same sizing, motion, and z-index values.

- [ ] **Step 4: Add TypeScript token exports**

In `packages/styles/src/semantics/index.ts`, append public token definitions before `...paletteThemeTokens`:

```ts
  {
    name: 'controlHeightXs',
    cssVar: '--ui-control-height-xs',
    defaultThemeValue: '2rem',
  },
  {
    name: 'controlHeightSm',
    cssVar: '--ui-control-height-sm',
    defaultThemeValue: '2.5rem',
  },
  {
    name: 'controlHeightMd',
    cssVar: '--ui-control-height-md',
    defaultThemeValue: '2.75rem',
  },
  {
    name: 'controlHeightLg',
    cssVar: '--ui-control-height-lg',
    defaultThemeValue: '3rem',
  },
  {
    name: 'controlHeightXl',
    cssVar: '--ui-control-height-xl',
    defaultThemeValue: '3.5rem',
  },
  {
    name: 'touchTargetMin',
    cssVar: '--ui-touch-target-min',
    defaultThemeValue: '2.75rem',
  },
  {
    name: 'motionDurationFast',
    cssVar: '--ui-motion-duration-fast',
    defaultThemeValue: '140ms',
  },
  {
    name: 'motionDurationBase',
    cssVar: '--ui-motion-duration-base',
    defaultThemeValue: '160ms',
  },
  {
    name: 'motionDurationSlow',
    cssVar: '--ui-motion-duration-slow',
    defaultThemeValue: '260ms',
  },
  {
    name: 'motionEaseStandard',
    cssVar: '--ui-motion-ease-standard',
    defaultThemeValue: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  {
    name: 'motionEaseExit',
    cssVar: '--ui-motion-ease-exit',
    defaultThemeValue: 'ease',
  },
  {
    name: 'zDropdown',
    cssVar: '--ui-z-dropdown',
    defaultThemeValue: '1080',
  },
```

Extend `semanticTokens` with:

```ts
  controlHeightXs: '--ui-control-height-xs',
  controlHeightSm: '--ui-control-height-sm',
  controlHeightMd: '--ui-control-height-md',
  controlHeightLg: '--ui-control-height-lg',
  controlHeightXl: '--ui-control-height-xl',
  touchTargetMin: '--ui-touch-target-min',
  motionDurationFast: '--ui-motion-duration-fast',
  motionDurationBase: '--ui-motion-duration-base',
  motionDurationSlow: '--ui-motion-duration-slow',
  motionEaseStandard: '--ui-motion-ease-standard',
  motionEaseExit: '--ui-motion-ease-exit',
  zDropdown: '--ui-z-dropdown',
```

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
vp test packages/styles/tests/theme-outputs.test.ts packages/styles/tests/index.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/styles/src/css/theme-light.css packages/styles/src/css/theme-dark.css packages/styles/src/semantics/index.ts packages/styles/tests/theme-outputs.test.ts packages/styles/tests/index.test.ts
git commit -m "feat(styles): add interaction and motion tokens"
```

## Task 2: Migrate Component Sizing, Focus, Motion, and Layering

**Files:**

- Modify: `packages/react/tests/component-style-contract.test.ts`
- Modify: `packages/react/tests/button-density-contract.test.ts`
- Modify: `packages/react/src/button/index.module.less`
- Modify: `packages/react/src/pagination/index.module.less`
- Modify: `packages/react/src/select/index.module.less`
- Modify: `packages/react/src/checkbox/index.module.less`
- Modify: `packages/react/src/radio-group/index.module.less`
- Modify: `packages/react/src/switch/index.module.less`
- Modify: `packages/react/src/toast/index.module.less`
- Modify: `packages/react/src/menu/index.module.less`
- Modify: `packages/react/src/tooltip/index.module.less`
- Modify: `packages/react/src/skeleton/index.module.less`
- Modify: `packages/react/src/spinner/index.module.less`

- [ ] **Step 1: Write failing style contract tests**

Extend `packages/react/tests/component-style-contract.test.ts`:

```ts
const paginationStylesPath = resolve(reactSourceRoot, 'pagination/index.module.less');
const selectStylesPath = resolve(reactSourceRoot, 'select/index.module.less');
const checkboxStylesPath = resolve(reactSourceRoot, 'checkbox/index.module.less');
const radioGroupStylesPath = resolve(reactSourceRoot, 'radio-group/index.module.less');
const switchStylesPath = resolve(reactSourceRoot, 'switch/index.module.less');
const toastStylesPath = resolve(reactSourceRoot, 'toast/index.module.less');
const menuStylesPath = resolve(reactSourceRoot, 'menu/index.module.less');
const tooltipStylesPath = resolve(reactSourceRoot, 'tooltip/index.module.less');
const skeletonStylesPath = resolve(reactSourceRoot, 'skeleton/index.module.less');
const spinnerStylesPath = resolve(reactSourceRoot, 'spinner/index.module.less');

test('interactive component styles consume shared target sizing tokens', () => {
  expect(readFileSync(paginationStylesPath, 'utf8')).toContain('--ui-control-height-sm');
  expect(readFileSync(selectStylesPath, 'utf8')).toContain('--ui-control-height-sm');
  expect(readFileSync(checkboxStylesPath, 'utf8')).toContain('--ui-touch-target-min');
  expect(readFileSync(radioGroupStylesPath, 'utf8')).toContain('--ui-touch-target-min');
  expect(readFileSync(switchStylesPath, 'utf8')).toContain('--ui-touch-target-min');
  expect(readFileSync(toastStylesPath, 'utf8')).toContain('--ui-touch-target-min');
});

test('overlay component styles consume shared z-index tokens', () => {
  expect(readFileSync(selectStylesPath, 'utf8')).toContain('z-index: var(--ui-z-dropdown);');
  expect(readFileSync(menuStylesPath, 'utf8')).toContain('@menu-z-index: var(--ui-z-dropdown);');
  expect(readFileSync(tooltipStylesPath, 'utf8')).toContain('z-index: var(--ui-z-tooltip);');
});

test('motion-sensitive components respect reduced motion', () => {
  expect(readFileSync(tooltipStylesPath, 'utf8')).toContain(
    '@media (prefers-reduced-motion: reduce)',
  );
  expect(readFileSync(skeletonStylesPath, 'utf8')).toContain(
    '@media (prefers-reduced-motion: reduce)',
  );
  expect(readFileSync(spinnerStylesPath, 'utf8')).toContain(
    '@media (prefers-reduced-motion: reduce)',
  );
});

test('menu trigger keeps keyboard focus visible', () => {
  const stylesheet = readFileSync(menuStylesPath, 'utf8');

  expect(stylesheet).not.toContain('box-shadow: none;');
  expect(stylesheet).not.toContain(
    ":global([data-scope='menu'][data-part='trigger']:focus-visible)",
  );
});
```

Update `packages/react/tests/button-density-contract.test.ts` size expectations:

```ts
expect(stylesheet).toContain('--button-height: var(--ui-control-height-xs);');
expect(stylesheet).toContain('--button-height: var(--ui-control-height-sm);');
expect(stylesheet).toContain('--button-height: var(--ui-control-height-md);');
expect(stylesheet).toContain('--button-height: var(--ui-control-height-lg);');
expect(stylesheet).toContain('--button-height: var(--ui-control-height-xl);');
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
vp test packages/react/tests/component-style-contract.test.ts packages/react/tests/button-density-contract.test.ts
```

Expected: failing assertions for missing sizing/motion/z-index tokens and existing Menu focus suppression.

- [ ] **Step 3: Migrate Button size ladder**

In `packages/react/src/button/index.module.less`, change size classes:

```less
.sizeXs {
  --button-font-size: 0.75rem;
  --button-height: var(--ui-control-height-xs);
  --button-padding-block: 0;
  --button-padding-inline: 0.5rem;
}

.sizeSm {
  --button-font-size: 0.875rem;
  --button-height: var(--ui-control-height-sm);
  --button-padding-block: 0;
  --button-padding-inline: 0.75rem;
}

.sizeMd {
  --button-font-size: 1rem;
  --button-height: var(--ui-control-height-md);
  --button-padding-block: 0;
  --button-padding-inline: 1rem;
}

.sizeLg {
  --button-font-size: 1.0625rem;
  --button-height: var(--ui-control-height-lg);
  --button-padding-block: 0;
  --button-padding-inline: 1.25rem;
}

.sizeXl {
  --button-font-size: 1.125rem;
  --button-height: var(--ui-control-height-xl);
  --button-padding-block: 0;
  --button-padding-inline: 1.5rem;
}
```

Also replace local duration/easing values in Button transitions with motion tokens where direct substitutions are clear:

```less
transition:
  background var(--ui-motion-duration-fast) var(--ui-motion-ease-exit),
  border-color var(--ui-motion-duration-fast) var(--ui-motion-ease-exit),
  color var(--ui-motion-duration-fast) var(--ui-motion-ease-exit),
  box-shadow var(--ui-motion-duration-fast) var(--ui-motion-ease-exit),
  transform var(--ui-motion-duration-fast) var(--ui-motion-ease-exit);
```

- [ ] **Step 4: Migrate target sizes and z-index**

Apply these component style changes:

```less
// packages/react/src/pagination/index.module.less
.item,
.ellipsis,
.prevNext {
  min-width: var(--ui-control-height-sm);
  height: var(--ui-control-height-sm);
}
```

```less
// packages/react/src/select/index.module.less
.trigger {
  min-block-size: var(--ui-control-height-sm);
}

.content {
  z-index: var(--ui-z-dropdown);
}

.item {
  min-block-size: var(--ui-control-height-sm);
}
```

```less
// packages/react/src/checkbox/index.module.less
.root {
  min-block-size: var(--ui-touch-target-min);
}
```

```less
// packages/react/src/radio-group/index.module.less
.item {
  min-block-size: var(--ui-touch-target-min);
}
```

```less
// packages/react/src/switch/index.module.less
.root {
  min-block-size: var(--ui-touch-target-min);
}
```

```less
// packages/react/src/toast/index.module.less
.close {
  height: var(--ui-touch-target-min);
  margin-block: -10px;
  margin-inline-end: -10px;
  width: var(--ui-touch-target-min);
}
```

```less
// packages/react/src/menu/index.module.less
@menu-z-index: var(--ui-z-dropdown);
```

```less
// packages/react/src/tooltip/index.module.less
.content {
  z-index: var(--ui-z-tooltip);
}
```

Remove the global Menu focus suppression block:

```less
:global([data-scope='menu'][data-part='trigger']:focus-visible) {
  outline: none;
  box-shadow: none;
}
```

- [ ] **Step 5: Migrate motion and reduced-motion**

Use tokenized animation values for Menu, Select, Tooltip, Toast, and Button. For reduced motion:

```less
// packages/react/src/tooltip/index.module.less
@media (prefers-reduced-motion: reduce) {
  .content[data-state='open'] {
    animation: tooltipFadeIn var(--ui-motion-duration-base) var(--ui-motion-ease-exit);
  }

  .content[data-state='closed'] {
    animation: tooltipFadeOut var(--ui-motion-duration-base) var(--ui-motion-ease-exit) forwards;
  }
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes tooltipFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

```less
// packages/react/src/skeleton/index.module.less
@media (prefers-reduced-motion: reduce) {
  .root {
    animation: none;
    background-image: none;
  }
}
```

```less
// packages/react/src/spinner/index.module.less
@media (prefers-reduced-motion: reduce) {
  .root {
    animation-duration: 1.8s;
  }
}
```

- [ ] **Step 6: Run tests to verify GREEN**

Run:

```bash
vp test packages/react/tests/component-style-contract.test.ts packages/react/tests/button-density-contract.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/react/src packages/react/tests/component-style-contract.test.ts packages/react/tests/button-density-contract.test.ts
git commit -m "refactor(react): use shared interaction style tokens"
```

## Task 3: Repair NavOverlay Long-List Layout

**Files:**

- Modify: `packages/react/src/nav/index.module.less`
- Modify: `packages/react/src/nav-overlay/index.module.less`
- Modify: `packages/react/src/nav-overlay/index.test.tsx`
- Modify: `packages/react/src/nav/index.test.ts`

- [ ] **Step 1: Write failing style tests for overlay reserved space**

In `packages/react/src/nav-overlay/index.test.tsx`, add:

```tsx
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('nav overlay styles reserve safe space for fixed close control', () => {
  const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

  expect(stylesheet).toContain('--nav-overlay-close-target-size: var(--ui-touch-target-min);');
  expect(stylesheet).toContain('--nav-overlay-bottom-safe-space');
});
```

In `packages/react/src/nav/index.test.ts`, add:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('responsive nav overlay list reserves bottom safe area', () => {
  const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

  expect(stylesheet).toContain('padding-bottom: var(--nav-overlay-bottom-safe-space,');
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
vp test packages/react/src/nav-overlay/index.test.tsx packages/react/src/nav/index.test.ts
```

Expected: failing assertions because safe-space CSS variables are not defined yet.

- [ ] **Step 3: Add overlay safe-space variables**

In `packages/react/src/nav-overlay/index.module.less`, add to `.content`:

```less
--nav-overlay-close-target-size: var(--ui-touch-target-min);
--nav-overlay-bottom-safe-space: calc(
  var(--nav-overlay-close-target-size) + var(--ui-space-xl) + env(safe-area-inset-bottom)
);
```

Change `.closeButton`:

```less
.closeButton {
  min-block-size: var(--nav-overlay-close-target-size);
  min-inline-size: var(--nav-overlay-close-target-size);
  position: absolute;
  right: var(--ui-space-md);
  top: var(--ui-space-md);
}
```

In `packages/react/src/nav/index.module.less`, change `.responsiveOverlayList`:

```less
.responsiveOverlayList {
  flex: 1 1 auto;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: var(
    --nav-overlay-bottom-safe-space,
    calc(var(--ui-touch-target-min) + var(--ui-space-xl))
  );
  scrollbar-width: none;
}
```

Keep `.responsiveOverlayCloseButton` bottom-fixed, but set a stable target:

```less
.responsiveOverlayCloseButton {
  bottom: max(var(--ui-space-lg), env(safe-area-inset-bottom));
  left: 50%;
  min-block-size: var(--nav-overlay-close-target-size, var(--ui-touch-target-min));
  min-inline-size: var(--nav-overlay-close-target-size, var(--ui-touch-target-min));
  position: fixed;
  right: auto;
  top: auto;
  transform: translateX(-50%);
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
vp test packages/react/src/nav-overlay/index.test.tsx packages/react/src/nav/index.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/nav-overlay/index.module.less packages/react/src/nav-overlay/index.test.tsx packages/react/src/nav/index.module.less packages/react/src/nav/index.test.ts
git commit -m "fix(nav): reserve overlay close button space"
```

## Task 4: Strengthen Storybook Coverage and Stability

**Files:**

- Modify: `apps/storybook/.storybook/preview.ts`
- Modify: `apps/storybook/src/stories/Nav.stories.tsx`
- Modify: `apps/storybook/src/stories/Field.stories.tsx`
- Modify: `apps/storybook/src/stories/Icon.stories.tsx`
- Modify: `apps/storybook/src/stories/Tabs.stories.tsx`

- [ ] **Step 1: Add failing story interaction tests**

In `apps/storybook/src/stories/Nav.stories.tsx`, add:

```tsx
import { expect, userEvent, waitFor, within } from 'storybook/test';
```

Add a `play` function to `Responsive`:

```tsx
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('navigation', { name: 'Responsive navigation' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
```

Add a `play` function to `ResponsiveLongList`:

```tsx
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open navigation' });

    await userEvent.click(trigger);

    await waitFor(() => {
      expect(within(document.body).getByRole('link', { name: 'Section 1' })).toBeVisible();
    });
    await expect(within(document.body).getByRole('link', { name: 'Section 32' })).toBeInTheDocument();
    await userEvent.click(within(document.body).getByRole('link', { name: 'Section 2' }));
    await waitFor(() => {
      expect(within(document.body).queryByRole('link', { name: 'Section 1' })).toBeNull();
    });
  },
```

In `apps/storybook/src/stories/Field.stories.tsx`, add:

```tsx
import { expect, within } from 'storybook/test';
```

Add a `play` function to `Default`:

```tsx
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Name');

    await expect(input).toHaveAttribute('id', 'field-story');
    await expect(input).toHaveAttribute('aria-describedby', 'field-story-description');
    await expect(canvas.getByText('Field connects label, description, and control ids.')).toHaveAttribute(
      'id',
      'field-story-description',
    );
  },
```

- [ ] **Step 2: Run Storybook e2e to verify RED or current timeout**

Start Storybook in one terminal:

```bash
vp run storybook#dev
```

Run in another terminal:

```bash
vp run storybook#test
```

Expected before implementation: currently fails with timeout on `Components/Tabs › Basic` and `Components/Icon › Preview`, or newly added story assertions fail if the current stories do not expose the expected behavior.

- [ ] **Step 3: Add full-viewport story parameter support**

In `apps/storybook/.storybook/preview.ts`, update the decorator to respect a custom `fullViewport` parameter:

```ts
const isFullViewport = context.parameters.fullViewport === true;

return createElement(
  'div',
  {
    'data-theme': themeMode,
    style: {
      background: storybookThemeBackgrounds[themeMode],
      colorScheme: themeMode,
      minHeight: isFullViewport ? '100dvh' : 'auto',
      padding: isFullViewport ? 0 : '24px',
      width: '100%',
    },
  },
  createElement(Story),
);
```

Add `parameters: { fullViewport: true }` to `ResponsiveLongList` and any `NavOverlay` long-list story.

- [ ] **Step 4: Stabilize Icon Preview**

Keep `Icon.Preview` lightweight and move catalog-heavy assertions to `Interaction`. If `Preview` still times out, remove `tags: ['autodocs']` from the default meta or move autodocs-heavy content to `Catalog`.

The `Preview` story should remain:

```tsx
export const Preview: Story = {
  render: (args) => (
    <article style={{ ...storyStyles.card, width: 180 }}>
      <SearchIcon {...args} data-testid="icon-preview" />
      <strong>SearchIcon</strong>
      <code style={storyStyles.meta}>controlled preview</code>
    </article>
  ),
};
```

The `Interaction` story keeps catalog assertions.

- [ ] **Step 5: Stabilize Tabs Basic**

Keep `Tabs.Basic` to one line-variant example and move the second bg example to a new `BasicVariants` story:

```tsx
export const Basic: StoryObj = {
  render: () => (
    <div style={storyStyles.card}>
      <div style={storyStyles.label}>line variant (default)</div>
      <Tabs defaultValue="overview">
        <TabList>
          <TabTrigger value="overview">Overview</TabTrigger>
          <TabTrigger value="settings">Settings</TabTrigger>
          <TabTrigger value="history">History</TabTrigger>
          <TabTrigger disabled value="disabled">
            Disabled
          </TabTrigger>
        </TabList>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="settings">Settings content</TabContent>
        <TabContent value="history">History content</TabContent>
        <TabContent value="disabled">Disabled content</TabContent>
      </Tabs>
    </div>
  ),
  name: 'Basic',
};
```

Create `BasicVariants` for the bg variant if it is still useful for visual review.

- [ ] **Step 6: Run Storybook e2e to verify GREEN**

Run:

```bash
vp run storybook#test
```

Expected: all Storybook tests pass, including `Tabs/Basic`, `Icon/Preview`, `Nav`, and `Field`.

- [ ] **Step 7: Commit**

```bash
git add apps/storybook/.storybook/preview.ts apps/storybook/src/stories/Nav.stories.tsx apps/storybook/src/stories/Field.stories.tsx apps/storybook/src/stories/Icon.stories.tsx apps/storybook/src/stories/Tabs.stories.tsx
git commit -m "test(storybook): cover responsive style repairs"
```

## Task 5: Repair Website Mobile Density and Demos

**Files:**

- Modify: `apps/website/src/components/navbar-style.test.ts`
- Modify: `apps/website/src/components/navbar.module.less`
- Modify: `apps/website/src/components/navbar.tsx`
- Modify: `apps/website/src/pages/components.test.tsx`
- Modify: `apps/website/src/pages/components.module.less`
- Modify: `apps/website/src/data/component-catalog.tsx`

- [ ] **Step 1: Write failing website style tests**

Update `apps/website/src/components/navbar-style.test.ts`:

```ts
test('mobile navbar uses touch-safe action targets', () => {
  const stylesheet = navbarStyles;

  expect(stylesheet).toContain('--website-header-action-size: var(--ui-touch-target-min);');
  expect(stylesheet).toContain('min-block-size: var(--website-header-action-size);');
  expect(stylesheet).toContain('min-inline-size: var(--website-header-action-size);');
});
```

In `apps/website/src/pages/components.test.tsx`, add:

```tsx
test('component catalog previews use user-facing control density', () => {
  render(<ComponentsPage />);

  const buttonCard = screen.getByRole('article', { name: 'Button' });
  expect(within(buttonCard).getByRole('button', { name: 'Primary' })).toHaveAttribute(
    'data-size',
    'md',
  );

  const iconButtonCard = screen.getByRole('article', { name: 'IconButton' });
  expect(within(iconButtonCard).getByRole('button', { name: 'Settings' })).toHaveAttribute(
    'data-size',
    'md',
  );
});
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
vp test apps/website/src/components/navbar-style.test.ts apps/website/src/pages/components.test.tsx
```

Expected: failing assertions for missing header action size variables or demo controls using smaller sizes.

- [ ] **Step 3: Enlarge mobile header action targets**

In `apps/website/src/components/navbar.module.less`, define:

```less
.root {
  --website-header-action-size: var(--ui-touch-target-min);
}
```

In mobile action rules, ensure GitHub/theme/nav icon actions get:

```less
min-block-size: var(--website-header-action-size);
min-inline-size: var(--website-header-action-size);
```

If layout becomes too tight at 375px, reduce gaps before reducing target size:

```less
@media (max-width: 760px) {
  .root {
    gap: 4px;
    grid-template-columns: 1fr auto auto;
    padding: 8px 10px;
  }
}
```

- [ ] **Step 4: Use user-facing sizes in component demos**

In `apps/website/src/data/component-catalog.tsx`, change demo controls that use `size="sm"` for primary interactive examples to `size="md"` unless the card explicitly demonstrates compact controls. Examples:

```tsx
<Button size="md">Primary</Button>
<Button size="md" variant="outlined">Outline</Button>
<IconButton aria-label="Settings" icon={<SettingsIcon />} size="md" />
<Input size="md" placeholder="Name" />
<Select.Trigger size="md">Choose</Select.Trigger>
```

In `apps/website/src/pages/components.module.less`, avoid clipping enlarged controls:

```less
.preview {
  align-items: center;
  min-height: 112px;
  overflow: visible;
}
```

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
vp test apps/website/src/components/navbar-style.test.ts apps/website/src/pages/components.test.tsx
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/components/navbar-style.test.ts apps/website/src/components/navbar.module.less apps/website/src/components/navbar.tsx apps/website/src/pages/components.test.tsx apps/website/src/pages/components.module.less apps/website/src/data/component-catalog.tsx
git commit -m "fix(website): use touch-safe component density"
```

## Task 6: Final Verification and Browser QA

**Files:**

- No required source edits unless verification reveals a bug.

- [ ] **Step 1: Run focused package tests**

Run:

```bash
vp test packages/styles/tests/theme-outputs.test.ts packages/styles/tests/index.test.ts packages/react/tests/component-style-contract.test.ts packages/react/tests/button-density-contract.test.ts apps/website/src/components/navbar-style.test.ts apps/website/src/pages/components.test.tsx
```

Expected: all focused tests pass.

- [ ] **Step 2: Run full checks**

Run:

```bash
vp check
vp test
```

Expected: both commands exit 0.

- [ ] **Step 3: Run Storybook e2e**

Start Storybook:

```bash
vp run storybook#dev
```

Run:

```bash
vp run storybook#test
```

Expected: all Storybook suites pass.

- [ ] **Step 4: Run website and capture browser QA**

Start website:

```bash
vp run website#dev
```

Use browser verification at these URLs:

- `http://localhost:5173/` at `1280x900`
- `http://localhost:5173/` at `375x812`
- `http://localhost:5173/components` at `375x812`
- Open mobile nav overlay at `375x812`

Expected:

- No horizontal overflow.
- Mobile header icon targets are at least 40px and visually quiet.
- Components page demo controls no longer show 29-32px defaults as primary demos.
- Nav overlay close control does not cover link content.

- [ ] **Step 5: Stop dev servers**

Stop the Storybook and website dev server sessions with `Ctrl-C`.

- [ ] **Step 6: Commit verification-only adjustments if needed**

If browser QA required small fixes:

```bash
git add packages/styles packages/react apps/storybook apps/website
git commit -m "fix: address component style qa findings"
```

If no source changes were required in Task 6, do not create an empty commit.
