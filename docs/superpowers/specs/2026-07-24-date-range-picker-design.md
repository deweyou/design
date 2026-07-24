# DateRangePicker Design

Date: 2026-07-24

## Goal

Add a public `DateRangePicker` that selects one contiguous date, month, year, or
date-time range while preserving the existing DatePicker family contracts.

## Public boundary

- Export `DateRangePicker` as its own component and subpath.
- Keep `DatePicker` single-valued. Do not add a `range` or `multiple` union to
  its public props.
- Use `{ start, end }` objects for committed range values.
- Date, month, and year modes use `CalendarDate`; `showTime` uses
  timezone-free `CalendarDateTime` and is valid only in date mode.
- Reuse DatePicker's Field, locale, format/parse, constraint, size, variant,
  portal, Today, time-wheel, Now, controlled/uncontrolled, and draft-confirm
  contracts. Adapt single-value contracts where two endpoints are required.

## Unified field

Render two real indexed inputs inside one Ark DatePicker control:

```text
[ start value ]  -  [ end value ]  [calendar or clear]
```

The control has one border, background, focus ring, error state, and trailing
action. The inputs have no independent borders. Focusing or clicking either
input makes that endpoint active and opens the shared popup. Clear removes both
endpoints.

`format` and `parse` apply to each endpoint. The default year-first parsing and
mode normalization match DatePicker. Native form integration exposes explicit
start and end names.

## Calendar interaction

- Ark UI owns range selection, hover preview, focus, keyboard navigation,
  paging, active input index, and ARIA.
- The first selection starts a draft range; the second completes it.
- Selecting before the current start while choosing the end starts a new range.
- Start and end use the existing circular selected treatment.
- Dates between them use a restrained primary-tint band. Hover preview uses a
  lighter version of the same relationship treatment.
- The panel shows one month by default to preserve the current compact density.
- Date-only range selection commits and closes after the second endpoint.
- Month values normalize to the first day of each selected month. Year values
  normalize to January 1 of each selected year.

## Date-time interaction

- `showTime` is available only with `mode="date"`.
- Date and time edits remain draft until Confirm.
- The footer groups separate start-time and end-time triggers plus Confirm.
  Each trigger visibly stacks its selected date in stable `YYYY/MM/DD` format
  above the time value, while its accessible name retains the localized
  start/end-time meaning. A decorative directional arrow makes the range
  relationship explicit.
- The active endpoint uses a restrained brand outline and text color. Inactive
  endpoints stay neutral so the current editing target is not communicated by
  color alone.
- A time trigger opens the existing wheel with an endpoint-specific title and a
  back path to the calendar.
- Today and Now update only the active endpoint. Now remains opt-in through the
  time options and respects configured steps and constraints.
- Cross-day and same-day ranges are allowed. A complete range is valid only
  when `end >= start`; endpoint time choices that violate this ordering are
  unavailable, and Confirm is disabled while the draft is incomplete or
  invalid.
- Escape or outside dismissal restores the committed range.

## Non-goal

Multiple non-overlapping ranges are outside this task. Do not add multi-range
props, values, field presentation, merge policies, or speculative abstractions.

## Acceptance criteria

- One visual field contains two accessible real inputs and one trailing action.
- Controlled, uncontrolled, clear, disabled, read-only, required, error,
  open-state, format/parse, min/max, unavailable-date, locale text, size,
  variant, portal, and form behavior are covered.
- Date, month, and year modes emit normalized contiguous ranges.
- Date-time range selection supports both endpoint wheels, configured
  granularity and steps, Today, Now, constraints, draft rollback, and Confirm.
- Start and end time meaning remains visible in every supported locale without
  overflowing the compact small panel.
- Range endpoint, interior, hover, today, disabled, unavailable, focus, and
  coarse-pointer states are visually and behaviorally verified.
- Public exports, Storybook, website, MCP catalog, READMEs, `llms.txt`, and
  repository skill guidance are synchronized.
