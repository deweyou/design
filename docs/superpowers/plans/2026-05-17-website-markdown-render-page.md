# Website Markdown Render Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Markdown Render showcase page and group related website destinations under a dropdown navigation tab.

**Architecture:** Keep changes inside `apps/website` except for docs. Use existing React package components (`Menu`, `NavOverlay`, `MarkdownRender`, `Textarea`, `IconButton`) and route state; no new shared component API is required.

**Tech Stack:** React 19, TypeScript, CSS Modules, React Router, vite-plus tests.

---

### Task 1: Navbar Grouping

**Files:**

- Modify: `apps/website/src/components/navbar.tsx`
- Modify: `apps/website/src/components/navbar.module.less`
- Modify: `apps/website/src/components/navbar.test.tsx`

- [ ] Add failing tests that assert `Components`, `Fonts`, `Icons`, and `Markdown` are no longer direct desktop links, `Explore` opens a menu with those links, and `/components`, `/fonts`, `/icons`, `/markdown-render` mark `Explore` active.
- [ ] Replace the direct `Nav.Responsive` route list with a local desktop nav list that uses `Menu` for `Explore`.
- [ ] Preserve mobile overlay navigation as flat links for all website destinations.
- [ ] Verify navbar tests pass.

### Task 2: Markdown Render Route

**Files:**

- Create: `apps/website/src/pages/markdown-render.tsx`
- Create: `apps/website/src/pages/markdown-render.module.less`
- Create: `apps/website/src/pages/markdown-render.test.tsx`
- Modify: `apps/website/src/main.tsx`
- Modify: `apps/website/src/components/navbar.tsx`

- [ ] Add failing tests for the default sample, live preview updates, and mobile edit/preview toggle controls.
- [ ] Implement `/markdown-render` route with desktop split panes and mobile preview-first mode.
- [ ] Use `MarkdownRender` for preview and `Textarea` for editing.
- [ ] Add fixed lower-right mobile toggle button with safe-area padding.
- [ ] Verify page tests pass.

### Task 3: Verification

**Files:**

- Check all changed files.

- [ ] Run targeted tests for navbar and markdown page.
- [ ] Run website check/build command available in this workspace.
- [ ] Inspect final diff for unrelated changes.
