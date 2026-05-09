# @deweyou-design/react-icons

Curated React icon components for Deweyou Design. The package wraps a fixed Tabler icon set so icon geometry, stroke weight, accessibility behavior, and naming stay consistent across components and apps.

## Installation

```bash
npm install @deweyou-design/react-icons
```

## Usage

```tsx
import { CheckIcon, ChevronDownIcon, SearchIcon } from '@deweyou-design/react-icons';

<SearchIcon />
<ChevronDownIcon size={16} />
<CheckIcon aria-label="已选择" />
```

## Props

| Prop         | Type               | Description                                                                                |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------ |
| `size`       | `number \| string` | Icon size. Defaults to `1em`, so icons inherit the surrounding text scale.                 |
| `stroke`     | `number`           | Stroke width. Defaults to `1.5`.                                                           |
| `aria-label` | `string`           | Accessible name. When set, renders with `role="img"`; when omitted, renders as decorative. |
| `className`  | `string`           | Styling hook.                                                                              |
| `style`      | `CSSProperties`    | Inline override for size, color, and layout.                                               |

## Accessibility

- Icons without `aria-label` render with `aria-hidden="true"`.
- Icons with `aria-label` render with `role="img"`.
- Interactive controls should usually own the accessible label; pass `aria-label` to the icon only when the icon itself conveys standalone meaning.

## Icon Set

The public surface is the curated named export list in `src/icons/index.ts`. Additions should be deliberate design-system decisions, not bulk-generated upstream mirrors.

## Source Attribution

Icon glyphs are provided by `@tabler/icons-react` under the MIT license. Deweyou Design owns the package API, naming, and accessibility wrapper behavior.

## License

MIT
