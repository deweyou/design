# components

Reusable UI components with explicit theme imports and package-owned interaction rules.

## Public Entrypoints

- `@deweyou-ui/components`: exports `Button` and the `ButtonProps` type.

## Button

`Button` is the shared action primitive for Deweyou UI. The public API is organized around
`variant`, `color`, `size`, and `shape`, while native button semantics stay intact.

### Props

- `variant`: `'filled' | 'outlined' | 'ghost' | 'link'`
- `color`: `'neutral' | 'primary'`
- `size`: `'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'`
- `shape`: `'rect' | 'rounded' | 'pill'`
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
- Any Button without visible text must provide `aria-label` or `aria-labelledby`.
- Icon graphics are content, not a dedicated `variant`. Pure icon buttons still follow the same
  accessible-name rule.
- Invalid `shape` combinations throw descriptive runtime errors instead of silently falling back.

### Usage

```tsx
import { Button, type ButtonProps } from '@deweyou-ui/components';

const primaryProps: ButtonProps = {
  color: 'primary',
  shape: 'pill',
  variant: 'filled',
};

<Button {...primaryProps}>Publish</Button>;
<Button variant="outlined" shape="rect">
  Review
</Button>;
<Button variant="ghost">Toolbar action</Button>;
<Button color="primary" variant="link">
  Read the docs
</Button>;
<Button aria-label="Open search">
  <SearchIcon />
</Button>;
```

## Migration Notes

This Button refactor is a breaking public API change for `@deweyou-ui/components`.

- Replace `FoundationButton` with `Button`
- Replace `FoundationButtonProps` with `ButtonProps`
- Replace `label="Save"` with `<Button>Save</Button>` as the preferred usage
- Replace any old icon-only variant usage with standard `Button` content plus `aria-label`
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
vp run website#build
```
