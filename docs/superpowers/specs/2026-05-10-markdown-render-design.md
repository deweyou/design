# Markdown Render Design

## Status

Approved for implementation planning.

## Goal

Add a `MarkdownRender` component to `@deweyou-design/react` for rendering trusted or untrusted Markdown strings in product UI. The first use cases are blog article rendering and LLM conversation message rendering, with a shared rendering core and size-based typography density.

The component should render CommonMark and common GFM content safely, align visually with Deweyou Design tokens and primitives, and expose reusable node rendering infrastructure for later MDX, extension blocks, and Markdown editor preview work.

## Non-Goals

- Do not execute MDX, JSX, scripts, or arbitrary HTML in this component.
- Do not implement a rich text editor, selection model, editing commands, or Markdown shortcuts.
- Do not ship built-in math, Mermaid, or Excalidraw rendering in the first version.
- Do not make `Text` responsible for list, table, blockquote, or code-block semantics.
- Do not use `Button variant="link"` as the default inline Markdown link renderer.

## Package Shape

The component lives in `packages/react/src/markdown-render/`:

- `index.tsx` exports the public component and public prop types.
- `index.module.less` contains token-driven default Markdown styles.
- `index.test.tsx` contains colocated rendering and contract tests.

The package root and subpath exports expose:

```tsx
import { MarkdownRender } from '@deweyou-design/react';
import { MarkdownRender } from '@deweyou-design/react/markdown-render';
```

## Public API

```tsx
export type MarkdownRenderSize = 'sm' | 'md' | 'lg';

export type MarkdownRenderProps = {
  value: string;
  size?: MarkdownRenderSize;
  components?: MarkdownRenderComponents;
  className?: string;
  style?: CSSProperties;
};
```

Usage:

```tsx
<MarkdownRender value={content} />

<MarkdownRender
  value={content}
  size="sm"
  components={{
    a: CustomLink,
    pre: CustomCodeBlock,
    code: CustomCode,
  }}
  className="chatMarkdown"
/>
```

`size` changes typography density and block spacing only. It must not change which Markdown syntax is supported or the semantic structure of the output.

## Markdown Coverage

The first version supports CommonMark plus GFM through `react-markdown` and `remark-gfm`:

- headings `h1` through `h6`
- paragraphs and soft line breaks
- emphasis, strong emphasis, and strikethrough
- inline links and images
- blockquotes
- unordered lists, ordered lists, nested lists, and list items
- GFM task lists
- inline code and fenced code blocks
- tables
- horizontal rules

Raw HTML is not rendered by default. The component keeps the Markdown path text-to-React only, without a code execution step.

## Default Node Rendering

`MarkdownRender` has a thin public shell and a reusable default node layer. The default node layer should be implemented as independent local components or helpers, not as one large inline object inside `MarkdownRender`.

Initial default nodes:

- `MarkdownParagraph`
- `MarkdownHeading`
- `MarkdownLink`
- `MarkdownImage`
- `MarkdownBlockquote`
- `MarkdownList`
- `MarkdownListItem`
- `MarkdownTable`
- `MarkdownInlineCode`
- `MarkdownCodeBlock`
- `MarkdownTaskMarker`

These nodes may remain internal in the first version. If later product surfaces need them outside Markdown rendering, they can graduate into public primitives without changing the `MarkdownRender` API.

### Existing Primitive Reuse

- Paragraphs and headings should reuse `Text` where its semantics fit.
- Horizontal rules should reuse `Separator`.
- Links should not use `Button variant="link"` by default. `Button` is an action primitive with button sizing, wrappers, and no-wrap behavior; Markdown links are inline typography that must inherit text flow and wrap naturally.
- GFM task checkboxes should not use the current interactive `Checkbox` by default. Markdown task markers are read-only content state, while `Checkbox` is an Ark UI form control with hidden input and interactive semantics. The task marker should visually align with Checkbox tokens and can be replaced by consumers through `components` when interactivity is desired.

## Styling Contract

Default styles must be token-driven and aligned with `@deweyou-design/styles`. The component should not introduce an isolated prose theme.

The root element exposes stable attributes:

```html
<div data-markdown-root data-markdown-size="md"></div>
```

Each default node exposes a stable node marker:

```html
<p data-markdown-node="p">...</p>
<a data-markdown-node="a">...</a>
<pre data-markdown-node="pre" data-language="ts">...</pre>
<table data-markdown-node="table">
  ...
</table>
```

Consumers can lightly override styles with `className`, `style`, and data selectors:

```css
.chatMarkdown [data-markdown-node='pre'] {
  max-height: 320px;
}
```

Avoid a broad `classes={{ ... }}` API in the first version. Node replacement belongs in `components`; visual adjustment belongs in CSS.

## Component Overrides

`components` forwards to the underlying Markdown renderer after being merged with Deweyou default nodes. Overrides should receive normal node props plus stable data attributes whenever practical.

Default code-block rendering must preserve language information from fenced code blocks:

````md
```mermaid
graph TD
  A --> B
```
````

The first version renders this as a code block, but the default code block should expose `data-language="mermaid"` and make the raw code accessible to a custom override. This prepares later math, Mermaid, and Excalidraw renderers without adding them to the initial core.

## Extension Path

Future MDX should be a separate rendering boundary, not a boolean prop on `MarkdownRender`.

Preferred future shape:

```tsx
<MarkdownRender value={markdown} />
<MdxRender content={compiledMdx} components={markdownComponents} />
```

MDX can reuse the default Markdown node components, size scale, and CSS contract, but compilation and executable content must remain separate from runtime Markdown string rendering.

Future extension blocks can be implemented through custom node overrides or a later explicit extension API:

- math: `remark-math` plus a controlled math renderer
- Mermaid: fenced code block with `language === 'mermaid'`
- Excalidraw: fenced code block or resource reference rendered by a custom block component

## Editor Preview Reuse

This work should help a later Markdown-capable rich text editor by providing:

- the preview renderer for Markdown strings
- default Markdown node components
- size-based typography density
- token-driven Markdown styling
- task marker visuals
- code fence language extraction
- stable data attributes for editor preview and visual tests
- Markdown fixture coverage that can be reused for editor preview parity

The editor still owns its own document model, cursor behavior, selection, commands, toolbar, history, paste handling, collaboration, and Markdown serialization.

## Testing

Add focused tests for:

- root and subpath export contracts
- CommonMark and GFM node rendering
- `size` data attribute and stable node data attributes
- `components` overrides for link and code block nodes
- raw HTML not being executed or rendered as live HTML
- external link safety defaults
- task list rendering as read-only markers
- code fence language extraction

Update public component docs so the existing component docs contract continues to pass.
