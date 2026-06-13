# Image Preview And Masonry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `ImagePreview`, `ImageMasonry`, `VirtualMasonry`, and `GroupedVirtualMasonry` as public `@deweyou-design/react` components with tests, Storybook interaction coverage, docs, website catalog entries, MCP metadata, and regenerated LLM context.

**Architecture:** `ImagePreview` is an Ark Dialog-backed modal viewer with local zoom and image-index state. `ImageMasonry` owns non-virtual masonry layout and responsive column calculation. `VirtualMasonry` reuses the same private masonry layout helpers, composes `ScrollArea`, and renders only vertically intersecting masonry rectangles plus overscan. `GroupedVirtualMasonry` keeps group headers and masonry cells inside one virtual scroll model so long grouped image sections can report grouped ranges and support group/item scrolling.

**Tech Stack:** TypeScript 5, React 19, CSS Modules with Less, `@ark-ui/react`, `@deweyou-design/react-icons`, `@deweyou-design/styles`, Vite Plus, Testing Library, Storybook test runner.

---

## File Structure

- Create `packages/react/src/image-preview/index.tsx` - public `ImagePreview` component and types.
- Create `packages/react/src/image-preview/index.module.less` - modal viewer styling.
- Create `packages/react/src/image-preview/index.test.tsx` - jsdom behavior tests.
- Create `packages/react/src/image-masonry/index.tsx` - public `ImageMasonry` component and types.
- Create `packages/react/src/image-masonry/layout.ts` - private shared masonry layout helpers.
- Create `packages/react/src/image-masonry/index.module.less` - normal masonry styling.
- Create `packages/react/src/image-masonry/index.test.tsx` - jsdom layout and interaction tests.
- Create `packages/react/src/virtual-masonry/index.tsx` - public `VirtualMasonry` component and types.
- Create `packages/react/src/virtual-masonry/index.module.less` - virtual masonry viewport styling.
- Create `packages/react/src/virtual-masonry/index.test.tsx` - jsdom virtualization tests.
- Create `packages/react/src/grouped-virtual-masonry/index.tsx` - public grouped virtual masonry component and types.
- Create `packages/react/src/grouped-virtual-masonry/index.module.less` - grouped virtual masonry viewport styling.
- Create `packages/react/src/grouped-virtual-masonry/index.test.tsx` - jsdom grouped virtualization tests.
- Modify `packages/react/src/index.ts` - root exports.
- Modify `packages/react/package.json` - subpath exports.
- Modify `packages/react/tests/package-entrypoint.test.ts` - root API contract.
- Modify `packages/react/tests/subpath-entrypoint.test.ts` - subpath API contract.
- Modify `packages/react/README.md`, `README.md`, `README_ZH.md`, and `docs/design/components.md` - public docs.
- Create `apps/storybook/src/stories/ImagePreview.stories.tsx`, `ImageMasonry.stories.tsx`, `VirtualMasonry.stories.tsx`, and `GroupedVirtualMasonry.stories.tsx`.
- Modify `apps/website/src/data/component-catalog.tsx` and `component-catalog.test.tsx` - website catalog.
- Modify `packages/mcp/src/catalog/index.ts`, `packages/mcp/src/catalog/index.test.ts`, `packages/mcp/src/server/index.test.ts`, and `packages/mcp/src/llms/index.test.ts` when needed.
- Regenerate `apps/website/public/llms.txt` after MCP catalog changes.

## Task 0: GroupedVirtualMasonry Extension

**Files:**

- Create: `packages/react/src/grouped-virtual-masonry/index.tsx`
- Create: `packages/react/src/grouped-virtual-masonry/index.module.less`
- Create: `packages/react/src/grouped-virtual-masonry/index.test.tsx`
- Create: `apps/storybook/src/stories/GroupedVirtualMasonry.stories.tsx`
- Modify: `packages/react/src/index.ts`, `packages/react/package.json`, package entrypoint tests, website catalog, MCP catalog, README files, `docs/design/components.md`, and `apps/website/public/llms.txt`

- [x] **Step 1: Write failing GroupedVirtualMasonry tests**

  Cover visible group headers and items, grouped range positions, `scrollToGroup`, `scrollToItem`, `scrollToOffset`, `getScrollOffset`, and responsive column recalculation.

- [x] **Step 2: Run the failing tests**

  Run:

  ```bash
  vp test packages/react/src/grouped-virtual-masonry/index.test.tsx
  ```

  Expected red state: fail because `packages/react/src/grouped-virtual-masonry/index.tsx` does not exist.

- [x] **Step 3: Implement GroupedVirtualMasonry**

  Reuse `buildMasonryLayout` and `resolveMasonryColumnCount`, add fixed-height header entries per group, offset each group layout into one global scroll-height model, render only visible/overscanned entries, and expose `scrollToGroup`, `scrollToItem`, `scrollToOffset`, and `getScrollOffset`.

- [x] **Step 4: Update public contracts and docs**

  Add root/subpath exports, package export metadata, entrypoint contract tests, Storybook `Interaction`, website catalog, MCP catalog, README entries, component contract docs, spec updates, and regenerated `llms.txt`.

- [ ] **Step 5: Verify grouped masonry and public contract**

  Run:

  ```bash
  vp test packages/react/src/grouped-virtual-masonry/index.test.tsx packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/package-entrypoint.test.ts apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.test.ts packages/mcp/src/llms/index.test.ts
  vp check
  vp test
  vp run storybook#test
  ```

## Task 1: ImageMasonry Layout Helpers And Component

**Files:**

- Create: `packages/react/src/image-masonry/layout.ts`
- Create: `packages/react/src/image-masonry/index.tsx`
- Create: `packages/react/src/image-masonry/index.module.less`
- Create: `packages/react/src/image-masonry/index.test.tsx`

- [ ] **Step 1: Write failing ImageMasonry tests**

Create `packages/react/src/image-masonry/index.test.tsx` with jsdom setup:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { ImageMasonry } from './index.tsx';

const images = [
  { id: 'a', src: '/a.jpg', alt: 'Image A', width: 200, height: 100 },
  { id: 'b', src: '/b.jpg', alt: 'Image B', width: 100, height: 200 },
  { id: 'c', src: '/c.jpg', alt: 'Image C', aspectRatio: 1 },
  { id: 'd', src: '/d.jpg', alt: 'Image D', width: 300, height: 100 },
];

beforeEach(() => {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
});

afterEach(() => cleanup());

describe('ImageMasonry', () => {
  it('renders fixed-column masonry items with list semantics', () => {
    render(<ImageMasonry columns={2} items={images} />);

    expect(screen.getByRole('list', { name: 'Image masonry' })).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByAltText('Image A').getAttribute('loading')).toBe('lazy');
    expect(screen.getByText('Image A').closest('[data-index="0"]')).toHaveAttribute(
      'aria-posinset',
      '1',
    );
  });

  it('uses the shortest-column layout and reserves image geometry', () => {
    render(<ImageMasonry columns={2} gap={10} items={images} />);

    expect(screen.getByText('Image A').closest('[data-index="0"]')).toHaveStyle({
      transform: 'translate(0px, 0px)',
    });
    expect(screen.getByText('Image B').closest('[data-index="1"]')).toHaveStyle({
      transform: 'translate(50%, 0px)',
    });
    expect(screen.getByText('Image C').closest('[data-index="2"]')).toHaveAttribute(
      'data-column',
      '0',
    );
  });

  it('falls back to defaultColumnCount for responsive columns before measurement', () => {
    render(<ImageMasonry defaultColumnCount={3} items={images} minColumnWidth={180} />);

    expect(screen.getByRole('list', { name: 'Image masonry' })).toHaveAttribute(
      'data-columns',
      '3',
    );
  });

  it('calls onItemClick from the default button card', () => {
    const onItemClick = vi.fn();

    render(<ImageMasonry columns={2} items={images} onItemClick={onItemClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Image C' }));

    expect(onItemClick).toHaveBeenCalledWith({ item: images[2], index: 2 });
  });
});
```

- [ ] **Step 2: Run the failing ImageMasonry tests**

Run:

```bash
vp test packages/react/src/image-masonry/index.test.tsx
```

Expected: fail because `packages/react/src/image-masonry/index.tsx` does not exist.

- [ ] **Step 3: Implement private masonry layout helpers**

Create `packages/react/src/image-masonry/layout.ts`:

```ts
export type MasonryLayoutInput = {
  aspectRatio?: number;
  height?: number;
  width?: number;
};

export type MasonryLayoutItem<TItem> = {
  column: number;
  height: number;
  index: number;
  item: TItem;
  leftPercent: number;
  top: number;
  widthPercent: number;
};

export type MasonryLayout<TItem> = {
  columnCount: number;
  columnHeights: number[];
  items: MasonryLayoutItem<TItem>[];
  totalHeight: number;
};

export const clampColumnCount = (value: number) => {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
};

export const getImageAspectRatio = (item: MasonryLayoutInput) => {
  if (item.aspectRatio && Number.isFinite(item.aspectRatio) && item.aspectRatio > 0) {
    return item.aspectRatio;
  }

  if (item.width && item.height && item.width > 0 && item.height > 0) {
    return item.width / item.height;
  }

  return 1;
};

export const buildMasonryLayout = <TItem extends MasonryLayoutInput>({
  columnCount,
  gap,
  items,
}: {
  columnCount: number;
  gap: number;
  items: TItem[];
}): MasonryLayout<TItem> => {
  const safeColumnCount = clampColumnCount(columnCount);
  const columnHeights = Array.from({ length: safeColumnCount }, () => 0);
  const widthPercent = 100 / safeColumnCount;
  const layoutItems = items.map((item, index) => {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    const top = columnHeights[column] ?? 0;
    const aspectRatio = getImageAspectRatio(item);
    const height = widthPercent / aspectRatio;
    const leftPercent = column * widthPercent;

    columnHeights[column] = top + height + gap;

    return { column, height, index, item, leftPercent, top, widthPercent };
  });
  const totalHeight = Math.max(0, ...columnHeights.map((height) => Math.max(0, height - gap)));

  return { columnCount: safeColumnCount, columnHeights, items: layoutItems, totalHeight };
};

export const findVisibleMasonryItems = <TItem>({
  layout,
  overscan,
  scrollOffset,
  viewportHeight,
}: {
  layout: MasonryLayout<TItem>;
  overscan: number;
  scrollOffset: number;
  viewportHeight: number;
}) => {
  const start = scrollOffset - overscan;
  const end = scrollOffset + viewportHeight + overscan;

  return layout.items.filter((item) => item.top + item.height >= start && item.top <= end);
};
```

- [ ] **Step 4: Implement ImageMasonry component and styles**

Create `packages/react/src/image-masonry/index.tsx`:

```tsx
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import classNames from 'classnames';

import { buildMasonryLayout } from './layout.ts';
import styles from './index.module.less';

export type ImageMasonryItem = {
  alt: string;
  aspectRatio?: number;
  height?: number;
  id?: string | number;
  sizes?: string;
  src: string;
  srcSet?: string;
  width?: number;
};

export type ImageMasonryClickDetails = { index: number; item: ImageMasonryItem };

export type ImageMasonryRenderDetails = ImageMasonryClickDetails & {
  imageProps: {
    alt: string;
    decoding: 'async';
    loading: 'lazy';
    sizes?: string;
    src: string;
    srcSet?: string;
  };
};

export type ImageMasonryProps = {
  'aria-label'?: string;
  className?: string;
  columns?: number;
  defaultColumnCount?: number;
  gap?: number;
  getItemKey?: (item: ImageMasonryItem, index: number) => string | number;
  itemRole?: string | null;
  items: ImageMasonryItem[];
  maxColumnCount?: number;
  minColumnWidth?: number;
  onItemClick?: (details: ImageMasonryClickDetails) => void;
  renderItem?: (details: ImageMasonryRenderDetails) => ReactNode;
  role?: string;
  style?: CSSProperties;
};

const getColumnCount = ({
  columns,
  defaultColumnCount,
  maxColumnCount,
}: Pick<ImageMasonryProps, 'columns' | 'defaultColumnCount' | 'maxColumnCount'>) => {
  const base = columns ?? defaultColumnCount ?? 1;
  return Math.max(1, Math.min(maxColumnCount ?? base, Math.floor(base)));
};

export const ImageMasonry = ({
  'aria-label': ariaLabel = 'Image masonry',
  className,
  columns,
  defaultColumnCount = 1,
  gap = 16,
  getItemKey = (item, index) => item.id ?? index,
  itemRole,
  items,
  maxColumnCount,
  onItemClick,
  renderItem,
  role = 'list',
  style,
}: ImageMasonryProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [measuredColumnCount] = useState(defaultColumnCount);
  const columnCount = getColumnCount({
    columns: columns ?? measuredColumnCount,
    defaultColumnCount,
    maxColumnCount,
  });
  const layout = useMemo(
    () => buildMasonryLayout({ columnCount, gap, items }),
    [columnCount, gap, items],
  );
  const resolvedItemRole =
    itemRole === undefined ? (role === 'list' ? 'listitem' : undefined) : itemRole;

  return (
    <div
      ref={rootRef}
      aria-label={ariaLabel}
      className={classNames(styles.root, className)}
      data-columns={columnCount}
      role={role}
      style={{ ...style, ['--image-masonry-height' as string]: `${layout.totalHeight}%` }}
    >
      <div className={styles.spacer}>
        {layout.items.map((layoutItem) => {
          const details = { index: layoutItem.index, item: layoutItem.item };
          const imageProps = {
            alt: layoutItem.item.alt,
            decoding: 'async' as const,
            loading: 'lazy' as const,
            sizes: layoutItem.item.sizes,
            src: layoutItem.item.src,
            srcSet: layoutItem.item.srcSet,
          };
          const content = renderItem?.({ ...details, imageProps }) ?? (
            <img className={styles.image} {...imageProps} />
          );

          return (
            <div
              key={getItemKey(layoutItem.item, layoutItem.index)}
              aria-posinset={resolvedItemRole === 'listitem' ? layoutItem.index + 1 : undefined}
              aria-setsize={resolvedItemRole === 'listitem' ? items.length : undefined}
              className={styles.item}
              data-column={layoutItem.column}
              data-index={layoutItem.index}
              role={resolvedItemRole ?? undefined}
              style={{
                height: `${layoutItem.height}%`,
                transform: `translate(${layoutItem.leftPercent}%, ${layoutItem.top}px)`,
                width: `${layoutItem.widthPercent}%`,
              }}
            >
              {onItemClick ? (
                <button
                  aria-label={layoutItem.item.alt}
                  className={styles.itemButton}
                  type="button"
                  onClick={() => onItemClick(details)}
                >
                  {content}
                </button>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

Create `packages/react/src/image-masonry/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

.root {
  color: var(--ui-color-text);
  position: relative;
  width: 100%;
}

.spacer {
  min-block-size: var(--image-masonry-height, 0);
  position: relative;
  width: 100%;
}

.item {
  box-sizing: border-box;
  left: 0;
  padding: calc(var(--image-masonry-gap, 16px) / 2);
  position: absolute;
  top: 0;
}

.image,
.itemButton {
  border-radius: var(--ui-radius-float);
  display: block;
  inline-size: 100%;
}

.image {
  background: color-mix(in srgb, var(--ui-color-text) 4%, transparent);
  border: 1px solid var(--ui-color-border);
  block-size: 100%;
  object-fit: cover;
}

.itemButton {
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  color: inherit;
  cursor: pointer;
  padding: 0;

  &:focus-visible {
    .focus-ring();
  }

  &:hover {
    border-color: var(--ui-color-border-strong);
  }
}
```

- [ ] **Step 5: Run ImageMasonry tests until they pass**

Run:

```bash
vp test packages/react/src/image-masonry/index.test.tsx
```

Expected: pass after the component, layout helper, and style module exist.

- [ ] **Step 6: Commit ImageMasonry**

```bash
git add packages/react/src/image-masonry
git commit -m "feat(react): add image masonry layout"
```

## Task 2: VirtualMasonry Component

**Files:**

- Create: `packages/react/src/virtual-masonry/index.tsx`
- Create: `packages/react/src/virtual-masonry/index.module.less`
- Create: `packages/react/src/virtual-masonry/index.test.tsx`
- Modify: `packages/react/src/image-masonry/layout.ts`

- [ ] **Step 1: Write failing VirtualMasonry tests**

Create `packages/react/src/virtual-masonry/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { VirtualMasonry, type VirtualMasonryRef } from './index.tsx';

const images = Array.from({ length: 80 }, (_, index) => ({
  id: `image-${index}`,
  src: `/image-${index}.jpg`,
  alt: `Image ${index}`,
  width: index % 3 === 0 ? 160 : 120,
  height: index % 3 === 0 ? 240 : 120,
}));

beforeEach(() => {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
});

afterEach(() => cleanup());

describe('VirtualMasonry', () => {
  it('renders only visible masonry items plus overscan', () => {
    render(
      <VirtualMasonry
        columns={2}
        height={240}
        items={images}
        overscan={0}
        renderItem={({ item, imageProps }) => <img {...imageProps} alt={item.alt} />}
      />,
    );

    expect(screen.getByAltText('Image 0')).toBeDefined();
    expect(screen.queryByAltText('Image 70')).toBeNull();
    expect(document.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it('updates visible items when the internal viewport scrolls', () => {
    render(<VirtualMasonry columns={2} height={240} items={images} overscan={0} />);

    const viewport = screen.getByTestId('virtual-masonry-viewport');
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 700 });
    fireEvent.scroll(viewport);

    expect(screen.queryByAltText('Image 0')).toBeNull();
    expect(screen.getByAltText('Image 20')).toBeDefined();
  });

  it('reports range changes for visible and overscanned indexes', () => {
    const onRangeChange = vi.fn();

    render(
      <VirtualMasonry
        columns={2}
        height={240}
        items={images}
        onRangeChange={onRangeChange}
        overscan={0}
      />,
    );

    expect(onRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ overscanStartIndex: 0, startIndex: 0 }),
    );
  });

  it('scrolls to a source index through the ref api', () => {
    const ref = createRef<VirtualMasonryRef>();

    render(<VirtualMasonry ref={ref} columns={2} height={240} items={images} overscan={0} />);

    ref.current?.scrollToIndex(40);

    expect(screen.getByTestId('virtual-masonry-viewport').scrollTop).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the failing VirtualMasonry tests**

Run:

```bash
vp test packages/react/src/virtual-masonry/index.test.tsx
```

Expected: fail because `packages/react/src/virtual-masonry/index.tsx` does not exist.

- [ ] **Step 3: Add layout helper support for pixel item heights**

Modify `packages/react/src/image-masonry/layout.ts` so `buildMasonryLayout` accepts `columnWidth` and computes pixel heights:

```ts
export const buildMasonryLayout = <TItem extends MasonryLayoutInput>({
  columnCount,
  columnWidth = 100,
  gap,
  items,
}: {
  columnCount: number;
  columnWidth?: number;
  gap: number;
  items: TItem[];
}): MasonryLayout<TItem> => {
  const safeColumnCount = clampColumnCount(columnCount);
  const columnHeights = Array.from({ length: safeColumnCount }, () => 0);
  const widthPercent = 100 / safeColumnCount;
  const layoutItems = items.map((item, index) => {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    const top = columnHeights[column] ?? 0;
    const aspectRatio = getImageAspectRatio(item);
    const height = columnWidth / aspectRatio;
    const leftPercent = column * widthPercent;

    columnHeights[column] = top + height + gap;

    return { column, height, index, item, leftPercent, top, widthPercent };
  });
  const totalHeight = Math.max(0, ...columnHeights.map((height) => Math.max(0, height - gap)));

  return { columnCount: safeColumnCount, columnHeights, items: layoutItems, totalHeight };
};
```

- [ ] **Step 4: Implement VirtualMasonry**

Create `packages/react/src/virtual-masonry/index.tsx` with the same internal scroll pattern as `VirtualList`, using `buildMasonryLayout` and `findVisibleMasonryItems`:

```tsx
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
} from 'react';
import classNames from 'classnames';

import { ScrollArea } from '../scroll-area/index.tsx';
import { buildMasonryLayout, findVisibleMasonryItems } from '../image-masonry/layout.ts';
import styles from './index.module.less';

export type VirtualMasonryItem = {
  alt: string;
  aspectRatio?: number;
  height?: number;
  id?: string | number;
  sizes?: string;
  src: string;
  srcSet?: string;
  width?: number;
};

export type VirtualMasonryRange = {
  endIndex: number;
  overscanEndIndex: number;
  overscanStartIndex: number;
  startIndex: number;
};

export type VirtualMasonryRef = {
  getScrollOffset: () => number;
  scrollToIndex: (
    index: number,
    options?: { align?: 'start' | 'center' | 'end' | 'auto'; offset?: number },
  ) => void;
  scrollToOffset: (offset: number) => void;
};

export type VirtualMasonryRenderDetails = {
  imageProps: {
    alt: string;
    decoding: 'async';
    loading: 'lazy';
    sizes?: string;
    src: string;
    srcSet?: string;
  };
  index: number;
  item: VirtualMasonryItem;
};

export type VirtualMasonryProps = {
  'aria-label'?: string;
  className?: string;
  columns?: number;
  defaultColumnCount?: number;
  gap?: number;
  height: number | string;
  items: VirtualMasonryItem[];
  maxColumnCount?: number;
  overscan?: number;
  renderItem?: (details: VirtualMasonryRenderDetails) => ReactNode;
  onRangeChange?: (range: VirtualMasonryRange) => void;
  style?: CSSProperties;
};

export const VirtualMasonry = forwardRef<VirtualMasonryRef, VirtualMasonryProps>(
  (
    {
      'aria-label': ariaLabel = 'Virtual masonry',
      className,
      columns,
      defaultColumnCount = 1,
      gap = 16,
      height,
      items,
      onRangeChange,
      overscan = 320,
      renderItem,
      style,
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const columnCount = Math.max(1, Math.floor(columns ?? defaultColumnCount));
    const viewportHeight =
      typeof height === 'number' ? height : (viewportRef.current?.clientHeight ?? 0);
    const layout = useMemo(
      () => buildMasonryLayout({ columnCount, columnWidth: 240, gap, items }),
      [columnCount, gap, items],
    );
    const virtualItems = findVisibleMasonryItems({
      layout,
      overscan,
      scrollOffset,
      viewportHeight,
    });

    const scrollToOffset = useCallback(
      (offset: number) => {
        const viewport = viewportRef.current;
        const nextOffset = Math.max(
          0,
          Math.min(offset, Math.max(0, layout.totalHeight - viewportHeight)),
        );

        if (viewport) viewport.scrollTop = nextOffset;
        setScrollOffset(nextOffset);
      },
      [layout.totalHeight, viewportHeight],
    );

    const scrollToIndex = useCallback(
      (index: number, options?: { offset?: number }) => {
        const target = layout.items[Math.max(0, Math.min(index, layout.items.length - 1))];
        scrollToOffset((target?.top ?? 0) - (options?.offset ?? 0));
      },
      [layout.items, scrollToOffset],
    );

    useImperativeHandle(
      ref,
      () => ({
        getScrollOffset: () => viewportRef.current?.scrollTop ?? scrollOffset,
        scrollToIndex,
        scrollToOffset,
      }),
      [scrollOffset, scrollToIndex, scrollToOffset],
    );

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      setScrollOffset(event.currentTarget.scrollTop);
    };

    return (
      <ScrollArea.Root className={classNames(styles.root, className)} style={{ ...style, height }}>
        <ScrollArea.Viewport
          ref={viewportRef}
          aria-label={ariaLabel}
          className={styles.viewport}
          data-testid="virtual-masonry-viewport"
          role="list"
          onScroll={handleScroll}
        >
          <div className={styles.spacer} style={{ height: layout.totalHeight }}>
            {virtualItems.map((virtualItem) => {
              const imageProps = {
                alt: virtualItem.item.alt,
                decoding: 'async' as const,
                loading: 'lazy' as const,
                sizes: virtualItem.item.sizes,
                src: virtualItem.item.src,
                srcSet: virtualItem.item.srcSet,
              };

              return (
                <div
                  key={virtualItem.item.id ?? virtualItem.index}
                  aria-posinset={virtualItem.index + 1}
                  aria-setsize={items.length}
                  className={styles.item}
                  data-index={virtualItem.index}
                  role="listitem"
                  style={{
                    height: virtualItem.height,
                    transform: `translate(${virtualItem.leftPercent}%, ${virtualItem.top}px)`,
                    width: `${virtualItem.widthPercent}%`,
                  }}
                >
                  {renderItem?.({
                    imageProps,
                    index: virtualItem.index,
                    item: virtualItem.item,
                  }) ?? <img className={styles.image} {...imageProps} />}
                </div>
              );
            })}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    );
  },
);

VirtualMasonry.displayName = 'VirtualMasonry';
```

Create `packages/react/src/virtual-masonry/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

.root {
  position: relative;
  width: 100%;
}

.viewport {
  height: 100%;
}

.spacer {
  position: relative;
  width: 100%;
}

.item {
  box-sizing: border-box;
  left: 0;
  padding: 8px;
  position: absolute;
  top: 0;
}

.image {
  background: color-mix(in srgb, var(--ui-color-text) 4%, transparent);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}
```

- [ ] **Step 5: Run VirtualMasonry tests until they pass**

Run:

```bash
vp test packages/react/src/virtual-masonry/index.test.tsx packages/react/src/image-masonry/index.test.tsx
```

Expected: both test files pass.

- [ ] **Step 6: Commit VirtualMasonry**

```bash
git add packages/react/src/image-masonry packages/react/src/virtual-masonry
git commit -m "feat(react): add virtual masonry"
```

## Task 3: ImagePreview Component

**Files:**

- Create: `packages/react/src/image-preview/index.tsx`
- Create: `packages/react/src/image-preview/index.module.less`
- Create: `packages/react/src/image-preview/index.test.tsx`

- [ ] **Step 1: Write failing ImagePreview tests**

Create `packages/react/src/image-preview/index.test.tsx`:

```tsx
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { ImagePreview } from './index.tsx';

const images = [
  { src: '/first.jpg', alt: 'First image', width: 1200, height: 800 },
  { src: '/second.jpg', alt: 'Second image', width: 900, height: 1200 },
];

afterEach(() => cleanup());

describe('ImagePreview', () => {
  it('opens a dialog and renders the current image', async () => {
    render(<ImagePreview defaultOpen items={images} />);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeDefined());
    expect(screen.getByAltText('First image')).toBeDefined();
  });

  it('zooms in, zooms out, and resets the image transform', async () => {
    render(<ImagePreview defaultOpen items={images} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByAltText('First image')).toHaveStyle({ transform: 'scale(1.25)' });

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(screen.getByAltText('First image')).toHaveStyle({ transform: 'scale(1)' });

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(screen.getByAltText('First image')).toHaveStyle({ transform: 'scale(1)' });
  });

  it('navigates between grouped images and resets zoom', async () => {
    render(<ImagePreview defaultOpen items={images} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));

    expect(screen.getByAltText('Second image')).toHaveStyle({ transform: 'scale(1)' });

    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(screen.getByAltText('First image')).toBeDefined();
  });

  it('calls controlled change callbacks', () => {
    const onCurrentIndexChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ImagePreview
        currentIndex={0}
        items={images}
        open
        onCurrentIndexChange={onCurrentIndexChange}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));

    expect(onCurrentIndexChange).toHaveBeenCalledWith({
      index: 1,
      item: images[1],
      previousIndex: 0,
    });
    expect(onOpenChange).toHaveBeenCalledWith({ open: false });
  });
});
```

- [ ] **Step 2: Run the failing ImagePreview tests**

Run:

```bash
vp test packages/react/src/image-preview/index.test.tsx
```

Expected: fail because `packages/react/src/image-preview/index.tsx` does not exist.

- [ ] **Step 3: Implement ImagePreview**

Create `packages/react/src/image-preview/index.tsx` using `Dialog`, `IconButton`, and icons:

```tsx
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  XIcon,
} from '@deweyou-design/react-icons';

import { IconButton } from '../button/index.tsx';
import { Dialog } from '../dialog/index.tsx';
import styles from './index.module.less';

export type ImagePreviewItem = {
  alt: string;
  height?: number;
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
};

export type ImagePreviewOpenChangeDetails = { open: boolean };
export type ImagePreviewIndexChangeDetails = {
  index: number;
  item: ImagePreviewItem;
  previousIndex: number;
};

export type ImagePreviewProps = {
  'aria-label'?: string;
  currentIndex?: number;
  defaultCurrentIndex?: number;
  defaultOpen?: boolean;
  defaultZoom?: number;
  items: ImagePreviewItem[];
  maxZoom?: number;
  minZoom?: number;
  onCurrentIndexChange?: (details: ImagePreviewIndexChangeDetails) => void;
  onOpenChange?: (details: ImagePreviewOpenChangeDetails) => void;
  open?: boolean;
  renderCaption?: (item: ImagePreviewItem, index: number) => ReactNode;
  zoomStep?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const ImagePreview = ({
  'aria-label': ariaLabel = 'Image preview',
  currentIndex,
  defaultCurrentIndex = 0,
  defaultOpen,
  defaultZoom = 1,
  items,
  maxZoom = 4,
  minZoom = 0.25,
  onCurrentIndexChange,
  onOpenChange,
  open,
  renderCaption,
  zoomStep = 0.25,
}: ImagePreviewProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultCurrentIndex);
  const [zoom, setZoom] = useState(defaultZoom);
  const isOpen = open ?? uncontrolledOpen;
  const activeIndex = clamp(currentIndex ?? uncontrolledIndex, 0, Math.max(0, items.length - 1));
  const activeItem = items[activeIndex];

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.({ open: nextOpen });
    },
    [onOpenChange, open],
  );

  const setIndex = useCallback(
    (nextIndex: number) => {
      if (items.length === 0) return;
      const safeIndex = clamp(nextIndex, 0, items.length - 1);
      const previousIndex = activeIndex;

      if (currentIndex === undefined) setUncontrolledIndex(safeIndex);
      setZoom(defaultZoom);
      onCurrentIndexChange?.({ index: safeIndex, item: items[safeIndex], previousIndex });
    },
    [activeIndex, currentIndex, defaultZoom, items, onCurrentIndexChange],
  );

  useEffect(() => {
    if (!isOpen || items.length <= 1) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex(activeIndex + 1);
      if (event.key === 'ArrowLeft') setIndex(activeIndex - 1);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isOpen, items.length, setIndex]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Content aria-label={ariaLabel} className={styles.panel}>
        <div className={styles.toolbar} role="toolbar" aria-label="Image preview controls">
          <IconButton
            aria-label="Previous image"
            disabled={activeIndex <= 0}
            icon={<ArrowLeftIcon />}
            variant="ghost"
            onClick={() => setIndex(activeIndex - 1)}
          />
          <IconButton
            aria-label="Zoom out"
            icon={<MinusIcon />}
            variant="ghost"
            onClick={() => setZoom((value) => clamp(value - zoomStep, minZoom, maxZoom))}
          />
          <IconButton
            aria-label="Reset zoom"
            icon={<RefreshIcon />}
            variant="ghost"
            onClick={() => setZoom(defaultZoom)}
          />
          <IconButton
            aria-label="Zoom in"
            icon={<PlusIcon />}
            variant="ghost"
            onClick={() => setZoom((value) => clamp(value + zoomStep, minZoom, maxZoom))}
          />
          <IconButton
            aria-label="Next image"
            disabled={activeIndex >= items.length - 1}
            icon={<ArrowRightIcon />}
            variant="ghost"
            onClick={() => setIndex(activeIndex + 1)}
          />
          <Dialog.CloseTrigger>
            <IconButton aria-label="Close preview" icon={<XIcon />} variant="ghost" />
          </Dialog.CloseTrigger>
        </div>
        <div className={styles.stage}>
          {activeItem ? (
            <img
              alt={activeItem.alt}
              className={styles.image}
              sizes={activeItem.sizes}
              src={activeItem.src}
              srcSet={activeItem.srcSet}
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <p className={styles.empty}>No image to preview.</p>
          )}
        </div>
        {activeItem && renderCaption ? (
          <div className={styles.caption}>{renderCaption(activeItem, activeIndex)}</div>
        ) : null}
      </Dialog.Content>
    </Dialog.Root>
  );
};
```

- [ ] **Step 4: Add ImagePreview styles**

Create `packages/react/src/image-preview/index.module.less`:

```less
@import '@deweyou-design/styles/less/bridge';

.panel {
  display: grid;
  gap: 16px;
  max-width: min(72rem, calc(100vw - 2rem));
  padding: 16px;
}

.toolbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.stage {
  align-items: center;
  background: color-mix(in srgb, var(--ui-color-text) 4%, transparent);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-float);
  display: flex;
  justify-content: center;
  max-block-size: calc(100dvh - 10rem);
  min-block-size: min(24rem, 60dvh);
  overflow: hidden;
}

.image {
  display: block;
  max-block-size: 100%;
  max-inline-size: 100%;
  object-fit: contain;
  transform-origin: center;
  transition: transform var(--ui-motion-duration-base) var(--ui-motion-ease-standard);
}

.caption,
.empty {
  color: var(--ui-color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .image {
    transition: none;
  }
}
```

- [ ] **Step 5: Run ImagePreview tests until they pass**

Run:

```bash
vp test packages/react/src/image-preview/index.test.tsx
```

Expected: pass after component and styles exist.

- [ ] **Step 6: Commit ImagePreview**

```bash
git add packages/react/src/image-preview
git commit -m "feat(react): add image preview"
```

## Task 4: Package Exports And Contract Tests

**Files:**

- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/package.json`
- Modify: `packages/react/tests/package-entrypoint.test.ts`
- Modify: `packages/react/tests/subpath-entrypoint.test.ts`

- [ ] **Step 1: Update failing package tests first**

Modify `packages/react/tests/package-entrypoint.test.ts` expected export list to include:

```ts
'ImageMasonry',
'ImagePreview',
'VirtualMasonry',
```

Add root API type smoke checks:

```ts
const exampleImagePreviewProps: import('../src').ImagePreviewProps = {
  items: [{ src: '/first.jpg', alt: 'First image' }],
};

const exampleImageMasonryProps: import('../src').ImageMasonryProps = {
  columns: 2,
  items: [{ src: '/first.jpg', alt: 'First image', width: 100, height: 80 }],
};

const exampleVirtualMasonryProps: import('../src').VirtualMasonryProps = {
  height: 320,
  items: [{ src: '/first.jpg', alt: 'First image', width: 100, height: 80 }],
};
```

Modify `packages/react/tests/subpath-entrypoint.test.ts` to import and assert:

```ts
import * as imageMasonryEntry from '../src/image-masonry/index.tsx';
import * as imagePreviewEntry from '../src/image-preview/index.tsx';
import * as virtualMasonryEntry from '../src/virtual-masonry/index.tsx';

expect(imageMasonryEntry.ImageMasonry).toBe(rootEntry.ImageMasonry);
expect(imagePreviewEntry.ImagePreview).toBe(rootEntry.ImagePreview);
expect(virtualMasonryEntry.VirtualMasonry).toBe(rootEntry.VirtualMasonry);
expect(Object.keys(imageMasonryEntry).sort()).toEqual(['ImageMasonry']);
expect(Object.keys(imagePreviewEntry).sort()).toEqual(['ImagePreview']);
expect(Object.keys(virtualMasonryEntry).sort()).toEqual(['VirtualMasonry']);
```

- [ ] **Step 2: Run package tests to verify failure**

Run:

```bash
vp test packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts
```

Expected: fail because root exports and subpath package exports are missing.

- [ ] **Step 3: Add public exports**

Modify `packages/react/src/index.ts`:

```ts
export {
  ImagePreview,
  type ImagePreviewIndexChangeDetails,
  type ImagePreviewItem,
  type ImagePreviewOpenChangeDetails,
  type ImagePreviewProps,
} from './image-preview/index.tsx';
export {
  ImageMasonry,
  type ImageMasonryClickDetails,
  type ImageMasonryItem,
  type ImageMasonryProps,
  type ImageMasonryRenderDetails,
} from './image-masonry/index.tsx';
export {
  VirtualMasonry,
  type VirtualMasonryItem,
  type VirtualMasonryProps,
  type VirtualMasonryRange,
  type VirtualMasonryRef,
  type VirtualMasonryRenderDetails,
} from './virtual-masonry/index.tsx';
```

Modify `packages/react/package.json` exports:

```json
"./image-preview": {
  "types": "./dist/image-preview/index.d.ts",
  "import": "./dist/image-preview/index.js",
  "default": "./dist/image-preview/index.js"
},
"./image-masonry": {
  "types": "./dist/image-masonry/index.d.ts",
  "import": "./dist/image-masonry/index.js",
  "default": "./dist/image-masonry/index.js"
},
"./virtual-masonry": {
  "types": "./dist/virtual-masonry/index.d.ts",
  "import": "./dist/virtual-masonry/index.js",
  "default": "./dist/virtual-masonry/index.js"
}
```

- [ ] **Step 4: Run package tests until they pass**

Run:

```bash
vp test packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts
```

Expected: pass after exports are synchronized.

- [ ] **Step 5: Commit package exports**

```bash
git add packages/react/src/index.ts packages/react/package.json packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts
git commit -m "feat(react): expose image components"
```

## Task 5: Storybook Interaction Coverage

**Files:**

- Create: `apps/storybook/src/stories/ImagePreview.stories.tsx`
- Create: `apps/storybook/src/stories/ImageMasonry.stories.tsx`
- Create: `apps/storybook/src/stories/VirtualMasonry.stories.tsx`

- [ ] **Step 1: Add ImagePreview story**

Create `apps/storybook/src/stories/ImagePreview.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button, ImagePreview } from '@deweyou-design/react';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200',
    alt: 'Workspace',
    width: 1200,
    height: 800,
  },
  {
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900',
    alt: 'Mountain sky',
    width: 900,
    height: 1200,
  },
];

const meta: Meta<typeof ImagePreview> = {
  title: 'Components/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)} variant="outlined">
          Open preview
        </Button>
        <ImagePreview
          items={images}
          open={open}
          onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}
        />
      </>
    );
  },
};

export const Interaction: StoryObj = {
  name: 'Interaction',
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open preview' }));
    await waitFor(async () => {
      await expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    const dialog = within(document.querySelector('[role="dialog"]') as HTMLElement);
    await userEvent.click(dialog.getByRole('button', { name: 'Zoom in' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Zoom out' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Reset zoom' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Next image' }));
    await expect(dialog.getByAltText('Mountain sky')).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: 'Previous image' }));
    await expect(dialog.getByAltText('Workspace')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });
  },
};
```

- [ ] **Step 2: Add ImageMasonry story**

Create `apps/storybook/src/stories/ImageMasonry.stories.tsx` with `Default`, `Responsive`, and `Interaction`. The interaction should click an image and assert selected text:

```tsx
export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => {
    const [selected, setSelected] = useState('None');
    return (
      <>
        <ImageMasonry
          columns={3}
          items={images}
          onItemClick={({ item }) => setSelected(item.alt)}
        />
        <p aria-live="polite">Selected: {selected}</p>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: images[2].alt }));
    await expect(canvas.getByText(`Selected: ${images[2].alt}`)).toBeInTheDocument();
  },
};
```

- [ ] **Step 3: Add VirtualMasonry story**

Create `apps/storybook/src/stories/VirtualMasonry.stories.tsx` with a long image array and an interaction that jumps to a far image:

```tsx
export const Interaction: StoryObj = {
  name: 'Interaction',
  render: () => {
    const ref = useRef<VirtualMasonryRef>(null);
    return (
      <>
        <Button onClick={() => ref.current?.scrollToIndex(90)} variant="outlined">
          Image 91
        </Button>
        <VirtualMasonry ref={ref} columns={4} height={420} items={images} overscan={160} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByAltText('Image 91')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Image 91' }));
    await waitFor(async () => {
      await expect(canvas.getByAltText('Image 91')).toBeInTheDocument();
    });
  },
};
```

- [ ] **Step 4: Run Storybook coverage**

Run:

```bash
vp run storybook#test
```

Expected: pass with new `Interaction` stories included.

- [ ] **Step 5: Commit stories**

```bash
git add apps/storybook/src/stories/ImagePreview.stories.tsx apps/storybook/src/stories/ImageMasonry.stories.tsx apps/storybook/src/stories/VirtualMasonry.stories.tsx
git commit -m "test(storybook): cover image components"
```

## Task 6: Public Docs, Website Catalog, MCP Catalog, And LLM Context

**Files:**

- Modify: `packages/react/README.md`
- Modify: `README.md`
- Modify: `README_ZH.md`
- Modify: `docs/design/components.md`
- Modify: `apps/website/src/data/component-catalog.tsx`
- Modify: `apps/website/src/data/component-catalog.test.tsx`
- Modify: `packages/mcp/src/catalog/index.ts`
- Modify: `packages/mcp/src/catalog/index.test.ts`
- Modify: `packages/mcp/src/server/index.test.ts`
- Modify: `packages/mcp/src/llms/index.test.ts`
- Modify: `apps/website/public/llms.txt`

- [ ] **Step 1: Update failing docs and catalog tests**

Modify `apps/website/src/data/component-catalog.test.tsx` `PUBLIC_COMPONENTS` to include:

```ts
'ImagePreview',
'ImageMasonry',
'VirtualMasonry',
```

Modify MCP catalog tests to assert the new component names are present:

```ts
expect(componentCatalog.map((component) => component.name)).toEqual(
  expect.arrayContaining(['ImagePreview', 'ImageMasonry', 'VirtualMasonry']),
);
```

- [ ] **Step 2: Run docs and catalog tests to verify failure**

Run:

```bash
vp test apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.test.ts packages/mcp/src/server/index.test.ts packages/mcp/src/llms/index.test.ts packages/react/tests/component-docs-contract.test.ts
```

Expected: fail because docs, website catalog, MCP catalog, and LLM text are not synchronized.

- [ ] **Step 3: Update public docs**

Add import matrix rows to `docs/design/components.md`:

```md
| `ImagePreview` | `@deweyou-design/react` | `@deweyou-design/react/image-preview` |
| `ImageMasonry` | `@deweyou-design/react` | `@deweyou-design/react/image-masonry` |
| `VirtualMasonry` | `@deweyou-design/react` | `@deweyou-design/react/virtual-masonry` |
```

Add short composition sections for each new component, including `ImagePreview` group navigation, `ImageMasonry` fixed/responsive columns, and `VirtualMasonry` long-list scrolling.

Update root README component table:

```md
| `ImagePreview` | Modal image preview with zoom controls and optional grouped navigation |
| `ImageMasonry` | Image masonry layout with fixed or responsive columns |
| `VirtualMasonry` | Virtualized masonry renderer for long uneven image lists |
```

Update `README_ZH.md` with matching Chinese descriptions.

Update `packages/react/README.md` core coverage list and add compact usage snippets.

- [ ] **Step 4: Update website component catalog**

Modify `apps/website/src/data/component-catalog.tsx` imports:

```ts
import { ImageMasonry, ImagePreview, VirtualMasonry } from '@deweyou-design/react';
```

Add three entries in the data category:

```tsx
{
  name: 'ImagePreview',
  category: 'overlays',
  description: 'Modal image viewer with zoom controls and grouped navigation.',
  importSnippet: "import { ImagePreview } from '@deweyou-design/react';",
  dimensions: ['items', 'open', 'zoom', 'currentIndex'],
  storyId: 'components-imagepreview--default',
  preview: <Badge>Preview</Badge>,
},
{
  name: 'ImageMasonry',
  category: 'data',
  description: 'Image masonry layout with fixed and responsive column modes.',
  importSnippet: "import { ImageMasonry } from '@deweyou-design/react';",
  dimensions: ['items', 'columns', 'minColumnWidth'],
  storyId: 'components-imagemasonry--default',
  preview: <ImageMasonry columns={2} items={catalogImages} />,
},
{
  name: 'VirtualMasonry',
  category: 'data',
  description: 'Windowed masonry renderer for long uneven image collections.',
  importSnippet: "import { VirtualMasonry } from '@deweyou-design/react';",
  dimensions: ['items', 'height', 'overscan', 'scrollToIndex'],
  storyId: 'components-virtualmasonry--default',
  preview: <VirtualMasonry columns={2} height={72} items={catalogImages} />,
},
```

- [ ] **Step 5: Update MCP catalog and LLM text**

Modify `packages/mcp/src/catalog/index.ts` with the same three component entries and import snippets.

Regenerate `apps/website/public/llms.txt` from the generator. If no script exists, run a Node snippet after `packages/mcp` compiles or manually copy the exact `generateLlmsTxt()` output and let `packages/mcp/src/llms/index.test.ts` verify byte-for-byte sync.

- [ ] **Step 6: Run docs and catalog tests until they pass**

Run:

```bash
vp test apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.test.ts packages/mcp/src/server/index.test.ts packages/mcp/src/llms/index.test.ts packages/react/tests/component-docs-contract.test.ts
```

Expected: pass after all public docs and AI-facing catalogs are synchronized.

- [ ] **Step 7: Commit docs and catalogs**

```bash
git add README.md README_ZH.md docs/design/components.md packages/react/README.md apps/website/src/data/component-catalog.tsx apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.ts packages/mcp/src/catalog/index.test.ts packages/mcp/src/server/index.test.ts packages/mcp/src/llms/index.test.ts apps/website/public/llms.txt
git commit -m "docs: document image components"
```

## Task 7: Full Verification And Repo Memory

**Files:**

- Review all files changed since `13f9772`.

- [ ] **Step 1: Run focused React package tests**

```bash
vp test packages/react/src/image-preview/index.test.tsx packages/react/src/image-masonry/index.test.tsx packages/react/src/virtual-masonry/index.test.tsx packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/component-docs-contract.test.ts packages/react/tests/component-style-contract.test.ts
```

Expected: all listed tests pass.

- [ ] **Step 2: Run website and MCP focused tests**

```bash
vp test apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.test.ts packages/mcp/src/server/index.test.ts packages/mcp/src/llms/index.test.ts
```

Expected: all listed tests pass.

- [ ] **Step 3: Run Storybook e2e**

```bash
vp run storybook#test
```

Expected: Storybook test runner passes, including `ImagePreview`, `ImageMasonry`, and `VirtualMasonry` `Interaction` stories.

- [ ] **Step 4: Run repository gates**

```bash
vp check
vp test
```

Expected: both commands exit 0.

- [ ] **Step 5: Run repo-memory check**

Use `.agents/skills/repo-memory/SKILL.md`. Expected decision:

```text
memory_check=incremental update
focused_docs=docs/superpowers/specs/2026-06-13-image-preview-masonry-design.md,docs/superpowers/plans/2026-06-13-image-preview-masonry.md,docs/design/components.md
design_memory=docs/design/system.md
owned_skill_updates=none unless implementation changes future component workflow
dependency_skill_followups=none
```

- [ ] **Step 6: Review final diff**

```bash
git status --short
git diff --stat origin/main...HEAD
```

Expected: changes are limited to the three components, public export contracts, docs, website catalog, MCP catalog, generated LLM context, and Storybook stories.

- [ ] **Step 7: Final delivery decision**

If the user asks to ship, follow `.agents/skills/git-delivery/SKILL.md` finish-work path: verify, stage intended files only, commit remaining changes, fetch `origin/main`, rebase only if clean and safe, push, open PR, then inspect CI.
