# Deweyou Design

[Chinese](README_ZH.md) | English

A React-based UI component library with built-in design tokens and theming.

Preview: [design.deweyou.me](https://design.deweyou.me)

## Installation

```bash
npm install @deweyou-design/react @deweyou-design/styles
```

Install the icon package separately when icons are needed:

```bash
npm install @deweyou-design/react-icons
```

Install the MCP package when AI agents or MCP-capable tools need structured component, style, and icon context:

```bash
npm install @deweyou-design/mcp
```

Install the React package when rich text editing, adapters, and editor plugins are needed:

```bash
npm install @deweyou-design/react
```

## Quick Start

**1. Import theme styles**

Import the global theme at the top of your application entry file, such as `main.tsx`:

```ts
import '@deweyou-design/styles/theme.css';
```

Production sites can enable `fontSubset` in Vite when font subsetting is needed:

```ts
import { fontSubset } from '@deweyou-design/styles/unplugin-font-subset';

export default {
  plugins: [
    fontSubset.vite({
      scan: { include: ['src/**/*.{ts,tsx,md,mdx}'] },
      inject: true,
      fullFonts: 'idle',
    }),
  ],
};
```

`inject: true` automatically injects subset font CSS. `fullFonts: 'idle'` asynchronously loads stable, versioned full-font URLs after the page becomes idle, which lets repeat visits hit the browser cache.

**2. Use components**

```tsx
import { Button, Input } from '@deweyou-design/react';

export default function App() {
  return <Button>Hello</Button>;
}
```

## Import Paths

**Root imports** work for most usage. Tree-shaking bundlers such as Vite, Webpack 5, and Rollup remove unused components:

```ts
import { Button, Input } from '@deweyou-design/react';
```

**Subpath imports** are useful when bundle output size needs stricter control:

```ts
import { Button } from '@deweyou-design/react/button';
import { DatePicker } from '@deweyou-design/react/date-picker';
import { DateRangePicker } from '@deweyou-design/react/date-range-picker';
import { Input } from '@deweyou-design/react/input';
import { NumberInput } from '@deweyou-design/react/number-input';
import { ConfigProvider } from '@deweyou-design/react/config-provider';
```

Each component's styles load automatically with its JS import, so no separate CSS import is needed. To load all component styles at once, such as in SSR:

```ts
import '@deweyou-design/react/style.css';
```

## Icons

The icon package wraps [Tabler Icons](https://tabler.io/icons) with a consistent stroke style: square caps and miter joins.

```tsx
import { SearchIcon, TrashIcon, PlusIcon } from '@deweyou-design/react-icons';

<SearchIcon />
<SearchIcon size={20} stroke={2} />
<SearchIcon aria-label="Search" />  {/* Visible to assistive technology when aria-label is present */}
```

**Props**

| Prop         | Type               | Default | Description                                                    |
| ------------ | ------------------ | ------- | -------------------------------------------------------------- |
| `size`       | `number \| string` | `'1em'` | Icon size                                                      |
| `stroke`     | `number`           | `1.5`   | Stroke width                                                   |
| `className`  | `string`           | -       | Custom class name                                              |
| `aria-label` | `string`           | -       | Makes the icon visible to assistive technologies when provided |

**Built-in icons**

`AlertCircle` · `AlertTriangle` · `ArrowLeft` · `ArrowRight` · `Bell` · `Check` · `ChevronDown` · `ChevronLeft` · `ChevronRight` · `ChevronUp` · `Copy` · `Download` · `Edit` · `ExternalLink` · `Eye` · `EyeOff` · `Filter` · `Home` · `Info` · `Loader2` · `Menu2` · `Minus` · `Plus` · `Refresh` · `Search` · `Settings` · `Trash` · `Upload` · `User` · `X`

Wrap additional Tabler icons with `createTablerIcon` when needed:

```ts
import { createTablerIcon } from '@deweyou-design/react-icons';
import { IconRocket } from '@tabler/icons-react';

export const RocketIcon = createTablerIcon(IconRocket);
```

## Editor

`@deweyou-design/react` provides the `Editor` component, core editor contracts,
official plugins, adapters, and utilities. The first official adapter is
`markdownEditorAdapter()`, and Markdown-style authoring behavior is provided by
`markdownShortcutPlugin()`. Rich text controls stay pluggable through
`toolbarPlugin()`.

## Localization

`ConfigProvider` supplies a typed locale code to descendant components. The default and fallback
locale is `en-US`; browser locale detection is intentionally left to the application. This release
also supports `zh-CN`, `zh-TW`, `ja-JP`, and `ko-KR`.

English dictionaries are synchronous. Every other dictionary is colocated with its component and
loaded lazily, so applications should own the `Suspense` fallback for the first uncached render.
Already revealed content remains visible while a runtime locale switch loads.

```tsx
import { Suspense } from 'react';
import { ConfigProvider, Pagination } from '@deweyou-design/react';

<Suspense fallback={<span>Loading locale…</span>}>
  <ConfigProvider locale="zh-CN">
    <Pagination count={100} />
    <Pagination count={100} localeText={{ previous: 'Back' }} />
  </ConfigProvider>
</Suspense>;
```

`ConfigProvider` does not expose `localeText`. Override copy on the component or Editor plugin that
owns it, such as `Pagination`, `codePlugin()`, or `toolbarPlugin()`.

## Components

| Component               | Description                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `Button`                | Button with multiple variants and sizes                                                      |
| `Input`                 | Single-line text input                                                                       |
| `DatePicker`            | Date, month, year, or optional date-time field with time wheels, Today/Now, and confirmation |
| `DateRangePicker`       | One contiguous date, month, year, or date-time range in a unified two-input field            |
| `NumberInput`           | Numeric input with step controls, formatting, and range constraints                          |
| `Textarea`              | Multi-line text input                                                                        |
| `Select`                | Select dropdown                                                                              |
| `Checkbox`              | Checkbox                                                                                     |
| `RadioGroup`            | Radio group                                                                                  |
| `Switch`                | Switch                                                                                       |
| `Badge`                 | Status badge                                                                                 |
| `Text`                  | Typographic text                                                                             |
| `ConfigProvider`        | Shared locale configuration boundary                                                         |
| `Editor`                | Rich text editor surface with adapters and plugins                                           |
| `ImagePreview`          | Modal image preview with zoom and gallery navigation                                         |
| `ImageMasonry`          | Responsive image masonry layout with fixed or fluid columns                                  |
| `GroupedVirtualMasonry` | Grouped virtual masonry renderer for long image sections                                     |
| `Card`                  | Card container                                                                               |
| `Separator`             | Separator                                                                                    |
| `Skeleton`              | Loading placeholder                                                                          |
| `Spinner`               | Loading indicator                                                                            |
| `Breadcrumb`            | Breadcrumb navigation                                                                        |
| `Tabs`                  | Tabs                                                                                         |
| `Pagination`            | Pagination                                                                                   |
| `Menu`                  | Dropdown menu / context menu                                                                 |
| `Popover`               | Popover                                                                                      |
| `Tooltip`               | Tooltip                                                                                      |
| `Dialog`                | Modal dialog                                                                                 |
| `Toast`                 | Toast notification                                                                           |
| `ScrollArea`            | Custom scrollbar container                                                                   |
| `VirtualList`           | Virtualized list with dynamic document heights and anchor scrolling                          |
| `VirtualMasonry`        | Virtualized masonry renderer for long irregular image collections                            |

Interactive controls use the shared visible-height ladder `24 / 32 / 40 / 48 / 56px`.
Component `sm / md / lg` sizes map to `32 / 40 / 48px`; coarse-pointer environments retain a
minimum `44px` target without forcing desktop controls to look oversized.

## Theme Customization

Component styles are implemented with CSS custom properties, the design tokens. After importing `theme.css`, override any token as needed:

```css
:root {
  --ui-color-brand-bg: #6366f1;
  --ui-radius-rect: 6px;
}
```

See `@deweyou-design/styles` for the full token list.

## AI / MCP

The public website exposes `/llms.txt` for LLM-oriented package context. MCP-capable clients can add the stdio server with a client config such as:

```json
{
  "mcpServers": {
    "deweyou-design": {
      "command": "npx",
      "args": ["-y", "@deweyou-design/mcp@latest"]
    }
  }
}
```

The MCP server exposes read-only resources and tools for components, style entrypoints, icon exports, and import snippets. The installable agent skill is a separate entrypoint:

```bash
npx skills add https://github.com/deweyou/design/tree/main/skills/deweyou-design-components -g -a codex
```
