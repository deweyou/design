# Quickstart: Repository Conventions Standardization

## Goal

Implement repository governance so the requested conventions are visible at authoring time and enforced automatically where practical.

## Recommended Implementation Order

1. Update root governance files:
   - Refine the root `AGENTS.md` to document repository-wide authoring and structure rules.
   - Align package `AGENTS.md` files for `components`, `hooks`, and `utils` so package-local expectations match the repository policy.

2. Add automation for mechanical rules:
   - Extend repository lint or check configuration for rules that can be validated reliably.
   - Prioritize `createElement` restrictions in governed React code and any safe function-style checks.
   - Add path-based validation only for clearly governed package areas to avoid false positives on legacy code.

3. Align example and preview surfaces:
   - Remove contradictory demo patterns from `apps/website` or other visible examples.
   - Ensure component preview expectations remain intact for any package changes.

4. Migrate source layout incrementally:
   - Apply the new directory shape to new or materially updated utilities, hooks, and components first.
   - Track legacy paths that need follow-up instead of forcing broad churn in the initial change.

## Validation

Run:

```sh
vp check
vp test
```

Then manually verify:

- Root and package `AGENTS.md` guidance is consistent.
- Demo apps no longer present prohibited patterns as the preferred approach.
- Governed packages expose a clear path for colocated tests and unit directories.

## Expected Outcome

Contributors should be able to infer the correct authoring style and directory structure from repository guidance, while automated checks catch the mechanical violations before review.
