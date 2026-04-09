# @deweyou-design/react-icons

Generated React icon components for Deweyou Design, sourced from TDesign icons.

## Installation

```bash
npm install @deweyou-design/react-icons
```

## Usage

### Subpath imports (recommended)

Use per-icon subpath imports for the strongest tree-shaking and immediate render:

```tsx
import { AddIcon } from '@deweyou-design/react-icons/add';
import { ChevronRightIcon } from '@deweyou-design/react-icons/chevron-right';
import { SearchIcon } from '@deweyou-design/react-icons/search';

<AddIcon />
<ChevronRightIcon size="small" />
<SearchIcon label="Search" size="large" />
```

### Generic `Icon` component

Use the generic `Icon` component only when the icon name is determined at runtime. This path lazy-loads the matching definition:

```tsx
import { Icon } from '@deweyou-design/react-icons';

<Icon name="search" size="large" />
<Icon label="Open menu" name="menu" />
```

## Props

| Prop        | Type                                                                         | Description                                                                                     |
| ----------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `size`      | `number \| 'extra-small' \| 'small' \| 'medium' \| 'large' \| 'extra-large'` | Icon size. Defaults to `1em` when omitted.                                                      |
| `label`     | `string`                                                                     | Accessible name. When set, renders with `role="img"`. When omitted, renders with `aria-hidden`. |
| `className` | `string`                                                                     | Primary styling hook.                                                                           |
| `style`     | `CSSProperties`                                                              | Inline override for size, color, and layout.                                                    |

Named sizes: `extra-small` = 12px, `small` = 14px, `medium` = 16px, `large` = 20px, `extra-large` = 24px.

## Accessibility

- Icons with `label` expose an accessible name and `role="img"`.
- Icons without `label` render as decorative (`aria-hidden="true"`).
- Icons are not keyboard-focusable by default; the surrounding interactive control owns the label.

## Updating Icons

After updating `tdesign-icons-svg`, regenerate the icon package from the repository root:

```bash
vp run generate --filter @deweyou-design/react-icons
```

## Source Attribution

SVG assets are sourced from `tdesign-icons-svg` under the MIT license. Deweyou Design owns the public icon naming, package API, and accessibility behavior.

## License

MIT
