# Phase 3b: Ark UI Display Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 interactive display components (Tooltip, Toast, ScrollArea, Carousel, Pagination) backed by Ark UI.

**Architecture:** Ark UI handles behavior (state machine, ARIA, positioning, animations). Public API is a clean Compound pattern without exposing Ark UI types. All styles via Less CSS Modules using semantic design tokens.

**Tech Stack:** React 19, TypeScript 5.x, Less CSS Modules, @ark-ui/react, Vitest (`vp test`), Storybook

**Prerequisite:** Install Ark UI MCP Server before starting:

```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

---

### Task 1: Tooltip

**Files:**

- Create: `packages/react/src/tooltip/index.tsx`
- Create: `packages/react/src/tooltip/index.module.less`
- Create: `packages/react/src/tooltip/index.test.tsx`
- Create: `apps/storybook/src/stories/Tooltip.stories.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// packages/react/src/tooltip/index.test.tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Tooltip } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Tooltip', () => {
  it('renders the trigger element', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>
          <button>Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Root>,
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toBeTruthy();
  });

  it('tooltip content is not visible by default', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger>
          <button>Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip.Root>,
    );

    // Ark UI uses lazyMount + unmountOnExit, so content should not be in DOM when closed
    expect(screen.queryByText('Tooltip text')).toBeNull();
  });

  it('renders Tooltip.Root, Tooltip.Trigger, Tooltip.Content as compound components', () => {
    expect(typeof Tooltip.Root).toBe('function');
    expect(typeof Tooltip.Trigger).toBe('function');
    expect(typeof Tooltip.Content).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/tooltip/index.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/tooltip/index.tsx
import { type CSSProperties, type ReactNode } from 'react';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// TooltipRoot
// ---------------------------------------------------------------------------

export type TooltipRootProps = {
  /** Delay in milliseconds before the tooltip opens on hover. @default 400 */
  openDelay?: number;
  /** Delay in milliseconds before the tooltip closes after hover ends. @default 100 */
  closeDelay?: number;
  /** Content of the tooltip compound, must include Trigger and Content. */
  children: ReactNode;
};

const TooltipRoot = ({ openDelay = 400, closeDelay = 100, children }: TooltipRootProps) => (
  <ArkTooltip.Root closeDelay={closeDelay} lazyMount openDelay={openDelay} unmountOnExit>
    {children}
  </ArkTooltip.Root>
);

// ---------------------------------------------------------------------------
// TooltipTrigger
// ---------------------------------------------------------------------------

export type TooltipTriggerProps = {
  /** The element that triggers the tooltip on hover/focus. */
  children: ReactNode;
};

const TooltipTrigger = ({ children }: TooltipTriggerProps) => (
  <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
);

// ---------------------------------------------------------------------------
// TooltipContent
// ---------------------------------------------------------------------------

export type TooltipContentProps = {
  /** The tooltip message content. */
  children: ReactNode;
  /** Additional CSS class applied to the tooltip content element. */
  className?: string;
  /** Inline style overrides for the tooltip content element. */
  style?: CSSProperties;
};

const TooltipContent = ({ children, className, style }: TooltipContentProps) => (
  <ArkTooltip.Positioner>
    <ArkTooltip.Content className={classNames(styles.content, className)} style={style}>
      {children}
    </ArkTooltip.Content>
  </ArkTooltip.Positioner>
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/tooltip/index.module.less
@import '@deweyou-design/styles/less/bridge';

.content {
  background: var(--ui-color-text);
  border-radius: var(--ui-radius-float);
  color: var(--ui-color-canvas);
  font-size: 0.8125rem;
  line-height: 1.4;
  max-width: 240px;
  padding: 4px 8px;
  word-break: break-word;
  z-index: 1090;
}

.content[data-state='open'] {
  animation: tooltipIn 120ms cubic-bezier(0.22, 1, 0.36, 1);
}

.content[data-state='closed'] {
  animation: tooltipOut 80ms ease forwards;
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tooltipOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/tooltip/index.test.tsx`
Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Tooltip.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { Tooltip } from '@deweyou-design/react/tooltip';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip displays a short informational message when the user hovers or focuses a trigger element. Built on Ark UI for positioning, ARIA semantics, and delay management. Import from `@deweyou-design/react/tooltip`.\n\n**Composition**: `Tooltip.Root` → `Tooltip.Trigger` + `Tooltip.Content`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="outlined">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>This is a tooltip</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  name: 'Variants',
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        justifyContent: 'center',
        padding: '80px',
        flexWrap: 'wrap',
      }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button>Short tip</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Brief message</Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button variant="outlined">Long tip</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          This tooltip has a longer description that wraps across multiple lines when it exceeds the
          maximum width of 240px.
        </Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
          <Button variant="ghost">No delay</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Opens instantly (openDelay=0)</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  name: 'States',
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        justifyContent: 'center',
        padding: '80px',
        flexWrap: 'wrap',
      }}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <Button>Default (closed)</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Visible on hover</Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
          <button
            style={{
              background: 'none',
              border: '1px solid var(--ui-color-border)',
              borderRadius: 'var(--ui-radius-float)',
              color: 'var(--ui-color-text)',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Native button trigger
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>Works on any focusable element</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Interaction (play function for e2e test)
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}
    >
      <Tooltip.Root openDelay={0} closeDelay={0}>
        <Tooltip.Trigger>
          <button data-testid="tooltip-trigger">Hover me</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip is visible</Tooltip.Content>
      </Tooltip.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('tooltip-trigger');

    // Tooltip content should not be in the DOM initially
    expect(canvas.queryByText('Tooltip is visible')).toBeNull();

    // Hover over trigger
    await userEvent.hover(trigger);

    // After hovering, tooltip content should appear
    await waitFor(() => {
      expect(canvas.getByText('Tooltip is visible')).toBeTruthy();
    });

    // Move pointer away — tooltip should close
    await userEvent.unhover(trigger);

    await waitFor(() => {
      expect(canvas.queryByText('Tooltip is visible')).toBeNull();
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  Tooltip,
  type TooltipRootProps,
  type TooltipTriggerProps,
  type TooltipContentProps,
} from './tooltip/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/tooltip/ apps/storybook/src/stories/Tooltip.stories.tsx
git commit -m "feat(tooltip): add Tooltip component"
```

---

### Task 2: Toast

**Files:**

- Create: `packages/react/src/toast/index.tsx`
- Create: `packages/react/src/toast/index.module.less`
- Create: `packages/react/src/toast/index.test.tsx`
- Create: `apps/storybook/src/stories/Toast.stories.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// packages/react/src/toast/index.test.tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Toaster, toast } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Toaster', () => {
  it('renders without crashing', () => {
    render(<Toaster />);
    // The Toaster portal container should be present in the DOM
    // (it renders a div wrapper even when no toasts are visible)
    expect(document.body).toBeTruthy();
  });

  it('renders a valid React component', () => {
    const { container } = render(<Toaster />);
    expect(container).toBeTruthy();
  });
});

describe('toast', () => {
  it('toast.create is a function', () => {
    expect(typeof toast.create).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/toast/index.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/toast/index.tsx
import { type CSSProperties } from 'react';
import { createToaster, Toaster as ArkToaster } from '@ark-ui/react/toast';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Visual intent variant for a toast notification. */
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

/** Options passed to `toast.create()` to display a new toast. */
export type ToastOptions = {
  /** Main heading of the toast. */
  title: string;
  /** Optional supporting text shown below the title. */
  description?: string;
  /** Visual intent variant. @default 'info' */
  variant?: ToastVariant;
  /** Duration in milliseconds before auto-dismiss. @default 5000 */
  duration?: number;
};

// ---------------------------------------------------------------------------
// Internal toaster instance (singleton)
// ---------------------------------------------------------------------------

const toasterInstance = createToaster({
  placement: 'top-end',
  overlap: false,
  gap: 8,
});

// ---------------------------------------------------------------------------
// toast — public imperative API
// ---------------------------------------------------------------------------

/**
 * Imperative toast controller. Call `toast.create(options)` to show a
 * notification. Place `<Toaster />` once at the application root.
 */
export const toast = {
  create: (options: ToastOptions) => {
    toasterInstance.create({
      title: options.title,
      description: options.description,
      duration: options.duration ?? 5000,
      type: 'info',
      meta: { variant: options.variant ?? 'info' },
    });
  },
};

// ---------------------------------------------------------------------------
// Toaster — portal component (place once at app root)
// ---------------------------------------------------------------------------

export type ToasterProps = {
  /** Additional CSS class applied to the toaster viewport element. */
  className?: string;
  /** Inline style overrides for the toaster viewport element. */
  style?: CSSProperties;
};

/**
 * Portal-rendered container for toast notifications. Mount once at the
 * application root. Toasts are triggered imperatively via `toast.create()`.
 */
export const Toaster = ({ className, style }: ToasterProps) => (
  <ArkToaster toaster={toasterInstance}>
    {(t) => {
      const variant = (t.meta as Record<string, unknown>)?.variant as ToastVariant | undefined;

      return (
        <ArkToaster.Toast
          key={t.id}
          toast={t}
          className={classNames(styles.toast, variant && styles[variant], className)}
          style={style}
        >
          <div className={styles.body}>
            {t.title && <ArkToaster.Title className={styles.title}>{t.title}</ArkToaster.Title>}
            {t.description && (
              <ArkToaster.Description className={styles.description}>
                {t.description}
              </ArkToaster.Description>
            )}
          </div>
          <ArkToaster.CloseTrigger className={styles.close} aria-label="Dismiss notification">
            <svg aria-hidden focusable="false" height="14" viewBox="0 0 14 14" width="14">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          </ArkToaster.CloseTrigger>
        </ArkToaster.Toast>
      );
    }}
  </ArkToaster>
);
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/toast/index.module.less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Toast item
// ---------------------------------------------------------------------------

.toast {
  align-items: flex-start;
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  box-shadow: var(--ui-shadow-soft);
  color: var(--ui-color-text);
  display: flex;
  gap: 12px;
  max-width: min(400px, calc(100vw - 32px));
  padding: 12px 16px;
  position: relative;
}

.toast[data-state='open'] {
  animation: toastIn 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toast[data-state='closed'] {
  animation: toastOut 160ms ease forwards;
}

// ---------------------------------------------------------------------------
// Variant accent borders
// ---------------------------------------------------------------------------

.info {
  border-left: 3px solid var(--ui-color-info-border, #3b82f6);
}

.success {
  border-left: 3px solid var(--ui-color-success-border, #22c55e);
}

.warning {
  border-left: 3px solid var(--ui-color-warning-border, #f59e0b);
}

.danger {
  border-left: 3px solid var(--ui-color-danger-border, #ef4444);
}

// ---------------------------------------------------------------------------
// Body / title / description
// ---------------------------------------------------------------------------

.body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
}

.description {
  font-size: 0.8125rem;
  line-height: 1.5;
  opacity: 0.72;
}

// ---------------------------------------------------------------------------
// Close button
// ---------------------------------------------------------------------------

.close {
  align-items: center;
  background: none;
  border: none;
  border-radius: var(--ui-radius-float);
  color: var(--ui-color-text);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  opacity: 0.5;
  padding: 2px;
  transition: opacity 120ms ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid var(--ui-color-brand-bg);
    outline-offset: 2px;
  }
}

// ---------------------------------------------------------------------------
// Keyframes
// ---------------------------------------------------------------------------

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/toast/index.test.tsx`
Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Toast.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { Toaster, toast } from '@deweyou-design/react/toast';

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Toast displays brief, auto-dismissing notifications. Place `<Toaster />` once at the app root and trigger notifications imperatively via `toast.create()`. Built on Ark UI for accessibility and positioning. Import from `@deweyou-design/react/toast`.\n\n**Usage**: `toast.create({ title, description?, variant?, duration? })`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <div style={{ padding: '24px' }}>
      <Toaster />
      <Button
        onClick={() =>
          toast.create({
            title: 'Changes saved',
            description: 'Your settings have been updated successfully.',
          })
        }
      >
        Show toast
      </Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px' }}>
      <Toaster />
      <Button
        onClick={() =>
          toast.create({ title: 'Info', description: 'Informational message.', variant: 'info' })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          toast.create({
            title: 'Success',
            description: 'Operation completed.',
            variant: 'success',
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toast.create({
            title: 'Warning',
            description: 'Please review this.',
            variant: 'warning',
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toast.create({ title: 'Error', description: 'Something went wrong.', variant: 'danger' })
        }
      >
        Danger
      </Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  name: 'States',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '24px' }}>
      <Toaster />
      <Button
        onClick={() =>
          toast.create({
            title: 'Short duration',
            description: 'This disappears in 2 seconds.',
            duration: 2000,
          })
        }
      >
        Short (2s)
      </Button>
      <Button
        onClick={() =>
          toast.create({
            title: 'Title only',
            variant: 'success',
          })
        }
      >
        Title only
      </Button>
      <Button
        onClick={() =>
          toast.create({
            title: 'Long message',
            description:
              'This toast has a longer description text that demonstrates how the layout handles multi-line content gracefully.',
            variant: 'info',
          })
        }
      >
        Long description
      </Button>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Interaction (play function for e2e test)
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div style={{ padding: '24px' }}>
      <Toaster />
      <Button
        data-testid="show-toast-btn"
        onClick={() =>
          toast.create({
            title: 'Interaction test toast',
            description: 'This toast was created programmatically.',
            variant: 'success',
          })
        }
      >
        Show toast
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Toast should not be visible initially
    expect(canvas.queryByText('Interaction test toast')).toBeNull();

    // Click the button to trigger toast.create()
    const btn = canvas.getByTestId('show-toast-btn');
    await userEvent.click(btn);

    // Toast should appear in the DOM (portal renders into document.body)
    await waitFor(() => {
      expect(within(document.body).getByText('Interaction test toast')).toBeTruthy();
    });

    // Description should also be visible
    expect(
      within(document.body).getByText('This toast was created programmatically.'),
    ).toBeTruthy();
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  Toaster,
  toast,
  type ToastVariant,
  type ToastOptions,
  type ToasterProps,
} from './toast/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/toast/ apps/storybook/src/stories/Toast.stories.tsx
git commit -m "feat(toast): add Toast component and toaster"
```

---

### Task 3: ScrollArea

**Files:**

- Create: `packages/react/src/scroll-area/index.tsx`
- Create: `packages/react/src/scroll-area/index.module.less`
- Create: `packages/react/src/scroll-area/index.test.tsx`
- Create: `apps/storybook/src/stories/ScrollArea.stories.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// packages/react/src/scroll-area/index.test.tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { ScrollArea } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('ScrollArea', () => {
  it('renders viewport with content', () => {
    render(
      <ScrollArea.Root style={{ height: '200px' }}>
        <ScrollArea.Viewport>
          <div data-testid="inner-content">Scrollable content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );

    expect(screen.getByTestId('inner-content')).toBeTruthy();
  });

  it('scrollbar has correct data-orientation attribute', () => {
    render(
      <ScrollArea.Root style={{ height: '200px' }}>
        <ScrollArea.Viewport>
          <div>Content</div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>,
    );

    const scrollbars = document.querySelectorAll('[data-orientation]');
    const hasVertical = Array.from(scrollbars).some(
      (el) => el.getAttribute('data-orientation') === 'vertical',
    );
    expect(hasVertical).toBe(true);
  });

  it('renders compound components as functions', () => {
    expect(typeof ScrollArea.Root).toBe('function');
    expect(typeof ScrollArea.Viewport).toBe('function');
    expect(typeof ScrollArea.Scrollbar).toBe('function');
    expect(typeof ScrollArea.Thumb).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/scroll-area/index.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/scroll-area/index.tsx
import { type CSSProperties, type ReactNode } from 'react';
import { ScrollArea as ArkScrollArea } from '@ark-ui/react/scroll-area';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// ScrollAreaRoot
// ---------------------------------------------------------------------------

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export type ScrollAreaRootProps = {
  /**
   * Controls which scrollbar(s) are displayed.
   * - `'vertical'` (default): vertical scrollbar only
   * - `'horizontal'`: horizontal scrollbar only
   * - `'both'`: both scrollbars
   */
  type?: ScrollAreaOrientation;
  /** Content of the scroll area compound. */
  children: ReactNode;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline style overrides for the root element. */
  style?: CSSProperties;
};

const ScrollAreaRoot = ({ type = 'vertical', children, className, style }: ScrollAreaRootProps) => (
  <ArkScrollArea.Root
    className={classNames(styles.root, className)}
    scrollbarSize={6}
    style={style}
    type={type === 'both' ? undefined : type}
  >
    {children}
  </ArkScrollArea.Root>
);

// ---------------------------------------------------------------------------
// ScrollAreaViewport
// ---------------------------------------------------------------------------

export type ScrollAreaViewportProps = {
  /** The content to be scrolled. */
  children: ReactNode;
  /** Additional CSS class applied to the viewport element. */
  className?: string;
  /** Inline style overrides for the viewport element. */
  style?: CSSProperties;
};

const ScrollAreaViewport = ({ children, className, style }: ScrollAreaViewportProps) => (
  <ArkScrollArea.Viewport className={classNames(styles.viewport, className)} style={style}>
    {children}
  </ArkScrollArea.Viewport>
);

// ---------------------------------------------------------------------------
// ScrollAreaScrollbar
// ---------------------------------------------------------------------------

export type ScrollAreaScrollbarProps = {
  /** The axis this scrollbar controls. */
  orientation: 'vertical' | 'horizontal';
  /** Content of the scrollbar, typically `ScrollArea.Thumb`. */
  children: ReactNode;
  /** Additional CSS class applied to the scrollbar element. */
  className?: string;
  /** Inline style overrides for the scrollbar element. */
  style?: CSSProperties;
};

const ScrollAreaScrollbar = ({
  orientation,
  children,
  className,
  style,
}: ScrollAreaScrollbarProps) => (
  <ArkScrollArea.Scrollbar
    className={classNames(styles.scrollbar, className)}
    orientation={orientation}
    style={style}
  >
    {children}
  </ArkScrollArea.Scrollbar>
);

// ---------------------------------------------------------------------------
// ScrollAreaThumb
// ---------------------------------------------------------------------------

export type ScrollAreaThumbProps = {
  /** Additional CSS class applied to the thumb element. */
  className?: string;
  /** Inline style overrides for the thumb element. */
  style?: CSSProperties;
};

const ScrollAreaThumb = ({ className, style }: ScrollAreaThumbProps) => (
  <ArkScrollArea.Thumb className={classNames(styles.thumb, className)} style={style} />
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/scroll-area/index.module.less
@import '@deweyou-design/styles/less/bridge';

.root {
  overflow: hidden;
  position: relative;
}

.viewport {
  height: 100%;
  outline: none;
  overflow: scroll;
  width: 100%;
  // Hide native scrollbar — Ark UI renders its own custom scrollbar
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

// ---------------------------------------------------------------------------
// Custom scrollbar track
// ---------------------------------------------------------------------------

.scrollbar {
  background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
  border-radius: var(--ui-radius-pill);
  display: flex;
  transition: background 120ms ease;
  user-select: none;

  &[data-orientation='vertical'] {
    bottom: 0;
    flex-direction: column;
    padding: 2px;
    position: absolute;
    right: 0;
    top: 0;
    width: 6px;
  }

  &[data-orientation='horizontal'] {
    bottom: 0;
    flex-direction: row;
    height: 6px;
    left: 0;
    padding: 2px;
    position: absolute;
    right: 0;
  }

  &:hover {
    background: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
  }
}

// ---------------------------------------------------------------------------
// Custom scrollbar thumb
// ---------------------------------------------------------------------------

.thumb {
  background: color-mix(in srgb, var(--ui-color-text) 24%, transparent);
  border-radius: var(--ui-radius-pill);
  flex: 1;
  position: relative;
  transition: background 120ms ease;

  &::before {
    // Expands the hit area beyond the visual thumb
    bottom: 50%;
    content: '';
    left: 50%;
    min-height: 44px;
    min-width: 44px;
    position: absolute;
    right: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  &:hover {
    background: color-mix(in srgb, var(--ui-color-text) 36%, transparent);
  }
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/scroll-area/index.test.tsx`
Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/ScrollArea.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';

import { ScrollArea } from '@deweyou-design/react/scroll-area';

const meta: Meta = {
  title: 'Components/ScrollArea',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ScrollArea provides a cross-browser custom scrollbar over a scrollable region. Built on Ark UI for scroll tracking and thumb positioning. Import from `@deweyou-design/react/scroll-area`.\n\n**Composition**: `ScrollArea.Root` → `ScrollArea.Viewport` + `ScrollArea.Scrollbar` → `ScrollArea.Thumb`.',
      },
    },
  },
};

export default meta;

const longText = Array.from(
  { length: 40 },
  (_, i) => `Line ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
).join('\n');

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <ScrollArea.Root
      style={{
        height: '200px',
        width: '320px',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-float)',
      }}
    >
      <ScrollArea.Viewport>
        <div
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.875rem',
            padding: '12px',
            whiteSpace: 'pre-line',
          }}
        >
          {longText}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Vertical (default)
        </p>
        <ScrollArea.Root
          style={{
            height: '160px',
            width: '260px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-float)',
          }}
        >
          <ScrollArea.Viewport>
            <div
              style={{
                color: 'var(--ui-color-text)',
                fontSize: '0.875rem',
                padding: '12px',
                whiteSpace: 'pre-line',
              }}
            >
              {longText}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>

      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Horizontal
        </p>
        <ScrollArea.Root
          style={{
            height: '80px',
            width: '260px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-float)',
          }}
        >
          <ScrollArea.Viewport>
            <div
              style={{
                color: 'var(--ui-color-text)',
                fontSize: '0.875rem',
                padding: '12px',
                whiteSpace: 'nowrap',
                width: '600px',
              }}
            >
              This is a very wide content area that overflows horizontally and should show a
              horizontal scrollbar track below.
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="horizontal">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  name: 'States',
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Both axes
        </p>
        <ScrollArea.Root
          type="both"
          style={{
            height: '160px',
            width: '260px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: 'var(--ui-radius-float)',
          }}
        >
          <ScrollArea.Viewport>
            <div
              style={{
                color: 'var(--ui-color-text)',
                fontSize: '0.875rem',
                padding: '12px',
                whiteSpace: 'pre-line',
                width: '500px',
              }}
            >
              {longText}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar orientation="horizontal">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Interaction (play function for e2e test)
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <ScrollArea.Root
      data-testid="scroll-root"
      style={{
        height: '200px',
        width: '320px',
        border: '1px solid var(--ui-color-border)',
        borderRadius: 'var(--ui-radius-float)',
      }}
    >
      <ScrollArea.Viewport>
        <div
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.875rem',
            padding: '12px',
            whiteSpace: 'pre-line',
          }}
        >
          {longText}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify the scrollbar element is present in the DOM
    await waitFor(() => {
      const scrollbars = canvasElement.querySelectorAll('[data-orientation="vertical"]');
      expect(scrollbars.length).toBeGreaterThan(0);
    });

    // Verify the viewport is rendered
    const root = canvas.getByTestId('scroll-root');
    expect(root).toBeTruthy();
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  ScrollArea,
  type ScrollAreaOrientation,
  type ScrollAreaRootProps,
  type ScrollAreaViewportProps,
  type ScrollAreaScrollbarProps,
  type ScrollAreaThumbProps,
} from './scroll-area/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/scroll-area/ apps/storybook/src/stories/ScrollArea.stories.tsx
git commit -m "feat(scroll-area): add ScrollArea component"
```

---

### Task 4: Carousel

**Files:**

- Create: `packages/react/src/carousel/index.tsx`
- Create: `packages/react/src/carousel/index.module.less`
- Create: `packages/react/src/carousel/index.test.tsx`
- Create: `apps/storybook/src/stories/Carousel.stories.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// packages/react/src/carousel/index.test.tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Carousel } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Carousel', () => {
  const renderCarousel = () =>
    render(
      <Carousel.Root defaultIndex={0}>
        <Carousel.PrevTrigger>
          <button>Previous</button>
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <button>Next</button>
        </Carousel.NextTrigger>
        <Carousel.ItemGroup>
          <Carousel.Item index={0}>Slide 1</Carousel.Item>
          <Carousel.Item index={1}>Slide 2</Carousel.Item>
          <Carousel.Item index={2}>Slide 3</Carousel.Item>
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup>
          <Carousel.Indicator index={0} />
          <Carousel.Indicator index={1} />
          <Carousel.Indicator index={2} />
        </Carousel.IndicatorGroup>
      </Carousel.Root>,
    );

  it('renders carousel items', () => {
    renderCarousel();
    expect(screen.getByText('Slide 1')).toBeTruthy();
    expect(screen.getByText('Slide 2')).toBeTruthy();
    expect(screen.getByText('Slide 3')).toBeTruthy();
  });

  it('renders prev and next trigger buttons', () => {
    renderCarousel();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('renders compound components as functions', () => {
    expect(typeof Carousel.Root).toBe('function');
    expect(typeof Carousel.ItemGroup).toBe('function');
    expect(typeof Carousel.Item).toBe('function');
    expect(typeof Carousel.PrevTrigger).toBe('function');
    expect(typeof Carousel.NextTrigger).toBe('function');
    expect(typeof Carousel.IndicatorGroup).toBe('function');
    expect(typeof Carousel.Indicator).toBe('function');
  });

  it('clicking next trigger does not throw', () => {
    renderCarousel();
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(() => fireEvent.click(nextBtn)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/carousel/index.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/carousel/index.tsx
import { type CSSProperties, type ReactNode } from 'react';
import { Carousel as ArkCarousel } from '@ark-ui/react/carousel';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// CarouselRoot
// ---------------------------------------------------------------------------

export type CarouselRootProps = {
  /** Initial slide index for uncontrolled usage. @default 0 */
  defaultIndex?: number;
  /** Controlled slide index. Use with `onIndexChange`. */
  index?: number;
  /** Callback fired when the active slide index changes. */
  onIndexChange?: (index: number) => void;
  /** When true, navigating past the last slide wraps back to the first. */
  loop?: boolean;
  /** Content of the carousel compound. */
  children: ReactNode;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline style overrides for the root element. */
  style?: CSSProperties;
};

const CarouselRoot = ({
  defaultIndex = 0,
  index,
  onIndexChange,
  loop = false,
  children,
  className,
  style,
}: CarouselRootProps) => (
  <ArkCarousel.Root
    className={classNames(styles.root, className)}
    defaultIndex={defaultIndex}
    index={index}
    loop={loop}
    onIndexChange={onIndexChange ? ({ index: nextIndex }) => onIndexChange(nextIndex) : undefined}
    style={style}
  >
    {children}
  </ArkCarousel.Root>
);

// ---------------------------------------------------------------------------
// CarouselItemGroup
// ---------------------------------------------------------------------------

export type CarouselItemGroupProps = {
  /** Carousel items (`Carousel.Item`). */
  children: ReactNode;
  /** Additional CSS class applied to the item group element. */
  className?: string;
  /** Inline style overrides for the item group element. */
  style?: CSSProperties;
};

const CarouselItemGroup = ({ children, className, style }: CarouselItemGroupProps) => (
  <ArkCarousel.ItemGroup className={classNames(styles.itemGroup, className)} style={style}>
    {children}
  </ArkCarousel.ItemGroup>
);

// ---------------------------------------------------------------------------
// CarouselItem
// ---------------------------------------------------------------------------

export type CarouselItemProps = {
  /** Zero-based index of this slide. Must be unique within `ItemGroup`. */
  index: number;
  /** Slide content. */
  children: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline style overrides for the item element. */
  style?: CSSProperties;
};

const CarouselItem = ({ index, children, className, style }: CarouselItemProps) => (
  <ArkCarousel.Item className={classNames(styles.item, className)} index={index} style={style}>
    {children}
  </ArkCarousel.Item>
);

// ---------------------------------------------------------------------------
// CarouselPrevTrigger
// ---------------------------------------------------------------------------

export type CarouselPrevTriggerProps = {
  /** The element that triggers the previous slide action (must be a button). */
  children: ReactNode;
  /** Additional CSS class applied to the trigger wrapper. */
  className?: string;
  /** Inline style overrides for the trigger wrapper. */
  style?: CSSProperties;
};

const CarouselPrevTrigger = ({ children, className, style }: CarouselPrevTriggerProps) => (
  <ArkCarousel.PrevTrigger
    asChild
    className={classNames(styles.trigger, styles.prevTrigger, className)}
    style={style}
  >
    {children}
  </ArkCarousel.PrevTrigger>
);

// ---------------------------------------------------------------------------
// CarouselNextTrigger
// ---------------------------------------------------------------------------

export type CarouselNextTriggerProps = {
  /** The element that triggers the next slide action (must be a button). */
  children: ReactNode;
  /** Additional CSS class applied to the trigger wrapper. */
  className?: string;
  /** Inline style overrides for the trigger wrapper. */
  style?: CSSProperties;
};

const CarouselNextTrigger = ({ children, className, style }: CarouselNextTriggerProps) => (
  <ArkCarousel.NextTrigger
    asChild
    className={classNames(styles.trigger, styles.nextTrigger, className)}
    style={style}
  >
    {children}
  </ArkCarousel.NextTrigger>
);

// ---------------------------------------------------------------------------
// CarouselIndicatorGroup
// ---------------------------------------------------------------------------

export type CarouselIndicatorGroupProps = {
  /** Indicator dots (`Carousel.Indicator`). */
  children: ReactNode;
  /** Additional CSS class applied to the indicator group. */
  className?: string;
  /** Inline style overrides for the indicator group. */
  style?: CSSProperties;
};

const CarouselIndicatorGroup = ({ children, className, style }: CarouselIndicatorGroupProps) => (
  <ArkCarousel.IndicatorGroup
    className={classNames(styles.indicatorGroup, className)}
    style={style}
  >
    {children}
  </ArkCarousel.IndicatorGroup>
);

// ---------------------------------------------------------------------------
// CarouselIndicator
// ---------------------------------------------------------------------------

export type CarouselIndicatorProps = {
  /** Zero-based index of the slide this indicator corresponds to. */
  index: number;
  /** Additional CSS class applied to the indicator element. */
  className?: string;
  /** Inline style overrides for the indicator element. */
  style?: CSSProperties;
};

const CarouselIndicator = ({ index, className, style }: CarouselIndicatorProps) => (
  <ArkCarousel.Indicator
    className={classNames(styles.indicator, className)}
    index={index}
    style={style}
  />
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Carousel = {
  Root: CarouselRoot,
  ItemGroup: CarouselItemGroup,
  Item: CarouselItem,
  PrevTrigger: CarouselPrevTrigger,
  NextTrigger: CarouselNextTrigger,
  IndicatorGroup: CarouselIndicatorGroup,
  Indicator: CarouselIndicator,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/carousel/index.module.less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

.root {
  overflow: hidden;
  position: relative;
  width: 100%;
}

// ---------------------------------------------------------------------------
// Item group — flex row of slides
// ---------------------------------------------------------------------------

.itemGroup {
  display: flex;
  flex-direction: row;
  height: 100%;
  // Ark UI sets transform on this element to slide between items
  will-change: transform;
}

// ---------------------------------------------------------------------------
// Item — individual slide
// ---------------------------------------------------------------------------

.item {
  flex-shrink: 0;
  width: 100%;
}

// ---------------------------------------------------------------------------
// Prev / Next triggers
// ---------------------------------------------------------------------------

.trigger {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.prevTrigger {
  left: 8px;
}

.nextTrigger {
  right: 8px;
}

// ---------------------------------------------------------------------------
// Indicator group
// ---------------------------------------------------------------------------

.indicatorGroup {
  align-items: center;
  bottom: 12px;
  display: flex;
  gap: 6px;
  justify-content: center;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
}

// ---------------------------------------------------------------------------
// Indicator dot
// ---------------------------------------------------------------------------

.indicator {
  background: var(--ui-color-border);
  border: none;
  border-radius: var(--ui-radius-pill);
  cursor: pointer;
  height: 6px;
  padding: 0;
  transition:
    background 150ms ease,
    width 150ms ease;
  width: 6px;

  &[data-current] {
    background: var(--ui-color-brand-bg);
    width: 16px;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-brand-bg);
    outline-offset: 2px;
  }
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/carousel/index.test.tsx`
Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Carousel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Carousel } from '@deweyou-design/react/carousel';

const meta: Meta = {
  title: 'Components/Carousel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Carousel displays a sequence of slides with navigation controls. Built on Ark UI for state management, ARIA semantics, and touch/keyboard support. Import from `@deweyou-design/react/carousel`.\n\n**Composition**: `Carousel.Root` → `Carousel.ItemGroup` → `Carousel.Item`+; `Carousel.PrevTrigger`; `Carousel.NextTrigger`; `Carousel.IndicatorGroup` → `Carousel.Indicator`+.',
      },
    },
  },
};

export default meta;

const slideColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'];
const slideLabels = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4'];

const NavButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={{
      alignItems: 'center',
      background: 'color-mix(in srgb, var(--ui-color-surface) 80%, transparent)',
      border: '1px solid var(--ui-color-border)',
      borderRadius: '50%',
      color: 'var(--ui-color-text)',
      cursor: 'pointer',
      display: 'flex',
      fontSize: '1rem',
      height: '32px',
      justifyContent: 'center',
      width: '32px',
    }}
    type="button"
    {...props}
  >
    {children}
  </button>
);

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <div style={{ maxWidth: '480px', position: 'relative' }}>
      <Carousel.Root defaultIndex={0} loop>
        <Carousel.PrevTrigger>
          <NavButton aria-label="Previous slide">‹</NavButton>
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <NavButton aria-label="Next slide">›</NavButton>
        </Carousel.NextTrigger>
        <Carousel.ItemGroup>
          {slideColors.map((color, i) => (
            <Carousel.Item key={i} index={i}>
              <div
                style={{
                  alignItems: 'center',
                  background: color,
                  borderRadius: 'var(--ui-radius-float)',
                  color: '#fff',
                  display: 'flex',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  height: '240px',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                {slideLabels[i]}
              </div>
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup>
          {slideColors.map((_, i) => (
            <Carousel.Indicator key={i} index={i} />
          ))}
        </Carousel.IndicatorGroup>
      </Carousel.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          With loop
        </p>
        <div style={{ maxWidth: '480px', position: 'relative' }}>
          <Carousel.Root defaultIndex={0} loop>
            <Carousel.PrevTrigger>
              <NavButton aria-label="Previous slide">‹</NavButton>
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger>
              <NavButton aria-label="Next slide">›</NavButton>
            </Carousel.NextTrigger>
            <Carousel.ItemGroup>
              {slideColors.slice(0, 3).map((color, i) => (
                <Carousel.Item key={i} index={i}>
                  <div
                    style={{
                      alignItems: 'center',
                      background: color,
                      borderRadius: 'var(--ui-radius-float)',
                      color: '#fff',
                      display: 'flex',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      height: '180px',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    {slideLabels[i]}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
            <Carousel.IndicatorGroup>
              {[0, 1, 2].map((i) => (
                <Carousel.Indicator key={i} index={i} />
              ))}
            </Carousel.IndicatorGroup>
          </Carousel.Root>
        </div>
      </div>

      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Without loop
        </p>
        <div style={{ maxWidth: '480px', position: 'relative' }}>
          <Carousel.Root defaultIndex={0}>
            <Carousel.PrevTrigger>
              <NavButton aria-label="Previous slide">‹</NavButton>
            </Carousel.PrevTrigger>
            <Carousel.NextTrigger>
              <NavButton aria-label="Next slide">›</NavButton>
            </Carousel.NextTrigger>
            <Carousel.ItemGroup>
              {slideColors.slice(0, 3).map((color, i) => (
                <Carousel.Item key={i} index={i}>
                  <div
                    style={{
                      alignItems: 'center',
                      background: color,
                      borderRadius: 'var(--ui-radius-float)',
                      color: '#fff',
                      display: 'flex',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      height: '180px',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    {slideLabels[i]}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel.ItemGroup>
            <Carousel.IndicatorGroup>
              {[0, 1, 2].map((i) => (
                <Carousel.Indicator key={i} index={i} />
              ))}
            </Carousel.IndicatorGroup>
          </Carousel.Root>
        </div>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

const ControlledCarousel = () => {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <p
        style={{
          color: 'var(--ui-color-text)',
          fontSize: '0.75rem',
          marginBottom: '8px',
          opacity: 0.6,
        }}
      >
        Controlled — current index: {index}
      </p>
      <div style={{ maxWidth: '480px', position: 'relative' }}>
        <Carousel.Root index={index} onIndexChange={setIndex} loop>
          <Carousel.PrevTrigger>
            <NavButton aria-label="Previous slide">‹</NavButton>
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger>
            <NavButton aria-label="Next slide">›</NavButton>
          </Carousel.NextTrigger>
          <Carousel.ItemGroup>
            {slideColors.map((color, i) => (
              <Carousel.Item key={i} index={i}>
                <div
                  style={{
                    alignItems: 'center',
                    background: color,
                    borderRadius: 'var(--ui-radius-float)',
                    color: '#fff',
                    display: 'flex',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    height: '200px',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  {slideLabels[i]}
                </div>
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>
          <Carousel.IndicatorGroup>
            {slideColors.map((_, i) => (
              <Carousel.Indicator key={i} index={i} />
            ))}
          </Carousel.IndicatorGroup>
        </Carousel.Root>
      </div>
    </div>
  );
};

export const States: StoryObj = {
  name: 'States',
  render: () => <ControlledCarousel />,
};

// ---------------------------------------------------------------------------
// Story: Interaction (play function for e2e test)
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <div style={{ maxWidth: '480px', position: 'relative' }}>
      <Carousel.Root defaultIndex={0}>
        <Carousel.PrevTrigger>
          <NavButton aria-label="Previous slide">‹</NavButton>
        </Carousel.PrevTrigger>
        <Carousel.NextTrigger>
          <NavButton aria-label="Next slide" data-testid="next-trigger">
            ›
          </NavButton>
        </Carousel.NextTrigger>
        <Carousel.ItemGroup>
          <Carousel.Item index={0}>
            <div
              data-testid="slide-0"
              style={{
                background: '#6366f1',
                borderRadius: 'var(--ui-radius-float)',
                color: '#fff',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
                width: '100%',
              }}
            >
              Slide 1
            </div>
          </Carousel.Item>
          <Carousel.Item index={1}>
            <div
              data-testid="slide-1"
              style={{
                background: '#14b8a6',
                borderRadius: 'var(--ui-radius-float)',
                color: '#fff',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
                width: '100%',
              }}
            >
              Slide 2
            </div>
          </Carousel.Item>
        </Carousel.ItemGroup>
        <Carousel.IndicatorGroup>
          <Carousel.Indicator index={0} data-testid="indicator-0" />
          <Carousel.Indicator index={1} data-testid="indicator-1" />
        </Carousel.IndicatorGroup>
      </Carousel.Root>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Initially indicator 0 should be active (data-current attribute)
    const indicator0 = canvas.getByTestId('indicator-0');
    const indicator1 = canvas.getByTestId('indicator-1');
    expect(indicator0).toHaveAttribute('data-current');
    expect(indicator1).not.toHaveAttribute('data-current');

    // Click next trigger to advance to slide 2
    const nextBtn = canvas.getByTestId('next-trigger');
    await userEvent.click(nextBtn);

    // After advancing, indicator 1 should become active
    await waitFor(() => {
      expect(indicator1).toHaveAttribute('data-current');
      expect(indicator0).not.toHaveAttribute('data-current');
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  Carousel,
  type CarouselRootProps,
  type CarouselItemGroupProps,
  type CarouselItemProps,
  type CarouselPrevTriggerProps,
  type CarouselNextTriggerProps,
  type CarouselIndicatorGroupProps,
  type CarouselIndicatorProps,
} from './carousel/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/carousel/ apps/storybook/src/stories/Carousel.stories.tsx
git commit -m "feat(carousel): add Carousel component"
```

---

### Task 5: Pagination

**Files:**

- Create: `packages/react/src/pagination/index.tsx`
- Create: `packages/react/src/pagination/index.module.less`
- Create: `packages/react/src/pagination/index.test.tsx`
- Create: `apps/storybook/src/stories/Pagination.stories.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// packages/react/src/pagination/index.test.tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Pagination } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Pagination', () => {
  const renderPagination = (props?: Partial<Parameters<typeof Pagination.Root>[0]>) =>
    render(
      <Pagination.Root count={100} pageSize={10} defaultPage={1} {...props}>
        <Pagination.PrevTrigger>
          <button>Previous</button>
        </Pagination.PrevTrigger>
        {Array.from({ length: 10 }, (_, i) => (
          <Pagination.Item key={i + 1} value={i + 1} />
        ))}
        <Pagination.NextTrigger>
          <button>Next</button>
        </Pagination.NextTrigger>
      </Pagination.Root>,
    );

  it('renders prev and next trigger buttons', () => {
    renderPagination();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('renders compound components as functions', () => {
    expect(typeof Pagination.Root).toBe('function');
    expect(typeof Pagination.PrevTrigger).toBe('function');
    expect(typeof Pagination.NextTrigger).toBe('function');
    expect(typeof Pagination.Item).toBe('function');
  });

  it('current page item has data-current attribute', () => {
    renderPagination({ defaultPage: 3 });
    // Page 3 button should be marked as current
    const pageButtons = screen.getAllByRole('button').filter((btn) => btn.textContent === '3');
    expect(pageButtons.length).toBeGreaterThan(0);
    const currentBtn = pageButtons.find((btn) => btn.hasAttribute('data-current'));
    expect(currentBtn).toBeTruthy();
  });

  it('clicking next trigger does not throw', () => {
    renderPagination();
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(() => fireEvent.click(nextBtn)).not.toThrow();
  });

  it('calls onPageChange when page changes', () => {
    const onPageChange = vi.fn();
    renderPagination({ onPageChange, defaultPage: 1 });
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
```

> Note: Add `import { vi } from 'vite-plus/test';` to the imports in this test file.

- [ ] **Step 1 (corrected): Write failing test**

```tsx
// packages/react/src/pagination/index.test.tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { Pagination } from './index.tsx';

afterEach(() => {
  cleanup();
});

describe('Pagination', () => {
  const renderPagination = (props?: Partial<Parameters<typeof Pagination.Root>[0]>) =>
    render(
      <Pagination.Root count={100} pageSize={10} defaultPage={1} {...props}>
        <Pagination.PrevTrigger>
          <button>Previous</button>
        </Pagination.PrevTrigger>
        {Array.from({ length: 10 }, (_, i) => (
          <Pagination.Item key={i + 1} value={i + 1} />
        ))}
        <Pagination.NextTrigger>
          <button>Next</button>
        </Pagination.NextTrigger>
      </Pagination.Root>,
    );

  it('renders prev and next trigger buttons', () => {
    renderPagination();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('renders compound components as functions', () => {
    expect(typeof Pagination.Root).toBe('function');
    expect(typeof Pagination.PrevTrigger).toBe('function');
    expect(typeof Pagination.NextTrigger).toBe('function');
    expect(typeof Pagination.Item).toBe('function');
  });

  it('current page item has data-current attribute', () => {
    renderPagination({ defaultPage: 3 });
    const pageButtons = screen.getAllByRole('button').filter((btn) => btn.textContent === '3');
    expect(pageButtons.length).toBeGreaterThan(0);
    const currentBtn = pageButtons.find((btn) => btn.hasAttribute('data-current'));
    expect(currentBtn).toBeTruthy();
  });

  it('clicking next trigger does not throw', () => {
    renderPagination();
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    expect(() => fireEvent.click(nextBtn)).not.toThrow();
  });

  it('calls onPageChange when page changes', () => {
    const onPageChange = vi.fn();
    renderPagination({ onPageChange, defaultPage: 1 });
    const nextBtn = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/pagination/index.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/pagination/index.tsx
import { type CSSProperties, type ReactNode } from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react/pagination';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// PaginationRoot
// ---------------------------------------------------------------------------

export type PaginationRootProps = {
  /** Total number of items across all pages. Required. */
  count: number;
  /** Controlled current page (1-based). Use with `onPageChange`. */
  page?: number;
  /** Initial page for uncontrolled usage. @default 1 */
  defaultPage?: number;
  /** Number of items per page. @default 10 */
  pageSize?: number;
  /** Callback fired when the page changes. Receives the new 1-based page number. */
  onPageChange?: (page: number) => void;
  /** Content of the pagination compound. */
  children: ReactNode;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline style overrides for the root element. */
  style?: CSSProperties;
};

const PaginationRoot = ({
  count,
  page,
  defaultPage = 1,
  pageSize = 10,
  onPageChange,
  children,
  className,
  style,
}: PaginationRootProps) => (
  <ArkPagination.Root
    className={classNames(styles.root, className)}
    count={count}
    defaultPage={defaultPage}
    onPageChange={onPageChange ? ({ page: p }) => onPageChange(p) : undefined}
    page={page}
    pageSize={pageSize}
    style={style}
  >
    {children}
  </ArkPagination.Root>
);

// ---------------------------------------------------------------------------
// PaginationPrevTrigger
// ---------------------------------------------------------------------------

export type PaginationPrevTriggerProps = {
  /** The element rendered as the previous-page button. */
  children: ReactNode;
  /** Additional CSS class applied to the prev trigger element. */
  className?: string;
  /** Inline style overrides for the prev trigger element. */
  style?: CSSProperties;
};

const PaginationPrevTrigger = ({ children, className, style }: PaginationPrevTriggerProps) => (
  <ArkPagination.PrevTrigger
    asChild
    className={classNames(styles.navTrigger, className)}
    style={style}
  >
    {children}
  </ArkPagination.PrevTrigger>
);

// ---------------------------------------------------------------------------
// PaginationNextTrigger
// ---------------------------------------------------------------------------

export type PaginationNextTriggerProps = {
  /** The element rendered as the next-page button. */
  children: ReactNode;
  /** Additional CSS class applied to the next trigger element. */
  className?: string;
  /** Inline style overrides for the next trigger element. */
  style?: CSSProperties;
};

const PaginationNextTrigger = ({ children, className, style }: PaginationNextTriggerProps) => (
  <ArkPagination.NextTrigger
    asChild
    className={classNames(styles.navTrigger, className)}
    style={style}
  >
    {children}
  </ArkPagination.NextTrigger>
);

// ---------------------------------------------------------------------------
// PaginationItem
// ---------------------------------------------------------------------------

export type PaginationItemProps = {
  /** The 1-based page number this button represents. */
  value: number;
  /** Additional CSS class applied to the page button. */
  className?: string;
  /** Inline style overrides for the page button. */
  style?: CSSProperties;
};

const PaginationItem = ({ value, className, style }: PaginationItemProps) => (
  <ArkPagination.Item className={classNames(styles.item, className)} style={style} value={value}>
    {value}
  </ArkPagination.Item>
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Pagination = {
  Root: PaginationRoot,
  PrevTrigger: PaginationPrevTrigger,
  NextTrigger: PaginationNextTrigger,
  Item: PaginationItem,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/pagination/index.module.less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Root — flex row of page buttons
// ---------------------------------------------------------------------------

.root {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// ---------------------------------------------------------------------------
// Shared base for page items and nav triggers
// ---------------------------------------------------------------------------

.item,
.navTrigger {
  align-items: center;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--ui-radius-float);
  color: var(--ui-color-text);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.875rem;
  height: 2rem;
  justify-content: center;
  min-width: 2rem;
  padding: 0 6px;
  transition:
    background 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
  user-select: none;

  &:hover:not([disabled]):not([data-disabled]) {
    background: color-mix(in srgb, var(--ui-color-text) 6%, transparent);
    border-color: var(--ui-color-border);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-brand-bg);
    outline-offset: 2px;
  }

  &[disabled],
  &[data-disabled] {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

// ---------------------------------------------------------------------------
// Active page item — filled style
// ---------------------------------------------------------------------------

.item[data-current] {
  background: var(--ui-color-brand-bg);
  border-color: var(--ui-color-brand-bg);
  color: var(--ui-color-brand-text, #fff);
  font-weight: 600;

  &:hover {
    background: var(--ui-color-brand-bg);
    border-color: var(--ui-color-brand-bg);
  }
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/pagination/index.test.tsx`
Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Pagination.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Pagination } from '@deweyou-design/react/pagination';

const meta: Meta = {
  title: 'Components/Pagination',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pagination provides page navigation controls for paginated data sets. Built on Ark UI for state management and ARIA semantics. Import from `@deweyou-design/react/pagination`.\n\n**Composition**: `Pagination.Root` → `Pagination.PrevTrigger` + `Pagination.Item`+ + `Pagination.NextTrigger`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ChevronLeft = () => (
  <svg aria-hidden fill="none" height="1em" viewBox="0 0 24 24" width="1em">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
);

const ChevronRight = () => (
  <svg aria-hidden fill="none" height="1em" viewBox="0 0 24 24" width="1em">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
);

const NavBtn = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={{
      alignItems: 'center',
      background: 'none',
      border: '1px solid var(--ui-color-border)',
      borderRadius: 'var(--ui-radius-float)',
      color: 'var(--ui-color-text)',
      cursor: 'pointer',
      display: 'inline-flex',
      fontSize: '0.875rem',
      gap: '4px',
      height: '2rem',
      justifyContent: 'center',
      minWidth: '2rem',
      padding: '0 8px',
    }}
    type="button"
    {...props}
  >
    {children}
  </button>
);

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  name: 'Default',
  render: () => (
    <Pagination.Root count={100} defaultPage={1} pageSize={10}>
      <Pagination.PrevTrigger>
        <NavBtn aria-label="Previous page">
          <ChevronLeft />
        </NavBtn>
      </Pagination.PrevTrigger>
      {Array.from({ length: 10 }, (_, i) => (
        <Pagination.Item key={i + 1} value={i + 1} />
      ))}
      <Pagination.NextTrigger>
        <NavBtn aria-label="Next page">
          <ChevronRight />
        </NavBtn>
      </Pagination.NextTrigger>
    </Pagination.Root>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          5 pages
        </p>
        <Pagination.Root count={50} defaultPage={1} pageSize={10}>
          <Pagination.PrevTrigger>
            <NavBtn aria-label="Previous page">
              <ChevronLeft />
            </NavBtn>
          </Pagination.PrevTrigger>
          {Array.from({ length: 5 }, (_, i) => (
            <Pagination.Item key={i + 1} value={i + 1} />
          ))}
          <Pagination.NextTrigger>
            <NavBtn aria-label="Next page">
              <ChevronRight />
            </NavBtn>
          </Pagination.NextTrigger>
        </Pagination.Root>
      </div>

      <div>
        <p
          style={{
            color: 'var(--ui-color-text)',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.6,
          }}
        >
          Middle page active
        </p>
        <Pagination.Root count={100} defaultPage={5} pageSize={10}>
          <Pagination.PrevTrigger>
            <NavBtn aria-label="Previous page">
              <ChevronLeft />
            </NavBtn>
          </Pagination.PrevTrigger>
          {Array.from({ length: 10 }, (_, i) => (
            <Pagination.Item key={i + 1} value={i + 1} />
          ))}
          <Pagination.NextTrigger>
            <NavBtn aria-label="Next page">
              <ChevronRight />
            </NavBtn>
          </Pagination.NextTrigger>
        </Pagination.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States (controlled)
// ---------------------------------------------------------------------------

const ControlledPagination = () => {
  const [page, setPage] = useState(1);
  const totalPages = 8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <p style={{ color: 'var(--ui-color-text)', fontSize: '0.875rem', margin: 0 }}>
        Current page: <strong>{page}</strong> of {totalPages}
      </p>
      <Pagination.Root count={totalPages * 10} page={page} pageSize={10} onPageChange={setPage}>
        <Pagination.PrevTrigger>
          <NavBtn aria-label="Previous page">
            <ChevronLeft />
          </NavBtn>
        </Pagination.PrevTrigger>
        {Array.from({ length: totalPages }, (_, i) => (
          <Pagination.Item key={i + 1} value={i + 1} />
        ))}
        <Pagination.NextTrigger>
          <NavBtn aria-label="Next page">
            <ChevronRight />
          </NavBtn>
        </Pagination.NextTrigger>
      </Pagination.Root>
    </div>
  );
};

export const States: StoryObj = {
  name: 'States',
  render: () => <ControlledPagination />,
};

// ---------------------------------------------------------------------------
// Story: Interaction (play function for e2e test)
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Pagination.Root count={50} defaultPage={1} pageSize={10}>
      <Pagination.PrevTrigger>
        <NavBtn aria-label="Previous page" data-testid="prev-btn">
          <ChevronLeft />
        </NavBtn>
      </Pagination.PrevTrigger>
      {Array.from({ length: 5 }, (_, i) => (
        <Pagination.Item key={i + 1} value={i + 1} />
      ))}
      <Pagination.NextTrigger>
        <NavBtn aria-label="Next page" data-testid="next-btn">
          <ChevronRight />
        </NavBtn>
      </Pagination.NextTrigger>
    </Pagination.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Page 1 should be active initially
    const pageButtons = canvas
      .getAllByRole('button')
      .filter((btn) => btn.textContent && /^\d+$/.test(btn.textContent.trim()));
    const page1Btn = pageButtons.find((btn) => btn.textContent?.trim() === '1');
    expect(page1Btn).toHaveAttribute('data-current');

    // Click next to go to page 2
    const nextBtn = canvas.getByTestId('next-btn');
    await userEvent.click(nextBtn);

    await waitFor(() => {
      const updatedPageBtns = canvas
        .getAllByRole('button')
        .filter((btn) => btn.textContent && /^\d+$/.test(btn.textContent.trim()));
      const page2Btn = updatedPageBtns.find((btn) => btn.textContent?.trim() === '2');
      expect(page2Btn).toHaveAttribute('data-current');
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  Pagination,
  type PaginationRootProps,
  type PaginationPrevTriggerProps,
  type PaginationNextTriggerProps,
  type PaginationItemProps,
} from './pagination/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/pagination/ apps/storybook/src/stories/Pagination.stories.tsx
git commit -m "feat(pagination): add Pagination component"
```
