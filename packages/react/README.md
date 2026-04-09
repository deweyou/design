# @deweyou-design/react

Reusable UI components for Deweyou Design.

## Installation

```bash
npm install @deweyou-design/react @deweyou-design/styles
```

Import the theme stylesheet once at your app root:

```ts
import '@deweyou-design/styles/theme.css';
```

## Components

| Component                           | Subpath import                  | Root import |
| ----------------------------------- | ------------------------------- | ----------- |
| `Button`, `IconButton`              | `@deweyou-design/react/button`  | ✓           |
| `Text`                              | `@deweyou-design/react/text`    | ✓           |
| `Popover`                           | `@deweyou-design/react/popover` | ✓           |
| `Menu`, `ContextMenu` and sub-parts | `@deweyou-design/react/menu`    | ✓           |
| `Tabs` and sub-parts                | `@deweyou-design/react/tabs`    | ✓           |

Prefer subpath imports for better tree-shaking; use the root `@deweyou-design/react` import when consuming multiple components together.

## Button

The shared action primitive. Supports `filled`, `outlined`, `ghost`, and `link` variants.

### Props

- `variant`: `'filled' | 'outlined' | 'ghost' | 'link'` — defaults to `filled`
- `color`: `'neutral' | 'primary' | 'danger'` — defaults to `neutral`
- `size`: `'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'` — defaults to `medium`
- `shape`: `'rect' | 'rounded' | 'pill'` — only for `filled` and `outlined`, defaults to `rounded`
- `icon`: leading graphic slot for mixed-content usage
- `href`: renders an `<a>` root when present
- `target`: only valid with `href`
- `htmlType`: alias for the native button `type` attribute
- `loading`: shows a spinner, blocks activation, adds `aria-busy`
- `disabled`: native disabled state

`Button.Icon` (alias of `IconButton`) is the explicit square icon-button entry.

### Usage

```tsx
import { Button, IconButton } from '@deweyou-design/react/button';

<Button>Default</Button>
<Button variant="outlined" color="primary" shape="pill">Primary</Button>
<Button color="danger" loading>Delete</Button>
<Button href="/docs" target="_blank" variant="ghost">Docs</Button>
<IconButton aria-label="Search" icon={<SearchIcon />} variant="outlined" />
<Button.Icon aria-label="Add" icon={<AddIcon />} />
```

## Text

The shared typography primitive. Organized around `variant`, emphasis toggles, palette-backed `color` / `background`, and `lineClamp`.

### Props

- `variant`: `'plain' | 'body' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5'` — defaults to `plain`
- `italic`, `bold`, `underline`, `strikethrough`: composable emphasis toggles
- `color`: one of 26 text color families (`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`, `taupe`, `mauve`, `mist`, `olive`)
- `background`: same 26 families, mapped to highlight shades
- `lineClamp`: positive integer for maximum line count

### Usage

```tsx
import { Text } from '@deweyou-design/react/text';

<Text>Inline text</Text>
<Text variant="body">Body paragraph</Text>
<Text variant="h2">Heading</Text>
<Text bold underline color="blue">Emphasized</Text>
<Text background="amber" color="amber" lineClamp={2} variant="body">
  Highlighted and clamped.
</Text>
```

## Popover

The shared non-modal floating-content primitive. Anchors a panel to one trigger element.

### Props

- `content`: required floating panel content
- `trigger`: `'click' | 'hover' | 'focus' | 'context-menu'` or an array — defaults to `click`
- `placement`: `'top' | 'bottom' | 'left' | 'right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'`
- `visible` / `defaultVisible` / `onVisibleChange`: controlled or uncontrolled open state
- `mode`: `'card' | 'loose' | 'pure'` — defaults to `card`
- `shape`: `'rect' | 'rounded'` — defaults to `rounded`
- `offset`: gap between trigger and panel — defaults to `8`
- `boundaryPadding`: safe distance from viewport — defaults to `16`
- `popupPortalContainer`: custom portal parent
- `disabled`: blocks all opening paths

### Usage

```tsx
import { Button } from '@deweyou-design/react/button';
import { Popover } from '@deweyou-design/react/popover';

<Popover content={<div>Panel content</div>} placement="bottom">
  <Button>Open</Button>
</Popover>

<Popover content={<div style={{ padding: 12 }}>Pure</div>} mode="pure" trigger={['click', 'focus']}>
  <Button variant="outlined">Open</Button>
</Popover>
```

## Menu

The shared dropdown menu primitive.

### Exports

`Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`, `MenuTriggerItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem`, `ContextMenu`

### Usage

```tsx
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@deweyou-design/react/menu';
import { Button } from '@deweyou-design/react/button';

<Menu>
  <MenuTrigger asChild>
    <Button>Actions</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem id="edit">Edit</MenuItem>
    <MenuItem id="copy">Copy</MenuItem>
    <MenuSeparator />
    <MenuItem id="delete">Delete</MenuItem>
  </MenuContent>
</Menu>;
```

## Tabs

The shared tab navigation primitive, with overflow modes and animated indicator.

### Exports

`Tabs`, `TabList`, `TabTrigger`, `TabContent`, `TabIndicator`

### Usage

```tsx
import { TabContent, TabIndicator, TabList, TabTrigger, Tabs } from '@deweyou-design/react/tabs';

<Tabs defaultValue="overview">
  <TabList>
    <TabTrigger value="overview">Overview</TabTrigger>
    <TabTrigger value="details">Details</TabTrigger>
    <TabIndicator />
  </TabList>
  <TabContent value="overview">Overview content</TabContent>
  <TabContent value="details">Details content</TabContent>
</Tabs>;
```

## Theme Contract

- Import `@deweyou-design/styles/theme.css` explicitly in each consuming app.
- `Button` primary / danger / focus and `Text` color / background reuse governed tokens from `@deweyou-design/styles`.

## License

MIT
