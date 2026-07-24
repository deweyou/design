# DatePicker showTime Implementation Plan

## 1. Public types and value helpers

- Add the discriminated date-only and date-time prop branches.
- Add time option, date-time format/parse, change-detail, and parser exports.
- Dispatch `DatePicker` to a focused internal time-enabled implementation.

## 2. Time-enabled behavior

- Reuse Ark DatePicker for the field, calendar, disclosure, and draft date.
- Add controlled/uncontrolled committed and draft date-time state.
- Apply default time, precision, min/max, and unavailable-time validation.
- Preserve transactional Confirm, Today, clear, Escape, and outside dismissal.

## 3. In-panel time wheel

- Build hour, minute, optional second, and optional AM/PM columns with Ark
  Listbox.
- Add the calendar/footer time trigger and explicit return path.
- Add the opt-in localized Now action, nearest-step resolution, and unavailable
  state without bypassing Confirm.
- Apply shared density, focus, scrollbar, pointer, dark-mode, and reduced-motion
  contracts without widening the popup.

## 4. Consolidate the public surface

- Remove the standalone DateTimePicker source, export, story, catalog entry,
  docs entry, MCP record, package subpath, and contract assertions.
- Rewrite examples around `DatePicker showTime`.

## 5. Verification

- Add focused behavior, type, style, and Storybook Interaction coverage.
- Run `vp check`, `vp test`, `vp run storybook#test`, and `vp run build -r`.
- Inspect date view, time wheel, 12/24-hour, seconds, sizes, dark theme, keyboard,
  narrow viewport, and dismissal behavior in live Storybook.
