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
import { Input } from '@deweyou-design/react/input';
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

## Components

| Component     | Description                                          |
| ------------- | ---------------------------------------------------- |
| `Button`      | Button with multiple variants and sizes              |
| `Input`       | Single-line text input                               |
| `Textarea`    | Multi-line text input                                |
| `Select`      | Select dropdown                                      |
| `Checkbox`    | Checkbox                                             |
| `RadioGroup`  | Radio group                                          |
| `Switch`      | Switch                                               |
| `Badge`       | Status badge                                         |
| `Text`        | Typographic text                                     |
| `Card`        | Card container                                       |
| `Separator`   | Separator                                            |
| `Skeleton`    | Loading placeholder                                  |
| `Spinner`     | Loading indicator                                    |
| `Breadcrumb`  | Breadcrumb navigation                                |
| `Tabs`        | Tabs                                                 |
| `Pagination`  | Pagination                                           |
| `Menu`        | Dropdown menu / context menu                         |
| `Popover`     | Popover                                              |
| `Tooltip`     | Tooltip                                              |
| `Dialog`      | Modal dialog                                         |
| `Toast`       | Toast notification                                   |
| `ScrollArea`  | Custom scrollbar container                           |
| `VirtualList` | Virtualized list with long-document anchor scrolling |

## Theme Customization

Component styles are implemented with CSS custom properties, the design tokens. After importing `theme.css`, override any token as needed:

```css
:root {
  --ui-color-brand-bg: #6366f1;
  --ui-radius-rect: 6px;
}
```

See `@deweyou-design/styles` for the full token list.
