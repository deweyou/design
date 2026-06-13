# Image Preview And Masonry Design

## Goal

Add four public React components to `@deweyou-design/react`:

- `ImagePreview` for modal image viewing with zoom controls and optional image-group navigation.
- `ImageMasonry` for non-virtualized image masonry layouts with fixed or responsive columns.
- `VirtualMasonry` for large uneven image collections where only the visible masonry items should be mounted.
- `GroupedVirtualMasonry` for long grouped image sections that need headers and masonry cells inside one virtual scroll model.

The components should follow Deweyou Design visual rules, keep public APIs decoupled from implementation details, and ship with unit tests, Storybook interaction coverage, package contracts, documentation, website catalog entries, MCP catalog metadata, and regenerated LLM context.

## Context

The repository already has a one-dimensional `VirtualList` component. Its historical design states that masonry should not overload `VirtualList`; a future masonry component should use a two-dimensional layout strategy that returns rectangles shaped like `{ x, y, width, height }`. This design follows that direction by adding `VirtualMasonry` as an independent component instead of turning `VirtualList` into a grid engine. Grouped virtualization is also kept separate as `GroupedVirtualMasonry`: ordinary grouped galleries can compose multiple `ImageMasonry` instances, while grouped virtual scroll needs one internal layout model for headers, item rectangles, range reporting, and scroll targets.

`ImagePreview` is an overlay interaction and should delegate modal focus, Escape behavior, and ARIA dialog semantics to the existing Ark UI-backed dialog pattern. `ImageMasonry`, `VirtualMasonry`, and `GroupedVirtualMasonry` are layout/data components, so custom layout math is acceptable because Ark UI has no matching masonry or virtual-masonry primitive.

## Public Components

### ImagePreview

`ImagePreview` is a controlled or uncontrolled modal viewer. It supports a single image and an optional image group. The group mode exists so masonry cards can open the same preview surface without each consumer reimplementing previous and next navigation.

```tsx
const images = [
  { src: '/photos/desk.jpg', alt: 'Desk setup', width: 1200, height: 800 },
  { src: '/photos/books.jpg', alt: 'Bookshelf', width: 900, height: 1200 },
];

<ImagePreview
  items={images}
  currentIndex={currentIndex}
  open={previewOpen}
  onCurrentIndexChange={setCurrentIndex}
  onOpenChange={setPreviewOpen}
/>;
```

Public types:

- `ImagePreview`
- `ImagePreviewItem`
- `ImagePreviewProps`
- `ImagePreviewOpenChangeDetails`
- `ImagePreviewIndexChangeDetails`

Props:

- `items: ImagePreviewItem[]` for one or more images.
- `open?: boolean`, `defaultOpen?: boolean`, and `onOpenChange?: (details) => void`.
- `currentIndex?: number`, `defaultCurrentIndex?: number`, and `onCurrentIndexChange?: (details) => void`.
- `minZoom?: number`, `maxZoom?: number`, `zoomStep?: number`, and `defaultZoom?: number`.
- `closeOnBackdropClick?: boolean`, defaulting to `true`.
- `aria-label?: string` for the dialog when no visible title is provided.
- `renderCaption?: (item, index) => ReactNode` for restrained caption content.

Behavior:

- Open state can be controlled or uncontrolled.
- Current index can be controlled or uncontrolled.
- Zoom starts at `defaultZoom` and clamps between `minZoom` and `maxZoom`.
- Zoom in, zoom out, and reset controls update only the viewer transform.
- Changing the image resets zoom to `defaultZoom`.
- Escape closes through dialog behavior.
- ArrowLeft and ArrowRight move between images when there is more than one item.
- Previous and next controls are disabled at collection boundaries.
- Missing or empty `items` renders an empty viewer state instead of throwing.

Visual and accessibility contract:

- The surface uses a dialog scrim and `--ui-*` tokens, not hardcoded colors.
- Toolbar actions are `IconButton` controls with accessible names.
- The image keeps its `alt`; decorative fallback states are not exposed as extra content.
- The preview panel respects safe areas and `100dvh`.
- Motion uses transform and opacity, and reduced motion removes nonessential animation.

### ImageMasonry

`ImageMasonry` renders normal masonry content with stable image geometry. It supports fixed column counts and responsive column counts based on container width.

```tsx
<ImageMasonry
  items={images}
  columns={3}
  gap={16}
  onItemClick={({ item, index }) => openPreview(index)}
/>;

<ImageMasonry
  items={images}
  minColumnWidth={180}
  maxColumnCount={5}
  gap={16}
  renderItem={({ item, index, imageProps }) => (
    <button type="button" onClick={() => openPreview(index)}>
      <img {...imageProps} />
    </button>
  )}
/>;
```

Public types:

- `ImageMasonry`
- `ImageMasonryItem`
- `ImageMasonryProps`
- `ImageMasonryRenderDetails`
- `ImageMasonryClickDetails`

Props:

- `items: ImageMasonryItem[]`.
- `columns?: number` for fixed columns.
- `minColumnWidth?: number`, `maxColumnCount?: number`, and `defaultColumnCount?: number` for responsive columns.
- `gap?: number | string`, defaulting to `var(--ui-spacing-md)` at the style layer.
- `getItemKey?: (item, index) => string | number`.
- `renderItem?: (details) => ReactNode`.
- `onItemClick?: (details) => void`.
- `role?: string`, defaulting to `list`.
- `itemRole?: string | null`, defaulting to `listitem` when `role` is `list`.
- `aria-label?: string`, defaulting to `Image masonry`.

Layout:

- Fixed mode uses `columns`.
- Responsive mode observes the container width with `ResizeObserver`, then computes `columnCount = clamp(floor((width + gap) / (minColumnWidth + gap)), 1, maxColumnCount)`.
- When `ResizeObserver` is unavailable, `defaultColumnCount` provides deterministic SSR and jsdom behavior.
- Each item uses width and height metadata or `aspectRatio` to reserve vertical space.
- Items are assigned to the current shortest column. This keeps layout stable and efficient without using CSS columns, which would make item ordering and future virtualization harder to control.
- The component returns DOM order by source index, while visual placement is absolute. ARIA `aria-posinset` and `aria-setsize` preserve collection semantics.

Default rendering:

- If `renderItem` is omitted, the component renders an image card with `<img loading="lazy" decoding="async">`.
- Default cards are border-led, token-driven, and avoid shadows.
- Consumers can supply their own card body through `renderItem` when captions, selection state, or custom actions are needed.

### VirtualMasonry

`VirtualMasonry` is a two-dimensional virtualized masonry component for long uneven image lists. It shares the masonry layout model with `ImageMasonry` but mounts only visible and overscanned items.

```tsx
const masonryRef = useRef<VirtualMasonryRef>(null);

<VirtualMasonry
  ref={masonryRef}
  items={images}
  height={520}
  minColumnWidth={180}
  maxColumnCount={5}
  overscan={320}
  onRangeChange={(range) => syncVisibleRange(range)}
  renderItem={({ item, index, imageProps }) => <img {...imageProps} alt={item.alt} />}
/>;
```

Public types:

- `VirtualMasonry`
- `VirtualMasonryProps`
- `VirtualMasonryRef`
- `VirtualMasonryItem`
- `VirtualMasonryVirtualItem`
- `VirtualMasonryRange`
- `VirtualMasonryRenderDetails`
- `VirtualMasonryScrollElement`
- `VirtualMasonryScrollToIndexOptions`

Props:

- `items: VirtualMasonryItem[]`.
- `height: number | string`.
- `columns?: number`, `minColumnWidth?: number`, `maxColumnCount?: number`, and `defaultColumnCount?: number`.
- `gap?: number | string`.
- `overscan?: number`, measured in pixels and defaulting to `320`.
- `scrollElement?: 'window' | HTMLElement | (() => HTMLElement | null)`.
- `scrollMargin?: number`.
- `onRangeChange?: (range: VirtualMasonryRange) => void`.
- `getItemKey?: (item, index) => string | number`.
- `renderItem?: (details) => ReactNode`.
- `role?: string`, `itemRole?: string | null`, `aria-label?: string`, and `aria-labelledby?: string`.

Imperative ref:

- `scrollToIndex(index, { align?: 'start' | 'center' | 'end' | 'auto', offset?: number })`.
- `scrollToOffset(offset)`.
- `getScrollOffset()`.

Virtualization behavior:

- Layout computes all item rectangles from the current column count, container width, gap, and image ratios.
- The total scroll height is the tallest column.
- Visible items are those whose vertical rectangle intersects `scrollOffset - overscan` through `scrollOffset + viewportHeight + overscan`.
- `onRangeChange` reports source-index boundaries for visible and overscanned items.
- Internal scrolling composes `ScrollArea.Root`, `ScrollArea.Viewport`, `ScrollArea.Scrollbar`, and `ScrollArea.Thumb`.
- Window and custom element scrolling follow the same offset model as `VirtualList`.
- `scrollToIndex` aligns the target rectangle rather than assuming linear row starts.

### GroupedVirtualMasonry

`GroupedVirtualMasonry` virtualizes long image feeds that have section headers. It is intentionally separate from `ImageMasonry` and `VirtualMasonry`: consumers can render several `ImageMasonry` components for small grouped galleries, but virtualized grouping needs one scroll-height calculation that includes headers and masonry cells together.

```tsx
const groupedMasonryRef = useRef<GroupedVirtualMasonryRef>(null);

<GroupedVirtualMasonry
  ref={groupedMasonryRef}
  groups={[
    { id: 'today', title: 'Today', images: todayImages },
    { id: 'archive', title: 'Archive', images: archiveImages },
  ]}
  groupHeaderHeight={44}
  height={520}
  minColumnWidth={180}
  overscan={320}
  onRangeChange={(range) => syncVisibleGroupRange(range)}
/>;
```

Public types:

- `GroupedVirtualMasonry`
- `GroupedVirtualMasonryProps`
- `GroupedVirtualMasonryGroup`
- `GroupedVirtualMasonryRef`
- `GroupedVirtualMasonryRange`
- `GroupedVirtualMasonryRangePosition`
- `GroupedVirtualMasonryRenderDetails`
- `GroupedVirtualMasonryHeaderDetails`
- `GroupedVirtualMasonryClickDetails`
- `GroupedVirtualMasonryVirtualItem`

Props:

- `groups: GroupedVirtualMasonryGroup[]`, where each group has `images`, optional `id`, and optional `title`.
- `groupHeaderHeight: number`, required so the virtual scroll height stays deterministic.
- `height: number | string`.
- `columnCount?: number`, `minColumnWidth?: number`, `maxColumnCount?: number`, `defaultColumnCount?: number`, and `defaultContainerWidth?: number`.
- `gap?: number` and `groupGap?: number`.
- `overscan?: number`, measured in pixels.
- `getGroupKey?: (group, groupIndex) => string | number`.
- `getImageKey?: (image, imageIndex, group, groupIndex) => string | number`.
- `renderGroupHeader?: (details) => ReactNode`.
- `renderItem?: (details) => ReactNode`.
- `onRangeChange?: (range: GroupedVirtualMasonryRange) => void`.

Imperative ref:

- `scrollToGroup(groupIndex, { align?: 'start' | 'center' | 'end' | 'auto', offset?: number })`.
- `scrollToItem(groupIndex, imageIndex, { align?: 'start' | 'center' | 'end' | 'auto', offset?: number })`.
- `scrollToOffset(offset)`.
- `getScrollOffset()`.

Virtualization behavior:

- Each group contributes one fixed-height header rectangle and a masonry layout for its images.
- The total scroll height is the sum of every group header, group masonry height, and inter-group gap.
- Visible entries can be headers or items; `onRangeChange` reports range positions as `{ type: 'header', groupIndex }` or `{ type: 'item', groupIndex, imageIndex }`.
- Item ARIA positions are global across all images; group headers default to `role="presentation"`.
- Image geometry remains mandatory: pass `aspectRatio` or positive `width` and `height`; the component does not load images just to discover natural size.

## Shared Layout Strategy

`ImageMasonry`, `VirtualMasonry`, and `GroupedVirtualMasonry` should share local pure functions under one package source unit boundary or duplicated small internal helpers only when that keeps files easier to understand. The layout strategy must remain private in the first version.

Core helpers:

- `resolveColumnCount(options)` returns a safe column count.
- `getImageAspectRatio(item)` returns a positive ratio from `aspectRatio` or `width / height`.
- `buildMasonryLayout(items, options)` returns `items`, `columnHeights`, and `totalHeight`.
- `findVisibleMasonryItems(layout, viewport)` filters by vertical intersection.

The helpers should be unit tested through component behavior first. Direct helper exports are not part of the public API.

## Data Model

`ImagePreviewItem`, `ImageMasonryItem`, `VirtualMasonryItem`, and grouped masonry image entries intentionally share a small image shape:

```ts
type ImageItem = {
  alt: string;
  aspectRatio?: number;
  height?: number;
  id?: string | number;
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
};
```

The concrete exported types may duplicate this shape per component so future component-specific fields can evolve without creating a shared public dependency too early. Masonry and virtual masonry consumers must provide `aspectRatio` or positive `width` and `height` for stable first paint and exact virtual scroll height.

## Error And Empty States

- Empty image preview renders a dialog-safe empty state with a close button.
- Empty masonry renders an empty root with the correct role and label, not an exception.
- Invalid image ratios fall back to `1`.
- Missing image ratios are a consumer contract error for masonry inputs; components do not probe or remeasure image natural dimensions.
- Column counts clamp to at least `1`.
- Out-of-range current indices and scroll targets clamp to the valid item range.

## Styling

All component styles live in CSS Modules with Less:

- `packages/react/src/image-preview/index.module.less`
- `packages/react/src/image-masonry/index.module.less`
- `packages/react/src/virtual-masonry/index.module.less`
- `packages/react/src/grouped-virtual-masonry/index.module.less`

Style rules:

- Use only `--ui-*` tokens and `@deweyou-design/styles/less/bridge` mixins.
- Use borders before shadows; preview is the only floating surface that can use dialog-level shadow.
- Use `@ui-breakpoint-compact` or capability queries instead of private pixel breakpoints.
- Use `env(safe-area-inset-*)` for preview panel spacing.
- Use `color-mix()` for hover and disabled feedback.
- Do not introduce new color roles, radius levels, gradients, or decorative imagery.

## Accessibility

- `ImagePreview` is modal dialog content with focus management delegated to the dialog primitive.
- Preview toolbar buttons have stable accessible labels.
- Images use item `alt` text.
- Masonry roots default to `role="list"` and item wrappers default to `role="listitem"`, `aria-posinset`, and `aria-setsize`.
- Consumers can disable wrapper item semantics with `itemRole={null}` when rendered content owns semantics.
- Clickable default masonry items are buttons when `onItemClick` is provided, not clickable divs.
- Keyboard users can activate clickable masonry items with normal button semantics.

## Storybook

Add:

- `apps/storybook/src/stories/ImagePreview.stories.tsx`
- `apps/storybook/src/stories/ImageMasonry.stories.tsx`
- `apps/storybook/src/stories/VirtualMasonry.stories.tsx`
- `apps/storybook/src/stories/GroupedVirtualMasonry.stories.tsx`

Each story file must export `Interaction` with a `play` function.

Interaction coverage:

- `ImagePreview`: open from a trigger, zoom in, zoom out, reset, next, previous, Escape close.
- `ImageMasonry`: fixed columns render, responsive mode renders, clicking an item reports the selected image.
- `VirtualMasonry`: only a visible subset renders, scroll or button navigation reveals a far item, and the ScrollArea scrollbar parts are present.
- `GroupedVirtualMasonry`: group navigation reveals a far grouped item while keeping headers and cells in one virtualized scroll surface.

## Tests

Colocated tests:

- `packages/react/src/image-preview/index.test.tsx`
- `packages/react/src/image-masonry/index.test.tsx`
- `packages/react/src/virtual-masonry/index.test.tsx`
- `packages/react/src/grouped-virtual-masonry/index.test.tsx`

Contract tests:

- Update package root export and subpath tests.
- Update docs contract through `docs/design/components.md`.
- Update website catalog tests.
- Update MCP catalog tests and LLM sync tests.
- Existing style governance tests should continue to reject hardcoded colors and private breakpoints.

TDD expectations:

- Add failing tests for open and zoom behavior before implementing `ImagePreview`.
- Add failing tests for fixed and responsive shortest-column layout before implementing `ImageMasonry`.
- Add failing tests for visibility filtering and `scrollToIndex` before implementing `VirtualMasonry`.
- Add failing tests for group headers, grouped range positions, responsive columns, and `scrollToGroup`/`scrollToItem` before implementing `GroupedVirtualMasonry`.

## Documentation And AI Context

Update:

- `packages/react/src/index.ts`
- `packages/react/package.json`
- `packages/react/README.md`
- root `README.md`
- root `README_ZH.md`
- `docs/design/components.md`
- `apps/website/src/data/component-catalog.tsx`
- `packages/mcp/src/catalog/index.ts`
- `apps/website/public/llms.txt`

No repo-owned skill update is required unless implementation discovers a new reusable component workflow rule. Dependency skill changes are deferred to issue, PR, tracker, or subagent follow-up and are not edited in-place here.

## Non-Goals

- Pan gestures and drag-to-move in the preview.
- Rotation controls.
- Download controls.
- Image upload or editing.
- Publicly exporting the private masonry layout helpers.
- Replacing `VirtualList` or changing its public behavior.

These can be added later without changing the first-version component boundaries.

## Acceptance Criteria

- `ImagePreview`, `ImageMasonry`, `VirtualMasonry`, and `GroupedVirtualMasonry` are public root and subpath exports.
- Image preview supports open, close, zoom in, zoom out, reset, keyboard close, and optional group navigation.
- Image masonry supports fixed columns and responsive columns based on container width.
- Virtual masonry mounts only the visible masonry items plus overscan for large uneven lists.
- Grouped virtual masonry mounts visible group headers and image cells, reports grouped ranges, and scrolls to both groups and group items.
- Unit tests, contract tests, Storybook `Interaction` stories, website catalog entries, MCP catalog entries, README updates, component docs, and regenerated LLM context are present.
- Component styles follow Deweyou Design tokens and pass style governance tests.
- Verification includes focused component tests, Storybook e2e, `vp check`, and `vp test` before completion is claimed.
