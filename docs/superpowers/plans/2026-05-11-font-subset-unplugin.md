# Font Subset Unplugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a `@deweyou-design/styles/unplugin-font-subset` entry that lets applications generate Source Han Serif CN subset fonts from explicit charset files and opt-in source scanning.

**Architecture:** Keep build-tool-independent font logic in `packages/styles/src/font-subset/`, then wrap it with an unplugin adapter in `packages/styles/src/unplugin-font-subset/`. Generated CSS is consumed through `virtual:deweyou-font-subset.css` by default, with optional injection left as a follow-up-compatible adapter option.

**Tech Stack:** TypeScript, vite-plus tests, Node fs/path APIs, unplugin, subset-font.

---

### Task 1: Core Charset And CSS Contract

**Files:**

- Create: `packages/styles/src/font-subset/index.ts`
- Test: `packages/styles/tests/font-subset.test.ts`

- [x] **Step 1: Write failing tests**

Add tests that import `createFontSubsetInput`, `createFontFaceCss`, and `sourceHanSerifCnManifest` from `../src/font-subset`. Cover built-in safelist merging, charset files, scan include/exclude, blocklist removal, CSS generation, and invalid weight errors.

- [x] **Step 2: Run tests and verify RED**

Run: `pnpm exec vp test packages/styles/tests/font-subset.test.ts`

Expected: FAIL because `../src/font-subset` does not exist.

- [x] **Step 3: Implement charset and CSS core**

Create `packages/styles/src/font-subset/index.ts` with:

- `sourceHanSerifCnManifest`
- `fontSubsetVirtualCssId`
- `defineFontSubsetOptions`
- `createFontSubsetInput`
- `createFontFaceCss`
- `createFontSubset`

Use arrow functions for exported functions. `createFontSubset` should accept an optional `subsetFont` backend so tests can verify behavior without depending on font binary internals.

- [x] **Step 4: Run tests and verify GREEN**

Run: `pnpm exec vp test packages/styles/tests/font-subset.test.ts`

Expected: PASS.

### Task 2: Unplugin Adapter

**Files:**

- Create: `packages/styles/src/unplugin-font-subset/index.ts`
- Test: `packages/styles/tests/unplugin-font-subset.test.ts`

- [x] **Step 1: Write failing tests**

Add tests that import `fontSubset` from `../src/unplugin-font-subset`. Cover Vite adapter creation, virtual CSS module resolution, virtual CSS loading, and `configResolved` root handling.

- [x] **Step 2: Run tests and verify RED**

Run: `pnpm exec vp test packages/styles/tests/unplugin-font-subset.test.ts`

Expected: FAIL because `../src/unplugin-font-subset` does not exist.

- [x] **Step 3: Add dependencies**

Run: `pnpm add unplugin subset-font --filter @deweyou-design/styles`

- [x] **Step 4: Implement unplugin adapter**

Use `createUnplugin` from `unplugin`. The adapter should:

- Expose `fontSubset.vite`, `.rollup`, `.webpack`, `.rspack`, and `.raw`.
- Resolve `virtual:deweyou-font-subset.css`.
- Generate CSS from `createFontSubset`.
- Register charset/safelist/blocklist files with `addWatchFile` when available.
- Support `enforce: 'pre'`.

- [x] **Step 5: Run tests and verify GREEN**

Run: `pnpm exec vp test packages/styles/tests/unplugin-font-subset.test.ts packages/styles/tests/font-subset.test.ts`

Expected: PASS.

### Task 3: Package Exports And Theme Split

**Files:**

- Modify: `packages/styles/package.json`
- Modify: `packages/styles/vite.config.ts`
- Modify: `packages/styles/src/css/theme.css`
- Create: `packages/styles/src/css/theme-with-fonts.css`
- Modify: `packages/styles/tests/theme-outputs.test.ts`
- Modify: `packages/styles/tests/consumer-import.test.ts`

- [x] **Step 1: Write failing contract updates**

Update tests to assert:

- `theme.css` imports reset, base, light, and dark CSS but not `fonts.css`.
- `theme-with-fonts.css` imports `theme.css` and `fonts.css`.
- Published exports include `./font-subset`, `./unplugin-font-subset`, and `./theme-with-fonts.css`.
- Consumer app and Storybook still import `theme.css`.

- [x] **Step 2: Run tests and verify RED**

Run: `pnpm exec vp test packages/styles/tests/theme-outputs.test.ts packages/styles/tests/consumer-import.test.ts`

Expected: FAIL because exports and `theme-with-fonts.css` are not implemented yet.

- [x] **Step 3: Implement package exports and CSS split**

Add exports for:

- `./font-subset`
- `./unplugin-font-subset`
- `./theme-with-fonts.css`

Remove the `fonts.css` import from `theme.css`; put full-font compatibility into `theme-with-fonts.css`.

- [x] **Step 4: Run tests and verify GREEN**

Run: `pnpm exec vp test packages/styles/tests/theme-outputs.test.ts packages/styles/tests/consumer-import.test.ts`

Expected: PASS.

### Task 4: Documentation And Final Verification

**Files:**

- Modify: `packages/styles/README.md`
- Modify: `docs/superpowers/specs/2026-05-11-font-subset-unplugin-design.md` if implementation details require alignment

- [x] **Step 1: Update README**

Document three paths:

- `theme.css` only for fallback fonts.
- `fontSubset` plugin plus `virtual:deweyou-font-subset.css` for production subset fonts.
- `theme-with-fonts.css` for full bundled fonts.

- [x] **Step 2: Run targeted checks**

Run:

```bash
pnpm exec vp test packages/styles/tests/font-subset.test.ts packages/styles/tests/unplugin-font-subset.test.ts packages/styles/tests/theme-outputs.test.ts packages/styles/tests/consumer-import.test.ts
pnpm exec vp check docs/superpowers/specs/2026-05-11-font-subset-unplugin-design.md docs/superpowers/plans/2026-05-11-font-subset-unplugin.md packages/styles
git diff --check main...HEAD
```

Expected: PASS, except for pre-existing unrelated full-repo formatting issues already observed in the react-icons docs when running full `pnpm check`.

- [x] **Step 3: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-05-11-font-subset-unplugin.md packages/styles docs/superpowers/specs/2026-05-11-font-subset-unplugin-design.md pnpm-lock.yaml
git commit -m "feat(styles): add font subset unplugin"
```
