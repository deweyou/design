# Input/Textarea Variant Dimension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Input 和 Textarea 补充 `variant` prop（`'outlined' | 'ghost'`），`outlined` 为当前默认样式，`ghost` 为无边框版本，适用于嵌入表格或搜索栏等场景。

**Architecture:** 沿用 Button 的四维度正交模型。`outlined` 保持现有样式不变（向后兼容），`ghost` 去掉边框和背景，仅在 hover/focus 时显示轻微背景反馈。变体通过独立 CSS class 实现，不改变现有 size 和 disabled 逻辑。

**Tech Stack:** React 19、TypeScript、Less CSS Modules

---

## Files

- Modify: `packages/react/src/input/index.tsx`
- Modify: `packages/react/src/input/index.module.less`
- Modify: `packages/react/src/input/index.test.ts`
- Modify: `packages/react/src/textarea/index.tsx`
- Modify: `packages/react/src/textarea/index.module.less`
- Modify: `packages/react/src/textarea/index.test.ts`

---

### Task 1: 为 Input 添加 variant prop

**Files:**

- Modify: `packages/react/src/input/index.tsx`
- Modify: `packages/react/src/input/index.module.less`

- [ ] **Step 1: 在 `index.test.ts` 中写失败测试**

在 `packages/react/src/input/index.test.ts` 中追加：

```ts
describe('Input variant', () => {
  it('renders outlined variant (default) with border class', () => {
    const { container } = render(<Input />);
    const field = container.querySelector('input')!;
    expect(field.className).toMatch(/variantOutlined/);
  });

  it('renders ghost variant without border class', () => {
    const { container } = render(<Input variant="ghost" />);
    const field = container.querySelector('input')!;
    expect(field.className).toMatch(/variantGhost/);
    expect(field.className).not.toMatch(/variantOutlined/);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
vp test packages/react -- --testPathPattern=input
```

Expected: FAIL — `variantOutlined`/`variantGhost` class 不存在。

- [ ] **Step 3: 在 `index.tsx` 中添加类型和 prop**

在 `InputSize` 类型定义之后添加：

```ts
export type InputVariant = 'outlined' | 'ghost';
```

在 `InputProps` 类型中添加：

```ts
  /** 输入框视觉变体，默认 'outlined' */
  variant?: InputVariant;
```

在 `sizeClassMap` 之后添加：

```ts
const variantClassMap: Record<InputVariant, string> = {
  outlined: styles.variantOutlined,
  ghost: styles.variantGhost,
};
```

在函数签名中解构 `variant = 'outlined'`：

```ts
export const Input = ({
  className,
  disabled,
  error,
  hint,
  id,
  label,
  size = 'md',
  variant = 'outlined',
  style,
  ...props
}: InputProps) => {
```

在 `<input>` 的 `className` 中追加 variant class：

```ts
className={classNames(styles.field, variantClassMap[variant], {
  [styles.fieldError]: hasError,
})}
```

- [ ] **Step 4: 在 `index.module.less` 中添加 variant 样式**

在文件末尾追加（在 size variants 之后）：

```less
// Variant
.variantOutlined {
  // 默认样式已在 .field 中定义，此处保持一致
  border: 1px solid var(--ui-color-border);
  background: var(--ui-color-canvas);
}

.variantGhost {
  border: 1px solid transparent;
  background: transparent;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-color-text) 5%, transparent);
  }

  &:focus-visible {
    background: transparent;
  }
}
```

同时，将 `.field` 中的原有 `border` 和 `background` 移除（改由 variant class 提供），避免重复：

找到 `.field` 中的这两行：

```less
border: 1px solid var(--ui-color-border);
background: var(--ui-color-canvas);
```

删除这两行（它们由 `.variantOutlined` 接管）。

- [ ] **Step 5: 运行测试确认通过**

```bash
vp test packages/react -- --testPathPattern=input
```

Expected: 全部 PASS。

- [ ] **Step 6: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/input/index.tsx \
        packages/react/src/input/index.module.less \
        packages/react/src/input/index.test.ts
git commit -m "feat(input): add variant prop with outlined and ghost options"
```

---

### Task 2: 为 Textarea 添加 variant prop

**Files:**

- Modify: `packages/react/src/textarea/index.tsx`
- Modify: `packages/react/src/textarea/index.module.less`
- Modify: `packages/react/src/textarea/index.test.ts`

- [ ] **Step 1: 在 `textarea/index.test.ts` 中写失败测试**

```ts
describe('Textarea variant', () => {
  it('renders outlined variant (default) with border class', () => {
    const { container } = render(<Textarea />);
    const field = container.querySelector('textarea')!;
    expect(field.className).toMatch(/variantOutlined/);
  });

  it('renders ghost variant without border', () => {
    const { container } = render(<Textarea variant="ghost" />);
    const field = container.querySelector('textarea')!;
    expect(field.className).toMatch(/variantGhost/);
    expect(field.className).not.toMatch(/variantOutlined/);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
vp test packages/react -- --testPathPattern=textarea
```

Expected: FAIL。

- [ ] **Step 3: 在 `textarea/index.tsx` 中查看现有 API，按 Input 的相同模式添加**

读取 `packages/react/src/textarea/index.tsx` 确认现有 props，然后：

1. 导入或内联定义 `TextareaVariant = 'outlined' | 'ghost'`
2. 在 `TextareaProps` 中添加 `variant?: TextareaVariant`
3. 添加 `variantClassMap`（与 Input 完全相同）
4. 解构 `variant = 'outlined'`
5. 在 `<textarea>` 的 `className` 中追加 `variantClassMap[variant]`

- [ ] **Step 4: 在 `textarea/index.module.less` 中添加 variant 样式**

与 Input 完全相同的样式模式——将 `.field` 的 `border`/`background` 移入 `.variantOutlined`，追加 `.variantGhost`：

```less
.variantOutlined {
  border: 1px solid var(--ui-color-border);
  background: var(--ui-color-canvas);
}

.variantGhost {
  border: 1px solid transparent;
  background: transparent;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-color-text) 5%, transparent);
  }

  &:focus-visible {
    background: transparent;
  }
}
```

- [ ] **Step 5: 运行全部测试**

```bash
vp test packages/react -- --testPathPattern="input|textarea"
```

Expected: 全部 PASS。

- [ ] **Step 6: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 7: Commit**

```bash
git add packages/react/src/textarea/index.tsx \
        packages/react/src/textarea/index.module.less \
        packages/react/src/textarea/index.test.ts
git commit -m "feat(textarea): add variant prop with outlined and ghost options"
```
