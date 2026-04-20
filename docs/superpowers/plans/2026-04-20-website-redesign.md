# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `apps/website/` from a 1500-line playground into a proper component library landing site with a Landing page (`/`) and an Icons page (`/icons`).

**Architecture:** React Router v6 handles two routes sharing a `<Layout>` component that owns the Navbar and the fixed theme-toggle `<IconButton>`. Each page is a standalone TSX file with a co-located `.module.less` stylesheet. All interactive elements use `@deweyou-design/react` components directly.

**Tech Stack:** React 19, TypeScript, React Router v6, `@deweyou-design/react`, `@deweyou-design/react-hooks`, `@deweyou-design/react-icons`, CSS Modules (Less), Vite Plus.

---

## File Map

| Action  | Path                                             | Responsibility                              |
| ------- | ------------------------------------------------ | ------------------------------------------- |
| Modify  | `apps/website/package.json`                      | Add `react-router-dom` dependency           |
| Replace | `apps/website/src/style.css`                     | Minimal global reset only                   |
| Replace | `apps/website/src/main.tsx`                      | Router setup, Layout, theme toggle, Toaster |
| Delete  | `apps/website/src/counter.ts`                    | No longer needed                            |
| Create  | `apps/website/src/components/navbar.tsx`         | Shared centered nav                         |
| Create  | `apps/website/src/components/navbar.module.less` | Navbar styles                               |
| Create  | `apps/website/src/pages/home.tsx`                | Full Landing page                           |
| Create  | `apps/website/src/pages/home.module.less`        | Landing styles                              |
| Replace | `apps/website/src/pages/icons.tsx`               | Icons page with search                      |
| Replace | `apps/website/src/pages/icons.module.less`       | Icons page styles                           |

---

## Task 1: Add react-router-dom

**Files:**

- Modify: `apps/website/package.json`

- [ ] **Step 1: Add dependency**

Edit `apps/website/package.json` — add `"react-router-dom": "^6"` to `dependencies`:

```json
{
  "name": "website",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vp dev",
    "build": "vp build",
    "preview": "vp preview"
  },
  "dependencies": {
    "@deweyou-design/react": "workspace:*",
    "@deweyou-design/react-hooks": "workspace:*",
    "@deweyou-design/react-icons": "workspace:*",
    "@deweyou-design/styles": "workspace:*",
    "react": "catalog:",
    "react-dom": "catalog:",
    "react-router-dom": "^6"
  },
  "devDependencies": {
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "typescript": "catalog:",
    "vite": "catalog:",
    "vite-plus": "catalog:"
  }
}
```

- [ ] **Step 2: Install**

```bash
vp install
```

Expected: resolves without errors, `react-router-dom` appears in `node_modules`.

- [ ] **Step 3: Commit**

```bash
git add apps/website/package.json
git commit -m "chore(website): add react-router-dom"
```

---

## Task 2: Global styles reset

**Files:**

- Replace: `apps/website/src/style.css`

- [ ] **Step 1: Replace style.css**

The existing `style.css` is tailored to the old design. Replace entirely:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--ui-color-canvas);
  color: var(--ui-color-text);
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/src/style.css
git commit -m "chore(website): reset global styles for redesign"
```

---

## Task 3: Shared Navbar

**Files:**

- Create: `apps/website/src/components/navbar.tsx`
- Create: `apps/website/src/components/navbar.module.less`

- [ ] **Step 1: Create navbar.module.less**

```less
.navbar {
  border-bottom: 1px solid var(--ui-color-text);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.link {
  font-size: 11px;
  color: var(--ui-color-text-muted);
  text-decoration: none;
  transition: color 140ms ease;

  &:hover {
    color: var(--ui-color-text);
  }
}

.active {
  color: var(--ui-color-text);
  font-weight: 500;
}
```

- [ ] **Step 2: Create navbar.tsx**

The Storybook URL is a placeholder — replace `STORYBOOK_URL` with the actual deployed URL when known.

```tsx
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.less';

const STORYBOOK_URL = '#';
const GITHUB_URL = 'https://github.com/deweyou/ui';

export const Navbar = () => (
  <nav className={styles.navbar}>
    <NavLink
      to="/"
      end
      className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
    >
      Home
    </NavLink>
    <NavLink
      to="/icons"
      className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}
    >
      Icons
    </NavLink>
    <a href={STORYBOOK_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
      Storybook ↗
    </a>
    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.link}>
      GitHub ↗
    </a>
  </nav>
);
```

- [ ] **Step 3: Write test**

Create `apps/website/src/components/navbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './navbar';

const renderNavbar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );

test('renders all four nav links', () => {
  renderNavbar();
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Icons')).toBeInTheDocument();
  expect(screen.getByText('Storybook ↗')).toBeInTheDocument();
  expect(screen.getByText('GitHub ↗')).toBeInTheDocument();
});

test('Home link is active on /', () => {
  renderNavbar('/');
  const homeLink = screen.getByText('Home').closest('a');
  expect(homeLink?.className).toContain('active');
});

test('Icons link is active on /icons', () => {
  renderNavbar('/icons');
  const iconsLink = screen.getByText('Icons').closest('a');
  expect(iconsLink?.className).toContain('active');
});
```

- [ ] **Step 4: Run tests**

```bash
vp test apps/website/src/components/navbar.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add apps/website/src/components/
git commit -m "feat(website): add shared navbar component"
```

---

## Task 4: Rewrite main.tsx

**Files:**

- Replace: `apps/website/src/main.tsx`
- Delete: `apps/website/src/counter.ts`

The `counter.ts` file only exported `applyThemeMode` and `themePreviews`, neither of which are needed in the new design. `useThemeMode` from `@deweyou-design/react-hooks` handles theme application internally.

The theme toggle uses inline SVG (sun/moon) matching the library's `strokeLinecap="square"` convention, since `@deweyou-design/react-icons` does not include sun/moon icons.

- [ ] **Step 1: Replace main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import { IconButton, Toaster } from '@deweyou-design/react';
import { useThemeMode } from '@deweyou-design/react-hooks';
import '@deweyou-design/styles/theme.css';

import { Navbar } from './components/navbar';
import { HomePage } from './pages/home';
import { IconsPage } from './pages/icons';
import './style.css';

const SunIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="square"
    strokeLinejoin="miter"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Layout = () => {
  const { mode, toggleMode } = useThemeMode('light');

  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
      <IconButton
        aria-label={mode === 'light' ? '切换深色模式' : '切换浅色模式'}
        icon={mode === 'light' ? <MoonIcon /> : <SunIcon />}
        shape="pill"
        style={{
          bottom: 28,
          boxShadow: 'var(--ui-shadow-soft)',
          position: 'fixed',
          right: 28,
        }}
        variant="outlined"
        onClick={toggleMode}
      />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
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

- [ ] **Step 2: Delete counter.ts**

```bash
rm apps/website/src/counter.ts
```

- [ ] **Step 3: Start dev server and verify routing works**

```bash
vp run website#dev
```

Open `http://localhost:5173`. Expected: Navbar renders, no console errors, navigating to `/icons` changes the active link. Theme toggle button visible bottom-right.

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/main.tsx
git rm apps/website/src/counter.ts
git commit -m "feat(website): rewrite main.tsx with router and layout"
```

---

## Task 5: Landing page — Hero section

**Files:**

- Create: `apps/website/src/pages/home.tsx`
- Create: `apps/website/src/pages/home.module.less`

- [ ] **Step 1: Create home.module.less** (Hero styles only for now)

```less
.page {
  padding-bottom: 80px;
}

// ─── Shared container ────────────────────────────────────────────────────────

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 32px;
}

// ─── Section label ────────────────────────────────────────────────────────────

.sectionLabel {
  font-size: 10px;
  color: var(--ui-color-text-muted);
  letter-spacing: 0.14em;
  text-align: center;
  margin-bottom: 32px;
  text-transform: uppercase;
  font-family: system-ui, sans-serif;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

.hero {
  padding: 80px 0 64px;
  border-bottom: 1px solid var(--ui-color-border);
  text-align: center;
}

.heroEyebrow {
  font-size: 10px;
  color: var(--ui-color-text-muted);
  letter-spacing: 0.14em;
  margin-bottom: 24px;
  text-transform: uppercase;
  font-family: system-ui, sans-serif;
}

.heroTitle {
  // Override Text component margin
  margin-bottom: 22px !important;
}

.heroRule {
  width: 44px;
  height: 2px;
  background: var(--ui-color-text);
  margin: 0 auto 22px;
}

.heroDesc {
  max-width: 400px;
  margin: 0 auto 30px !important;
}

.heroActions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 22px;
}

.installCmd {
  display: inline-block;
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  padding: 8px 16px;
  font-family: var(--ui-font-mono);
  font-size: 11px;
  color: var(--ui-color-text-muted);
}
```

- [ ] **Step 2: Create home.tsx with Hero only**

```tsx
import { Button, Text } from '@deweyou-design/react';

import styles from './home.module.less';

export const HomePage = () => (
  <main className={styles.page}>
    <HeroSection />
  </main>
);

const HeroSection = () => (
  <section className={styles.hero}>
    <div className={styles.container}>
      <p className={styles.heroEyebrow}>Component Library · v1.0</p>
      <Text as="h1" variant="h1" className={styles.heroTitle}>
        为汉字排印
        <br />
        而生的
        <br />
        组件库
      </Text>
      <div className={styles.heroRule} />
      <Text variant="body" className={styles.heroDesc}>
        基于宋体字形节奏与温暖色系构建，27 个组件覆盖完整 UI 场景。深浅双主题，开箱即用。
      </Text>
      <div className={styles.heroActions}>
        <Button color="neutral" variant="filled">
          查看文档 →
        </Button>
        <Button color="neutral" variant="outlined">
          Storybook ↗
        </Button>
      </div>
      <code className={styles.installCmd}>npm install @deweyou-design/react</code>
    </div>
  </section>
);
```

- [ ] **Step 3: Verify in browser**

```bash
vp run website#dev
```

Open `http://localhost:5173`. Expected: Hero section renders with large serif title, horizontal rule, two buttons, install command.

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/pages/home.tsx apps/website/src/pages/home.module.less
git commit -m "feat(website): add landing page hero section"
```

---

## Task 6: Landing page — Design Foundation (Color + Typography)

**Files:**

- Modify: `apps/website/src/pages/home.tsx`
- Modify: `apps/website/src/pages/home.module.less`

- [ ] **Step 1: Add Design Foundation styles to home.module.less**

Append to the existing file:

```less
// ─── Design & Components section ─────────────────────────────────────────────

.designSection {
  padding: 64px 0;
  border-bottom: 1px solid var(--ui-color-border);
}

.subLabel {
  font-size: 10px;
  color: var(--ui-color-text-muted);
  letter-spacing: 0.1em;
  text-align: center;
  margin-bottom: 16px;
  text-transform: uppercase;
  font-family: system-ui, sans-serif;
}

.subSection {
  margin-bottom: 44px;
  padding-bottom: 44px;
  border-bottom: 1px solid var(--ui-color-surface);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

// Color swatches
.colorStrip {
  display: flex;
  gap: 3px;
  justify-content: center;
  margin-bottom: 4px;
}

.colorSwatch {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  flex-shrink: 0;
}

// Typography stack
.typeStack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  text-align: center;
}
```

- [ ] **Step 2: Add ColorSection and TypographySection to home.tsx**

Add these components and wire them into `HomePage`:

```tsx
import { Button, Text } from '@deweyou-design/react';

import styles from './home.module.less';

export const HomePage = () => (
  <main className={styles.page}>
    <HeroSection />
    <DesignSection />
  </main>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className={styles.hero}>
    <div className={styles.container}>
      <p className={styles.heroEyebrow}>Component Library · v1.0</p>
      <Text as="h1" variant="h1" className={styles.heroTitle}>
        为汉字排印
        <br />
        而生的
        <br />
        组件库
      </Text>
      <div className={styles.heroRule} />
      <Text variant="body" className={styles.heroDesc}>
        基于宋体字形节奏与温暖色系构建，27 个组件覆盖完整 UI 场景。深浅双主题，开箱即用。
      </Text>
      <div className={styles.heroActions}>
        <Button color="neutral" variant="filled">
          查看文档 →
        </Button>
        <Button color="neutral" variant="outlined">
          Storybook ↗
        </Button>
      </div>
      <code className={styles.installCmd}>npm install @deweyou-design/react</code>
    </div>
  </section>
);

// ─── Design & Components ──────────────────────────────────────────────────────

const DesignSection = () => (
  <section className={styles.designSection}>
    <div className={styles.container}>
      <p className={styles.sectionLabel}>Design &amp; Components</p>
      <ColorSubSection />
      <TypographySubSection />
    </div>
  </section>
);

// Color swatches — emerald (brand), red (danger), stone (neutral)
// Steps ordered dark → light to match how the design system reads
const COLOR_ROWS: Array<{ family: string; steps: number[] }> = [
  { family: 'emerald', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
  { family: 'red', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
  { family: 'stone', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
];

const ColorSubSection = () => (
  <div className={styles.subSection}>
    <p className={styles.subLabel}>Color · 26 色族 · 11 色阶</p>
    {COLOR_ROWS.map(({ family, steps }) => (
      <div key={family} className={styles.colorStrip}>
        {steps.map((step) => (
          <div
            key={step}
            className={styles.colorSwatch}
            style={{ backgroundColor: `var(--ui-color-palette-${family}-${step})` }}
          />
        ))}
      </div>
    ))}
  </div>
);

const TypographySubSection = () => (
  <div className={styles.subSection}>
    <p className={styles.subLabel}>Type · Source Han Serif CN · 4 字重</p>
    <div className={styles.typeStack}>
      <Text variant="h1">标题一 H1</Text>
      <Text variant="h3">标题三 H3</Text>
      <Text variant="body">正文 Body — 清晰易读，适合长文阅读</Text>
      <Text variant="caption">说明 Caption · 辅助信息层级</Text>
    </div>
  </div>
);
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`. Expected: Color strips (3 rows × 9 swatches) and typography stack render below Hero.

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/pages/home.tsx apps/website/src/pages/home.module.less
git commit -m "feat(website): add color and typography showcase sections"
```

---

## Task 7: Landing page — Components Tabs showcase

**Files:**

- Modify: `apps/website/src/pages/home.tsx`
- Modify: `apps/website/src/pages/home.module.less`

- [ ] **Step 1: Add component tab styles to home.module.less**

Append:

```less
// ─── Components tabs ──────────────────────────────────────────────────────────

.tabContent {
  padding: 24px 0 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.tabDivider {
  width: 1px;
  height: 20px;
  background: var(--ui-color-border);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Add ComponentsSubSection to home.tsx**

Add these imports at the top of `home.tsx`:

```tsx
import {
  Badge,
  Button,
  Checkbox,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Popover,
  Select,
  Spinner,
  Switch,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Text,
  toast,
} from '@deweyou-design/react';
```

Add the `ComponentsSubSection` component, then update `DesignSection` to include it:

```tsx
const DesignSection = () => (
  <section className={styles.designSection}>
    <div className={styles.container}>
      <p className={styles.sectionLabel}>Design &amp; Components</p>
      <ColorSubSection />
      <TypographySubSection />
      <ComponentsSubSection />
    </div>
  </section>
);

const ComponentsSubSection = () => (
  <div className={styles.subSection}>
    <p className={styles.subLabel}>Components</p>
    <Tabs defaultValue="buttons">
      <TabList>
        <TabTrigger value="buttons">按钮 / 操作</TabTrigger>
        <TabTrigger value="form">表单输入</TabTrigger>
        <TabTrigger value="overlay">浮层 / 菜单</TabTrigger>
        <TabTrigger value="feedback">反馈 / 徽标</TabTrigger>
      </TabList>

      <TabContent value="buttons">
        <div className={styles.tabContent}>
          <Button color="neutral" variant="filled">
            操作
          </Button>
          <Button color="primary" variant="filled">
            确认
          </Button>
          <Button color="danger" variant="filled">
            删除
          </Button>
          <Button variant="outlined">取消</Button>
          <Button variant="ghost">次要</Button>
        </div>
      </TabContent>

      <TabContent value="form">
        <div className={styles.tabContent}>
          <Input placeholder="用户名" />
          <Input error="请输入有效邮箱" placeholder="格式不正确" />
          {/* Select is a namespace: Select.Root / .Trigger / .Content / .Item */}
          <Select.Root>
            <Select.Trigger placeholder="请选择..." />
            <Select.Content>
              <Select.Item value="a">选项一</Select.Item>
              <Select.Item value="b">选项二</Select.Item>
            </Select.Content>
          </Select.Root>
          <div className={styles.tabDivider} />
          <Switch defaultChecked />
          <Switch />
          <Checkbox defaultChecked />
          <Checkbox />
        </div>
      </TabContent>

      <TabContent value="overlay">
        <div className={styles.tabContent}>
          {/* Popover is a single component: children = trigger, content prop = panel */}
          <Popover content={<Text variant="body">确认删除弹层示例</Text>}>
            <Button variant="outlined">打开 Popover</Button>
          </Popover>
          <Menu>
            <MenuTrigger>
              <Button variant="outlined">打开 Menu</Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="edit">编辑</MenuItem>
              <MenuItem value="copy">复制链接</MenuItem>
              <MenuSeparator />
              <MenuItem value="delete">删除</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </TabContent>

      <TabContent value="feedback">
        <div className={styles.tabContent}>
          <Badge color="neutral" variant="soft">
            默认
          </Badge>
          <Badge color="success" variant="soft">
            成功
          </Badge>
          <Badge color="danger" variant="soft">
            错误
          </Badge>
          <Spinner />
          <div className={styles.tabDivider} />
          <Button variant="outlined" onClick={() => toast.create({ title: '操作已完成' })}>
            触发 Toast
          </Button>
        </div>
      </TabContent>
    </Tabs>
  </div>
);
```

Note: `<Toaster />` is already mounted in `<Layout>` in `main.tsx` — do not add a second one here.

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`. Expected: Tabs render with 4 tabs, each tab shows interactive components. "触发 Toast" button shows a toast notification.

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/pages/home.tsx apps/website/src/pages/home.module.less
git commit -m "feat(website): add components tabs showcase"
```

---

## Task 8: Landing page — Icons preview + Footer

**Files:**

- Modify: `apps/website/src/pages/home.tsx`
- Modify: `apps/website/src/pages/home.module.less`

- [ ] **Step 1: Add styles to home.module.less**

Append:

```less
// ─── Icons preview ────────────────────────────────────────────────────────────

.iconsSection {
  padding: 64px 0;
  border-bottom: 1px solid var(--ui-color-border);
}

.iconGrid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.iconCell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.iconBox {
  width: 36px;
  height: 36px;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-color-surface);
  color: var(--ui-color-text);
  font-size: 18px;
}

.iconName {
  font-size: 7px;
  color: var(--ui-color-text-muted);
  text-align: center;
  font-family: system-ui, sans-serif;
  line-height: 1.2;
}

.iconViewAll {
  text-align: center;
}

// ─── Footer ───────────────────────────────────────────────────────────────────

.footer {
  padding: 28px 0;
  border-top: 1px solid var(--ui-color-border);
  text-align: center;
}
```

- [ ] **Step 2: Add imports and components to home.tsx**

Add these imports at the top:

```tsx
import { useNavigate } from 'react-router-dom';
import * as Icons from '@deweyou-design/react-icons';
```

Add the `PREVIEW_ICONS` constant and the two new sections, then update `HomePage`:

```tsx
// 20 representative icons for the landing preview
const PREVIEW_ICONS: Array<{ name: string; Icon: React.ComponentType<{ size?: number }> }> = [
  { name: 'plus', Icon: Icons.PlusIcon },
  { name: 'x', Icon: Icons.XIcon },
  { name: 'check', Icon: Icons.CheckIcon },
  { name: 'search', Icon: Icons.SearchIcon },
  { name: 'edit', Icon: Icons.EditIcon },
  { name: 'trash', Icon: Icons.TrashIcon },
  { name: 'settings', Icon: Icons.SettingsIcon },
  { name: 'bell', Icon: Icons.BellIcon },
  { name: 'home', Icon: Icons.HomeIcon },
  { name: 'user', Icon: Icons.UserIcon },
  { name: 'download', Icon: Icons.DownloadIcon },
  { name: 'upload', Icon: Icons.UploadIcon },
  { name: 'refresh', Icon: Icons.RefreshIcon },
  { name: 'filter', Icon: Icons.FilterIcon },
  { name: 'copy', Icon: Icons.CopyIcon },
  { name: 'eye', Icon: Icons.EyeIcon },
  { name: 'eye-off', Icon: Icons.EyeOffIcon },
  { name: 'arrow-left', Icon: Icons.ArrowLeftIcon },
  { name: 'arrow-right', Icon: Icons.ArrowRightIcon },
  { name: 'external-link', Icon: Icons.ExternalLinkIcon },
];

export const HomePage = () => (
  <main className={styles.page}>
    <HeroSection />
    <DesignSection />
    <IconsPreviewSection />
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Text variant="caption">MIT License · 2026</Text>
      </div>
    </footer>
  </main>
);

const IconsPreviewSection = () => {
  const navigate = useNavigate();
  return (
    <section className={styles.iconsSection}>
      <div className={styles.container}>
        <p className={styles.sectionLabel}>Icons · Tabler Icons</p>
        <div className={styles.iconGrid}>
          {PREVIEW_ICONS.map(({ name, Icon }) => (
            <div key={name} className={styles.iconCell}>
              <div className={styles.iconBox}>
                <Icon size={18} />
              </div>
              <span className={styles.iconName}>{name}</span>
            </div>
          ))}
        </div>
        <div className={styles.iconViewAll}>
          <Button variant="link" onClick={() => navigate('/icons')}>
            查看全部图标 →
          </Button>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`. Expected: 20 icon cells render in a 10-column grid. "查看全部图标 →" navigates to `/icons`.

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/pages/home.tsx apps/website/src/pages/home.module.less
git commit -m "feat(website): add icons preview section and footer"
```

---

## Task 9: Icons page

**Files:**

- Replace: `apps/website/src/pages/icons.tsx`
- Replace: `apps/website/src/pages/icons.module.less` (create if absent)

- [ ] **Step 1: Create icons.module.less**

```less
.page {
  padding: 64px 0 80px;
}

.container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 32px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  margin-bottom: 6px !important;
}

.subtitle {
  margin-bottom: 24px !important;
}

.searchWrapper {
  max-width: 320px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 32px;
}

.iconCell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid transparent;
  border-radius: var(--ui-radius-float);
  cursor: pointer;
  transition:
    border-color 140ms ease,
    background-color 140ms ease;

  &:hover {
    border-color: var(--ui-color-border);
    background: var(--ui-color-surface);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus-ring);
    outline-offset: 2px;
  }
}

.iconBox {
  color: var(--ui-color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.iconName {
  font-size: 9px;
  color: var(--ui-color-text-muted);
  text-align: center;
  font-family: system-ui, sans-serif;
  line-height: 1.3;
  word-break: break-all;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
}
```

- [ ] **Step 2: Rewrite icons.tsx**

```tsx
import { useState } from 'react';

import { Input, Text, toast } from '@deweyou-design/react';
import * as Icons from '@deweyou-design/react-icons';
import type { IconProps } from '@deweyou-design/react-icons';

import styles from './icons.module.less';

type IconEntry = {
  name: string;
  Icon: React.ComponentType<IconProps>;
};

// Build the full icon list from all exports ending with "Icon"
const ALL_ICONS: IconEntry[] = (
  Object.entries(Icons) as Array<[string, React.ComponentType<IconProps>]>
)
  .filter(([key]) => key.endsWith('Icon') && key !== 'createTablerIcon')
  .map(([name, Icon]) => ({
    // "AlertCircleIcon" → "alert-circle"
    name: name
      .replace(/Icon$/, '')
      .replace(/([A-Z])/g, (m, l, i) => (i === 0 ? l.toLowerCase() : `-${l.toLowerCase()}`)),
    Icon,
  }));

const copyImport = (rawName: string) => {
  // Reconstruct the PascalCase export name from the kebab display name
  const exportName =
    rawName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Icon';

  navigator.clipboard
    .writeText(`import { ${exportName} } from '@deweyou-design/react-icons'`)
    .then(() => {
      toast.create({ title: '已复制', description: exportName });
    })
    .catch(() => {
      toast.create({ title: '复制失败', type: 'error' });
    });
};

export const IconsPage = () => {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? ALL_ICONS.filter(({ name }) => name.includes(query.trim().toLowerCase()))
    : ALL_ICONS;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Text className={styles.title} variant="h3">
            Icons
          </Text>
          <Text className={styles.subtitle} variant="caption">
            @deweyou-design/react-icons · 基于 Tabler Icons · 点击图标复制 import 语句
          </Text>
          <div className={styles.searchWrapper}>
            <Input
              placeholder="搜索图标..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <Text variant="caption">没有匹配「{query}」的图标</Text>
            </div>
          ) : (
            filtered.map(({ name, Icon }) => (
              <button
                key={name}
                aria-label={`复制 ${name} 图标的 import 语句`}
                className={styles.iconCell}
                type="button"
                onClick={() => copyImport(name)}
              >
                <div className={styles.iconBox}>
                  <Icon aria-hidden size={20} />
                </div>
                <span className={styles.iconName}>{name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
};
```

Note: The `<Toaster>` in `<Layout>` (`main.tsx`) already covers the icons page since it is in the same React tree. Do **not** add a second `<Toaster>` in `IconsPage`. Remove the `<Toaster>` import and JSX from the icons page code above.

- [ ] **Step 3: Write test**

Create `apps/website/src/pages/icons.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IconsPage } from './icons';

const renderPage = () =>
  render(
    <MemoryRouter>
      <IconsPage />
    </MemoryRouter>,
  );

test('renders icon grid with all icons', () => {
  renderPage();
  // At least 10 icon cells should be present
  const cells = screen.getAllByRole('button');
  expect(cells.length).toBeGreaterThanOrEqual(10);
});

test('search filters the icon list', () => {
  renderPage();
  const input = screen.getByPlaceholderText('搜索图标...');
  const allCells = screen.getAllByRole('button');

  fireEvent.change(input, { target: { value: 'arrow' } });

  const filteredCells = screen.getAllByRole('button');
  expect(filteredCells.length).toBeLessThan(allCells.length);
  filteredCells.forEach((cell) => {
    expect(cell.getAttribute('aria-label')).toContain('arrow');
  });
});

test('shows empty state when search has no results', () => {
  renderPage();
  const input = screen.getByPlaceholderText('搜索图标...');
  fireEvent.change(input, { target: { value: 'zzznomatch' } });
  expect(screen.getByText(/没有匹配/)).toBeInTheDocument();
});
```

- [ ] **Step 4: Run tests**

```bash
vp test apps/website/src/pages/icons.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Verify in browser**

Open `http://localhost:5173/icons`. Expected: all 31 icons render in an auto-fill grid, search input filters in real time, clicking any icon shows a toast "已复制".

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/pages/icons.tsx apps/website/src/pages/icons.module.less
git commit -m "feat(website): add icons page with search and copy"
```

---

## Task 10: Type-check and final smoke test

**Files:** none modified

- [ ] **Step 1: Type check**

```bash
vp check
```

Expected: zero type errors.

- [ ] **Step 2: Full dev smoke test**

```bash
vp run website#dev
```

Checklist:

- [ ] `/` — Hero, color swatches, typography, Tabs showcase, icons preview, footer all render
- [ ] All 4 Tabs tabs are interactive
- [ ] "触发 Toast" shows a toast
- [ ] "查看全部图标 →" navigates to `/icons`
- [ ] `/icons` — all 31 icons render, search filters, click copies and shows toast
- [ ] Theme toggle (bottom-right) switches between light and dark
- [ ] Navbar active state updates on navigation
- [ ] No console errors

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(website): final type check pass"
```
