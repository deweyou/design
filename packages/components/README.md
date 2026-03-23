# components

Reusable UI components with explicit theme imports and package-owned interaction rules.

## Public Entrypoints

- `@deweyou-ui/components`: exports `Button`, `ButtonProps`, `IconButton`, and `IconButtonProps`.

## Button

`Button` is the shared action primitive for Deweyou UI. The public API is organized around
`variant`, `color`, `size`, `shape`, and the explicit `icon` slot, while native button semantics
stay intact.

### Props

- `variant`: `'filled' | 'outlined' | 'ghost' | 'link'`
- `color`: `'neutral' | 'primary'`
- `size`: `'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`
- `shape`: `'rect' | 'rounded' | 'pill'`
- `icon`: explicit graphic slot for mixed-content Button usage
- `disabled`: native button disabled state
- Native button props such as `type`, `onClick`, and `aria-*` remain supported.

`shape` is only supported by `filled` and `outlined`. Passing `shape` to `ghost` or `link` throws
a descriptive runtime error instead of silently doing nothing.

`color` defaults to `neutral`, which keeps every variant monochrome. Set `color="primary"` to opt
into theme accent color for filled backgrounds, outlined borders, ghost hover backgrounds, and link
text / underline styling.

### Variants

- `filled`: default primary action, supports `rect`, `rounded`, and `pill`
- `outlined`: secondary action, supports `rect`, `rounded`, and `pill`
- `ghost`: lightweight action with background hover feedback, does not support `shape`
- `link`: lightweight action with underline hover feedback, does not support `shape`

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

- `Button` keeps native `<button>` semantics, so keyboard activation and disabled behavior come
  from the platform instead of a custom role layer.
- `Button` with visible text can add graphics through `icon` or mixed children without turning into
  a square icon button.
- Button no longer infers square icon-button mode from graphic-only `children`.
- Use `IconButton` or `Button.Icon` for explicit icon-only actions, and provide `aria-label` or
  `aria-labelledby`.
- Invalid `shape` combinations throw descriptive runtime errors instead of silently falling back.

### Usage

```tsx
import { Button, IconButton, type ButtonProps, type IconButtonProps } from '@deweyou-ui/components';

const primaryProps: ButtonProps = {
  color: 'primary',
  icon: <SearchIcon />,
  shape: 'pill',
  variant: 'filled',
};

const iconButtonProps: IconButtonProps = {
  'aria-label': 'Open search',
  icon: <SearchIcon />,
  variant: 'outlined',
};

<Button {...primaryProps}>Search</Button>;
<Button variant="outlined" shape="rect">
  Review
</Button>;
<Button variant="ghost">Toolbar action</Button>;
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
- `color`: `'neutral' | 'primary'`
- `size`: `'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`
- `shape`: `'rect' | 'rounded' | 'pill'` for `filled` and `outlined`
- `icon`: required graphic content
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
  `--ui-color-text-on-brand`, `--ui-color-focus-ring`, and `--ui-color-link`.
- `neutral` color mode stays on library-owned monochrome surfaces; `primary` is the explicit opt-in
  path for theme accent color.
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
