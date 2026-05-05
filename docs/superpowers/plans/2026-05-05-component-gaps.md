# Component Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `@deweyou-design/react` 补全 4 个组件缺口：Card href 多态、Tooltip placement、Nav 复合组件、NavOverlay 全屏覆盖层。

**Architecture:** Card 和 Tooltip 是对现有组件的最小扩展；Nav 是纯展示型复合组件（无 Ark UI），参照 Breadcrumb 模式；NavOverlay 基于 Ark UI Dialog 原语，覆盖样式至全屏，不引入额外状态机。

**Tech Stack:** TypeScript 5.x、React 19.x、`@ark-ui/react/dialog`、CSS Modules（Less）、`vite-plus/test`、`@testing-library/react`

---

## 文件结构

| 文件                                               | 变更                            |
| -------------------------------------------------- | ------------------------------- |
| `packages/react/src/card/index.tsx`                | 修改：新增 `href`/`target` prop |
| `packages/react/src/card/index.test.ts`            | 修改：追加锚点渲染测试          |
| `packages/react/src/tooltip/index.tsx`             | 修改：新增 `placement` prop     |
| `packages/react/src/tooltip/index.test.tsx`        | 修改：追加 placement 测试       |
| `packages/react/src/nav/index.tsx`                 | 新增：Nav.Root + Nav.Link       |
| `packages/react/src/nav/index.module.less`         | 新增                            |
| `packages/react/src/nav/index.test.ts`             | 新增                            |
| `packages/react/src/nav-overlay/index.tsx`         | 新增：NavOverlay 复合组件       |
| `packages/react/src/nav-overlay/index.module.less` | 新增                            |
| `packages/react/src/nav-overlay/index.test.tsx`    | 新增                            |
| `packages/react/src/index.ts`                      | 修改：追加 Nav、NavOverlay 导出 |

---

## Task 1: Card href 多态

**Files:**

- Modify: `packages/react/src/card/index.tsx`
- Modify: `packages/react/src/card/index.test.ts`

- [ ] **Step 1: 在 card/index.test.ts 追加失败测试**

在文件末尾追加（保留所有已有测试）：

```ts
test('card renders as an anchor element when href is provided', () => {
  const markup = renderMarkup({ href: '/detail/123' });
  expect(markup).toContain('<a');
  expect(markup).toContain('href="/detail/123"');
  expect(markup).not.toContain('<div');
});

test('card renders as div when href is not provided', () => {
  const markup = renderMarkup({});
  expect(markup).toContain('<div');
  expect(markup).not.toContain('<a');
});

test('card forwards target when href is provided', () => {
  const markup = renderMarkup({ href: '/detail', target: '_blank' });
  expect(markup).toContain('target="_blank"');
});

test('card throws when target is provided without href', () => {
  expect(() => renderMarkup({ target: '_blank' })).toThrow('Card: target requires href');
});
```

**注意：** `renderMarkup` 已定义在文件顶部，可直接复用。`CardProps` 需要在后续步骤中加入 `href` 和 `target` 字段，否则 TypeScript 报错。

- [ ] **Step 2: 运行测试，确认失败**

```bash
vp test packages/react/src/card/index.test.ts
```

预期：前 4 个新增测试失败，已有测试全部通过。

- [ ] **Step 3: 更新 card/index.tsx**

完整替换文件内容：

```tsx
import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShape = 'auto' | 'rect';

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** 内边距大小，默认 'md' */
  padding?: CardPadding;
  /** 圆角形状，'auto' 使用标准圆角，'rect' 为直角，默认 'auto' */
  shape?: CardShape;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * 有 href 时渲染为 <a>，否则渲染为 <div>（默认行为）。
   */
  href?: string;
  /**
   * 仅在 href 存在时有效。缺少 href 时会抛出错误。
   */
  target?: string;
};

const paddingClassMap: Record<CardPadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

export const Card = ({
  children,
  className,
  href,
  padding = 'md',
  shape = 'auto',
  style,
  target,
  ...props
}: CardProps) => {
  if (target !== undefined && href === undefined) {
    throw new Error('Card: target requires href.');
  }

  const sharedClassName = classNames(
    styles.root,
    paddingClassMap[padding],
    shape === 'rect' && styles.shapeRect,
    className,
  );

  if (href !== undefined) {
    return (
      <a
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        className={sharedClassName}
        href={href}
        style={style}
        target={target}
      >
        {children}
      </a>
    );
  }

  return (
    <div {...(props as HTMLAttributes<HTMLDivElement>)} className={sharedClassName} style={style}>
      {children}
    </div>
  );
};
```

- [ ] **Step 4: 运行测试，确认全部通过**

```bash
vp test packages/react/src/card/index.test.ts
```

预期：所有测试通过，无报错。

- [ ] **Step 5: 提交**

```bash
git add packages/react/src/card/index.tsx packages/react/src/card/index.test.ts
git commit -m "feat(card): add href/target props for anchor rendering"
```

---

## Task 2: Tooltip placement prop

**Files:**

- Modify: `packages/react/src/tooltip/index.tsx`
- Modify: `packages/react/src/tooltip/index.test.tsx`

- [ ] **Step 1: 在 tooltip/index.test.tsx 追加失败测试**

在文件末尾追加（保留所有已有测试）：

```tsx
it('accepts placement prop without error', () => {
  render(
    <Tooltip.Root placement="top">
      <Tooltip.Trigger>
        <button>Hover me</button>
      </Tooltip.Trigger>
      <Tooltip.Content>Tooltip text</Tooltip.Content>
    </Tooltip.Root>,
  );
  expect(screen.getByRole('button', { name: 'Hover me' })).toBeTruthy();
});

it('accepts all valid placement values without error', () => {
  const placements = [
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
    'right',
    'right-start',
    'right-end',
  ] as const;

  for (const placement of placements) {
    expect(() =>
      render(
        <Tooltip.Root placement={placement}>
          <Tooltip.Trigger>
            <button>t</button>
          </Tooltip.Trigger>
          <Tooltip.Content>c</Tooltip.Content>
        </Tooltip.Root>,
      ),
    ).not.toThrow();
    cleanup();
  }
});
```

**注意：** 这两个 `it` 块需要放在已有 `describe('Tooltip', () => { ... })` 块内部，放在最后一个 `it` 之后、闭合 `})` 之前。

- [ ] **Step 2: 运行测试，确认 TypeScript 报错（placement 未定义）**

```bash
vp test packages/react/src/tooltip/index.test.tsx
```

预期：TypeScript 编译报错，`placement` 不在 `TooltipRootProps` 上。

- [ ] **Step 3: 更新 tooltip/index.tsx**

完整替换文件内容：

```tsx
import { createContext, type CSSProperties, type ReactNode, useContext } from 'react';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';
import classNames from 'classnames';

import styles from './index.module.less';

type TooltipSize = 'sm' | 'md' | 'lg';

export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

const TooltipSizeContext = createContext<TooltipSize>('sm');

export type TooltipRootProps = {
  openDelay?: number;
  closeDelay?: number;
  children: ReactNode;
  size?: TooltipSize;
  /** Preferred placement of the tooltip relative to its trigger. Defaults to Ark UI's 'bottom'. */
  placement?: TooltipPlacement;
};

export type TooltipTriggerProps = {
  children: ReactNode;
};

export type TooltipContentProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const sizeClassMap: Record<TooltipSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const TooltipRoot = ({
  openDelay = 400,
  closeDelay = 100,
  children,
  size = 'sm',
  placement,
}: TooltipRootProps) => (
  <TooltipSizeContext value={size}>
    <ArkTooltip.Root
      closeDelay={closeDelay}
      lazyMount
      openDelay={openDelay}
      positioning={{ placement }}
      unmountOnExit
    >
      {children}
    </ArkTooltip.Root>
  </TooltipSizeContext>
);

const TooltipTrigger = ({ children }: TooltipTriggerProps) => (
  <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
);

const TooltipContent = ({ children, className, style }: TooltipContentProps) => {
  const size = useContext(TooltipSizeContext);
  return (
    <ArkTooltip.Positioner>
      <ArkTooltip.Content
        className={classNames(styles.content, sizeClassMap[size], className)}
        style={style}
      >
        {children}
      </ArkTooltip.Content>
    </ArkTooltip.Positioner>
  );
};

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
```

- [ ] **Step 4: 运行测试，确认全部通过**

```bash
vp test packages/react/src/tooltip/index.test.tsx
```

预期：所有测试通过，无报错。

- [ ] **Step 5: 提交**

```bash
git add packages/react/src/tooltip/index.tsx packages/react/src/tooltip/index.test.tsx
git commit -m "feat(tooltip): add placement prop"
```

---

## Task 3: Nav 复合组件

**Files:**

- Create: `packages/react/src/nav/index.tsx`
- Create: `packages/react/src/nav/index.module.less`
- Create: `packages/react/src/nav/index.test.ts`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 创建测试文件 nav/index.test.ts**

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { Nav, type NavRootProps, type NavLinkProps } from './index';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

// ── Nav.Root ──────────────────────────────────────────────────────────────

test('Nav.Root renders as nav element', () => {
  const markup = renderToStaticMarkup(createElement(Nav.Root, {}));
  expect(markup).toContain('<nav');
});

test('Nav.Root has default aria-label "navigation"', () => {
  const markup = renderToStaticMarkup(createElement(Nav.Root, {}));
  expect(markup).toContain('aria-label="navigation"');
});

test('Nav.Root accepts custom aria-label', () => {
  const markup = renderToStaticMarkup(createElement(Nav.Root, { 'aria-label': '主导航' }));
  expect(markup).toContain('aria-label="主导航"');
});

test('Nav.Root forwards className and style', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, { className: 'my-nav', style: { gap: '8px' } }),
  );
  expect(markup).toContain('my-nav');
  expect(markup).toContain('gap');
});

// ── Nav.Link ──────────────────────────────────────────────────────────────

test('Nav.Link renders as anchor element', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about' }, 'About')),
  );
  expect(markup).toContain('<a');
  expect(markup).toContain('href="/about"');
});

test('Nav.Link adds data-active attribute when active=true', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about', active: true }, 'About')),
  );
  expect(markup).toContain('data-active');
});

test('Nav.Link omits data-active when active=false', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Nav.Root,
      {},
      createElement(Nav.Link, { href: '/about', active: false }, 'About'),
    ),
  );
  expect(markup).not.toContain('data-active');
});

test('Nav.Link omits data-active when active is not provided', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/about' }, 'About')),
  );
  expect(markup).not.toContain('data-active');
});

test('Nav.Link renders label text', () => {
  const markup = renderToStaticMarkup(
    createElement(Nav.Root, {}, createElement(Nav.Link, { href: '/' }, 'Home')),
  );
  expect(markup).toContain('Home');
});

test('Nav.Link forwards className', () => {
  const markup = renderToStaticMarkup(
    createElement(
      Nav.Root,
      {},
      createElement(Nav.Link, { href: '/', className: 'custom-link' }, 'Home'),
    ),
  );
  expect(markup).toContain('custom-link');
});

// ── Compound structure ────────────────────────────────────────────────────

test('Nav exports Root and Link as compound components', () => {
  expect(typeof Nav.Root).toBe('function');
  expect(typeof Nav.Link).toBe('function');
});

// ── Stylesheet token checks ───────────────────────────────────────────────

test('nav stylesheet uses --ui-color-text-muted for default link color', () => {
  expect(stylesheet).toContain('--ui-color-text-muted');
});

test('nav stylesheet uses --ui-color-brand-bg for active indicator', () => {
  expect(stylesheet).toContain('--ui-color-brand-bg');
});

test('nav stylesheet uses color-mix for hover background', () => {
  expect(stylesheet).toContain('color-mix');
});

test('nav stylesheet uses focus-ring-offset mixin', () => {
  expect(stylesheet).toContain('focus-ring-offset');
});

test('nav stylesheet does not use raw palette tokens', () => {
  expect(stylesheet).not.toContain('--ui-color-palette-');
});
```

- [ ] **Step 2: 运行测试，确认全部失败**

```bash
vp test packages/react/src/nav/index.test.ts
```

预期：失败，模块未找到。

- [ ] **Step 3: 创建 nav/index.module.less**

```less
@import '@deweyou-design/styles/less/bridge';

// ── Root ──────────────────────────────────────────────────────────────────

.root {
  display: flex;
  margin: 0;
  padding: 0;
}

.orientationHorizontal {
  align-items: center;
  flex-direction: row;
}

.orientationVertical {
  flex-direction: column;
}

// ── Size scale ────────────────────────────────────────────────────────────

.sizeSm {
  font-size: 0.875rem;
}

.sizeMd {
  font-size: 1rem;
}

.sizeLg {
  font-size: 1.0625rem;
}

// ── Link ──────────────────────────────────────────────────────────────────

.link {
  align-items: center;
  border-radius: var(--ui-radius-float);
  color: var(--ui-color-text-muted);
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: 6px;
  padding: 6px 10px;
  position: relative;
  text-decoration: none;
  transition:
    background 140ms ease,
    color 140ms ease;

  &:hover {
    background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
    color: var(--ui-color-text);
  }

  &:focus-visible {
    .focus-ring-offset();
  }

  &[data-active] {
    color: var(--ui-color-text);
  }
}

// Active indicator — horizontal: bottom bar
.linkHorizontal {
  &[data-active]::after {
    background: var(--ui-color-brand-bg);
    bottom: 0;
    content: '';
    height: 2px;
    left: 6px;
    position: absolute;
    right: 6px;
  }
}

// Active indicator — vertical: left bar
.linkVertical {
  &[data-active]::before {
    background: var(--ui-color-brand-bg);
    bottom: 6px;
    content: '';
    left: 0;
    position: absolute;
    top: 6px;
    width: 2px;
  }
}

// ── Link internals ────────────────────────────────────────────────────────

.linkIcon {
  display: flex;
  flex-shrink: 0;
}

.linkLabel {
  // semantic wrapper only
}

// ── Reduced motion ────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .link {
    transition: none;
  }
}
```

- [ ] **Step 4: 创建 nav/index.tsx**

```tsx
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

// ── Context ───────────────────────────────────────────────────────────────

export type NavOrientation = 'horizontal' | 'vertical';
export type NavSize = 'sm' | 'md' | 'lg';

type NavContextValue = { orientation: NavOrientation; size: NavSize };

const NavContext = createContext<NavContextValue>({ orientation: 'horizontal', size: 'md' });

// ── Class maps ────────────────────────────────────────────────────────────

const sizeClassMap: Record<NavSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const orientationClassMap: Record<NavOrientation, string> = {
  horizontal: styles.orientationHorizontal,
  vertical: styles.orientationVertical,
};

// ── Nav.Root ──────────────────────────────────────────────────────────────

export type NavRootProps = HTMLAttributes<HTMLElement> & {
  /** Accessible label for the nav landmark. Defaults to 'navigation'. */
  'aria-label'?: string;
  /** Layout direction of the nav items. Defaults to 'horizontal'. */
  orientation?: NavOrientation;
  /** Size scale for font and spacing. Defaults to 'md'. */
  size?: NavSize;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const NavRoot = ({
  'aria-label': ariaLabel = 'navigation',
  orientation = 'horizontal',
  size = 'md',
  children,
  className,
  style,
  ...props
}: NavRootProps) => (
  <NavContext.Provider value={{ orientation, size }}>
    <nav
      {...props}
      aria-label={ariaLabel}
      className={classNames(
        styles.root,
        orientationClassMap[orientation],
        sizeClassMap[size],
        className,
      )}
      style={style}
    >
      {children}
    </nav>
  </NavContext.Provider>
);

// ── Nav.Link ──────────────────────────────────────────────────────────────

export type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** When true, applies active styles and adds data-active attribute. */
  active?: boolean;
  /** Optional leading icon rendered before the label. */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const NavLink = ({ active, icon, children, className, style, ...props }: NavLinkProps) => {
  const { orientation } = useContext(NavContext);

  return (
    <a
      {...props}
      className={classNames(
        styles.link,
        orientation === 'vertical' ? styles.linkVertical : styles.linkHorizontal,
        className,
      )}
      data-active={active ? '' : undefined}
      style={style}
    >
      {icon !== undefined && <span className={styles.linkIcon}>{icon}</span>}
      <span className={styles.linkLabel}>{children}</span>
    </a>
  );
};

// ── Compound export ───────────────────────────────────────────────────────

export const Nav = {
  Root: NavRoot,
  Link: NavLink,
};
```

- [ ] **Step 5: 运行测试，确认全部通过**

```bash
vp test packages/react/src/nav/index.test.ts
```

预期：所有测试通过。

- [ ] **Step 6: 在 packages/react/src/index.ts 追加导出**

在文件末尾追加：

```ts
export {
  Nav,
  type NavRootProps,
  type NavLinkProps,
  type NavOrientation,
  type NavSize,
} from './nav/index.tsx';
```

- [ ] **Step 7: 类型检查**

```bash
vp check
```

预期：无类型错误，无 lint 错误。

- [ ] **Step 8: 提交**

```bash
git add packages/react/src/nav/ packages/react/src/index.ts
git commit -m "feat(nav): add Nav compound component with active state and orientation support"
```

---

## Task 4: NavOverlay 全屏覆盖层

**Files:**

- Create: `packages/react/src/nav-overlay/index.tsx`
- Create: `packages/react/src/nav-overlay/index.module.less`
- Create: `packages/react/src/nav-overlay/index.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: 创建测试文件 nav-overlay/index.test.tsx**

```tsx
// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { NavOverlay } from './index.tsx';

const stylesheet = readFileSync(resolve(import.meta.dirname, 'index.module.less'), 'utf8');

afterEach(() => {
  cleanup();
});

describe('NavOverlay', () => {
  it('renders the trigger element', () => {
    render(
      <NavOverlay.Root>
        <NavOverlay.Trigger>
          <button>Open nav</button>
        </NavOverlay.Trigger>
        <NavOverlay.Content>Navigation content</NavOverlay.Content>
      </NavOverlay.Root>,
    );
    expect(screen.getByRole('button', { name: 'Open nav' })).toBeTruthy();
  });

  it('content is not visible by default (lazyMount + unmountOnExit)', () => {
    render(
      <NavOverlay.Root>
        <NavOverlay.Trigger>
          <button>Open nav</button>
        </NavOverlay.Trigger>
        <NavOverlay.Content>Navigation content</NavOverlay.Content>
      </NavOverlay.Root>,
    );
    expect(screen.queryByText('Navigation content')).toBeNull();
  });

  it('exports Root, Trigger, Content, CloseButton as compound components', () => {
    expect(typeof NavOverlay.Root).toBe('function');
    expect(typeof NavOverlay.Trigger).toBe('function');
    expect(typeof NavOverlay.Content).toBe('function');
    expect(typeof NavOverlay.CloseButton).toBe('function');
  });

  it('accepts controlled open/onOpenChange props without error', () => {
    const onOpenChange = () => {};
    expect(() =>
      render(
        <NavOverlay.Root open={false} onOpenChange={onOpenChange}>
          <NavOverlay.Trigger>
            <button>Open</button>
          </NavOverlay.Trigger>
          <NavOverlay.Content>Content</NavOverlay.Content>
        </NavOverlay.Root>,
      ),
    ).not.toThrow();
  });
});

describe('NavOverlay stylesheet', () => {
  it('uses position fixed and inset 0 for fullscreen', () => {
    expect(stylesheet).toContain('position: fixed');
    expect(stylesheet).toContain('inset: 0');
  });

  it('uses --ui-color-surface as background', () => {
    expect(stylesheet).toContain('--ui-color-surface');
  });

  it('uses --ui-z-dialog for z-index', () => {
    expect(stylesheet).toContain('--ui-z-dialog');
  });

  it('defines open/closed animations', () => {
    expect(stylesheet).toContain("data-state='open'");
    expect(stylesheet).toContain("data-state='closed'");
  });

  it('responds to prefers-reduced-motion', () => {
    expect(stylesheet).toContain('prefers-reduced-motion');
  });

  it('does not use raw palette tokens', () => {
    expect(stylesheet).not.toContain('--ui-color-palette-');
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
vp test packages/react/src/nav-overlay/index.test.tsx
```

预期：失败，模块未找到。

- [ ] **Step 3: 创建 nav-overlay/index.module.less**

```less
@import '@deweyou-design/styles/less/bridge';

// ── Content (fullscreen) ──────────────────────────────────────────────────

.content {
  background: var(--ui-color-surface);
  box-sizing: border-box;
  inset: 0;
  outline: none;
  overflow-y: auto;
  padding: var(--ui-space-lg);
  position: fixed;
  z-index: var(--ui-z-dialog);
}

.content[data-state='open'] {
  animation: navOverlayIn 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.content[data-state='closed'] {
  animation: navOverlayOut 160ms ease forwards;
}

@keyframes navOverlayIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes navOverlayOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px);
  }
}

// ── Reduced motion ────────────────────────────────────────────────────────

@media (prefers-reduced-motion: reduce) {
  .content[data-state='open'] {
    animation: navOverlayFadeIn 160ms ease;
  }

  .content[data-state='closed'] {
    animation: navOverlayFadeOut 160ms ease forwards;
  }
}

@keyframes navOverlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes navOverlayFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

// ── Close button ──────────────────────────────────────────────────────────

.closeButton {
  position: absolute;
  right: var(--ui-space-md);
  top: var(--ui-space-md);
}
```

- [ ] **Step 4: 创建 nav-overlay/index.tsx**

```tsx
import { type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  DialogCloseTrigger as ArkDialogCloseTrigger,
  DialogContent as ArkDialogContent,
  DialogRoot as ArkDialogRoot,
  DialogTrigger as ArkDialogTrigger,
} from '@ark-ui/react/dialog';
import classNames from 'classnames';

import { IconButton } from '../button/index.tsx';
import styles from './index.module.less';

// ── Inline close icon (no cross-package dependency) ───────────────────────

const CloseSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeLinecap="square" strokeWidth="2" d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

// ── Types ─────────────────────────────────────────────────────────────────

export type NavOverlayOpenChangeDetails = { open: boolean };

export type NavOverlayRootProps = {
  /** Controlled open state. Use with onOpenChange for full control. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Defaults to false. */
  defaultOpen?: boolean;
  /** Callback fired when the overlay opens or closes. */
  onOpenChange?: (details: NavOverlayOpenChangeDetails) => void;
  children: ReactNode;
};

export type NavOverlayTriggerProps = {
  /** The trigger element. Must be a single focusable element. */
  children: ReactNode;
};

export type NavOverlayContentProps = {
  /** Navigation content rendered inside the fullscreen overlay. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type NavOverlayCloseButtonProps = {
  /** Override the default top-right positioning. */
  className?: string;
  style?: CSSProperties;
};

// ── Sub-components ────────────────────────────────────────────────────────

const NavOverlayRoot = ({ open, defaultOpen, onOpenChange, children }: NavOverlayRootProps) => (
  <ArkDialogRoot
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    lazyMount
    unmountOnExit
  >
    {children}
  </ArkDialogRoot>
);

const NavOverlayTrigger = ({ children }: NavOverlayTriggerProps) => (
  <ArkDialogTrigger asChild>{children}</ArkDialogTrigger>
);

const NavOverlayContent = ({ children, className, style }: NavOverlayContentProps) =>
  createPortal(
    <ArkDialogContent className={classNames(styles.content, className)} style={style}>
      {children}
    </ArkDialogContent>,
    document.body,
  );

const NavOverlayCloseButton = ({ className, style }: NavOverlayCloseButtonProps) => (
  <ArkDialogCloseTrigger asChild>
    <IconButton
      aria-label="关闭导航"
      className={classNames(styles.closeButton, className)}
      icon={<CloseSvg />}
      style={style}
      variant="ghost"
    />
  </ArkDialogCloseTrigger>
);

// ── Compound export ───────────────────────────────────────────────────────

export const NavOverlay = {
  Root: NavOverlayRoot,
  Trigger: NavOverlayTrigger,
  Content: NavOverlayContent,
  CloseButton: NavOverlayCloseButton,
};
```

- [ ] **Step 5: 运行测试，确认全部通过**

```bash
vp test packages/react/src/nav-overlay/index.test.tsx
```

预期：所有测试通过。

- [ ] **Step 6: 在 packages/react/src/index.ts 追加导出**

在文件末尾追加：

```ts
export {
  NavOverlay,
  type NavOverlayRootProps,
  type NavOverlayTriggerProps,
  type NavOverlayContentProps,
  type NavOverlayCloseButtonProps,
  type NavOverlayOpenChangeDetails,
} from './nav-overlay/index.tsx';
```

- [ ] **Step 7: 全量类型检查**

```bash
vp check
```

预期：无类型错误，无 lint 错误。

- [ ] **Step 8: 全量测试**

```bash
vp test
```

预期：所有测试通过。

- [ ] **Step 9: 提交**

```bash
git add packages/react/src/nav-overlay/ packages/react/src/index.ts
git commit -m "feat(nav-overlay): add fullscreen navigation overlay component"
```

---

## 自检：Spec 覆盖率

| 需求                                              | 覆盖任务                              |
| ------------------------------------------------- | ------------------------------------- |
| Card `href`/`target` 多态                         | Task 1                                |
| Card `target` 无 `href` 时抛错                    | Task 1 Step 1（测试）、Step 3（实现） |
| Tooltip `placement` 透传 Ark UI                   | Task 2                                |
| Nav.Root 渲染 `<nav>`，aria-label 默认值          | Task 3                                |
| Nav.Root 通过 Context 传递 orientation/size       | Task 3 Step 4（NavContext）           |
| Nav.Link active 状态 → `data-active`              | Task 3                                |
| Nav.Link 水平/垂直指示条                          | Task 3 Step 3（CSS）                  |
| Nav.Link focus-visible 焦点环                     | Task 3 Step 3（CSS）                  |
| NavOverlay 全屏 fixed + inset:0                   | Task 4 Step 3（CSS）                  |
| NavOverlay 基于 Ark UI Dialog（焦点捕获、Escape） | Task 4 Step 4（ArkDialogRoot）        |
| NavOverlay lazyMount + unmountOnExit              | Task 4 Step 4                         |
| NavOverlay 入场/出场动画                          | Task 4 Step 3（CSS）                  |
| NavOverlay prefers-reduced-motion                 | Task 4 Step 3（CSS）                  |
| Nav、NavOverlay 导出到包根入口                    | Task 3 Step 6、Task 4 Step 6          |
