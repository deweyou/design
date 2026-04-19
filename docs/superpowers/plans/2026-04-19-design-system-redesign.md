# Design System Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全面重写 `packages/styles` 的 token 体系（新增暗色主题、stone 替换 slate、暖白底色、三档圆角），并将 `packages/react-icons` 从异步加载架构重写为基于 Tabler Icons 的薄封装层。

**Architecture:** `packages/styles` 维持现有两层结构（CSS 文件 + TypeScript primitives/themes/semantics），同步更新两侧的 token 值和新增 token。`packages/react-icons` 删除所有生成代码，改为 `createTablerIcon` 工厂 + 命名图标导出。两个包的改动相互独立，可并行但需分开提交。

**Tech Stack:** TypeScript, CSS Custom Properties, `@tabler/icons-react` (MIT), React 19, Vitest

---

## 文件变更清单

### packages/styles

| 文件                      | 操作 | 内容                                                                                    |
| ------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `src/primitives/index.ts` | 修改 | 添加暖白常量；更新 brand/border/text/focus 颜色；替换 radius 三档                       |
| `src/themes/index.ts`     | 修改 | 更新 `lightTheme`、`darkTheme`；新增 surface-raised、brand-text、text-disabled token    |
| `src/css/color.css`       | 修改 | 添加 `--ui-color-warm-white-*` 三个自定义条目                                           |
| `src/css/theme-light.css` | 重写 | 对齐新 semantic token 值                                                                |
| `src/css/theme-dark.css`  | 重写 | stone 替换 slate/neutral；emerald 上浮                                                  |
| `src/semantics/index.ts`  | 修改 | 新增 surfaceRaised、brandText、textDisabled、radiusRect/Float/Pill；移除 radiusMd、link |

### packages/react-icons

| 文件                              | 操作 | 内容                                                                             |
| --------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `package.json`                    | 修改 | 添加 `@tabler/icons-react` dep；移除 2347 条 sub-path exports；简化 exports 字段 |
| `src/icon-wrapper/index.tsx`      | 新增 | `createTablerIcon` 工厂，统一 square caps + currentColor                         |
| `src/icons/index.ts`              | 新增 | 命名图标导出（~30 个常用图标）                                                   |
| `src/index.ts`                    | 重写 | 公开 API：`createTablerIcon` + 命名图标                                          |
| `src/icon-wrapper/index.test.tsx` | 新增 | 验证 square caps、aria-hidden、aria-label                                        |
| `src/exports/`                    | 删除 | 2347 个生成文件                                                                  |
| `src/generated/`                  | 删除 | 生成的 loaders、names、components、definitions                                   |
| `src/foundation-icons/`           | 删除 | 含 docs-examples 和 index                                                        |
| `src/icon-registry/`              | 删除 | registry、catalog                                                                |
| `src/icon/`                       | 删除 | 异步 Icon 组件及测试                                                             |

---

## Part A — packages/styles

### Task 1：更新 primitives/index.ts

**Files:**

- Modify: `packages/styles/src/primitives/index.ts`

- [ ] **Step 1: 在 `internalPrimitives` 的 `color` 区块顶部添加暖白常量，更新品牌/边框/文字/焦点值，替换 radius**

  打开 `packages/styles/src/primitives/index.ts`，将 `internalPrimitives` 整个对象替换为：

  ```ts
  export const internalPrimitives = {
    color: {
      black: baseMonochrome.black,
      white: baseMonochrome.white,
      // 暖白三档（自定义值，不走色板算法）
      warmCanvas: '#fefcf8',
      warmSurface: '#fffefb',
      warmSurfaceRaised: '#ffffff',
      // 文字
      text: colorPalette.stone['950'],
      textMuted: colorPalette.stone['500'],
      textDisabled: colorPalette.stone['400'],
      textOnBrand: baseMonochrome.white,
      textOnDanger: baseMonochrome.white,
      // 边框
      border: colorPalette.stone['200'],
      borderStrong: colorPalette.stone['300'],
      // 品牌（emerald 下沉）
      brandBackground: colorPalette.emerald['900'],
      brandBackgroundHover: colorPalette.emerald['950'],
      brandBackgroundActive: colorPalette.emerald['950'],
      brandText: colorPalette.emerald['800'],
      // 危险
      dangerBackground: colorPalette.red['700'],
      dangerBackgroundHover: colorPalette.red['800'],
      dangerBackgroundActive: colorPalette.red['900'],
      dangerText: colorPalette.red['700'],
      // 焦点
      focusRing: colorPalette.emerald['600'],
      // 调色板引用
      palette: colorPalette,
      textPalette: colorPalette,
    },
    radius: {
      rect: '0',
      float: '4px',
      pill: '999px',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2.5rem',
    },
    shadow: {
      soft: '0 18px 40px rgba(24, 33, 29, 0.12)',
      softDark: '0 18px 40px rgba(0, 0, 0, 0.34)',
    },
    font: {
      body: '"Source Han Serif CN Web", "Songti SC", "STSong", "SimSun", "NSimSun", serif',
      display: '"Source Han Serif CN Web", "Songti SC", "STSong", "SimSun", "NSimSun", serif',
      mono: '"IBM Plex Mono", "SFMono-Regular", monospace',
      roles: {
        body: {
          defaultWeightTier: 'body',
          usageScope: 'body text, buttons, forms, and data cells',
        },
        display: {
          defaultWeightTier: 'title',
          usageScope: 'headings and stronger content hierarchy',
        },
        mono: {
          defaultWeightTier: 'body',
          usageScope: 'code, fixed-width identifiers, and explicit exceptions',
        },
      },
      fallbacks: {
        macos: ['Songti SC', 'STSong'],
        windows: ['SimSun', 'NSimSun'],
      },
      weights: {
        body: '400',
        emphasis: '500',
        title: '600',
        strong: '700',
      },
    },
    text: {
      bodySize: '1rem',
      bodyLineHeight: '1.6',
      captionSize: '0.875rem',
      captionLineHeight: '1.45',
      heading1Size: 'clamp(2.8rem, 5vw, 4.6rem)',
      heading1LineHeight: '1.02',
      heading2Size: '2.3rem',
      heading2LineHeight: '1.08',
      heading3Size: '1.85rem',
      heading3LineHeight: '1.14',
      heading4Size: '1.45rem',
      heading4LineHeight: '1.22',
      heading5Size: '1.15rem',
      heading5LineHeight: '1.32',
    },
  } as const;
  ```

- [ ] **Step 2: 运行类型检查**

  ```bash
  vp check
  ```

  预期：通过，或只有其他文件的错误（themes/semantics 尚未更新）。

- [ ] **Step 3: Commit**

  ```bash
  git add packages/styles/src/primitives/index.ts
  git commit -m "refactor(styles): update primitives — stone/emerald-900/warm-white/rect-radius"
  ```

---

### Task 2：更新 themes/index.ts

**Files:**

- Modify: `packages/styles/src/themes/index.ts`

- [ ] **Step 1: 更新 `lightTheme`**

  将 `lightTheme` 替换为：

  ```ts
  export const lightTheme = {
    '--ui-color-canvas': internalPrimitives.color.warmCanvas,
    '--ui-color-surface': internalPrimitives.color.warmSurface,
    '--ui-color-surface-raised': internalPrimitives.color.warmSurfaceRaised,
    '--ui-color-text': createPaletteCssVar('stone', '950'),
    '--ui-color-text-muted': createPaletteCssVar('stone', '500'),
    '--ui-color-text-disabled': createPaletteCssVar('stone', '400'),
    '--ui-color-border': createPaletteCssVar('stone', '200'),
    '--ui-color-border-strong': createPaletteCssVar('stone', '300'),
    '--ui-color-brand-bg': createPaletteCssVar('emerald', '900'),
    '--ui-color-brand-bg-hover': createPaletteCssVar('emerald', '950'),
    '--ui-color-brand-bg-active': createPaletteCssVar('emerald', '950'),
    '--ui-color-brand-text': createPaletteCssVar('emerald', '800'),
    '--ui-color-text-on-brand': createMonochromeCssVar('white'),
    '--ui-color-danger-bg': createPaletteCssVar('red', '700'),
    '--ui-color-danger-bg-hover': createPaletteCssVar('red', '800'),
    '--ui-color-danger-bg-active': createPaletteCssVar('red', '900'),
    '--ui-color-danger-text': createPaletteCssVar('red', '700'),
    '--ui-color-text-on-danger': createMonochromeCssVar('white'),
    '--ui-color-focus-ring': createPaletteCssVar('emerald', '600'),
    '--ui-radius-rect': internalPrimitives.radius.rect,
    '--ui-radius-float': internalPrimitives.radius.float,
    '--ui-radius-pill': internalPrimitives.radius.pill,
    '--ui-shadow-soft': internalPrimitives.shadow.soft,
    '--ui-font-body': internalPrimitives.font.body,
    '--ui-font-display': internalPrimitives.font.display,
    '--ui-font-mono': internalPrimitives.font.mono,
    '--ui-font-weight-body': internalPrimitives.font.weights.body,
    '--ui-font-weight-emphasis': internalPrimitives.font.weights.emphasis,
    '--ui-font-weight-title': internalPrimitives.font.weights.title,
    '--ui-font-weight-strong': internalPrimitives.font.weights.strong,
    '--ui-text-size-body': internalPrimitives.text.bodySize,
    '--ui-text-line-height-body': internalPrimitives.text.bodyLineHeight,
    '--ui-text-size-caption': internalPrimitives.text.captionSize,
    '--ui-text-line-height-caption': internalPrimitives.text.captionLineHeight,
    '--ui-text-size-h1': internalPrimitives.text.heading1Size,
    '--ui-text-line-height-h1': internalPrimitives.text.heading1LineHeight,
    '--ui-text-size-h2': internalPrimitives.text.heading2Size,
    '--ui-text-line-height-h2': internalPrimitives.text.heading2LineHeight,
    '--ui-text-size-h3': internalPrimitives.text.heading3Size,
    '--ui-text-line-height-h3': internalPrimitives.text.heading3LineHeight,
    '--ui-text-size-h4': internalPrimitives.text.heading4Size,
    '--ui-text-line-height-h4': internalPrimitives.text.heading4LineHeight,
    '--ui-text-size-h5': internalPrimitives.text.heading5Size,
    '--ui-text-line-height-h5': internalPrimitives.text.heading5LineHeight,
    ...lightTextColorThemeSurface,
  } as const;
  ```

- [ ] **Step 2: 更新 `darkTheme`**

  将 `darkTheme` 替换为（不继承 lightTheme，完整写出）：

  ```ts
  export const darkTheme = {
    '--ui-color-canvas': createPaletteCssVar('stone', '950'),
    '--ui-color-surface': createPaletteCssVar('stone', '900'),
    '--ui-color-surface-raised': createPaletteCssVar('stone', '800'),
    '--ui-color-text': createPaletteCssVar('stone', '50'),
    '--ui-color-text-muted': createPaletteCssVar('stone', '400'),
    '--ui-color-text-disabled': createPaletteCssVar('stone', '600'),
    '--ui-color-border': createPaletteCssVar('stone', '700'),
    '--ui-color-border-strong': createPaletteCssVar('stone', '600'),
    '--ui-color-brand-bg': createPaletteCssVar('emerald', '600'),
    '--ui-color-brand-bg-hover': createPaletteCssVar('emerald', '500'),
    '--ui-color-brand-bg-active': createPaletteCssVar('emerald', '400'),
    '--ui-color-brand-text': createPaletteCssVar('emerald', '400'),
    '--ui-color-text-on-brand': createMonochromeCssVar('white'),
    '--ui-color-danger-bg': createPaletteCssVar('red', '500'),
    '--ui-color-danger-bg-hover': createPaletteCssVar('red', '400'),
    '--ui-color-danger-bg-active': createPaletteCssVar('red', '300'),
    '--ui-color-danger-text': createPaletteCssVar('red', '400'),
    '--ui-color-text-on-danger': createMonochromeCssVar('white'),
    '--ui-color-focus-ring': createPaletteCssVar('emerald', '400'),
    '--ui-radius-rect': internalPrimitives.radius.rect,
    '--ui-radius-float': internalPrimitives.radius.float,
    '--ui-radius-pill': internalPrimitives.radius.pill,
    '--ui-shadow-soft': internalPrimitives.shadow.softDark,
    '--ui-font-body': internalPrimitives.font.body,
    '--ui-font-display': internalPrimitives.font.display,
    '--ui-font-mono': internalPrimitives.font.mono,
    '--ui-font-weight-body': internalPrimitives.font.weights.body,
    '--ui-font-weight-emphasis': internalPrimitives.font.weights.emphasis,
    '--ui-font-weight-title': internalPrimitives.font.weights.title,
    '--ui-font-weight-strong': internalPrimitives.font.weights.strong,
    '--ui-text-size-body': internalPrimitives.text.bodySize,
    '--ui-text-line-height-body': internalPrimitives.text.bodyLineHeight,
    '--ui-text-size-caption': internalPrimitives.text.captionSize,
    '--ui-text-line-height-caption': internalPrimitives.text.captionLineHeight,
    '--ui-text-size-h1': internalPrimitives.text.heading1Size,
    '--ui-text-line-height-h1': internalPrimitives.text.heading1LineHeight,
    '--ui-text-size-h2': internalPrimitives.text.heading2Size,
    '--ui-text-line-height-h2': internalPrimitives.text.heading2LineHeight,
    '--ui-text-size-h3': internalPrimitives.text.heading3Size,
    '--ui-text-line-height-h3': internalPrimitives.text.heading3LineHeight,
    '--ui-text-size-h4': internalPrimitives.text.heading4Size,
    '--ui-text-line-height-h4': internalPrimitives.text.heading4LineHeight,
    '--ui-text-size-h5': internalPrimitives.text.heading5Size,
    '--ui-text-line-height-h5': internalPrimitives.text.heading5LineHeight,
    ...darkTextColorThemeSurface,
  } as const;
  ```

- [ ] **Step 3: 运行类型检查**

  ```bash
  vp check
  ```

  预期：通过（semantics 尚未更新，可能有 TS 推断警告，但不应有错误）。

- [ ] **Step 4: Commit**

  ```bash
  git add packages/styles/src/themes/index.ts
  git commit -m "refactor(styles): update light/dark theme token values"
  ```

---

### Task 3：更新 CSS 文件

**Files:**

- Modify: `packages/styles/src/css/color.css`
- Modify: `packages/styles/src/css/theme-light.css`
- Modify: `packages/styles/src/css/theme-dark.css`

- [ ] **Step 1: 在 `color.css` 的 `:root` 块顶部，`--ui-color-black` 之前添加暖白条目**

  在 `:root {` 开头插入：

  ```css
  --ui-color-warm-white-1: #fefcf8;
  --ui-color-warm-white-2: #fffefb;
  --ui-color-warm-white-3: #ffffff;
  ```

- [ ] **Step 2: 完整重写 `theme-light.css`**

  ```css
  @import './color.css';

  :root,
  [data-theme='light'] {
    --ui-color-canvas: var(--ui-color-warm-white-1);
    --ui-color-surface: var(--ui-color-warm-white-2);
    --ui-color-surface-raised: var(--ui-color-warm-white-3);
    --ui-color-text: var(--ui-color-palette-stone-950);
    --ui-color-text-muted: var(--ui-color-palette-stone-500);
    --ui-color-text-disabled: var(--ui-color-palette-stone-400);
    --ui-color-border: var(--ui-color-palette-stone-200);
    --ui-color-border-strong: var(--ui-color-palette-stone-300);
    --ui-color-brand-bg: var(--ui-color-palette-emerald-900);
    --ui-color-brand-bg-hover: var(--ui-color-palette-emerald-950);
    --ui-color-brand-bg-active: var(--ui-color-palette-emerald-950);
    --ui-color-brand-text: var(--ui-color-palette-emerald-800);
    --ui-color-text-on-brand: var(--ui-color-white);
    --ui-color-danger-bg: var(--ui-color-palette-red-700);
    --ui-color-danger-bg-hover: var(--ui-color-palette-red-800);
    --ui-color-danger-bg-active: var(--ui-color-palette-red-900);
    --ui-color-danger-text: var(--ui-color-palette-red-700);
    --ui-color-text-on-danger: var(--ui-color-white);
    --ui-color-focus-ring: var(--ui-color-palette-emerald-600);
    --ui-radius-rect: 0;
    --ui-radius-float: 4px;
    --ui-radius-pill: 999px;
    --ui-shadow-soft: 0 18px 40px rgba(24, 33, 29, 0.12);
    --ui-font-body: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', 'NSimSun', serif;
    --ui-font-display: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', 'NSimSun', serif;
    --ui-font-mono: 'IBM Plex Mono', 'SFMono-Regular', monospace;
    --ui-font-weight-body: 400;
    --ui-font-weight-emphasis: 500;
    --ui-font-weight-title: 600;
    --ui-font-weight-strong: 700;
    --ui-text-size-body: 1rem;
    --ui-text-line-height-body: 1.6;
    --ui-text-size-caption: 0.875rem;
    --ui-text-line-height-caption: 1.45;
    --ui-text-size-h1: clamp(2.8rem, 5vw, 4.6rem);
    --ui-text-line-height-h1: 1.02;
    --ui-text-size-h2: 2.3rem;
    --ui-text-line-height-h2: 1.08;
    --ui-text-size-h3: 1.85rem;
    --ui-text-line-height-h3: 1.14;
    --ui-text-size-h4: 1.45rem;
    --ui-text-line-height-h4: 1.22;
    --ui-text-size-h5: 1.15rem;
    --ui-text-line-height-h5: 1.32;
  }
  ```

  注意：`--ui-text-color-*` / `--ui-text-background-*` 条目保留在原来由 `createTextColorThemeSurface` 生成——CSS 文件里删掉这些（它们很长，600 行左右）——改由程序化 API 生成。CSS 文件只保留上面的核心 semantic token。

- [ ] **Step 3: 完整重写 `theme-dark.css`**

  ```css
  @import './color.css';

  [data-theme='dark'] {
    --ui-color-canvas: var(--ui-color-palette-stone-950);
    --ui-color-surface: var(--ui-color-palette-stone-900);
    --ui-color-surface-raised: var(--ui-color-palette-stone-800);
    --ui-color-text: var(--ui-color-palette-stone-50);
    --ui-color-text-muted: var(--ui-color-palette-stone-400);
    --ui-color-text-disabled: var(--ui-color-palette-stone-600);
    --ui-color-border: var(--ui-color-palette-stone-700);
    --ui-color-border-strong: var(--ui-color-palette-stone-600);
    --ui-color-brand-bg: var(--ui-color-palette-emerald-600);
    --ui-color-brand-bg-hover: var(--ui-color-palette-emerald-500);
    --ui-color-brand-bg-active: var(--ui-color-palette-emerald-400);
    --ui-color-brand-text: var(--ui-color-palette-emerald-400);
    --ui-color-text-on-brand: var(--ui-color-white);
    --ui-color-danger-bg: var(--ui-color-palette-red-500);
    --ui-color-danger-bg-hover: var(--ui-color-palette-red-400);
    --ui-color-danger-bg-active: var(--ui-color-palette-red-300);
    --ui-color-danger-text: var(--ui-color-palette-red-400);
    --ui-color-text-on-danger: var(--ui-color-white);
    --ui-color-focus-ring: var(--ui-color-palette-emerald-400);
    --ui-radius-rect: 0;
    --ui-radius-float: 4px;
    --ui-radius-pill: 999px;
    --ui-shadow-soft: 0 18px 40px rgba(0, 0, 0, 0.34);
    --ui-font-body: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', 'NSimSun', serif;
    --ui-font-display: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', 'NSimSun', serif;
    --ui-font-mono: 'IBM Plex Mono', 'SFMono-Regular', monospace;
    --ui-font-weight-body: 400;
    --ui-font-weight-emphasis: 500;
    --ui-font-weight-title: 600;
    --ui-font-weight-strong: 700;
    --ui-text-size-body: 1rem;
    --ui-text-line-height-body: 1.6;
    --ui-text-size-caption: 0.875rem;
    --ui-text-line-height-caption: 1.45;
    --ui-text-size-h1: clamp(2.8rem, 5vw, 4.6rem);
    --ui-text-line-height-h1: 1.02;
    --ui-text-size-h2: 2.3rem;
    --ui-text-line-height-h2: 1.08;
    --ui-text-size-h3: 1.85rem;
    --ui-text-line-height-h3: 1.14;
    --ui-text-size-h4: 1.45rem;
    --ui-text-line-height-h4: 1.22;
    --ui-text-size-h5: 1.15rem;
    --ui-text-line-height-h5: 1.32;
  }
  ```

- [ ] **Step 4: 运行检查**

  ```bash
  vp check
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add packages/styles/src/css/color.css packages/styles/src/css/theme-light.css packages/styles/src/css/theme-dark.css
  git commit -m "refactor(styles): rewrite theme CSS files with new token values"
  ```

---

### Task 4：更新 semantics/index.ts

**Files:**

- Modify: `packages/styles/src/semantics/index.ts`

- [ ] **Step 1: 在 `semanticTokens` 对象中添加新 token，移除废弃的 token**

  在 `semanticTokens` 对象里：
  - 添加 `surfaceRaised: '--ui-color-surface-raised'`
  - 添加 `brandText: '--ui-color-brand-text'`
  - 添加 `textDisabled: '--ui-color-text-disabled'`
  - 添加 `radiusRect: '--ui-radius-rect'`
  - 添加 `radiusFloat: '--ui-radius-float'`
  - 添加 `radiusPill: '--ui-radius-pill'`
  - 移除 `radiusMd: '--ui-radius-md'`
  - 移除 `link: '--ui-color-link'`

  更新后的 `semanticTokens` 顶部（保留其余自动生成的 palette 部分不变）：

  ```ts
  export const semanticTokens = {
    black: '--ui-color-black',
    white: '--ui-color-white',
    canvas: '--ui-color-canvas',
    surface: '--ui-color-surface',
    surfaceRaised: '--ui-color-surface-raised',
    text: '--ui-color-text',
    textMuted: '--ui-color-text-muted',
    textDisabled: '--ui-color-text-disabled',
    border: '--ui-color-border',
    borderStrong: '--ui-color-border-strong',
    brandBg: '--ui-color-brand-bg',
    brandBgHover: '--ui-color-brand-bg-hover',
    brandBgActive: '--ui-color-brand-bg-active',
    brandText: '--ui-color-brand-text',
    textOnBrand: '--ui-color-text-on-brand',
    dangerBg: '--ui-color-danger-bg',
    dangerBgHover: '--ui-color-danger-bg-hover',
    dangerBgActive: '--ui-color-danger-bg-active',
    dangerText: '--ui-color-danger-text',
    textOnDanger: '--ui-color-text-on-danger',
    focusRing: '--ui-color-focus-ring',
    radiusRect: '--ui-radius-rect',
    radiusFloat: '--ui-radius-float',
    radiusPill: '--ui-radius-pill',
    shadowSoft: '--ui-shadow-soft',
    // ... 保留后面的 textBodySize 等以及 palette 展开部分不变
  } as const;
  ```

- [ ] **Step 2: 在 `publicThemeTokens` 数组中添加新 token 条目**

  在 `focusRing` 条目之后，添加：

  ```ts
  {
    name: 'surfaceRaised',
    cssVar: '--ui-color-surface-raised',
    defaultThemeValue: internalPrimitives.color.warmSurfaceRaised,
  },
  {
    name: 'brandText',
    cssVar: '--ui-color-brand-text',
    defaultThemeValue: internalPrimitives.color.brandText,
  },
  {
    name: 'textDisabled',
    cssVar: '--ui-color-text-disabled',
    defaultThemeValue: internalPrimitives.color.textDisabled,
  },
  {
    name: 'radiusRect',
    cssVar: '--ui-radius-rect',
    defaultThemeValue: internalPrimitives.radius.rect,
  },
  {
    name: 'radiusFloat',
    cssVar: '--ui-radius-float',
    defaultThemeValue: internalPrimitives.radius.float,
  },
  {
    name: 'radiusPill',
    cssVar: '--ui-radius-pill',
    defaultThemeValue: internalPrimitives.radius.pill,
  },
  ```

  同时移除 `radiusMd` 和 `link` 的条目。

- [ ] **Step 3: 运行检查和测试**

  ```bash
  vp check && vp test --filter styles
  ```

  预期：通过（styles 包目前无测试，check 应通过）。

- [ ] **Step 4: Commit**

  ```bash
  git add packages/styles/src/semantics/index.ts
  git commit -m "refactor(styles): update semantic token map — add surface-raised/brand-text/radius-rect/float"
  ```

---

## Part B — packages/react-icons

### Task 5：安装依赖 + 写 icon-wrapper

**Files:**

- Modify: `packages/react-icons/package.json`
- Create: `packages/react-icons/src/icon-wrapper/index.tsx`

- [ ] **Step 1: 安装 `@tabler/icons-react`**

  在 `packages/react-icons/package.json` 的 `dependencies` 字段添加：

  ```json
  "@tabler/icons-react": "^3"
  ```

  然后在项目根目录运行：

  ```bash
  vp install
  ```

  预期：安装成功，`node_modules` 中出现 `@tabler/icons-react`。

- [ ] **Step 2: 创建 `src/icon-wrapper/index.tsx`**

  ```tsx
  import type { Icon as TablerIconComponent } from '@tabler/icons-react';
  import type { ComponentProps, ReactElement } from 'react';

  export type IconProps = {
    'aria-label'?: string;
    className?: string;
    size?: number | string;
    stroke?: number;
    style?: React.CSSProperties;
  };

  /**
   * 将任意 Tabler icon 组件包装为符合设计系统规范的图标组件：
   * - strokeLinecap="square"（配合无圆角风格）
   * - strokeLinejoin="miter"
   * - stroke="currentColor"（继承文字颜色）
   * - aria-hidden 默认为 true；传 aria-label 后图标获得 role="img"
   */
  export const createTablerIcon = (
    TablerIcon: typeof TablerIconComponent,
  ): ((props: IconProps) => ReactElement) => {
    const WrappedIcon = ({
      'aria-label': ariaLabel,
      className,
      size = '1em',
      stroke = 1.5,
      style,
    }: IconProps): ReactElement => {
      const svgProps: ComponentProps<typeof TablerIconComponent> = {
        'aria-hidden': ariaLabel ? undefined : true,
        'aria-label': ariaLabel,
        className,
        role: ariaLabel ? 'img' : undefined,
        size,
        stroke,
        strokeLinecap: 'square',
        strokeLinejoin: 'miter',
        style,
      };

      return <TablerIcon {...svgProps} />;
    };

    return WrappedIcon;
  };
  ```

- [ ] **Step 3: 写 icon-wrapper 的测试**

  创建 `packages/react-icons/src/icon-wrapper/index.test.tsx`：

  ```tsx
  import { render } from '@testing-library/react';
  import { IconHome } from '@tabler/icons-react';
  import { describe, expect, it } from 'vitest';

  import { createTablerIcon } from './index';

  const HomeIcon = createTablerIcon(IconHome);

  describe('createTablerIcon', () => {
    it('renders without aria-label as aria-hidden', () => {
      const { container } = render(<HomeIcon />);
      const svg = container.querySelector('svg');

      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.getAttribute('role')).toBeNull();
    });

    it('renders with aria-label as role=img', () => {
      const { container } = render(<HomeIcon aria-label="首页" />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('aria-hidden')).toBeNull();
      expect(svg?.getAttribute('aria-label')).toBe('首页');
      expect(svg?.getAttribute('role')).toBe('img');
    });

    it('applies square stroke caps', () => {
      const { container } = render(<HomeIcon />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('stroke-linecap')).toBe('square');
      expect(svg?.getAttribute('stroke-linejoin')).toBe('miter');
    });

    it('forwards size prop', () => {
      const { container } = render(<HomeIcon size={24} />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('width')).toBe('24');
      expect(svg?.getAttribute('height')).toBe('24');
    });
  });
  ```

- [ ] **Step 4: 运行测试**

  ```bash
  vp test --filter react-icons
  ```

  预期：`icon-wrapper/index.test.tsx` 4 个测试全部通过。

- [ ] **Step 5: Commit**

  ```bash
  git add packages/react-icons/src/icon-wrapper/ packages/react-icons/package.json
  git commit -m "feat(react-icons): add createTablerIcon wrapper with square caps"
  ```

---

### Task 6：写命名图标 + 重写 index.ts

**Files:**

- Create: `packages/react-icons/src/icons/index.ts`
- Modify: `packages/react-icons/src/index.ts`

- [ ] **Step 1: 创建 `src/icons/index.ts`，导出初始常用图标集**

  ```ts
  import {
    IconAlertCircle,
    IconAlertTriangle,
    IconArrowLeft,
    IconArrowRight,
    IconBell,
    IconCheck,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronUp,
    IconCopy,
    IconDownload,
    IconEdit,
    IconExternalLink,
    IconEye,
    IconEyeOff,
    IconFilter,
    IconHome,
    IconInfo,
    IconLoader2,
    IconMenu2,
    IconMinus,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconSettings,
    IconTrash,
    IconUpload,
    IconUser,
    IconX,
  } from '@tabler/icons-react';

  import { createTablerIcon } from '../icon-wrapper';

  export const AlertCircleIcon = createTablerIcon(IconAlertCircle);
  export const AlertTriangleIcon = createTablerIcon(IconAlertTriangle);
  export const ArrowLeftIcon = createTablerIcon(IconArrowLeft);
  export const ArrowRightIcon = createTablerIcon(IconArrowRight);
  export const BellIcon = createTablerIcon(IconBell);
  export const CheckIcon = createTablerIcon(IconCheck);
  export const ChevronDownIcon = createTablerIcon(IconChevronDown);
  export const ChevronLeftIcon = createTablerIcon(IconChevronLeft);
  export const ChevronRightIcon = createTablerIcon(IconChevronRight);
  export const ChevronUpIcon = createTablerIcon(IconChevronUp);
  export const CopyIcon = createTablerIcon(IconCopy);
  export const DownloadIcon = createTablerIcon(IconDownload);
  export const EditIcon = createTablerIcon(IconEdit);
  export const ExternalLinkIcon = createTablerIcon(IconExternalLink);
  export const EyeIcon = createTablerIcon(IconEye);
  export const EyeOffIcon = createTablerIcon(IconEyeOff);
  export const FilterIcon = createTablerIcon(IconFilter);
  export const HomeIcon = createTablerIcon(IconHome);
  export const InfoIcon = createTablerIcon(IconInfo);
  export const Loader2Icon = createTablerIcon(IconLoader2);
  export const Menu2Icon = createTablerIcon(IconMenu2);
  export const MinusIcon = createTablerIcon(IconMinus);
  export const PlusIcon = createTablerIcon(IconPlus);
  export const RefreshIcon = createTablerIcon(IconRefresh);
  export const SearchIcon = createTablerIcon(IconSearch);
  export const SettingsIcon = createTablerIcon(IconSettings);
  export const TrashIcon = createTablerIcon(IconTrash);
  export const UploadIcon = createTablerIcon(IconUpload);
  export const UserIcon = createTablerIcon(IconUser);
  export const XIcon = createTablerIcon(IconX);
  ```

- [ ] **Step 2: 重写 `src/index.ts`**

  ```ts
  export { createTablerIcon, type IconProps } from './icon-wrapper';
  export * from './icons';
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add packages/react-icons/src/icons/ packages/react-icons/src/index.ts
  git commit -m "feat(react-icons): add named icon exports wrapping tabler icons"
  ```

---

### Task 7：删除旧文件 + 清理 package.json exports

**Files:**

- Delete: `packages/react-icons/src/exports/`
- Delete: `packages/react-icons/src/generated/`
- Delete: `packages/react-icons/src/foundation-icons/`
- Delete: `packages/react-icons/src/icon-registry/`
- Delete: `packages/react-icons/src/icon/`
- Modify: `packages/react-icons/package.json`

- [ ] **Step 1: 删除旧目录**

  ```bash
  rm -rf packages/react-icons/src/exports \
         packages/react-icons/src/generated \
         packages/react-icons/src/foundation-icons \
         packages/react-icons/src/icon-registry \
         packages/react-icons/src/icon
  ```

- [ ] **Step 2: 清理 `package.json` exports 字段**

  将 `packages/react-icons/package.json` 的 `exports` 字段替换为（删除所有 2347 条 sub-path 条目）：

  ```json
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.mjs",
      "default": "./dist/index.mjs"
    },
    "./package.json": "./package.json"
  }
  ```

  同时从 `description` 字段移除 "tdesign-icons-svg" 引用，改为：

  ```json
  "description": "React icon components for Deweyou UI — thin wrapper over @tabler/icons-react."
  ```

- [ ] **Step 3: 运行检查和测试**

  ```bash
  vp check && vp test --filter react-icons
  ```

  预期：类型检查通过，`icon-wrapper/index.test.tsx` 通过。

- [ ] **Step 4: Commit**

  ```bash
  git add packages/react-icons/
  git commit -m "refactor(react-icons): drop async icon architecture, clean up generated files"
  ```

---

### Task 8：全量验证

- [ ] **Step 1: 全量类型检查 + lint**

  ```bash
  vp check
  ```

  预期：零错误，零警告。

- [ ] **Step 2: 全量测试**

  ```bash
  vp test
  ```

  预期：所有测试通过（react-icons icon-wrapper 测试 + 其他包测试）。

- [ ] **Step 3: 构建验证**

  ```bash
  vp run build -r
  ```

  预期：styles 和 react-icons 都能正常构建，dist 产物包含新 CSS 文件。

- [ ] **Step 4: 目视检查（可选但推荐）**

  ```bash
  vp run website#dev
  ```

  打开浏览器检查：Button 组件是否显示为暖白底色 + 墨绿按钮。如有 token 引用错误会在此处暴露。
