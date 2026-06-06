# Editor Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@deweyou-design/editor` with an `Editor` component, Dewey-owned core contracts, a Lexical-backed first runtime, Markdown shortcuts, Storybook coverage, website integration, docs, and tests.

**Architecture:** Add a new published package instead of putting editor runtime dependencies into `@deweyou-design/react`. Public APIs use Dewey-owned adapter/plugin contracts; Lexical stays behind a private runtime bridge. The editor visually aligns with `MarkdownRender` and uses existing Dewey tokens and components.

**Tech Stack:** TypeScript, React 19, Lexical 0.45.x, Less Modules, vite-plus, Storybook, Testing Library, jsdom.

---

## File Structure

Create and modify these areas:

- `pnpm-workspace.yaml` - catalog entries for Lexical runtime packages.
- `packages/editor/package.json` - published package manifest and subpath exports.
- `packages/editor/vite.config.ts` - library build/test config, external dependencies, Less bridge.
- `packages/editor/scripts/inject-css-imports.mjs` and `packages/editor/scripts/concat-style.mjs` - package-local CSS publish helpers copied from `packages/react`.
- `packages/editor/src/core/index.ts` - public Dewey editor contracts and plugin helpers.
- `packages/editor/src/runtime/lexical.tsx` - private Lexical bridge and runtime type guards.
- `packages/editor/src/editor/index.tsx` and `index.module.less` - public `Editor` React component and styling.
- `packages/editor/src/adapters/markdown/index.ts` - official Markdown adapter.
- `packages/editor/src/plugins/rich-text/index.tsx` - official rich text plugin.
- `packages/editor/src/plugins/markdown-shortcut/index.tsx` - official Markdown shortcut plugin.
- `packages/editor/src/utils/index.ts` - public utility exports.
- `packages/editor/src/index.ts` - root common exports.
- `packages/editor/src/test-setup.ts` - test environment polyfills.
- `packages/editor/tests/*` and colocated `index.test.ts(x)` files - unit and package contract tests.
- `packages/react/tests/workspace-boundaries.test.ts` - assert `@deweyou-design/react` does not depend on editor.
- `apps/storybook/package.json`, `apps/storybook/src/stories/Editor.stories.tsx` - Storybook integration.
- `apps/website/package.json`, `apps/website/src/pages/editor.tsx`, `apps/website/src/pages/editor.module.less`, `apps/website/src/main.tsx`, `apps/website/src/components/navbar.tsx`, `apps/website/src/data/component-catalog.tsx`, related tests - website integration.
- `README.md`, `README_ZH.md`, `docs/design/components.md`, `packages/editor/README.md`, `apps/website/public/llms.txt` - public docs and AI context.

## Task 1: Package Scaffold And Dependency Boundary

**Files:**

- Modify: `pnpm-workspace.yaml`
- Create: `packages/editor/package.json`
- Create: `packages/editor/vite.config.ts`
- Create: `packages/editor/scripts/inject-css-imports.mjs`
- Create: `packages/editor/scripts/concat-style.mjs`
- Create: `packages/editor/src/index.ts`
- Create: `packages/editor/src/test-setup.ts`
- Create: `packages/editor/tests/package-contract.test.ts`
- Modify: `packages/react/tests/workspace-boundaries.test.ts`

- [ ] **Step 1: Add failing package contract tests**

Create `packages/editor/tests/package-contract.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('editor package publishes explicit root and subpath exports', () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(root, 'packages/editor/package.json'), 'utf8'),
  ) as {
    dependencies: Record<string, string>;
    exports: Record<string, unknown>;
    files: string[];
    peerDependencies: Record<string, string>;
    publishConfig?: { directory?: string };
    types: string;
  };

  expect(packageJson.files).toEqual(['dist']);
  expect(packageJson.types).toBe('./dist/index.d.ts');
  expect(packageJson.publishConfig?.directory).toBe('dist');
  expect(packageJson.exports).toMatchObject({
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
    './editor': {
      default: './dist/editor/index.js',
      import: './dist/editor/index.js',
      types: './dist/editor/index.d.ts',
    },
    './core': {
      default: './dist/core/index.js',
      import: './dist/core/index.js',
      types: './dist/core/index.d.ts',
    },
    './plugins/rich-text': {
      default: './dist/plugins/rich-text/index.js',
      import: './dist/plugins/rich-text/index.js',
      types: './dist/plugins/rich-text/index.d.ts',
    },
    './plugins/markdown-shortcut': {
      default: './dist/plugins/markdown-shortcut/index.js',
      import: './dist/plugins/markdown-shortcut/index.js',
      types: './dist/plugins/markdown-shortcut/index.d.ts',
    },
    './adapters/markdown': {
      default: './dist/adapters/markdown/index.js',
      import: './dist/adapters/markdown/index.js',
      types: './dist/adapters/markdown/index.d.ts',
    },
    './utils': {
      default: './dist/utils/index.js',
      import: './dist/utils/index.js',
      types: './dist/utils/index.d.ts',
    },
    './style.css': './dist/style.css',
    './package.json': './package.json',
  });

  expect(packageJson.dependencies).toMatchObject({
    '@deweyou-design/react': 'workspace:*',
    '@deweyou-design/styles': 'workspace:*',
    '@lexical/code': 'catalog:',
    '@lexical/link': 'catalog:',
    '@lexical/list': 'catalog:',
    '@lexical/markdown': 'catalog:',
    '@lexical/react': 'catalog:',
    '@lexical/rich-text': 'catalog:',
    '@lexical/utils': 'catalog:',
    classnames: 'catalog:',
    lexical: 'catalog:',
  });
  expect(packageJson.peerDependencies).toMatchObject({
    react: 'catalog:',
    'react-dom': 'catalog:',
  });
});

test('editor package externalizes editor runtime dependencies in published builds', () => {
  const viteConfig = readFileSync(resolve(root, 'packages/editor/vite.config.ts'), 'utf8');

  expect(viteConfig).toContain("'@deweyou-design/react'");
  expect(viteConfig).toContain("'@deweyou-design/styles'");
  expect(viteConfig).toContain("'lexical'");
  expect(viteConfig).toContain('/^@lexical\\\\//');
});
```

Modify `packages/react/tests/workspace-boundaries.test.ts` so the first test also reads `packages/editor/package.json` and asserts the base React package does not depend on the editor package:

```ts
const editorPackage = JSON.parse(
  readFileSync(resolve(root, 'packages/editor/package.json'), 'utf8'),
) as {
  dependencies: Record<string, string>;
  peerDependencies?: Record<string, string>;
  publishConfig?: { directory?: string };
};

expect(componentPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-design/editor');
expect(editorPackage.dependencies).toMatchObject({
  '@deweyou-design/react': 'workspace:*',
  '@deweyou-design/styles': 'workspace:*',
});
expect(editorPackage.peerDependencies).toMatchObject({
  react: 'catalog:',
  'react-dom': 'catalog:',
});
expect(editorPackage.publishConfig?.directory).toBe('dist');
```

- [ ] **Step 2: Run tests to verify package does not exist yet**

Run:

```bash
pnpm exec vp test packages/editor/tests/package-contract.test.ts packages/react/tests/workspace-boundaries.test.ts
```

Expected: FAIL with missing `packages/editor/package.json`.

- [ ] **Step 3: Add catalog entries**

Modify `pnpm-workspace.yaml` catalog:

```yaml
'@lexical/code': ^0.45.0
'@lexical/link': ^0.45.0
'@lexical/list': ^0.45.0
'@lexical/markdown': ^0.45.0
'@lexical/react': ^0.45.0
'@lexical/rich-text': ^0.45.0
'@lexical/utils': ^0.45.0
lexical: ^0.45.0
```

- [ ] **Step 4: Create editor package manifest**

Create `packages/editor/package.json`:

```json
{
  "name": "@deweyou-design/editor",
  "version": "0.1.0",
  "description": "Editor capabilities, plugins, adapters, and React surfaces for Deweyou Design.",
  "files": ["dist"],
  "type": "module",
  "sideEffects": ["**/*.css"],
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./editor": {
      "types": "./dist/editor/index.d.ts",
      "import": "./dist/editor/index.js",
      "default": "./dist/editor/index.js"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js",
      "default": "./dist/core/index.js"
    },
    "./plugins/rich-text": {
      "types": "./dist/plugins/rich-text/index.d.ts",
      "import": "./dist/plugins/rich-text/index.js",
      "default": "./dist/plugins/rich-text/index.js"
    },
    "./plugins/markdown-shortcut": {
      "types": "./dist/plugins/markdown-shortcut/index.d.ts",
      "import": "./dist/plugins/markdown-shortcut/index.js",
      "default": "./dist/plugins/markdown-shortcut/index.js"
    },
    "./adapters/markdown": {
      "types": "./dist/adapters/markdown/index.d.ts",
      "import": "./dist/adapters/markdown/index.js",
      "default": "./dist/adapters/markdown/index.js"
    },
    "./utils": {
      "types": "./dist/utils/index.d.ts",
      "import": "./dist/utils/index.js",
      "default": "./dist/utils/index.js"
    },
    "./style.css": "./dist/style.css",
    "./package.json": "./package.json"
  },
  "publishConfig": {
    "directory": "dist"
  },
  "scripts": {
    "build": "vp build && tsc -p tsconfig.build.json && node scripts/inject-css-imports.mjs && node scripts/concat-style.mjs && node ../infra/scripts/write-published-manifest.mjs .",
    "dev": "vp build --watch",
    "test": "vp test"
  },
  "dependencies": {
    "@deweyou-design/react": "workspace:*",
    "@deweyou-design/styles": "workspace:*",
    "@lexical/code": "catalog:",
    "@lexical/link": "catalog:",
    "@lexical/list": "catalog:",
    "@lexical/markdown": "catalog:",
    "@lexical/react": "catalog:",
    "@lexical/rich-text": "catalog:",
    "@lexical/utils": "catalog:",
    "classnames": "catalog:",
    "lexical": "catalog:"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "catalog:",
    "@testing-library/react": "catalog:",
    "@testing-library/user-event": "catalog:",
    "@tsdown/css": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "jsdom": "catalog:",
    "less": "catalog:",
    "typescript": "catalog:",
    "vite-plus": "catalog:"
  },
  "peerDependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  }
}
```

- [ ] **Step 5: Create build config and CSS scripts**

Create `packages/editor/vite.config.ts`:

```ts
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite-plus';

const stylesLessBridge = fileURLToPath(new URL('../styles/src/less/bridge.less', import.meta.url));

export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@deweyou-design/react',
        '@deweyou-design/styles',
        'classnames',
        'lexical',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        /^@lexical\//,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "${stylesLessBridge}";\n`,
      },
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
  },
});
```

Copy `packages/react/scripts/inject-css-imports.mjs` and
`packages/react/scripts/concat-style.mjs` into `packages/editor/scripts/`.

- [ ] **Step 6: Create starter source and setup files**

Create `packages/editor/src/index.ts`:

```ts
export {};
```

Create `packages/editor/src/test-setup.ts`:

```ts
import { expect } from 'vite-plus/test';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.scrollTo = function () {};
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
```

- [ ] **Step 7: Install dependencies and run package tests**

Run:

```bash
pnpm install --ignore-scripts
pnpm exec vp test packages/editor/tests/package-contract.test.ts packages/react/tests/workspace-boundaries.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit scaffold**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml packages/editor packages/react/tests/workspace-boundaries.test.ts
git commit -m "feat(editor): add editor package scaffold"
```

## Task 2: Core Contracts And Public Exports

**Files:**

- Create: `packages/editor/src/core/index.ts`
- Create: `packages/editor/src/core/index.test.ts`
- Create: `packages/editor/src/utils/index.ts`
- Modify: `packages/editor/src/index.ts`

- [ ] **Step 1: Write failing core tests**

Create `packages/editor/src/core/index.test.ts`:

```ts
import { createElement } from 'react';
import { expect, test } from 'vite-plus/test';

import {
  composeEditorPlugins,
  createEditorPlugin,
  createEditorPluginCompatibilityError,
  isEditorPluginCompatibilityError,
  type EditorAdapter,
  type EditorPlugin,
} from './index';

test('createEditorPlugin preserves plugin name and setup', () => {
  const plugin = createEditorPlugin({
    name: 'sample',
    setup: () => createElement('span', null, 'sample plugin'),
  });

  expect(plugin.name).toBe('sample');
  expect(plugin.setup({ runtime: { kind: 'test', handle: null } })).toMatchObject({
    type: 'span',
  });
});

test('composeEditorPlugins keeps order and rejects duplicate names', () => {
  const first = createEditorPlugin({ name: 'first', setup: () => null });
  const second = createEditorPlugin({ name: 'second', setup: () => null });

  expect(composeEditorPlugins([first, second]).map((plugin) => plugin.name)).toEqual([
    'first',
    'second',
  ]);
  expect(() => composeEditorPlugins([first, first])).toThrow(
    'Editor plugin names must be unique: first',
  );
});

test('compatibility errors are recoverable editor errors', () => {
  const error = createEditorPluginCompatibilityError({
    adapter: 'markdown',
    plugin: 'columns',
    reason: 'Markdown cannot serialize column blocks.',
  });

  expect(error.name).toBe('EditorPluginCompatibilityError');
  expect(error.message).toContain('markdown');
  expect(error.message).toContain('columns');
  expect(error.recoverable).toBe(true);
  expect(isEditorPluginCompatibilityError(error)).toBe(true);
  expect(isEditorPluginCompatibilityError(new Error('x'))).toBe(false);
});

test('adapter type keeps content protocol generic', () => {
  const adapter: EditorAdapter<string> = {
    name: 'text',
    createInitialState: ({ value }) => value ?? '',
    readValue: () => 'value',
  };
  const plugin: EditorPlugin = createEditorPlugin({ name: 'plain', setup: () => null });

  expect(adapter.name).toBe('text');
  expect(plugin.name).toBe('plain');
});
```

- [ ] **Step 2: Run core test to verify failure**

Run:

```bash
pnpm exec vp test packages/editor/src/core/index.test.ts
```

Expected: FAIL with missing exports from `packages/editor/src/core/index.ts`.

- [ ] **Step 3: Implement core contracts**

Create `packages/editor/src/core/index.ts`:

```ts
import type { CSSProperties, ReactNode } from 'react';

export type EditorRuntime = {
  kind: string;
  handle: unknown;
};

export type EditorPluginContext = {
  runtime: EditorRuntime;
};

export type EditorPlugin = {
  name: string;
  setup: (context: EditorPluginContext) => ReactNode;
};

export type EditorPluginInput = {
  name: string;
  setup: (context: EditorPluginContext) => ReactNode;
};

export type EditorAdapterInitialStateDetails<TValue> = {
  value: TValue | undefined;
  defaultValue: TValue | undefined;
};

export type EditorAdapterReadDetails = {
  runtime: EditorRuntime;
};

export type EditorAdapterApplyValueDetails<TValue> = {
  runtime: EditorRuntime;
  value: TValue;
};

export type EditorAdapter<TValue = unknown> = {
  name: string;
  createInitialState: (details: EditorAdapterInitialStateDetails<TValue>) => unknown;
  readValue: (details: EditorAdapterReadDetails) => TValue;
  applyValue?: (details: EditorAdapterApplyValueDetails<TValue>) => void;
};

export type EditorChangeDetails<TValue = unknown> = {
  value: TValue;
};

export type EditorProps<TValue = unknown> = {
  value?: TValue;
  defaultValue?: TValue;
  adapter: EditorAdapter<TValue>;
  plugins?: EditorPlugin[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  onChange?: (details: EditorChangeDetails<TValue>) => void;
};

export type EditorPluginCompatibilityErrorDetails = {
  adapter: string;
  plugin: string;
  reason: string;
};

export class EditorPluginCompatibilityError extends Error {
  recoverable = true;

  constructor({ adapter, plugin, reason }: EditorPluginCompatibilityErrorDetails) {
    super(`Editor adapter "${adapter}" is not compatible with plugin "${plugin}": ${reason}`);
    this.name = 'EditorPluginCompatibilityError';
  }
}

export const createEditorPlugin = ({ name, setup }: EditorPluginInput): EditorPlugin => ({
  name,
  setup,
});

export const composeEditorPlugins = (plugins: EditorPlugin[]): EditorPlugin[] => {
  const names = new Set<string>();

  for (const plugin of plugins) {
    if (names.has(plugin.name)) {
      throw new Error(`Editor plugin names must be unique: ${plugin.name}`);
    }
    names.add(plugin.name);
  }

  return plugins;
};

export const createEditorPluginCompatibilityError = (
  details: EditorPluginCompatibilityErrorDetails,
) => new EditorPluginCompatibilityError(details);

export const isEditorPluginCompatibilityError = (
  value: unknown,
): value is EditorPluginCompatibilityError => value instanceof EditorPluginCompatibilityError;
```

Create `packages/editor/src/utils/index.ts`:

```ts
export {
  createEditorPluginCompatibilityError,
  isEditorPluginCompatibilityError,
} from '../core/index.js';
```

Update `packages/editor/src/index.ts`:

```ts
export * from './core/index.js';
export * from './utils/index.js';
```

- [ ] **Step 4: Run core tests**

Run:

```bash
pnpm exec vp test packages/editor/src/core/index.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit core contracts**

```bash
git add packages/editor/src/core packages/editor/src/utils packages/editor/src/index.ts
git commit -m "feat(editor): add editor core contracts"
```

## Task 3: Lexical Runtime, Adapter, And Official Plugins

**Files:**

- Create: `packages/editor/src/runtime/lexical.tsx`
- Create: `packages/editor/src/adapters/markdown/index.ts`
- Create: `packages/editor/src/adapters/markdown/index.test.ts`
- Create: `packages/editor/src/plugins/rich-text/index.tsx`
- Create: `packages/editor/src/plugins/rich-text/index.test.tsx`
- Create: `packages/editor/src/plugins/markdown-shortcut/index.tsx`
- Create: `packages/editor/src/plugins/markdown-shortcut/index.test.tsx`
- Modify: `packages/editor/src/index.ts`

- [ ] **Step 1: Write failing adapter and plugin tests**

Create `packages/editor/src/adapters/markdown/index.test.ts`:

```ts
import { createEditor } from 'lexical';
import { $getRoot } from 'lexical';
import { expect, test } from 'vite-plus/test';

import { createLexicalRuntime, lexicalEditorNodes } from '../../runtime/lexical';
import { markdownEditorAdapter } from './index';

test('markdown adapter initializes and reads markdown', () => {
  const editor = createEditor({
    namespace: 'MarkdownAdapterTest',
    nodes: lexicalEditorNodes,
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();

  editor.update(() => {
    const state = adapter.createInitialState({
      value: '# Hello\n\nThis is **bold**.',
      defaultValue: undefined,
    });

    expect(state).toBeUndefined();
  });

  const value = editor
    .getEditorState()
    .read(() => adapter.readValue({ runtime: createLexicalRuntime(editor) }));

  expect(value).toContain('# Hello');
  expect(value).toContain('**bold**');
});

test('markdown adapter uses defaultValue when value is missing', () => {
  const editor = createEditor({
    namespace: 'MarkdownDefaultValueTest',
    nodes: lexicalEditorNodes,
    onError: (error) => {
      throw error;
    },
  });
  const adapter = markdownEditorAdapter();

  editor.update(() => {
    adapter.createInitialState({
      value: undefined,
      defaultValue: 'A default paragraph.',
    });
  });

  const text = editor.getEditorState().read(() => $getRoot().getTextContent());

  expect(text).toBe('A default paragraph.');
});
```

Create `packages/editor/src/plugins/rich-text/index.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { createLexicalRuntime } from '../../runtime/lexical';
import { richTextPlugin } from './index';

test('richTextPlugin exposes a Dewey plugin wrapper', () => {
  const plugin = richTextPlugin();

  expect(plugin.name).toBe('rich-text');
  expect(renderToStaticMarkup(plugin.setup({ runtime: { kind: 'unknown', handle: null } }))).toBe(
    '',
  );
});

test('richTextPlugin renders Lexical base plugins for lexical runtime', () => {
  const plugin = richTextPlugin();
  const markup = renderToStaticMarkup(plugin.setup({ runtime: createLexicalRuntime(null) }));

  expect(markup).toBe('');
});
```

Create `packages/editor/src/plugins/markdown-shortcut/index.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vite-plus/test';

import { createLexicalRuntime } from '../../runtime/lexical';
import { markdownShortcutPlugin } from './index';

test('markdownShortcutPlugin exposes a Dewey plugin wrapper', () => {
  const plugin = markdownShortcutPlugin();

  expect(plugin.name).toBe('markdown-shortcut');
  expect(renderToStaticMarkup(plugin.setup({ runtime: { kind: 'unknown', handle: null } }))).toBe(
    '',
  );
});

test('markdownShortcutPlugin renders Lexical shortcut plugin for lexical runtime', () => {
  const plugin = markdownShortcutPlugin();
  const markup = renderToStaticMarkup(plugin.setup({ runtime: createLexicalRuntime(null) }));

  expect(markup).toBe('');
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
pnpm exec vp test packages/editor/src/adapters/markdown/index.test.ts packages/editor/src/plugins/rich-text/index.test.tsx packages/editor/src/plugins/markdown-shortcut/index.test.tsx
```

Expected: FAIL with missing runtime, adapter, and plugin files.

- [ ] **Step 3: Implement private Lexical runtime bridge**

Create `packages/editor/src/runtime/lexical.tsx`:

```tsx
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import type { LexicalEditor } from 'lexical';

import type { EditorRuntime } from '../core/index.js';

export const lexicalEditorNodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
];

export type LexicalRuntimeHandle = {
  editor: LexicalEditor | null;
};

export type LexicalEditorRuntime = EditorRuntime & {
  kind: 'lexical';
  handle: LexicalRuntimeHandle;
};

export const createLexicalRuntime = (editor: LexicalEditor | null): LexicalEditorRuntime => ({
  kind: 'lexical',
  handle: { editor },
});

export const isLexicalRuntime = (runtime: EditorRuntime): runtime is LexicalEditorRuntime =>
  runtime.kind === 'lexical' &&
  typeof runtime.handle === 'object' &&
  runtime.handle !== null &&
  'editor' in runtime.handle;
```

- [ ] **Step 4: Implement Markdown adapter**

Create `packages/editor/src/adapters/markdown/index.ts`:

```ts
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';

import type { EditorAdapter } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export type MarkdownEditorAdapterOptions = {
  transformers?: typeof TRANSFORMERS;
};

export const markdownEditorAdapter = (
  options: MarkdownEditorAdapterOptions = {},
): EditorAdapter<string> => {
  const transformers = options.transformers ?? TRANSFORMERS;

  return {
    name: 'markdown',
    createInitialState: ({ value, defaultValue }) => {
      $convertFromMarkdownString(value ?? defaultValue ?? '', transformers);
    },
    readValue: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return '';
      }

      return $convertToMarkdownString(transformers);
    },
    applyValue: ({ value }) => {
      $convertFromMarkdownString(value, transformers);
    },
  };
};
```

- [ ] **Step 5: Implement official plugins**

Create `packages/editor/src/plugins/rich-text/index.tsx`:

```tsx
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

import { createEditorPlugin } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export const richTextPlugin = () =>
  createEditorPlugin({
    name: 'rich-text',
    setup: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return null;
      }

      return (
        <>
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
        </>
      );
    },
  });
```

Create `packages/editor/src/plugins/markdown-shortcut/index.tsx`:

```tsx
import { TRANSFORMERS } from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

import { createEditorPlugin } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

export const markdownShortcutPlugin = () =>
  createEditorPlugin({
    name: 'markdown-shortcut',
    setup: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return null;
      }

      return <MarkdownShortcutPlugin transformers={TRANSFORMERS} />;
    },
  });
```

- [ ] **Step 6: Export adapter and plugins**

Update `packages/editor/src/index.ts`:

```ts
export * from './adapters/markdown/index.js';
export * from './core/index.js';
export * from './plugins/markdown-shortcut/index.js';
export * from './plugins/rich-text/index.js';
export * from './utils/index.js';
```

- [ ] **Step 7: Run adapter and plugin tests**

Run:

```bash
pnpm exec vp test packages/editor/src/adapters/markdown/index.test.ts packages/editor/src/plugins/rich-text/index.test.tsx packages/editor/src/plugins/markdown-shortcut/index.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit runtime and plugin work**

```bash
git add packages/editor/src/runtime packages/editor/src/adapters packages/editor/src/plugins packages/editor/src/index.ts
git commit -m "feat(editor): add lexical markdown runtime"
```

## Task 4: Editor Component And Styling

**Files:**

- Create: `packages/editor/src/editor/index.tsx`
- Create: `packages/editor/src/editor/index.module.less`
- Create: `packages/editor/src/editor/index.test.tsx`
- Modify: `packages/editor/src/index.ts`
- Modify: `packages/editor/tests/package-contract.test.ts`

- [ ] **Step 1: Write failing Editor component tests**

Create `packages/editor/src/editor/index.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../adapters/markdown/index.js';
import { markdownShortcutPlugin } from '../plugins/markdown-shortcut/index.js';
import { richTextPlugin } from '../plugins/rich-text/index.js';
import { Editor } from './index';

test('renders editable editor with stable data attributes and placeholder', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      placeholder="Write a comment..."
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
    />,
  );

  expect(screen.getByTestId('editor-root')).toHaveAttribute('data-editor-root', 'true');
  expect(screen.getByTestId('editor-content')).toHaveAttribute('data-editor-content', 'true');
  expect(screen.getByText('Write a comment...')).toBeInTheDocument();
});

test('emits markdown value when user types', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
      onChange={onChange}
    />,
  );

  await user.click(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'Hello editor');

  expect(onChange).toHaveBeenCalled();
  expect(onChange.mock.calls.at(-1)?.[0].value).toContain('Hello editor');
});

test('uses defaultValue as initial content', () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Initial markdown"
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
    />,
  );

  expect(screen.getByText('Initial markdown')).toBeInTheDocument();
});

test('readOnly and disabled prevent editing', () => {
  const { rerender } = render(
    <Editor adapter={markdownEditorAdapter()} readOnly defaultValue="Read only text" />,
  );

  expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false');
  expect(screen.getByTestId('editor-root')).toHaveAttribute('data-readonly', 'true');

  rerender(<Editor adapter={markdownEditorAdapter()} disabled defaultValue="Disabled text" />);

  expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false');
  expect(screen.getByTestId('editor-root')).toHaveAttribute('data-disabled', 'true');
});
```

- [ ] **Step 2: Run Editor tests to verify failure**

Run:

```bash
pnpm exec vp test packages/editor/src/editor/index.test.tsx
```

Expected: FAIL with missing `Editor`.

- [ ] **Step 3: Implement Editor component**

Create `packages/editor/src/editor/index.tsx`:

```tsx
import { Fragment, useEffect, useMemo, useRef } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import classNames from 'classnames';

import {
  composeEditorPlugins,
  type EditorAdapter,
  type EditorPlugin,
  type EditorProps,
} from '../core/index.js';
import { createLexicalRuntime, lexicalEditorNodes } from '../runtime/lexical.js';

import styles from './index.module.less';

type EditorChangePluginProps<TValue> = {
  adapter: EditorAdapter<TValue>;
  onChange: EditorProps<TValue>['onChange'];
};

const EditorChangePlugin = <TValue,>({ adapter, onChange }: EditorChangePluginProps<TValue>) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!onChange) {
      return undefined;
    }

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        onChange({
          value: adapter.readValue({ runtime: createLexicalRuntime(editor) }),
        });
      });
    });
  }, [adapter, editor, onChange]);

  return null;
};

type EditorValueSyncPluginProps<TValue> = {
  adapter: EditorAdapter<TValue>;
  value: TValue | undefined;
};

const EditorValueSyncPlugin = <TValue,>({ adapter, value }: EditorValueSyncPluginProps<TValue>) => {
  const [editor] = useLexicalComposerContext();
  const previousValue = useRef(value);

  useEffect(() => {
    if (value === undefined || Object.is(previousValue.current, value)) {
      return;
    }

    previousValue.current = value;
    editor.update(() => {
      adapter.applyValue?.({ runtime: createLexicalRuntime(editor), value });
    });
  }, [adapter, editor, value]);

  return null;
};

type EditorEditablePluginProps = {
  editable: boolean;
};

const EditorEditablePlugin = ({ editable }: EditorEditablePluginProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(editable);
  }, [editable, editor]);

  return null;
};

export const Editor = <TValue,>({
  adapter,
  className,
  defaultValue,
  disabled = false,
  onChange,
  placeholder,
  plugins = [],
  readOnly = false,
  style,
  value,
}: EditorProps<TValue>) => {
  const editable = !disabled && !readOnly;
  const composedPlugins = useMemo(() => composeEditorPlugins(plugins), [plugins]);
  const initialConfig = useMemo(
    () => ({
      editable,
      namespace: 'DeweyouEditor',
      nodes: lexicalEditorNodes,
      onError: (error: Error) => {
        throw error;
      },
      editorState: () => {
        adapter.createInitialState({ defaultValue, value });
      },
      theme: {
        root: styles.content,
        paragraph: styles.paragraph,
        heading: {
          h1: styles.heading,
          h2: styles.heading,
          h3: styles.heading,
        },
        quote: styles.blockquote,
        list: {
          ul: styles.list,
          ol: styles.list,
          listitem: styles.listItem,
        },
        text: {
          bold: styles.bold,
          italic: styles.italic,
          strikethrough: styles.strikethrough,
          code: styles.inlineCode,
        },
        code: styles.codeBlock,
      },
    }),
    [adapter, defaultValue, editable, value],
  );
  const runtime = createLexicalRuntime(null);

  return (
    <div
      className={classNames(styles.root, className)}
      data-disabled={disabled ? 'true' : undefined}
      data-editor-root="true"
      data-readonly={readOnly ? 'true' : undefined}
      data-testid="editor-root"
      style={style}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-label={placeholder ?? 'Editor'}
              className={styles.contentEditable}
              data-editor-content="true"
              data-editor-size="md"
              data-testid="editor-content"
              role="textbox"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
          placeholder={placeholder ? <div className={styles.placeholder}>{placeholder}</div> : null}
        />
        <EditorEditablePlugin editable={editable} />
        <EditorChangePlugin adapter={adapter} onChange={onChange} />
        <EditorValueSyncPlugin adapter={adapter} value={value} />
        {composedPlugins.map((plugin) => (
          <Fragment key={plugin.name}>{plugin.setup({ runtime })}</Fragment>
        ))}
      </LexicalComposer>
    </div>
  );
};

Editor.displayName = 'Editor';
```

- [ ] **Step 4: Implement editor styles**

Create `packages/editor/src/editor/index.module.less`:

```less
.root {
  --editor-block-gap: var(--markdown-block-gap, 0.85rem);
  --editor-min-block-size: 9rem;

  position: relative;
  color: var(--ui-color-text);
  font-family: var(--ui-font-content);
}

.contentEditable {
  min-block-size: var(--editor-min-block-size);
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface);
  color: inherit;
  font: inherit;
  line-height: var(--ui-text-line-height-body);
  outline: none;
  .native-scrollbar();

  &:focus-visible {
    .focus-ring-offset();
  }
}

.root[data-disabled='true'] .contentEditable {
  cursor: not-allowed;
  opacity: 0.62;
}

.placeholder {
  position: absolute;
  inset-block-start: var(--ui-space-4);
  inset-inline-start: var(--ui-space-4);
  color: var(--ui-color-text-muted);
  pointer-events: none;
}

.paragraph {
  margin-block: var(--editor-block-gap);
}

.heading {
  margin-block: calc(var(--editor-block-gap) * 1.6) var(--editor-block-gap);
  color: var(--ui-color-text-strong);
  font-family: var(--ui-font-heading);
  font-weight: 650;
  line-height: var(--ui-text-line-height-h3);
}

.blockquote {
  margin-block: var(--editor-block-gap);
  padding-inline-start: var(--ui-space-4);
  border-inline-start: 3px solid var(--ui-color-border-strong);
  color: var(--ui-color-text-muted);
}

.list {
  margin-block: var(--editor-block-gap);
  padding-inline-start: 1.4em;
}

.listItem {
  margin-block: 0.28rem;
}

.bold {
  font-weight: 650;
}

.italic {
  font-style: italic;
}

.strikethrough {
  text-decoration-line: line-through;
}

.inlineCode {
  padding: 0.08em 0.32em;
  border-radius: var(--ui-radius-xs);
  background: var(--ui-color-surface-raised);
  font-family: var(--ui-font-mono);
  font-size: 0.92em;
}

.codeBlock {
  margin-block: var(--editor-block-gap);
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface-raised);
  font-family: var(--ui-font-mono);
  overflow: auto;
  .native-scrollbar();
}
```

- [ ] **Step 5: Export Editor and rerun tests**

Update `packages/editor/src/index.ts`:

```ts
export * from './adapters/markdown/index.js';
export * from './core/index.js';
export * from './editor/index.js';
export * from './plugins/markdown-shortcut/index.js';
export * from './plugins/rich-text/index.js';
export * from './utils/index.js';
```

Run:

```bash
pnpm exec vp test packages/editor/src/editor/index.test.tsx packages/editor/tests/package-contract.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Editor component**

```bash
git add packages/editor/src/editor packages/editor/src/index.ts packages/editor/tests/package-contract.test.ts
git commit -m "feat(editor): add editor component"
```

## Task 5: Storybook Integration

**Files:**

- Modify: `apps/storybook/package.json`
- Create: `apps/storybook/src/stories/Editor.stories.tsx`

- [ ] **Step 1: Add Storybook package dependency**

Modify `apps/storybook/package.json` dependencies:

```json
"@deweyou-design/editor": "workspace:*"
```

- [ ] **Step 2: Create Editor stories with interaction coverage**

Create `apps/storybook/src/stories/Editor.stories.tsx`:

```tsx
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Editor,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
} from '@deweyou-design/editor';

const markdownAdapter = markdownEditorAdapter();
const basePlugins = [richTextPlugin(), markdownShortcutPlugin()];

const meta = {
  title: 'Components/Editor',
  component: Editor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Editor provides Deweyou editor capabilities with adapters and plugins. The first version demonstrates Markdown-oriented rich text input.',
      },
    },
    layout: 'padded',
  },
  args: {
    adapter: markdownAdapter,
    plugins: basePlugins,
    placeholder: 'Write a comment...',
  },
} satisfies Meta<typeof Editor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MarkdownShortcuts: Story = {
  args: {
    defaultValue: '# Heading\n\n- First item\n\n> Quote\n\n`inline code`',
  },
};

const ControlledExample = () => {
  const [value, setValue] = useState('Controlled markdown');

  return (
    <div>
      <Editor
        adapter={markdownAdapter}
        plugins={basePlugins}
        value={value}
        onChange={({ value: nextValue }) => setValue(nextValue)}
      />
      <pre aria-label="Markdown output">{value}</pre>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const ReadOnly: Story = {
  args: {
    defaultValue: 'Read-only editor content',
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Disabled editor content',
    disabled: true,
  },
};

export const Interaction: Story = {
  args: {
    placeholder: 'Write a comment...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textbox = canvas.getByRole('textbox');

    await userEvent.click(textbox);
    await userEvent.type(textbox, '# Heading{enter}{enter}Hello **bold** text');

    await waitFor(() => {
      expect(textbox).toHaveTextContent('Heading');
      expect(textbox).toHaveTextContent('Hello bold text');
    });
  },
};
```

- [ ] **Step 3: Run Storybook-targeted checks**

Run:

```bash
pnpm exec vp test packages/editor/src/editor/index.test.tsx
pnpm exec vp run storybook#test -- --include "Components/Editor"
```

Expected: unit test PASS and Storybook interaction PASS. If Storybook test filtering is unsupported, run `pnpm exec vp run storybook#test` and verify the Editor story passes.

- [ ] **Step 4: Commit Storybook integration**

```bash
git add apps/storybook/package.json apps/storybook/src/stories/Editor.stories.tsx
git commit -m "feat(editor): add storybook editor stories"
```

## Task 6: Website Integration

**Files:**

- Modify: `apps/website/package.json`
- Create: `apps/website/src/pages/editor.tsx`
- Create: `apps/website/src/pages/editor.module.less`
- Create: `apps/website/src/pages/editor.test.tsx`
- Modify: `apps/website/src/main.tsx`
- Modify: `apps/website/src/components/navbar.tsx`
- Modify: `apps/website/src/components/navbar.test.tsx`
- Modify: `apps/website/src/data/component-catalog.tsx`
- Modify: `apps/website/src/data/component-catalog.test.tsx`

- [ ] **Step 1: Add failing website tests**

Create `apps/website/src/pages/editor.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vite-plus/test';

import { EditorPage } from './editor';

test('renders the editor playground as the first page experience', () => {
  render(<EditorPage />);

  expect(screen.getByRole('heading', { name: 'Editor' })).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.getByLabelText('Markdown output')).toBeInTheDocument();
});

test('updates markdown output as the user edits', async () => {
  const user = userEvent.setup();

  render(<EditorPage />);

  await user.click(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'Hello website editor');

  expect(screen.getByLabelText('Markdown output')).toHaveTextContent('Hello website editor');
});
```

Modify `apps/website/src/components/navbar.test.tsx` to expect Editor in Explore and active at `/editor`:

```tsx
test('marks Editor active on /editor', () => {
  renderNavbar('/editor');

  expect(screen.getByRole('button', { name: /Explore/ })).toHaveAttribute('data-active');
});
```

Modify `apps/website/src/data/component-catalog.test.tsx` so the expected catalog names include `Editor`.

- [ ] **Step 2: Run website tests to verify failure**

Run:

```bash
pnpm exec vp test apps/website/src/pages/editor.test.tsx apps/website/src/components/navbar.test.tsx apps/website/src/data/component-catalog.test.tsx
```

Expected: FAIL with missing `EditorPage` and catalog/nav entries.

- [ ] **Step 3: Add website dependency**

Modify `apps/website/package.json` dependencies:

```json
"@deweyou-design/editor": "workspace:*"
```

- [ ] **Step 4: Create editor page**

Create `apps/website/src/pages/editor.tsx`:

```tsx
import { useState } from 'react';

import {
  Editor,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
} from '@deweyou-design/editor';
import { Text } from '@deweyou-design/react';

import styles from './editor.module.less';

const editorPlugins = [richTextPlugin(), markdownShortcutPlugin()];
const markdownAdapter = markdownEditorAdapter();
const DEFAULT_VALUE = '# Editor\n\nUse Markdown shortcuts like `#`, `-`, `>`, and `**bold**`.';

export const EditorPage = () => {
  const [value, setValue] = useState(DEFAULT_VALUE);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Editor · Markdown Shortcuts</p>
        <h1>Editor</h1>
        <Text className={styles.lead} variant="body">
          Try the Deweyou editor package with rich text behavior and Markdown-oriented shortcuts.
        </Text>
      </section>

      <section className={styles.workspace} aria-label="Editor playground">
        <section className={styles.editorPane} aria-label="Editor input">
          <div className={styles.paneHeader}>
            <span>Editor</span>
            <strong>live</strong>
          </div>
          <Editor
            adapter={markdownAdapter}
            defaultValue={DEFAULT_VALUE}
            plugins={editorPlugins}
            placeholder="Write a comment..."
            onChange={({ value: nextValue }) => setValue(nextValue)}
          />
        </section>

        <section className={styles.outputPane} aria-label="Markdown output panel">
          <div className={styles.paneHeader}>
            <span>Markdown output</span>
            <strong>{value.length} chars</strong>
          </div>
          <pre aria-label="Markdown output" className={styles.output}>
            {value}
          </pre>
        </section>
      </section>
    </main>
  );
};
```

Create `apps/website/src/pages/editor.module.less`:

```less
.page {
  min-block-size: 100vh;
  padding: 7rem max(var(--ui-space-5), 5vw) var(--ui-space-8);
  background: var(--ui-color-surface);
  color: var(--ui-color-text);
}

.hero {
  max-inline-size: 58rem;
  margin-inline: auto;
}

.eyebrow {
  margin: 0 0 var(--ui-space-2);
  color: var(--ui-color-text-muted);
  font: 600 var(--ui-text-size-caption) / 1.4 var(--ui-font-control);
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  color: var(--ui-color-text-strong);
  font: 700 var(--ui-text-size-h1) / var(--ui-text-line-height-h1) var(--ui-font-heading);
}

.lead {
  max-inline-size: 42rem;
  margin-block-start: var(--ui-space-3);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(20rem, 0.95fr);
  gap: var(--ui-space-5);
  max-inline-size: 72rem;
  margin: var(--ui-space-7) auto 0;
}

.editorPane,
.outputPane {
  min-inline-size: 0;
}

.paneHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: var(--ui-space-2);
  color: var(--ui-color-text-muted);
  font: 600 var(--ui-text-size-caption) / 1.4 var(--ui-font-control);
}

.output {
  min-block-size: 9rem;
  max-block-size: 24rem;
  margin: 0;
  padding: var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface-raised);
  color: var(--ui-color-text);
  font-family: var(--ui-font-mono);
  white-space: pre-wrap;
  overflow: auto;
  .native-scrollbar();
}

@media (max-width: 760px) {
  .page {
    padding-inline: var(--ui-space-4);
  }

  .workspace {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Wire route and navigation**

Modify `apps/website/src/main.tsx`:

```tsx
import { EditorPage } from './pages/editor';
```

Add route:

```tsx
{ path: 'editor', element: <EditorPage /> },
```

Modify `apps/website/src/components/navbar.tsx` `EXPLORE_ROUTE_ITEMS`:

```ts
  { label: 'Editor', to: '/editor', value: '/editor' },
```

- [ ] **Step 6: Add catalog item**

Modify `apps/website/src/data/component-catalog.tsx` imports:

```tsx
import {
  Editor,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
} from '@deweyou-design/editor';
```

Add a `content` catalog item:

```tsx
{
  name: 'Editor',
  category: 'content',
  description: 'Editor capability surface with adapters, plugins, and Markdown shortcuts.',
  importSnippet: "import { Editor } from '@deweyou-design/editor';",
  dimensions: ['adapter', 'plugins', 'state'],
  storyId: 'components-editor--default',
  preview: (
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="Editor preview"
      plugins={[richTextPlugin(), markdownShortcutPlugin()]}
      readOnly
    />
  ),
}
```

- [ ] **Step 7: Run website tests**

Run:

```bash
pnpm exec vp test apps/website/src/pages/editor.test.tsx apps/website/src/components/navbar.test.tsx apps/website/src/data/component-catalog.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit website integration**

```bash
git add apps/website/package.json apps/website/src
git commit -m "feat(editor): add website editor playground"
```

## Task 7: Documentation And Public Context

**Files:**

- Create: `packages/editor/README.md`
- Modify: `README.md`
- Modify: `README_ZH.md`
- Modify: `docs/design/components.md`
- Modify: `apps/website/public/llms.txt`

- [ ] **Step 1: Add package README**

Create `packages/editor/README.md`:

````md
# @deweyou-design/editor

Editor capabilities for Deweyou Design.

```tsx
import {
  Editor,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
} from '@deweyou-design/editor';

<Editor
  adapter={markdownEditorAdapter()}
  plugins={[richTextPlugin(), markdownShortcutPlugin()]}
  placeholder="Write a comment..."
/>;
```
````

`Editor` does not expose a `format` prop. Content protocols are owned by
adapters, so Markdown is an official adapter rather than the component's default
world view.

````

- [ ] **Step 2: Update root README files**

In `README.md`, add `@deweyou-design/editor` to the package list and add a short
Editor section:

```md
## Editor

`@deweyou-design/editor` provides the `Editor` component, core editor contracts,
official plugins, adapters, and utilities. The first official adapter is
`markdownEditorAdapter()`, and Markdown-style authoring behavior is provided by
`markdownShortcutPlugin()`.
````

In `README_ZH.md`, add the matching Chinese section:

```md
## Editor

`@deweyou-design/editor` 提供 `Editor` 组件、编辑器核心协议、官方插件、适配器和工具函数。
首个官方适配器是 `markdownEditorAdapter()`，Markdown 风格快捷输入由
`markdownShortcutPlugin()` 提供。
```

- [ ] **Step 3: Update component docs and AI context**

Add to `docs/design/components.md` component table:

```md
| `Editor` | `@deweyou-design/editor` | `@deweyou-design/editor/editor` |
```

Add an Editor section:

````md
### Editor

```tsx
<Editor adapter={markdownEditorAdapter()} plugins={[richTextPlugin(), markdownShortcutPlugin()]} />
```
````

`Editor` is the editor capability surface for Deweyou Design. Keep content
formats behind adapters; do not add a `format` prop to the component. Use
`markdownEditorAdapter()` for Markdown strings and `markdownShortcutPlugin()` for
Markdown-style authoring shortcuts.

````

Update `apps/website/public/llms.txt` with an Editor entry that points consumers
to `@deweyou-design/editor`.

- [ ] **Step 4: Run docs-adjacent tests**

Run:

```bash
pnpm exec vp test apps/website/src/data/component-catalog.test.tsx packages/editor/tests/package-contract.test.ts
````

Expected: PASS.

- [ ] **Step 5: Commit docs**

```bash
git add README.md README_ZH.md docs/design/components.md packages/editor/README.md apps/website/public/llms.txt
git commit -m "docs(editor): document editor package"
```

## Task 8: Full Verification And Final Repair

**Files:**

- Inspect all changed files from earlier tasks.

- [ ] **Step 1: Run focused package tests**

Run:

```bash
pnpm exec vp test packages/editor/src/core/index.test.ts packages/editor/src/adapters/markdown/index.test.ts packages/editor/src/plugins/rich-text/index.test.tsx packages/editor/src/plugins/markdown-shortcut/index.test.tsx packages/editor/src/editor/index.test.tsx packages/editor/tests/package-contract.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run repository checks**

Run:

```bash
pnpm exec vp check
pnpm exec vp test
```

Expected: PASS.

- [ ] **Step 3: Run Storybook e2e**

Run:

```bash
pnpm exec vp run storybook#test
```

Expected: PASS, including `Components/Editor`.

- [ ] **Step 4: Run full build**

Run:

```bash
pnpm exec vp run build -r
```

Expected: PASS and `packages/editor/dist` contains subpath entry files and `style.css`.

- [ ] **Step 5: Inspect package boundaries**

Run:

```bash
git diff --stat
rg -n "\"@deweyou-design/editor\"" packages/react apps packages package.json pnpm-workspace.yaml
```

Expected:

- `@deweyou-design/editor` appears in `apps/storybook`, `apps/website`, docs, and the new editor package.
- `packages/react/package.json` does not depend on `@deweyou-design/editor`.

- [ ] **Step 6: Commit verification repairs if needed**

If the verification steps require fixes, commit them:

```bash
git add packages/editor apps/storybook apps/website packages/react/tests pnpm-workspace.yaml pnpm-lock.yaml README.md README_ZH.md docs/design/components.md apps/website/public/llms.txt
git commit -m "fix(editor): repair verification issues"
```

If no fixes are needed, do not create an empty commit.
