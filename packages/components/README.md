# components

Reusable UI components with explicit theme imports and package-owned interaction rules.

## Public Entrypoints

- `@deweyou-ui/components`: exports `Button`, `ButtonProps`, `IconButton`, and `IconButtonProps`.
- `Button` and `IconButton` both forward refs to the underlying root DOM node: `HTMLButtonElement`
  by default, `HTMLAnchorElement` when `href` is present.

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
- Button reuses the documented public color tokens:
  `--ui-color-brand-bg`, `--ui-color-brand-bg-hover`, `--ui-color-brand-bg-active`,
  `--ui-color-text-on-brand`, `--ui-color-danger-bg`, `--ui-color-danger-bg-hover`,
  `--ui-color-danger-bg-active`, `--ui-color-danger-text`, `--ui-color-text-on-danger`,
  `--ui-color-focus-ring`, and `--ui-color-link`.
- `neutral` color mode stays on library-owned monochrome surfaces; `primary` and `danger` are the
  explicit semantic opt-in paths for accent and destructive emphasis.
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
