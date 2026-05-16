# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `apps/website` into a design-specification-first Deweyou Design website with a compact top nav, Overview manual, full Components catalog, Icons page refresh, Storybook external links, and website font subset loading.

**Architecture:** Keep the website as a Vite/React app with route-level pages under `apps/website/src/pages`. Put reusable website data in small `apps/website/src/data/*.tsx` modules, keep visual structure in page-local Less modules, and centralize Storybook URLs in one catalog so links are not scattered through markup. Keep Storybook embedded nowhere: all Storybook integration is external deep links.

**Tech Stack:** TypeScript 5.x, React 19.x, React Router, Less CSS Modules, vite-plus, `@deweyou-design/react`, `@deweyou-design/react-icons`, `@deweyou-design/styles`, jsdom tests via `vite-plus/test`.

---

## File Structure

Create:

- `apps/website/src/data/component-catalog.tsx` — full public component catalog, preview renderers, category metadata, Storybook deep link helpers.
- `apps/website/src/data/component-catalog.test.tsx` — catalog coverage and Storybook URL tests.
- `apps/website/src/pages/components.tsx` — Components page route.
- `apps/website/src/pages/components.module.less` — Components page layout and card styling.
- `apps/website/src/pages/components.test.tsx` — Components page rendering tests.
- `packages/styles/src/css/theme-with-fonts.css` — consumer CSS entry that preserves full vendored font loading.

Modify:

- `apps/website/src/main.tsx` — route `/components`, top-nav theme toggle props, hash-scroll correction, website font subset import.
- `apps/website/src/components/navbar.tsx` — compact top navigation and theme toggle.
- `apps/website/src/components/navbar.module.less` — fixed compact top bar.
- `apps/website/src/components/navbar.test.tsx` — final nav contract.
- `apps/website/src/pages/home.tsx` — Overview design manual content.
- `apps/website/src/pages/home.module.less` — Overview editorial/spec layout.
- `apps/website/src/pages/icons.tsx` — copy and site shell alignment.
- `apps/website/src/pages/icons.module.less` — Icons visual refresh.
- `apps/website/src/pages/icons.test.tsx` — keep search/copy behavior covered.
- `apps/website/src/style.css` — global scroll padding and base background.
- `apps/website/vite.config.ts` — website font subset virtual module and aliases.
- `packages/styles/src/css/theme.css` — remove full font import from default theme entry.
- `packages/styles/vite.config.ts` — export `theme-with-fonts.css`.
- `packages/styles/package.json` — export `./theme-with-fonts.css`.
- `packages/styles/tests/theme-outputs.test.ts` — assert split CSS contract.
- `pnpm-workspace.yaml` / `pnpm-lock.yaml` — add a font subset dependency if the implementation uses one.
- `apps/storybook/src/stories/Field.stories.tsx`, `apps/storybook/src/stories/Nav.stories.tsx`, `apps/storybook/src/stories/NavOverlay.stories.tsx` — only if direct stories are missing and the catalog cannot link every public component to an existing story.

## Task 1: Compact Top Navigation And Routing

**Files:**

- Modify: `apps/website/src/components/navbar.test.tsx`
- Modify: `apps/website/src/components/navbar.tsx`
- Modify: `apps/website/src/components/navbar.module.less`
- Modify: `apps/website/src/main.tsx`
- Modify: `apps/website/src/style.css`

- [ ] **Step 1: Write the failing navbar contract test**

Replace `apps/website/src/components/navbar.test.tsx` with tests that expect the final top-nav contract:

```tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { Navbar } from './navbar';

afterEach(() => {
  cleanup();
});

const renderNavbar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar mode="light" onToggleMode={() => undefined} />
    </MemoryRouter>,
  );

test('renders the compact top navigation without a Theme destination', () => {
  renderNavbar();

  expect(screen.getByText('Deweyou Design')).toBeInTheDocument();
  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Components')).toBeInTheDocument();
  expect(screen.getByText('Icons')).toBeInTheDocument();
  expect(screen.getByText('Storybook ↗')).toBeInTheDocument();
  expect(screen.getByText('GitHub ↗')).toBeInTheDocument();
  expect(screen.queryByText('Theme')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '切换深色模式' })).toBeInTheDocument();
});

test('marks Overview active on the home route', () => {
  renderNavbar('/');
  expect(screen.getByText('Overview').closest('a')?.className).toContain('active');
});

test('marks Components active on /components', () => {
  renderNavbar('/components');
  expect(screen.getByText('Components').closest('a')?.className).toContain('active');
});

test('marks Icons active on /icons', () => {
  renderNavbar('/icons');
  expect(screen.getByText('Icons').closest('a')?.className).toContain('active');
});
```

- [ ] **Step 2: Run the navbar test to verify it fails**

Run:

```bash
pnpm exec vp test apps/website/src/components/navbar.test.tsx
```

Expected: FAIL because `Navbar` has no `mode` or `onToggleMode` props, no `Components` link, and currently renders no in-nav theme toggle.

- [ ] **Step 3: Implement `Navbar` props and link set**

Update `apps/website/src/components/navbar.tsx` to this structure:

```tsx
import { NavLink } from 'react-router-dom';

import { IconButton } from '@deweyou-design/react';
import { SettingsIcon } from '@deweyou-design/react-icons';

import styles from './navbar.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';
const GITHUB_URL = 'https://github.com/deweyou/design';

type NavbarProps = {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
};

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `${styles.link}${isActive ? ` ${styles.active}` : ''}`;

export const Navbar = ({ mode, onToggleMode }: NavbarProps) => (
  <nav className={styles.navbar} aria-label="Primary navigation">
    <NavLink to="/" className={styles.mark}>
      <span>Deweyou Design</span>
      <small>v1.0</small>
    </NavLink>

    <div className={styles.links}>
      <NavLink to="/" end className={linkClassName}>
        Overview
      </NavLink>
      <NavLink to="/components" className={linkClassName}>
        Components
      </NavLink>
      <NavLink to="/icons" className={linkClassName}>
        Icons
      </NavLink>
      <a href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        Storybook ↗
      </a>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
        GitHub ↗
      </a>
    </div>

    <div className={styles.actions}>
      <span className={styles.modeLabel}>{mode}</span>
      <IconButton
        aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
        icon={<SettingsIcon />}
        shape="pill"
        size="sm"
        variant="outlined"
        onClick={onToggleMode}
      />
    </div>
  </nav>
);
```

- [ ] **Step 4: Restyle `navbar.module.less` as a fixed compact top bar**

Replace the side-nav layout with a top bar that has stable height and horizontal scroll on narrow widths:

```less
.navbar {
  --website-line: color-mix(in srgb, var(--ui-color-text) 14%, transparent);

  align-items: center;
  backdrop-filter: blur(18px);
  background: color-mix(in srgb, var(--ui-color-canvas) 94%, transparent);
  border-bottom: 1px solid var(--ui-color-text);
  display: grid;
  gap: 18px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  inset: 0 0 auto;
  min-height: 64px;
  padding: 0 24px;
  position: fixed;
  z-index: 20;
}

.mark {
  align-items: baseline;
  color: var(--ui-color-text);
  display: inline-flex;
  flex-shrink: 0;
  font-family: var(--ui-font-display);
  font-size: 15px;
  font-weight: 700;
  gap: 8px;
  letter-spacing: 0;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;

  small {
    color: var(--ui-color-text-muted);
    font-family: var(--ui-font-mono);
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
  }
}

.links {
  align-items: center;
  display: flex;
  gap: 4px;
  justify-content: center;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.link {
  align-items: center;
  color: var(--ui-color-text-muted);
  display: inline-flex;
  flex-shrink: 0;
  font-family: var(--ui-font-display);
  font-size: 13px;
  font-weight: 400;
  height: 32px;
  line-height: 1;
  padding: 0 10px;
  position: relative;
  text-decoration: none;
  transition:
    background 140ms ease,
    color 140ms ease;
  white-space: nowrap;

  &:hover {
    background: color-mix(in srgb, var(--ui-color-text) 5%, transparent);
    color: var(--ui-color-text);
  }
}

.active {
  color: var(--ui-color-text);
  font-weight: 600;

  &::before {
    color: var(--ui-color-brand-text);
    content: '▸';
    margin-right: 4px;
  }
}

.actions {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}

.modeLabel {
  color: var(--ui-color-text-muted);
  font-family: var(--ui-font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

@media (max-width: 760px) {
  .navbar {
    gap: 10px;
    grid-template-columns: 1fr auto;
    min-height: 58px;
    padding: 0 14px;
  }

  .mark {
    font-size: 13px;

    small {
      display: none;
    }
  }

  .links {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    margin-inline: -14px;
    padding: 0 14px 10px;
  }

  .link {
    font-size: 12px;
    height: 28px;
    padding: 0 8px;
  }

  .modeLabel {
    display: none;
  }
}
```

- [ ] **Step 5: Move theme toggle into `Layout` props and add `/components` route**

Update `apps/website/src/main.tsx` so it passes theme state to `Navbar`, adds the Components route, and fixes hash scrolling against the actual nav height:

```tsx
import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom';

import { Toaster } from '@deweyou-design/react';
import { useThemeMode } from '@deweyou-design/react-hooks';
import '@deweyou-design/styles/theme.css';

import { Navbar } from './components/navbar';
import { ComponentsPage } from './pages/components';
import { HomePage } from './pages/home';
import { IconsPage } from './pages/icons';
import './style.css';

const Layout = () => {
  const { mode, toggleMode } = useThemeMode('light');
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      const navigation = document.querySelector('nav[aria-label="Primary navigation"]');

      if (!target) {
        return;
      }

      const navigationHeight = navigation?.getBoundingClientRect().height ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navigationHeight;

      window.scrollTo({ top: Math.max(0, targetTop) });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <>
      <Navbar mode={mode} onToggleMode={toggleMode} />
      <Outlet />
      <Toaster />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'components', element: <ComponentsPage /> },
      { path: 'icons', element: <IconsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
```

Use a temporary `ComponentsPage` export if Task 3 has not created the real page yet:

```tsx
export const ComponentsPage = () => <main>Components</main>;
```

- [ ] **Step 6: Update global scroll padding**

Update `apps/website/src/style.css` with fixed-nav scroll offsets:

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 64px;
}

@media (max-width: 760px) {
  html {
    scroll-padding-top: 116px;
  }
}
```

Keep the existing body font smoothing and background declarations.

- [ ] **Step 7: Run navbar test to verify it passes**

Run:

```bash
pnpm exec vp test apps/website/src/components/navbar.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/website/src/components/navbar.tsx apps/website/src/components/navbar.module.less apps/website/src/components/navbar.test.tsx apps/website/src/main.tsx apps/website/src/style.css apps/website/src/pages/components.tsx
git commit -m "feat(website): add compact top navigation"
```

## Task 2: Component Catalog Data And Storybook Links

**Files:**

- Create: `apps/website/src/data/component-catalog.tsx`
- Create: `apps/website/src/data/component-catalog.test.tsx`
- Optionally create: `apps/storybook/src/stories/Field.stories.tsx`
- Optionally create: `apps/storybook/src/stories/Nav.stories.tsx`
- Optionally create: `apps/storybook/src/stories/NavOverlay.stories.tsx`

- [ ] **Step 1: Write the failing component catalog test**

Create `apps/website/src/data/component-catalog.test.tsx`:

```tsx
// @vitest-environment jsdom

import { test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { COMPONENT_CATEGORIES, COMPONENT_CATALOG, getStorybookUrl } from './component-catalog';

const PUBLIC_COMPONENTS = [
  'Badge',
  'Breadcrumb',
  'Button',
  'IconButton',
  'Card',
  'Checkbox',
  'Dialog',
  'Field',
  'Input',
  'MarkdownRender',
  'Menu',
  'ContextMenu',
  'Nav',
  'NavOverlay',
  'Pagination',
  'Popover',
  'RadioGroup',
  'ScrollArea',
  'Select',
  'Separator',
  'Skeleton',
  'Spinner',
  'Switch',
  'Tabs',
  'Text',
  'Textarea',
  'toast',
  'Toaster',
  'Tooltip',
  'VirtualList',
];

test('catalog covers every public React component surface', () => {
  expect(COMPONENT_CATALOG.map((item) => item.name)).toEqual(PUBLIC_COMPONENTS);
});

test('catalog entries have categories, import snippets, dimensions, previews, and story links', () => {
  for (const item of COMPONENT_CATALOG) {
    expect(COMPONENT_CATEGORIES.map((category) => category.id)).toContain(item.category);
    expect(item.importSnippet).toContain('@deweyou-design/react');
    expect(item.dimensions.length).toBeGreaterThan(0);
    expect(item.storyId).toMatch(/^components-/);
    expect(item.preview).toBeDefined();
    expect(getStorybookUrl(item.storyId)).toContain(`path=/story/${item.storyId}`);
  }
});
```

- [ ] **Step 2: Run the catalog test to verify it fails**

Run:

```bash
pnpm exec vp test apps/website/src/data/component-catalog.test.tsx
```

Expected: FAIL because `component-catalog.tsx` does not exist.

- [ ] **Step 3: Create the catalog data module**

Create `apps/website/src/data/component-catalog.tsx` with one centralized story URL helper and all public entries:

```tsx
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  IconButton,
  Input,
  MarkdownRender,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Nav,
  NavOverlay,
  Pagination,
  Popover,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
  Skeleton,
  Spinner,
  Switch,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Text,
  Textarea,
  Tooltip,
  VirtualList,
  toast,
} from '@deweyou-design/react';
import { SearchIcon, SettingsIcon } from '@deweyou-design/react-icons';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';

export const COMPONENT_CATEGORIES = [
  { id: 'actions', label: 'Actions' },
  { id: 'forms', label: 'Forms' },
  { id: 'overlays', label: 'Overlays' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'content', label: 'Content' },
  { id: 'data', label: 'Data' },
] as const;

export type ComponentCategoryId = (typeof COMPONENT_CATEGORIES)[number]['id'];

export type ComponentCatalogItem = {
  category: ComponentCategoryId;
  description: string;
  dimensions: string[];
  importSnippet: string;
  name: string;
  preview: React.ReactNode;
  storyId: string;
};

export const getStorybookUrl = (storyId: string) => `${STORYBOOK_URL}/?path=/story/${storyId}`;

const buttonPreview = (
  <>
    <Button color="primary" size="sm" variant="filled">
      Primary
    </Button>
    <Button color="neutral" size="sm" variant="outlined">
      Outline
    </Button>
  </>
);

export const COMPONENT_CATALOG: ComponentCatalogItem[] = [
  {
    name: 'Badge',
    category: 'feedback',
    description: 'Compact status and metadata label for low-density surfaces.',
    importSnippet: "import { Badge } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'shape'],
    storyId: 'components-badge--default',
    preview: <Badge color="primary">Stable</Badge>,
  },
  {
    name: 'Breadcrumb',
    category: 'navigation',
    description: 'Hierarchy trail for document and application navigation.',
    importSnippet: "import { Breadcrumb } from '@deweyou-design/react';",
    dimensions: ['root', 'item', 'current'],
    storyId: 'components-breadcrumb--default',
    preview: <Breadcrumb.Root items={[{ label: 'Docs' }, { label: 'Components' }]} />,
  },
  {
    name: 'Button',
    category: 'actions',
    description: 'Primary command surface with semantic variants and stable sizing.',
    importSnippet: "import { Button } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'size', 'shape'],
    storyId: 'components-button--variants',
    preview: buttonPreview,
  },
  {
    name: 'IconButton',
    category: 'actions',
    description: 'Icon-only command that keeps accessible names explicit.',
    importSnippet: "import { IconButton } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'size', 'shape'],
    storyId: 'components-button--variants',
    preview: (
      <IconButton aria-label="Settings" icon={<SettingsIcon />} size="sm" variant="outlined" />
    ),
  },
  {
    name: 'Card',
    category: 'content',
    description: 'Border-led content container for small grouped surfaces.',
    importSnippet: "import { Card } from '@deweyou-design/react';",
    dimensions: ['padding', 'shape'],
    storyId: 'components-card--default',
    preview: <Card padding="sm">Card surface</Card>,
  },
  {
    name: 'Checkbox',
    category: 'forms',
    description: 'Binary choice control with checked, unchecked, and disabled states.',
    importSnippet: "import { Checkbox } from '@deweyou-design/react';",
    dimensions: ['checked', 'disabled', 'invalid'],
    storyId: 'components-checkbox--default',
    preview: <Checkbox defaultChecked>Accept</Checkbox>,
  },
  {
    name: 'Dialog',
    category: 'overlays',
    description: 'Modal decision surface for focused confirmation and details.',
    importSnippet: "import { Dialog } from '@deweyou-design/react';",
    dimensions: ['root', 'trigger', 'content'],
    storyId: 'components-dialog--default',
    preview: (
      <Button size="sm" variant="outlined">
        Open dialog
      </Button>
    ),
  },
  {
    name: 'Field',
    category: 'forms',
    description: 'Label, description, and validation wiring for form controls.',
    importSnippet: "import { Field } from '@deweyou-design/react';",
    dimensions: ['label', 'description', 'error'],
    storyId: 'components-field--default',
    preview: (
      <Field.Root id="catalog-field" hasDescription>
        <Field.Label>Name</Field.Label>
        <Field.Control>
          <input aria-label="Name" />
        </Field.Control>
        <Field.Description>Short field hint</Field.Description>
      </Field.Root>
    ),
  },
  {
    name: 'Input',
    category: 'forms',
    description: 'Single-line text input with Deweyou field styling.',
    importSnippet: "import { Input } from '@deweyou-design/react';",
    dimensions: ['size', 'disabled', 'invalid'],
    storyId: 'components-input--default',
    preview: <Input placeholder="Search..." size="sm" />,
  },
  {
    name: 'MarkdownRender',
    category: 'content',
    description: 'Safe CommonMark and GFM rendering surface for product content.',
    importSnippet: "import { MarkdownRender } from '@deweyou-design/react';",
    dimensions: ['size', 'components', 'callbacks'],
    storyId: 'components-markdownrender--default',
    preview: <MarkdownRender size="sm" value={'### Markdown\\nCompact rendering.'} />,
  },
  {
    name: 'Menu',
    category: 'overlays',
    description: 'Command menu and selection surface for grouped actions.',
    importSnippet: "import { Menu, MenuTrigger, MenuContent } from '@deweyou-design/react';",
    dimensions: ['size', 'placement', 'selection'],
    storyId: 'components-menu--basic',
    preview: (
      <Menu>
        <MenuTrigger>
          <Button size="sm" variant="outlined">
            Menu
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="copy">Copy</MenuItem>
        </MenuContent>
      </Menu>
    ),
  },
  {
    name: 'ContextMenu',
    category: 'overlays',
    description: 'Right-click command surface built on the menu contract.',
    importSnippet: "import { ContextMenu } from '@deweyou-design/react';",
    dimensions: ['trigger', 'content', 'selection'],
    storyId: 'components-menu--context-menu-story',
    preview: (
      <Button size="sm" variant="outlined">
        Context menu
      </Button>
    ),
  },
  {
    name: 'Nav',
    category: 'navigation',
    description: 'Visible navigation landmark for page and app destinations.',
    importSnippet: "import { Nav } from '@deweyou-design/react';",
    dimensions: ['orientation', 'size', 'active'],
    storyId: 'components-nav--default',
    preview: (
      <Nav.Root>
        <Nav.Link href="#" active>
          Overview
        </Nav.Link>
      </Nav.Root>
    ),
  },
  {
    name: 'NavOverlay',
    category: 'navigation',
    description: 'Responsive overlay navigation pattern for compact screens.',
    importSnippet: "import { NavOverlay } from '@deweyou-design/react';",
    dimensions: ['trigger', 'content', 'close'],
    storyId: 'components-navoverlay--default',
    preview: (
      <Button size="sm" variant="outlined">
        Open nav
      </Button>
    ),
  },
  {
    name: 'Pagination',
    category: 'navigation',
    description: 'Paged navigation for lists and document sets.',
    importSnippet: "import { Pagination } from '@deweyou-design/react';",
    dimensions: ['page', 'count', 'link'],
    storyId: 'components-pagination--default',
    preview: <Pagination count={5} page={2} />,
  },
  {
    name: 'Popover',
    category: 'overlays',
    description: 'Anchored floating content for lightweight contextual details.',
    importSnippet: "import { Popover } from '@deweyou-design/react';",
    dimensions: ['placement', 'trigger', 'shape'],
    storyId: 'components-popover--review-matrix',
    preview: (
      <Popover content="Popover content">
        <Button size="sm" variant="outlined">
          Popover
        </Button>
      </Popover>
    ),
  },
  {
    name: 'RadioGroup',
    category: 'forms',
    description: 'Single-choice option group with accessible roving interaction.',
    importSnippet: "import { RadioGroup } from '@deweyou-design/react';",
    dimensions: ['value', 'orientation', 'disabled'],
    storyId: 'components-radiogroup--default',
    preview: (
      <RadioGroup.Root defaultValue="a">
        <RadioGroup.Item value="a">A</RadioGroup.Item>
      </RadioGroup.Root>
    ),
  },
  {
    name: 'ScrollArea',
    category: 'data',
    description: 'Styled scroll container that keeps overflow surfaces consistent.',
    importSnippet: "import { ScrollArea } from '@deweyou-design/react';",
    dimensions: ['viewport', 'scrollbar', 'size'],
    storyId: 'components-scrollarea--default',
    preview: (
      <ScrollArea.Root style={{ height: 56 }}>
        <ScrollArea.Viewport>Scrollable content</ScrollArea.Viewport>
      </ScrollArea.Root>
    ),
  },
  {
    name: 'Select',
    category: 'forms',
    description: 'Listbox selection field with trigger, content, and item primitives.',
    importSnippet: "import { Select } from '@deweyou-design/react';",
    dimensions: ['value', 'placeholder', 'disabled'],
    storyId: 'components-select--default',
    preview: (
      <Select.Root placeholder="Choose">
        <Select.Trigger />
        <Select.Content>
          <Select.Item value="a" label="Option A" />
        </Select.Content>
      </Select.Root>
    ),
  },
  {
    name: 'Separator',
    category: 'content',
    description: 'Semantic dividing line for content and controls.',
    importSnippet: "import { Separator } from '@deweyou-design/react';",
    dimensions: ['orientation', 'decorative'],
    storyId: 'components-separator--default',
    preview: <Separator />,
  },
  {
    name: 'Skeleton',
    category: 'feedback',
    description: 'Low-noise loading affordance for content that has not resolved.',
    importSnippet: "import { Skeleton } from '@deweyou-design/react';",
    dimensions: ['shape', 'width', 'height'],
    storyId: 'components-skeleton--default',
    preview: <Skeleton style={{ height: 24, width: 120 }} />,
  },
  {
    name: 'Spinner',
    category: 'feedback',
    description: 'Small progress indicator for command and inline loading states.',
    importSnippet: "import { Spinner } from '@deweyou-design/react';",
    dimensions: ['size', 'color'],
    storyId: 'components-spinner--default',
    preview: <Spinner size="sm" />,
  },
  {
    name: 'Switch',
    category: 'forms',
    description: 'Immediate on/off setting control.',
    importSnippet: "import { Switch } from '@deweyou-design/react';",
    dimensions: ['checked', 'disabled', 'controlled'],
    storyId: 'components-switch--default',
    preview: <Switch defaultChecked>On</Switch>,
  },
  {
    name: 'Tabs',
    category: 'navigation',
    description: 'Section switcher with line, color, size, and overflow support.',
    importSnippet: "import { Tabs, TabList, TabTrigger, TabContent } from '@deweyou-design/react';",
    dimensions: ['variant', 'color', 'size', 'overflow'],
    storyId: 'components-tabs--basic',
    preview: (
      <Tabs defaultValue="a" size="sm">
        <TabList>
          <TabTrigger value="a">One</TabTrigger>
        </TabList>
        <TabContent value="a">Panel</TabContent>
      </Tabs>
    ),
  },
  {
    name: 'Text',
    category: 'content',
    description: 'Typography primitive for Deweyou heading, body, and caption rhythm.',
    importSnippet: "import { Text } from '@deweyou-design/react';",
    dimensions: ['variant', 'as', 'className'],
    storyId: 'components-typography--text-contract',
    preview: <Text variant="h5">Serif text</Text>,
  },
  {
    name: 'Textarea',
    category: 'forms',
    description: 'Multi-line text input with the same field rhythm as Input.',
    importSnippet: "import { Textarea } from '@deweyou-design/react';",
    dimensions: ['size', 'disabled', 'invalid'],
    storyId: 'components-textarea--default',
    preview: <Textarea placeholder="Write..." size="sm" />,
  },
  {
    name: 'toast',
    category: 'feedback',
    description: 'Imperative feedback API for transient messages.',
    importSnippet: "import { toast } from '@deweyou-design/react';",
    dimensions: ['variant', 'position', 'description'],
    storyId: 'components-toast--default',
    preview: (
      <Button size="sm" variant="outlined" onClick={() => toast.create({ title: 'Saved' })}>
        Toast
      </Button>
    ),
  },
  {
    name: 'Toaster',
    category: 'feedback',
    description: 'Toast viewport renderer used once near the application root.',
    importSnippet: "import { Toaster } from '@deweyou-design/react';",
    dimensions: ['position', 'limit', 'duration'],
    storyId: 'components-toast--default',
    preview: <Badge>Viewport</Badge>,
  },
  {
    name: 'Tooltip',
    category: 'overlays',
    description: 'Small hover/focus label for controls that need extra naming.',
    importSnippet: "import { Tooltip } from '@deweyou-design/react';",
    dimensions: ['placement', 'size', 'delay'],
    storyId: 'components-tooltip--default',
    preview: (
      <Tooltip.Root content="Tooltip">
        <Tooltip.Trigger>
          <Button size="sm" variant="outlined">
            Hover
          </Button>
        </Tooltip.Trigger>
      </Tooltip.Root>
    ),
  },
  {
    name: 'VirtualList',
    category: 'data',
    description: 'Windowed list renderer for large one-dimensional collections.',
    importSnippet: "import { VirtualList } from '@deweyou-design/react';",
    dimensions: ['count', 'height', 'estimateSize'],
    storyId: 'components-virtuallist--default',
    preview: (
      <VirtualList
        count={3}
        height={64}
        estimateSize={() => 28}
        renderItem={({ index }) => <div>Row {index + 1}</div>}
      />
    ),
  },
];
```

If TypeScript reports a prop mismatch for a preview, adjust only that preview to a simpler valid JSX shape; preserve the catalog fields and all component entries.

- [ ] **Step 4: Add missing Storybook stories if needed**

Run:

```bash
pnpm exec vp test apps/website/src/data/component-catalog.test.tsx
```

If the catalog uses `components-field--default`, `components-nav--default`, or `components-navoverlay--default`, add minimal Storybook stories for missing public components so deep links resolve after Storybook build. Use existing story patterns and titles:

```tsx
// apps/storybook/src/stories/Field.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Field, Input } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/Field',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Field.Root id="field-story" hasDescription>
      <Field.Label>Name</Field.Label>
      <Field.Control>
        <Input placeholder="Deweyou" />
      </Field.Control>
      <Field.Description>Field connects label, description, and control ids.</Field.Description>
    </Field.Root>
  ),
};
```

```tsx
// apps/storybook/src/stories/Nav.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Nav } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/Nav',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Nav.Root aria-label="Example navigation">
      <Nav.Link href="#" active>
        Overview
      </Nav.Link>
      <Nav.Link href="#">Components</Nav.Link>
      <Nav.Link href="#">Icons</Nav.Link>
    </Nav.Root>
  ),
};
```

```tsx
// apps/storybook/src/stories/NavOverlay.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, NavOverlay } from '@deweyou-design/react';

const meta: Meta = {
  title: 'Components/NavOverlay',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <NavOverlay.Root>
      <NavOverlay.Trigger>
        <Button variant="outlined">Open navigation</Button>
      </NavOverlay.Trigger>
      <NavOverlay.Content>
        <a href="#">Overview</a>
        <a href="#">Components</a>
        <NavOverlay.CloseButton />
      </NavOverlay.Content>
    </NavOverlay.Root>
  ),
};
```

- [ ] **Step 5: Run catalog tests to verify they pass**

Run:

```bash
pnpm exec vp test apps/website/src/data/component-catalog.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/data/component-catalog.tsx apps/website/src/data/component-catalog.test.tsx apps/storybook/src/stories/Field.stories.tsx apps/storybook/src/stories/Nav.stories.tsx apps/storybook/src/stories/NavOverlay.stories.tsx
git commit -m "feat(website): add component catalog data"
```

If no Storybook files were needed, omit them from `git add`.

## Task 3: Components Page

**Files:**

- Create/replace: `apps/website/src/pages/components.tsx`
- Create: `apps/website/src/pages/components.module.less`
- Create: `apps/website/src/pages/components.test.tsx`

- [ ] **Step 1: Write the failing Components page test**

Create `apps/website/src/pages/components.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, test } from 'vite-plus/test';

import { COMPONENT_CATALOG } from '../data/component-catalog';
import { expect } from '../test-setup';
import { ComponentsPage } from './components';

afterEach(() => {
  cleanup();
});

test('renders a manual-style component catalog with every public component', () => {
  render(<ComponentsPage />);

  expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument();
  expect(screen.getByText(/Storybook provides full controls/)).toBeInTheDocument();

  for (const item of COMPONENT_CATALOG) {
    expect(screen.getByRole('heading', { name: item.name })).toBeInTheDocument();
    expect(screen.getByText(item.importSnippet)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: `${item.name} Storybook ↗` })).toHaveAttribute(
      'target',
      '_blank',
    );
  }
});
```

- [ ] **Step 2: Run the Components page test to verify it fails**

Run:

```bash
pnpm exec vp test apps/website/src/pages/components.test.tsx
```

Expected: FAIL because `ComponentsPage` still has temporary content or is missing catalog rendering.

- [ ] **Step 3: Implement `ComponentsPage`**

Create `apps/website/src/pages/components.tsx`:

```tsx
import { Text } from '@deweyou-design/react';

import {
  COMPONENT_CATEGORIES,
  COMPONENT_CATALOG,
  type ComponentCatalogItem,
  getStorybookUrl,
} from '../data/component-catalog';
import styles from './components.module.less';

export const ComponentsPage = () => (
  <main className={styles.page}>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>Component Manual</p>
      <h1>Components</h1>
      <Text className={styles.lead} variant="body">
        Website cards explain the role, import path, and visual rhythm of every public component.
        Storybook provides full controls, interaction tests, and edge states.
      </Text>
    </header>

    <nav className={styles.categories} aria-label="Component categories">
      {COMPONENT_CATEGORIES.map((category) => (
        <a key={category.id} href={`#${category.id}`}>
          {category.label}
        </a>
      ))}
    </nav>

    {COMPONENT_CATEGORIES.map((category) => {
      const items = COMPONENT_CATALOG.filter((item) => item.category === category.id);

      return (
        <section key={category.id} id={category.id} className={styles.section}>
          <header className={styles.sectionHead}>
            <span>{String(items.length).padStart(2, '0')}</span>
            <h2>{category.label}</h2>
          </header>
          <div className={styles.grid}>
            {items.map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </div>
        </section>
      );
    })}
  </main>
);

type ComponentCardProps = {
  item: ComponentCatalogItem;
};

const ComponentCard = ({ item }: ComponentCardProps) => (
  <article className={styles.card}>
    <div className={styles.cardHeader}>
      <h3>{item.name}</h3>
      <span>{item.category}</span>
    </div>
    <p>{item.description}</p>
    <code>{item.importSnippet}</code>
    <div className={styles.dimensions}>
      {item.dimensions.map((dimension) => (
        <span key={dimension}>{dimension}</span>
      ))}
    </div>
    <div className={styles.preview}>{item.preview}</div>
    <a
      href={getStorybookUrl(item.storyId)}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.storyLink}
    >
      {item.name} Storybook ↗
    </a>
  </article>
);
```

- [ ] **Step 4: Style Components page**

Create `apps/website/src/pages/components.module.less`:

```less
.page {
  --website-line: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
  --website-line-strong: var(--ui-color-text);

  background: var(--ui-color-canvas);
  color: var(--ui-color-text);
  min-height: 100vh;
  padding-top: 64px;
}

.hero {
  border-bottom: 1px solid var(--website-line-strong);
  padding: 56px 48px 48px;
}

.eyebrow {
  color: var(--ui-color-brand-text);
  font-family: var(--ui-font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  line-height: 1;
  margin: 0 0 18px;
  text-transform: uppercase;
}

.hero h1 {
  font-family: var(--ui-font-display);
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.98;
  margin: 0;
}

.lead {
  font-size: 1.05rem !important;
  line-height: 1.65 !important;
  margin: 22px 0 0 !important;
  max-width: 720px;
}

.categories {
  border-bottom: 1px solid var(--website-line-strong);
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 12px 24px;

  a {
    color: var(--ui-color-text-muted);
    flex-shrink: 0;
    font-family: var(--ui-font-display);
    font-size: 13px;
    padding: 10px 12px;
    text-decoration: none;

    &:hover {
      background: color-mix(in srgb, var(--ui-color-text) 5%, transparent);
      color: var(--ui-color-text);
    }
  }
}

.section {
  border-bottom: 1px solid var(--website-line-strong);
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
}

.sectionHead {
  border-right: 1px solid var(--website-line);
  padding: 24px 20px;

  span {
    color: var(--ui-color-text-muted);
    display: block;
    font-family: var(--ui-font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    margin-bottom: 12px;
  }

  h2 {
    font-family: var(--ui-font-display);
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0;
    margin: 0;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card {
  border-bottom: 1px solid var(--website-line);
  border-right: 1px solid var(--website-line);
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 24px;

  &:nth-child(3n) {
    border-right: 0;
  }

  p {
    color: var(--ui-color-text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0;
  }

  code {
    background: color-mix(in srgb, var(--ui-color-text) 4%, transparent);
    border: 1px solid var(--website-line);
    color: var(--ui-color-text);
    font-family: var(--ui-font-mono);
    font-size: 11px;
    line-height: 1.5;
    overflow-wrap: anywhere;
    padding: 10px;
  }
}

.cardHeader {
  align-items: baseline;
  display: flex;
  gap: 10px;
  justify-content: space-between;

  h3 {
    font-family: var(--ui-font-display);
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0;
    margin: 0;
  }

  span {
    color: var(--ui-color-text-muted);
    font-family: var(--ui-font-mono);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

.dimensions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    border: 1px solid var(--website-line);
    color: var(--ui-color-text-muted);
    font-family: var(--ui-font-mono);
    font-size: 10px;
    line-height: 1;
    padding: 6px 8px;
  }
}

.preview {
  align-items: center;
  background: color-mix(in srgb, var(--ui-color-text) 3%, transparent);
  border: 1px solid var(--website-line);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 96px;
  overflow: hidden;
  padding: 14px;
}

.storyLink {
  color: var(--ui-color-brand-text);
  font-family: var(--ui-font-display);
  font-size: 13px;
  text-decoration: none;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card:nth-child(3n) {
    border-right: 1px solid var(--website-line);
  }

  .card:nth-child(2n) {
    border-right: 0;
  }
}

@media (max-width: 760px) {
  .page {
    padding-top: 116px;
  }

  .hero {
    padding: 40px 24px 36px;
  }

  .section,
  .grid {
    grid-template-columns: 1fr;
  }

  .sectionHead {
    border-bottom: 1px solid var(--website-line);
    border-right: 0;
    padding: 18px 24px;
  }

  .card,
  .card:nth-child(2n),
  .card:nth-child(3n) {
    border-right: 0;
  }
}
```

- [ ] **Step 5: Run Components page and catalog tests**

Run:

```bash
pnpm exec vp test apps/website/src/data/component-catalog.test.tsx apps/website/src/pages/components.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/pages/components.tsx apps/website/src/pages/components.module.less apps/website/src/pages/components.test.tsx
git commit -m "feat(website): add components manual"
```

## Task 4: Overview Redesign

**Files:**

- Modify: `apps/website/src/pages/home.tsx`
- Modify: `apps/website/src/pages/home.module.less`
- Create: `apps/website/src/pages/home.test.tsx`

- [ ] **Step 1: Write the failing Overview test**

Create `apps/website/src/pages/home.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, test } from 'vite-plus/test';

import { expect } from '../test-setup';
import { HomePage } from './home';

afterEach(() => {
  cleanup();
});

test('renders Overview as a design specification cover', () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: 'Deweyou Design' })).toBeInTheDocument();
  expect(screen.getByText('Principles')).toBeInTheDocument();
  expect(screen.getByText('Color Semantics')).toBeInTheDocument();
  expect(screen.getByText('Typography')).toBeInTheDocument();
  expect(screen.getByText('Shape & Interaction')).toBeInTheDocument();
  expect(screen.getByText('Component Evidence')).toBeInTheDocument();
  expect(screen.getByText('Get Started')).toBeInTheDocument();
  expect(screen.getByText(/font subset/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the Overview test to verify it fails**

Run:

```bash
pnpm exec vp test apps/website/src/pages/home.test.tsx
```

Expected: FAIL because the current page uses the old Palette/Type/Components structure and hero heading.

- [ ] **Step 3: Replace `HomePage` content with spec-first sections**

Update `apps/website/src/pages/home.tsx` so it renders these section names and uses existing components for evidence:

```tsx
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Popover,
  Select,
  Switch,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Text,
} from '@deweyou-design/react';
import { Link } from 'react-router-dom';

import styles from './home.module.less';

const PRINCIPLES = [
  ['Serif Identity', '宋体是品牌身份，body 和 display 都保持 serif rhythm。'],
  ['Semantic Color', '组件只暴露 neutral、primary、danger，让语义少于装饰。'],
  ['Line Before Shadow', '边框和留白建立结构，阴影只表达浮层抬升。'],
  ['Typographic Precision', '系统辨识度来自字形、行高、留白和克制的绿色。'],
] as const;

const SEMANTIC_COLORS = [
  ['neutral', 'text, border, surface'],
  ['primary', 'brand action, focus, selected'],
  ['danger', 'destructive action, error'],
] as const;

export const HomePage = () => (
  <main className={styles.page}>
    <section className={styles.cover}>
      <p className={styles.eyebrow}>Component Library · Design Manual</p>
      <h1>Deweyou Design</h1>
      <Text className={styles.lead} variant="body">
        中文优先、宋体字形、干净线条、暖白与暖黑主题构成的 React 组件库。
      </Text>
      <div className={styles.coverActions}>
        <Link to="/components">浏览组件 →</Link>
        <a
          href="https://design-storybook-deweyous-projects.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Storybook ↗
        </a>
      </div>
    </section>

    <SpecSection number="01" title="Principles" meta="identity · semantics · restraint">
      <div className={styles.principleGrid}>
        {PRINCIPLES.map(([title, body]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </SpecSection>

    <SpecSection number="02" title="Color Semantics" meta="neutral · primary · danger">
      <div className={styles.semanticGrid}>
        {SEMANTIC_COLORS.map(([name, usage]) => (
          <article key={name}>
            <div className={styles.semanticSwatches}>
              <span
                style={{
                  backgroundColor: `var(--ui-color-${name === 'primary' ? 'brand' : name}-bg-subtle)`,
                }}
              />
              <span
                style={{
                  backgroundColor: `var(--ui-color-${name === 'primary' ? 'brand' : name}-bg)`,
                }}
              />
              <span
                style={{
                  backgroundColor: `var(--ui-color-${name === 'primary' ? 'brand' : name}-text)`,
                }}
              />
            </div>
            <h3>{name}</h3>
            <p>{usage}</p>
          </article>
        ))}
      </div>
    </SpecSection>

    <SpecSection number="03" title="Typography" meta="source han serif cn · font subset">
      <div className={styles.typeSpec}>
        <Text variant="h1">Design 设计</Text>
        <Text variant="h3">宋体是界面身份，不是装饰。</Text>
        <Text variant="body">
          Website uses a font subset path so the design language stays faithful without loading full
          original font files on first paint.
        </Text>
      </div>
    </SpecSection>

    <SpecSection number="04" title="Shape & Interaction" meta="radius · focus · state">
      <div className={styles.stateGrid}>
        <Badge>pill</Badge>
        <Button variant="outlined">outlined</Button>
        <Button color="primary">focus ring</Button>
        <Button loading>loading</Button>
      </div>
    </SpecSection>

    <SpecSection number="05" title="Component Evidence" meta="selected primitives">
      <div className={styles.evidence}>
        <Button color="primary">Primary</Button>
        <Input placeholder="输入内容" />
        <Tabs defaultValue="one" size="sm">
          <TabList>
            <TabTrigger value="one">One</TabTrigger>
            <TabTrigger value="two">Two</TabTrigger>
          </TabList>
          <TabContent value="one">Panel one</TabContent>
          <TabContent value="two">Panel two</TabContent>
        </Tabs>
        <Menu>
          <MenuTrigger>
            <Button variant="outlined">Menu</Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="copy">Copy</MenuItem>
          </MenuContent>
        </Menu>
        <Popover content="Popover content">
          <Button variant="outlined">Popover</Button>
        </Popover>
        <Select.Root placeholder="Select">
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="a" label="Option A" />
          </Select.Content>
        </Select.Root>
        <Switch defaultChecked>开启</Switch>
        <Checkbox defaultChecked>已勾选</Checkbox>
      </div>
    </SpecSection>

    <SpecSection number="06" title="Get Started" meta="install · import · links">
      <div className={styles.startGrid}>
        <code>npm i @deweyou-design/react @deweyou-design/styles</code>
        <code>import '@deweyou-design/styles/theme.css';</code>
        <code>import {'{ Button, Input }'} from '@deweyou-design/react';</code>
      </div>
    </SpecSection>
  </main>
);

type SpecSectionProps = {
  children: React.ReactNode;
  meta: string;
  number: string;
  title: string;
};

const SpecSection = ({ children, meta, number, title }: SpecSectionProps) => (
  <section className={styles.section}>
    <header className={styles.sectionHead}>
      <span>{number}</span>
      <h2>{title}</h2>
      <p>{meta}</p>
    </header>
    <div className={styles.sectionBody}>{children}</div>
  </section>
);
```

If the `Button` loading prop name differs in the current component, use the supported loading API from `packages/react/src/button/index.tsx`.

- [ ] **Step 4: Replace `home.module.less` with the new line-led layout**

Use the existing visual language from the current website, but remove `margin-left: 200px` and align to fixed top nav:

```less
.page {
  --website-line: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
  --website-line-strong: var(--ui-color-text);

  background: var(--ui-color-canvas);
  color: var(--ui-color-text);
  min-height: 100vh;
  padding-top: 64px;
}

.cover {
  border-bottom: 1px solid var(--website-line-strong);
  padding: 64px 48px 56px;
}

.eyebrow {
  color: var(--ui-color-brand-text);
  font-family: var(--ui-font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  line-height: 1;
  margin: 0 0 24px;
  text-transform: uppercase;
}

.cover h1 {
  font-family: var(--ui-font-display);
  font-size: clamp(3.4rem, 8vw, 6.2rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.95;
  margin: 0;
}

.lead {
  font-size: 1.12rem !important;
  line-height: 1.65 !important;
  margin: 24px 0 0 !important;
  max-width: 680px;
}

.coverActions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;

  a {
    border: 1px solid var(--website-line-strong);
    color: var(--ui-color-text);
    font-family: var(--ui-font-display);
    font-size: 13px;
    padding: 10px 14px;
    text-decoration: none;
  }
}

.section {
  border-bottom: 1px solid var(--website-line-strong);
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
}

.sectionHead {
  border-right: 1px solid var(--website-line);
  padding: 24px 20px;

  span,
  p {
    color: var(--ui-color-text-muted);
    font-family: var(--ui-font-mono);
    font-size: 10px;
    line-height: 1.45;
    margin: 0;
  }

  h2 {
    font-family: var(--ui-font-display);
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0;
    margin: 12px 0;
  }
}

.sectionBody {
  min-width: 0;
}

.principleGrid,
.semanticGrid,
.startGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.principleGrid article,
.semanticGrid article,
.startGrid code {
  border-right: 1px solid var(--website-line);
  min-width: 0;
  padding: 28px 24px;

  &:last-child,
  &:nth-child(3n) {
    border-right: 0;
  }
}

.principleGrid h3,
.semanticGrid h3 {
  font-family: var(--ui-font-display);
  font-size: 1.08rem;
  font-weight: 600;
  letter-spacing: 0;
  margin: 0 0 12px;
}

.principleGrid p,
.semanticGrid p {
  color: var(--ui-color-text-muted);
  font-size: 0.92rem;
  line-height: 1.65;
  margin: 0;
}

.semanticSwatches {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 18px;

  span {
    aspect-ratio: 1.4 / 1;
    border: 1px solid var(--website-line);
    border-right: 0;

    &:last-child {
      border-right: 1px solid var(--website-line);
    }
  }
}

.typeSpec,
.stateGrid,
.evidence {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 28px 24px;
}

.typeSpec {
  align-items: flex-start;
  flex-direction: column;
}

.evidence {
  min-height: 160px;
}

.startGrid code {
  font-family: var(--ui-font-mono);
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

@media (max-width: 900px) {
  .page {
    padding-top: 116px;
  }

  .cover {
    padding: 44px 24px 40px;
  }

  .section,
  .principleGrid,
  .semanticGrid,
  .startGrid {
    grid-template-columns: 1fr;
  }

  .sectionHead {
    border-bottom: 1px solid var(--website-line);
    border-right: 0;
    padding: 18px 24px;
  }

  .principleGrid article,
  .semanticGrid article,
  .startGrid code {
    border-bottom: 1px solid var(--website-line);
    border-right: 0;

    &:last-child {
      border-bottom: 0;
    }
  }
}
```

- [ ] **Step 5: Run Overview test**

Run:

```bash
pnpm exec vp test apps/website/src/pages/home.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/pages/home.tsx apps/website/src/pages/home.module.less apps/website/src/pages/home.test.tsx
git commit -m "feat(website): redesign overview"
```

## Task 5: Icons Page Refresh

**Files:**

- Modify: `apps/website/src/pages/icons.tsx`
- Modify: `apps/website/src/pages/icons.module.less`
- Modify: `apps/website/src/pages/icons.test.tsx`

- [ ] **Step 1: Extend Icons tests for product copy and copy behavior**

Update `apps/website/src/pages/icons.test.tsx` with:

```tsx
test('presents Deweyou icons as the product surface', () => {
  renderPage();
  expect(screen.getByText(/@deweyou-design\\/react-icons/)).toBeInTheDocument();
  expect(screen.queryByText(/Tabler/)).not.toBeInTheDocument();
});

test('clicking an icon copies its import statement', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, {
    clipboard: { writeText },
  });

  renderPage();
  const plusButton = screen.getByRole('button', { name: /复制 plus 图标的 import 语句/ });
  fireEvent.click(plusButton);

  await screen.findByText('已复制');
  expect(writeText).toHaveBeenCalledWith(
    "import { PlusIcon } from '@deweyou-design/react-icons'",
  );
});
```

Also import `vi` from `vite-plus/test`:

```tsx
import { afterEach, test, vi } from 'vite-plus/test';
```

- [ ] **Step 2: Run Icons test to verify it fails**

Run:

```bash
pnpm exec vp test apps/website/src/pages/icons.test.tsx
```

Expected: FAIL because current copy includes `Tabler`, and clipboard behavior is not explicitly tested.

- [ ] **Step 3: Update Icons copy**

In `apps/website/src/pages/icons.tsx`, change subtitle copy to:

```tsx
<Text className={styles.subtitle} variant="caption">
  @deweyou-design/react-icons · Deweyou curated set · 点击图标复制 import 语句
</Text>
<Text className={styles.hint} variant="caption">
  命名导出保持稳定；图标默认作为装饰隐藏，需要语义时在使用处提供 aria-label。
</Text>
```

- [ ] **Step 4: Align Icons layout with fixed top navigation**

Update `apps/website/src/pages/icons.module.less`:

```less
.page {
  --website-line: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
  --website-line-strong: var(--ui-color-text);

  background: var(--ui-color-canvas);
  color: var(--ui-color-text);
  min-height: 100vh;
  padding-top: 64px;
}
```

Remove any left-margin assumption. Keep the existing icon grid and search behavior, and add `.hint` matching muted caption styles.

- [ ] **Step 5: Run Icons tests**

Run:

```bash
pnpm exec vp test apps/website/src/pages/icons.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/pages/icons.tsx apps/website/src/pages/icons.module.less apps/website/src/pages/icons.test.tsx
git commit -m "feat(website): refresh icons page"
```

## Task 6: Website Font Split

**Files:**

- Modify: `packages/styles/src/css/theme.css`
- Create: `packages/styles/src/css/theme-with-fonts.css`
- Modify: `packages/styles/package.json`
- Modify: `packages/styles/vite.config.ts`
- Modify: `packages/styles/tests/theme-outputs.test.ts`
- Modify: `apps/website/vite.config.ts`
- Modify: `apps/website/src/main.tsx`
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Write failing styles tests for split CSS entries**

Update `packages/styles/tests/theme-outputs.test.ts` so the theme test expects `theme.css` without full font import and the new full-font entry with the import:

```ts
test('theme css keeps consumer default free of full font imports', () => {
  const theme = readFileSync(resolve(cssDir, 'theme.css'), 'utf8');
  expect(theme).toContain("@import './reset.css';");
  expect(theme).toContain("@import './base.css';");
  expect(theme).toContain("@import './theme-light.css';");
  expect(theme).toContain("@import './theme-dark.css';");
  expect(theme).not.toContain("@import './fonts.css';");
});

test('theme-with-fonts css preserves full vendored font loading', () => {
  const themeWithFonts = readFileSync(resolve(cssDir, 'theme-with-fonts.css'), 'utf8');
  expect(themeWithFonts).toContain("@import './reset.css';");
  expect(themeWithFonts).toContain("@import './fonts.css';");
  expect(themeWithFonts).toContain("@import './base.css';");
  expect(themeWithFonts).toContain("@import './theme-light.css';");
  expect(themeWithFonts).toContain("@import './theme-dark.css';");
});
```

Remove or adjust the previous expectation that `theme.css` contains `@import './fonts.css';`.

- [ ] **Step 2: Run styles tests to verify they fail**

Run:

```bash
pnpm exec vp test packages/styles/tests/theme-outputs.test.ts
```

Expected: FAIL because `theme.css` still imports `fonts.css` and `theme-with-fonts.css` does not exist.

- [ ] **Step 3: Split CSS entries**

Update `packages/styles/src/css/theme.css`:

```css
@import './reset.css';
@import './base.css';
@import './theme-light.css';
@import './theme-dark.css';
```

Create `packages/styles/src/css/theme-with-fonts.css`:

```css
@import './reset.css';
@import './fonts.css';
@import './base.css';
@import './theme-light.css';
@import './theme-dark.css';
```

- [ ] **Step 4: Export `theme-with-fonts.css`**

Add to both `packages/styles/package.json` exports and `stylesPublicExports` in `packages/styles/vite.config.ts`:

```ts
'./theme-with-fonts.css': './dist/css/theme-with-fonts.css',
```

In JSON, use:

```json
"./theme-with-fonts.css": "./dist/css/theme-with-fonts.css"
```

- [ ] **Step 5: Add website font subset virtual module**

Add a website-only Vite plugin to `apps/website/vite.config.ts`. If a local repository helper for font subsetting exists by implementation time, use it. If not, add `subset-font` to the catalog and implement a small plugin around the package.

Required behavior:

- virtual module id: `virtual:deweyou-font-subset.css`
- scans website source text under `apps/website/src`
- produces WOFF2 subset assets for weights 400, 500, 600, 700
- emits `@font-face` rules for `Source Han Serif CN Web`

The implementation shape should be:

```ts
const WEBSITE_FONT_SUBSET_ID = 'virtual:deweyou-font-subset.css';
const RESOLVED_WEBSITE_FONT_SUBSET_ID = `\0${WEBSITE_FONT_SUBSET_ID}`;

const websiteFontSubsetPlugin = () => ({
  name: 'website-font-subset',
  resolveId(id: string) {
    if (id === WEBSITE_FONT_SUBSET_ID) {
      return RESOLVED_WEBSITE_FONT_SUBSET_ID;
    }
  },
  async load(id: string) {
    if (id !== RESOLVED_WEBSITE_FONT_SUBSET_ID) {
      return;
    }

    return createWebsiteFontSubsetCss();
  },
});
```

The helper `createWebsiteFontSubsetCss()` should live in `apps/website/vite.config.ts` unless it grows beyond roughly 80 lines. If it grows, move it to `apps/website/scripts/create-font-subset-css.mjs`.

- [ ] **Step 6: Import the virtual CSS in website main**

In `apps/website/src/main.tsx`, keep the regular theme import and add the website subset import:

```ts
import '@deweyou-design/styles/theme.css';
import 'virtual:deweyou-font-subset.css';
```

- [ ] **Step 7: Run styles tests and website build**

Run:

```bash
pnpm exec vp test packages/styles/tests/theme-outputs.test.ts
pnpm exec vp run website#build
```

Expected:

- styles tests PASS
- website build PASS
- build output includes subset WOFF2 assets rather than full Source Han Serif OTF assets in website output

- [ ] **Step 8: Commit**

```bash
git add packages/styles/src/css/theme.css packages/styles/src/css/theme-with-fonts.css packages/styles/package.json packages/styles/vite.config.ts packages/styles/tests/theme-outputs.test.ts apps/website/vite.config.ts apps/website/src/main.tsx pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat(website): use font subset entry"
```

## Task 7: Full Website Verification

**Files:**

- No planned source edits unless verification finds a concrete bug.

- [ ] **Step 1: Run focused website tests**

Run:

```bash
pnpm exec vp test apps/website/src/components/navbar.test.tsx apps/website/src/data/component-catalog.test.tsx apps/website/src/pages/home.test.tsx apps/website/src/pages/components.test.tsx apps/website/src/pages/icons.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run website build**

Run:

```bash
pnpm exec vp run website#build
```

Expected: PASS. If Vite warns about large chunks, record the warning but do not treat it as failure unless the build exits non-zero.

- [ ] **Step 3: Run broader checks**

Run:

```bash
pnpm exec vp test
pnpm exec vp check
```

Expected: PASS unless there are pre-existing unrelated documentation formatting failures. If unrelated failures appear, record exact file paths and do not change unrelated files in this plan.

- [ ] **Step 4: Browser verification**

Start or reuse the website dev server:

```bash
pnpm exec vp run website#dev --host 127.0.0.1
```

Open:

- `http://127.0.0.1:5173/`
- `http://127.0.0.1:5173/components`
- `http://127.0.0.1:5173/icons`

Verify:

- fixed nav is visible and compact
- no `Theme` nav item exists
- theme toggle changes light/dark mode
- Overview reads as a design manual cover
- Components renders every catalog card
- each Components card has an external Storybook link and no iframe
- Icons search and click-to-copy still work
- no horizontal overflow at desktop width
- no text overlap at narrow width

- [ ] **Step 5: Commit verification fixes if any**

If verification reveals a bug, make the smallest scoped fix and commit with a specific message:

```bash
git add <changed-files>
git commit -m "fix(website): address verification issue"
```

If no changes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: the plan implements compact top nav, no top-level Theme page, design-spec Overview, all-component Components catalog, direct Storybook external links, Icons refresh, global theme toggle, font subset loading, anchor offsets, and verification.
- Scope check: the plan is one website redesign effort with one small styles package support change for font splitting. Storybook story additions are limited to missing public component deep links.
- Type consistency: `ComponentCatalogItem`, `ComponentCategoryId`, `COMPONENT_CATEGORIES`, `COMPONENT_CATALOG`, and `getStorybookUrl` are defined once and reused consistently.
