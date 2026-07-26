# Input Clear Action Design

## Goal

Give `Input` and `NumberInput` the same opt-in empty-state affordances: native placeholder text and a compact clear action that preserves each component's existing value contract.

## Public Contract

- Both components accept `placeholder`.
- Both components accept `clearable?: boolean`, defaulting to `false`.
- `Input` accepts `localeText?: Partial<InputLocaleText>` with `clearInput`.
- `NumberInputLocaleText` includes `clearValue`.
- The clear action is rendered only while a non-empty, editable value is present.
- Clearing uses `Input.onChange` or `NumberInput.onValueChange` respectively and restores focus to the input.
- Disabled and read-only values never expose the clear action.

## Interaction And Visual Direction

The action lives inside the control's trailing edge without changing the field's external dimensions. It uses the shared X icon, semantic color tokens, the component's existing size ladder, and a minimum coarse-pointer target. Placeholder text remains visible after clearing.

The clear button has a localized accessible name in every supported component locale. It stays keyboard reachable, and pointer activation prevents an intermediate input blur.

## Architecture

`Input` owns a small controlled/uncontrolled value tracker so the clear affordance follows native input state while dispatching the same bubbling input event used by normal editing. `NumberInput` delegates state changes to Ark UI's number-input context so parsing, formatting, and consumer callbacks retain one owner.

## Acceptance Criteria

- Placeholder and clearable props are represented in public types, Storybook controls, component catalogs, docs, and agent guidance.
- Unit tests cover clearing, focus restoration, callback delivery, and disabled/read-only hiding.
- Storybook Interaction covers the complete pointer path for both components.
- Repository checks, tests, Storybook e2e, and build pass.
