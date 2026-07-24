# Date And Date-Time Picker Component Design

> Date: 2026-07-22
> Updated: 2026-07-23
> Status: Approved by the user

## Goal

Deliver two high-level Ark UI-backed fields:

- `DatePicker` for one calendar date.
- `DateTimePicker` for one calendar date plus minute-precision wall-clock time.

Locale affects presentation and calendar conventions through `ConfigProvider`. Public values remain semantic date objects rather than localized or canonical strings.

## Value Model

```ts
type DatePickerValue = CalendarDate;
type DateTimePickerValue = CalendarDateTime;
```

- `DatePicker` uses `CalendarDate` for `value`, `defaultValue`, `min`, `max`, unavailable-date checks, and callbacks.
- `DateTimePicker` uses `CalendarDateTime` with zero seconds and milliseconds.
- `null` means no selection.
- Strings are serialization and form boundaries only. `parseDatePickerValue` accepts `YYYY-MM-DD`; `parseDateTimePickerValue` accepts `YYYY-MM-DDTHH:mm`.
- Neither component implicitly attaches a time zone. Applications convert `CalendarDateTime` to a zoned instant only when their domain knows the intended zone.
- A standalone `TimePicker`, zoned date-time picker, range picker, and duration picker are separate future contracts.

## DatePicker Experience

```text
Field
├── Label
├── Year-first text control
│   └── Trailing calendar indicator
│       └── Clear action on hover or focus when populated
├── Calendar popup
│   ├── Previous / localized title / next
│   └── Day, month, and year views
├── Hint
└── Error
```

The default `mode="date"` field displays `YYYY/MM/DD`. Users may type that form or use `YYYY-MM-DD` or `YYYY MM DD`; successful edits normalize back to the slash display. Ark UI owns constraints, keyboard navigation, disclosure, focus restoration, and calendar view transitions, while Deweyou owns this default text contract. The title drills into month and year views, and a dedicated back action returns without selecting.

`mode="month"` makes month the selection endpoint while preserving year navigation. It displays `YYYY/MM`, accepts slash, hyphen, or space separators, and normalizes values to the first day of the selected month. `mode="year"` renders the year grid as the only panel, displays `YYYY`, and normalizes values to January 1. The mode is passed to Ark UI as its default and minimum view while year remains the maximum view, preserving Ark-owned grid, focus, keyboard, paging, and ARIA behavior.

Applications may replace the default text representation with paired `format` and `parse` callbacks. The callbacks receive the inherited locale and exchange `CalendarDate`, so customization does not weaken the semantic value contract. Locale controls calendar conventions and component-owned copy but does not reorder the default input. The input surface opens the popup; the trailing calendar glyph is decorative and swaps to the clear action on hover or focus when a selected value can be cleared. An optional Today footer action selects the local calendar day and closes the popup.

## DateTimePicker Experience

```text
Field
├── Label
├── Localized editable date-time segments
│   ├── Clear action
│   └── Calendar trigger
├── Calendar popup
│   ├── Shared day, month, and year views
│   └── Footer
│       ├── Localized Today action
│       ├── Localized time label
│       ├── Localized hour/minute segments
│       └── Localized confirm action
├── Hint
└── Error
```

- Opening copies the committed value into a draft.
- Calendar selection preserves the draft time and keeps the popup open.
- Time editing preserves the draft date.
- Confirm commits once and closes.
- Escape or outside dismissal discards the draft.
- Editing a complete segmented field while closed commits directly.
- An empty calendar selection starts at `00:00`.
- Today changes only the draft date, preserves its time, and does not close before confirmation.

## Public Surface

Both components expose:

- value: `value`, `defaultValue`, `onValueChange`
- disclosure: `open`, `defaultOpen`, `onOpenChange`
- constraints: `min`, `max`, `isDateUnavailable`
- field: `label`, `hint`, `error`, `required`, `disabled`, `readOnly`
- form: `id`, `name`, `form`
- presentation: `mode`, `clearable`, `showToday`, `size`, `variant`, `className`, `style`, `portalContainer`
- accessibility: `aria-label`, `aria-labelledby`
- component copy overrides: `localeText`

`DatePicker` additionally supports its year-first text-input placeholder, browser text-input attributes, and paired `format` / `parse` callbacks. Neither component exposes `locale`, `startOfWeek`, or `fixedWeeks`; ConfigProvider is the only locale boundary, and locale determines the first day of week.

`localeText` uses the exported `DatePickerLocaleTextOverrides` type so consumers
and generated API docs can see every optional copy key. The resolved internal
`DatePickerLocaleText` remains complete.

## Architecture

- Upgrade Ark UI to a version that includes `@ark-ui/react/date-input`.
- Use `@internationalized/date` as a direct public-type dependency.
- Keep a shared private calendar renderer under the DatePicker source unit so both public components use identical day, month, year, header, portal, and visual behavior.
- Use Ark DatePicker for calendar behavior and Ark DateInput for DateTimePicker segment editing.
- Use the repository `Field` contract for labels, descriptions, errors, required, disabled, and generated ids.
- Keep English locale text synchronous and lazy-load the four non-English built-in dictionaries through the existing component-locale loader.

## Visual Direction

- Preserve the approved neutral, border-first field language and semantic tokens.
- Keep the compact raised calendar surface, quiet centered title, hierarchy-back action, ghost choice hover, circular selected outline, today dot, and natural week count.
- Both components may show a compact low-emphasis Today action through `showToday`; DateTimePicker always keeps the time editor and confirm action on its footer surface.
- Date and time segments read as one field; the active segment uses restrained brand tint.
- DatePicker uses one trailing slot: the calendar indicator is decorative, and clear replaces it for a populated clearable field on hover or focus.
- Coarse pointers receive minimum touch targets without inflating desktop density.
- Popup motion respects reduced motion.
- `size` is a shared field-and-panel density contract. Desktop `sm`, `md`, and
  `lg` calendars use 264px, 296px, and 328px surfaces with coordinated calendar
  control geometry; coarse pointers preserve the minimum touch target.

## Accessibility

- Ark UI owns grid and segmented spinbutton semantics, announcements, roving focus, keyboard editing, and popup focus restoration.
- The visible label names the text input or segment group.
- Hint and error ids remain cumulative in `aria-describedby`.
- Icon-only actions and confirmation text use ConfigProvider-owned locale text with optional component overrides.
- Disabled and read-only states block changes while retaining expected focus semantics.

## Delivery Surface

The change updates package root and subpath exports, unit and contract tests, Storybook Interaction coverage, website catalog, READMEs, component docs, MCP metadata, generated `llms.txt`, and repository-owned component skill guidance.

## Acceptance Criteria

- DatePicker emits `CalendarDate | null`; DateTimePicker emits minute-precision `CalendarDateTime | null`.
- Both controlled and uncontrolled modes work.
- DateTimePicker draft selection commits only on confirm and is discarded on dismissal.
- Custom DatePicker text transforms are paired, locale-aware, and preserve `CalendarDate` values.
- Default DatePicker text is displayed as `YYYY/MM/DD`; `/`, `-`, and space separators are accepted and committed text normalizes to slashes.
- DatePicker mode defaults to date; month mode selects first-of-month values with year navigation, and year mode selects January 1 values from a year-only panel.
- Today is hidden by default and appears only with `showToday`; it respects date availability. DatePicker commits and closes, while DateTimePicker preserves draft time and waits for confirmation.
- ConfigProvider drives calendar title formatting, weekday order, first day of week, and component-owned visible copy without changing the default year-first input order.
- Constraints, clearing, disabled, read-only, invalid, month/year navigation, portal placement, and semantic field wiring are covered.
- `size` applies to both the field and its portalled panel, and `localeText`
  exposes a named public override type.
- Storybook examples include an interaction path and no dedicated locale gallery.
- `vp check`, `vp test`, Storybook tests, full build, and live browser verification pass.

## Deferred

- Standalone time selection
- Zoned date-time selection and time-zone UI
- Range and multiple selection
- Seconds and arbitrary minute steps
- Presets, week numbers, alternate calendars, multi-month, and inline layouts
