# Editor Feature System Design

## Status

Draft for review.

## Goal

Evolve `@deweyou-design/editor` from a small Markdown-oriented Lexical wrapper into
a feature-composed editor framework. Feature plugins should be the source of
truth for editor capabilities, while toolbar, Markdown shortcuts, keyboard
shortcuts, paste handling, and page demos consume those feature contributions
without duplicating feature logic.

The first delivery should keep the existing editor package usable, preserve the
current Markdown adapter path, and add enough infrastructure to support a
full-feature website editor and a Storybook plugin playground.

## Background

The current editor package has three public plugins:

- `toolbarPlugin()`
- `richTextPlugin()`
- `markdownShortcutPlugin()`

This made the first editor release small, but the responsibilities are now
blurred. `richTextPlugin()` currently behaves like a broad preset: it enables
history, list behavior, links, code highlighting, a code language menu, and Prism
initialization. `toolbarPlugin()` owns feature-specific commands and active-state
logic for headings, lists, inline marks, and undo/redo. `markdownShortcutPlugin()`
uses a global set of Markdown transformers rather than deriving shortcuts from
enabled features.

That shape causes capability drift. For example, heading behavior can exist in
the toolbar, Markdown shortcuts, runtime node registration, and rich-text preset
at the same time. Custom features would have to teach every entrypoint how to
recognize and mutate the same node. The new design should prevent that by
centralizing feature definitions.

## Product Scope

### In Scope

- Add a feature registry and plugin composer for nodes, commands, toolbar
  actions, Markdown shortcuts, keyboard shortcuts, paste handlers, and React
  setup.
- Split `richTextPlugin()` into focused feature plugins while preserving a
  compatibility preset.
- Keep code as one public `codePlugin()` with parameterized sub-capabilities
  instead of many public code plugins.
- Make `markdownShortcutPlugin()` parameterized and feature-aware.
- Make `toolbarPlugin()` feature-aware instead of hardcoding feature behavior.
- Add foundational editing experiences:
  - link editing
  - keyboard shortcuts
  - paste and clipboard handling
  - floating toolbar or bubble menu
  - block toolbar and block actions
  - imperative editor API via ref
- Add content features:
  - text formatting
  - headings
  - lists
  - quotes
  - code blocks
  - tables
- Update the website editor page into a full-feature editor experience.
- Update Storybook so editor stories demonstrate plugin insertion and removal.

### Out Of Scope For This Iteration

- image and media editing
- mention or autocomplete
- custom block infrastructure for consumer-owned `DecoratorNode` features
- collaboration, comments, presence, or remote cursors
- replacing Lexical as the internal runtime
- making Delta the public document model
- changing the public Markdown adapter into the only supported persistence model

## Core Architecture

### Feature Plugins Are The Source Of Truth

Each content or behavior feature owns its runtime definition and contribution
surface. For example:

```tsx
headingPlugin({ levels: [1, 2] });
codePlugin({
  format: {
    formatters: {
      json: async (code) => JSON.stringify(JSON.parse(code), null, 2),
    },
  },
  highlight: true,
  languageMenu: true,
  languages: [
    { label: 'TypeScript', value: 'ts' },
    { label: 'JSON', value: 'json' },
  ],
  wrap: false,
});
```

`headingPlugin()` owns what a heading is. It contributes `HeadingNode`, heading
commands, toolbar actions, Markdown shortcuts, keyboard shortcuts, and active
state resolution for the configured levels. Entrypoint plugins consume those
contributions and do not reimplement heading logic.

`codePlugin()` owns code block behavior as one public feature. It contributes the
base code node, optional highlight nodes and setup, optional language controls,
optional wrap controls, and optional formatting commands/actions based on its
parameters.

### Entrypoint Plugins Consume Contributions

Entrypoint plugins are generic interaction surfaces:

- `toolbarPlugin()` renders enabled toolbar actions and dispatches their commands.
- `markdownShortcutPlugin()` registers Markdown shortcuts from enabled features,
  filtered by its own parameters.
- `keyboardShortcutPlugin()` registers keyboard shortcuts from enabled features,
  filtered by its own parameters.
- `pastePlugin()` normalizes pasted content through enabled feature paste
  handlers.
- `floatingToolbarPlugin()` renders inline selection actions contributed by
  features.
- `blockToolbarPlugin()` renders block actions contributed by block-level
  features.

These plugins should not know that H1 uses `HeadingNode` or that code language is
stored on `CodeNode`. They should consume registered action descriptors.

### Registry And Composer

`Editor` composes plugins before creating the Lexical editor. The composer
builds a registry containing:

- Lexical nodes
- commands
- feature metadata
- toolbar actions
- floating toolbar actions
- block toolbar actions
- Markdown shortcut factories
- keyboard shortcut bindings
- paste handlers
- React setup renderers

The composer also validates:

- plugin names are unique
- feature ids are unique unless explicitly marked as presets
- required features are present
- action ids are unique
- shortcuts and actions reference valid commands
- feature options do not contradict each other

The generated registry becomes part of `EditorPluginContext`, so entrypoint
plugins can render and register behavior based on the same facts.

### Commands And Actions

Commands are Dewey editor-level operations, not toolbar-specific callbacks. They
hide Lexical details from entrypoint plugins:

```ts
type EditorCommand<TPayload = void> = {
  id: string;
  run: (context: EditorCommandContext, payload: TPayload) => void | Promise<void>;
  canRun?: (context: EditorCommandContext, payload: TPayload) => boolean;
};
```

Actions are UI-facing descriptors that reference commands:

```ts
type EditorAction = {
  id: string;
  command: string;
  icon?: React.ComponentType<{ size?: 'sm' }>;
  label: string;
  isActive?: (context: EditorActionStateContext) => boolean;
  isVisible?: (context: EditorActionStateContext) => boolean;
};
```

Toolbar, floating toolbar, block toolbar, keyboard shortcuts, Markdown shortcuts,
and paste handlers all converge on commands. This keeps each feature behavior in
one implementation path.

## Public Plugin Shape

The existing `EditorPlugin` shape should be extended rather than replaced
wholesale, so existing plugins can migrate incrementally:

```ts
type EditorPlugin = {
  name: string;
  slot: EditorPluginSlot;
  feature?: EditorFeatureContribution;
  nodes?: EditorNodeContribution[];
  commands?: EditorCommand[];
  toolbarActions?: EditorAction[];
  floatingToolbarActions?: EditorAction[];
  blockToolbarActions?: EditorAction[];
  markdownShortcuts?: EditorMarkdownShortcutContribution[];
  keyboardShortcuts?: EditorKeyboardShortcutContribution[];
  pasteHandlers?: EditorPasteContribution[];
  setup?: (context: EditorPluginContext) => React.ReactNode;
};
```

The exact internal type names may change during implementation, but the public
intent must remain: feature plugins contribute capabilities; entrypoint plugins
consume capabilities.

## Feature Plugins

### `textFormatPlugin()`

Owns inline text marks:

- bold
- italic
- strikethrough
- inline code

It contributes toolbar and floating-toolbar actions, keyboard shortcuts, Markdown
shortcuts, and commands for each enabled mark.

### `headingPlugin()`

Owns heading nodes and levels. It must support:

```ts
headingPlugin({ levels: [1, 2, 3] });
```

If only levels `[1, 2]` are enabled, toolbar actions and Markdown shortcuts for
H3 must not appear or execute.

### `listPlugin()`

Owns ordered and unordered list behavior. Task lists are not part of this first
iteration.

### `quotePlugin()`

Owns blockquote behavior and its toolbar, Markdown shortcut, keyboard shortcut,
and paste contributions.

### `linkPlugin()`

Owns inline links and editing UI. It should support:

- insert link
- edit selected link URL
- unlink
- link action state
- floating-toolbar access for selected links or selected text
- keyboard access through a registry-provided shortcut

### `historyPlugin()`

Owns undo and redo behavior and contributes undo/redo toolbar or keyboard
actions.

### `codePlugin()`

Owns code block behavior as one public plugin with parameterized capabilities.

Default behavior:

```ts
codePlugin({
  format: false,
  highlight: true,
  languageMenu: true,
  wrap: false,
});
```

Supported options:

- `languageMenu`: shows the code-block language control. In the editor surface,
  this control lives in the code block's persistent header row and opens a listbox
  for configured languages.
- `copy`: shows a copy action in the code block header.
- `wrap`: shows a wrap toggle in the code block header.
- `format`: shows a format action in the code block header when formatters are
  provided.

Code block actions should be visually colocated with the code block rather than
rendered in the generic block toolbar. They should stay visible without requiring
the code block to be focused, and the code block should reserve a header row so
the actions do not cover code text.

The editor code block should align with the React component library's
`CodeBlock` visual system without handing the editable DOM to the display
component. `CodeBlock` should expose reusable chrome primitives for the code
header, language control, and icon actions. `codePlugin()` should reuse those
primitives for the persistent editor header while keeping Lexical responsible for
the `CodeNode`, selection, contenteditable behavior, and Prism token DOM.
Display-state `CodeBlock` and edit-state code blocks may use different
highlighting engines, but their token classes must map to the same code block
design tokens.

- `languages`: allowed language options.
- `highlight`: `boolean` or object with tokenizer/default-language options.
- `languageMenu`: `boolean` or object controlling the language picker UI.
- `wrap`: `boolean` or object controlling default wrap behavior and whether a
  wrap action is visible.
- `format`: `false` or object with per-language formatter functions.

The code feature should expose commands for:

- toggling the current block into a code block
- setting code language
- toggling or setting wrap state
- formatting the current code block when a formatter exists

Formatting must be user-injected. The package should not bundle a large formatter
runtime by default. If no formatter exists for the current language, the format
action should be hidden or disabled with an accessible label.

### `tablePlugin()`

Owns basic table behavior. First iteration support should include:

- insert table
- add row
- add column
- delete row
- delete column
- delete table
- a table-owned contextual tools overlay when the selection is inside a table
- row and column action handles next to the active row or column; these handles
  open menus for add/delete row or column operations so row/column commands stay
  spatially tied to their target
- hover insertion handles on row and column boundaries for Markdown-compatible
  row and column insertion
- table keyboard navigation where Lexical provides it

Advanced table styling, resize handles, merged cells, formulas, and spreadsheet
behavior are out of scope.

## Presets And Compatibility

`richTextPlugin()` should remain as a compatibility preset for at least one
release cycle. It should be documented as deprecated or compatibility-oriented
and internally expand into focused feature plugins.

Recommended new preset:

```ts
basicWritingPlugins();
```

It can return:

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

The preset is a convenience composition, not the source of truth.

## Markdown Shortcuts

`markdownShortcutPlugin()` remains independent, but it becomes feature-aware and
parameterized:

```ts
markdownShortcutPlugin({
  shortcuts: ['heading', 'list', 'quote', 'code', 'text-format'],
});
```

Default behavior should use all enabled feature shortcut contributions. Explicit
configuration filters which shortcut groups are registered.

Markdown shortcuts must obey feature configuration. For example,
`headingPlugin({ levels: [1, 2] })` may contribute `# ` and `## `, but must not
allow `### ` to create H3.

## Toolbar And Menus

### Main Toolbar

`toolbarPlugin()` should render actions from the registry. Consumers may provide
an action list to control order and visibility:

```ts
toolbarPlugin({
  actions: [
    'history.undo',
    'history.redo',
    'text-format.bold',
    'text-format.italic',
    'heading.h1',
    'heading.h2',
    'list.unordered',
    'list.ordered',
    'quote.toggle',
    'code.toggle-block',
    'table.insert',
  ],
});
```

If `actions` is omitted, the toolbar renders the default toolbar actions
contributed by enabled features.

### Floating Toolbar

`floatingToolbarPlugin()` should appear for text selections and inline nodes. The
first useful scope is text formatting and link editing.

### Block Toolbar

`blockToolbarPlugin()` should appear for block-level structural affordances where
the active block has registered structural block actions. Code block actions are
owned by `codePlugin()` and render as a persistent code block header. Table
actions are owned by `tablePlugin()`: table-level actions render next to the
active table, while row and column actions render from row and column handles so
destructive row/column operations stay tied to the visible target instead of a
generic block toolbar row.

## Keyboard And Paste

`keyboardShortcutPlugin()` should register shortcuts from enabled features. It
should support an allowlist or denylist so consumers can keep platform-specific
shortcuts predictable.

`pastePlugin()` should normalize pasted plain text, Markdown-like input, and HTML
through enabled features. Paste handling must not create nodes for disabled
features. For example, a pasted `<h1>` should not create a heading when
`headingPlugin()` is absent.

## Imperative API

`Editor` should support a typed ref for common integrations:

```ts
type EditorHandle<TValue = unknown> = {
  blur: () => void;
  focus: () => void;
  getValue: () => TValue;
  insertContent: (content: TValue) => void;
  runCommand: <TPayload>(command: string, payload?: TPayload) => void | Promise<void>;
  setValue: (value: TValue) => void;
};
```

The handle should use the active adapter for value operations and the registry for
commands.

## Website Experience

The website `/editor` page should become a full-feature editor experience rather
than a minimal demo. It should enable the full first-iteration plugin set:

- main toolbar
- floating toolbar
- block toolbar
- keyboard shortcuts
- paste handling
- text format
- heading
- list
- quote
- link
- code with language switching, highlighting, wrap option, and injected
  formatters
- table
- Markdown shortcuts

The page should include small external controls to demonstrate imperative API
methods for focus, set value, insert content, and command execution. The page
should feel like a product editor, not an API documentation page.

## Storybook Experience

Storybook should become the plugin playground. It should include fixed stories
and a configurable playground:

- `Minimal`
- `MarkdownWriting`
- `RichWriting`
- `CodeFocused`
- `Table`
- `Controlled`
- `ReadOnly`
- `Disabled`
- `Interaction`
- `PluginPlayground`

The playground should expose controls for toggling entrypoint and feature
plugins:

- toolbar
- Markdown shortcuts
- keyboard shortcuts
- floating toolbar
- block toolbar
- heading levels
- list
- quote
- link
- code highlight
- code language menu
- code wrap
- code format
- table

Storybook should demonstrate plugin insertion and removal. The website should
demonstrate the default full-feature product experience.

## Testing Requirements

Use TDD for behavior changes. Required coverage:

- Composer tests for node, command, action, shortcut, and setup aggregation.
- Composer validation tests for duplicate plugin names, duplicate feature ids,
  missing dependencies, duplicate action ids, and invalid action command
  references.
- Feature plugin tests for text format, heading levels, list, quote, link, code,
  history, and table contributions.
- Toolbar tests proving toolbar actions come from feature contributions, not
  hardcoded feature logic.
- Markdown shortcut tests proving shortcuts are filtered by enabled features and
  feature parameters.
- Keyboard shortcut tests for enabled shortcut groups.
- Paste tests proving disabled features do not receive pasted content.
- Code tests for language switching, highlight setup, wrap option, and formatter
  command behavior.
- Link tests for insert, edit, and unlink behavior.
- Imperative API tests for focus, set value, get value, insert content, and
  command execution.
- Storybook `Interaction` coverage for the full editor path.
- Website unit or integration tests for the full-feature editor page.

At wrap-up, run:

```bash
vp check
vp test
vp run storybook#test
vp run build -r
```

If Storybook e2e requires a running server, start the server and report the exact
URL used.

## Migration Notes

Existing usage should continue:

```tsx
<Editor adapter={markdownEditorAdapter()} plugins={[richTextPlugin(), markdownShortcutPlugin()]} />
```

New preferred usage should be feature-composed:

```tsx
<Editor
  adapter={markdownEditorAdapter()}
  plugins={[
    toolbarPlugin(),
    floatingToolbarPlugin(),
    keyboardShortcutPlugin(),
    pastePlugin(),
    historyPlugin(),
    textFormatPlugin(),
    headingPlugin({ levels: [1, 2, 3] }),
    listPlugin(),
    quotePlugin(),
    linkPlugin(),
    codePlugin({
      format: {
        formatters: {
          json: async (code) => JSON.stringify(JSON.parse(code), null, 2),
        },
      },
      highlight: true,
      languageMenu: true,
      wrap: true,
    }),
    tablePlugin(),
    markdownShortcutPlugin(),
  ]}
/>
```

The implementation may provide a `fullWritingPlugins()` or
`websiteEditorPlugins()` helper if it keeps website and Storybook examples
readable, but the public feature plugin APIs should remain the long-term source
of truth.

## Risks

- The registry can become over-abstract if it tries to solve every future block
  feature now. Keep custom decorator nodes out of this iteration.
- Toolbar, keyboard, paste, and Markdown shortcuts can create circular
  dependencies if they call feature internals directly. Route them through
  commands.
- Tables can expand quickly. Keep the first table scope to basic insert,
  row/column operations, table-owned contextual tools, and hover insertion
  handles. Do not add resize, merged cells, or cell styling in this iteration
  because those are not reliably Markdown table-compatible.
- Formatting code blocks can pull large dependencies into the editor package.
  Require injected formatters.
- Backward compatibility for `richTextPlugin()` must be tested because existing
  website and Storybook stories use it.

## Acceptance Criteria

- Feature plugins define their own nodes, commands, actions, shortcuts, and setup
  contributions.
- Entrypoint plugins consume the registry and do not hardcode heading, list,
  quote, code, link, text format, or table behavior.
- `richTextPlugin()` remains usable as a compatibility preset.
- `markdownShortcutPlugin()` supports parameters and respects enabled feature
  parameters.
- `codePlugin()` remains one public plugin with parameterized language,
  highlighting, wrapping, and injected formatting capabilities.
- Website `/editor` demonstrates the full-feature editor.
- Storybook demonstrates plugin insertion and removal, including a playground.
- Existing tests pass, new behavior has focused tests, and full repository
  verification passes.
