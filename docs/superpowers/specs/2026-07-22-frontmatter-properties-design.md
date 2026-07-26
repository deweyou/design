# Markdown Frontmatter Properties Design

## Goal

Add Obsidian-style YAML frontmatter support to `MarkdownRender` and the Markdown `Editor` path while preserving plain Markdown as the portable source of truth.

## Product boundary

- `MarkdownRender` recognizes a valid leading YAML mapping and displays it by default.
- `Frontmatter` is the shared read/edit property surface used by render and editor integrations.
- The built-in property types are `text`, `list`, `number`, `checkbox`, `date`, `datetime`, and `tags`.
- Value-shape inference handles strings, numbers, booleans, and scalar arrays. A host-owned property-name registry disambiguates date and datetime strings.
- YAML arrays remain free-form lists. Fixed option catalogs, select, multi-select, status, people, files, relations, formulas, and rollups are outside the core contract.
- Invalid YAML and unsupported nested values remain available through source mode.

## Public behavior

`Frontmatter` exposes controlled value updates, optional type updates, source editing, and `renderValue`. The callback receives the structural `valueType`, resolved `propertyType`, and whether the type was explicit, built in, or inferred.

Top-level property creation, rename, deletion, and value updates share one discriminated change contract. Type changes never coerce YAML values: the menu disables incompatible shapes, while hosts persist the separate `propertyTypes` registry and synchronize it from rename/delete actions. `propertyOptions` owns per-key editability, placeholders, and numeric constraints. Component-owned copy follows `ConfigProvider` with a local `localeText` override.

`MarkdownRender` supports `visible`, `hidden`, and `source` presentation. Passing `frontmatter={false}` preserves the previous raw-Markdown behavior.

The Editor path uses one `frontmatterPlugin` plus Markdown adapter support. The plugin registers the Lexical node and UI configuration; the adapter activates the multiline transformer only when that feature is present.

## Data preservation

One project-owned YAML boundary is shared across surfaces. Path-level updates use a YAML document so unaffected comments, key order, and quoted scalars are retained where supported by the parser. Parser errors never trigger destructive normalization.

## Accessibility and interface

- Read-only booleans use a static checkbox mark with checkbox semantics.
- Editable booleans use the Ark UI-backed Checkbox.
- Editable date and datetime strings use the shared DatePicker, including its calendar, time wheel, locale, keyboard, and popup behavior. Controlled updates serialize back to canonical `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm`, or second-precision strings without changing the YAML value type.
- Editable properties use a passive-first inline surface: resting values resemble read mode, while hover and focus reveal the active control treatment.
- Inline text, number, DatePicker, and list-add controls do not draw their own hover/focus frame; the property row supplies the focus state so editing does not create a nested full-width overlay.
- Property types use compact icons. When type changes are enabled, the icon opens an Ark UI-backed menu instead of rendering a persistent Select in every row.
- Lists use semantic list markup and Badges; adding is collapsed behind a trailing action. Named remove actions use a plain cross with right padding and appear only when the Badge's right-edge hotspot is hovered or focused. Their moderate visual scrim extends farther left than the hotspot, fades from the exact Badge surface color to transparent, keeps a solid segment behind the complete glyph, and never changes Badge geometry.
- Existing scalar list entries keep their YAML type when edited. Free-form addition is available only for string lists so UI editing cannot silently create mixed scalar arrays.
- Property names enter compact inline rename state on activation. Type menus carry the lower-frequency delete action, and an understated trailing Add property action expands into a typed inline creation row. Empty mappings show a localized empty state and the same creation entry point.
- Numbers reuse the shared NumberInput with its visible step controls and control-owned focus ring disabled. Direct entry and Arrow Up/Arrow Down stepping remain available, while the property row supplies the visible focus treatment.
- The property surface uses the control/body sans-serif stack rather than Markdown's serif content typography.
- Inputs have accessible names derived from property keys.
- Source errors use an inline alert and keep the raw YAML editable.
- The layout uses a stable key column on desktop, stacks at the shared compact breakpoint, avoids horizontal overflow, and remains border-led, token-based, keyboard accessible, and free of nested cards.

## Non-goals

- TOML or JSON frontmatter
- Nested object form builders
- Automatic date coercion from string patterns
- Time-zone conversion for datetime strings
- Obsidian vault persistence or `.obsidian` file management
- MDX or executable metadata
