# Phase 3a: Ark UI Form Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 interactive form components (Checkbox, RadioGroup, Switch, Select, Dialog) backed by Ark UI.

**Architecture:** Ark UI handles behavior (state machine, ARIA, focus management). Public API is a clean Compound or flat pattern without exposing Ark UI types. All styles via Less CSS Modules using semantic design tokens.

**Tech Stack:** React 19, TypeScript 5.x, Less CSS Modules, @ark-ui/react, Vitest (`vp test`), Storybook

**Prerequisite:** Install Ark UI MCP Server before starting:

```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

---

### Task 1: Checkbox

**Files:**

- Create: `packages/react/src/checkbox/index.tsx`
- Create: `packages/react/src/checkbox/index.module.less`
- Create: `packages/react/src/checkbox/index.test.tsx`
- Create: `apps/storybook/src/stories/Checkbox.stories.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/react/src/checkbox/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Checkbox } from './index.tsx';

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

describe('Checkbox — default render', () => {
  it('renders a checkbox with accessible role', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDefined();
  });

  it('renders label text when children provided', () => {
    render(<Checkbox>Accept terms</Checkbox>);
    expect(screen.getByText('Accept terms')).toBeDefined();
  });

  it('accepts className and style props', () => {
    render(
      <Checkbox className="custom-class" style={{ color: 'red' }}>
        Label
      </Checkbox>,
    );
    expect(screen.getByText('Label')).toBeDefined();
  });
});

describe('Checkbox — onCheckedChange', () => {
  it('fires onCheckedChange with true when clicked from unchecked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox defaultChecked={false} onCheckedChange={onCheckedChange}>
        Toggle me
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  it('fires onCheckedChange with false when clicked from checked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox defaultChecked={true} onCheckedChange={onCheckedChange}>
        Toggle me
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('Checkbox — disabled state', () => {
  it('has aria-disabled when disabled', () => {
    render(<Checkbox disabled>Disabled</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-disabled')).toBe('true');
  });

  it('does not fire onCheckedChange when disabled and clicked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox disabled onCheckedChange={onCheckedChange}>
        Disabled
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    await waitFor(() => {
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });
});

describe('Checkbox — indeterminate state', () => {
  it('reflects indeterminate in aria-checked', () => {
    render(<Checkbox indeterminate>Indeterminate</Checkbox>);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/checkbox/index.test.tsx`

Expected: FAIL — module not found (`Cannot find module './index.tsx'`)

- [ ] **Step 3: Implement component (index.tsx)**

Create `packages/react/src/checkbox/index.tsx`:

```tsx
import { type CSSProperties, type ReactNode } from 'react';
import {
  CheckboxRoot as ArkCheckboxRoot,
  CheckboxControl as ArkCheckboxControl,
  CheckboxIndicator as ArkCheckboxIndicator,
  CheckboxLabel as ArkCheckboxLabel,
  CheckboxHiddenInput as ArkCheckboxHiddenInput,
} from '@ark-ui/react/checkbox';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Inline SVG checkmark icon
// ---------------------------------------------------------------------------

const CheckmarkSvg = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="square" d="M3 8.5L6.5 12L13 5" />
  </svg>
);

const IndeterminateSvg = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="square" d="M3 8H13" />
  </svg>
);

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type CheckboxProps = {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Callback fired when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** When true, the checkbox is non-interactive. */
  disabled?: boolean;
  /** When true, the checkbox displays an indeterminate (mixed) state. */
  indeterminate?: boolean;
  /** Label rendered next to the control. */
  children?: ReactNode;
  /** HTML name attribute forwarded to the hidden input. */
  name?: string;
  /** HTML value attribute forwarded to the hidden input. */
  value?: string;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
};

// ---------------------------------------------------------------------------
// Checkbox component
// ---------------------------------------------------------------------------

export const Checkbox = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  indeterminate,
  children,
  name,
  value,
  className,
  style,
}: CheckboxProps) => {
  const handleCheckedChange = (details: { checked: boolean | 'indeterminate' }) => {
    if (typeof details.checked === 'boolean') {
      onCheckedChange?.(details.checked);
    }
  };

  return (
    <ArkCheckboxRoot
      checked={indeterminate ? 'indeterminate' : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
      className={classNames(styles.root, className)}
      style={style}
    >
      <ArkCheckboxHiddenInput />
      <ArkCheckboxControl className={styles.control}>
        <ArkCheckboxIndicator className={styles.indicator}>
          {indeterminate ? <IndeterminateSvg /> : <CheckmarkSvg />}
        </ArkCheckboxIndicator>
      </ArkCheckboxControl>
      {children !== undefined && (
        <ArkCheckboxLabel className={styles.label}>{children}</ArkCheckboxLabel>
      )}
    </ArkCheckboxRoot>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

Create `packages/react/src/checkbox/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Root — flex row, inline by default
// ---------------------------------------------------------------------------

.root {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: 0.5rem;
  position: relative;
  user-select: none;
}

.root[data-disabled] {
  cursor: not-allowed;
  opacity: 0.56;
}

// ---------------------------------------------------------------------------
// Control — the visible square box
// ---------------------------------------------------------------------------

.control {
  align-items: center;
  background: var(--ui-color-canvas);
  border: 1.5px solid var(--ui-color-border);
  border-radius: var(--ui-radius-rect);
  display: inline-flex;
  flex-shrink: 0;
  height: 1rem;
  justify-content: center;
  transition:
    background 140ms ease,
    border-color 140ms ease;
  width: 1rem;
}

// Checked and indeterminate: brand fill
.root[data-state='checked'] .control,
.root[data-state='indeterminate'] .control {
  background: var(--ui-color-brand-bg);
  border-color: var(--ui-color-brand-bg);
}

// Focus ring
.root:focus-within .control {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}

// ---------------------------------------------------------------------------
// Indicator — checkmark / dash icon
// ---------------------------------------------------------------------------

.indicator {
  align-items: center;
  color: var(--ui-color-canvas);
  display: none;
  font-size: 0.75rem;
  justify-content: center;
  line-height: 1;
}

.root[data-state='checked'] .indicator,
.root[data-state='indeterminate'] .indicator {
  display: inline-flex;
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

.label {
  color: var(--ui-color-text);
  font-size: 0.875rem;
  line-height: 1.4;
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/checkbox/index.test.tsx`

Expected: PASS (all 8 test cases green)

- [ ] **Step 6: Create Storybook story**

Create `apps/storybook/src/stories/Checkbox.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Checkbox } from '@deweyou-design/react/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      description: 'Controlled checked state.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean | undefined' } },
    },
    defaultChecked: {
      description: 'Initial checked state for uncontrolled usage.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    onCheckedChange: {
      description: 'Callback fired when the checked state changes.',
      control: false,
      table: { type: { summary: '(checked: boolean) => void' } },
    },
    disabled: {
      description: 'When true, the checkbox is non-interactive.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    indeterminate: {
      description: 'When true, displays an indeterminate (mixed) state.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    children: {
      description: 'Label text rendered next to the control.',
      control: { type: 'text' },
      table: { type: { summary: 'ReactNode' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox is a form control for boolean or tri-state (indeterminate) selection. Built on Ark UI for ARIA semantics and keyboard accessibility. Import from `@deweyou-design/react/checkbox`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Checkbox>Subscribe to newsletter</Checkbox>
      <Checkbox defaultChecked>Accept terms and conditions</Checkbox>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants (with and without label)
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Checkbox />
        <Checkbox defaultChecked />
        <Checkbox indeterminate />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Checkbox>Unchecked with label</Checkbox>
        <Checkbox defaultChecked>Checked with label</Checkbox>
        <Checkbox indeterminate>Indeterminate with label</Checkbox>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox>Default (unchecked)</Checkbox>
      <Checkbox defaultChecked>Default (checked)</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox disabled>Disabled (unchecked)</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled (checked)
      </Checkbox>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Controlled
// ---------------------------------------------------------------------------

const ControlledDemo = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Checkbox checked={checked} onCheckedChange={setChecked}>
        Controlled: {checked ? 'ON' : 'OFF'}
      </Checkbox>
      <button onClick={() => setChecked((v) => !v)} style={{ alignSelf: 'flex-start' }}>
        Toggle externally
      </button>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledDemo />,
};

// ---------------------------------------------------------------------------
// Story: Interaction
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <Checkbox data-testid="cb">Click to toggle</Checkbox>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-I-01: checkbox is present and visible in unchecked state
    const checkbox = canvas.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.getAttribute('aria-checked')).toBe('false');

    // E2E-I-02: click toggles to checked
    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox.getAttribute('aria-checked')).toBe('true');
    });

    // E2E-I-02: click again toggles back to unchecked
    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox.getAttribute('aria-checked')).toBe('false');
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export { Checkbox, type CheckboxProps } from './checkbox/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/checkbox/ apps/storybook/src/stories/Checkbox.stories.tsx
git commit -m "feat(checkbox): add Checkbox component"
```

---

### Task 2: RadioGroup

**Files:**

- Create: `packages/react/src/radio-group/index.tsx`
- Create: `packages/react/src/radio-group/index.module.less`
- Create: `packages/react/src/radio-group/index.test.tsx`
- Create: `apps/storybook/src/stories/RadioGroup.stories.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/react/src/radio-group/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { RadioGroup } from './index.tsx';

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

describe('RadioGroup — default render', () => {
  it('renders a radiogroup with accessible role', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(screen.getByRole('radiogroup')).toBeDefined();
  });

  it('renders all radio items', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('renders item labels', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    expect(screen.getByText('Option A')).toBeDefined();
  });
});

describe('RadioGroup — onValueChange', () => {
  it('fires onValueChange with the selected value when an item is clicked', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup.Root onValueChange={onValueChange}>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[1]);
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('b');
    });
  });
});

describe('RadioGroup — disabled state', () => {
  it('root disabled: all items have aria-disabled', () => {
    render(
      <RadioGroup.Root disabled>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio.getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('item-level disabled: only that item has aria-disabled', () => {
    render(
      <RadioGroup.Root>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b" disabled>
          Option B
        </RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0].getAttribute('aria-disabled')).not.toBe('true');
    expect(radios[1].getAttribute('aria-disabled')).toBe('true');
  });
});

describe('RadioGroup — value state', () => {
  it('controlled value: selected item has aria-checked true', () => {
    render(
      <RadioGroup.Root value="b">
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      </RadioGroup.Root>,
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0].getAttribute('aria-checked')).toBe('false');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/radio-group/index.test.tsx`

Expected: FAIL — module not found (`Cannot find module './index.tsx'`)

- [ ] **Step 3: Implement component (index.tsx)**

Create `packages/react/src/radio-group/index.tsx`:

```tsx
import { type CSSProperties, type ReactNode } from 'react';
import {
  RadioGroupRoot as ArkRadioGroupRoot,
  RadioGroupItem as ArkRadioGroupItem,
  RadioGroupItemControl as ArkRadioGroupItemControl,
  RadioGroupItemText as ArkRadioGroupItemText,
  RadioGroupItemHiddenInput as ArkRadioGroupItemHiddenInput,
} from '@ark-ui/react/radio-group';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type RadioGroupRootProps = {
  /** Controlled selected value. */
  value?: string;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the selected value changes. */
  onValueChange?: (value: string) => void;
  /** When true, all items in the group are non-interactive. */
  disabled?: boolean;
  /** Layout direction of the radio items. */
  orientation?: 'horizontal' | 'vertical';
  /** Radio items to render inside the group. */
  children: ReactNode;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
};

export type RadioGroupItemProps = {
  /** The value this item represents. */
  value: string;
  /** When true, this item is non-interactive. */
  disabled?: boolean;
  /** Label rendered next to the item control. */
  children?: ReactNode;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline styles applied to the item element. */
  style?: CSSProperties;
};

// ---------------------------------------------------------------------------
// RadioGroupRoot
// ---------------------------------------------------------------------------

const RadioGroupRoot = ({
  value,
  defaultValue,
  onValueChange,
  disabled,
  orientation = 'vertical',
  children,
  className,
  style,
}: RadioGroupRootProps) => {
  const handleValueChange = (details: { value: string }) => {
    onValueChange?.(details.value);
  };

  return (
    <ArkRadioGroupRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      orientation={orientation}
      className={classNames(
        styles.root,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        className,
      )}
      style={style}
    >
      {children}
    </ArkRadioGroupRoot>
  );
};

// ---------------------------------------------------------------------------
// RadioGroupItem
// ---------------------------------------------------------------------------

const RadioGroupItem = ({ value, disabled, children, className, style }: RadioGroupItemProps) => (
  <ArkRadioGroupItem
    value={value}
    disabled={disabled}
    className={classNames(styles.item, className)}
    style={style}
  >
    <ArkRadioGroupItemHiddenInput />
    <ArkRadioGroupItemControl className={styles.control} />
    {children !== undefined && (
      <ArkRadioGroupItemText className={styles.itemText}>{children}</ArkRadioGroupItemText>
    )}
  </ArkRadioGroupItem>
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const RadioGroup = {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

Create `packages/react/src/radio-group/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Root — flex container
// ---------------------------------------------------------------------------

.root {
  display: flex;
}

.vertical {
  flex-direction: column;
  gap: 0.625rem;
}

.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

// ---------------------------------------------------------------------------
// Item — each radio option row
// ---------------------------------------------------------------------------

.item {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: 0.5rem;
  user-select: none;
}

.item[data-disabled] {
  cursor: not-allowed;
  opacity: 0.56;
}

// ---------------------------------------------------------------------------
// Control — the visible circle
// ---------------------------------------------------------------------------

.control {
  align-items: center;
  background: var(--ui-color-canvas);
  border: 1.5px solid var(--ui-color-border);
  border-radius: 50%;
  display: inline-flex;
  flex-shrink: 0;
  height: 1rem;
  justify-content: center;
  position: relative;
  transition:
    background 140ms ease,
    border-color 140ms ease;
  width: 1rem;
}

// Selected: filled inner dot
.item[data-state='checked'] .control {
  border-color: var(--ui-color-brand-bg);
}

.item[data-state='checked'] .control::after {
  background: var(--ui-color-brand-bg);
  border-radius: 50%;
  content: '';
  height: 0.4375rem;
  position: absolute;
  width: 0.4375rem;
}

// Focus ring
.item:focus-within .control {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}

// ---------------------------------------------------------------------------
// Item text / label
// ---------------------------------------------------------------------------

.itemText {
  color: var(--ui-color-text);
  font-size: 0.875rem;
  line-height: 1.4;
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/radio-group/index.test.tsx`

Expected: PASS (all 6 test cases green)

- [ ] **Step 6: Create Storybook story**

Create `apps/storybook/src/stories/RadioGroup.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RadioGroup } from '@deweyou-design/react/radio-group';

const meta: Meta = {
  title: 'Components/RadioGroup',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'RadioGroup allows users to select one option from a set. Built on Ark UI for ARIA semantics, keyboard navigation, and focus management. Compose with `RadioGroup.Root` and `RadioGroup.Item`. Import from `@deweyou-design/react/radio-group`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => (
    <RadioGroup.Root defaultValue="b">
      <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      <RadioGroup.Item value="c">Option C</RadioGroup.Item>
    </RadioGroup.Root>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants (vertical and horizontal)
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Vertical (default)
        </p>
        <RadioGroup.Root defaultValue="a">
          <RadioGroup.Item value="a">Apple</RadioGroup.Item>
          <RadioGroup.Item value="b">Banana</RadioGroup.Item>
          <RadioGroup.Item value="c">Cherry</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Horizontal
        </p>
        <RadioGroup.Root defaultValue="a" orientation="horizontal">
          <RadioGroup.Item value="a">Apple</RadioGroup.Item>
          <RadioGroup.Item value="b">Banana</RadioGroup.Item>
          <RadioGroup.Item value="c">Cherry</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Default
        </p>
        <RadioGroup.Root>
          <RadioGroup.Item value="a">Option A</RadioGroup.Item>
          <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Disabled (group)
        </p>
        <RadioGroup.Root disabled defaultValue="a">
          <RadioGroup.Item value="a">Option A</RadioGroup.Item>
          <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        </RadioGroup.Root>
      </div>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Partially disabled
        </p>
        <RadioGroup.Root defaultValue="a">
          <RadioGroup.Item value="a">Option A</RadioGroup.Item>
          <RadioGroup.Item value="b" disabled>
            Option B (disabled)
          </RadioGroup.Item>
        </RadioGroup.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Controlled
// ---------------------------------------------------------------------------

const ControlledDemo = () => {
  const [value, setValue] = useState('a');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <RadioGroup.Root value={value} onValueChange={setValue}>
        <RadioGroup.Item value="a">Option A</RadioGroup.Item>
        <RadioGroup.Item value="b">Option B</RadioGroup.Item>
        <RadioGroup.Item value="c">Option C</RadioGroup.Item>
      </RadioGroup.Root>
      <p style={{ fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
        Selected: <strong>{value}</strong>
      </p>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledDemo />,
};

// ---------------------------------------------------------------------------
// Story: Interaction
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <RadioGroup.Root defaultValue="a">
      <RadioGroup.Item value="a">Option A</RadioGroup.Item>
      <RadioGroup.Item value="b">Option B</RadioGroup.Item>
      <RadioGroup.Item value="c">Option C</RadioGroup.Item>
    </RadioGroup.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-I-01: radiogroup is present
    const group = canvas.getByRole('radiogroup');
    expect(group).toBeInTheDocument();

    // E2E-I-01: first option is initially selected
    const radios = canvas.getAllByRole('radio');
    expect(radios[0].getAttribute('aria-checked')).toBe('true');
    expect(radios[1].getAttribute('aria-checked')).toBe('false');

    // E2E-I-02: click second item — it becomes selected, first deselected
    await userEvent.click(radios[1]);
    await waitFor(() => {
      expect(radios[1].getAttribute('aria-checked')).toBe('true');
      expect(radios[0].getAttribute('aria-checked')).toBe('false');
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  RadioGroup,
  type RadioGroupRootProps,
  type RadioGroupItemProps,
} from './radio-group/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/radio-group/ apps/storybook/src/stories/RadioGroup.stories.tsx
git commit -m "feat(radio-group): add RadioGroup component"
```

---

### Task 3: Switch

**Files:**

- Create: `packages/react/src/switch/index.tsx`
- Create: `packages/react/src/switch/index.module.less`
- Create: `packages/react/src/switch/index.test.tsx`
- Create: `apps/storybook/src/stories/Switch.stories.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/react/src/switch/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Switch } from './index.tsx';

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

describe('Switch — default render', () => {
  it('renders a switch with accessible role', () => {
    render(<Switch>Notifications</Switch>);
    const sw = screen.getByRole('switch');
    expect(sw).toBeDefined();
  });

  it('renders label text when children provided', () => {
    render(<Switch>Notifications</Switch>);
    expect(screen.getByText('Notifications')).toBeDefined();
  });

  it('starts unchecked by default', () => {
    render(<Switch>Toggle</Switch>);
    const sw = screen.getByRole('switch');
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });
});

describe('Switch — toggle callback', () => {
  it('fires onCheckedChange with true when toggled on', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch defaultChecked={false} onCheckedChange={onCheckedChange}>
        Toggle
      </Switch>,
    );
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  it('fires onCheckedChange with false when toggled off', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch defaultChecked={true} onCheckedChange={onCheckedChange}>
        Toggle
      </Switch>,
    );
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    await waitFor(() => {
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('Switch — disabled state', () => {
  it('has aria-disabled when disabled', () => {
    render(<Switch disabled>Disabled switch</Switch>);
    const sw = screen.getByRole('switch');
    expect(sw.getAttribute('aria-disabled')).toBe('true');
  });

  it('does not fire onCheckedChange when disabled and clicked', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch disabled onCheckedChange={onCheckedChange}>
        Disabled
      </Switch>,
    );
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    await waitFor(() => {
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/switch/index.test.tsx`

Expected: FAIL — module not found (`Cannot find module './index.tsx'`)

- [ ] **Step 3: Implement component (index.tsx)**

Create `packages/react/src/switch/index.tsx`:

```tsx
import { type CSSProperties, type ReactNode } from 'react';
import {
  SwitchRoot as ArkSwitchRoot,
  SwitchControl as ArkSwitchControl,
  SwitchThumb as ArkSwitchThumb,
  SwitchLabel as ArkSwitchLabel,
  SwitchHiddenInput as ArkSwitchHiddenInput,
} from '@ark-ui/react/switch';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SwitchProps = {
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Callback fired when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** When true, the switch is non-interactive. */
  disabled?: boolean;
  /** Label rendered next to the track. */
  children?: ReactNode;
  /** HTML name attribute forwarded to the hidden input. */
  name?: string;
  /** HTML value attribute forwarded to the hidden input. */
  value?: string;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
};

// ---------------------------------------------------------------------------
// Switch component
// ---------------------------------------------------------------------------

export const Switch = ({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  children,
  name,
  value,
  className,
  style,
}: SwitchProps) => {
  const handleCheckedChange = (details: { checked: boolean }) => {
    onCheckedChange?.(details.checked);
  };

  return (
    <ArkSwitchRoot
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
      className={classNames(styles.root, className)}
      style={style}
    >
      <ArkSwitchHiddenInput />
      <ArkSwitchControl className={styles.control}>
        <ArkSwitchThumb className={styles.thumb} />
      </ArkSwitchControl>
      {children !== undefined && (
        <ArkSwitchLabel className={styles.label}>{children}</ArkSwitchLabel>
      )}
    </ArkSwitchRoot>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

Create `packages/react/src/switch/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

// Local variables
@switch-track-width: 2.25rem;
@switch-track-height: 1.25rem;
@switch-thumb-size: 1rem;
@switch-thumb-offset: 0.125rem;
@switch-thumb-travel: calc(@switch-track-width - @switch-thumb-size - @switch-thumb-offset * 2);

// ---------------------------------------------------------------------------
// Root — flex row, inline
// ---------------------------------------------------------------------------

.root {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: 0.5rem;
  user-select: none;
}

.root[data-disabled] {
  cursor: not-allowed;
  opacity: 0.56;
}

// ---------------------------------------------------------------------------
// Control — the track
// ---------------------------------------------------------------------------

.control {
  background: var(--ui-color-border);
  border-radius: var(--ui-radius-pill);
  display: inline-flex;
  flex-shrink: 0;
  height: @switch-track-height;
  padding: @switch-thumb-offset;
  position: relative;
  transition: background 160ms ease;
  width: @switch-track-width;
}

// Checked: brand fill
.root[data-state='checked'] .control {
  background: var(--ui-color-brand-bg);
}

// Focus ring
.root:focus-within .control {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}

// ---------------------------------------------------------------------------
// Thumb — the sliding circle
// ---------------------------------------------------------------------------

.thumb {
  background: var(--ui-color-canvas);
  border-radius: 50%;
  flex-shrink: 0;
  height: @switch-thumb-size;
  transform: translateX(0);
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
  width: @switch-thumb-size;
}

.root[data-state='checked'] .thumb {
  transform: translateX(@switch-thumb-travel);
}

@media (prefers-reduced-motion: reduce) {
  .thumb {
    transition: none;
  }
  .control {
    transition: none;
  }
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

.label {
  color: var(--ui-color-text);
  font-size: 0.875rem;
  line-height: 1.4;
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/switch/index.test.tsx`

Expected: PASS (all 7 test cases green)

- [ ] **Step 6: Create Storybook story**

Create `apps/storybook/src/stories/Switch.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Switch } from '@deweyou-design/react/switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      description: 'Controlled checked state.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean | undefined' } },
    },
    defaultChecked: {
      description: 'Initial checked state for uncontrolled usage.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    onCheckedChange: {
      description: 'Callback fired when the checked state changes.',
      control: false,
      table: { type: { summary: '(checked: boolean) => void' } },
    },
    disabled: {
      description: 'When true, the switch is non-interactive.',
      control: { type: 'boolean' },
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    children: {
      description: 'Label text rendered next to the track.',
      control: { type: 'text' },
      table: { type: { summary: 'ReactNode' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Switch is a toggle control for binary on/off states. The animated thumb slides within a pill-shaped track. Built on Ark UI for ARIA `role="switch"` and keyboard accessibility. Import from `@deweyou-design/react/switch`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch>Enable notifications</Switch>
      <Switch defaultChecked>Dark mode</Switch>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch>Without label off</Switch>
      <Switch defaultChecked>Without label on</Switch>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Switch>Off (default)</Switch>
      <Switch defaultChecked>On</Switch>
      <Switch disabled>Disabled off</Switch>
      <Switch disabled defaultChecked>
        Disabled on
      </Switch>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Controlled
// ---------------------------------------------------------------------------

const ControlledDemo = () => {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Switch checked={checked} onCheckedChange={setChecked}>
        Feature flag: {checked ? 'Enabled' : 'Disabled'}
      </Switch>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledDemo />,
};

// ---------------------------------------------------------------------------
// Story: Interaction
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => <Switch>Toggle me</Switch>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-I-01: switch is present in unchecked state
    const sw = canvas.getByRole('switch');
    expect(sw).toBeInTheDocument();
    expect(sw.getAttribute('aria-checked')).toBe('false');

    // E2E-I-02: click toggles to checked
    await userEvent.click(sw);
    await waitFor(() => {
      expect(sw.getAttribute('aria-checked')).toBe('true');
    });

    // E2E-I-02: click again toggles back to unchecked
    await userEvent.click(sw);
    await waitFor(() => {
      expect(sw.getAttribute('aria-checked')).toBe('false');
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export { Switch, type SwitchProps } from './switch/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/switch/ apps/storybook/src/stories/Switch.stories.tsx
git commit -m "feat(switch): add Switch component"
```

---

### Task 4: Select

**Files:**

- Create: `packages/react/src/select/index.tsx`
- Create: `packages/react/src/select/index.module.less`
- Create: `packages/react/src/select/index.test.tsx`
- Create: `apps/storybook/src/stories/Select.stories.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/react/src/select/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Select } from './index.tsx';

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

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Select — default render', () => {
  it('renders a combobox trigger button', () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDefined();
  });

  it('shows placeholder when no value is selected', () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.getByText('Pick a fruit')).toBeDefined();
  });

  it('content is initially hidden', () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Select — open behavior', () => {
  it('opens the listbox when trigger is clicked', async () => {
    render(
      <Select.Root placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeDefined();
    });
  });
});

describe('Select — onValueChange', () => {
  it('fires onValueChange with the selected value array when an item is clicked', async () => {
    const onValueChange = vi.fn();
    render(
      <Select.Root placeholder="Pick a fruit" onValueChange={onValueChange}>
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    await waitFor(() => screen.getByRole('listbox'));
    const appleOption = screen.getByRole('option', { name: 'Apple' });
    fireEvent.click(appleOption);
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith(['apple']);
    });
  });
});

describe('Select — disabled state', () => {
  it('trigger has aria-disabled when select is disabled', () => {
    render(
      <Select.Root disabled placeholder="Pick a fruit">
        <Select.Trigger />
        <Select.Content>
          {options.map((o) => (
            <Select.Item key={o.value} value={o.value} label={o.label} />
          ))}
        </Select.Content>
      </Select.Root>,
    );
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/select/index.test.tsx`

Expected: FAIL — module not found (`Cannot find module './index.tsx'`)

- [ ] **Step 3: Implement component (index.tsx)**

Create `packages/react/src/select/index.tsx`:

```tsx
import { type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  SelectRoot as ArkSelectRoot,
  SelectTrigger as ArkSelectTrigger,
  SelectContent as ArkSelectContent,
  SelectPositioner as ArkSelectPositioner,
  SelectItem as ArkSelectItem,
  SelectItemText as ArkSelectItemText,
  SelectValueText as ArkSelectValueText,
} from '@ark-ui/react/select';
import { createListCollection } from '@ark-ui/react/select';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------

const ChevronDownSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="square" d="M6 9L12 15L18 9" />
  </svg>
);

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SelectRootProps = {
  /** Controlled selected value array. */
  value?: string[];
  /** Initial selected value array for uncontrolled usage. */
  defaultValue?: string[];
  /** Callback fired when the selection changes. Receives the full value array. */
  onValueChange?: (value: string[]) => void;
  /** When true, the select is non-interactive. */
  disabled?: boolean;
  /** When true, multiple items can be selected simultaneously. */
  multiple?: boolean;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Must include Select.Trigger and Select.Content. */
  children: ReactNode;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
};

export type SelectTriggerProps = {
  /** Additional CSS class applied to the trigger button. */
  className?: string;
  /** Inline styles applied to the trigger button. */
  style?: CSSProperties;
};

export type SelectContentProps = {
  /** Select.Item elements to render inside the dropdown. */
  children: ReactNode;
  /** Additional CSS class applied to the content panel. */
  className?: string;
  /** Inline styles applied to the content panel. */
  style?: CSSProperties;
  /** Portal container. Defaults to document.body. Pass null to disable portal. */
  portalContainer?: HTMLElement | null;
};

export type SelectItemProps = {
  /** The value this item represents. */
  value: string;
  /** Display label for this item. */
  label: string;
  /** When true, this item is not selectable. */
  disabled?: boolean;
  /** Additional CSS class applied to the item element. */
  className?: string;
  /** Inline styles applied to the item element. */
  style?: CSSProperties;
};

// ---------------------------------------------------------------------------
// Internal context to pass placeholder to trigger
// ---------------------------------------------------------------------------

// We store items via createListCollection inside Root; items are collected from
// Select.Item renders. Because Ark UI's Select requires a `collection` prop on
// Root, we collect items by scanning children. However, this pattern conflicts
// with Compound components. Instead, we use a simpler approach: the Root
// renders a portal-compatible structure and accepts a flat children prop.

// ---------------------------------------------------------------------------
// SelectRoot
// ---------------------------------------------------------------------------

const SelectRoot = ({
  value,
  defaultValue,
  onValueChange,
  disabled,
  multiple,
  placeholder,
  children,
  className,
  style,
}: SelectRootProps) => {
  // Ark UI Select requires a `collection` prop. We create an empty collection
  // here and let SelectItem components register themselves via the Ark UI
  // internal context. Ark UI handles this when items are rendered inside
  // SelectContent → SelectPositioner → SelectItem.
  const collection = createListCollection<{ value: string; label: string }>({ items: [] });

  const handleValueChange = (details: { value: string[] }) => {
    onValueChange?.(details.value);
  };

  return (
    <ArkSelectRoot
      collection={collection}
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      multiple={multiple}
      lazyMount
      unmountOnExit
      className={classNames(styles.root, className)}
      style={style}
    >
      {/* Pass placeholder as data attribute for use by SelectTrigger via CSS */}
      <span data-select-placeholder={placeholder} style={{ display: 'none' }} aria-hidden />
      {children}
    </ArkSelectRoot>
  );
};

// ---------------------------------------------------------------------------
// SelectTrigger
// ---------------------------------------------------------------------------

const SelectTrigger = ({ className, style }: SelectTriggerProps) => (
  <ArkSelectTrigger className={classNames(styles.trigger, className)} style={style}>
    <ArkSelectValueText className={styles.valueText} placeholder={undefined} />
    <span className={styles.chevron}>
      <ChevronDownSvg />
    </span>
  </ArkSelectTrigger>
);

// ---------------------------------------------------------------------------
// SelectContent
// ---------------------------------------------------------------------------

const SelectContent = ({ children, className, style, portalContainer }: SelectContentProps) => {
  const container =
    portalContainer !== undefined
      ? portalContainer
      : typeof document !== 'undefined'
        ? document.body
        : null;

  const inner = (
    <ArkSelectPositioner>
      <ArkSelectContent className={classNames(styles.content, className)} style={style}>
        {children}
      </ArkSelectContent>
    </ArkSelectPositioner>
  );

  return container ? createPortal(inner, container) : inner;
};

// ---------------------------------------------------------------------------
// SelectItem
// ---------------------------------------------------------------------------

const SelectItem = ({ value, label, disabled, className, style }: SelectItemProps) => (
  <ArkSelectItem
    item={{ value, label }}
    className={classNames(styles.item, className)}
    style={style}
    disabled={disabled}
  >
    <ArkSelectItemText>{label}</ArkSelectItemText>
  </ArkSelectItem>
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

Create `packages/react/src/select/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Root — block container
// ---------------------------------------------------------------------------

.root {
  display: inline-flex;
  flex-direction: column;
  position: relative;
}

// ---------------------------------------------------------------------------
// Trigger button
// ---------------------------------------------------------------------------

.trigger {
  align-items: center;
  background: var(--ui-color-canvas);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  color: var(--ui-color-text);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.875rem;
  gap: 0.5rem;
  min-width: 10rem;
  outline: none;
  padding: 0.375rem 0.625rem 0.375rem 0.75rem;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease;
  user-select: none;
}

.trigger:hover:not([aria-disabled='true']) {
  border-color: var(--ui-color-text);
}

.trigger:focus-visible {
  border-color: var(--ui-color-focus-ring);
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}

.trigger[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: 0.56;
}

.trigger[data-state='open'] .chevron {
  transform: rotate(180deg);
}

// ---------------------------------------------------------------------------
// Value text
// ---------------------------------------------------------------------------

.valueText {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-align: start;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valueText[data-placeholder-shown] {
  color: color-mix(in srgb, var(--ui-color-text) 48%, transparent);
}

// ---------------------------------------------------------------------------
// Chevron icon
// ---------------------------------------------------------------------------

.chevron {
  align-items: center;
  color: var(--ui-color-text);
  display: inline-flex;
  flex-shrink: 0;
  opacity: 0.6;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

// ---------------------------------------------------------------------------
// Content panel (dropdown)
// ---------------------------------------------------------------------------

.content {
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  box-shadow: var(--ui-shadow-soft);
  min-width: 10rem;
  outline: none;
  overflow: hidden;
  padding-block: 0.25rem;
  z-index: 1080;
}

.content[data-state='open'] {
  animation: selectEnter 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.content[data-state='closed'] {
  animation: selectExit 160ms ease forwards;
}

@keyframes selectEnter {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes selectExit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .content[data-state='open'],
  .content[data-state='closed'] {
    animation: none;
  }
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

.item {
  align-items: center;
  border-radius: 0.2rem;
  color: var(--ui-color-text);
  cursor: pointer;
  display: flex;
  font-size: 0.875rem;
  gap: 0.5rem;
  margin-inline: 0.25rem;
  outline: none;
  padding-block: 0.35rem;
  padding-inline: 0.625rem;
  transition: background 120ms ease;
  user-select: none;
}

.item[data-highlighted] {
  background: color-mix(in srgb, var(--ui-color-text) 6%, transparent);
}

.item[data-state='checked'] {
  color: var(--ui-color-brand-bg);
  font-weight: var(--ui-font-weight-emphasis);
}

.item[data-disabled] {
  cursor: not-allowed;
  opacity: 0.56;
}

.item:focus-visible {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: -2px;
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/select/index.test.tsx`

Expected: PASS (all 5 test cases green)

- [ ] **Step 6: Create Storybook story**

Create `apps/storybook/src/stories/Select.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Select } from '@deweyou-design/react/select';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
];

const meta: Meta = {
  title: 'Components/Select',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Select is a dropdown picker that allows users to choose one or more options from a list. Built on Ark UI for ARIA combobox semantics, keyboard navigation, and portal positioning. Compose with `Select.Root`, `Select.Trigger`, `Select.Content`, and `Select.Item`. Import from `@deweyou-design/react/select`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => (
    <Select.Root placeholder="Select a fruit">
      <Select.Trigger />
      <Select.Content>
        {fruits.map((f) => (
          <Select.Item key={f.value} value={f.value} label={f.label} />
        ))}
      </Select.Content>
    </Select.Root>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants (single vs multiple)
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Single select
        </p>
        <Select.Root placeholder="Select a fruit">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Multiple select
        </p>
        <Select.Root placeholder="Select fruits" multiple>
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States
// ---------------------------------------------------------------------------

export const States: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Default (placeholder)
        </p>
        <Select.Root placeholder="No selection">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          With initial value
        </p>
        <Select.Root defaultValue={['banana']}>
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          Disabled
        </p>
        <Select.Root disabled placeholder="Cannot select">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item key={f.value} value={f.value} label={f.label} />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
      <div>
        <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
          With disabled item
        </p>
        <Select.Root placeholder="Select a fruit">
          <Select.Trigger />
          <Select.Content>
            {fruits.map((f) => (
              <Select.Item
                key={f.value}
                value={f.value}
                label={f.label}
                disabled={f.value === 'mango'}
              />
            ))}
          </Select.Content>
        </Select.Root>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: Controlled
// ---------------------------------------------------------------------------

const ControlledDemo = () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Select.Root value={value} onValueChange={setValue} placeholder="Select a fruit">
        <Select.Trigger />
        <Select.Content>
          {fruits.map((f) => (
            <Select.Item key={f.value} value={f.value} label={f.label} />
          ))}
        </Select.Content>
      </Select.Root>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ui-color-text)' }}>
        Selected: <strong>{value.length > 0 ? value.join(', ') : '(none)'}</strong>
      </p>
    </div>
  );
};

export const Controlled: StoryObj = {
  render: () => <ControlledDemo />,
};

// ---------------------------------------------------------------------------
// Story: Interaction
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Select.Root placeholder="Select a fruit">
      <Select.Trigger />
      <Select.Content>
        {fruits.map((f) => (
          <Select.Item key={f.value} value={f.value} label={f.label} />
        ))}
      </Select.Content>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-I-01: trigger is present and content is closed
    const trigger = canvas.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(document.querySelector('[role="listbox"]')).not.toBeInTheDocument();

    // E2E-I-01: click trigger opens dropdown
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeInTheDocument();
    });

    // E2E-I-02: click an option to select it
    const option = Array.from(document.querySelectorAll('[role="option"]')).find((el) =>
      el.textContent?.includes('Banana'),
    ) as HTMLElement | undefined;
    expect(option).toBeDefined();
    if (option) {
      await userEvent.click(option);
    }

    // E2E-I-02: dropdown closes and trigger shows selected value
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    });

    // E2E-I-04: Escape closes when reopened
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeInTheDocument();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).not.toBeInTheDocument();
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  Select,
  type SelectRootProps,
  type SelectTriggerProps,
  type SelectContentProps,
  type SelectItemProps,
} from './select/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/select/ apps/storybook/src/stories/Select.stories.tsx
git commit -m "feat(select): add Select component"
```

---

### Task 5: Dialog

**Files:**

- Create: `packages/react/src/dialog/index.tsx`
- Create: `packages/react/src/dialog/index.module.less`
- Create: `packages/react/src/dialog/index.test.tsx`
- Create: `apps/storybook/src/stories/Dialog.stories.tsx`

- [ ] **Step 1: Write failing test**

Create `packages/react/src/dialog/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { Dialog } from './index.tsx';

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

describe('Dialog — default closed state', () => {
  it('does not render dialog content when closed', () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Hello</Dialog.Title>
          <Dialog.Description>Dialog body</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Dialog — open state', () => {
  it('renders dialog content when trigger is clicked', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure?</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });

  it('renders title and description inside the dialog', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure?</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => {
      expect(screen.getByText('Confirm action')).toBeDefined();
      expect(screen.getByText('Are you sure?')).toBeDefined();
    });
  });
});

describe('Dialog — close trigger', () => {
  it('closes the dialog when the close trigger is clicked', async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm action</Dialog.Title>
          <Dialog.Description>Are you sure?</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    await waitFor(() => screen.getByRole('dialog'));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});

describe('Dialog — controlled mode', () => {
  it('can be opened externally via open prop', async () => {
    const { rerender } = render(
      <Dialog.Root open={false}>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Description>Body</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(
      <Dialog.Root open={true}>
        <Dialog.Trigger>
          <button>Open dialog</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Description>Body</Dialog.Description>
          <Dialog.CloseTrigger>
            <button>Close</button>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/dialog/index.test.tsx`

Expected: FAIL — module not found (`Cannot find module './index.tsx'`)

- [ ] **Step 3: Implement component (index.tsx)**

Create `packages/react/src/dialog/index.tsx`:

```tsx
import { type CSSProperties, type ReactNode } from 'react';
import {
  DialogRoot as ArkDialogRoot,
  DialogTrigger as ArkDialogTrigger,
  DialogBackdrop as ArkDialogBackdrop,
  DialogPositioner as ArkDialogPositioner,
  DialogContent as ArkDialogContent,
  DialogTitle as ArkDialogTitle,
  DialogDescription as ArkDialogDescription,
  DialogCloseTrigger as ArkDialogCloseTrigger,
} from '@ark-ui/react/dialog';
import classNames from 'classnames';

import styles from './index.module.less';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DialogRootProps = {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Must include Dialog.Trigger and Dialog.Content. */
  children: ReactNode;
};

export type DialogTriggerProps = {
  /** The element that opens the dialog when clicked. */
  children: ReactNode;
};

export type DialogContentProps = {
  /** Dialog panel content — title, description, actions, etc. */
  children: ReactNode;
  /** Additional CSS class applied to the dialog panel. */
  className?: string;
  /** Inline styles applied to the dialog panel. */
  style?: CSSProperties;
};

export type DialogTitleProps = {
  /** Title text content. */
  children: ReactNode;
  /** Additional CSS class applied to the title element. */
  className?: string;
  /** Inline styles applied to the title element. */
  style?: CSSProperties;
};

export type DialogDescriptionProps = {
  /** Description text content. */
  children: ReactNode;
  /** Additional CSS class applied to the description element. */
  className?: string;
  /** Inline styles applied to the description element. */
  style?: CSSProperties;
};

export type DialogCloseTriggerProps = {
  /** The element that closes the dialog when clicked. */
  children: ReactNode;
};

// ---------------------------------------------------------------------------
// DialogRoot
// ---------------------------------------------------------------------------

const DialogRoot = ({ open, defaultOpen, onOpenChange, children }: DialogRootProps) => {
  const handleOpenChange = (details: { open: boolean }) => {
    onOpenChange?.(details.open);
  };

  return (
    <ArkDialogRoot
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      lazyMount
      unmountOnExit
    >
      {children}
    </ArkDialogRoot>
  );
};

// ---------------------------------------------------------------------------
// DialogTrigger
// ---------------------------------------------------------------------------

const DialogTrigger = ({ children }: DialogTriggerProps) => (
  <ArkDialogTrigger asChild>{children}</ArkDialogTrigger>
);

// ---------------------------------------------------------------------------
// DialogContent
// ---------------------------------------------------------------------------

const DialogContent = ({ children, className, style }: DialogContentProps) => (
  <>
    <ArkDialogBackdrop className={styles.backdrop} />
    <ArkDialogPositioner className={styles.positioner}>
      <ArkDialogContent className={classNames(styles.panel, className)} style={style}>
        {children}
      </ArkDialogContent>
    </ArkDialogPositioner>
  </>
);

// ---------------------------------------------------------------------------
// DialogTitle
// ---------------------------------------------------------------------------

const DialogTitle = ({ children, className, style }: DialogTitleProps) => (
  <ArkDialogTitle className={classNames(styles.title, className)} style={style}>
    {children}
  </ArkDialogTitle>
);

// ---------------------------------------------------------------------------
// DialogDescription
// ---------------------------------------------------------------------------

const DialogDescription = ({ children, className, style }: DialogDescriptionProps) => (
  <ArkDialogDescription className={classNames(styles.description, className)} style={style}>
    {children}
  </ArkDialogDescription>
);

// ---------------------------------------------------------------------------
// DialogCloseTrigger
// ---------------------------------------------------------------------------

const DialogCloseTrigger = ({ children }: DialogCloseTriggerProps) => (
  <ArkDialogCloseTrigger asChild>{children}</ArkDialogCloseTrigger>
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  CloseTrigger: DialogCloseTrigger,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

Create `packages/react/src/dialog/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

// ---------------------------------------------------------------------------
// Backdrop — semi-transparent overlay
// ---------------------------------------------------------------------------

.backdrop {
  background: rgba(0, 0, 0, 0.4);
  inset: 0;
  position: fixed;
  z-index: 1090;
}

.backdrop[data-state='open'] {
  animation: backdropEnter 200ms ease;
}

.backdrop[data-state='closed'] {
  animation: backdropExit 200ms ease forwards;
}

@keyframes backdropEnter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes backdropExit {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// ---------------------------------------------------------------------------
// Positioner — centers the panel in the viewport
// ---------------------------------------------------------------------------

.positioner {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1rem;
  position: fixed;
  z-index: 1091;
}

// ---------------------------------------------------------------------------
// Panel — the dialog surface
// ---------------------------------------------------------------------------

.panel {
  background: var(--ui-color-surface);
  border-radius: var(--ui-radius-float);
  box-shadow: var(--ui-shadow-soft);
  max-height: calc(100vh - 2rem);
  max-width: min(32rem, calc(100vw - 2rem));
  outline: none;
  overflow-y: auto;
  padding: 24px;
  position: relative;
  width: 100%;
}

.panel[data-state='open'] {
  animation: panelEnter 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.panel[data-state='closed'] {
  animation: panelExit 160ms ease forwards;
}

@keyframes panelEnter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes panelExit {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.96) translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .backdrop[data-state='open'],
  .backdrop[data-state='closed'],
  .panel[data-state='open'],
  .panel[data-state='closed'] {
    animation: none;
  }
}

// ---------------------------------------------------------------------------
// Title
// ---------------------------------------------------------------------------

.title {
  color: var(--ui-color-text);
  font-size: 1.125rem;
  font-weight: var(--ui-font-weight-emphasis);
  line-height: 1.3;
  margin: 0 0 0.5rem;
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

.description {
  color: color-mix(in srgb, var(--ui-color-text) 72%, transparent);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}
```

- [ ] **Step 5: Run test to verify passes**

Run: `vp test packages/react/src/dialog/index.test.tsx`

Expected: PASS (all 5 test cases green)

- [ ] **Step 6: Create Storybook story**

Create `apps/storybook/src/stories/Dialog.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@deweyou-design/react/button';
import { Dialog } from '@deweyou-design/react/dialog';

const meta: Meta = {
  title: 'Components/Dialog',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Dialog is a modal overlay that interrupts the user flow to require a decision or display critical information. Built on Ark UI for focus trapping, ARIA `role="dialog"`, and keyboard management. Compose with `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, and `Dialog.CloseTrigger`. Import from `@deweyou-design/react/dialog`.',
      },
    },
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Default
// ---------------------------------------------------------------------------

export const Default: StoryObj = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outlined">Open dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Confirm action</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to proceed? This action cannot be undone.
        </Dialog.Description>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Dialog.CloseTrigger>
            <Button variant="outlined">Cancel</Button>
          </Dialog.CloseTrigger>
          <Dialog.CloseTrigger>
            <Button>Confirm</Button>
          </Dialog.CloseTrigger>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
};

// ---------------------------------------------------------------------------
// Story: Variants (sizes via content width)
// ---------------------------------------------------------------------------

export const Variants: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="outlined">Compact dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: '24rem' }}>
          <Dialog.Title>Delete item</Dialog.Title>
          <Dialog.Description>This will permanently delete the selected item.</Dialog.Description>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}
          >
            <Dialog.CloseTrigger>
              <Button variant="outlined">Cancel</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger>
              <Button>Delete</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="outlined">Wide dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content style={{ maxWidth: '44rem' }}>
          <Dialog.Title>Terms and conditions</Dialog.Title>
          <Dialog.Description>
            Please read the following terms carefully before proceeding. By clicking "I agree" you
            confirm that you have read, understood, and accepted all terms outlined in this
            agreement.
          </Dialog.Description>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}
          >
            <Dialog.CloseTrigger>
              <Button variant="outlined">Decline</Button>
            </Dialog.CloseTrigger>
            <Dialog.CloseTrigger>
              <Button>I agree</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Story: States (controlled)
// ---------------------------------------------------------------------------

const ControlledDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}
    >
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open externally
      </Button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Title>Controlled dialog</Dialog.Title>
          <Dialog.Description>
            This dialog is controlled via external state. Clicking Cancel or the backdrop closes it.
          </Dialog.Description>
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}
          >
            <Dialog.CloseTrigger>
              <Button variant="outlined">Cancel</Button>
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export const States: StoryObj = {
  render: () => <ControlledDialog />,
};

// ---------------------------------------------------------------------------
// Story: Interaction
// ---------------------------------------------------------------------------

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outlined" data-testid="dialog-trigger">
          Open dialog
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Confirm action</Dialog.Title>
        <Dialog.Description>Are you sure you want to proceed?</Dialog.Description>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Dialog.CloseTrigger>
            <Button variant="outlined" data-testid="dialog-close">
              Cancel
            </Button>
          </Dialog.CloseTrigger>
          <Button>Confirm</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-I-01: dialog is initially closed
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();

    // E2E-I-01: click trigger opens dialog
    const trigger = canvas.getByTestId('dialog-trigger');
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    // E2E-I-02: dialog content is visible
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(within(dialog).getByText('Confirm action')).toBeInTheDocument();
    expect(within(dialog).getByText('Are you sure you want to proceed?')).toBeInTheDocument();

    // E2E-I-04: Escape closes dialog
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    // E2E-I-02: reopen and click close trigger
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    const closeBtn = document.querySelector('[data-testid="dialog-close"]') as HTMLElement;
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });
  },
};
```

- [ ] **Step 7: Export from package index**

Add to `packages/react/src/index.ts`:

```ts
export {
  Dialog,
  type DialogRootProps,
  type DialogTriggerProps,
  type DialogContentProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogCloseTriggerProps,
} from './dialog/index.tsx';
```

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/dialog/ apps/storybook/src/stories/Dialog.stories.tsx
git commit -m "feat(dialog): add Dialog component"
```
