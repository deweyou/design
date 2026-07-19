# Number Input Component Design

> Date: 2026-07-19
> Status: Approved from the implementation brief confirmed by the user

## Goal

Add a polished, practical `NumberInput` to `@deweyou-design/react`. The component should make ordinary numeric editing fast while preserving locale-aware formatting, form semantics, keyboard access, validation feedback, and clear min/max boundaries.

## Experience

```text
Field
├── Label
├── Control
│   ├── Decrement button
│   ├── Numeric text input
│   └── Increment button
├── Hint
└── Error
```

- The value remains directly editable; increment and decrement are shortcuts, not the only interaction.
- Arrow Up and Arrow Down step the value through Ark UI behavior.
- Holding a step button may continue stepping through Ark UI's press behavior.
- Step buttons visibly disable at `min` and `max`.
- Blur and Enter commit the current value. By default, blur clamps it to the configured range.
- Invalid field feedback uses the existing `Field` label, hint, error, and ARIA wiring.

## Public API

`NumberInput` is a single high-level component rather than a compound Ark UI facade.

```ts
type NumberInputSize = 'sm' | 'md' | 'lg';
type NumberInputVariant = 'outlined' | 'ghost';

type NumberInputValueChangeDetails = {
  value: string;
  valueAsNumber: number;
};

type NumberInputInvalidDetails = NumberInputValueChangeDetails & {
  reason: 'rangeUnderflow' | 'rangeOverflow';
};
```

The prop surface includes:

- value: `value`, `defaultValue`, `onValueChange`, `onValueCommit`
- range: `min`, `max`, `step`, `precision`, `clampValueOnBlur`, `onValueInvalid`
- formatting: `locale`, `formatOptions`, `inputMode`
- field: `label`, `hint`, `error`, `required`, `disabled`, `readOnly`
- form: `id`, `name`, `form`, `placeholder`
- presentation: `size`, `variant`, `className`, `style`
- accessibility overrides: `incrementLabel`, `decrementLabel`

`precision` is a convenience contract. When present, it supplies both minimum and maximum fraction digits unless either corresponding `formatOptions` field is explicitly set.

The component exposes Deweyou-owned detail types instead of re-exporting Ark UI types. Consumers should not need to know which behavior primitive is used.

## Architecture

- Use `@ark-ui/react/number-input` for numeric parsing, controlled/uncontrolled state, keyboard behavior, stepping, clamping, press-and-hold, form attributes, and ARIA spinbutton semantics.
- Use the existing `Field` component for label, description, error, required, disabled, and generated-id relationships.
- Keep the implementation in `packages/react/src/number-input/` with colocated `index.tsx`, `index.module.less`, and `index.test.tsx`.
- Use `PlusIcon` and `MinusIcon` from `@deweyou-design/react-icons`.

## Visual Direction

- Match the library's neutral surface and border-first field language.
- Use a single connected control with internal dividers, not three floating buttons.
- Use semantic tokens only; no raw palette values, decorative gradients, or new radius/shadow tiers.
- Preserve `sm`, `md`, and `lg` control heights. On coarse pointers, step buttons reach the shared minimum touch target without inflating desktop density.
- Focus belongs to the whole connected control while the input retains correct focus semantics.
- Error wins over focus border color. Disabled and read-only remain visually distinct.
- Motion is limited to fast color/background transitions and respects reduced motion.

## Accessibility

- The input renders as an accessible spinbutton through Ark UI.
- A visible label is connected to the input; label-less usage must provide `aria-label` or `aria-labelledby` through the public props.
- Hint and error ids remain cumulative in `aria-describedby`.
- Increment and decrement buttons have localized default labels and accept overrides.
- Button disabled states reflect configured boundaries.
- Keyboard and pointer paths are covered in unit tests and Storybook Interaction.

## Delivery Surface

The public component change updates:

- package root and `./number-input` exports
- package/export/docs contract tests
- `README.md`, `README_ZH.md`, and `docs/design/components.md`
- website catalog and Storybook stories
- MCP component catalog and generated website `llms.txt`

## Acceptance Criteria

- Typing, Arrow Up/Down, and step buttons produce the same value-change contract.
- Controlled and uncontrolled examples work.
- `min`, `max`, `step`, precision, formatting, commit, invalid, required, disabled, and read-only behavior are covered.
- The control is usable by keyboard and screen reader and has visible focus, error, disabled, and boundary states.
- The rendered Storybook component is visually verified at desktop and narrow widths.
- Repository checks, tests, Storybook e2e, and build pass.

## Deferred

- Scrubber/drag-to-adjust behavior
- custom prefix/suffix slots and unit pickers
- expression parsing such as `2 * 8`
- compact stacked-chevron layout
