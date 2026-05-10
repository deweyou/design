# Virtual List Design

## Goal

Add a virtualized one-dimensional content primitive to `@deweyou-design/react` that can render large document-like lists efficiently, align its scrollbar styling with `ScrollArea`, and expose imperative scrolling APIs for anchor-style navigation.

## Scope

This design covers the first shippable unit: `VirtualList`. It intentionally does not implement masonry yet. The implementation should leave the sizing and range calculation isolated so a later `VirtualMasonry` can reuse the same concepts with a two-dimensional layout strategy.

## Architecture

`VirtualList` lives as a governed React source unit at `packages/react/src/virtual-list/`. It renders a `ScrollArea.Root`, a `ScrollArea.Viewport`, a vertical `ScrollArea.Scrollbar`, and a spacer element whose height equals the estimated total content size. Visible rows are positioned absolutely inside the spacer using `transform: translateY(...)`.

The component keeps virtualization math local and explicit:

- `buildSizeMap(count, estimateSize)` computes per-index starts, sizes, and total size.
- `findStartIndex(...)` locates the first visible item from the current scroll offset.
- `overscan` expands the rendered range before and after the visible window.
- `VirtualItem` exposes `index`, `key`, `start`, `end`, `size`, and `style` to the row renderer.

This is a linear layout model. A future masonry component should not overload `VirtualList`; it should add a separate public component backed by a layout strategy that returns `{ x, y, width, height }` style rectangles.

## Public API

```tsx
<VirtualList
  count={items.length}
  height={420}
  estimateSize={() => 72}
  renderItem={({ index, virtualItem }) => (
    <ArticleRow style={virtualItem.style} item={items[index]} />
  )}
/>
```

Types:

- `VirtualListProps`
- `VirtualListRef`
- `VirtualListRenderDetails`
- `VirtualListScrollAlign`
- `VirtualItem`

Imperative API:

- `scrollToIndex(index, { align })`
- `scrollToOffset(offset)`
- `getScrollOffset()`

`scrollToIndex` supports `start`, `center`, `end`, and `auto` alignment. The default is `start`, which is the anchor-navigation behavior expected for long article sections.

## ScrollArea Integration

`VirtualList` must reuse the existing `ScrollArea` compound parts instead of copying scrollbar styles. To support this composition, `ScrollArea.Viewport` needs to forward refs and pass through DOM props such as `onScroll` and `data-testid`.

## Testing

Colocated unit tests should verify:

- only visible rows plus overscan render
- scrolling updates the rendered range
- ScrollArea scrollbar parts are present
- ref APIs scroll to a target index and offset

Contract tests should verify:

- root entry exports `VirtualList`
- package subpath `./virtual-list` exists
- docs mention `@deweyou-design/react/virtual-list`

Storybook should include a `VirtualList` story with an `Interaction` export that exercises anchor navigation.

## Non-Goals

- Dynamic measurement via `ResizeObserver`
- Masonry or grid layout
- Horizontal virtualization
- Full document-flow rendering mode

These are follow-up capabilities. The first version should keep the public API compatible with those additions without adding unused props now.
