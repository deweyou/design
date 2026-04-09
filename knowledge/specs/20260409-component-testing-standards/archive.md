# Archive: Component Testing Standards

**Branch**: `20260409-component-testing-standards`
**Completed**: 2026-04-09
**Type**: harness-component

## Delivery Summary

Formalized a complete testing standard for the `@deweyou-design/react` component library, covering Vitest unit tests and Storybook e2e. Backfilled coverage gaps across all five existing components (button, menu, popover, tabs, text), raised coverage thresholds to 80% for all four metrics, and wired CI to enforce both unit test coverage and Storybook interaction test checks on every PR.

## Key Decisions

| Decision                   | Choice                                                | Rationale                                                                                                                                                                                         | Alternatives considered                                                              |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Coverage threshold level   | 80% (all four metrics)                                | Balances strict enforcement with the genuine difficulty of covering jsdom-hostile branches (SSR paths, ResizeObserver-dependent overflow layout). 100% is unrealistic without a real browser env. | 70% (too loose), 100% (untestable branches would require mocking too much internals) |
| Coverage provider          | `@vitest/coverage-v8` pinned to `^4.1.0`              | Must match the vitest version bundled inside `@voidzero-dev/vite-plus-test`. Mismatched versions cause `fetchCache` runtime errors.                                                               | `istanbul` (not pinned to vite-plus internals, but less accurate)                    |
| Coverage working directory | Run `vp test --coverage` from inside `packages/react` | Running from workspace root measures all packages (icons, styles, etc.), giving a diluted 51% aggregate that does not reflect component implementation quality.                                   | Root-level run (incorrect — gives wrong numbers)                                     |
| CI: Storybook e2e approach | Build → serve → test-runner                           | Matches what `storybook#test` already does locally; avoids adding a new browser CI layer.                                                                                                         | Playwright direct tests (requires separate setup)                                    |
| Testing standards doc      | `knowledge/testing-standards.md`                      | Acts as a living checklist for future component authors; referenced in CLAUDE.md.                                                                                                                 | Inline in constitution.md (would make it too long)                                   |

## Pitfalls

- **Problem**: `@vitest/coverage-v8@^3.0.0` was initially used but the internal vitest in vite-plus-test is `4.1.x`, causing `V8CoverageProvider.getUntestedFiles: Cannot read properties of undefined (reading 'fetchCache')`.
  **Solution**: Pin `@vitest/coverage-v8` to `^4.1.0` to match the internal version.

- **Problem**: `TabIndicator` className test selected the wrong element because default `variant='line'` Tabs already renders an internal indicator; `querySelector('[data-part="indicator"]')` returned that one instead of the custom one.
  **Solution**: Use `variant='bg'` (which has no built-in indicator) as the host Tabs for the `TabIndicator` className test.

- **Problem**: CSS token assertion for `text` component incorrectly asserted `--ui-text-color-` was in the Less file. That variable is used in `index.tsx` as an inline style (`var(--ui-text-color-${color})`), not the Less file. The Less file uses bridge tokens.
  **Solution**: Assert bridge tokens `--text-color-current` and `--text-background-current` instead.

- **Problem**: After Round 1 branch coverage was 78.23% — below 80% threshold.
  **Solution**: Round 2 targeted menu icon branches (`MenuSeparator className`, `MenuTriggerItem icon+selected`, `MenuRadioItem icon`, `MenuCheckboxItem icon+no-value`) plus menu disabled branches, Tabs `onFocusChange`, and popover childRef merge branches to reach 80.75%.

- **Problem**: Popover `popupPortalContainer` as RefObject (line 645) and blur-timeout logic (lines 678-698) remain uncovered. These involve async focus events and complex ref callback chains that don't fire in jsdom.
  **Solution**: Accepted as genuine jsdom limitation. The 80% threshold accommodates these.

## Reusable Patterns

- **Branch coverage gap analysis workflow**: Run `vp test --coverage` from inside the package directory, read the uncovered line numbers from the report, look up each line in source, then write targeted tests for the specific conditional branch. Two rounds of this typically get from ~70% to >80%.
- **jsdom-hostile branch categories**: SSR guards (`typeof document !== 'undefined'`), ResizeObserver-dependent layout calculations, async blur/focus timeout chains, and complex ref callback chains are consistently untestable in jsdom at ≥80% threshold. Document these as expected gaps rather than writing fragile workarounds.
- **`@vitest/coverage-v8` version pinning**: When using coverage with a bundled test framework (like vite-plus), always check what vitest version is bundled and pin `@vitest/coverage-v8` to match. Mismatch produces cryptic runtime errors.

## Constitution Feedback

- [ ] Suggested update: Add a note in constitution.md Section VI (or create a Testing section) documenting the jsdom-hostile branch categories so future contributors know to accept those gaps rather than trying to work around them.

## Next Steps

- Add `onFocusChange` keyboard-trigger e2e test in Storybook stories (Tabs `Interaction` story) to get full coverage of the keyboard navigation path in a real browser.
- Popover blur-timeout and childRef paths may be testable with a more capable jsdom setup or via Storybook e2e.
