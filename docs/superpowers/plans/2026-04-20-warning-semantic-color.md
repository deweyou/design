# Warning Semantic Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Toast 组件中硬编码的 amber 警告色（`#d97706`）替换为正式的语义 token（`--ui-color-warning-bg`），并在 styles 包中完整注册 warning 语义色角色。

**Architecture:** Warning 色角色遵循与 danger 完全相同的 token 模式：在 `primitives` 中定义原始值，在主题 CSS 文件中声明变量，在 `themes/index.ts` 和 `semantics/index.ts` 注册。Toast 组件已有 `warning` 类型支持，仅需将 Less 中的硬编码值换为 token 引用。

**Tech Stack:** CSS Custom Properties、TypeScript、Less CSS Modules

---

## Files

- Modify: `packages/styles/src/primitives/index.ts`
- Modify: `packages/styles/src/css/theme-light.css`
- Modify: `packages/styles/src/css/theme-dark.css`
- Modify: `packages/styles/src/themes/index.ts`
- Modify: `packages/styles/src/semantics/index.ts`
- Modify: `packages/react/src/toast/index.module.less`
- Modify: `packages/styles/tests/theme-outputs.test.ts`
- Modify: `packages/react/src/toast/index.test.ts`

---

### Task 1: 在 primitives 中添加 warning 色原始值

**Files:**

- Modify: `packages/styles/src/primitives/index.ts`

- [ ] **Step 1: 在 `internalPrimitives.color` 的 danger 组之后追加 warning 组**

找到：

```ts
    // 危险
    dangerBackground: colorPalette.red['700'],
    dangerBackgroundHover: colorPalette.red['800'],
    dangerBackgroundActive: colorPalette.red['900'],
    dangerText: colorPalette.red['700'],
```

在其之后添加：

```ts
    // 警告
    warningBackground: colorPalette.amber['600'],
    warningBackgroundHover: colorPalette.amber['700'],
    warningBackgroundActive: colorPalette.amber['800'],
    warningText: colorPalette.amber['700'],
    textOnWarning: baseMonochrome.white,
```

- [ ] **Step 2: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add packages/styles/src/primitives/index.ts
git commit -m "chore(styles): add warning color primitives"
```

---

### Task 2: 在主题 CSS 文件中声明 warning token

**Files:**

- Modify: `packages/styles/src/css/theme-light.css`
- Modify: `packages/styles/src/css/theme-dark.css`

- [ ] **Step 1: 在 `theme-light.css` 的 danger 组之后追加**

找到：

```css
--ui-color-danger-text: var(--ui-color-palette-red-700);
--ui-color-text-on-danger: var(--ui-color-white);
```

在其之后添加：

```css
--ui-color-warning-bg: var(--ui-color-palette-amber-600);
--ui-color-warning-bg-hover: var(--ui-color-palette-amber-700);
--ui-color-warning-bg-active: var(--ui-color-palette-amber-800);
--ui-color-warning-text: var(--ui-color-palette-amber-700);
--ui-color-text-on-warning: var(--ui-color-white);
```

- [ ] **Step 2: 在 `theme-dark.css` 的 danger 组之后追加**

找到：

```css
--ui-color-danger-text: var(--ui-color-palette-red-400);
--ui-color-text-on-danger: var(--ui-color-white);
```

在其之后添加：

```css
--ui-color-warning-bg: var(--ui-color-palette-amber-500);
--ui-color-warning-bg-hover: var(--ui-color-palette-amber-400);
--ui-color-warning-bg-active: var(--ui-color-palette-amber-300);
--ui-color-warning-text: var(--ui-color-palette-amber-400);
--ui-color-text-on-warning: var(--ui-color-white);
```

- [ ] **Step 3: Commit**

```bash
git add packages/styles/src/css/theme-light.css packages/styles/src/css/theme-dark.css
git commit -m "feat(styles): add warning semantic color tokens to theme css"
```

---

### Task 3: 在 themes/index.ts 和 semantics/index.ts 中注册

**Files:**

- Modify: `packages/styles/src/themes/index.ts`
- Modify: `packages/styles/src/semantics/index.ts`

- [ ] **Step 1: 在 `themes/index.ts` 的 `lightTheme` 中添加（danger 组之后）**

`createPaletteCssVar` 和 `createMonochromeCssVar` 已在 `themes/index.ts` 文件顶部定义，直接使用即可。

```ts
  '--ui-color-warning-bg': createPaletteCssVar('amber', '600'),
  '--ui-color-warning-bg-hover': createPaletteCssVar('amber', '700'),
  '--ui-color-warning-bg-active': createPaletteCssVar('amber', '800'),
  '--ui-color-warning-text': createPaletteCssVar('amber', '700'),
  '--ui-color-text-on-warning': createMonochromeCssVar('white'),
```

- [ ] **Step 2: 在 `darkTheme` 中添加（danger 组之后）**

```ts
  '--ui-color-warning-bg': createPaletteCssVar('amber', '500'),
  '--ui-color-warning-bg-hover': createPaletteCssVar('amber', '400'),
  '--ui-color-warning-bg-active': createPaletteCssVar('amber', '300'),
  '--ui-color-warning-text': createPaletteCssVar('amber', '400'),
  '--ui-color-text-on-warning': createMonochromeCssVar('white'),
```

- [ ] **Step 3: 在 `semantics/index.ts` 的 `semanticTokens` 中添加（dangerText 之后）**

```ts
  warningBg: '--ui-color-warning-bg',
  warningBgHover: '--ui-color-warning-bg-hover',
  warningBgActive: '--ui-color-warning-bg-active',
  warningText: '--ui-color-warning-text',
  textOnWarning: '--ui-color-text-on-warning',
```

- [ ] **Step 4: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 5: Commit**

```bash
git add packages/styles/src/themes/index.ts packages/styles/src/semantics/index.ts
git commit -m "feat(styles): register warning color tokens in theme objects and semantics"
```

---

### Task 4: 更新 Toast 组件使用语义 token

**Files:**

- Modify: `packages/react/src/toast/index.module.less`

- [ ] **Step 1: 找到 `.warning` 块**

当前：

```less
.warning {
  background: color-mix(in srgb, #d97706 10%, var(--ui-color-surface));
  border-color: color-mix(in srgb, #d97706 25%, transparent);
}
```

- [ ] **Step 2: 替换为语义 token**

```less
.warning {
  background: color-mix(in srgb, var(--ui-color-warning-bg) 10%, var(--ui-color-surface));
  border-color: color-mix(in srgb, var(--ui-color-warning-bg) 25%, transparent);
}
```

- [ ] **Step 3: 同样检查并替换 `.success` 中的硬编码颜色**

当前：

```less
.success {
  background: color-mix(in srgb, #16a34a 10%, var(--ui-color-surface));
  border-color: color-mix(in srgb, #16a34a 25%, transparent);
}
```

`#16a34a` 是 green-600，对应调色板 `--ui-color-palette-green-600`，替换为：

```less
.success {
  background: color-mix(in srgb, var(--ui-color-palette-green-600) 10%, var(--ui-color-surface));
  border-color: color-mix(in srgb, var(--ui-color-palette-green-600) 25%, transparent);
}
```

- [ ] **Step 4: 运行测试**

```bash
vp test packages/react -- --testPathPattern=toast
```

Expected: 全部 PASS。

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/toast/index.module.less
git commit -m "refactor(toast): replace hardcoded colors with semantic tokens"
```

---

### Task 5: 补充测试

**Files:**

- Modify: `packages/styles/tests/theme-outputs.test.ts`
- Modify: `packages/react/src/toast/index.test.ts`

- [ ] **Step 1: 在 `theme-outputs.test.ts` 中添加**

```ts
it('exposes warning color tokens with correct light/dark values', () => {
  expect(lightTheme['--ui-color-warning-bg']).toBe('var(--ui-color-palette-amber-600)');
  expect(darkTheme['--ui-color-warning-bg']).toBe('var(--ui-color-palette-amber-500)');
  expect(lightTheme['--ui-color-text-on-warning']).toBe('var(--ui-color-white)');
});
```

- [ ] **Step 2: 在 `toast/index.test.ts` 中追加 warning variant 渲染测试**

```ts
it('renders warning variant with warning class', () => {
  render(<Toaster />);
  act(() => {
    toast.create({ title: 'Warning', variant: 'warning' });
  });
  // toast 元素应有 warning class
  const toastEl = document.querySelector('[data-scope="toast"]');
  expect(toastEl?.className).toMatch(/warning/);
});
```

- [ ] **Step 3: 运行全部测试**

```bash
vp test packages/styles packages/react -- --testPathPattern="theme-outputs|toast"
```

Expected: 全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/styles/tests/theme-outputs.test.ts \
        packages/react/src/toast/index.test.ts
git commit -m "test(styles): verify warning color tokens and toast warning variant"
```
