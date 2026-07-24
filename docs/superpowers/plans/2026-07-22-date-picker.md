# Date And Date-Time Picker Implementation Plan

**Goal:** Deliver the approved semantic DatePicker and minute-precision DateTimePicker across runtime code, tests, Storybook, website, docs, exports, MCP context, and agent guidance.

### Task 1: Lock the semantic contracts with tests

- Change DatePicker tests from strings to `CalendarDate`.
- Add DateTimePicker tests for localized segments, draft selection, confirm, dismissal, clearing, and ConfigProvider locale text.
- Confirm the tests fail at the missing API boundary before implementation.

### Task 2: Upgrade behavior dependencies

- Upgrade `@ark-ui/react` to the DateInput-capable release.
- Add aligned `@internationalized/date` as a direct dependency.
- Extend workspace boundary tests.

### Task 3: Refactor the shared calendar

- Move the approved day, month, year, header, and portal renderer into a private shared file.
- Add ConfigProvider-backed calendar locale text dictionaries.
- Preserve the approved visual and accessibility behavior.

### Task 4: Implement semantic DatePicker

- Expose `CalendarDate | null`.
- Remove component `locale`, `startOfWeek`, and `fixedWeeks` props.
- Add the package-owned canonical parsing helper and localized `localeText` overrides.
- Run focused tests.

### Task 5: Implement DateTimePicker

- Compose Ark DateInput segments with the shared Ark DatePicker calendar.
- Keep date/time edits in a draft while the popup is open.
- Preserve time on date selection, commit on confirm, and discard on dismissal.
- Enforce minute precision and avoid implicit time-zone attachment.
- Add field, form, constraints, portal, state, and visual styling.

### Task 6: Publish the API and examples

- Update root and subpath exports plus package contract tests.
- Add DateTimePicker Storybook stories and Interaction coverage.
- Update DatePicker stories for semantic values.
- Update website and MCP catalogs.

### Task 7: Update durable documentation

- Update both READMEs and `docs/design/components.md`.
- Update the repository-owned component skill.
- Regenerate website `llms.txt`.
- Record the semantic and time-zone decisions in this spec.

### Task 8: Verify

- Run focused component and contract tests.
- Run `vp check`, `vp test`, `vp run storybook#test`, and `vp run build -r`.
- Inspect DatePicker and DateTimePicker in live Storybook at desktop and narrow widths, light and dark themes, and multiple ConfigProvider locales.
- Record evidence in DDev state.

### Task 9: Wrap up

- Preserve unrelated work.
- Do not commit, push, or open a pull request unless explicitly requested.

### Task 10: Add custom text transforms and Today navigation

- Add paired `format` / `parse` callbacks to DatePicker without exposing localized strings as values.
- Add a shared localized Today footer action.
- DatePicker commits Today and closes; DateTimePicker preserves draft time and waits for confirmation.
- Extend focused tests, Storybook Interaction coverage, catalogs, public docs, and agent guidance.

### Task 11: Stabilize the default DatePicker text contract

- Display the default input as `YYYY/MM/DD` independently of locale.
- Accept slash, hyphen, and space separators, then normalize committed text to slashes.
- Keep paired custom `format` / `parse` callbacks as the override boundary.
- Verify the default parser in component tests and the Storybook Interaction path.

### Task 12: Align public locale typing and picker density

- Export `DatePickerLocaleTextOverrides` and use it for both picker props.
- Pass the selected size into the portalled shared calendar.
- Scale panel width, padding, navigation, headings, day cells, selection cells,
  and DateTimePicker footer controls as one density system.
- Preserve minimum coarse-pointer targets.
- Update Storybook API metadata, public docs, MCP metadata, generated
  `llms.txt`, and browser measurements.

### Task 13: Merge DatePicker field actions and make Today opt-in

- Keep DatePicker popup opening on the input and replace its clickable calendar
  trigger with a decorative trailing indicator.
- Reuse the same trailing slot for clear on hover or focus when the field has a
  clearable value.
- Add `showToday` to DatePicker and DateTimePicker with a default of `false`;
  keep the DateTimePicker time and confirm footer when Today is hidden.
- Extend behavior, style, Storybook, catalog, documentation, and live-browser
  evidence for the new contract.

### Task 14: Add DatePicker selection modes

- Add `mode="date" | "month" | "year"` with date as the default.
- Use the mode as Ark UI's default and minimum view while keeping year as the
  maximum view, so month mode can navigate to years and year mode stays fixed.
- Normalize month values to day 1 and year values to January 1 across controlled
  values, defaults, constraints, parsing, Today, unavailable checks, and change
  callbacks.
- Give each mode a matching default placeholder, formatter, and parser.
- Add unit, Storybook Interaction, public type, website, MCP, documentation,
  skill, generated context, and live-browser coverage.
