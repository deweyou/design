# components

Reusable UI components with explicit theme imports and package-owned interaction rules.

## Public Entrypoints

- `@deweyou-ui/components`: exports `Button`, `ButtonProps`, `IconButton`, `IconButtonProps`, `Popover`, `PopoverProps`, `Text`, and `TextProps`.
- `Button` and `IconButton` both forward refs to the underlying root DOM node: `HTMLButtonElement`
  by default, `HTMLAnchorElement` when `href` is present.

## Text

`Text` is the shared typography primitive for Deweyou UI. The public API is organized around
`variant`, four composable emphasis toggles, palette-backed `color` / `background`, and
`lineClamp`, while standard node props continue to pass through to the rendered root element.

### Props

- `variant`: `'plain' | 'body' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5'`
- `italic`: toggles italic presentation
- `bold`: toggles stronger font weight
- `underline`: toggles underline emphasis
- `strikethrough`: toggles line-through emphasis
- `color`: one of the documented 26 text color families, mapped to theme-owned text shades
- `background`: one of the documented 26 highlight families, mapped to theme-owned highlight shades
- `lineClamp`: positive integer maximum line count; invalid values are treated as unset
- Standard node props such as `className`, `style`, `id`, `title`, `role`, `tabIndex`, `aria-*`,
  `data-*`, and event handlers remain supported.

### Variant Defaults

- `plain`: default inline text on `<span>`
- `body`: body copy on `<div>`
- `caption`: smaller, weaker supporting copy on `<div>`
- `h1` to `h5`: heading tiers on native `<h1>` to `<h5>`

### Emphasis And Clamping

- `italic`, `bold`, `underline`, and `strikethrough` can be combined freely.
- `color` and `background` only accept the documented 26 families:
  `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`,
  `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`,
  `stone`, `taupe`, `mauve`, `mist`, and `olive`.
- `color` and `background` never expose raw `50`-`950` steps; the theme maps each family to a
  deeper text shade and a lighter or darker highlight shade depending on the current theme.
- `lineClamp` only activates for positive integers.
- When `lineClamp` is valid, Text keeps the requested maximum line count and clips overflow with an
  ellipsis-style truncation treatment.
- When `lineClamp` is omitted or invalid, Text renders natural-length content with no truncation.

### Usage

```tsx
import { Text, type TextProps } from '@deweyou-ui/components';

const captionProps: TextProps = {
  variant: 'caption',
  italic: true,
};

<Text>默认行内文本</Text>;
<Text variant="body">块级正文段落</Text>;
<Text variant="caption" {...captionProps}>
  说明文字会比正文更弱。
</Text>;
<Text variant="h2">原生标题层级</Text>;
<Text bold underline>
  组合强调
</Text>;
<Text background="amber" bold color="amber">
  色卡高亮
</Text>;
<Text lineClamp={2} variant="body">
  这是一段很长的文本，用于验证 lineClamp 在公开组件中的最大行数限制行为。
</Text>;
```

## Button

`Button` is the shared action primitive for Deweyou UI. The public API is organized around
`variant`, `color`, `size`, `shape`, and the explicit `icon` slot, while native button semantics
stay intact.

### Props

- `variant`: `'filled' | 'outlined' | 'ghost' | 'link'`
- `color`: `'neutral' | 'primary' | 'danger'`
- `size`: `'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`
- `shape`: `'rect' | 'rounded' | 'pill'`
- `icon`: explicit graphic slot for mixed-content Button usage
- `htmlType`: documented alias for the native button `type`
- `href`: when provided, the root element renders as `<a>` so link activation works natively
- `target`: only valid together with `href`
- `loading`: prepends the built-in spinner, blocks repeated activation, and keeps disabled-like visuals without the disabled cursor
- `disabled`: native button disabled state
- Native button props such as `type`, `onClick`, `onClickCapture`, and `aria-*` remain supported.

`shape` is only supported by `filled` and `outlined`. Passing `shape` to `ghost` or `link` throws
a descriptive runtime error instead of silently doing nothing.

`color` defaults to `neutral`, which keeps every variant monochrome. Set `color="primary"` to opt
into theme accent color for filled backgrounds, outlined borders, ghost hover backgrounds, and link
text / underline styling. Set `color="danger"` when the action is destructive but should keep the
same `variant` behavior and shape rules.

### Native Semantics And Loading

- `htmlType` wins over the native `type` prop when both are provided.
- `href` switches the root element to `<a>`; without `href`, the component renders a real
  `<button>`.
- `target` requires `href`; passing `target` alone throws a descriptive runtime error.
- `htmlType` only affects the `<button>` path and is ignored when `href` is present.
- `loading` keeps visible button text in place, replaces icon-only content with the spinner, adds
  `aria-busy`, and blocks activation by resolving to the disabled interaction path.
- `loading` intentionally keeps the regular pointer cursor instead of `not-allowed`.
- `ref` resolves to the rendered root node.

### Variants

- `filled`: default primary action, supports `rect`, `rounded`, and `pill`
- `outlined`: secondary action, supports `rect`, `rounded`, and `pill`; its border starts at a
  lower chroma and eases into the text color on hover
- `ghost`: lightweight action with background hover feedback, does not support `shape`
- `link`: lightweight action with a left-to-right underline reveal on hover, does not support
  `shape`

### Sizes

- `extra-small`
- `small`
- `medium` (default)
- `large`
- `extra-large`

### Defaults

- `variant="filled"`
- `color="neutral"`
- `size="medium"`
- `shape="rounded"` for `filled` and `outlined`

### Accessibility

- `Button` keeps native root semantics: `<button>` by default, `<a>` when `href` is present.
- `loading` adds `aria-busy` while preserving button semantics and the existing accessible name.
- `Button` with visible text can add graphics through `icon` or mixed children without turning into
  a square icon button.
- Hover feedback is an enhancement for pointer users only; keyboard users still rely on the shared
  focus-visible ring, and disabled buttons do not expose hover affordances.
- Button no longer infers square icon-button mode from graphic-only `children`.
- Use `IconButton` or `Button.Icon` for explicit icon-only actions, and provide `aria-label` or
  `aria-labelledby`.
- Invalid `shape` combinations throw descriptive runtime errors instead of silently falling back.

### Usage

```tsx
import { useRef } from 'react';
import { Button, IconButton, type ButtonProps, type IconButtonProps } from '@deweyou-ui/components';

const primaryProps: ButtonProps = {
  color: 'primary',
  icon: <SearchIcon />,
  shape: 'pill',
  variant: 'outlined',
};

const iconButtonProps: IconButtonProps = {
  'aria-label': 'Open search',
  color: 'danger',
  icon: <SearchIcon />,
  loading: true,
  variant: 'outlined',
};

const reviewRef = useRef<HTMLButtonElement>(null);

<Button {...primaryProps}>Search</Button>;
<Button variant="outlined" shape="rect">
  Review
</Button>;
<Button htmlType="submit" ref={reviewRef}>
  Submit changes
</Button>;
<Button variant="ghost">Toolbar action</Button>;
<Button color="danger" loading>
  Delete item
</Button>;
<Button href="/docs/button" target="_blank" variant="ghost">
  Open docs
</Button>;
<Button color="primary" variant="link">
  Read the docs
</Button>;
<IconButton {...iconButtonProps} />;
<Button.Icon aria-label="Add item" icon={<AddIcon />} />;
```

## IconButton

`IconButton` is the explicit square icon-button entry. It keeps the same `color`, `size`, and
supported `shape` semantics as Button where applicable, but only supports `filled`, `outlined`,
and `ghost`.

- `variant`: `'filled' | 'outlined' | 'ghost'`
- `color`: `'neutral' | 'primary' | 'danger'`
- `size`: `'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`
- `shape`: `'rect' | 'rounded' | 'pill'` for `filled` and `outlined`
- `icon`: required graphic content
- `loading`: replaces the original icon with the built-in spinner
- `aria-label` / `aria-labelledby`: required accessible name source

`Button.Icon` is an alias of `IconButton`, not a separate implementation.

## Popover

`Popover` is the shared non-modal floating-content primitive for Deweyou UI. It anchors content to
one trigger element, defaults to `click`, and keeps positioning, fallback, arrow, animation, and
portal behavior inside `packages/components`.

### Props

- `content`: required floating panel content
- `trigger`: `'click' | 'hover' | 'focus' | 'context-menu'` or an array; defaults to `click`
- `placement`: `'top' | 'bottom' | 'left' | 'right' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'`
- `visible`: controlled open state
- `defaultVisible`: uncontrolled initial open state
- `onVisibleChange`: visibility callback with a second `{ reason, event? }` payload
- `mode`: `'card' | 'loose' | 'pure'`, defaults to `card`
- `shape`: `'rect' | 'rounded'`, defaults to `rounded`
- `offset`: gap between the trigger and the panel, defaults to `8`
- `boundaryPadding`: safe distance from viewport or clipping boundaries, defaults to `16`
- `popupPortalContainer`: custom portal parent node
- `overlayClassName` / `overlayStyle`: pass-through props for the floating overlay node
- `disabled`: blocks all opening paths
- Standard trigger-root props such as `className`, `style`, `id`, `title`, `data-*`, `aria-*`,
  and event handlers like `onClick` continue to pass through to the trigger element.

### Behavior

- Popover is non-modal by default and must not become a small Dialog replacement.
- Internal panel clicks keep the Popover open unless the consuming content closes it explicitly.
- `Escape` and outside press close the panel.
- When closed from keyboard or dismissal paths, focus returns to the trigger element.
- Multiple Popover instances stay independent; opening one does not implicitly close another.
- Placement can fall back when the preferred side lacks space, but the public placement vocabulary
  remains the documented eight options only.

### Usage

```tsx
import { Button, Popover, type PopoverProps } from '@deweyou-ui/components';

const reviewPopoverProps: PopoverProps = {
  content: (
    <div>
      <strong>Review changes</strong>
      <p>Popover is non-modal and keeps internal clicks open by default.</p>
    </div>
  ),
  placement: 'right-bottom',
  trigger: ['click', 'focus'],
};

<Popover {...reviewPopoverProps}>
  <Button variant="outlined">Open review</Button>
</Popover>;
<Popover
  content={<div style={{ padding: 12 }}>Pure content can remove inner padding.</div>}
  mode="pure"
  shape="rect"
>
  <Button>Pure popover</Button>
</Popover>;
```

### Accessibility

- The trigger exposes `aria-haspopup="dialog"`, `aria-expanded`, and a stable relationship to the
  floating content node.
- Popover keeps non-modal focus behavior: keyboard users can tab into and out of the content.
- Do not use Popover when the content needs a true focus trap or modal screen-reader isolation;
  use a Dialog instead.
- `disabled` prevents opening and avoids misleading interactive feedback.

## Migration Notes

This Button refactor is a breaking public API change for `@deweyou-ui/components`.

- Replace `FoundationButton` with `Button`
- Replace `FoundationButtonProps` with `ButtonProps`
- Replace `label="Save"` with `<Button>Save</Button>` as the preferred usage
- Replace graphic-only `children` usage like `<Button aria-label="Open search"><SearchIcon /></Button>`
  with `<IconButton aria-label="Open search" icon={<SearchIcon />} />` or `Button.Icon`
- Replace mixed icon/text usage with the explicit `icon` prop when you want a stable leading icon
- Remove any dependency on `buttonCustomizationContract`; it is no longer part of the public API

## Theme Contract

- Import `@deweyou-ui/styles/theme.css` explicitly in each consuming app.
- `Text` 的 `color` / `background` 和 `Button` 的 `primary` / `danger` / `link` / focus 都应复用 `@deweyou-ui/styles` 的共享基础色卡或受治理的语义主题色。
- Button reuses the documented public color tokens:
  `--ui-color-brand-bg`, `--ui-color-brand-bg-hover`, `--ui-color-brand-bg-active`,
  `--ui-color-text-on-brand`, `--ui-color-danger-bg`, `--ui-color-danger-bg-hover`,
  `--ui-color-danger-bg-active`, `--ui-color-danger-text`, `--ui-color-text-on-danger`,
  `--ui-color-focus-ring`, and `--ui-color-link`.
- `neutral` color mode stays on library-owned monochrome surfaces; `primary` and `danger` are the
  explicit semantic opt-in paths for accent and destructive emphasis.
- 非必要不得新增特化 token；如果 Storybook `Color` story 和现有语义主题色已经能覆盖诉求，就不应再扩张组件公开颜色轴。
- Layout, spacing, radius, and typography remain library-owned implementation details for this
  component contract.

## Validation

Run the workspace validation flow from the repository root:

```bash
vp check
vp test
vp run storybook#build
vp run components#build
vp run website#build
```

`apps/website` consumes the package root export from `packages/components/dist`, so refresh the
component package build before validating the website bundle.
