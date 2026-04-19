# Phase 1: Existing Components Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign 5 existing components (Button, Text, Popover, Menu, Tabs) to use unified size abbreviations, semantic border-radius tokens, complete JSDoc, and Storybook Interaction stories.

**Architecture:** Modify existing component TypeScript types, Less CSS files, tests, and Storybook stories. No behavior changes — only API surface and styling token updates.

**Tech Stack:** React 19, TypeScript 5.x, Less CSS Modules, Vitest (`vp test`), Storybook

---

### Task 1: Button Redesign

**Files:**

- Modify: `packages/react/src/button/index.tsx`
- Modify: `packages/react/src/button/index.module.less`
- Modify: `packages/react/src/button/index.test.ts`
- Modify: `apps/storybook/src/stories/Button.stories.tsx`

- [ ] **Step 1: Update TypeScript types and class maps**

In `packages/react/src/button/index.tsx`, apply the following changes:

```typescript
// 1. Replace buttonSizeOptions
export const buttonSizeOptions = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// 2. Replace ButtonSize type (derived automatically from the array above)
export type ButtonSize = (typeof buttonSizeOptions)[number];

// 3. Replace buttonShapeOptions
export const buttonShapeOptions = ['rect', 'float', 'pill'] as const;

// 4. Replace ButtonShape type (derived automatically from the array above)
export type ButtonShape = (typeof buttonShapeOptions)[number];

// 5. Replace buttonShapeSupport
export const buttonShapeSupport = {
  filled: ['rect', 'float', 'pill'],
  outlined: ['rect', 'float', 'pill'],
  ghost: [],
  link: [],
} as const satisfies Record<ButtonVariant, readonly ButtonShape[]>;

// 6. Replace buttonDefaultShapeByVariant
export const buttonDefaultShapeByVariant = {
  filled: 'float',
  outlined: 'float',
} as const satisfies Record<ShapeableButtonVariant, ButtonShape>;

// 7. Replace sizeClassNames map
const sizeClassNames: Record<ButtonSize, string> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

// 8. Replace shapeClassNames map
const shapeClassNames: Record<ButtonShape, string> = {
  rect: styles.shapeRect,
  float: styles.shapeFloat,
  pill: styles.shapePill,
};

// 9. Update default size in IconButton forwardRef signature
//    Change: size = 'medium'  →  size = 'md'

// 10. Update default size in ButtonBase forwardRef signature
//    Change: size = 'medium'  →  size = 'md'
```

JSDoc additions to `SharedButtonProps` (replace the existing `size` JSDoc):

```typescript
/**
 * Standard size scale for the Button.
 * `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'`. Defaults to `'md'`.
 */
size?: ButtonSize;
```

- [ ] **Step 2: Run test to verify it fails**

```bash
vp test packages/react/src/button/index.test.ts
```

Expected: **FAIL** — tests still assert `data-shape="rounded"`, `data-size="medium"`, and `--ui-color-link`.

- [ ] **Step 3: Update Less CSS**

In `packages/react/src/button/index.module.less`, apply the following changes:

```less
/* a. In .root, remove the top-level --button-link-text-color line that currently points
      to var(--ui-color-link); it is inherited from .colorNeutral which already uses
      var(--ui-color-text). No action needed there — the fix is in .colorPrimary below. */

/* b. In .colorPrimary, change:
      --button-link-text-color: var(--ui-color-link);
   to:
      --button-link-text-color: var(--ui-color-text); */

/* c. Replace .shapeAuto:
   Old:
   .shapeAuto {
     --button-radius: 0.8rem;
   }
   New:
   .shapeAuto {
     --button-radius: var(--ui-radius-float);
   } */

/* d. Replace .shapeRounded with .shapeFloat:
   Old:
   .shapeRounded {
     --button-radius: 0.4rem;
   }
   New:
   .shapeFloat {
     --button-radius: var(--ui-radius-float);
   } */

/* e. Replace .shapeRect:
   Old:
   .shapeRect {
     --button-radius: 0;
   }
   New:
   .shapeRect {
     --button-radius: var(--ui-radius-rect);
   } */

/* f. Replace .shapePill:
   Old:
   .shapePill {
     --button-radius: 999px;
   }
   New:
   .shapePill {
     --button-radius: var(--ui-radius-pill);
   } */

/* g. In .loadingIndicator, change:
      border-radius: 999px;
   to:
      border-radius: var(--ui-radius-pill); */

/* h. In .linkUnderlineDecoration, change both occurrences of 999px in clip-path to
      var(--ui-radius-pill). The two clip-path rules are:
        clip-path: inset(0 100% 0 0 round 999px);   → inset(0 100% 0 0 round var(--ui-radius-pill))
        clip-path: inset(0 0 0 0 round 999px);       → inset(0 0 0 0 round var(--ui-radius-pill))  */

/* i. Rename size class names from verbose to abbreviated:
   Old → New:
   .sizeExtraSmall → .sizeXs
   .sizeSmall      → .sizeSm
   .sizeMedium     → .sizeMd
   .sizeLarge      → .sizeLg
   .sizeExtraLarge → .sizeXl
   The CSS property bodies stay identical — only the selector names change. */

/* j. In .ghost variant, change:
      --button-radius: 0.4rem;
   to:
      --button-radius: var(--ui-radius-float); */

/* k. In .link variant, change:
      --button-radius: 0.4rem;
   to:
      --button-radius: var(--ui-radius-float); */
```

The final size block in the Less file should look like:

```less
.sizeXs {
  --button-font-size: 0.75rem;
  --button-padding-block: 0.22rem;
  --button-padding-inline: 0.46rem;
}

.sizeSm {
  --button-font-size: 0.8125rem;
  --button-padding-block: 0.28rem;
  --button-padding-inline: 0.58rem;
}

.sizeMd {
  --button-font-size: 0.875rem;
  --button-padding-block: 0.34rem;
  --button-padding-inline: 0.72rem;
}

.sizeLg {
  --button-font-size: 0.9375rem;
  --button-padding-block: 0.4rem;
  --button-padding-inline: 0.84rem;
}

.sizeXl {
  --button-font-size: 1rem;
  --button-padding-block: 0.48rem;
  --button-padding-inline: 0.98rem;
}

.shapeAuto {
  --button-radius: var(--ui-radius-float);
}

.shapeRect {
  --button-radius: var(--ui-radius-rect);
}

.shapeFloat {
  --button-radius: var(--ui-radius-float);
}

.shapePill {
  --button-radius: var(--ui-radius-pill);
}
```

- [ ] **Step 4: Update tests**

In `packages/react/src/button/index.test.ts`, apply the following changes:

```typescript
// a. In exampleButtonProps constant, change:
//      size: 'medium'  →  size: 'md'

// b. In exampleIconButtonProps constant, change:
//      size: 'medium'  →  size: 'md'

// c. In 'button defaults to filled medium with rounded shape and text-only mode' test:
//    Change:
//      expect(markup).toContain('data-shape="rounded"');
//      expect(markup).toContain('data-size="medium"');
//    To:
//      expect(markup).toContain('data-shape="float"');
//      expect(markup).toContain('data-size="md"');

// d. In 'button keeps every documented text variant on the shared API surface' test:
//    Change:
//      createElement(Button, { variant, size: 'large' }, ...)
//    To:
//      createElement(Button, { variant, size: 'lg' }, ...)

// e. In 'button styles consume shared semantic theme tokens instead of raw palette steps' test:
//    Change:
//      expect(stylesheet).toContain('--ui-color-link');
//    To:
//      expect(stylesheet).not.toContain('--ui-color-link');
//    (The token is no longer used in the stylesheet. Keep the other assertions intact.)

// f. In 'button stylesheet protects descenders and keeps the custom underline anchored
//    to link labels' test, change both clip-path assertions:
//      expect(stylesheet).toContain('clip-path: inset(0 100% 0 0 round 999px);');
//    To:
//      expect(stylesheet).toContain('clip-path: inset(0 100% 0 0 round var(--ui-radius-pill));');
//    And:
//      (no separate assertion for the hover clip-path in this test — it is in the next test below)

// g. In 'button stylesheet reveals the link underline on hover without falling back
//    to native underline styling' test, change:
//      expect(stylesheet).toContain('clip-path: inset(0 0 0 0 round 999px);');
//    To:
//      expect(stylesheet).toContain('clip-path: inset(0 0 0 0 round var(--ui-radius-pill));');
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
vp test packages/react/src/button/index.test.ts
```

Expected: **PASS**

- [ ] **Step 6: Update Storybook**

In `apps/storybook/src/stories/Button.stories.tsx`, apply the following changes:

```typescript
// a. Replace:
const sizeOptions = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
// With:
const sizeOptions = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

// b. Replace:
const shapeOptions = ['rect', 'rounded', 'pill'] as const;
// With:
const shapeOptions = ['rect', 'float', 'pill'] as const;

// c. In argTypes.size, update options and table.type.summary:
//    options: ['xs', 'sm', 'md', 'lg', 'xl'],
//    table.type.summary: "'xs' | 'sm' | 'md' | 'lg' | 'xl'"
//    table.defaultValue.summary: 'md'

// d. In argTypes.shape, update options and table.type.summary:
//    options: ['rect', 'float', 'pill'],
//    table.type.summary: "'rect' | 'float' | 'pill'"

// e. In ShapeGallery component, update the meta text:
//    Change: 'Supported shapes: rect, rounded, pill'
//    To:    'Supported shapes: rect, float, pill'
//    (appears twice — once under filled, once under outlined)

// f. In HoverFeedbackGallery, the shapeOptions.map already uses the updated array —
//    no extra change needed beyond the array rename above.

// g. In BoundaryGallery, the longLabelPreview card uses size="extra-small".
//    Change:
//      <Button size="extra-small" ...>
//    To:
//      <Button size="xs" ...>

// h. In PublicProps story, the "Focus via ref" button uses size="small".
//    Change:
//      <Button ... size="small">
//    To:
//      <Button ... size="sm">

// i. The existing Interaction story already covers click and disabled state correctly.
//    Keep it unchanged — its assertions do not depend on size/shape values.
```

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/button/ apps/storybook/src/stories/Button.stories.tsx
git commit -m "refactor(button): align size/shape/radius tokens to new api contract"
```

---

### Task 2: Text Redesign

**Files:**

- Modify: `packages/react/src/text/index.tsx`
- Modify: `packages/react/src/text/index.module.less`
- Modify: `packages/react/src/text/index.test.ts`
- Modify: `apps/storybook/src/stories/Typography.stories.tsx`

- [ ] **Step 1: Add complete JSDoc to all exported types and props**

In `packages/react/src/text/index.tsx`, add JSDoc to every exported type and every prop in `TextProps`. The current file has no prop-level JSDoc at all.

Apply the following additions:

```typescript
/**
 * Typographic role the component renders into.
 * - `'plain'` → `<span>` (inline, default)
 * - `'body'` / `'caption'` → `<div>` (block)
 * - `'h1'`–`'h5'` → the corresponding native heading element
 */
export type TextVariant = 'plain' | 'body' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

/**
 * A color family name from `@deweyou-design/styles` shared palette.
 * Used for both `color` (foreground) and `background` (highlight) props.
 */
export type TextColorFamily = ColorFamilyName;

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** Text content rendered inside the element. */
  children?: ReactNode;
  /**
   * Typographic role and rendered HTML element.
   * Defaults to `'plain'` (`<span>`).
   */
  variant?: TextVariant;
  /** Applies italic style for tone variation. */
  italic?: boolean;
  /** Applies `font-weight: 700` (strong emphasis tier). */
  bold?: boolean;
  /** Adds an underline text-decoration to mark key information. */
  underline?: boolean;
  /** Adds a strikethrough to mark revised or deprecated content. */
  strikethrough?: boolean;
  /**
   * Foreground color from the shared palette.
   * Accepts any `ColorFamilyName` — reuses `@deweyou-design/styles` directly,
   * no separate Text-specific color set.
   */
  color?: TextColorFamily;
  /**
   * Background highlight from the shared palette.
   * Applied with `box-decoration-break: clone` so it wraps correctly across line breaks.
   */
  background?: TextColorFamily;
  /**
   * Clamps the visible text to the given number of lines and appends an ellipsis
   * when the content overflows. Only positive integers are accepted; `0` and
   * non-integers are treated as unclamped.
   */
  lineClamp?: number;
  [dataAttr: `data-${string}`]: string | number | boolean | undefined;
};
```

Verify `packages/react/src/text/index.module.less` — the current file has no hardcoded `border-radius` values. No Less changes are required.

- [ ] **Step 2: Run test to verify it still passes (no behavior change)**

```bash
vp test packages/react/src/text/index.test.ts
```

Expected: **PASS** — JSDoc changes are additive; no runtime behavior is altered.

- [ ] **Step 3: Update Less CSS**

No changes required. The Text stylesheet has no hardcoded `border-radius` values and already references only semantic tokens. Confirm by checking that the file does not contain any pixel radius values (it does not).

- [ ] **Step 4: Update tests**

No test assertions need changing — all existing tests pass before and after the JSDoc addition. The tests already cover the semantic token constraint (`expect(stylesheet).not.toContain('--ui-color-palette-')`).

Add one new assertion to the existing `'text stylesheet consumes semantic tokens'` test to explicitly assert that no hardcoded pixel radii are present:

```typescript
test('text stylesheet has no hardcoded border-radius values', () => {
  // Text is a presentational component — no border-radius should appear at all
  expect(stylesheet).not.toContain('border-radius');
});
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
vp test packages/react/src/text/index.test.ts
```

Expected: **PASS**

- [ ] **Step 6: Update Storybook**

The `Typography.stories.tsx` file already has an `Interaction` export with a `play` function. The current implementation only queries generic DOM nodes and is too shallow. Replace it with assertions that exercise the actual `Text` component API:

```typescript
import { expect, within } from 'storybook/test';

export const Interaction: Story = {
  name: 'Interaction',
  render: () => (
    <div>
      <Text variant="h2" data-testid="heading-text">Section heading</Text>
      <Text variant="body" data-testid="body-text">Body content paragraph.</Text>
      <Text variant="caption" data-testid="caption-text">Caption note</Text>
      <Text variant="plain" bold italic data-testid="decorated-text">Bold italic</Text>
      <Text variant="body" lineClamp={2} data-testid="clamped-text">
        This is a long text that should be clamped to two lines with an ellipsis shown at the end
        when the content overflows the available space.
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // US1: variant maps to the correct semantic element
    const heading = canvas.getByTestId('heading-text');
    expect(heading.tagName.toLowerCase()).toBe('h2');

    const body = canvas.getByTestId('body-text');
    expect(body.tagName.toLowerCase()).toBe('div');

    const caption = canvas.getByTestId('caption-text');
    expect(caption.tagName.toLowerCase()).toBe('div');

    // US2: plain variant renders as span
    const plain = canvas.getByTestId('decorated-text');
    expect(plain.tagName.toLowerCase()).toBe('span');

    // US2: bold and italic apply via className
    expect(plain.className).toMatch(/bold/);
    expect(plain.className).toMatch(/italic/);

    // US3: lineClamp sets the WebkitLineClamp inline style and CSS variable
    const clamped = canvas.getByTestId('clamped-text');
    expect(clamped.style.getPropertyValue('-webkit-line-clamp')).toBe('2');
    expect(clamped.style.getPropertyValue('--text-line-clamp')).toBe('2');
  },
};
```

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/text/ apps/storybook/src/stories/Typography.stories.tsx
git commit -m "refactor(text): add complete jsdoc and strengthen interaction story"
```

---

### Task 3: Popover Redesign

**Files:**

- Modify: `packages/react/src/popover/index.tsx`
- Modify: `packages/react/src/popover/index.module.less`
- Modify: `packages/react/src/popover/index.test.ts`
- Modify: `apps/storybook/src/stories/Popover.stories.tsx`

- [ ] **Step 1: Add complete JSDoc to all exported types and props**

In `packages/react/src/popover/index.tsx`, add JSDoc to every exported `const` option array, every exported `type`, and every prop in `PopoverProps`. The current file exposes these without documentation:

```typescript
/** Interaction types that can open the Popover. */
export const popoverTriggerOptions = ['click', 'hover', 'focus', 'context-menu'] as const;

/** Interaction that opens the Popover. Combine multiple values in an array. */
export type PopoverTrigger = (typeof popoverTriggerOptions)[number];

/** Placement values relative to the trigger element. */
export const popoverPlacementOptions = [
  'top',
  'bottom',
  'left',
  'right',
  'left-top',
  'left-bottom',
  'right-top',
  'right-bottom',
] as const;

/** Preferred side and alignment of the floating panel. Fallback applies automatically. */
export type PopoverPlacement = (typeof popoverPlacementOptions)[number];

/** Panel padding and border treatment options. */
export const popoverModeOptions = ['card', 'loose', 'pure'] as const;

/**
 * Panel content mode.
 * - `'card'` — bordered, shadowed, padded, with arrow.
 * - `'loose'` — more padding, same chrome.
 * - `'pure'` — no padding, no border chrome; `shape` still applies.
 */
export type PopoverMode = (typeof popoverModeOptions)[number];

/** Corner shape options for the panel surface. */
export const popoverShapeOptions = ['rect', 'rounded'] as const;

/**
 * Corner shape of the panel surface.
 * - `'rounded'` — `var(--ui-radius-float)` (4 px).
 * - `'rect'` — `var(--ui-radius-rect)` (0).
 */
export type PopoverShape = (typeof popoverShapeOptions)[number];

/** Reasons that can cause the Popover to open or close. */
export const popoverVisibilityChangeReasonOptions = [
  'trigger',
  'context-menu',
  'outside-press',
  'escape',
  'explicit-action',
  'controlled-update',
  'disabled-reference',
] as const;

/** The reason passed to `onVisibleChange`. */
export type PopoverVisibilityChangeReason = (typeof popoverVisibilityChangeReasonOptions)[number];

/** Details object passed to `onVisibleChange`. */
export type PopoverVisibilityChangeDetails = {
  /** The DOM event that caused the change, when applicable. */
  event?: Event;
  /** Why the popover opened or closed. */
  reason: PopoverVisibilityChangeReason;
};

export type PopoverProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'content'> & {
  /**
   * Minimum distance in pixels the panel must maintain from the viewport edge.
   * Defaults to `16`.
   */
  boundaryPadding?: number;
  /**
   * Trigger element. The popover attaches to this element for positioning
   * and event handling.
   */
  children?: ReactNode;
  /** Content rendered inside the floating panel. Required. */
  content: ReactNode;
  /** Initial visibility for uncontrolled usage. Defaults to `false`. */
  defaultVisible?: boolean;
  /** When true, the popover cannot be opened by any trigger. */
  disabled?: boolean;
  /**
   * Panel content mode.
   * - `'card'` — border, shadow, padding, and arrow (default).
   * - `'loose'` — more generous padding.
   * - `'pure'` — no chrome; `shape` still applies.
   */
  mode?: PopoverMode;
  /** Distance in pixels between the trigger and the panel edge. Defaults to `8`. */
  offset?: number;
  /**
   * Callback fired when the popover opens or closes.
   * Receives the next `visible` boolean and a `details` object with `reason`.
   */
  onVisibleChange?: (visible: boolean, details: PopoverVisibilityChangeDetails) => void;
  /** Additional CSS class applied to the floating overlay element. */
  overlayClassName?: string;
  /** Inline style applied to the floating overlay element. */
  overlayStyle?: CSSProperties;
  /**
   * Preferred placement relative to the trigger.
   * Falls back automatically when there is insufficient space.
   * Defaults to `'bottom'`.
   */
  placement?: PopoverPlacement;
  /**
   * DOM node or ref to mount the panel into.
   * Defaults to `document.body`. Useful for local scroll containers or Shadow DOM.
   */
  popupPortalContainer?:
    | HTMLElement
    | ShadowRoot
    | null
    | { current: HTMLElement | ShadowRoot | null };
  /**
   * Corner shape of the panel.
   * - `'rounded'` — uses `var(--ui-radius-float)` (default).
   * - `'rect'` — uses `var(--ui-radius-rect)`.
   */
  shape?: PopoverShape;
  /**
   * Interaction that opens the popover.
   * Pass an array to combine multiple triggers. Defaults to `'click'`.
   */
  trigger?: PopoverTrigger | readonly PopoverTrigger[];
  /**
   * Controlled visibility. When provided the popover is fully controlled by
   * the parent. Use `onVisibleChange` to react to open/close events.
   */
  visible?: boolean;
};
```

- [ ] **Step 2: Run test to verify it still passes (no behavior change)**

```bash
vp test packages/react/src/popover/index.test.ts
```

Expected: **PASS** — JSDoc additions do not alter runtime behavior.

- [ ] **Step 3: Update Less CSS**

In `packages/react/src/popover/index.module.less`, replace all hardcoded radius values with semantic tokens:

```less
/* a. In .overlay (root declaration block), change:
      --popover-surface-radius: 0.4rem;
   to:
      --popover-surface-radius: var(--ui-radius-float); */

/* b. In .overlay[data-shape='rect'], change:
      --popover-surface-radius: 0;
   to:
      --popover-surface-radius: var(--ui-radius-rect); */

/* c. In .overlay[data-shape='rounded'], change:
      --popover-surface-radius: 0.4rem;
   to:
      --popover-surface-radius: var(--ui-radius-float); */
```

No other pixel radius values exist in the Popover stylesheet.

- [ ] **Step 4: Update tests**

The existing test suite (`packages/react/src/popover/index.test.ts`) does not directly assert on CSS variable values in the stylesheet, so no test assertions need to change. The test that checks the documented option arrays remains correct:

```typescript
// Existing assertion — verify it still reads correctly after the JSDoc pass:
test('popover exports the documented public option sets', () => {
  expect(popoverTriggerOptions).toEqual(['click', 'hover', 'focus', 'context-menu']);
  expect(popoverPlacementOptions).toEqual([
    'top',
    'bottom',
    'left',
    'right',
    'left-top',
    'left-bottom',
    'right-top',
    'right-bottom',
  ]);
  expect(popoverModeOptions).toEqual(['card', 'loose', 'pure']);
  expect(popoverShapeOptions).toEqual(['rect', 'rounded']);
});
```

No modifications required.

- [ ] **Step 5: Run tests to verify they pass**

```bash
vp test packages/react/src/popover/index.test.ts
```

Expected: **PASS**

- [ ] **Step 6: Update Storybook**

The `Popover.stories.tsx` file already has an `Interaction` export with a `play` function that tests open/close behavior. The existing story is complete and correct — no changes required. Verify that the story:

1. Opens the popover by clicking the trigger (`getByTestId('popover-trigger')`).
2. Asserts the content text `'Popover content visible'` appears.
3. Presses `Escape` and asserts the overlay is gone or has `data-state="closed"`.
4. Tabs to the trigger and presses `Enter` to re-open.

The existing implementation covers all four checks. No edits needed for Storybook.

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/popover/ apps/storybook/src/stories/Popover.stories.tsx
git commit -m "refactor(popover): replace hardcoded radius with semantic tokens and add jsdoc"
```

---

### Task 4: Menu Redesign

**Files:**

- Modify: `packages/react/src/menu/index.tsx`
- Modify: `packages/react/src/menu/index.module.less`
- Modify: `packages/react/src/menu/index.test.tsx`
- Modify: `apps/storybook/src/stories/Menu.stories.tsx`

- [ ] **Step 1: Add complete JSDoc to all exported types and props**

In `packages/react/src/menu/index.tsx`, add JSDoc to all exported types and every prop in the public component props. The current file is largely undocumented. Apply:

```typescript
/** Size scale for the menu panel and its items. */
export type MenuSize = 'sm' | 'md' | 'lg';

/** Corner shape of the menu panel. */
export type MenuShape = 'rect' | 'rounded';

export type MenuProps = {
  /** Controlled open state. Use with `onOpenChange` for full control. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Callback fired when the menu opens or closes. */
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  /**
   * Whether the menu closes when a `MenuItem` is selected.
   * Set to `false` for checkbox or radio menus. Defaults to `true`.
   */
  closeOnSelect?: boolean;
  /** Callback fired when a menu item is selected. */
  onSelect?: (details: MenuSelectionDetails) => void;
  /**
   * Preferred placement of the menu relative to its trigger.
   * Defaults to `'bottom-start'`.
   */
  placement?: MenuPlacement;
  /** Gap in pixels between the trigger and the panel. Defaults to `4`. */
  gutter?: number;
  /** When true, the menu cannot be opened. */
  disabled?: boolean;
  /**
   * Size scale for the panel content.
   * `'sm'` | `'md'` | `'lg'`. Defaults to `'md'`.
   */
  size?: MenuSize;
  /**
   * Corner shape of the panel.
   * - `'rounded'` — uses `var(--ui-radius-float)` (default).
   * - `'rect'` — no corner radius.
   */
  shape?: MenuShape;
  /** Must include a `MenuTrigger` and a `MenuContent` as children. */
  children: ReactNode;
};

export type MenuTriggerProps = {
  /** The element that opens the menu when clicked. */
  children: ReactNode;
};

export type MenuContentProps = {
  /** Menu items, groups, separators, or nested menu components. */
  children: ReactNode;
  /** Additional CSS class applied to the content panel. */
  className?: string;
  /** Inline style applied to the content panel. */
  style?: CSSProperties;
  /**
   * DOM node to portal the panel into.
   * Defaults to `document.body`. Pass `null` to disable portaling (useful in tests).
   */
  portalContainer?: HTMLElement | null;
};

export type MenuItemProps = {
  /** Unique identifier used by `onSelect`. Defaults to `''` when omitted. */
  value?: string;
  /** When true, the item is not interactive. */
  disabled?: boolean;
  /** Callback fired when this specific item is selected. */
  onSelect?: () => void;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /**
   * When true, renders a trailing checkmark to indicate this item
   * is the current active selection.
   */
  selected?: boolean;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style applied to the item element. */
  style?: CSSProperties;
};

export type MenuGroupProps = {
  /** Optional id for the group element. Auto-generated when omitted. */
  id?: string;
  /** Optional group label rendered above the items. */
  label?: string;
  /** `MenuItem` or other menu primitives. */
  children: ReactNode;
  /** Additional CSS class applied to the group element. */
  className?: string;
};

export type MenuGroupLabelProps = {
  /** Label text or content. */
  children: ReactNode;
  /** Additional CSS class applied to the label element. */
  className?: string;
};

export type MenuSeparatorProps = {
  /** Additional CSS class applied to the separator element. */
  className?: string;
  /** Inline style applied to the separator element. */
  style?: CSSProperties;
};

export type MenuTriggerItemProps = {
  /** When true, the submenu trigger is not interactive. */
  disabled?: boolean;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /**
   * When true, styles the item as active (e.g. a sub-item is currently selected).
   */
  selected?: boolean;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the trigger item element. */
  className?: string;
  /** Inline style applied to the trigger item element. */
  style?: CSSProperties;
};

export type MenuRadioGroupProps = {
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the selected value changes. */
  onValueChange?: (details: MenuValueChangeDetails) => void;
  /** `MenuRadioItem` elements. */
  children: ReactNode;
  /** Additional CSS class applied to the group element. */
  className?: string;
};

export type MenuRadioItemProps = {
  /** The value this radio item represents. Required. */
  value: string;
  /** When true, the item is not interactive. */
  disabled?: boolean;
  /** Callback fired when this specific item is selected. */
  onSelect?: () => void;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style applied to the item element. */
  style?: CSSProperties;
};

export type MenuCheckboxItemProps = {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Callback fired when the checked state changes. */
  onCheckedChange?: (details: MenuCheckedChangeDetails) => void;
  /** When true, the item is not interactive. */
  disabled?: boolean;
  /** Identifier for the checkbox item. Defaults to `''` when omitted. */
  value?: string;
  /** Leading icon element displayed before the label. */
  icon?: ReactNode;
  /** Item label content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style applied to the item element. */
  style?: CSSProperties;
};

export type ContextMenuProps = {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the context menu opens or closes. */
  onOpenChange?: (details: MenuOpenChangeDetails) => void;
  /** Whether the context menu closes when a `MenuItem` is selected. */
  closeOnSelect?: boolean;
  /** Callback fired when a menu item is selected. */
  onSelect?: (details: MenuSelectionDetails) => void;
  /** Size scale for the panel content. Defaults to `'md'`. */
  size?: MenuSize;
  /** Corner shape of the panel. Defaults to `'rounded'`. */
  shape?: MenuShape;
  /** Must include a `ContextMenu.Trigger` and a `ContextMenu.Content`. */
  children: ReactNode;
};
```

- [ ] **Step 2: Run test to verify it still passes (no behavior change)**

```bash
vp test packages/react/src/menu/index.test.tsx
```

Expected: **PASS**

- [ ] **Step 3: Update Less CSS**

In `packages/react/src/menu/index.module.less`, replace all hardcoded border-radius values with `var(--ui-radius-float)`.

The following locations contain hardcoded values that must be updated:

```less
/* a. Remove the @menu-radius Less variable declaration entirely (it was 0.4rem).
      It is only used for .shapeRounded below; replace its usage inline. */

/* b. In .sizeSm .item, change:
      border-radius: 0.2rem;
   to:
      border-radius: var(--ui-radius-float); */

/* c. In .sizeMd .item, change:
      border-radius: 0.25rem;
   to:
      border-radius: var(--ui-radius-float); */

/* d. In .sizeLg .item, change:
      border-radius: 0.25rem;
   to:
      border-radius: var(--ui-radius-float); */

/* e. In .shapeRounded, change:
      border-radius: 0.4rem;
   to:
      border-radius: var(--ui-radius-float); */

/* f. In .item within .shapeRect, the rule sets border-radius: 0 — keep it as is,
      since 0 is semantically correct for rect and could alternatively use var(--ui-radius-rect).
      Replace it with:
      border-radius: var(--ui-radius-rect); */
```

The updated size variant section should look like:

```less
.sizeSm {
  min-inline-size: 8rem;
  padding-block: 0.2rem;

  .item {
    border-radius: var(--ui-radius-float);
    font-size: 0.8125rem;
    padding-block: 0.28rem;
    padding-inline: 0.5rem;
  }

  .groupLabel {
    font-size: 0.75rem;
    padding-block: 0.2rem 0.25rem;
    padding-inline: 0.625rem;
  }
}

.sizeMd {
  min-inline-size: 9.5rem;
  padding-block: 0.25rem;

  .item {
    border-radius: var(--ui-radius-float);
    font-size: 0.875rem;
    padding-block: 0.35rem;
    padding-inline: 0.625rem;
  }

  .groupLabel {
    font-size: 0.8125rem;
    padding-block: 0.25rem 0.3rem;
    padding-inline: 0.75rem;
  }
}

.sizeLg {
  min-inline-size: 10rem;
  padding-block: 0.25rem;

  .item {
    border-radius: var(--ui-radius-float);
    font-size: 1rem;
    padding-block: 0.45rem;
    padding-inline: 0.75rem;
  }

  .groupLabel {
    font-size: 0.875rem;
    padding-block: 0.3rem 0.375rem;
    padding-inline: 0.875rem;
  }
}

.shapeRounded {
  border-radius: var(--ui-radius-float);
}

.shapeRect {
  border-radius: var(--ui-radius-rect);

  .item {
    border-radius: var(--ui-radius-rect);
  }
}
```

- [ ] **Step 4: Update tests**

The Menu test file tests behavior, not CSS values. No assertions change. The existing tests remain valid.

- [ ] **Step 5: Run tests to verify they pass**

```bash
vp test packages/react/src/menu/index.test.tsx
```

Expected: **PASS**

- [ ] **Step 6: Update Storybook**

The `Menu.stories.tsx` file already has a complete `Interaction` story with a `play` function that covers:

1. Clicking the trigger to open the menu.
2. Hovering the submenu trigger to open the nested menu.
3. Pressing `Escape` to close.
4. Using `ArrowDown` to navigate items.

The story is complete. No changes required.

Verify the `SizeVariants` story — it currently maps `sm` → `'small'`, `lg` → `'large'` for the Button size. After Task 1 (Button Redesign), the Button `size` prop uses abbreviated values. Update the inline size mapping in `SizeVariants`:

```typescript
// In SizeVariants story render function, change:
<Button
  variant="outlined"
  size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
>
// To:
<Button
  variant="outlined"
  size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
>
```

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/menu/ apps/storybook/src/stories/Menu.stories.tsx
git commit -m "refactor(menu): replace hardcoded radius with semantic tokens and add jsdoc"
```

---

### Task 5: Tabs Redesign

**Files:**

- Modify: `packages/react/src/tabs/index.tsx`
- Modify: `packages/react/src/tabs/index.module.less`
- Modify: `packages/react/src/tabs/index.test.tsx`
- Modify: `apps/storybook/src/stories/Tabs.stories.tsx`

- [ ] **Step 1: Update TypeScript types, size options, and add JSDoc**

In `packages/react/src/tabs/index.tsx`, apply the following changes:

```typescript
// a. Replace tabsSizeOptions:
export const tabsSizeOptions = ['sm', 'md', 'lg'] as const;

// b. TabsSize is derived automatically — no manual change needed.
export type TabsSize = (typeof tabsSizeOptions)[number];

// c. Update the default context value for size:
const TabsContext = createContext<TabsContextValue>({
  // ... other defaults unchanged ...
  size: 'md',   // was: 'medium'
  // ...
});

// d. Update the default prop value in the Tabs component:
export const Tabs = ({
  // ...
  size = 'md',   // was: 'medium'
  // ...
}: TabsProps) => { ... };
```

Add JSDoc to all exported types and props that currently lack documentation:

```typescript
/** Supported visual variants for the active tab indicator. */
export const tabsVariantOptions = ['line', 'bg'] as const;

/**
 * Visual variant for the active indicator.
 * - `'line'` — a sliding underline indicator (default).
 * - `'bg'` — a background highlight on the active trigger.
 */
export type TabsVariant = (typeof tabsVariantOptions)[number];

/** Supported semantic color options for the active indicator. */
export const tabsColorOptions = ['neutral', 'primary'] as const;

/**
 * Semantic color for the active indicator and selected tab text.
 * - `'neutral'` — uses `--ui-color-text` (default).
 * - `'primary'` — uses `--ui-color-brand-bg`.
 */
export type TabsColor = (typeof tabsColorOptions)[number];

/** Supported size scale values for tab trigger typography and spacing. */
export const tabsSizeOptions = ['sm', 'md', 'lg'] as const;

/**
 * Size scale for tab triggers.
 * `'sm'` | `'md'` | `'lg'`. Defaults to `'md'`.
 */
export type TabsSize = (typeof tabsSizeOptions)[number];

/** Supported layout orientations. */
export const tabsOrientationOptions = ['horizontal', 'vertical'] as const;

/** Layout direction of the tab list. Defaults to `'horizontal'`. */
export type TabsOrientation = (typeof tabsOrientationOptions)[number];

/** Keyboard activation mode options. */
export const tabsActivationModeOptions = ['automatic', 'manual'] as const;

/**
 * Keyboard activation mode.
 * - `'automatic'` — selecting focus activates the tab immediately (default).
 * - `'manual'` — requires an explicit `Enter` or `Space` press to activate.
 */
export type TabsActivationMode = (typeof tabsActivationModeOptions)[number];

/** Overflow handling mode options. */
export const tabsOverflowModeOptions = ['scroll', 'collapse'] as const;

/**
 * How to handle tabs that overflow the container width.
 * - `'scroll'` — tabs scroll horizontally with gradient edge masks (default).
 * - `'collapse'` — overflowing tabs collapse into a trailing "More" dropdown.
 */
export type TabsOverflowMode = (typeof tabsOverflowModeOptions)[number];

/** A single sub-item definition for a menu-tab trigger. */
export type TabMenuItemDef = {
  /** Unique value that becomes the active tab when selected. */
  value: string;
  /** Label rendered in the dropdown and the overflow More menu. */
  label: ReactNode;
  /** When true, the sub-item is not selectable. */
  disabled?: boolean;
};

export type TabsProps = {
  /** Controlled active tab value. */
  value?: string;
  /** Default tab value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the active tab changes. */
  onValueChange?: (details: TabsValueChangeDetails) => void;
  /** Callback fired when keyboard focus moves between triggers. */
  onFocusChange?: (details: TabsFocusChangeDetails) => void;
  /** Layout direction. Defaults to `'horizontal'`. */
  orientation?: TabsOrientation;
  /** Keyboard activation mode. Defaults to `'automatic'`. */
  activationMode?: TabsActivationMode;
  /** Whether keyboard focus wraps around from last to first trigger. Defaults to `true`. */
  loopFocus?: boolean;
  /**
   * Visual style of the active indicator.
   * - `'line'` — sliding underline (default).
   * - `'bg'` — background highlight.
   */
  variant?: TabsVariant;
  /** Semantic color emphasis for the active indicator. Defaults to `'neutral'`. */
  color?: TabsColor;
  /** Size scale for tab triggers. Defaults to `'md'`. */
  size?: TabsSize;
  /** How to handle tabs that overflow the container. Defaults to `'scroll'`. */
  overflowMode?: TabsOverflowMode;
  /** When true, no `TabContent` panels are rendered (tabs-only / routing mode). */
  hideContent?: boolean;
  /** Whether content panels are mounted lazily on first activation. */
  lazyMount?: boolean;
  /** Whether content panels are unmounted when their tab is deactivated. */
  unmountOnExit?: boolean;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Must include a `TabList` and one or more `TabContent` elements. */
  children: ReactNode;
};

export type TabTriggerProps = {
  /** Unique identifier that must match a corresponding `TabContent` value. */
  value: string;
  /** When true, the trigger is not interactive. */
  disabled?: boolean;
  /**
   * When provided, renders as a dropdown menu tab instead of a plain trigger.
   * Selecting any sub-item activates that sub-item's content panel.
   */
  menuItems?: TabMenuItemDef[];
  /** Additional CSS class applied to the trigger element. */
  className?: string;
  /** Inline style applied to the trigger element. */
  style?: CSSProperties;
  /** Label content rendered inside the trigger. */
  children: ReactNode;
};

export type TabContentProps = {
  /**
   * Must match the corresponding `TabTrigger` value.
   * The panel is shown when this value matches the active tab.
   */
  value: string;
  /** Additional CSS class applied to the content panel. */
  className?: string;
  /** Inline style applied to the content panel. */
  style?: CSSProperties;
  /** Content rendered inside the panel. */
  children: ReactNode;
};
```

- [ ] **Step 2: Run test to verify it fails**

```bash
vp test packages/react/src/tabs/index.test.tsx
```

Expected: **FAIL** — tests assert `data-size="large"` and `size: 'large'` which no longer match the new `'lg'` values.

- [ ] **Step 3: Update Less CSS**

In `packages/react/src/tabs/index.module.less`, replace all hardcoded border-radius values with semantic tokens and update data-size selectors:

```less
/* a. In .trigger base style, change:
      border-radius: 0.4rem 0.4rem 0 0;
   to:
      border-radius: var(--ui-radius-float) var(--ui-radius-float) 0 0; */

/* b. In .root[data-orientation='vertical'] .trigger, change:
      border-radius: 0 0.4rem 0.4rem 0;
   to:
      border-radius: 0 var(--ui-radius-float) var(--ui-radius-float) 0; */

/* c. In .indicator, the border-radius: 999px should become:
      border-radius: var(--ui-radius-pill); */

/* d. In .root[data-variant='bg'] .list, change:
      border-radius: 0.4rem;
   to:
      border-radius: var(--ui-radius-float); */

/* e. In .root[data-variant='bg'] .trigger, change:
      border-radius: 0.3rem;
   to:
      border-radius: var(--ui-radius-float); */

/* f. In .moreButton, change:
      border-radius: 0.4rem;
   to:
      border-radius: var(--ui-radius-float); */

/* g. Update data-size selectors from verbose to abbreviated:
      .root[data-size='small']  → .root[data-size='sm']
      .root[data-size='medium'] → .root[data-size='md']
      .root[data-size='large']  → .root[data-size='lg']
   The CSS property bodies stay identical — only the selector values change. */
```

The updated size and trigger section should read:

```less
.trigger {
  /* ... (unchanged properties) ... */
  border-radius: var(--ui-radius-float) var(--ui-radius-float) 0 0;
}

.root[data-orientation='vertical'] .trigger {
  border-radius: 0 var(--ui-radius-float) var(--ui-radius-float) 0;
}

.indicator {
  /* ... (unchanged properties) ... */
  border-radius: var(--ui-radius-pill);
}

.root[data-variant='bg'] .list {
  /* ... (unchanged properties) ... */
  border-radius: var(--ui-radius-float);
}

.root[data-variant='bg'] .trigger {
  border-radius: var(--ui-radius-float);
}

.moreButton {
  /* ... (unchanged properties) ... */
  border-radius: var(--ui-radius-float);
}

.root[data-size='sm'] .trigger {
  font-size: var(--ui-text-size-caption);
  padding: 0.375rem 0.625rem;
}

.root[data-size='md'] .trigger {
  font-size: var(--ui-text-size-body);
  padding: 0.5rem 0.875rem;
}

.root[data-size='lg'] .trigger {
  font-size: 1.05rem;
  padding: 0.625rem 1.125rem;
}
```

- [ ] **Step 4: Update tests**

In `packages/react/src/tabs/index.test.tsx`, update all size value references:

```typescript
// a. In 'size 和 color 属性正确传递到根节点' test, change:
//      <Tabs color="primary" defaultValue="t1" size="large">
//    to:
//      <Tabs color="primary" defaultValue="t1" size="lg">
//    And change the assertion:
//      expect(root?.getAttribute('data-size')).toBe('large');
//    to:
//      expect(root?.getAttribute('data-size')).toBe('lg');

// b. In the stylesheet token assertions test ('tabs stylesheet 消费语义 token'), add:
//    expect(stylesheet).not.toContain('border-radius: 0.4rem');
//    expect(stylesheet).not.toContain('border-radius: 0.3rem');
//    expect(stylesheet).not.toContain('border-radius: 999px');
//    expect(stylesheet).toContain('var(--ui-radius-float)');
//    expect(stylesheet).toContain('var(--ui-radius-pill)');

// c. The Size stories in Storybook use 'small', 'medium', 'large' as display strings
//    in the storyStyles.label, which are purely visual — they do not feed into the
//    component size prop. The Tabs component receives the abbreviated size prop via
//    args. The test-level size assertions only cover data-size on the root element.
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
vp test packages/react/src/tabs/index.test.tsx
```

Expected: **PASS**

- [ ] **Step 6: Update Storybook**

In `apps/storybook/src/stories/Tabs.stories.tsx`, apply the following changes:

```typescript
// a. In argTypes.size, update options and table:
//    options: ['sm', 'md', 'lg'],
//    table.type.summary: "'sm' | 'md' | 'lg'"
//    table.defaultValue.summary: 'md'

// b. In the Size story render function, change:
//      {(['small', 'medium', 'large'] as const).map((size) => (
//        <div key={size} style={storyStyles.card}>
//          <div style={storyStyles.label}>{size}</div>
//          <Tabs defaultValue="a" size={size}>
//    to:
//      {(['sm', 'md', 'lg'] as const).map((size) => (
//        <div key={size} style={storyStyles.card}>
//          <div style={storyStyles.label}>{size}</div>
//          <Tabs defaultValue="a" size={size}>

// c. In the Playground story args, change:
//      size: 'medium',
//    to:
//      size: 'md',

// d. The existing Interaction story is complete and correct — no changes required.
//    It tests: click to change active tab, aria-selected transfer, ArrowRight focus navigation.
```

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/tabs/ apps/storybook/src/stories/Tabs.stories.tsx
git commit -m "refactor(tabs): align size tokens to abbreviations and replace hardcoded radius"
```
