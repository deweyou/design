# Testing Architecture

This repository separates unit tests from package and repository contracts. Keep the test name and file location aligned with the thing being protected. The operational checklist lives in [docs/testing-standards.md](../testing-standards.md).

## Colocated Unit Tests

Colocated `src/<unit>/index.test.ts(x)` files should test the unit's runtime behavior:

- rendered elements, attributes, ARIA state, and data attributes
- prop defaults, validation, controlled/uncontrolled behavior, and event callbacks
- keyboard/pointer interactions for Ark UI-backed components
- public TypeScript surface checks that are tied to the component being tested

Avoid reading unrelated files from colocated unit tests. In particular, component unit tests should not assert raw `package.json`, documentation prose, Storybook story text, or CSS source substrings.

## Contract Tests

Use `packages/<package>/tests/*-contract.test.ts(x)` for contracts that span files, packages, or generated outputs:

- package exports, subpath entries, publish manifests, and dependency boundaries
- SSR behavior and cross-package import contracts
- generated CSS outputs, asset presence, and shared style governance
- documentation sync that can be checked mechanically from structured package data

Prefer structured reads over string searches when a structured format exists. Parse `package.json` before asserting dependencies or exports.

## Style Tests

Component styles are governed by focused contract tests, not by each component's unit test. CSS source checks are acceptable when they protect a repo-level rule, such as banning hardcoded color literals or retired tokens.

Keep component-level visual behavior in one of these places:

- DOM/class assertions in the component unit test when the class is part of the component's rendered state
- centralized style contract tests when the rule spans components or checks Less source
- Storybook interaction or browser verification when the behavior is visual and cannot be represented by a stable DOM contract

## Storybook E2E

Every `apps/storybook/src/stories/*.stories.tsx` file must export an `Interaction` story with a `play` function. That play function is the browser-level e2e coverage for the file.

Use Storybook e2e for user-observable paths:

- default render and visible content
- click, keyboard, focus, open/close, selection, disabled, loading, and error states
- representative variant/size/shape combinations when the behavior depends on rendered layout
- cross-component composition where jsdom unit tests are too narrow

Keep source-level checks out of Storybook e2e. Prefer role, label, visible text, aria state, and user events.

## Documentation Tests

Do not assert exact documentation wording. Documentation tests should protect mechanically derived facts, such as whether every exported component appears in the component overview. Editorial phrasing belongs in review, not in unit tests.
