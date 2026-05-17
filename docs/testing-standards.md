# Component Testing Standards

> Version: 1.0.0 | Created: 2026-04-09
> Every component implementation or substantive component change must include the matching Vitest unit tests, contract tests, and Storybook e2e coverage required by this standard.

---

## Default Delivery Gate

When adding or substantially modifying a component, developers and AI agents must deliver these by default without being reminded:

- Colocated Vitest unit tests: protect the component's own runtime behavior.
- Storybook `Interaction` e2e: protect user-visible paths.
- Contract tests: required when the change affects package exports, subpaths, documentation sync, style governance, or cross-package boundaries.
- README / knowledge-base sync: new public components must update `README.md` and `docs/design/components.md`; new design decisions or future evolution directions should be written to `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- Verification commands: run `vp check`, `vp test`, and related Storybook e2e by default. When adding or modifying Storybook stories, run `vp run storybook#test`.

If any item truly does not apply, explain why in the PR description or the related documentation.

---

## Component Categories

| Type               | Definition                                                                 | Examples                                      |
| ------------------ | -------------------------------------------------------------------------- | --------------------------------------------- |
| **Presentational** | No internal state machine; output is fully determined by props             | `Text`, `Badge`, `Icon`                       |
| **Interactive**    | Built on the Ark UI behavior layer with open/close, focus, and keyboard UX | `Menu`, `Popover`, `Tabs`, `Select`, `Dialog` |

---

## Vitest Unit Tests

Component unit tests cover only the component's own runtime behavior. Do not read `package.json`, documentation, Storybook story text, or `.module.less` source from colocated `index.test.ts(x)` files.

### Required Coverage For Presentational Components

| ID      | Test item                                                                     | Method                        |
| ------- | ----------------------------------------------------------------------------- | ----------------------------- |
| UT-P-01 | Default props render expected data attributes, classes, and HTML structure    | `renderToStaticMarkup`        |
| UT-P-02 | Each documented variant/color/size/shape renders the correct data attrs       | `renderToStaticMarkup`        |
| UT-P-03 | DOM classes / data attributes express documented visual states                | `renderToStaticMarkup`        |
| UT-P-04 | Style-related classes are asserted only when part of rendered component state | CSS Modules class assertion   |
| UT-P-05 | Disabled / loading states render correct HTML attributes and ARIA             | `renderToStaticMarkup`        |
| UT-P-06 | Invalid prop combinations throw clear errors                                  | `expect(...).toThrow(...)`    |
| UT-P-07 | Ref forwarding, when implemented with `forwardRef`                            | Inspect `renderSurface().ref` |

### Required Coverage For Interactive Components

| ID      | Test item                                                                   | Method                            |
| ------- | --------------------------------------------------------------------------- | --------------------------------- |
| UT-I-01 | Content appears after trigger activation and has the correct role           | jsdom + `fireEvent` / `userEvent` |
| UT-I-02 | Escape closes the component and `onOpenChange` carries `{ open: false }`    | jsdom + `fireEvent.keyDown`       |
| UT-I-03 | Controlled `open` prop switches correctly when set externally to true/false | jsdom + `rerender`                |
| UT-I-04 | Disabled state does not call callbacks and exposes `aria-disabled="true"`   | jsdom                             |
| UT-I-05 | Primary callbacks carry the correct payload, such as `onSelect`             | jsdom + `vi.fn()`                 |
| UT-I-06 | Selected state is reflected through `aria-checked` / `aria-selected`        | jsdom                             |
| UT-I-07 | Multiple instances are isolated                                             | jsdom                             |

> Interactive component test files must declare `// @vitest-environment jsdom` at the top.

### File Layout

```text
packages/react/src/<component-name>/
├── index.tsx
├── index.module.less
└── index.test.ts(x)   # .ts for presentational components, .tsx for interactive components
```

- Presentational components use `renderToStaticMarkup` in the Node environment and do not need jsdom.
- Do not test Ark UI internals; test only the wrapper layer's output.
- Assert specific values instead of using `toBeTruthy()` as a substitute for meaningful assertions.
- Items that are not applicable must be noted in test comments or the PR description.

---

## Contract Tests

Use `packages/<package>/tests/*-contract.test.ts(x)` for cross-file, cross-package, build output, documentation sync, and style-governance contracts. Do not put these concerns in component colocated tests.

| Type                  | Location                | Examples                                                       |
| --------------------- | ----------------------- | -------------------------------------------------------------- |
| Package boundary      | `packages/react/tests`  | exports, subpaths, dependencies, publish manifest              |
| SSR / import          | `packages/react/tests`  | portal SSR, root/subpath import smoke                          |
| Style governance      | `packages/react/tests`  | banning hardcoded hex, retired tokens, visual source contracts |
| Documentation sync    | `packages/react/tests`  | mechanically checking component docs from package exports      |
| Repository governance | `packages/infra/tests`  | file structure, story interaction coverage, publish contract   |
| Styles outputs        | `packages/styles/tests` | CSS files, font assets, token object, manifest                 |

Prefer structured data reads over string searches. If you can `JSON.parse(package.json)`, do that before asserting dependencies or exports. Documentation tests should check mechanically derivable facts, not editorial wording.

---

## Style Tests

CSS source checks are allowed only in centralized contract tests such as `packages/react/tests/component-style-contract.test.ts`.

Allowed style-source contracts:

- Ban hardcoded color literals and retired tokens.
- Confirm cross-component shared token or mixin constraints.
- Protect key visual implementations that cannot be expressed through a stable DOM contract, such as button link underline behavior or loading overlay layout.

Disallowed style-source contracts:

- Reading `index.module.less` from component `index.test.ts(x)`.
- Repeating assertions for implementation details such as `--ui-color-*`, `flex`, or `box-shadow` in every component.
- Using CSS substrings instead of real interaction or accessibility assertions.

---

## Storybook E2E

Every `*.stories.tsx` file must include an `Interaction` story with a `play` function.

`Interaction.play` is the e2e coverage entry point for a Storybook file. When adding, modifying, or deleting a story, maintain the same file's `Interaction.play` and make it cover the file's most important usability path.

### Required `Interaction` Coverage For Presentational Components

| ID       | Test item                                                                        |
| -------- | -------------------------------------------------------------------------------- |
| E2E-P-01 | Default state is visible and key content renders correctly                       |
| E2E-P-02 | Disabled state has the `disabled` attribute and Enter/Space do not trigger click |
| E2E-P-03 | Loading state, when present, shows the indicator and prevents repeat activation  |
| E2E-P-04 | At least one representative variant / size / shape matrix combination            |

### Required `Interaction` Coverage For Interactive Components

| ID       | Test item                                                                |
| -------- | ------------------------------------------------------------------------ |
| E2E-I-01 | Content appears and is visible after the main trigger action             |
| E2E-I-02 | Primary interaction item can be clicked and produces the expected result |
| E2E-I-03 | Disabled items are not interactive                                       |
| E2E-I-04 | Escape closes the floating surface                                       |
| E2E-I-05 | Nested structures, when present, cover one nested interaction level      |
| E2E-I-06 | Keyboard navigation covers main-axis movement, selection, or closing     |
| E2E-I-07 | At least one multiple-instance or controlled-state path                  |

### Storybook E2E Maintenance Rules

- Each story file needs only one `Interaction` story, but its `play` should cover the file's key states instead of only checking existence.
- When adding an interactive story that involves click, keyboard, focus, open/close, selection, disabled, loading, or error states, add corresponding assertions to `Interaction.play`.
- When changing DOM text, roles, labels, or test ids, update `Interaction.play` in the same change.
- When deleting a story, remove assertions for that scenario from `Interaction.play`.
- Do not test implementation details in Storybook e2e. Prefer roles, labels, visible text, ARIA state, and user events.
- Visual behavior should be verified through browser-observable results; do not read source or style files from `play`.

### Responsibility Boundaries

| Colocated Vitest       | Contract test         | Storybook e2e                      | Either can cover       |
| ---------------------- | --------------------- | ---------------------------------- | ---------------------- |
| SSR render output      | CSS source governance | Real browser render behavior       | Basic open/close       |
| Exact callback payload | package exports       | Cross-component visual integration | disabled state         |
| ARIA attribute details | dependency boundary   | Submenu hover expansion            | keyboard Escape        |
| Invalid prop errors    | docs mechanical sync  | User-path visibility checks        | selection/active state |

---

## Operational Definition Of 100% Coverage

Use checklist completeness as the gate, not Istanbul line coverage:

- **Presentational components**: every applicable item from UT-P-01 through UT-P-07 has a test case.
- **Interactive components**: every applicable item from UT-I-01 through UT-I-07 has a test case, and every applicable item from E2E-I-01 through E2E-I-05 has an assertion.
