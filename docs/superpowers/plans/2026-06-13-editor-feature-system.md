# Editor Feature System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the editor feature registry, feature-owned plugins, full website editor experience, and Storybook plugin playground with unit and Storybook e2e coverage.

**Architecture:** Extend the existing editor plugin contract so feature plugins contribute nodes, commands, actions, Markdown shortcuts, keyboard shortcuts, paste handlers, and setup renderers. Entrypoint plugins render or register those contributions through a composed registry instead of hardcoding feature behavior. Keep `richTextPlugin()` as a compatibility preset while moving the preferred API to focused feature plugins and a parameterized `codePlugin()`.

**Tech Stack:** TypeScript, React 19, Lexical 0.45, Less Modules, Storybook 10, vite-plus, Vitest/jsdom.

---

## File Structure

- Modify `packages/editor/src/core/index.ts` for the registry, command, action, shortcut, paste, ref, and plugin contribution contracts.
- Modify `packages/editor/src/runtime/lexical.tsx` so Lexical nodes come from composed plugin contributions plus required defaults.
- Modify `packages/editor/src/editor/index.tsx` for registry creation, contributed node setup, context injection, and imperative ref support.
- Create focused feature plugins under `packages/editor/src/plugins/<feature>/index.tsx` with colocated tests:
  - `history`
  - `text-format`
  - `heading`
  - `list`
  - `quote`
  - `link`
  - `code`
  - `table`
  - `keyboard-shortcut`
  - `paste`
  - `floating-toolbar`
  - `block-toolbar`
- Modify existing plugins:
  - `packages/editor/src/plugins/toolbar/index.tsx`
  - `packages/editor/src/plugins/markdown-shortcut/index.tsx`
  - `packages/editor/src/plugins/rich-text/index.tsx`
- Modify `packages/editor/src/index.ts` and `packages/editor/package.json` exports for new public plugins.
- Modify `packages/editor/src/editor/index.module.less`, `packages/editor/src/plugins/toolbar/index.module.less`, and add focused Less modules for floating/block/link/code/table UI where needed.
- Modify `packages/editor/src/adapters/markdown/index.ts` and tests if feature-filtered Markdown transformations need adapter support.
- Modify `pnpm-workspace.yaml`, `pnpm-lock.yaml`, and `packages/editor/package.json` to add direct `@lexical/table` dependency.
- Modify website files:
  - `apps/website/src/pages/editor.tsx`
  - `apps/website/src/pages/editor.module.less`
  - `apps/website/src/pages/editor.test.tsx`
- Modify Storybook:
  - `apps/storybook/src/stories/Editor.stories.tsx`
- Update package contract tests if public exports change:
  - `packages/editor/tests/package-contract.test.ts`

---

## Task 1: Registry And Core Contracts

**Files:**

- Modify: `packages/editor/src/core/index.ts`
- Test: `packages/editor/src/core/index.test.ts`

- [ ] **Step 1: Write failing registry aggregation tests**

Add tests that create small fake plugins and assert:

```ts
const registry = composeEditorPlugins([
  createEditorPlugin({
    name: 'feature-a',
    feature: { id: 'feature-a' },
    commands: [{ id: 'feature-a.run', run: () => undefined }],
    toolbarActions: [{ command: 'feature-a.run', id: 'feature-a.run', label: 'Run' }],
    nodes: ['node-a'],
    setup: () => null,
  }),
]);

expect(registry.plugins).toHaveLength(1);
expect(registry.features.has('feature-a')).toBe(true);
expect(registry.commands.has('feature-a.run')).toBe(true);
expect(registry.toolbarActions.map((action) => action.id)).toEqual(['feature-a.run']);
expect(registry.nodes).toEqual(['node-a']);
```

- [ ] **Step 2: Write failing registry validation tests**

Cover duplicate plugin names, duplicate feature ids, duplicate action ids,
missing required features, and action command references that do not exist.

Run:

```bash
vp test packages/editor/src/core/index.test.ts
```

Expected: fails because `composeEditorPlugins()` still returns a plugin array.

- [ ] **Step 3: Implement core types and composer**

Extend `EditorPlugin`, `EditorPluginInput`, and `createEditorPlugin()` to accept:

```ts
feature?: { id: string; preset?: boolean };
requires?: string[];
nodes?: unknown[];
commands?: EditorCommand[];
toolbarActions?: EditorAction[];
floatingToolbarActions?: EditorAction[];
blockToolbarActions?: EditorAction[];
markdownShortcuts?: EditorMarkdownShortcutContribution[];
keyboardShortcuts?: EditorKeyboardShortcutContribution[];
pasteHandlers?: EditorPasteContribution[];
setup?: (context: EditorPluginContext) => ReactNode;
```

Make `composeEditorPlugins()` return an `EditorPluginRegistry` with maps and
arrays for all contribution types. Keep the duplicate plugin name error message
compatible with existing tests.

- [ ] **Step 4: Run core tests**

Run:

```bash
vp test packages/editor/src/core/index.test.ts
```

Expected: pass.

---

## Task 2: Editor Runtime Composition And Ref

**Files:**

- Modify: `packages/editor/src/runtime/lexical.tsx`
- Modify: `packages/editor/src/editor/index.tsx`
- Test: `packages/editor/src/editor/index.test.tsx`

- [ ] **Step 1: Write failing editor registry tests**

Add tests proving:

```tsx
<Editor adapter={markdownEditorAdapter()} plugins={[nodeContributionPlugin]} />
```

passes contributed nodes into the Lexical config, and plugin setup receives
`context.registry`.

Add a ref test:

```tsx
const ref = createRef<EditorHandle<string>>();
render(<Editor ref={ref} adapter={markdownEditorAdapter()} defaultValue="hello" />);
expect(ref.current?.getValue()).toContain('hello');
act(() => ref.current?.setValue('next'));
expect(ref.current?.getValue()).toContain('next');
```

Run:

```bash
vp test packages/editor/src/editor/index.test.tsx
```

Expected: fails because registry context and ref do not exist.

- [ ] **Step 2: Implement registry-aware `Editor`**

Use `forwardRef` while preserving the generic `Editor<TValue>` export type.
Compose registry with `useMemo`, derive Lexical nodes from default text root
nodes plus `registry.nodes`, and pass `registry` into every plugin setup call.

Implement `EditorHandle<TValue>` methods:

- `focus`
- `blur`
- `getValue`
- `setValue`
- `insertContent`
- `runCommand`

- [ ] **Step 3: Run editor tests**

Run:

```bash
vp test packages/editor/src/editor/index.test.tsx
```

Expected: pass.

---

## Task 3: Feature Plugins And Compatibility Preset

**Files:**

- Create/modify feature plugin folders under `packages/editor/src/plugins/`
- Modify: `packages/editor/src/plugins/rich-text/index.tsx`
- Modify: `packages/editor/src/index.ts`
- Test: colocated plugin tests

- [ ] **Step 1: Write failing feature contribution tests**

For each feature plugin, assert the contribution shape:

```ts
expect(historyPlugin().commands.map((command) => command.id)).toEqual([
  'history.undo',
  'history.redo',
]);
expect(headingPlugin({ levels: [1, 2] }).toolbarActions.map((action) => action.id)).toEqual([
  'heading.h1',
  'heading.h2',
]);
expect(codePlugin({ format: false }).feature?.id).toBe('code');
```

Run targeted plugin tests. Expected: fail because plugins do not exist.

- [ ] **Step 2: Implement focused feature plugins**

Move existing hardcoded behavior from `toolbarPlugin()` and `richTextPlugin()`
into feature plugins:

- `historyPlugin()` wraps Lexical `HistoryPlugin` and exposes undo/redo actions.
- `textFormatPlugin()` exposes bold, italic, strikethrough, and inline code.
- `headingPlugin()` contributes `HeadingNode` and level-filtered actions/shortcuts.
- `listPlugin()` contributes `ListNode`, `ListItemNode`, ordered/unordered commands.
- `quotePlugin()` contributes `QuoteNode`.
- `linkPlugin()` contributes `LinkNode`, `LinkPlugin`, and insert/edit/unlink UI helpers.
- `codePlugin()` contributes `CodeNode`, optional `CodeHighlightNode`, highlighting
  setup, and a persistent code-block header UI for language, copy, wrap, and
  injected formatter commands. The header must reuse shared chrome primitives
  exposed by `packages/react/src/code-block` so display code blocks and editable
  code blocks keep one visual contract while Lexical continues to own the editor
  code DOM.
- `tablePlugin()` contributes `TableNode`, `TableRowNode`, and `TableCellNode`
  through direct `@lexical/table` dependency. It also owns its contextual table
  tools overlay, row/column action handles, and Markdown-compatible row/column
  boundary insertion handles, instead of routing table operations through the
  generic block toolbar.

- [ ] **Step 3: Preserve `richTextPlugin()`**

Make `richTextPlugin()` return a preset-compatible plugin that contributes the
same setup and feature list as:

```ts
[
  historyPlugin(),
  textFormatPlugin(),
  headingPlugin({ levels: [1, 2, 3] }),
  listPlugin(),
  quotePlugin(),
  linkPlugin(),
  codePlugin(),
];
```

The compatibility plugin name remains `rich-text`.

- [ ] **Step 4: Run feature tests**

Run:

```bash
vp test packages/editor/src/plugins
```

Expected: pass.

---

## Task 4: Entrypoint Plugins

**Files:**

- Modify: `packages/editor/src/plugins/toolbar/index.tsx`
- Modify: `packages/editor/src/plugins/markdown-shortcut/index.tsx`
- Create: `packages/editor/src/plugins/keyboard-shortcut/index.tsx`
- Create: `packages/editor/src/plugins/paste/index.tsx`
- Create: `packages/editor/src/plugins/floating-toolbar/index.tsx`
- Create: `packages/editor/src/plugins/block-toolbar/index.tsx`
- Test: colocated plugin tests

- [ ] **Step 1: Write failing entrypoint tests**

Tests should prove:

- `toolbarPlugin()` renders actions from `registry.toolbarActions`.
- Explicit `actions` filters and orders toolbar actions.
- `markdownShortcutPlugin({ shortcuts: ['heading'] })` uses only heading
  shortcut contributions.
- `keyboardShortcutPlugin()` dispatches registered shortcuts.
- `pastePlugin()` does not create disabled feature nodes.
- floating toolbar renders text/link actions when a text selection exists.
- block toolbar hides when no feature contributes generic block actions. Code
  block actions are rendered by `codePlugin()` as a persistent code block header,
  and table actions are rendered by `tablePlugin()` as table-owned contextual
  tools with row/column action handles and boundary insertion handles.

- [ ] **Step 2: Implement registry-driven entrypoints**

Remove hardcoded heading/list/text-format behavior from `toolbarPlugin()`.
Implement the new entrypoint plugins by reading `context.registry` and dispatching
commands through the registry.

- [ ] **Step 3: Run entrypoint tests**

Run:

```bash
vp test packages/editor/src/plugins/toolbar packages/editor/src/plugins/markdown-shortcut packages/editor/src/plugins/keyboard-shortcut packages/editor/src/plugins/paste packages/editor/src/plugins/floating-toolbar packages/editor/src/plugins/block-toolbar
```

Expected: pass.

---

## Task 5: Website Full Editor Experience

**Files:**

- Modify: `apps/website/src/pages/editor.tsx`
- Modify: `apps/website/src/pages/editor.module.less`
- Test: `apps/website/src/pages/editor.test.tsx`

- [ ] **Step 1: Write failing website tests**

Assert the editor page renders:

- full-feature editor region
- toolbar
- floating/block controls affordance labels
- imperative API controls for focus, set value, insert content, and command run
- Markdown output preview or status proving `onChange` still works

Run:

```bash
vp test apps/website/src/pages/editor.test.tsx
```

Expected: fail until the page is upgraded.

- [ ] **Step 2: Implement full editor page**

Use feature-composed plugins, including injected JSON formatter:

```ts
codePlugin({
  format: {
    formatters: {
      json: async (code) => JSON.stringify(JSON.parse(code), null, 2),
    },
  },
  highlight: true,
  languageMenu: true,
  wrap: true,
});
```

Make the page a usable product editor, not an API list.

- [ ] **Step 3: Run website tests**

Run:

```bash
vp test apps/website/src/pages/editor.test.tsx
```

Expected: pass.

---

## Task 6: Storybook Plugin Playground And E2E

**Files:**

- Modify: `apps/storybook/src/stories/Editor.stories.tsx`

- [ ] **Step 1: Write Storybook stories and Interaction coverage**

Add fixed stories:

- `Minimal`
- `MarkdownWriting`
- `RichWriting`
- `CodeFocused`
- `Table`
- `Controlled`
- `ReadOnly`
- `Disabled`
- `PluginPlayground`
- `Interaction`

`Interaction.play` must type content, use a toolbar action, use a Markdown
shortcut, exercise code/table affordances, and assert emitted output.

- [ ] **Step 2: Run Storybook e2e**

Run:

```bash
vp run storybook#test
```

Expected: pass. If it requires a dev server, start `vp run storybook#dev` and
rerun the e2e command against the printed URL.

---

## Task 7: Package Contracts And Verification

**Files:**

- Modify: `packages/editor/package.json`
- Modify: `packages/editor/tests/package-contract.test.ts`
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`
- Modify: `docs/superpowers/specs/2026-06-13-editor-feature-system-design.md` if implementation changes approved scope

- [ ] **Step 1: Add direct package exports and dependencies**

Add direct dependency/catalog support for `@lexical/table`. Export new plugin
subpaths and root exports for all public plugins and `EditorHandle`.

- [ ] **Step 2: Run package contract tests**

Run:

```bash
vp test packages/editor/tests/package-contract.test.ts
```

Expected: pass.

- [ ] **Step 3: Run full verification**

Run:

```bash
vp check
vp test
vp run storybook#test
vp run build -r
```

Expected: all pass.
