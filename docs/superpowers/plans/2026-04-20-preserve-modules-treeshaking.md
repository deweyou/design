# preserveModules + Tree-shaking Build Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch `@deweyou-design/react` to a `preserveModules` build so each source file maps to one output file, and add `sideEffects` declarations across all packages to enable reliable tree-shaking for npm consumers using any major bundler.

**Architecture:** Replace `packages/react`'s multi-entry bundled build (with opaque `chunks/`) with a single-entry `preserveModules: true` rollup output, causing `dist/` to mirror `src/`. Add `sideEffects` fields so Webpack 5, Vite, and Rollup can safely eliminate unused exports at consumption time.

**Tech Stack:** Vite lib mode, Rollup `preserveModules`, TypeScript `emitDeclarationOnly`, Less/CSS Modules

---

## File Map

| File                                | Change                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| `packages/react/vite.config.ts`     | Replace multi-entry lib config with single-entry + preserveModules |
| `packages/react/package.json`       | Add `"sideEffects": ["**/*.css"]`                                  |
| `packages/react-hooks/package.json` | Add `"sideEffects": false`                                         |
| `packages/utils/package.json`       | Add `"sideEffects": false`                                         |
| `packages/styles/package.json`      | Add `"sideEffects": ["**/*.css", "**/*.less"]`                     |
| `README.md`                         | Fix stale package names; add import and tree-shaking guide         |

---

### Task 1: Switch react package to preserveModules build

**Files:**

- Modify: `packages/react/vite.config.ts`

- [ ] **Step 1: Replace the vite config**

Replace the entire content of `packages/react/vite.config.ts` with:

```typescript
import { resolve } from 'node:path';

import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@deweyou-design/react-hooks',
        '@deweyou-design/styles',
        'classnames',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/*/index.tsx', 'src/*/index.ts'],
      exclude: ['src/index.ts', 'src/test-setup.ts', 'src/modules.d.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

- [ ] **Step 2: Run the react package build**

```bash
cd packages/react && npm run build
```

Expected: Build succeeds with no errors. If there are CSS extraction errors, verify `cssCodeSplit: true` is present and that `.module.less` files are imported in components (not re-exported as raw Less).

- [ ] **Step 3: Verify dist structure mirrors src**

```bash
find packages/react/dist -name "*.js" | sort | head -30
```

Expected output includes paths like:

```
packages/react/dist/badge/index.js
packages/react/dist/button/index.js
packages/react/dist/card/index.js
packages/react/dist/checkbox/index.js
packages/react/dist/index.js
packages/react/dist/menu/index.js
...
```

There must be no `packages/react/dist/chunks/` directory:

```bash
ls packages/react/dist/chunks 2>&1
```

Expected: `ls: cannot access 'packages/react/dist/chunks': No such file or directory`

- [ ] **Step 4: Verify style.css is still generated**

```bash
ls -lh packages/react/dist/style.css
```

Expected: File exists (non-zero size). If it's missing, the per-component CSS is still present in `dist/*/index.css` files; consumers using the `./style.css` subpath export depend on this file. In that case, add a post-build script to concatenate all per-component CSS into `dist/style.css`.

- [ ] **Step 5: Verify type declarations are generated**

```bash
ls packages/react/dist/button/index.d.ts packages/react/dist/index.d.ts packages/react/dist/menu/index.d.ts
```

Expected: All three files exist.

- [ ] **Step 6: Run tests**

```bash
cd packages/react && npm test
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/react/vite.config.ts
git commit -m "build(react): switch to preserve-modules for unbundled output"
```

---

### Task 2: Add sideEffects declarations to all packages

**Files:**

- Modify: `packages/react/package.json`
- Modify: `packages/react-hooks/package.json`
- Modify: `packages/utils/package.json`
- Modify: `packages/styles/package.json`

- [ ] **Step 1: Add sideEffects to packages/react/package.json**

In `packages/react/package.json`, add the `sideEffects` field after `"type": "module"`:

```json
"type": "module",
"sideEffects": ["**/*.css"],
```

- [ ] **Step 2: Add sideEffects to packages/react-hooks/package.json**

In `packages/react-hooks/package.json`, add after `"type": "module"`:

```json
"type": "module",
"sideEffects": false,
```

- [ ] **Step 3: Add sideEffects to packages/utils/package.json**

In `packages/utils/package.json`, add after `"type": "module"`:

```json
"type": "module",
"sideEffects": false,
```

- [ ] **Step 4: Add sideEffects to packages/styles/package.json**

In `packages/styles/package.json`, add after `"type": "module"`:

```json
"type": "module",
"sideEffects": ["**/*.css", "**/*.less"],
```

- [ ] **Step 5: Commit**

```bash
git add packages/react/package.json packages/react-hooks/package.json packages/utils/package.json packages/styles/package.json
git commit -m "build: add side-effects declarations to all packages"
```

---

### Task 3: Full monorepo build verification

**Files:**

- No file changes — verification only

- [ ] **Step 1: Run full monorepo build**

From the repo root:

```bash
vp run build -r
```

Expected: All packages build successfully. No errors.

- [ ] **Step 2: Verify all subpath exports resolve to real files**

```bash
node --input-type=module <<'EOF'
import { readFileSync, existsSync } from 'fs';
const pkg = JSON.parse(readFileSync('packages/react/package.json', 'utf8'));
const missing = [];
for (const [key, value] of Object.entries(pkg.exports)) {
  const importPath = typeof value === 'string' ? value : (value.import || value.default);
  if (!importPath) continue;
  const fsPath = 'packages/react/' + importPath.replace(/^\.\//, '');
  if (!existsSync(fsPath)) missing.push(`${key} → ${importPath}`);
}
if (missing.length) { console.error('Missing exports:\n' + missing.join('\n')); process.exit(1); }
else console.log('All exports resolve correctly');
EOF
```

Expected: `All exports resolve correctly`

- [ ] **Step 3: Run all tests**

```bash
vp test
```

Expected: All tests pass across the monorepo.

---

### Task 4: Check storybook and website for hard-coded chunk paths

**Files:**

- Modify: any file in `apps/` that hard-codes `dist/chunks/...`

- [ ] **Step 1: Search for hard-coded chunk references**

```bash
grep -r "dist/chunks" apps/ packages/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" 2>/dev/null
```

Expected: No matches. If matches are found, proceed to Step 2. If no matches, skip to Step 4.

- [ ] **Step 2: (Only if matches found) Replace chunk imports with proper subpath exports**

For each match, replace the hard-coded chunk import with the appropriate package subpath:

```ts
// Before — hard-coded chunk path (remove):
import something from '@deweyou-design/react/dist/chunks/button-abc123.js';

// After — use the proper subpath export:
import { Button } from '@deweyou-design/react/button';
```

- [ ] **Step 3: (Only if files changed) Run storybook dev to verify no runtime errors**

```bash
vp run storybook#dev
```

Open `http://localhost:6106`. Navigate through several component stories and confirm no import errors appear in the browser console. Stop the server with `Ctrl-C` when done.

- [ ] **Step 4: Run website dev to verify components render correctly**

```bash
vp run website#dev
```

Open the URL shown in the terminal output. Confirm components render without errors in the browser console. Stop the server with `Ctrl-C` when done.

- [ ] **Step 5: Commit if any files were changed**

Only run this step if Step 2 made changes:

```bash
git add apps/
git commit -m "chore: remove hard-coded dist chunk path imports"
```

---

### Task 5: Update README.md

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Fix stale package names in the Workspace Layout section**

In `README.md`, replace the existing `## Workspace Layout` section:

```markdown
## Workspace Layout

- `packages/utils`: framework-agnostic helpers and repository assertions.
- `packages/react-hooks`: reusable React hooks shared across apps and components.
- `packages/styles`: token sources, Less bridge files, and explicit global CSS entrypoints.
- `packages/react`: reusable React components with CSS Modules and root `className` overrides.
- `apps/website`: public documentation, theme guidance, and curated demos.
- `apps/storybook`: Storybook 10 internal review surface for state coverage and exploratory development.
```

- [ ] **Step 2: Add a Consuming the Library section before ## Monorepo Rules**

Insert the following section between `## Publishing` and `## Monorepo Rules`:

````markdown
## Consuming the Library

### Importing Components

**Barrel import** — convenient for development; modern bundlers (Vite, Webpack 5, Rollup) will tree-shake unused components automatically because `sideEffects` is declared in each package:

```ts
import { Button, Text } from '@deweyou-design/react';
```

**Per-component import** — most explicit, recommended for production builds or bundlers without reliable tree-shaking:

```ts
import { Button } from '@deweyou-design/react/button';
import { Text } from '@deweyou-design/react/text';
```

### Styles

Each component's CSS is emitted as a side effect of its JS import. Bundlers that respect the `sideEffects` field (Vite, Webpack 5, Rollup) include component styles automatically when the component is imported.

To load all styles at once — for example in SSR or non-bundled contexts:

```ts
import '@deweyou-design/react/style.css';
```
````

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update readme with current package names and import guide"
```
