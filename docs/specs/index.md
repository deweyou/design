# Feature Specs Index

All iteration records are listed in reverse chronological order. Each entry links to its spec directory. Add `archive.md` after implementation is complete.

---

## 2026-05

| Branch                                                                             | Type | Description                                                                                                   |
| ---------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------- |
| [20260509-component-coverage-roadmap](20260509-component-coverage-roadmap/spec.md) | docs | Plan next-stage component coverage: Fieldset, InputGroup, Alert, Empty, Kbd, ButtonGroup, Avatar, Collapsible |

## 2026-04

| Branch                                                                        | Type     | Description                                                                                                                                     |
| ----------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [20260409-component-testing-standards](20260409-component-testing-standards/) | feature  | Define component testing standards, cover five existing component gaps, and add CI gates for 80% coverage and e2e                               |
| [20260408-storybook-e2e](20260408-storybook-e2e/)                             | feature  | Add Storybook Interaction e2e coverage for existing components with `@storybook/test-runner`                                                    |
| [20260408-restructure-packages](20260408-restructure-packages/)               | refactor | Rename packages to the `@deweyou-design/*` scope, separate infra as the build layer, and resolve dist package versions                          |
| [20260408-npm-publish-workflow](20260408-npm-publish-workflow/)               | feature  | Explore and establish the npm publishing workflow: beta/prerelease packages from development branches and stable releases after merging to main |

## 2026-03 Second Half

| Branch                                                                  | Type     | Description                                                                                                                                                |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [20260331-tabs-component](20260331-tabs-component/)                     | feature  | Implement Tabs with Ark UI, line/bg active styles, transitions, overflow scrolling, gradients, and nested Menu dropdowns                                   |
| [20260330-storybook-docs-upgrade](20260330-storybook-docs-upgrade/)     | chore    | Upgrade Storybook, reorganize stories into color/components categories, and complete API docs                                                              |
| [20260329-menu-component](20260329-menu-component/)                     | feature  | Implement Menu with Ark UI: groups, separators, nested submenus, single/multiple selection, and contextMenu                                                |
| [20260329-distill-design-style](20260329-distill-design-style/)         | docs     | Distill design style guidance from existing components into `docs/design/system.md` and complete AGENTS.md to CLAUDE.md migration                          |
| [20260327-ark-ui-integration](20260327-ark-ui-integration/)             | refactor | Introduce `@ark-ui/react` as the component behavior layer, refactor Popover on Ark UI, and establish the interactive component pattern                     |
| [20260326-optimize-package-outputs](20260326-optimize-package-outputs/) | build    | Govern package build and publish outputs: preserveModules, CSS split, simplified build config, peer dependency alignment, and workspace version resolution |
| [20260324-define-color-palette](20260324-define-color-palette/)         | feature  | Establish the unified color token system in `@deweyou-design/styles`: 26 colors x 11 steps plus black and white                                            |
| [20260324-add-popover-component](20260324-add-popover-component/)       | feature  | Implement Popover with positioning, trigger modes, and controlled/uncontrolled behavior                                                                    |
| [20260323-refine-button-padding](20260323-refine-button-padding/)       | fix      | Improve Button spacing by separating icon-button and text-button padding strategies                                                                        |
| [20260323-button-props-loading](20260323-button-props-loading/)         | feature  | Complete public Button props including onClick, danger color, htmlType, href/target, ref, and loading state                                                |
| [20260323-button-hover-motion](20260323-button-hover-motion/)           | fix      | Refine Button hover feedback: keep link underline motion, smooth outlined hover borders, and remove animated prop                                          |
| [20260323-add-text-component](20260323-add-text-component/)             | feature  | Implement Text typography component with variants, italic/weight/underline/delete, and lineClamp                                                           |
| [20260322-define-songti-typography](20260322-define-songti-typography/) | feature  | Define the Songti typography system, font stacks, and companion Latin/digit fonts                                                                          |
| [20260320-button-variants](20260320-button-variants/)                   | feature  | Refactor Button variants: variant, color, five sizes, and three shapes                                                                                     |

## 2026-03 First Half

| Branch                                                              | Type    | Description                                                                                                                               |
| ------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [20260317-upgrade-storybook](20260317-upgrade-storybook/)           | chore   | Upgrade Storybook to the latest stable version                                                                                            |
| [20260317-repo-conventions](20260317-repo-conventions/)             | chore   | Establish repository conventions: arrow functions, TSX-first, kebab-case, colocated tests, and `src/<unit>/` structure                    |
| [20260317-icon-package](20260317-icon-package/)                     | feature | Add `@deweyou-design/react-icons`; it started from Iconify and later converged to a Tabler curated set                                    |
| [20260316-ui-monorepo-foundation](20260316-ui-monorepo-foundation/) | feature | Create the monorepo foundation with utils/hooks/styles/components plus website/storybook, and establish CSS Modules with TS token theming |

---

## Archive Notes

- **archive.md**: added after implementation to record key decisions, pitfalls, and reusable patterns.
- **Knowledge capture**: reusable rules or patterns may be distilled into `docs/<topic>.md` during archive and linked from `AGENTS.md` or `CLAUDE.md`.
