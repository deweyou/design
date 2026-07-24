# DateRangePicker Implementation Plan

Date: 2026-07-24

1. Add public and style contract tests for the range value types, two indexed
   inputs, Ark range state, mode normalization, field states, and exports.
2. Extract only the DatePicker date/time helpers that gain real second callers;
   preserve existing single-value behavior with its current tests.
3. Implement the unified range control and date/month/year Ark range branch.
4. Add transactional date-time range state, endpoint time-wheel editing,
   ordering validation, Today, Now, and configured step handling.
5. Add range styling for endpoint circles, interior and hover bands, unified
   inputs, date-labeled endpoint time controls, active endpoint hierarchy,
   sizes, themes, and coarse pointers.
6. Add DateRangePicker Storybook overview, mode, format/parse, constraints,
   state, showTime, and Interaction cases.
7. Update root/subpath exports, package contract tests, website, MCP metadata,
   READMEs, design documentation, `llms.txt`, and the repository-owned
   component skill.
8. Run focused tests, `vp check`, `vp test`, Storybook e2e, recursive build,
   `git diff --check`, and live browser verification.
