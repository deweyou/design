# Merge Editor Into React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish editor capability through `@deweyou-design/react` and remove the unpublished standalone editor package from release.

**Architecture:** Move the existing editor source tree under `packages/react/src/editor` and expose public editor subpaths through the react package manifest. Keep the editor's plugin, adapter, runtime, and test boundaries intact so the migration is mostly package-surface work rather than editor behavior work.

**Tech Stack:** TypeScript, React 19, vite-plus, Less modules, npm package exports, Storybook, website catalog, MCP catalog.

---

### Task 1: Contract Tests For React-Owned Editor

**Files:**

- Modify: `packages/react/tests/subpath-entrypoint.test.ts`
- Modify: `packages/react/tests/package-entrypoint.test.ts`
- Modify: `packages/infra/tests/release-contract.test.ts`

- [ ] **Step 1: Update subpath export expectations**

Assert that `packages/react/package.json` exposes `./editor`,
`./editor/core`, `./editor/adapters/markdown`, and each
`./editor/plugins/<name>` subpath.

- [ ] **Step 2: Update root export expectations**

Assert that `@deweyou-design/react` root exports include `Editor`,
`markdownEditorAdapter`, and the official editor plugin factory exports.

- [ ] **Step 3: Update release contract**

Assert the release package list excludes `@deweyou-design/editor` and still
includes `@deweyou-design/react`.

- [ ] **Step 4: Run red verification**

Run:

```bash
vp test packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/package-entrypoint.test.ts packages/infra/tests/release-contract.test.ts
```

Expected: FAIL because the editor source and release queue have not been moved.

### Task 2: Move Editor Source Into React

**Files:**

- Move: `packages/editor/src/*` to `packages/react/src/editor/*`
- Move: `packages/editor/tests/package-contract.test.ts` into a react package test or delete after coverage moves
- Modify: `packages/react/package.json`
- Modify: `packages/react/src/index.ts`
- Modify: editor source imports under `packages/react/src/editor`

- [ ] **Step 1: Move files**

Use `git mv` for the source tree so history is preserved.

- [ ] **Step 2: Rewrite editor-local imports**

Update relative imports that pointed at the old package root. Internal editor
imports should remain local inside `src/editor`; imports of shared Dewey
components should point to sibling react component entries.

- [ ] **Step 3: Add package exports**

Add editor root, core, adapters, plugins, utilities, and `editor/style.css`
exports to `packages/react/package.json`.

- [ ] **Step 4: Add runtime dependencies**

Move Lexical and Prism dependencies from `packages/editor/package.json` into
`packages/react/package.json`.

- [ ] **Step 5: Run green verification**

Run the command from Task 1. Expected: PASS.

### Task 3: Update Consumers And Docs

**Files:**

- Modify: `apps/website/*`
- Modify: `apps/storybook/*`
- Modify: `packages/mcp/src/catalog/*`
- Modify: `README.md`
- Modify: `README_ZH.md`
- Modify: `docs/design/components.md`
- Modify: `docs/architecture/package-layers.md`
- Modify: `apps/website/public/llms.txt`

- [ ] **Step 1: Replace public imports**

Replace `@deweyou-design/editor` imports with `@deweyou-design/react` or
`@deweyou-design/react/editor/*`.

- [ ] **Step 2: Remove workspace dependency references**

Remove `@deweyou-design/editor` from app package manifests and TypeScript path
aliases.

- [ ] **Step 3: Update durable docs**

Document `Editor` as part of `@deweyou-design/react`.

- [ ] **Step 4: Run consumer tests**

Run:

```bash
vp test apps/website/src/pages/editor.test.tsx apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.test.ts
```

Expected: PASS.

### Task 4: Remove Standalone Package From Workspace And Release

**Files:**

- Modify: `scripts/release.mjs`
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`
- Delete: `packages/editor/package.json`
- Delete: `packages/editor/vite.config.ts`
- Delete: `packages/editor/tsconfig*.json`
- Delete: `packages/editor/scripts/*`
- Delete: `packages/editor/README.md`

- [ ] **Step 1: Remove editor from release queue**

Delete the `@deweyou-design/editor` entry from `PUBLISHABLE_PACKAGES`.

- [ ] **Step 2: Remove workspace package metadata**

Delete the empty standalone package and update workspace lock data with
`pnpm install --lockfile-only` if needed.

- [ ] **Step 3: Run package/build verification**

Run:

```bash
vp test packages/react/src/editor packages/react/tests packages/infra/tests/release-contract.test.ts
vp run build -r
```

Expected: PASS.

### Task 5: Final Verification

**Files:**

- Read: `git diff --stat`
- Run: focused tests from Tasks 1-4

- [ ] **Step 1: Search for stale package references**

Run:

```bash
rg -n "@deweyou-design/editor|packages/editor|editor@" README.md README_ZH.md docs apps packages scripts pnpm-workspace.yaml package.json
```

Expected: no references except historical spec/plan archives when intentionally
left unchanged.

- [ ] **Step 2: Run final verification**

Run:

```bash
vp test packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/package-entrypoint.test.ts packages/infra/tests/release-contract.test.ts packages/mcp/src/catalog/index.test.ts
vp test packages/react/src/editor
vp run build -r
```

Expected: PASS, or report any exact blocker.
