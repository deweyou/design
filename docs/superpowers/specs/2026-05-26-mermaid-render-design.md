# Mermaid Render Design

## Goal

Add a read-only Mermaid rendering path for Markdown content. The renderer should prefer `beautiful-mermaid` for the diagram types it supports, render Mermaid mindmaps through a Deweyou-owned SVG mindmap renderer, and fall back to native Mermaid rendering for other diagram types.

## Scope

The first version adds public `MermaidRender` and `MindmapRender` components to `@deweyou-design/react`. `MarkdownRender` remains a safe CommonMark plus GFM renderer and does not render diagrams by default; consumers opt in by replacing fenced code blocks through `components.pre` or by using a Storybook example block.

Out of scope:

- Editing diagram nodes or edges directly in the rendered graphic.
- Full custom rendering for every Mermaid diagram type.
- Canvas rendering.
- Complete Mermaid mindmap syntax compatibility beyond the common indentation tree shape.

## Architecture

`MermaidRender` is the public diagram entry point:

```text
MermaidRender
  -> mindmap: MindmapRender
  -> beautiful-mermaid-supported type: BeautifulMermaidRender
  -> unsupported type: NativeMermaidRender
```

`MindmapRender` parses Mermaid mindmap source into a tree, computes a deterministic left-to-right SVG layout, and renders nodes and connector paths with Deweyou tokens. The visual language should align with `beautiful-mermaid`: transparent background, restrained node fills, thin borders, muted connector lines, branch accent colors, and token-driven typography.

`BeautifulMermaidRender` uses `beautiful-mermaid` for flowchart, state, sequence, class, ER, and XY charts. `NativeMermaidRender` dynamically imports `mermaid`, initializes it with `startOnLoad: false`, and renders remaining diagram types as SVG.

## Public API

```tsx
export type MermaidRenderProps = {
  value: string;
  className?: string;
  style?: CSSProperties;
};

export type MindmapRenderProps = {
  value: string;
  className?: string;
  style?: CSSProperties;
};
```

The API is intentionally small. Theme customization starts with CSS custom properties rather than a large prop surface.

## Mindmap Syntax

The first mindmap renderer supports:

- `mindmap` heading line
- `root((text))`
- indentation-based hierarchy
- plain text nodes
- bracket and parenthesis shape markers as text normalization input
- `<br/>` line breaks
- `::icon(...)` metadata ignored for rendering

Unrecognized mindmap node decoration should degrade to readable text.

## Storybook Coverage

Storybook should include a `MermaidRender` story that shows:

- flowchart
- sequence
- state
- class
- ER
- XY chart
- mindmap
- native Mermaid fallback examples such as gantt, pie, timeline, gitGraph, journey, quadrant, requirement, sankey, block, packet, kanban, architecture, radar, and treemap

The story should make renderer routing visible through stable `data-mermaid-renderer` attributes so tests can confirm coverage without depending on SVG internals.

## Testing

Unit tests should cover:

- Mermaid type detection and routing
- mindmap parsing from indentation
- mindmap SVG rendering with root, branch, leaf, and connector attributes
- `beautiful-mermaid` error fallback to native Mermaid
- native renderer loading/error states
- public package exports and subpath exports

Storybook interaction tests should confirm every syntax sample renders a diagram container.
