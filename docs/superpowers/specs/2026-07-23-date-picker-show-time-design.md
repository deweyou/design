# DatePicker showTime Design

> Date: 2026-07-23
> Status: Approved by the user
> Supersedes: the standalone DateTimePicker public boundary in
> `2026-07-22-date-picker-design.md`

## Goal

Extend `DatePicker` with date-time selection through
`showTime?: boolean | DatePickerTimeOptions` while preserving the existing
date-only contract when time is disabled.

## Public Contract

`DatePickerProps` is a discriminated union:

- `showTime` absent or false uses `CalendarDate` for values, constraints,
  callbacks, format, and parse.
- `showTime` true or an options object uses timezone-free `CalendarDateTime`
  for the same surfaces.
- Time-enabled selection only supports `mode="date"`.

`DatePickerTimeOptions` supports:

- `defaultTime?: Time`
- `hourCycle?: 12 | 24`
- `granularity?: 'minute' | 'second'`
- `hourStep?: number`
- `minuteStep?: number`
- `secondStep?: number`
- `showNow?: boolean`
- `isTimeUnavailable?: (value: CalendarDateTime) => boolean`

Boolean `showTime` uses locale-derived hour cycle, minute precision, one-unit
steps, and `00:00` when the first calendar date is selected from an empty value.
No implicit time zone is attached.

The not-yet-released standalone `DateTimePicker` export is removed so the
library has one canonical date and date-time entrypoint.

## Interaction

- The closed field supports direct date-time text entry.
- Opening copies the committed date-time into a draft.
- Calendar selection preserves draft time and keeps the popup open.
- The calendar footer exposes the draft time as a view trigger.
- Activating the trigger replaces the calendar grid with hour, minute, optional
  second, and optional AM/PM scrollable listboxes inside the same popup.
- The time view has an explicit return-to-calendar action.
- When `showNow` is enabled, the time view footer exposes a localized Now
  action. It applies the nearest stepped local wall-clock time to the selected
  date without committing or changing that date.
- Now is disabled when the resolved draft violates date-time constraints.
- Time-wheel selections update only the draft.
- Confirm commits once and closes.
- Escape or outside dismissal discards the draft.
- Today changes the draft date, preserves its time, and still waits for
  confirmation.

## Visual Direction

- Preserve the existing `sm`, `md`, and `lg` popup widths.
- Keep the calendar and time wheel as progressive views rather than adjacent
  panels.
- Use a quiet divider footer with optional Today, the time-view trigger, and a
  compact primary Confirm action.
- Time columns use restrained listbox rows, neutral dividers and scrollbars,
  primary text for selection, and existing semantic tokens only.
- Fine pointers keep compact density; coarse pointers retain 44px targets.

## Accessibility

- Ark DatePicker owns disclosure, calendar keyboard behavior, focus restoration,
  date parsing, and ARIA.
- Ark Listbox owns each time column's option semantics, selection, typeahead,
  and vertical keyboard navigation.
- Tab moves between time columns; the visible back action restores the calendar
  path.
- Disabled times remain in the wheel and are announced as disabled.
- Reduced motion removes nonessential view movement.

## Acceptance Criteria

- TypeScript rejects `CalendarDateTime` in date-only props and `CalendarDate` in
  time-enabled props.
- TypeScript rejects `showTime` with month or year mode.
- Minute and second precision, steps, hour cycle, default time, unavailable
  times, min/max, Today, optional Now, clear, and controlled/uncontrolled state
  are covered.
- Calendar and time edits do not emit before Confirm.
- Dismissal restores the committed value.
- The time wheel is keyboard-operable and does not widen the popup.
- Storybook includes boolean and configured `showTime` cases plus an Interaction
  path that enters the wheel and confirms a changed time.
- Package exports, website catalog, docs, MCP metadata, README tables, and
  `llms.txt` describe the unified DatePicker surface.

## Deferred

- Standalone TimePicker
- Zoned date-time values and time-zone UI
- Date-time range selection
- Preset time groups
