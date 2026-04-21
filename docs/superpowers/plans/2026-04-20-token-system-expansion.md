# Token System Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将间距 token、z-index token、阴影三档 token 以 CSS 自定义属性的形式暴露给组件消费，消除组件中散落的硬编码数值。

**Architecture:** 新 token 沿用现有模式：先在 `primitives/index.ts` 添加原始值，再在 `theme-light.css` / `theme-dark.css` 声明 CSS 变量，最后在 `themes/index.ts` 和 `semantics/index.ts` 注册映射。间距与 z-index 不随主题变化，仅写入 `:root`（theme-light.css 负责），阴影随主题变化，需写入两个主题文件。

**Tech Stack:** CSS Custom Properties、TypeScript（无运行时依赖）

---

## Files

- Modify: `packages/styles/src/primitives/index.ts`
- Modify: `packages/styles/src/css/theme-light.css`
- Modify: `packages/styles/src/css/theme-dark.css`
- Modify: `packages/styles/src/themes/index.ts`
- Modify: `packages/styles/src/semantics/index.ts`
- Modify: `packages/styles/tests/theme-outputs.test.ts`

---

### Task 1: 添加原始值到 primitives

**Files:**

- Modify: `packages/styles/src/primitives/index.ts`

- [ ] **Step 1: 在 `internalPrimitives` 中添加 `zIndex` 和扩展 `shadow`**

注意：`internalPrimitives.spacing`（xs/sm/md/lg/xl）**已存在**，无需新增，Task 3 中直接引用即可。

在 `packages/styles/src/primitives/index.ts` 的 `internalPrimitives` 对象末尾（`} as const` 之前），添加：

```ts
  zIndex: {
    tooltip: '1000',
    popover: '1100',
    dialog: '1200',
    toast: '1300',
  },
```

同时将 `shadow` 对象替换为：

```ts
  shadow: {
    soft: '0 18px 40px rgba(24, 33, 29, 0.12)',
    softDark: '0 18px 40px rgba(0, 0, 0, 0.34)',
    sm: '0 2px 8px rgba(24, 33, 29, 0.06)',
    smDark: '0 2px 8px rgba(0, 0, 0, 0.20)',
    md: '0 8px 24px rgba(24, 33, 29, 0.10)',
    mdDark: '0 8px 24px rgba(0, 0, 0, 0.28)',
    lg: '0 18px 40px rgba(24, 33, 29, 0.12)',
    lgDark: '0 18px 40px rgba(0, 0, 0, 0.34)',
  },
```

- [ ] **Step 2: 运行类型检查，确保无 TS 错误**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add packages/styles/src/primitives/index.ts
git commit -m "chore(styles): add z-index and shadow scale to primitives"
```

---

### Task 2: 在 CSS 主题文件中声明新 token

**Files:**

- Modify: `packages/styles/src/css/theme-light.css`
- Modify: `packages/styles/src/css/theme-dark.css`

- [ ] **Step 1: 在 `theme-light.css` 的 `:root, [data-theme='light']` 块末尾追加**

```css
/* spacing — 基于 4px 网格，不随主题变化 */
--ui-space-xs: 0.25rem;
--ui-space-sm: 0.5rem;
--ui-space-md: 1rem;
--ui-space-lg: 1.5rem;
--ui-space-xl: 2.5rem;
/* z-index 层级 — 不随主题变化 */
--ui-z-tooltip: 1000;
--ui-z-popover: 1100;
--ui-z-dialog: 1200;
--ui-z-toast: 1300;
/* shadow 三档 */
--ui-shadow-sm: 0 2px 8px rgba(24, 33, 29, 0.06);
--ui-shadow-md: 0 8px 24px rgba(24, 33, 29, 0.1);
--ui-shadow-lg: 0 18px 40px rgba(24, 33, 29, 0.12);
```

- [ ] **Step 2: 在 `theme-dark.css` 的 `[data-theme='dark']` 块末尾追加（仅 shadow，间距与 z-index 不重复）**

```css
--ui-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
--ui-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.28);
--ui-shadow-lg: 0 18px 40px rgba(0, 0, 0, 0.34);
```

- [ ] **Step 3: Commit**

```bash
git add packages/styles/src/css/theme-light.css packages/styles/src/css/theme-dark.css
git commit -m "feat(styles): add spacing, z-index, and shadow scale tokens"
```

---

### Task 3: 在 themes/index.ts 中注册新 token

**Files:**

- Modify: `packages/styles/src/themes/index.ts`

- [ ] **Step 1: 在 `lightTheme` 对象末尾（`...lightTextColorThemeSurface,` 之前）追加**

```ts
  '--ui-space-xs': internalPrimitives.spacing.xs,
  '--ui-space-sm': internalPrimitives.spacing.sm,
  '--ui-space-md': internalPrimitives.spacing.md,
  '--ui-space-lg': internalPrimitives.spacing.lg,
  '--ui-space-xl': internalPrimitives.spacing.xl,
  '--ui-z-tooltip': internalPrimitives.zIndex.tooltip,
  '--ui-z-popover': internalPrimitives.zIndex.popover,
  '--ui-z-dialog': internalPrimitives.zIndex.dialog,
  '--ui-z-toast': internalPrimitives.zIndex.toast,
  '--ui-shadow-sm': internalPrimitives.shadow.sm,
  '--ui-shadow-md': internalPrimitives.shadow.md,
  '--ui-shadow-lg': internalPrimitives.shadow.lg,
```

- [ ] **Step 2: 在 `darkTheme` 对象末尾（`...darkTextColorThemeSurface,` 之前）追加（仅 shadow）**

```ts
  '--ui-shadow-sm': internalPrimitives.shadow.smDark,
  '--ui-shadow-md': internalPrimitives.shadow.mdDark,
  '--ui-shadow-lg': internalPrimitives.shadow.lgDark,
```

- [ ] **Step 3: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 4: Commit**

```bash
git add packages/styles/src/themes/index.ts
git commit -m "feat(styles): register spacing, z-index, shadow tokens in theme objects"
```

---

### Task 4: 在 semantics/index.ts 中添加映射

**Files:**

- Modify: `packages/styles/src/semantics/index.ts`

- [ ] **Step 1: 在 `semanticTokens` 对象的 `shadowSoft` 行之后追加**

```ts
  shadowSm: '--ui-shadow-sm',
  shadowMd: '--ui-shadow-md',
  shadowLg: '--ui-shadow-lg',
  spaceXs: '--ui-space-xs',
  spaceSm: '--ui-space-sm',
  spaceMd: '--ui-space-md',
  spaceLg: '--ui-space-lg',
  spaceXl: '--ui-space-xl',
  zTooltip: '--ui-z-tooltip',
  zPopover: '--ui-z-popover',
  zDialog: '--ui-z-dialog',
  zToast: '--ui-z-toast',
```

- [ ] **Step 2: 运行类型检查**

```bash
vp check
```

Expected: 无错误。

- [ ] **Step 3: Commit**

```bash
git add packages/styles/src/semantics/index.ts
git commit -m "feat(styles): add semantic token mappings for spacing, z-index, shadow"
```

---

### Task 5: 补充测试

**Files:**

- Modify: `packages/styles/tests/theme-outputs.test.ts`

- [ ] **Step 1: 写失败测试**

在现有 `describe` 块内，追加以下 test case：

```ts
it('exposes spacing tokens in lightTheme', () => {
  expect(lightTheme['--ui-space-xs']).toBe('0.25rem');
  expect(lightTheme['--ui-space-sm']).toBe('0.5rem');
  expect(lightTheme['--ui-space-md']).toBe('1rem');
  expect(lightTheme['--ui-space-lg']).toBe('1.5rem');
  expect(lightTheme['--ui-space-xl']).toBe('2.5rem');
});

it('exposes z-index tokens in lightTheme', () => {
  expect(lightTheme['--ui-z-tooltip']).toBe('1000');
  expect(lightTheme['--ui-z-popover']).toBe('1100');
  expect(lightTheme['--ui-z-dialog']).toBe('1200');
  expect(lightTheme['--ui-z-toast']).toBe('1300');
});

it('exposes shadow scale tokens with correct light/dark values', () => {
  expect(lightTheme['--ui-shadow-sm']).toBe('0 2px 8px rgba(24, 33, 29, 0.06)');
  expect(lightTheme['--ui-shadow-md']).toBe('0 8px 24px rgba(24, 33, 29, 0.10)');
  expect(lightTheme['--ui-shadow-lg']).toBe('0 18px 40px rgba(24, 33, 29, 0.12)');
  expect(darkTheme['--ui-shadow-sm']).toBe('0 2px 8px rgba(0, 0, 0, 0.20)');
  expect(darkTheme['--ui-shadow-md']).toBe('0 8px 24px rgba(0, 0, 0, 0.28)');
  expect(darkTheme['--ui-shadow-lg']).toBe('0 18px 40px rgba(0, 0, 0, 0.34)');
});
```

- [ ] **Step 2: 运行测试确认失败**

```bash
vp test packages/styles
```

Expected: 上述 3 个 test case FAIL（token 未定义）。

- [ ] **Step 3: 确认 Task 1–4 完成后再次运行**

```bash
vp test packages/styles
```

Expected: 全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/styles/tests/theme-outputs.test.ts
git commit -m "test(styles): verify spacing, z-index, and shadow scale tokens"
```
