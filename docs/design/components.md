# React Component Contracts

> Audience: AI agents, contributors, and consumers who need the public composition, import, and accessibility contract without reading every source file.

This document is the human-readable companion to `packages/react/package.json` exports. Keep it synchronized with the package export map whenever a component is added, renamed, or removed.

## Import Matrix

| Component              | Root import             | Subpath import                          |
| ---------------------- | ----------------------- | --------------------------------------- |
| `Badge`                | `@deweyou-design/react` | `@deweyou-design/react/badge`           |
| `Breadcrumb`           | `@deweyou-design/react` | `@deweyou-design/react/breadcrumb`      |
| `Button`, `IconButton` | `@deweyou-design/react` | `@deweyou-design/react/button`          |
| `Card`                 | `@deweyou-design/react` | `@deweyou-design/react/card`            |
| `Checkbox`             | `@deweyou-design/react` | `@deweyou-design/react/checkbox`        |
| `Dialog`               | `@deweyou-design/react` | `@deweyou-design/react/dialog`          |
| `Field`                | `@deweyou-design/react` | `@deweyou-design/react/field`           |
| `Input`                | `@deweyou-design/react` | `@deweyou-design/react/input`           |
| `MarkdownRender`       | `@deweyou-design/react` | `@deweyou-design/react/markdown-render` |
| `Menu`, `ContextMenu`  | `@deweyou-design/react` | `@deweyou-design/react/menu`            |
| `Nav`                  | `@deweyou-design/react` | `@deweyou-design/react/nav`             |
| `NavOverlay`           | `@deweyou-design/react` | `@deweyou-design/react/nav-overlay`     |
| `Pagination`           | `@deweyou-design/react` | `@deweyou-design/react/pagination`      |
| `Popover`              | `@deweyou-design/react` | `@deweyou-design/react/popover`         |
| `RadioGroup`           | `@deweyou-design/react` | `@deweyou-design/react/radio-group`     |
| `ScrollArea`           | `@deweyou-design/react` | `@deweyou-design/react/scroll-area`     |
| `Select`               | `@deweyou-design/react` | `@deweyou-design/react/select`          |
| `Separator`            | `@deweyou-design/react` | `@deweyou-design/react/separator`       |
| `Skeleton`             | `@deweyou-design/react` | `@deweyou-design/react/skeleton`        |
| `Spinner`              | `@deweyou-design/react` | `@deweyou-design/react/spinner`         |
| `Switch`               | `@deweyou-design/react` | `@deweyou-design/react/switch`          |
| `Tabs` family          | `@deweyou-design/react` | `@deweyou-design/react/tabs`            |
| `Text`                 | `@deweyou-design/react` | `@deweyou-design/react/text`            |
| `Textarea`             | `@deweyou-design/react` | `@deweyou-design/react/textarea`        |
| `toast`, `Toaster`     | `@deweyou-design/react` | `@deweyou-design/react/toast`           |
| `Tooltip`              | `@deweyou-design/react` | `@deweyou-design/react/tooltip`         |
| `VirtualList`          | `@deweyou-design/react` | `@deweyou-design/react/virtual-list`    |

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

### MarkdownRender

```tsx
<MarkdownRender value={content} size="md" />

<MarkdownRender
  value={content}
  resolveNodeAttributes={({ index, node, text }) =>
    node.startsWith('h') ? { id: `${node}-${slugify(text)}-${index}` } : undefined
  }
/>

<MarkdownRender value={content} components={{ a: CustomLink, pre: CodeBlock }} />
```

`MarkdownRender` is the safe runtime Markdown path for CommonMark plus GFM content. Use `size` to adjust typography density, `resolveNodeAttributes` to attach light DOM attributes such as heading ids, `components` to replace rendered nodes, and `className` with `[data-markdown-node]` selectors for light style overrides. `resolveNodeAttributes` receives the node name, text content, and a zero-based per-node `index`, which keeps repeated headings addressable without a component override. Fenced code blocks with a language are syntax-highlighted by default and show a compact language tag. Tables and code blocks use default max-height guards with scrolling; override `--markdown-table-max-height` or `--markdown-code-max-height` from the consumer surface when needed. MDX and executable content belong in a separate rendering boundary.

### Navigation

```text
Nav
├── Nav.Root
└── Nav.Link

NavOverlay
├── NavOverlay.Root
├── NavOverlay.Trigger
├── NavOverlay.Content
└── NavOverlay.CloseButton
```

Use `Nav` for visible navigation landmarks. Use `NavOverlay` for responsive fullscreen navigation.

### Virtualized Content

```tsx
const listRef = useRef<VirtualListRef>(null);

<VirtualList
  ref={listRef}
  count={articles.length}
  height={420}
  estimateSize={() => 72}
  renderItem={({ index }) => <ArticleAnchorRow article={articles[index]} />}
/>;
```

`VirtualList` renders a scrollable window over large one-dimensional content and uses `ScrollArea` internally so scrollbar styling stays aligned with the rest of the system. Use `scrollToIndex(index)` for anchor-style navigation and `scrollToOffset(offset)` for precise document-position jumps.

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
