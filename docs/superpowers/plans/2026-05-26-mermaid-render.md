# Mermaid Render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add read-only Mermaid diagram rendering with beautiful-mermaid first, a Deweyou SVG mindmap renderer, native Mermaid fallback, and Storybook samples for common Mermaid syntaxes.

**Architecture:** `MermaidRender` detects the diagram type and routes to `MindmapRender`, `beautiful-mermaid`, or native Mermaid. `MindmapRender` owns a small Mermaid mindmap parser, deterministic SVG layout, and token-aligned styles. `MarkdownRender` remains opt-in by consumer override.

**Tech Stack:** TypeScript, React 19, Less CSS Modules, `beautiful-mermaid`, `mermaid`, `react-markdown`, Storybook.

---

### Task 1: Add Diagram Dependencies

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `packages/react/package.json`
- Modify: `packages/react/vite.config.ts`
- Update: `pnpm-lock.yaml`

- [ ] Add `beautiful-mermaid` and `mermaid` to the workspace catalog.
- [ ] Add both packages to `@deweyou-design/react` dependencies.
- [ ] Externalize both packages in the React package Vite build.
- [ ] Run `pnpm install` and verify the lockfile updates.

### Task 2: Add TDD Coverage For Routing And Mindmap

**Files:**

- Create: `packages/react/src/mermaid-render/index.test.tsx`

- [ ] Write failing tests for `MermaidRender` routing: mindmap uses `data-mermaid-renderer="mindmap"`, beautiful-supported diagrams use `data-mermaid-renderer="beautiful"`, and unsupported diagrams start in native loading state.
- [ ] Write failing tests for `MindmapRender`: root, branch, leaf, and edge SVG elements render from Mermaid mindmap indentation.
- [ ] Run `vp test packages/react/src/mermaid-render/index.test.tsx` and confirm the tests fail because the module does not exist yet.

### Task 3: Implement MermaidRender And MindmapRender

**Files:**

- Create: `packages/react/src/mermaid-render/index.tsx`
- Create: `packages/react/src/mermaid-render/index.module.less`

- [ ] Implement diagram type detection.
- [ ] Implement `MindmapRender` parser, layout, and SVG renderer.
- [ ] Implement `BeautifulMermaidRender` with synchronous `beautiful-mermaid` rendering and error fallback to native Mermaid.
- [ ] Implement `NativeMermaidRender` with dynamic Mermaid import, `startOnLoad: false`, and strict security.
- [ ] Run `vp test packages/react/src/mermaid-render/index.test.tsx` and confirm it passes.

### Task 4: Publish Component API

**Files:**

- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/package.json`
- Modify: `packages/react/tests/package-entrypoint.test.ts`
- Modify: `packages/react/tests/subpath-entrypoint.test.ts`
- Modify: `packages/react/tests/workspace-boundaries.test.ts`

- [ ] Export `MermaidRender`, `MindmapRender`, and their prop types from package root and `./mermaid-render`.
- [ ] Add the package export path.
- [ ] Update public contract tests.
- [ ] Run entrypoint and boundary tests.

### Task 5: Add Storybook Examples

**Files:**

- Create: `apps/storybook/src/stories/MermaidRender.stories.tsx`

- [ ] Add a default diagram story.
- [ ] Add a gallery story with flowchart, sequence, state, class, ER, XY, mindmap, and native fallback syntax samples.
- [ ] Add an interaction test that confirms each sample renders a diagram container with the expected `data-mermaid-renderer`.
- [ ] Run `vp test apps/storybook/src/stories/MermaidRender.stories.tsx` if supported, otherwise run Storybook test after starting Storybook.

### Task 6: Docs And Verification

**Files:**

- Modify: `packages/react/README.md`
- Modify: `docs/design/components.md`
- Modify: `packages/react/tests/component-docs-contract.test.ts`

- [ ] Document `MermaidRender` and `MindmapRender`.
- [ ] Run focused tests: `vp test packages/react/src/mermaid-render/index.test.tsx packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/workspace-boundaries.test.ts packages/react/tests/component-docs-contract.test.ts`.
- [ ] Run `vp check`.
- [ ] Run `vp test`.
- [ ] Start Storybook or build it and visually inspect the Mermaid gallery.
