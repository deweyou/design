# Editor Package Design

## Status

Draft for review.

## Goal

Add `@deweyou-design/editor` as the design system's editor capability package. The
first use case is a lightweight LLM/comment input that feels like rich text while
preserving Markdown-oriented authoring shortcuts. The package should also leave a
clean path toward document-editor features such as blocks, columns, slash
commands, and embedded previews.

The package exposes an `Editor` component, editor core contracts, official
plugins, value adapters, and utilities. It should reuse Deweyou visual language,
components, and tokens instead of shipping an unrelated editor theme.

## Non-Goals

- Do not add editor runtime dependencies to `@deweyou-design/react`.
- Do not make Markdown, JSON, HTML, or MDX the universal public content format.
- Do not expose Lexical types as the public Deweyou editor contract.
- Do not implement Notion-style document editing, block drag-and-drop, columns,
  whiteboard previews, or collaboration in the first version.
- Do not make `MarkdownRender` responsible for editing behavior.
- Do not implement a bespoke `contenteditable` engine.

## Package Shape

Create a new published package:

```text
packages/editor/
├── src/editor/               # Editor React component
├── src/core/                 # Dewey editor contracts
├── src/plugins/              # official plugin factories
├── src/adapters/             # official value adapters
├── src/utils/                # public editor helpers
└── src/index.ts              # common root exports
```

The package name is `@deweyou-design/editor`. It may depend on
`@deweyou-design/react`, `@deweyou-design/styles`, and internal editor runtime
packages. `@deweyou-design/react` remains the base component package and must not
depend on `@deweyou-design/editor`.

Suggested public subpaths:

```tsx
import { Editor } from '@deweyou-design/editor';
import { Editor } from '@deweyou-design/editor/editor';
import { createEditorPlugin } from '@deweyou-design/editor/core';
import { richTextPlugin } from '@deweyou-design/editor/plugins/rich-text';
import { markdownShortcutPlugin } from '@deweyou-design/editor/plugins/markdown-shortcut';
import { markdownEditorAdapter } from '@deweyou-design/editor/adapters/markdown';
```

The root entry should export the first-version common surface:

- `Editor`
- `createEditorPlugin`
- `composeEditorPlugins`
- `richTextPlugin`
- `markdownShortcutPlugin`
- `markdownEditorAdapter`

## Public API Direction

The component should not expose a `format` prop. Content protocol belongs to the
consumer-provided or official adapter.

First-version usage:

```tsx
<Editor
  adapter={markdownEditorAdapter()}
  plugins={[richTextPlugin(), markdownShortcutPlugin()]}
  placeholder="Write a comment..."
  onChange={({ value }) => setValue(value)}
/>
```

Core contracts should be Dewey-owned:

```ts
export type EditorProps<TValue = unknown> = {
  value?: TValue;
  defaultValue?: TValue;
  adapter: EditorAdapter<TValue>;
  plugins?: EditorPlugin[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  onChange?: (details: EditorChangeDetails<TValue>) => void;
};

export type EditorAdapter<TValue = unknown> = {
  name: string;
  createInitialState: (details: EditorAdapterInitialStateDetails<TValue>) => unknown;
  readValue: (details: EditorAdapterReadDetails) => TValue;
  applyValue?: (details: EditorAdapterApplyValueDetails<TValue>) => void;
};

export type EditorPlugin = {
  name: string;
  setup: (context: EditorPluginContext) => React.ReactNode;
};
```

The `unknown` values in adapter internals intentionally avoid naming Lexical in
the public contract. Implementation can narrow those types inside private runtime
modules.

## Runtime Choice

Use Lexical as the first internal runtime.

Reasons:

- Lexical is an editor framework, not a prebuilt UI kit, so Deweyou keeps control
  of visual styling and interaction surfaces.
- Official React integration composes editor features through plugins.
- Official Markdown support includes import, export, and typing shortcuts through
  configurable transformers.
- The runtime is not based on ProseMirror, Slate, or Draft.js, reducing the chance
  that a separate ecosystem's public model leaks into Deweyou APIs.

Candidate assessment:

| Candidate | Fit                              | Notes                                                                                                                      |
| --------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Lexical   | Best first runtime               | Strong plugin/runtime split, official Markdown helpers, no bundled UI theme.                                               |
| Tiptap    | Strong backup                    | Mature ProseMirror ecosystem, but its Markdown support is marked beta and can pull ProseMirror concepts into the boundary. |
| Plate     | Too heavy for v1                 | Powerful Markdown and rich-text system, better for a document editor than a lightweight input.                             |
| MDXEditor | Too product-shaped               | Accepts/emits Markdown and uses Lexical internally, but would constrain Deweyou's own component and plugin API.            |
| Milkdown  | Markdown-native but less aligned | Good Markdown editor framework, but React/design-system integration would require more wrapper work.                       |
| BlockNote | Too block-editor-oriented        | Better for Notion-style documents than for a lightweight comment input; Markdown conversion can be lossy.                  |
| Slate     | Too low-level                    | Requires Deweyou to build more shortcuts, serialization, and editing behavior from scratch.                                |

## First-Version Scope

Support a compact editor suitable for LLM prompts, comments, and short rich text
messages:

- paragraphs
- headings `h1` through `h3`
- bold, italic, strikethrough
- inline links
- unordered and ordered lists
- blockquotes
- inline code
- fenced code blocks
- history
- paste normalization for common plain text and Markdown-like input
- controlled and uncontrolled values
- `placeholder`, `disabled`, and `readOnly`

The first version should not support tables, images, files, mentions, slash
commands, columns, whiteboard blocks, Mermaid blocks, or collaboration.

## Official Plugins And Adapters

### `richTextPlugin()`

Registers the base nodes and commands for first-version rich-text editing:

- paragraph
- heading
- list
- quote
- link
- inline marks
- inline code
- code block
- history
- paste normalization

### `markdownShortcutPlugin()`

Registers Markdown-style input rules:

- `# `, `## `, `### ` for headings
- `- ` and `* ` for unordered lists
- `1. ` for ordered lists
- `> ` for blockquotes
- fenced code block shortcuts
- `**text**`, `_text_`, `~~text~~`, and inline code shortcuts where supported

This plugin is an authoring behavior. It does not make Markdown the required
public value format.

### `markdownEditorAdapter()`

Converts between consumer Markdown strings and the internal editor state. It is
an official adapter, not the editor component's format policy.

Consumers can write their own adapters for custom document schemas:

```tsx
<Editor
  adapter={customDocumentAdapter()}
  plugins={[blockPlugin(), columnsPlugin(), whiteboardPreviewPlugin()]}
/>
```

## Styling Contract

The editor should visually align with `MarkdownRender` without reusing
`MarkdownRender` as an editing implementation.

Stable attributes:

```html
<div data-editor-root>
  <div data-editor-content data-editor-size="md"></div>
</div>
```

Editor nodes should expose stable markers where practical:

```html
<p data-editor-node="p"></p>
<h1 data-editor-node="h1"></h1>
<blockquote data-editor-node="blockquote"></blockquote>
<pre data-editor-node="pre"></pre>
```

The editor should reuse Deweyou tokens, Less Modules, and existing components for
chrome. Scrollable code blocks and long editor content should use the same
neutral scrollbar contract as `MarkdownRender`, `MermaidRender`, `ScrollArea`,
and `VirtualList`.

## Storybook

Add `apps/storybook/src/stories/Editor.stories.tsx` with required
`Interaction` coverage.

Stories:

- `Default` - lightweight comment editor with rich text plugin.
- `MarkdownShortcuts` - demonstrates heading, list, quote, bold, inline code,
  and fenced code shortcuts.
- `Controlled` - shows controlled value updates and emitted adapter value.
- `ReadOnly` - renders existing content without editing affordances.
- `Disabled` - prevents editing and communicates disabled state.

The `Interaction` story should cover:

- typing plain text
- using at least one block Markdown shortcut
- using at least one inline Markdown shortcut
- receiving an `onChange` value
- read-only or disabled behavior

## Website

Add a website page at `/editor` that lets users try the first-version editor in
the browser. Include it in the existing public exploration/navigation flow rather
than creating a marketing landing page.

The page should:

- import from `@deweyou-design/editor`
- show the editable `Editor` as the primary surface
- show the current adapter value in a compact preview or output panel
- include examples for Markdown shortcuts
- avoid a marketing landing page; the editor itself should be the first screen

Update website navigation, component/catalog data, and public AI context files
when those files are already maintained for public components.

## Documentation

Update:

- root `README.md`
- `README_ZH.md`
- `docs/design/components.md`
- `packages/editor/README.md`
- website public component or AI context metadata when applicable

Document that `@deweyou-design/editor` owns editor capabilities, while
`@deweyou-design/react` remains the base component package.

## Testing

Add focused tests by responsibility:

- colocated `packages/editor/src/editor/index.test.tsx` for rendering,
  placeholder, disabled/read-only state, controlled/uncontrolled change behavior,
  and basic typing.
- colocated tests for official plugins and adapters, including Markdown shortcut
  transforms and Markdown adapter round trips.
- package contract tests for exports, published manifest behavior, dependency
  boundaries, and `@deweyou-design/react` not depending on
  `@deweyou-design/editor`.
- style contract tests for shared editor/Markdown prose styling and scrollbar
  alignment.
- Storybook interaction coverage for the editor stories.
- website tests for navigation and the editor demo page.

Expected verification at wrap-up:

```bash
vp check
vp test
vp run storybook#test
vp run build -r
```

Run narrower targeted commands during implementation, then the full set before
delivery.

## Future Extension Path

Future plugins can build a document-editor layer on the same package without
changing the first-version component name:

- `blockPlugin()`
- `slashCommandPlugin()`
- `columnsPlugin()`
- `whiteboardPreviewPlugin()`
- `mermaidPreviewPlugin()`
- `codeBlockPlugin()`
- `collaborationPlugin()`

Advanced blocks should use custom document adapters or consumer-owned schemas.
Markdown remains suitable for lightweight text but cannot naturally represent all
future document structures.

## Compatibility Decisions

- The package root exports only the first-version common surface. Advanced APIs
  use explicit subpaths so the root entry does not become a catch-all.
- `markdownEditorAdapter()` supports only the first-version Markdown-compatible
  node set. If a consumer combines it with a plugin that registers incompatible
  nodes, the editor should surface a recoverable compatibility error instead of
  silently dropping content.
- The website editor page lives at `/editor` and is linked from the existing
  exploration/component experience. It should show the real editor first, not a
  landing page.
