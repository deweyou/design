---
name: deweyou-design-components
description: Use when building, modifying, documenting, or inspecting Deweyou Design React components, component examples, website catalog entries, Storybook stories, design tokens, icons, or AI-facing context such as llms.txt and the Deweyou Design MCP server.
---

# Deweyou Design Components

Use this skill for Deweyou Design component, style, icon, and AI-facing context.

## Start Here

1. Inspect `AGENTS.md` and run `deweyou-cli agent context --format markdown`.
2. Read only the docs needed for the task:
   - `docs/design/components.md` for public component imports and composition contracts.
   - `docs/design/system.md` for visual language and token rules.
   - `docs/architecture/ark-ui.md` for interactive behavior-layer decisions.
   - `docs/architecture/package-layers.md` before touching package boundaries.
   - `docs/architecture/testing.md` for unit, contract, and Storybook e2e ownership.
3. For structured lookup, use the MCP server package:
   - Build: `pnpm --filter @deweyou-design/mcp build`
   - Run stdio server: `pnpm --filter @deweyou-design/mcp mcp`
   - External stdio server: `npx deweyou-design-mcp`

## Component Rules

- Keep React components in TSX files.
- Use arrow functions unless a framework boundary, hoisting need, or external API requires a function declaration.
- New or renamed governed files and directories use lowercase kebab-case names.
- In `packages/react`, each source unit lives under `src/<unit-name>/` with colocated `index` and `index.test`.
- Use `@ark-ui/react` for interactive behavior when it matches the component pattern.
- Style components with CSS Modules and `@deweyou-design/styles` tokens; avoid one-off hard-coded visual systems.
- Prefer root imports for multi-component consumer examples and subpath imports for single-component docs.
- Import `@deweyou-design/styles/theme.css` once at the app root.
- Use `@deweyou-design/react-icons` for icons; wrap interactive icons in `IconButton`, `Button.Icon`, or a native button.

## Public Component Checklist

When adding, removing, or changing the public import or behavior contract of a component, update all relevant surfaces:

- `packages/react/src/index.ts`
- `packages/react/package.json` exports
- `docs/design/components.md`
- root `README.md` and `README_ZH.md`
- `apps/website/src/data/component-catalog.tsx`
- Storybook stories and interaction coverage
- unit tests plus package/export/docs contract tests
- `packages/mcp/src/catalog/index.ts`, style/icon MCP metadata, and regenerated `apps/website/public/llms.txt` when public AI-facing context changes
- this repo-owned skill when the component change also changes workflow, routing, checklist, or verification guidance for future agents

## Localization

Use `ConfigProvider` for shared locale selection. Its public configuration is a
typed locale code only; do not add `localeText` or a central translation object
to the provider.

- The supported locale codes are `en-US`, `zh-CN`, `zh-TW`, `ja-JP`, and
  `ko-KR`. `en-US` is the default and fallback; do not add browser locale
  detection inside the component package.
- A source unit that owns built-in copy also owns `locale/types.ts`,
  `locale/en-us.ts`, `locale/zh-cn.ts`, `locale/zh-tw.ts`, `locale/ja-jp.ts`,
  `locale/ko-kr.ts`, and `locale/loader.ts`.
- Keep `en-US` synchronously imported. Load the other dictionaries with literal
  dynamic imports through `createComponentLocaleText` so build tools preserve
  component-and-locale chunk boundaries.
- Expose `localeText?: Partial<ComponentLocaleText>` on the component or Editor
  plugin that owns the copy. Explicit semantic props such as `aria-label` keep
  precedence over the locale dictionary.
- First-time non-English rendering may suspend to the consumer's nearest
  `Suspense` boundary. Runtime switches should keep revealed content visible
  until the new dictionary resolves.
- Verify provider inheritance, local overrides, lazy-load caching, runtime
  switching, Storybook interaction, and emitted bundle chunk boundaries.
- Keep the Storybook preview and website shell wrapped by one root
  `ConfigProvider`. Their global locale controls must use `configLocales`,
  default to `en-US`, and change component-owned copy without translating
  caller-authored story or website content.

## Component Density

Keep visible control density separate from touch accessibility:

- The shared visible control-height ladder is `xs` 24px, `sm` 32px, `md` 40px,
  `lg` 48px, and `xl` 56px.
- `--ui-touch-target-min` remains 44px, but it is a coarse-pointer hit-target
  contract, not a universal fine-pointer visual height.
- Use `(pointer: coarse)` plus the shared coarse-pointer Less mixins, or a safe
  layout-neutral pseudo-element, to preserve the 44px target without inflating
  desktop hover and focus surfaces.
- Components that expose `sm`, `md`, and `lg` map them to 32px, 40px, and 48px
  visible controls unless their documented domain contract says otherwise.
- Verify computed dimensions in Storybook as well as source-level style
  contracts. Do not compensate for component density by changing Website
  preview-card spacing.

## Image Collection Components

Use the image collection components according to the size and grouping shape:

- `ImagePreview`: modal image viewing with zoom and optional gallery navigation.
- `ImageMasonry`: normal image masonry for small or moderate galleries. For grouped non-virtual galleries, compose multiple `ImageMasonry` instances and render section headings in the consuming layout.
- `VirtualMasonry`: long ungrouped image collections where only visible masonry cells should mount.
- `GroupedVirtualMasonry`: long grouped image collections where headers and masonry cells need one virtual scroll-height model.

Masonry inputs must include stable geometry. Require `aspectRatio` or positive `width` and `height` on every image passed to `ImageMasonry`, `VirtualMasonry`, or `GroupedVirtualMasonry`; do not add src-only natural-size probing as a default behavior. `GroupedVirtualMasonry` also requires fixed `groupHeaderHeight` so virtualization can calculate header positions before render.

When documenting or testing grouped virtual masonry, include:

- custom group titles through `title: ReactNode` or `renderGroupHeader`
- grouped range positions for header and item entries
- `scrollToGroup`, `scrollToItem`, `scrollToOffset`, and `getScrollOffset`
- Storybook `Interaction` coverage that jumps to a far item in a later group

## Numeric Input

Use `NumberInput` for quantities, counts, percentages, prices, measurements, and
other values where direct typing and step controls should remain available
together.

- Import a standalone usage from `@deweyou-design/react/number-input`; prefer the
  root package import when an example composes several components.
- Use `min`, `max`, and `step` to define the numeric contract. Use `precision`
  for convenient fraction-digit defaults; explicit `formatOptions` fraction
  settings take precedence.
- Pass human-readable percentage values such as `37.5` with
  `formatOptions={{ style: 'percent' }}`; the component normalizes the value for
  `Intl.NumberFormat` display.
- Use `label`, `hint`, `error`, and `required` on `NumberInput` instead of
  manually recreating field semantics. Supply `aria-label` or `aria-labelledby`
  when no visible label is appropriate.
- Use `placeholder` for an empty-value hint and opt into `clearable` when users
  benefit from resetting the value inline. The localized clear action is hidden
  for empty, disabled, and read-only values and preserves input focus.
- Use `showControls={false}` for compact inline editing that does not need
  visible decrement/increment buttons; direct typing and Arrow Up/Arrow Down
  stepping remain available.
- Keep `showFocusRing` enabled by default. Disable it only when the surrounding
  composite provides an equivalent focus indicator, such as a row-level
  `:focus-within` treatment.
- Use `onValueChange` for live state, `onValueCommit` for blur/Enter workflows,
  and `onValueInvalid` when consumers need underflow or overflow feedback.
- Verify keyboard stepping, trigger boundaries, direct typing, formatting,
  disabled/read-only behavior, and narrow coarse-pointer layouts in component
  tests and Storybook Interaction coverage.

## Date And Date-Time Input

Use `DatePicker` for one calendar date when users should be able to type a
year-first value or choose it from a locale-aware calendar popup.
Use `DateRangePicker` for one contiguous inclusive range; do not represent a
range with two unrelated `DatePicker` instances.

- Import standalone usage from `@deweyou-design/react/date-picker`; prefer the
  `date-range-picker` subpath for standalone range usage and the root package
  import when composing several components.
- Keep `value`, `defaultValue`, `min`, and `max` as `CalendarDate` objects.
  Use `parseDatePickerValue` when converting canonical `YYYY-MM-DD` strings at
  a serialization boundary.
- The default input displays `YYYY/MM/DD`, accepts `/`, `-`, or spaces as
  separators, and normalizes committed text to slashes. Locale still controls
  calendar conventions and component-owned copy.
- Use `mode="month"` when the selected unit is a month: the input uses
  `YYYY/MM`, month selection emits the first day of that month, and the header
  can still open the year grid. Use `mode="year"` for a year-only grid and
  `YYYY` input; values normalize to January 1. The default `date` mode keeps the
  full day -> month -> year navigation hierarchy.
- Provide `format` and `parse` together when DatePicker needs a custom text
  representation. Keep the callbacks semantic (`CalendarDate`) and use their
  ConfigProvider locale detail instead of adding an instance locale prop.
- Treat `size` as one field-and-panel density contract. The portalled calendar
  must receive the same `sm`, `md`, or `lg` size while coarse pointers retain
  the shared minimum touch target.
- Type component copy overrides as `DatePickerLocaleTextOverrides`; the resolved
  `DatePickerLocaleText` remains complete inside the component.
- Treat the DatePicker trailing calendar glyph as a non-interactive field
  indicator. The input opens the popup; a populated clearable field swaps that
  slot to the clear action on hover or focus.
- Use `DatePicker showTime` for a calendar date plus wall-clock time. Its public
  value becomes `CalendarDateTime`, it does not attach a time zone, and calendar
  or time-wheel edits commit only through the localized Confirm action. Use
  `parseDatePickerDateTimeValue` for canonical `YYYY-MM-DDTHH:mm` or
  `YYYY-MM-DDTHH:mm:ss` strings.
- Configure `showTime` with `defaultTime`, 12/24-hour cycle, minute or second
  granularity, wheel steps, optional `showNow`, and `isTimeUnavailable`. The Now
  action changes only the draft wall-clock time, preserves the selected date,
  respects steps and constraints, and still requires Confirm. Time selection is
  only valid with the default date mode.
- Today is opt-in through `showToday`. Date-only selection commits the local
  calendar unit and closes; a time-enabled picker preserves the draft time and
  waits for explicit confirmation.
- Use `min`, `max`, and `isDateUnavailable` for selection constraints. Do not
  turn `DatePicker` into a range, standalone time, duration, or zoned instant
  picker; those require separate public contracts.
- Keep `DateRangePicker` values as named `{ start, end }` objects rather than
  positional tuples. It supports date, month, year, and optional date-time
  ranges, but only one contiguous range; do not add speculative multi-range
  state to this contract.
- Render the range field as two real inputs inside one visual control with one
  separator and one contextual clear action. Apply paired `format` and `parse`
  callbacks to both endpoints.
- With range `showTime`, keep start and end wheel edits independent and draft
  them until Confirm. `defaultTime` has named endpoint values, `showNow` changes
  only the active endpoint, and choices that invert the range are unavailable.
- Use `label`, `hint`, `error`, and `required` instead of recreating Field
  semantics. Supply `aria-label` or `aria-labelledby` when no visible label is
  appropriate, and localize icon-only action labels when needed.
- Keep calendar parsing, grid semantics, keyboard navigation, focus restoration,
  selection, positioning, calendar dismissal, and time-wheel listbox semantics
  delegated to Ark UI.
- Verify mode-specific normalization and input formats, default separator
  normalization, semantic callbacks, month/year navigation, field-and-panel
  sizing, clearing, constraints, disabled/read-only states, `showTime` draft
  confirmation and cancellation, wheel keyboard behavior, narrow layouts, dark
  mode, and Storybook Interaction coverage.

## Markdown Frontmatter

- Use `Frontmatter` for parsed Markdown metadata and `MarkdownRender` for complete Markdown strings. Do not parse the full Markdown document inside the presentational component.
- Treat YAML as the source of truth. The built-in property types are `text`, `list`, `number`, `checkbox`, `date`, `datetime`, and `tags`; do not model free-form YAML arrays as fixed-option multi-select fields.
- Use the optional host-owned `propertyTypes` registry only to disambiguate presentation and editing by property name. Do not hide option catalogs, persistence, or vault state inside the component.
- Treat `FrontmatterChangeDetails.action` as the property lifecycle contract: `set` updates a value, `add` creates a key, `rename` includes `previousKey`, and `delete` removes a key. Keep a host-owned `propertyTypes` registry synchronized from rename and delete actions.
- Disable incompatible property type choices instead of coercing YAML values. Existing scalar list entries must preserve their YAML type; only string lists expose free-form item addition.
- Use `propertyOptions` for per-key editability, placeholders, and NumberInput constraints. Frontmatter copy inherits `ConfigProvider`; use `localeText` only for an explicit local override.
- `MarkdownRender` displays valid leading frontmatter by default. Use `visible`, `hidden`, or `source` display modes, and reserve `frontmatter={false}` for explicit raw compatibility.
- In `Editor`, pair `markdownEditorAdapter()` with one `frontmatterPlugin()`. The adapter owns whole-document import/export; the plugin owns FrontmatterNode registration and the shared editable surface. Do not route document-head frontmatter through `markdownShortcutPlugin()`.
- Preserve comments, ordering, quoting, invalid drafts, and unsupported nested values through the project-owned YAML boundary and source-mode recovery. Never silently coerce or drop metadata.
- Verify parser recovery, add/rename/delete preservation, compatible type choices, scalar list type stability, render-value type context, Checkbox and free-form string list editing, adapter round trips, per-key read-only state, locale inheritance, package/subpath exports, Storybook Interaction, and live MarkdownRender/Editor examples.

## MCP Resources

The Deweyou Design MCP server is read-only. It exposes:

- `deweyou://design/overview`
- `deweyou://design/components`
- `deweyou://design/styles`
- `deweyou://design/icons`
- `deweyou://design/imports`
- `deweyou://design/rules`

Useful tools:

- `list_components`
- `get_component`
- `get_component_import`
- `list_style_entrypoints`
- `list_icons`
- `get_icon_import`

## Verification

Run the narrowest meaningful checks first, then broaden:

- `pnpm --filter @deweyou-design/mcp test` for MCP and llms context changes.
- `pnpm --filter @deweyou-design/react test` for component package changes.
- `vp run storybook#test` when adding or changing stories.
- `vp check` before claiming repository-level readiness.
