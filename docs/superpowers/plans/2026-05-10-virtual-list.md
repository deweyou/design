# Virtual List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `VirtualList` React component with ScrollArea-aligned scrollbars and imperative anchor navigation APIs.

**Architecture:** Add a governed `packages/react/src/virtual-list/` unit. Keep range calculation inside the component for the first version, render visible rows inside a spacer, and compose existing `ScrollArea` parts for scrollbar behavior and styling.

**Tech Stack:** TypeScript 5, React 19, CSS Modules with Less, Ark UI-backed `ScrollArea`, vite-plus tests, Storybook.

---

### Task 1: ScrollArea Viewport Composition Support

**Files:**

- Modify: `packages/react/src/scroll-area/index.tsx`
- Modify: `packages/react/src/scroll-area/index.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('passes viewport DOM props and scroll events through', () => {
  const onScroll = vi.fn();
  render(
    <ScrollArea.Root style={{ height: '200px' }}>
      <ScrollArea.Viewport data-testid="viewport" onScroll={onScroll}>
        <div>Content</div>
      </ScrollArea.Viewport>
    </ScrollArea.Root>,
  );

  fireEvent.scroll(screen.getByTestId('viewport'));

  expect(onScroll).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test packages/react/src/scroll-area/index.test.tsx`

Expected: FAIL because `ScrollArea.Viewport` does not pass `data-testid` through.

- [ ] **Step 3: Implement viewport pass-through**

Change `ScrollAreaViewport` to use `forwardRef<HTMLDivElement, ScrollAreaViewportProps>`, extend its props from `ComponentPropsWithoutRef<typeof ArkScrollArea.Viewport>`, pass `...rest`, and set `displayName`.

- [ ] **Step 4: Run test to verify it passes**

Run: `vp test packages/react/src/scroll-area/index.test.tsx`

Expected: PASS.

### Task 2: VirtualList Unit

**Files:**

- Create: `packages/react/src/virtual-list/index.tsx`
- Create: `packages/react/src/virtual-list/index.module.less`
- Create: `packages/react/src/virtual-list/index.test.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] **Step 1: Write failing virtualization tests**

```tsx
it('renders only the visible items plus overscan', () => {
  render(
    <VirtualList
      count={100}
      estimateSize={() => 20}
      height={100}
      overscan={1}
      renderItem={({ index }) => <div>Row {index}</div>}
    />,
  );

  expect(screen.getByText('Row 0')).toBeDefined();
  expect(screen.getByText('Row 5')).toBeDefined();
  expect(screen.queryByText('Row 20')).toBeNull();
});
```

- [ ] **Step 2: Write failing scroll API tests**

```tsx
it('scrolls to a specific item and offset through the ref api', () => {
  const ref = createRef<VirtualListRef>();
  render(
    <VirtualList
      ref={ref}
      count={100}
      estimateSize={() => 20}
      height={100}
      renderItem={({ index }) => <div>Row {index}</div>}
    />,
  );

  ref.current?.scrollToIndex(12);
  expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(240);

  ref.current?.scrollToOffset(88);
  expect(screen.getByTestId('virtual-list-viewport').scrollTop).toBe(88);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `vp test packages/react/src/virtual-list/index.test.tsx`

Expected: FAIL because `packages/react/src/virtual-list/index.tsx` does not exist yet.

- [ ] **Step 4: Implement VirtualList**

Create `VirtualList` as a `forwardRef` component. Compute size starts from `count` and `estimateSize`, derive visible indices from `scrollTop` and `height`, render a spacer with absolutely positioned item wrappers, compose `ScrollArea.Root`, `ScrollArea.Viewport`, `ScrollArea.Scrollbar`, and `ScrollArea.Thumb`, and expose `scrollToIndex`, `scrollToOffset`, and `getScrollOffset`.

- [ ] **Step 5: Add minimal styles**

Create `index.module.less` with `.root`, `.viewport`, `.spacer`, and `.item`. Keep styles structural only: relative root/spacer, absolute row wrappers, full-width viewport.

- [ ] **Step 6: Export the component**

Add `VirtualList` and its public types to `packages/react/src/index.ts`.

- [ ] **Step 7: Run tests to verify they pass**

Run: `vp test packages/react/src/virtual-list/index.test.tsx`

Expected: PASS.

### Task 3: Public Package Contracts

**Files:**

- Modify: `packages/react/package.json`
- Modify: `packages/react/tests/package-entrypoint.test.ts`
- Modify: `packages/react/tests/subpath-entrypoint.test.ts`
- Modify: `docs/design/components.md`

- [ ] **Step 1: Add contract assertions**

Update root export tests to include `VirtualList`. Update subpath tests to assert `./virtual-list` maps to `./dist/virtual-list/index.js` and `./dist/virtual-list/index.d.ts`. Update docs contract by adding `@deweyou-design/react/virtual-list` to `docs/design/components.md`.

- [ ] **Step 2: Run contract tests to verify they fail before package export updates**

Run: `vp test packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/component-docs-contract.test.ts`

Expected: FAIL until `package.json`, root exports, and docs are synchronized.

- [ ] **Step 3: Update package exports and docs**

Add `./virtual-list` to `packages/react/package.json`. Add `VirtualList` to the import matrix and document `scrollToIndex` / `scrollToOffset` usage.

- [ ] **Step 4: Run contract tests to verify they pass**

Run: `vp test packages/react/tests/package-entrypoint.test.ts packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/component-docs-contract.test.ts`

Expected: PASS.

### Task 4: Storybook Coverage

**Files:**

- Create: `apps/storybook/src/stories/VirtualList.stories.tsx`

- [ ] **Step 1: Add stories**

Create `Default`, `AnchorNavigation`, and `Interaction` stories. Use 1000 synthetic document rows, render a bordered virtual list, and add buttons that call `scrollToIndex(0)`, `scrollToIndex(250)`, and `scrollToIndex(900)`.

- [ ] **Step 2: Add interaction play function**

In `Interaction.play`, assert section 1 is visible, click the Section 901 anchor button, and wait for the row description `Document paragraph anchor 901` to become visible.

- [ ] **Step 3: Run Storybook build through repository build**

Run: `vp run build -r`

Expected: PASS, including Storybook build.

### Task 5: Final Verification

**Files:**

- All files touched by Tasks 1-4

- [ ] **Step 1: Run formatting, lint, and type checks**

Run: `vp check`

Expected: PASS with no formatting, lint, or type errors.

- [ ] **Step 2: Run full test suite**

Run: `vp test`

Expected: PASS with all test files and tests passing.

- [ ] **Step 3: Inspect git diff**

Run: `git status --short` and `git diff --stat`

Expected: only VirtualList, ScrollArea composition support, package contract, docs, and Storybook files are changed.
