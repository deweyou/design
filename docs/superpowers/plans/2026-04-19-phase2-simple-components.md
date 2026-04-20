# Phase 2: Simple New Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9 pure-style components (Input, Textarea, Badge, Spinner, Separator, Alert, Card, Breadcrumb, Skeleton) to `packages/react`, each with unit tests and Storybook stories.

**Architecture:** Flat props for all components except Breadcrumb (Compound). No Ark UI dependency. All styles via Less CSS Modules using semantic design tokens.

**Tech Stack:** React 19, TypeScript 5.x, Less CSS Modules, Vitest (`vp test`), Storybook

---

## Task 1: Input

**Files:**

- Create: `packages/react/src/input/index.tsx`
- Create: `packages/react/src/input/index.module.less`
- Create: `packages/react/src/input/index.test.ts`
- Create: `apps/storybook/src/stories/Input.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/input/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Input, type InputProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: InputProps) => renderToStaticMarkup(createElement(Input, props));

test('input renders a root div with an inner input element by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).toContain('<input');
});

test('input applies the md size class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.sizeMd);
});

test('input applies correct size class for each size value', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    const markup = renderMarkup({ size });
    const expectedClass =
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
    expect(markup).toContain(expectedClass);
  }
});

test('input renders label element with htmlFor when label prop is provided', () => {
  const markup = renderMarkup({ label: 'Email address', id: 'email' });
  expect(markup).toContain('<label');
  expect(markup).toContain('Email address');
  expect(markup).toContain('for="email"');
});

test('input does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain('<label');
});

test('input renders hint text when hint prop is provided', () => {
  const markup = renderMarkup({ hint: 'We will never share your email.' });
  expect(markup).toContain('We will never share your email.');
  expect(markup).toContain(styles.hint);
});

test('input renders error message and applies error classes when error prop is provided', () => {
  const markup = renderMarkup({ error: 'This field is required.' });
  expect(markup).toContain('This field is required.');
  expect(markup).toContain(styles.error);
  expect(markup).toContain(styles.fieldError);
});

test('input does not apply error classes when error is absent', () => {
  const markup = renderMarkup({ hint: 'Some hint' });
  expect(markup).not.toContain(styles.error);
  expect(markup).not.toContain(styles.fieldError);
});

test('input applies disabled class and disabled attribute when disabled is true', () => {
  const markup = renderMarkup({ disabled: true });
  expect(markup).toContain(styles.disabled);
  expect(markup).toContain('disabled');
});

test('input forwards className and style to root element', () => {
  const markup = renderMarkup({ className: 'consumer-input', style: { marginTop: '8px' } });
  expect(markup).toContain('consumer-input');
  expect(markup).toContain('margin-top');
});

test('input stylesheet uses semantic tokens and does not reference raw palette steps', () => {
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-color-canvas');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-focus-ring');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('input stylesheet contains focus-visible outline rule', () => {
  expect(stylesheet).toContain('focus-visible');
  expect(stylesheet).toContain('outline');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/input/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/input/index.tsx
import type { CSSProperties, InputHTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type InputSize = 'sm' | 'md' | 'lg';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** 标签文字，显示在输入框上方 */
  label?: string;
  /** 辅助提示文字，显示在输入框下方 */
  hint?: string;
  /** 错误信息，非空时输入框进入错误状态 */
  error?: string;
  /** 输入框尺寸，默认 'md' */
  size?: InputSize;
  /** 禁用输入框 */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

const sizeClassMap: Record<InputSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Input = ({
  className,
  disabled,
  error,
  hint,
  id,
  label,
  size = 'md',
  style,
  ...props
}: InputProps) => {
  const hasError = Boolean(error);
  const hintText = error ?? hint;

  return (
    <div
      className={classNames(
        styles.root,
        sizeClassMap[size],
        {
          [styles.disabled]: disabled,
        },
        className,
      )}
      style={style}
    >
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        {...props}
        className={classNames(styles.field, {
          [styles.fieldError]: hasError,
        })}
        disabled={disabled}
        id={id}
      />
      {hintText && (
        <p className={classNames({ [styles.hint]: !hasError, [styles.error]: hasError })}>
          {hintText}
        </p>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/input/index.module.less
.root {
  display: grid;
  gap: 4px;
}

.label {
  font: var(--ui-font-weight-emphasis) 0.875rem / 1.25 var(--ui-font-body);
  color: var(--ui-color-text);
}

.field {
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-rect);
  padding: 0.4rem 0.6rem;
  background: var(--ui-color-canvas);
  color: var(--ui-color-text);
  font: 0.875rem / 1.5 var(--ui-font-body);
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: var(--ui-color-text-muted);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus-ring);
    outline-offset: 1px;
  }
}

.fieldError {
  border-color: var(--ui-color-danger-bg);

  &:focus-visible {
    outline-color: var(--ui-color-danger-bg);
  }
}

.hint {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--ui-color-text-muted);
  margin: 0;
}

.error {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--ui-color-danger-text);
  margin: 0;
}

.disabled {
  .field {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .label {
    opacity: 0.5;
  }
}

// Size variants
.sizeSm {
  .field {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }

  .label {
    font-size: 0.8rem;
  }
}

.sizeMd {
  .field {
    padding: 0.4rem 0.6rem;
    font-size: 0.875rem;
  }
}

.sizeLg {
  .field {
    padding: 0.55rem 0.75rem;
    font-size: 1rem;
  }

  .label {
    font-size: 1rem;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/input/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Input } from '@deweyou-design/react/input';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Label text displayed above the input field.',
      control: { type: 'text' },
    },
    hint: {
      description: 'Helper text displayed below the input field.',
      control: { type: 'text' },
    },
    error: {
      description: 'Error message. When non-empty, the field enters an error state.',
      control: { type: 'text' },
    },
    size: {
      description: 'Input size. Defaults to md.',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      description: 'Disables the input field.',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Input collects single-line text from the user. Use `label` and `hint` to guide the user, and `error` to show inline validation feedback.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email address',
    hint: 'We will never share your email.',
    placeholder: 'you@example.com',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input label="Default (md)" placeholder="Placeholder text" />
      <Input label="Small (sm)" size="sm" placeholder="Placeholder text" />
      <Input label="Large (lg)" size="lg" placeholder="Placeholder text" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input label="Normal" hint="Helper text here." placeholder="Placeholder" />
      <Input label="With error" error="This field is required." placeholder="Placeholder" />
      <Input label="Disabled" disabled placeholder="Cannot type here" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Input
        label="Your name"
        hint="Enter your full name."
        placeholder="John Doe"
        data-testid="name-input"
      />
      <Input
        label="Email"
        error="Invalid email address."
        placeholder="you@example.com"
        data-testid="error-input"
      />
      <Input
        label="Disabled field"
        disabled
        placeholder="Not editable"
        data-testid="disabled-input"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: default input is visible and accepts typing
    const nameInput = canvas.getByTestId('name-input');
    expect(nameInput).toBeInTheDocument();
    await userEvent.type(nameInput, 'Alice');
    expect(nameInput).toHaveValue('Alice');

    // error state: error message is present
    const errorInput = canvas.getByTestId('error-input');
    expect(errorInput).toBeInTheDocument();
    expect(canvas.getByText('Invalid email address.')).toBeInTheDocument();

    // E2E-P-02: disabled input cannot be typed into
    const disabledInput = canvas.getByTestId('disabled-input');
    expect(disabledInput).toBeDisabled();
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Input, type InputProps, type InputSize } from './input/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/input/ apps/storybook/src/stories/Input.stories.tsx
  git commit -m "feat(input): add Input component"
  ```

---

## Task 2: Textarea

**Files:**

- Create: `packages/react/src/textarea/index.tsx`
- Create: `packages/react/src/textarea/index.module.less`
- Create: `packages/react/src/textarea/index.test.ts`
- Create: `apps/storybook/src/stories/Textarea.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/textarea/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Textarea, type TextareaProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: TextareaProps) => renderToStaticMarkup(createElement(Textarea, props));

test('textarea renders a root div with an inner textarea element by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).toContain('<textarea');
});

test('textarea applies the md size class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.sizeMd);
});

test('textarea applies correct size class for each size value', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    const markup = renderMarkup({ size });
    const expectedClass =
      size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
    expect(markup).toContain(expectedClass);
  }
});

test('textarea renders label element with htmlFor when label prop is provided', () => {
  const markup = renderMarkup({ label: 'Message', id: 'msg' });
  expect(markup).toContain('<label');
  expect(markup).toContain('Message');
  expect(markup).toContain('for="msg"');
});

test('textarea does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain('<label');
});

test('textarea renders hint text when hint prop is provided', () => {
  const markup = renderMarkup({ hint: 'Max 500 characters.' });
  expect(markup).toContain('Max 500 characters.');
  expect(markup).toContain(styles.hint);
});

test('textarea renders error message and applies error classes when error prop is provided', () => {
  const markup = renderMarkup({ error: 'Message is required.' });
  expect(markup).toContain('Message is required.');
  expect(markup).toContain(styles.error);
  expect(markup).toContain(styles.fieldError);
});

test('textarea applies disabled class and disabled attribute when disabled is true', () => {
  const markup = renderMarkup({ disabled: true });
  expect(markup).toContain(styles.disabled);
  expect(markup).toContain('disabled');
});

test('textarea forwards className and style to root element', () => {
  const markup = renderMarkup({ className: 'consumer-textarea', style: { marginTop: '8px' } });
  expect(markup).toContain('consumer-textarea');
  expect(markup).toContain('margin-top');
});

test('textarea stylesheet uses semantic tokens', () => {
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-color-canvas');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-focus-ring');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('textarea stylesheet contains resize and min-height rules', () => {
  expect(stylesheet).toContain('resize');
  expect(stylesheet).toContain('min-height');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/textarea/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/textarea/index.tsx
import type { CSSProperties, TextareaHTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type TextareaSize = 'sm' | 'md' | 'lg';

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  /** 标签文字，显示在文本域上方 */
  label?: string;
  /** 辅助提示文字，显示在文本域下方 */
  hint?: string;
  /** 错误信息，非空时文本域进入错误状态 */
  error?: string;
  /** 文本域尺寸，默认 'md' */
  size?: TextareaSize;
  /** 禁用文本域 */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

const sizeClassMap: Record<TextareaSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Textarea = ({
  className,
  disabled,
  error,
  hint,
  id,
  label,
  size = 'md',
  style,
  ...props
}: TextareaProps) => {
  const hasError = Boolean(error);
  const hintText = error ?? hint;

  return (
    <div
      className={classNames(
        styles.root,
        sizeClassMap[size],
        {
          [styles.disabled]: disabled,
        },
        className,
      )}
      style={style}
    >
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={classNames(styles.field, {
          [styles.fieldError]: hasError,
        })}
        disabled={disabled}
        id={id}
      />
      {hintText && (
        <p className={classNames({ [styles.hint]: !hasError, [styles.error]: hasError })}>
          {hintText}
        </p>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/textarea/index.module.less
.root {
  display: grid;
  gap: 4px;
}

.label {
  font: var(--ui-font-weight-emphasis) 0.875rem / 1.25 var(--ui-font-body);
  color: var(--ui-color-text);
}

.field {
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-rect);
  padding: 0.4rem 0.6rem;
  background: var(--ui-color-canvas);
  color: var(--ui-color-text);
  font: 0.875rem / 1.5 var(--ui-font-body);
  width: 100%;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: var(--ui-color-text-muted);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus-ring);
    outline-offset: 1px;
  }
}

.fieldError {
  border-color: var(--ui-color-danger-bg);

  &:focus-visible {
    outline-color: var(--ui-color-danger-bg);
  }
}

.hint {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--ui-color-text-muted);
  margin: 0;
}

.error {
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--ui-color-danger-text);
  margin: 0;
}

.disabled {
  .field {
    opacity: 0.5;
    cursor: not-allowed;
    resize: none;
  }

  .label {
    opacity: 0.5;
  }
}

.sizeSm {
  .field {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    min-height: 60px;
  }

  .label {
    font-size: 0.8rem;
  }
}

.sizeMd {
  .field {
    padding: 0.4rem 0.6rem;
    font-size: 0.875rem;
    min-height: 80px;
  }
}

.sizeLg {
  .field {
    padding: 0.55rem 0.75rem;
    font-size: 1rem;
    min-height: 120px;
  }

  .label {
    font-size: 1rem;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/textarea/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Textarea.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { Textarea } from '@deweyou-design/react/textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    label: {
      description: 'Label text displayed above the textarea.',
      control: { type: 'text' },
    },
    hint: {
      description: 'Helper text displayed below the textarea.',
      control: { type: 'text' },
    },
    error: {
      description: 'Error message. When non-empty, the field enters an error state.',
      control: { type: 'text' },
    },
    size: {
      description: 'Textarea size. Defaults to md.',
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    disabled: {
      description: 'Disables the textarea.',
      control: { type: 'boolean' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Textarea collects multi-line text from the user. Supports label, hint, and inline error feedback.',
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Message',
    hint: 'Please describe your issue in detail.',
    placeholder: 'Type your message here…',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
      <Textarea label="Small (sm)" size="sm" placeholder="Small textarea" />
      <Textarea label="Medium (md)" size="md" placeholder="Medium textarea" />
      <Textarea label="Large (lg)" size="lg" placeholder="Large textarea" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
      <Textarea label="Normal" hint="Helper text here." placeholder="Placeholder" />
      <Textarea label="With error" error="Message cannot be empty." placeholder="Placeholder" />
      <Textarea label="Disabled" disabled placeholder="Cannot type here" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
      <Textarea
        label="Feedback"
        hint="Your feedback helps us improve."
        placeholder="Write your feedback…"
        data-testid="feedback-textarea"
      />
      <Textarea
        label="Required field"
        error="This field cannot be empty."
        data-testid="error-textarea"
      />
      <Textarea
        label="Read-only area"
        disabled
        placeholder="Cannot be edited"
        data-testid="disabled-textarea"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: textarea is visible and accepts typing
    const feedbackTextarea = canvas.getByTestId('feedback-textarea');
    expect(feedbackTextarea).toBeInTheDocument();
    await userEvent.type(feedbackTextarea, 'Great product!');
    expect(feedbackTextarea).toHaveValue('Great product!');

    // error state: error message is visible
    const errorTextarea = canvas.getByTestId('error-textarea');
    expect(errorTextarea).toBeInTheDocument();
    expect(canvas.getByText('This field cannot be empty.')).toBeInTheDocument();

    // E2E-P-02: disabled textarea cannot be interacted with
    const disabledTextarea = canvas.getByTestId('disabled-textarea');
    expect(disabledTextarea).toBeDisabled();
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Textarea, type TextareaProps, type TextareaSize } from './textarea/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/textarea/ apps/storybook/src/stories/Textarea.stories.tsx
  git commit -m "feat(textarea): add Textarea component"
  ```

---

## Task 3: Badge

**Files:**

- Create: `packages/react/src/badge/index.tsx`
- Create: `packages/react/src/badge/index.module.less`
- Create: `packages/react/src/badge/index.test.ts`
- Create: `apps/storybook/src/stories/Badge.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/badge/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Badge, type BadgeProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: BadgeProps) =>
  renderToStaticMarkup(createElement(Badge, props, props.children ?? 'Label'));

test('badge renders as a span element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<span');
});

test('badge applies soft variant class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.soft);
});

test('badge applies correct variant classes', () => {
  for (const variant of ['soft', 'solid', 'outline'] as const) {
    const markup = renderMarkup({ variant });
    const expectedClass =
      variant === 'solid' ? styles.solid : variant === 'outline' ? styles.outline : styles.soft;
    expect(markup).toContain(expectedClass);
  }
});

test('badge applies neutral color class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.colorNeutral);
});

test('badge applies correct color classes', () => {
  const colorMap: Record<string, string> = {
    neutral: styles.colorNeutral,
    primary: styles.colorPrimary,
    danger: styles.colorDanger,
    success: styles.colorSuccess,
    warning: styles.colorWarning,
  };
  for (const [color, expectedClass] of Object.entries(colorMap)) {
    const markup = renderMarkup({ color: color as BadgeProps['color'] });
    expect(markup).toContain(expectedClass);
  }
});

test('badge renders children', () => {
  const markup = renderMarkup({ children: 'New' });
  expect(markup).toContain('New');
});

test('badge forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-badge', style: { marginLeft: '4px' } });
  expect(markup).toContain('consumer-badge');
  expect(markup).toContain('margin-left');
});

test('badge stylesheet uses semantic tokens and pill radius', () => {
  expect(stylesheet).toContain('--ui-radius-pill');
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-font-body');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('badge stylesheet contains all variant and color class definitions', () => {
  expect(stylesheet).toContain('soft');
  expect(stylesheet).toContain('solid');
  expect(stylesheet).toContain('outline');
  expect(stylesheet).toContain('colorDanger');
  expect(stylesheet).toContain('colorSuccess');
  expect(stylesheet).toContain('colorWarning');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/badge/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/badge/index.tsx
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type BadgeVariant = 'solid' | 'soft' | 'outline';
export type BadgeColor = 'neutral' | 'primary' | 'danger' | 'success' | 'warning';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** 视觉变体：solid=实心，soft=浅色背景，outline=描边 */
  variant?: BadgeVariant;
  /** 色彩语义 */
  color?: BadgeColor;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const variantClassMap: Record<BadgeVariant, string> = {
  soft: styles.soft,
  solid: styles.solid,
  outline: styles.outline,
};

const colorClassMap: Record<BadgeColor, string> = {
  neutral: styles.colorNeutral,
  primary: styles.colorPrimary,
  danger: styles.colorDanger,
  success: styles.colorSuccess,
  warning: styles.colorWarning,
};

export const Badge = ({
  children,
  className,
  color = 'neutral',
  style,
  variant = 'soft',
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={classNames(styles.root, variantClassMap[variant], colorClassMap[color], className)}
      style={style}
    >
      {children}
    </span>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/badge/index.module.less
.root {
  --badge-color: var(--ui-color-text);
  --badge-bg: transparent;
  --badge-border: transparent;

  display: inline-flex;
  align-items: center;
  border-radius: var(--ui-radius-pill);
  padding: 0.15rem 0.55rem;
  font: 600 0.75rem / 1.25 var(--ui-font-body);
  background: var(--badge-bg);
  color: var(--badge-color);
  border: 1px solid var(--badge-border);
  white-space: nowrap;
}

// ── Variant modifiers ──────────────────────────────────────────────────────
.soft {
  --badge-bg: color-mix(in srgb, var(--badge-color) 12%, transparent);
  --badge-border: transparent;
}

.solid {
  --badge-bg: var(--badge-color);
  color: var(--ui-color-canvas);
  --badge-border: var(--badge-color);
}

.outline {
  --badge-bg: transparent;
  --badge-border: color-mix(in srgb, var(--badge-color) 50%, transparent);
}

// ── Color modifiers ────────────────────────────────────────────────────────
.colorNeutral {
  --badge-color: var(--ui-color-text);
}

.colorPrimary {
  --badge-color: var(--ui-color-brand-bg);
}

.colorDanger {
  --badge-color: var(--ui-color-danger-text);
}

.colorSuccess {
  --badge-color: #16a34a;
}

.colorWarning {
  --badge-color: #d97706;
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/badge/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Badge } from '@deweyou-design/react/badge';

const variants = ['soft', 'solid', 'outline'] as const;
const colors = ['neutral', 'primary', 'danger', 'success', 'warning'] as const;

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Visual treatment: soft (tinted bg), solid (filled), or outline (border only).',
      control: { type: 'select' },
      options: variants,
      table: { defaultValue: { summary: 'soft' } },
    },
    color: {
      description: 'Semantic color emphasis.',
      control: { type: 'select' },
      options: colors,
      table: { defaultValue: { summary: 'neutral' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Badge is a compact inline label for status, categories, or counts. Three variants × five semantic colors.',
      },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'New',
    variant: 'soft',
    color: 'primary',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '64px', fontSize: '0.8rem', color: 'var(--ui-color-text-muted)' }}>
            {variant}
          </span>
          {colors.map((color) => (
            <Badge key={color} variant={variant} color={color}>
              {color}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge color="success">Active</Badge>
      <Badge color="danger">Error</Badge>
      <Badge color="warning">Pending</Badge>
      <Badge color="primary">New</Badge>
      <Badge color="neutral">Draft</Badge>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Badge data-testid="soft-badge" variant="soft" color="primary">
        Soft
      </Badge>
      <Badge data-testid="solid-badge" variant="solid" color="danger">
        Solid
      </Badge>
      <Badge data-testid="outline-badge" variant="outline" color="success">
        Outline
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: all badges are visible
    const softBadge = canvas.getByTestId('soft-badge');
    expect(softBadge).toBeInTheDocument();
    expect(softBadge).toHaveTextContent('Soft');

    const solidBadge = canvas.getByTestId('solid-badge');
    expect(solidBadge).toBeInTheDocument();
    expect(solidBadge).toHaveTextContent('Solid');

    const outlineBadge = canvas.getByTestId('outline-badge');
    expect(outlineBadge).toBeInTheDocument();
    expect(outlineBadge).toHaveTextContent('Outline');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Badge, type BadgeProps, type BadgeVariant, type BadgeColor } from './badge/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/badge/ apps/storybook/src/stories/Badge.stories.tsx
  git commit -m "feat(badge): add Badge component"
  ```

---

## Task 4: Spinner

**Files:**

- Create: `packages/react/src/spinner/index.tsx`
- Create: `packages/react/src/spinner/index.module.less`
- Create: `packages/react/src/spinner/index.test.ts`
- Create: `apps/storybook/src/stories/Spinner.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/spinner/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Spinner, type SpinnerProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: SpinnerProps) => renderToStaticMarkup(createElement(Spinner, props));

test('spinner renders as a span element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<span');
});

test('spinner has aria-hidden="true" when no aria-label is provided', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('aria-hidden="true"');
  expect(markup).not.toContain('role="status"');
});

test('spinner has role="status" when aria-label is provided', () => {
  const markup = renderMarkup({ 'aria-label': 'Loading content' });
  expect(markup).toContain('role="status"');
  expect(markup).toContain('aria-label="Loading content"');
  expect(markup).not.toContain('aria-hidden');
});

test('spinner applies size as inline style when size is a number', () => {
  const markup = renderMarkup({ size: 24 });
  expect(markup).toContain('24px');
});

test('spinner applies size as inline style when size is a string', () => {
  const markup = renderMarkup({ size: '2rem' });
  expect(markup).toContain('2rem');
});

test('spinner applies root class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.root);
});

test('spinner forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-spinner', style: { color: 'red' } });
  expect(markup).toContain('consumer-spinner');
});

test('spinner stylesheet contains keyframe animation', () => {
  expect(stylesheet).toContain('@keyframes');
  expect(stylesheet).toContain('rotate');
});

test('spinner stylesheet uses border and pill radius', () => {
  expect(stylesheet).toContain('border');
  expect(stylesheet).toContain('--ui-radius-pill');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/spinner/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/spinner/index.tsx
import type { CSSProperties, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  /** 尺寸（px 数值或 CSS 字符串），默认 '1em' */
  size?: number | string;
  /** 无障碍标签；提供时加 role="status"，否则加 aria-hidden */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
};

export const Spinner = ({
  'aria-label': ariaLabel,
  className,
  size,
  style,
  ...props
}: SpinnerProps) => {
  const resolvedSize =
    size === undefined ? undefined : typeof size === 'number' ? `${size}px` : size;

  const accessibilityProps = ariaLabel
    ? { role: 'status' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const };

  return (
    <span
      {...props}
      {...accessibilityProps}
      className={classNames(styles.root, className)}
      style={{
        ...style,
        ...(resolvedSize ? { width: resolvedSize, height: resolvedSize } : {}),
      }}
    />
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/spinner/index.module.less
@keyframes spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

.root {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 0.125em solid currentColor;
  border-top-color: transparent;
  border-radius: var(--ui-radius-pill);
  animation: spinner-spin 600ms linear infinite;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/spinner/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Spinner.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Spinner } from '@deweyou-design/react/spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size in px (number) or any CSS string. Defaults to 1em.',
      control: { type: 'text' },
    },
    'aria-label': {
      description:
        'Accessible label. When provided, adds role="status". When absent, adds aria-hidden="true".',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Spinner indicates indeterminate loading. Use `aria-label` when the spinner conveys state to screen-reader users.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Loading',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Spinner size="1em" aria-label="Small spinner" />
      <Spinner size="1.5em" aria-label="Medium spinner" />
      <Spinner size="2.5em" aria-label="Large spinner" />
      <Spinner size={40} aria-label="40px spinner" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ color: 'var(--ui-color-text)' }}>
        <Spinner aria-label="Loading in text color" />
      </div>
      <div style={{ color: 'var(--ui-color-brand-bg)' }}>
        <Spinner aria-label="Loading in brand color" />
      </div>
      <div style={{ color: 'var(--ui-color-danger-text)' }}>
        <Spinner aria-label="Loading in danger color" />
      </div>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Spinner aria-label="Loading content" data-testid="labeled-spinner" />
      <Spinner data-testid="hidden-spinner" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: labeled spinner exists with correct role
    const labeledSpinner = canvas.getByTestId('labeled-spinner');
    expect(labeledSpinner).toBeInTheDocument();
    expect(labeledSpinner).toHaveAttribute('role', 'status');
    expect(labeledSpinner).toHaveAttribute('aria-label', 'Loading content');

    // hidden spinner has aria-hidden
    const hiddenSpinner = canvas.getByTestId('hidden-spinner');
    expect(hiddenSpinner).toBeInTheDocument();
    expect(hiddenSpinner).toHaveAttribute('aria-hidden', 'true');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Spinner, type SpinnerProps } from './spinner/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/spinner/ apps/storybook/src/stories/Spinner.stories.tsx
  git commit -m "feat(spinner): add Spinner component"
  ```

---

## Task 5: Separator

**Files:**

- Create: `packages/react/src/separator/index.tsx`
- Create: `packages/react/src/separator/index.module.less`
- Create: `packages/react/src/separator/index.test.ts`
- Create: `apps/storybook/src/stories/Separator.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/separator/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Separator, type SeparatorProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: SeparatorProps) =>
  renderToStaticMarkup(createElement(Separator, props));

test('separator renders as hr by default (horizontal orientation)', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<hr');
});

test('separator applies horizontal class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.horizontal);
});

test('separator renders as div for vertical orientation', () => {
  const markup = renderMarkup({ orientation: 'vertical' });
  expect(markup).toContain('<div');
  expect(markup).toContain(styles.vertical);
});

test('separator renders label content when label prop is provided', () => {
  const markup = renderMarkup({ label: 'OR' });
  expect(markup).toContain('OR');
  expect(markup).toContain(styles.withLabel);
});

test('separator does not render label element when label prop is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain(styles.withLabel);
});

test('separator forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-sep', style: { margin: '8px 0' } });
  expect(markup).toContain('consumer-sep');
  expect(markup).toContain('margin');
});

test('separator stylesheet uses semantic border token', () => {
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('separator stylesheet defines horizontal and vertical rules', () => {
  expect(stylesheet).toContain('horizontal');
  expect(stylesheet).toContain('vertical');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/separator/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/separator/index.tsx
import type { CSSProperties, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type SeparatorProps = HTMLAttributes<HTMLElement> & {
  /** 方向：horizontal（默认）或 vertical */
  orientation?: 'horizontal' | 'vertical';
  /** 标签文字（仅水平方向有效） */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export const Separator = ({
  className,
  label,
  orientation = 'horizontal',
  style,
  ...props
}: SeparatorProps) => {
  const isVertical = orientation === 'vertical';
  const hasLabel = Boolean(label) && !isVertical;

  if (isVertical) {
    return (
      <div
        {...props}
        aria-orientation="vertical"
        className={classNames(styles.root, styles.vertical, className)}
        role="separator"
        style={style}
      />
    );
  }

  if (hasLabel) {
    return (
      <div
        {...props}
        aria-orientation="horizontal"
        className={classNames(styles.root, styles.horizontal, styles.withLabel, className)}
        role="separator"
        style={style}
      >
        <span className={styles.labelText}>{label}</span>
      </div>
    );
  }

  return (
    <hr
      {...(props as HTMLAttributes<HTMLHRElement>)}
      className={classNames(styles.root, styles.horizontal, className)}
      style={style}
    />
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/separator/index.module.less
.root {
  margin: 0;
  border: none;
  flex-shrink: 0;
}

.horizontal {
  border-top: 1px solid var(--ui-color-border);
  width: 100%;
}

.vertical {
  border-left: 1px solid var(--ui-color-border);
  align-self: stretch;
  height: auto;
}

.withLabel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-top: none;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-top: 1px solid var(--ui-color-border);
  }
}

.labelText {
  font-size: 0.8rem;
  line-height: 1;
  color: var(--ui-color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/separator/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Separator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Separator } from '@deweyou-design/react/separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      description: 'Direction of the separator line.',
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      table: { defaultValue: { summary: 'horizontal' } },
    },
    label: {
      description: 'Optional text label centered within the separator (horizontal only).',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Separator visually divides content. Horizontal (default) renders an hr element; vertical renders a div. An optional label floats centered in the horizontal variant.',
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: '360px' }}>
      <p style={{ margin: '0 0 12px', color: 'var(--ui-color-text)' }}>Above content</p>
      <Separator />
      <p style={{ margin: '12px 0 0', color: 'var(--ui-color-text)' }}>Below content</p>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '24px', maxWidth: '360px' }}>
      <div>
        <p style={{ margin: '0 0 8px', color: 'var(--ui-color-text-muted)', fontSize: '0.8rem' }}>
          Horizontal (default)
        </p>
        <Separator />
      </div>
      <div>
        <p style={{ margin: '0 0 8px', color: 'var(--ui-color-text-muted)', fontSize: '0.8rem' }}>
          With label
        </p>
        <Separator label="OR" />
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', height: '60px' }}>
        <span style={{ color: 'var(--ui-color-text)' }}>Left</span>
        <Separator orientation="vertical" />
        <span style={{ color: 'var(--ui-color-text)' }}>Right</span>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Separator label="Continue with" />
      <Separator label="OR" />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', maxWidth: '360px' }}>
      <Separator data-testid="horizontal-sep" />
      <Separator data-testid="labeled-sep" label="OR" />
      <div style={{ display: 'flex', height: '40px', alignItems: 'stretch', gap: '8px' }}>
        <span>A</span>
        <Separator orientation="vertical" data-testid="vertical-sep" />
        <span>B</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: horizontal separator exists
    const horizontalSep = canvas.getByTestId('horizontal-sep');
    expect(horizontalSep).toBeInTheDocument();
    expect(horizontalSep.tagName).toBe('HR');

    // labeled separator contains label text
    const labeledSep = canvas.getByTestId('labeled-sep');
    expect(labeledSep).toBeInTheDocument();
    expect(labeledSep).toHaveTextContent('OR');

    // vertical separator is a div with role="separator"
    const verticalSep = canvas.getByTestId('vertical-sep');
    expect(verticalSep).toBeInTheDocument();
    expect(verticalSep.tagName).toBe('DIV');
    expect(verticalSep).toHaveAttribute('role', 'separator');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Separator, type SeparatorProps } from './separator/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/separator/ apps/storybook/src/stories/Separator.stories.tsx
  git commit -m "feat(separator): add Separator component"
  ```

---

## Task 6: Alert

**Files:**

- Create: `packages/react/src/alert/index.tsx`
- Create: `packages/react/src/alert/index.module.less`
- Create: `packages/react/src/alert/index.test.ts`
- Create: `apps/storybook/src/stories/Alert.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/alert/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Alert, type AlertProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: AlertProps) =>
  renderToStaticMarkup(createElement(Alert, props, props.children ?? 'Alert content'));

test('alert renders as a div element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
});

test('alert applies info variant class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.info);
});

test('alert applies correct variant class for each variant', () => {
  for (const variant of ['info', 'success', 'warning', 'danger'] as const) {
    const markup = renderMarkup({ variant });
    const expectedClass = styles[variant];
    expect(markup).toContain(expectedClass);
  }
});

test('alert renders title when title prop is provided', () => {
  const markup = renderMarkup({ title: 'Heads up' });
  expect(markup).toContain('Heads up');
  expect(markup).toContain(styles.title);
});

test('alert does not render title element when title is absent', () => {
  const markup = renderMarkup({});
  expect(markup).not.toContain(styles.title);
});

test('alert renders children content', () => {
  const markup = renderMarkup({ children: 'Something went wrong.' });
  expect(markup).toContain('Something went wrong.');
});

test('alert has role="alert" for danger variant', () => {
  const markup = renderMarkup({ variant: 'danger' });
  expect(markup).toContain('role="alert"');
});

test('alert forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-alert', style: { margin: '8px' } });
  expect(markup).toContain('consumer-alert');
  expect(markup).toContain('margin');
});

test('alert stylesheet uses semantic tokens', () => {
  expect(stylesheet).toContain('--ui-color-brand-bg');
  expect(stylesheet).toContain('--ui-color-danger-bg');
  expect(stylesheet).toContain('--ui-radius-float');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('alert stylesheet defines all four variant classes', () => {
  expect(stylesheet).toContain('info');
  expect(stylesheet).toContain('success');
  expect(stylesheet).toContain('warning');
  expect(stylesheet).toContain('danger');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/alert/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/alert/index.tsx
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  /** 语义类型，控制颜色 */
  variant?: AlertVariant;
  /** 标题（可选）*/
  title?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const variantClassMap: Record<AlertVariant, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
};

export const Alert = ({
  children,
  className,
  style,
  title,
  variant = 'info',
  ...props
}: AlertProps) => {
  return (
    <div
      {...props}
      className={classNames(styles.root, variantClassMap[variant], className)}
      role={variant === 'danger' ? 'alert' : undefined}
      style={style}
    >
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/alert/index.module.less
.root {
  border-radius: var(--ui-radius-float);
  padding: 12px 16px;
  border: 1px solid;
  display: grid;
  gap: 4px;
}

.title {
  font: var(--ui-font-weight-emphasis) 0.875rem / 1.25 var(--ui-font-body);
  margin: 0;
  color: inherit;
}

.body {
  font-size: 0.875rem;
  line-height: 1.5;
  color: inherit;
}

// ── Variant modifiers ──────────────────────────────────────────────────────
.info {
  background: color-mix(in srgb, var(--ui-color-brand-bg) 8%, transparent);
  border-color: color-mix(in srgb, var(--ui-color-brand-bg) 20%, transparent);
  color: var(--ui-color-text);
}

.success {
  background: color-mix(in srgb, #16a34a 8%, transparent);
  border-color: color-mix(in srgb, #16a34a 20%, transparent);
  color: var(--ui-color-text);
}

.warning {
  background: color-mix(in srgb, #d97706 8%, transparent);
  border-color: color-mix(in srgb, #d97706 20%, transparent);
  color: var(--ui-color-text);
}

.danger {
  background: color-mix(in srgb, var(--ui-color-danger-bg) 8%, transparent);
  border-color: color-mix(in srgb, var(--ui-color-danger-bg) 20%, transparent);
  color: var(--ui-color-text);
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/alert/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Alert.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Alert } from '@deweyou-design/react/alert';

const variants = ['info', 'success', 'warning', 'danger'] as const;

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Semantic type controlling the color palette.',
      control: { type: 'select' },
      options: variants,
      table: { defaultValue: { summary: 'info' } },
    },
    title: {
      description: 'Optional heading displayed above the body content.',
      control: { type: 'text' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Alert (Callout) delivers contextual feedback. Four semantic variants: info, success, warning, danger. Danger variant adds role="alert" for screen readers.',
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Did you know?',
    children: 'You can customize this component using the controls below.',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info" title="Info">
        This is an informational message.
      </Alert>
      <Alert variant="success" title="Success">
        Your changes have been saved.
      </Alert>
      <Alert variant="warning" title="Warning">
        Your session will expire in 5 minutes.
      </Alert>
      <Alert variant="danger" title="Error">
        Something went wrong. Please try again.
      </Alert>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info">Alert without a title — body only.</Alert>
      <Alert variant="danger" title="Critical error">
        This action cannot be undone.
      </Alert>
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '480px' }}>
      <Alert variant="info" title="Info alert" data-testid="info-alert">
        Informational content here.
      </Alert>
      <Alert variant="danger" title="Danger alert" data-testid="danger-alert">
        This is a danger alert.
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: info alert is visible
    const infoAlert = canvas.getByTestId('info-alert');
    expect(infoAlert).toBeInTheDocument();
    expect(infoAlert).toHaveTextContent('Info alert');
    expect(infoAlert).toHaveTextContent('Informational content here.');

    // danger alert has role="alert"
    const dangerAlert = canvas.getByTestId('danger-alert');
    expect(dangerAlert).toBeInTheDocument();
    expect(dangerAlert).toHaveAttribute('role', 'alert');
    expect(dangerAlert).toHaveTextContent('This is a danger alert.');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Alert, type AlertProps, type AlertVariant } from './alert/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/alert/ apps/storybook/src/stories/Alert.stories.tsx
  git commit -m "feat(alert): add Alert component"
  ```

---

## Task 7: Card

**Files:**

- Create: `packages/react/src/card/index.tsx`
- Create: `packages/react/src/card/index.module.less`
- Create: `packages/react/src/card/index.test.ts`
- Create: `apps/storybook/src/stories/Card.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/card/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Card, type CardProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: CardProps) =>
  renderToStaticMarkup(createElement(Card, props, props.children ?? 'Card content'));

test('card renders as a div element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
});

test('card applies root class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.root);
});

test('card applies md padding class by default', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.paddingMd);
});

test('card applies correct padding class for each padding value', () => {
  const paddingMap: Record<string, string> = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
  };
  for (const [padding, expectedClass] of Object.entries(paddingMap)) {
    const markup = renderMarkup({ padding: padding as CardProps['padding'] });
    expect(markup).toContain(expectedClass);
  }
});

test('card renders children', () => {
  const markup = renderMarkup({ children: 'Card body text' });
  expect(markup).toContain('Card body text');
});

test('card forwards className and style', () => {
  const markup = renderMarkup({ className: 'consumer-card', style: { maxWidth: '400px' } });
  expect(markup).toContain('consumer-card');
  expect(markup).toContain('max-width');
});

test('card stylesheet uses semantic surface and border tokens', () => {
  expect(stylesheet).toContain('--ui-color-surface');
  expect(stylesheet).toContain('--ui-color-border');
  expect(stylesheet).toContain('--ui-radius-rect');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('card stylesheet defines all padding variant classes', () => {
  expect(stylesheet).toContain('paddingNone');
  expect(stylesheet).toContain('paddingSm');
  expect(stylesheet).toContain('paddingMd');
  expect(stylesheet).toContain('paddingLg');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/card/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/card/index.tsx
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** 内边距大小，默认 'md' */
  padding?: CardPadding;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const paddingClassMap: Record<CardPadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

export const Card = ({ children, className, padding = 'md', style, ...props }: CardProps) => {
  return (
    <div
      {...props}
      className={classNames(styles.root, paddingClassMap[padding], className)}
      style={style}
    >
      {children}
    </div>
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/card/index.module.less
.root {
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-rect);
  box-sizing: border-box;
}

.paddingNone {
  padding: 0;
}

.paddingSm {
  padding: 12px;
}

.paddingMd {
  padding: 16px;
}

.paddingLg {
  padding: 24px;
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/card/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Card } from '@deweyou-design/react/card';

const paddingOptions = ['none', 'sm', 'md', 'lg'] as const;

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    padding: {
      description: 'Internal padding size. Defaults to md.',
      control: { type: 'select' },
      options: paddingOptions,
      table: { defaultValue: { summary: 'md' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Card is a surface container with a border and rounded corners. Use it to group related content with consistent visual framing.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'md',
    children: 'Card content goes here.',
    style: { maxWidth: '320px' },
  },
};

export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(2, 1fr)',
        maxWidth: '640px',
      }}
    >
      {paddingOptions.map((padding) => (
        <Card key={padding} padding={padding}>
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--ui-color-text)' }}>
            padding=&quot;{padding}&quot;
          </strong>
          <p style={{ margin: 0, color: 'var(--ui-color-text-muted)', fontSize: '0.85rem' }}>
            Some card content here.
          </p>
        </Card>
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <Card padding="lg" style={{ maxWidth: '400px' }}>
      <h3 style={{ margin: '0 0 8px', color: 'var(--ui-color-text)' }}>Card title</h3>
      <p style={{ margin: '0 0 16px', color: 'var(--ui-color-text-muted)' }}>
        Cards are neutral surface containers. Nest any content inside.
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <span
          style={{
            padding: '4px 10px',
            border: '1px solid var(--ui-color-border)',
            borderRadius: '999px',
            fontSize: '0.8rem',
            color: 'var(--ui-color-text-muted)',
          }}
        >
          Tag
        </span>
      </div>
    </Card>
  ),
};

export const Interaction: Story = {
  render: () => (
    <Card padding="md" data-testid="test-card" style={{ maxWidth: '320px' }}>
      <p style={{ margin: 0, color: 'var(--ui-color-text)' }}>Interactive card content</p>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: card is visible and renders children
    const card = canvas.getByTestId('test-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Interactive card content');
    expect(card.tagName).toBe('DIV');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Card, type CardProps, type CardPadding } from './card/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/card/ apps/storybook/src/stories/Card.stories.tsx
  git commit -m "feat(card): add Card component"
  ```

---

## Task 8: Breadcrumb

**Files:**

- Create: `packages/react/src/breadcrumb/index.tsx`
- Create: `packages/react/src/breadcrumb/index.module.less`
- Create: `packages/react/src/breadcrumb/index.test.ts`
- Create: `apps/storybook/src/stories/Breadcrumb.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/breadcrumb/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Breadcrumb } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderBreadcrumbMarkup = () =>
  renderToStaticMarkup(
    createElement(
      Breadcrumb.Root,
      null,
      createElement(
        Breadcrumb.List,
        null,
        createElement(
          Breadcrumb.Item,
          null,
          createElement(Breadcrumb.Link, { href: '/' }, 'Home'),
          createElement(Breadcrumb.Separator, null),
        ),
        createElement(
          Breadcrumb.Item,
          null,
          createElement(Breadcrumb.Current, null, 'Current Page'),
        ),
      ),
    ),
  );

test('breadcrumb root renders as a nav element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<nav');
});

test('breadcrumb list renders as an ol element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<ol');
});

test('breadcrumb item renders as an li element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<li');
});

test('breadcrumb link renders as an anchor element', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('<a');
  expect(markup).toContain('href="/"');
  expect(markup).toContain('Home');
});

test('breadcrumb current renders with aria-current="page"', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('aria-current="page"');
  expect(markup).toContain('Current Page');
});

test('breadcrumb separator renders with aria-hidden="true"', () => {
  const markup = renderBreadcrumbMarkup();
  expect(markup).toContain('aria-hidden="true"');
});

test('breadcrumb root has aria-label', () => {
  const markup = renderToStaticMarkup(
    createElement(Breadcrumb.Root, { 'aria-label': 'Navigation trail' }, null),
  );
  expect(markup).toContain('aria-label="Navigation trail"');
});

test('breadcrumb stylesheet uses semantic tokens', () => {
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-text-muted');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('breadcrumb stylesheet defines list and item layout', () => {
  expect(stylesheet).toContain('list');
  expect(stylesheet).toContain('item');
  expect(stylesheet).toContain('flex');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/breadcrumb/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/breadcrumb/index.tsx
import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

// ── Root ──────────────────────────────────────────────────────────────────

export type BreadcrumbRootProps = HTMLAttributes<HTMLElement> & {
  /** 无障碍标签，默认 'Breadcrumb' */
  'aria-label'?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbRoot = ({
  'aria-label': ariaLabel = 'Breadcrumb',
  children,
  className,
  style,
  ...props
}: BreadcrumbRootProps) => (
  <nav
    {...props}
    aria-label={ariaLabel}
    className={classNames(styles.root, className)}
    style={style}
  >
    {children}
  </nav>
);

// ── List ──────────────────────────────────────────────────────────────────

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbList = ({ children, className, style, ...props }: BreadcrumbListProps) => (
  <ol {...props} className={classNames(styles.list, className)} style={style}>
    {children}
  </ol>
);

// ── Item ──────────────────────────────────────────────────────────────────

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbItem = ({ children, className, style, ...props }: BreadcrumbItemProps) => (
  <li {...props} className={classNames(styles.item, className)} style={style}>
    {children}
  </li>
);

// ── Link ──────────────────────────────────────────────────────────────────

export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbLink = ({ children, className, style, ...props }: BreadcrumbLinkProps) => (
  <a {...props} className={classNames(styles.link, className)} style={style}>
    {children}
  </a>
);

// ── Current ───────────────────────────────────────────────────────────────

export type BreadcrumbCurrentProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbCurrent = ({ children, className, style, ...props }: BreadcrumbCurrentProps) => (
  <span
    {...props}
    aria-current="page"
    className={classNames(styles.current, className)}
    style={style}
  >
    {children}
  </span>
);

// ── Separator ─────────────────────────────────────────────────────────────

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BreadcrumbSeparator = ({
  children = '/',
  className,
  style,
  ...props
}: BreadcrumbSeparatorProps) => (
  <span
    {...props}
    aria-hidden="true"
    className={classNames(styles.separator, className)}
    style={style}
  >
    {children}
  </span>
);

// ── Compound export ───────────────────────────────────────────────────────

export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Current: BreadcrumbCurrent,
  Separator: BreadcrumbSeparator,
};

export type {
  BreadcrumbRootProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbCurrentProps,
  BreadcrumbSeparatorProps,
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/breadcrumb/index.module.less
.root {
  // nav wrapper — no visual styles, just semantic
}

.list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.item {
  display: flex;
  align-items: center;
}

.link {
  color: var(--ui-color-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: var(--ui-color-text);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus-ring);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.current {
  color: var(--ui-color-text);
  font-weight: 500;
}

.separator {
  color: var(--ui-color-text-muted);
  padding-inline: 0.35rem;
  user-select: none;
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/breadcrumb/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Breadcrumb.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Breadcrumb } from '@deweyou-design/react/breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb.Root,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Breadcrumb is a compound navigation component. Compose with Breadcrumb.Root, .List, .Item, .Link, .Current, and .Separator.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Detail</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--ui-color-text-muted)' }}>
          Two levels
        </p>
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
              <Breadcrumb.Separator />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>Current</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
      <div>
        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: 'var(--ui-color-text-muted)' }}>
          Custom separator
        </p>
        <Breadcrumb.Root>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
              <Breadcrumb.Separator>›</Breadcrumb.Separator>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="#">Docs</Breadcrumb.Link>
              <Breadcrumb.Separator>›</Breadcrumb.Separator>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Breadcrumb.Current>API Reference</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <Breadcrumb.Root aria-label="Page navigation">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Dashboard</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Settings</Breadcrumb.Link>
          <Breadcrumb.Separator />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current>Profile</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
};

export const Interaction: Story = {
  render: () => (
    <Breadcrumb.Root data-testid="breadcrumb-root">
      <Breadcrumb.List data-testid="breadcrumb-list">
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#" data-testid="breadcrumb-link">
            Home
          </Breadcrumb.Link>
          <Breadcrumb.Separator data-testid="breadcrumb-sep" />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Current data-testid="breadcrumb-current">Current Page</Breadcrumb.Current>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: nav root exists with aria-label
    const root = canvas.getByTestId('breadcrumb-root');
    expect(root).toBeInTheDocument();
    expect(root.tagName).toBe('NAV');

    // list is an ol
    const list = canvas.getByTestId('breadcrumb-list');
    expect(list.tagName).toBe('OL');

    // link is a real anchor
    const link = canvas.getByTestId('breadcrumb-link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveTextContent('Home');

    // separator has aria-hidden
    const sep = canvas.getByTestId('breadcrumb-sep');
    expect(sep).toHaveAttribute('aria-hidden', 'true');

    // current page has aria-current="page"
    const current = canvas.getByTestId('breadcrumb-current');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveTextContent('Current Page');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export {
    Breadcrumb,
    type BreadcrumbRootProps,
    type BreadcrumbListProps,
    type BreadcrumbItemProps,
    type BreadcrumbLinkProps,
    type BreadcrumbCurrentProps,
    type BreadcrumbSeparatorProps,
  } from './breadcrumb/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/breadcrumb/ apps/storybook/src/stories/Breadcrumb.stories.tsx
  git commit -m "feat(breadcrumb): add Breadcrumb compound component"
  ```

---

## Task 9: Skeleton

**Files:**

- Create: `packages/react/src/skeleton/index.tsx`
- Create: `packages/react/src/skeleton/index.module.less`
- Create: `packages/react/src/skeleton/index.test.ts`
- Create: `apps/storybook/src/stories/Skeleton.stories.tsx`

- [ ] **Step 1: Write failing test**

```ts
// packages/react/src/skeleton/index.test.ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Skeleton, type SkeletonProps } from './index';
import styles from './index.module.less';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

const renderMarkup = (props: SkeletonProps) => renderToStaticMarkup(createElement(Skeleton, props));

test('skeleton renders as a div element', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
});

test('skeleton applies root class', () => {
  const markup = renderMarkup({});
  expect(markup).toContain(styles.root);
});

test('skeleton applies circle class when circle is true', () => {
  const markup = renderMarkup({ circle: true });
  expect(markup).toContain(styles.circle);
});

test('skeleton does not apply circle class when circle is false', () => {
  const markup = renderMarkup({ circle: false });
  expect(markup).not.toContain(styles.circle);
});

test('skeleton applies width as inline style when width is a number', () => {
  const markup = renderMarkup({ width: 200 });
  expect(markup).toContain('200px');
});

test('skeleton applies width as inline style when width is a string', () => {
  const markup = renderMarkup({ width: '50%' });
  expect(markup).toContain('50%');
});

test('skeleton applies height as inline style when height is a number', () => {
  const markup = renderMarkup({ height: 20 });
  expect(markup).toContain('20px');
});

test('skeleton applies height as inline style when height is a string', () => {
  const markup = renderMarkup({ height: '3em' });
  expect(markup).toContain('3em');
});

test('skeleton has aria-hidden="true"', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('aria-hidden="true"');
});

test('skeleton forwards className', () => {
  const markup = renderMarkup({ className: 'consumer-skeleton' });
  expect(markup).toContain('consumer-skeleton');
});

test('skeleton stylesheet uses semantic tokens and shimmer animation', () => {
  expect(stylesheet).toContain('--ui-color-text');
  expect(stylesheet).toContain('--ui-color-canvas');
  expect(stylesheet).toContain('--ui-radius-float');
  expect(stylesheet).toContain('@keyframes');
  expect(stylesheet).not.toContain('--ui-color-palette-');
});

test('skeleton stylesheet contains circle variant with pill radius', () => {
  expect(stylesheet).toContain('--ui-radius-pill');
  expect(stylesheet).toContain('circle');
});
```

- [ ] **Step 2: Run test to verify it fails**

  Run: `vp test packages/react/src/skeleton/index.test.ts`

  Expected: FAIL — module not found

- [ ] **Step 3: Implement component (index.tsx)**

```tsx
// packages/react/src/skeleton/index.tsx
import type { CSSProperties, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** 宽度，默认 '100%' */
  width?: number | string;
  /** 高度，默认 '1em' */
  height?: number | string;
  /** 圆形模式，适用于头像占位 */
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

const resolveDimension = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export const Skeleton = ({
  circle = false,
  className,
  height,
  style,
  width,
  ...props
}: SkeletonProps) => {
  const resolvedWidth = resolveDimension(width);
  const resolvedHeight = resolveDimension(height);

  return (
    <div
      {...props}
      aria-hidden="true"
      className={classNames(styles.root, { [styles.circle]: circle }, className)}
      style={{
        ...style,
        ...(resolvedWidth ? { width: resolvedWidth } : {}),
        ...(resolvedHeight ? { height: resolvedHeight } : {}),
      }}
    />
  );
};
```

- [ ] **Step 4: Implement styles (index.module.less)**

```less
// packages/react/src/skeleton/index.module.less
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.root {
  display: block;
  width: 100%;
  height: 1em;
  border-radius: var(--ui-radius-float);
  background: color-mix(in srgb, var(--ui-color-text) 8%, var(--ui-color-canvas));
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--ui-color-text) 4%, var(--ui-color-canvas)) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
  overflow: hidden;
}

.circle {
  border-radius: var(--ui-radius-pill);
  aspect-ratio: 1 / 1;
}
```

- [ ] **Step 5: Run test to verify it passes**

  Run: `vp test packages/react/src/skeleton/index.test.ts`

  Expected: PASS

- [ ] **Step 6: Create Storybook story**

```tsx
// apps/storybook/src/stories/Skeleton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Skeleton } from '@deweyou-design/react/skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    width: {
      description: 'Width in px (number) or any CSS string. Defaults to 100%.',
      control: { type: 'text' },
    },
    height: {
      description: 'Height in px (number) or any CSS string. Defaults to 1em.',
      control: { type: 'text' },
    },
    circle: {
      description: 'Circular mode for avatar placeholders.',
      control: { type: 'boolean' },
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton provides a loading placeholder with a shimmer animation. Use circle mode for avatar-sized placeholders.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: '240px',
    height: '1em',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '360px' }}>
      <Skeleton height="1em" />
      <Skeleton height="1em" width="80%" />
      <Skeleton height="1em" width="60%" />
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Skeleton circle width={40} height={40} />
        <div style={{ flex: 1, display: 'grid', gap: '6px' }}>
          <Skeleton height="0.875em" />
          <Skeleton height="0.875em" width="70%" />
        </div>
      </div>
      <Skeleton height="120px" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Skeleton circle width={48} height={48} />
      <Skeleton circle width={32} height={32} />
      <Skeleton circle width={24} height={24} />
    </div>
  ),
};

export const Interaction: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '8px', maxWidth: '320px' }}>
      <Skeleton data-testid="line-skeleton" height="1em" />
      <Skeleton data-testid="circle-skeleton" circle width={40} height={40} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // E2E-P-01: skeletons are present and aria-hidden
    const lineSkeleton = canvas.getByTestId('line-skeleton');
    expect(lineSkeleton).toBeInTheDocument();
    expect(lineSkeleton).toHaveAttribute('aria-hidden', 'true');

    const circleSkeleton = canvas.getByTestId('circle-skeleton');
    expect(circleSkeleton).toBeInTheDocument();
    expect(circleSkeleton).toHaveAttribute('aria-hidden', 'true');
  },
};
```

- [ ] **Step 7: Export from package index**

  在 `packages/react/src/index.ts` 末尾添加：

  ```ts
  export { Skeleton, type SkeletonProps } from './skeleton/index.tsx';
  ```

- [ ] **Step 8: Commit**

  ```bash
  git add packages/react/src/skeleton/ apps/storybook/src/stories/Skeleton.stories.tsx
  git commit -m "feat(skeleton): add Skeleton component"
  ```

---

## Task 10: Update packages/react/CLAUDE.md

**Files:**

- Modify: `packages/react/CLAUDE.md`

- [ ] **Step 1: Append component documentation entries**

  在 `packages/react/CLAUDE.md` 末尾追加以下内容：

  ````markdown
  ## Input

  **意图**：用于收集用户单行文本输入。`label` 和 `hint` 辅助用户填写，`error` 非空时进入错误状态，错误优先级高于 `hint`。

  **正确用法**

  ```tsx
  <Input label="Email" hint="We'll never share it." />
  <Input label="Password" error="Password is required." />
  <Input label="Search" size="sm" placeholder="Search…" />
  ```

  **反模式**

  - 不要手动用 `div` 包裹 `input + label`，直接用 `label` prop
  - error 状态用 `error` prop，不要用 `className` 覆盖样式
  - 不要同时传 `error` 和 `hint`，`error` 存在时 `hint` 会被忽略

  ---

  ## Textarea

  **意图**：用于收集多行文本。API 与 `Input` 一致，去掉 `white-space: nowrap`，加 `resize: vertical`。

  **正确用法**

  ```tsx
  <Textarea label="Message" hint="Max 500 characters." />
  <Textarea label="Feedback" error="Feedback is required." rows={6} />
  ```

  **反模式**

  - 不要用 `Input` 替代 `Textarea` 来容纳多行文字
  - 不要手动将 `resize` 设为 `none` 除非确实不需要

  ---

  ## Badge

  **意图**：紧凑的内联标签，用于状态、分类或计数。三个视觉变体 × 五种语义颜色。

  **正确用法**

  ```tsx
  <Badge color="success">Active</Badge>
  <Badge variant="solid" color="danger">Error</Badge>
  <Badge variant="outline" color="warning">Pending</Badge>
  ```

  **反模式**

  - 不要用 Badge 展示超过 3-4 个词的长文本，考虑用 Alert
  - 不要通过 `style` 手动修改颜色，使用 `color` prop 的语义选项

  ---

  ## Spinner

  **意图**：表示不确定时长的加载过程。默认 `aria-hidden`；有 `aria-label` 时对无障碍设备可见。

  **正确用法**

  ```tsx
  <Spinner />  {/* decorative, hidden from screen readers */}
  <Spinner aria-label="Loading results" />  {/* announces to screen readers */}
  <Spinner size={24} aria-label="Saving" />
  ```

  **反模式**

  - 不要在有 loading 文字旁同时添加 `aria-label`，会造成重复朗读
  - 不要手动设置 `role`，`aria-label` 存在时已自动添加 `role="status"`

  ---

  ## Separator

  **意图**：视觉分隔线。水平方向渲染为 `<hr>`，垂直方向渲染为 `<div>`。水平方向可选文字标签（如 "OR"）。

  **正确用法**

  ```tsx
  <Separator />
  <Separator label="OR" />
  <Separator orientation="vertical" />
  ```

  **反模式**

  - 不要在垂直分隔线上使用 `label` prop，该 prop 仅对水平方向有效
  - 不要用纯 CSS `border` 代替 `<Separator>`，语义 HTML 更利于无障碍

  ---

  ## Alert

  **意图**：展示上下文反馈信息，四种语义变体（info / success / warning / danger）。`danger` 变体自动添加 `role="alert"`。

  **正确用法**

  ```tsx
  <Alert variant="info" title="Did you know?">
    You can dismiss this message.
  </Alert>
  <Alert variant="danger">Session expired. Please log in again.</Alert>
  ```

  **反模式**

  - 不要把 `Alert` 用于持久的页面内容说明，考虑用 `Card`
  - 不要手动添加 `role="alert"`，`danger` 变体已内置

  ---

  ## Card

  **意图**：通用表面容器，用于对相关内容进行视觉分组。提供统一的边框、背景色和圆角。

  **正确用法**

  ```tsx
  <Card padding="lg">
    <h3>Title</h3>
    <p>Card body content.</p>
  </Card>
  <Card padding="none">
    <img src="cover.jpg" alt="" />
  </Card>
  ```

  **反模式**

  - 不要用内联 `style` 手动设置背景和边框，使用 `Card` 以保持视觉一致性
  - 不要嵌套多层 `Card`，考虑使用内边距变体（`padding="none"`）配合手动布局

  ---

  ## Breadcrumb

  **意图**：复合导航组件，展示当前页面在层级结构中的位置。使用 Compound 模式组合子组件。

  **正确用法**

  ```tsx
  <Breadcrumb.Root>
    <Breadcrumb.List>
      <Breadcrumb.Item>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        <Breadcrumb.Separator />
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Current>Current Page</Breadcrumb.Current>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb.Root>
  ```

  **反模式**

  - 不要省略 `Breadcrumb.Separator`，每个非末尾 `Item` 都应包含分隔符
  - 不要在 `Breadcrumb.Current` 上添加 `href`，当前页不应可点击导航
  - 不要直接用 `<nav>` 手动实现，`Breadcrumb.Root` 已处理 `aria-label`

  ---

  ## Skeleton

  **意图**：加载占位符，带 shimmer 动画。`circle` 模式适用于头像占位。所有实例均为 `aria-hidden`。

  **正确用法**

  ```tsx
  <Skeleton height="1em" />
  <Skeleton height="1em" width="60%" />
  <Skeleton circle width={40} height={40} />
  ```

  **反模式**

  - 不要给 `Skeleton` 添加 `aria-label`，加载占位符对无障碍设备应当透明
  - 不要在加载完成后忘记替换 `Skeleton`，它不应作为永久布局元素存在
  ````

- [ ] **Step 2: Commit**

  ```bash
  git add packages/react/CLAUDE.md
  git commit -m "docs(react): add component entries for phase 2 components"
  ```

---

## Task 11: Update packages/react/src/index.ts

**Files:**

- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Add all 9 new component exports**

  在 `packages/react/src/index.ts` 末尾追加：

  ```ts
  export { Input, type InputProps, type InputSize } from './input/index.tsx';
  export { Textarea, type TextareaProps, type TextareaSize } from './textarea/index.tsx';
  export { Badge, type BadgeProps, type BadgeVariant, type BadgeColor } from './badge/index.tsx';
  export { Spinner, type SpinnerProps } from './spinner/index.tsx';
  export { Separator, type SeparatorProps } from './separator/index.tsx';
  export { Alert, type AlertProps, type AlertVariant } from './alert/index.tsx';
  export { Card, type CardProps, type CardPadding } from './card/index.tsx';
  export {
    Breadcrumb,
    type BreadcrumbRootProps,
    type BreadcrumbListProps,
    type BreadcrumbItemProps,
    type BreadcrumbLinkProps,
    type BreadcrumbCurrentProps,
    type BreadcrumbSeparatorProps,
  } from './breadcrumb/index.tsx';
  export { Skeleton, type SkeletonProps } from './skeleton/index.tsx';
  ```

  > **Note:** 如果每个 Task 的 Step 7 已经逐一添加了导出，则本 Task 仅需确认所有条目都已存在，不需要重复添加。

- [ ] **Step 2: Run type check**

  Run: `vp check`

  Expected: no type errors

- [ ] **Step 3: Run all tests**

  Run: `vp test`

  Expected: all tests pass

- [ ] **Step 4: Commit**

  ```bash
  git add packages/react/src/index.ts
  git commit -m "feat(react): export all phase 2 components from package index"
  ```
