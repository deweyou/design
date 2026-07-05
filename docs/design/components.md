# React Component Contracts

> Audience: AI agents, contributors, and consumers who need the public composition, import, and accessibility contract without reading every source file.

This document is the human-readable companion to `packages/react/package.json` exports. Keep it synchronized with the package export map whenever a component is added, renamed, or removed.

## Import Matrix

| Component               | Root import              | Subpath import                                  |
| ----------------------- | ------------------------ | ----------------------------------------------- |
| `Badge`                 | `@deweyou-design/react`  | `@deweyou-design/react/badge`                   |
| `Breadcrumb`            | `@deweyou-design/react`  | `@deweyou-design/react/breadcrumb`              |
| `Button`, `IconButton`  | `@deweyou-design/react`  | `@deweyou-design/react/button`                  |
| `Card`                  | `@deweyou-design/react`  | `@deweyou-design/react/card`                    |
| `Checkbox`              | `@deweyou-design/react`  | `@deweyou-design/react/checkbox`                |
| `CodeBlock`             | `@deweyou-design/react`  | `@deweyou-design/react/code-block`              |
| `Dialog`                | `@deweyou-design/react`  | `@deweyou-design/react/dialog`                  |
| `Field`                 | `@deweyou-design/react`  | `@deweyou-design/react/field`                   |
| `GroupedVirtualMasonry` | `@deweyou-design/react`  | `@deweyou-design/react/grouped-virtual-masonry` |
| `ImageMasonry`          | `@deweyou-design/react`  | `@deweyou-design/react/image-masonry`           |
| `ImagePreview`          | `@deweyou-design/react`  | `@deweyou-design/react/image-preview`           |
| `Input`                 | `@deweyou-design/react`  | `@deweyou-design/react/input`                   |
| `MarkdownRender`        | `@deweyou-design/react`  | `@deweyou-design/react/markdown-render`         |
| `Editor`                | `@deweyou-design/editor` | `@deweyou-design/editor/editor`                 |
| `MermaidRender`         | `@deweyou-design/react`  | `@deweyou-design/react/mermaid-render`          |
| `Menu`, `ContextMenu`   | `@deweyou-design/react`  | `@deweyou-design/react/menu`                    |
| `Nav`                   | `@deweyou-design/react`  | `@deweyou-design/react/nav`                     |
| `NavOverlay`            | `@deweyou-design/react`  | `@deweyou-design/react/nav-overlay`             |
| `Pagination`            | `@deweyou-design/react`  | `@deweyou-design/react/pagination`              |
| `Popover`               | `@deweyou-design/react`  | `@deweyou-design/react/popover`                 |
| `RadioGroup`            | `@deweyou-design/react`  | `@deweyou-design/react/radio-group`             |
| `ScrollArea`            | `@deweyou-design/react`  | `@deweyou-design/react/scroll-area`             |
| `Select`                | `@deweyou-design/react`  | `@deweyou-design/react/select`                  |
| `Separator`             | `@deweyou-design/react`  | `@deweyou-design/react/separator`               |
| `Skeleton`              | `@deweyou-design/react`  | `@deweyou-design/react/skeleton`                |
| `Spinner`               | `@deweyou-design/react`  | `@deweyou-design/react/spinner`                 |
| `Switch`                | `@deweyou-design/react`  | `@deweyou-design/react/switch`                  |
| `Tabs` family           | `@deweyou-design/react`  | `@deweyou-design/react/tabs`                    |
| `Text`                  | `@deweyou-design/react`  | `@deweyou-design/react/text`                    |
| `Textarea`              | `@deweyou-design/react`  | `@deweyou-design/react/textarea`                |
| `toast`, `Toaster`      | `@deweyou-design/react`  | `@deweyou-design/react/toast`                   |
| `Tooltip`               | `@deweyou-design/react`  | `@deweyou-design/react/tooltip`                 |
| `VirtualList`           | `@deweyou-design/react`  | `@deweyou-design/react/virtual-list`            |
| `VirtualMasonry`        | `@deweyou-design/react`  | `@deweyou-design/react/virtual-masonry`         |

Use root imports when a file consumes several components together. Use subpath imports for examples, docs, and single-component usage so bundlers and AI agents can see the intended package boundary.

## Composition Trees

### Button

```tsx
<Button variant="filled" color="primary" size="md">
  Save
</Button>

<IconButton aria-label="Search" icon={<SearchIcon />} variant="outlined" />
```

Icon-only actions must use `IconButton`, `Button.Icon`, or `Button` with the explicit `icon` prop and an accessible name.

### Field

```tsx
<Field.Root id="email" required hasDescription>
  <Field.Label>Email</Field.Label>
  <Field.Control>
    <input />
  </Field.Control>
  <Field.Description>Use a work email.</Field.Description>
</Field.Root>
```

`Field` owns the label/control/description/error id wiring. `Input`, `Textarea`, and `Select` use it internally.

### Dialog

```text
Dialog
├── Dialog.Root
├── Dialog.Trigger
├── Dialog.Content
│   ├── Dialog.Title
│   ├── Dialog.Description
│   └── Dialog.CloseTrigger
```

```tsx
<Dialog.Root>
  <Dialog.Trigger>
    <Button>Open</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Confirm action</Dialog.Title>
    <Dialog.Description>This action can be reviewed before saving.</Dialog.Description>
    <Dialog.CloseTrigger>
      <Button variant="outlined">Close</Button>
    </Dialog.CloseTrigger>
  </Dialog.Content>
</Dialog.Root>
```

### Menu

```text
Menu
├── Menu
├── MenuTrigger
└── MenuContent
    ├── MenuItem
    ├── MenuGroup
    │   └── MenuGroupLabel
    ├── MenuSeparator
    ├── MenuTriggerItem
    ├── MenuRadioGroup
    │   └── MenuRadioItem
    └── MenuCheckboxItem
```

Use `ContextMenu` for right-click surfaces. Use `MenuTrigger asChild` when the trigger should be an existing button.

### Select

```text
Select
├── Select.Root
├── Select.Trigger
└── Select.Content
    └── Select.Item
```

```tsx
<Select.Root id="fruit" label="Fruit" hint="Pick one fruit." placeholder="Pick a fruit">
  <Select.Trigger />
  <Select.Content>
    <Select.Item value="apple" label="Apple" />
    <Select.Item value="banana" label="Banana" />
  </Select.Content>
</Select.Root>
```

`Select.Root` accepts `label`, `hint`, `error`, `required`, and `disabled`; `Select.Trigger` receives the field aria contract.

### Tabs

```text
Tabs
├── Tabs
├── TabList
│   ├── TabTrigger
│   └── TabIndicator
└── TabContent
```

`Tabs` can be controlled with `value` / `onValueChange` or uncontrolled with `defaultValue`.
Use `hideContent` for route-backed tab bars where panels are owned by the router. In that pattern,
keep `Tabs` controlled by the current route and handle visible-tab navigation through `TabTrigger`
`onClick`. When `overflowMode="collapse"` is used, mirror the same action in `onSelect` so selecting
an item from the overflow menu follows the same route or command.

```tsx
<Tabs activationMode="manual" hideContent overflowMode="collapse" value={pathname}>
  <TabList>
    <TabTrigger
      value="/components"
      onClick={() => navigate('/components')}
      onSelect={() => navigate('/components')}
    >
      Components
    </TabTrigger>
  </TabList>
</Tabs>
```

### MarkdownRender

```tsx
<MarkdownRender value={content} size="md" />

<MarkdownRender
  value={content}
  onLinkClick={({ href, index, text }) => {
    trackLinkClick({ href, index, text })
  }}
  onCopy={({ text }) => {
    trackCopy(text)
  }}
/>

<MarkdownRender
  value={content}
  resolveNodeAttributes={({ index, node, text }) =>
    node.startsWith('h') ? { id: `${node}-${slugify(text)}-${index}` } : undefined
  }
/>

<MarkdownRender value={content} components={{ a: CustomLink, pre: CodeBlock }} />
```

`MarkdownRender` is the safe runtime Markdown path for CommonMark plus GFM content. Use `size` to adjust typography density, `onLinkClick` and `onCopy` for light interaction hooks, `resolveNodeAttributes` to attach light DOM attributes such as heading ids, `components` to replace rendered nodes, and `className` with `[data-markdown-node]` selectors for light style overrides. Event callbacks preserve default browser behavior unless the consumer calls `event.preventDefault()`. `resolveNodeAttributes` receives the node name, text content, and a zero-based per-node `index`, which keeps repeated headings addressable without a component override. Fenced code blocks render through `CodeBlock`, with syntax highlighting from Markdown parsing and a compact language tag when a language is present. Tables and code blocks use default max-height guards with scrolling; override `--markdown-table-max-height` or `--markdown-code-max-height` from the consumer surface when needed. MDX and executable content belong in a separate rendering boundary.

### Editor

```tsx
<Editor
  adapter={markdownEditorAdapter()}
  plugins={[
    historyPlugin(),
    textFormatPlugin(),
    headingPlugin(),
    listPlugin(),
    toolbarPlugin(),
    markdownShortcutPlugin(),
    keyboardShortcutPlugin(),
  ]}
/>
```

`Editor` is the editor capability surface for Deweyou Design. Keep content
formats behind adapters; do not add a `format` prop to the component. Use
`markdownEditorAdapter()` for Markdown strings. Prefer focused feature plugins
for text, heading, list, quote, link, code, and table behavior; entrypoint plugins
such as `toolbarPlugin()`, `floatingToolbarPlugin()`, `blockToolbarPlugin()`,
`markdownShortcutPlugin()`, `keyboardShortcutPlugin()`, and `pastePlugin()` should
consume feature contributions from the registry instead of hardcoding feature
logic. `richTextPlugin()` remains a compatibility preset.

### MermaidRender

```tsx
<MermaidRender value={diagram} />
<MindmapRender value={mindmapDiagram} />
```

`MermaidRender` is the read-only diagram renderer for Mermaid strings. It prefers `beautiful-mermaid` for supported diagram families, uses Deweyou SVG rendering for `mindmap`, and falls back to native Mermaid for other syntax. Use it from Markdown by overriding fenced code blocks through `MarkdownRender` `components`; Mermaid execution remains outside the default Markdown path.

### CodeBlock

```tsx
<CodeBlock copy language="tsx">{`const value = "Deweyou"`}</CodeBlock>
<CodeBlock size="sm">npm i @deweyou-design/react</CodeBlock>
```

`CodeBlock` is the shared scrollable block-code primitive. Use it for standalone snippets in product surfaces and documentation so they visually match fenced code rendered by `MarkdownRender`. Pass `language` when the label adds useful context; it supports common ids such as `ts`, `tsx`, `js`, `jsx`, `json`, `css`, `html`, `bash`, and `markdown`, while still accepting custom strings. Set `copy` to show the compact copy icon button; `onCopy` receives the copied plain text after the Clipboard API write succeeds.

Use `CodeBlockToolbar`, `CodeBlockActionButton`, `CodeBlockLanguageButton`, and
`CodeBlockLanguageLabel` when another surface owns the code DOM but needs the
same code-block chrome. This keeps editable code blocks and display code blocks
visually aligned without forcing consumers to adopt `CodeBlock`'s read-only
`pre/code` structure.

### Navigation

```text
Nav
├── Nav.Root
├── Nav.Link
└── Nav.Responsive

NavOverlay
├── NavOverlay.Root
├── NavOverlay.Trigger
├── NavOverlay.Content
└── NavOverlay.CloseButton
```

Use `Nav` for visible navigation landmarks. Use `NavOverlay` for responsive fullscreen navigation.
Use `Nav.Responsive` when the same navigation destinations should render inline on wide screens and collapse into a fullscreen overlay on small screens. Keep route or section destinations inside `Nav.Responsive`; keep global actions such as theme toggles, GitHub links, and account controls outside the nav as adjacent `IconButton` actions. Do not use `Tabs` for this pattern unless the component also owns tab panels and tab activation semantics.

### Virtualized Content

```tsx
const listRef = useRef<VirtualListRef>(null);

<VirtualList
  ref={listRef}
  count={articles.length}
  height={420}
  estimateSize={() => 72}
  scrollMargin={64}
  onRangeChange={(range) => syncReadingProgress(range.startIndex)}
  renderItem={({ index, measureRef }) => (
    <article ref={measureRef} id={articles[index].id}>
      <ArticleAnchorRow article={articles[index]} />
    </article>
  )}
/>;
```

`VirtualList` renders a scrollable window over large one-dimensional content and uses `ScrollArea` internally so scrollbar styling stays aligned with the rest of the system. It measures rendered items with `ResizeObserver`, so long MDX feeds can start from `estimateSize(index)` and then settle into real heights as text wraps, images load, and responsive layout changes. Use `scrollElement="window"` when the page itself owns scrolling, `scrollMargin` or `scrollToIndex(index, { offset })` for sticky navigation, and `onRangeChange` for URL hash or reading progress sync. The default wrapper keeps `role="listitem"` plus positional ARIA; pass `itemRole={null}` when the rendered article should own item semantics.

### Image Collections

```tsx
<ImageMasonry
  images={photos}
  minColumnWidth={220}
  maxColumnCount={4}
  onItemClick={({ index }) => openPreview(index)}
/>

<ImagePreview
  images={photos}
  open={previewOpen}
  currentIndex={previewIndex}
  onOpenChange={setPreviewOpen}
  onIndexChange={({ index }) => setPreviewIndex(index)}
/>
```

`ImagePreview` is the modal image-viewer surface for one image or a small gallery. It uses `Dialog` for focus and Escape behavior, exposes controlled and uncontrolled open/index state, and keeps zoom controls in an icon toolbar. Use it with `ImageMasonry` by opening the preview from `onItemClick`.

`ImageMasonry` lays out fixed-column or responsive image grids with shortest-column placement. Responsive mode reads the container width with `ResizeObserver`, `minColumnWidth`, and optional `maxColumnCount`; fixed mode uses `columnCount`. Pass `aspectRatio` or positive `width` and `height` on each image so the masonry can reserve stable geometry before images load. Each item keeps list/listitem semantics by default, and custom renderers receive the computed layout item.

```tsx
const masonryRef = useRef<VirtualMasonryRef>(null);

<VirtualMasonry
  ref={masonryRef}
  images={photos}
  height={480}
  minColumnWidth={220}
  overscan={360}
  onRangeChange={(range) => preloadAround(range.endIndex)}
/>;
```

`VirtualMasonry` shares the same masonry layout contract but only mounts the visible image cards plus a pixel overscan window. Use it for long or unbounded image collections where mounting every image would create scroll and decoding pressure. It requires the same stable image geometry contract as `ImageMasonry`: provide `aspectRatio` or positive `width` and `height`, especially for long virtualized feeds where unmounted images cannot be measured from rendered DOM. Its ref mirrors the list virtualization contract with `scrollToIndex`, `scrollToOffset`, and `getScrollOffset`.

```tsx
const groupedMasonryRef = useRef<GroupedVirtualMasonryRef>(null);

<GroupedVirtualMasonry
  ref={groupedMasonryRef}
  groups={[
    { id: 'today', title: 'Today', images: todayPhotos },
    { id: 'archive', title: 'Archive', images: archivePhotos },
  ]}
  groupHeaderHeight={44}
  height={480}
  minColumnWidth={220}
  overscan={360}
/>;
```

For small grouped galleries, compose multiple `ImageMasonry` instances and keep section headings in the consuming layout. Use `GroupedVirtualMasonry` when the grouped image feed itself needs virtualization; it keeps group headers and masonry cells in one scroll-height model, requires a fixed `groupHeaderHeight`, and exposes `scrollToGroup`, `scrollToItem`, `scrollToOffset`, and `getScrollOffset` through its ref. Group `title` accepts any `ReactNode`, and `renderGroupHeader` is the richer path for custom title layouts, counts, actions, or typography.

### Floating And Feedback

```text
Popover
├── Popover
└── content prop

Tooltip
├── Tooltip.Root
├── Tooltip.Trigger
└── Tooltip.Content

Toast
├── Toaster
└── toast.create(options)
```

`Popover`, `Tooltip`, `Dialog`, `Menu`, `Select`, and `Toast` rely on Ark UI for behavior and must keep focus, keyboard, and portal behavior delegated to Ark primitives.

## Accessibility Contracts

| Component                          | Contract                                                                                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                           | Text buttons render visible content. Icon-only buttons require `aria-label` or `aria-labelledby`. Loading buttons set `aria-busy` and block repeated activation.        |
| `Field`                            | `Field.Label` points at the control id. `Field.Description` and `Field.ErrorText` provide `aria-describedby`; errors set `role="alert"` and take precedence over hints. |
| `Input`, `Textarea`                | Label, hint, error, `required`, `disabled`, and invalid state are wired through `Field`.                                                                                |
| `Checkbox`, `RadioGroup`, `Switch` | Ark UI owns native hidden inputs, checked state, disabled state, and keyboard behavior.                                                                                 |
| `Select`                           | Trigger uses `role="combobox"`, listbox/options come from Ark UI, and field copy is exposed through label and description ids.                                          |
| `Dialog`, `NavOverlay`             | Modal focus management and Escape handling come from Ark UI. Content is SSR-safe and portals to `document.body` only in the browser.                                    |
| `Menu`, `ContextMenu`              | Menu roles, item selection, nested triggers, and keyboard navigation come from Ark UI.                                                                                  |
| `Tabs`                             | Tablist, tab, panel, selected state, and keyboard activation come from Ark UI plus local overflow handling.                                                             |
| `Tooltip`, `Popover`               | Floating content must remain non-destructive and dismissible; focus/hover/click behavior is explicit through props.                                                     |
| `Toast`                            | `Toaster` should be mounted once per position; notifications are created with `toast.create`.                                                                           |

## Component Notes

- `Badge`, `Card`, `Separator`, `Skeleton`, `Spinner`, and `Text` are presentational primitives. They should stay token-driven and avoid hidden behavior.
- `MarkdownRender` is a content rendering primitive for CommonMark plus GFM strings. Keep it text-to-React and separate from MDX or executable content.
- `Pagination`, `Breadcrumb`, `Nav`, and `Tabs` are navigation primitives. They should expose semantic markup first and visual variants second.
- `ScrollArea` is a layout primitive. Keep viewport/scrollbar/thumb composition explicit.
- Public component props should stay decoupled from Ark UI prop names unless the Ark term is already the common component vocabulary.
- New public components must include source, CSS module, colocated unit tests, Storybook `Interaction`, README entry, this component contract entry, root and subpath exports, and package/docs contract coverage.
- New component designs with non-obvious trade-offs or future extension paths must be recorded in `docs/superpowers/specs/` and `docs/superpowers/plans/` before implementation continues.
