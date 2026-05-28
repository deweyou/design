# VirtualList Dynamic Content Design

## Goal

Extend `@deweyou-design/react` `VirtualList` so document-like feeds with uneven MDX article heights can use virtualization without losing page scrolling, hash navigation, visible-range syncing, or list semantics.

## Scope

This is an enhancement of the existing `VirtualList` source unit. It does not add masonry, horizontal virtualization, or a separate `WindowVirtualList` export.

## API

`VirtualList` keeps its current props and adds:

- `scrollElement?: 'window' | HTMLElement | (() => HTMLElement | null)` to choose the scroll owner. The default remains the internal ScrollArea viewport.
- `scrollMargin?: number` to subtract a sticky-header offset from viewport calculations and imperative scrolling.
- `onRangeChange?: (range: VirtualListRange) => void` for visible and overscanned index updates.
- `itemClassName?: string | ((details: VirtualListRenderDetails) => string | undefined)` for wrapper styling.
- `itemStyle?: CSSProperties | ((details: VirtualListRenderDetails) => CSSProperties | undefined)` for wrapper style extension.
- `itemRole?: string | null` to customize or disable the default `listitem` wrapper role.

`VirtualListRef.scrollToIndex` accepts `{ align?: VirtualListScrollAlign; offset?: number }`. The offset is added to `scrollMargin` and is intended for hash navigation under sticky page chrome.

`renderItem` receives `{ index, virtualItem, measureRef }`. `measureRef` is attached to the positioned wrapper by default, but exposing it lets consumers place the measured node on a semantic article element when they disable or customize the wrapper.

## Behavior

Each item starts with `estimateSize(index)`. When rendered, a callback ref reads the node height and updates a measured-size map. If `ResizeObserver` is available, it observes the measured node so image load, font load, content expansion, and responsive reflow update the map. If it is not available, the first layout read still corrects the estimate.

Range calculation uses the latest measured sizes. For internal scrolling, the component reads `scrollTop` from the ScrollArea viewport. For `scrollElement="window"`, it computes list-relative offset from `window.scrollY`, the list root's document position, and `scrollMargin`. For custom elements, it computes the list-relative offset from the element's scrollTop and bounding boxes.

`scrollToIndex` computes the requested offset from the latest size map and writes to the chosen scroll owner. Dynamic measurement may refine the item position after render; callers can call it again after content settles, and range correction keeps future calls based on measured sizes.

## Accessibility

The default remains `role="list"` on the viewport and `role="listitem"` with `aria-posinset` and `aria-setsize` on wrappers. Consumers can pass a custom `role`, a custom `itemRole`, or `itemRole={null}` when article semantics should be owned by rendered content.

## Testing

Colocated unit tests cover measured-height correction, `ResizeObserver` callbacks, window scroll mode, `scrollToIndex` offsets, range callbacks, `measureRef`, and item wrapper customization. Storybook keeps the existing anchor navigation story and adds a dynamic document-feed example.
