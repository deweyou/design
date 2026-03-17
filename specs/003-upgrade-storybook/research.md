# Research: Upgrade Storybook to Latest

## Decision: Target the current stable Storybook 10.2 release line

**Rationale**: Storybook's official docs and release pages currently present version 10.2 as the active stable line, so "latest" should be planned as a 10.2 target rather than another 8.6 patch. Upgrading now absorbs the major-version migration before more components and stories are added.

**Alternatives considered**:

- Stay on 8.6.x and only fix version skew: rejected because it leaves the major-version breakage risk for a later phase when more component work will depend on Storybook.
- Stop at 9.1: rejected because it reduces immediate migration risk but does not satisfy the request to move to the latest stable release.

## Decision: Plan the upgrade as an 8.6.x -> 9.1 -> 10.2 migration path

**Rationale**: Storybook's official migration guidance for 10 states that projects on versions earlier than 9 must upgrade to 9 first. The plan therefore needs an explicit two-step compatibility review even if implementation lands in one branch.

**Alternatives considered**:

- Treat the change as a direct 8-to-10 jump with no intermediate migration review: rejected because it ignores the official migration sequence and makes breakage harder to reason about.
- Split 9 and 10 into separate feature branches: rejected for now because the user intent is to upgrade now while the surface area is still small.

## Decision: Keep the React + Vite framework pairing and preserve the current app shape

**Rationale**: The current app already uses `@storybook/react-vite`, TypeScript-based ESM config, and a dedicated `apps/storybook` boundary. This matches Storybook's supported React-with-Vite framework guidance and minimizes migration scope.

**Alternatives considered**:

- Rebuild Storybook from scratch with a different framework preset: rejected because it adds unnecessary churn and hides upgrade regressions behind a larger rewrite.
- Collapse Storybook into `apps/website`: rejected because repository guidance keeps Storybook as an internal review surface, not the primary public docs surface.

## Decision: Align every Storybook-related dependency to one release line and remove obsolete package usage

**Rationale**: The current workspace already shows version skew between `@storybook/react`, `@storybook/react-vite`, `@storybook/test`, and the root `storybook` package. Storybook 9 migration guidance also consolidates or removes several packages and moves some imports under the `storybook/*` namespace, so planning must include package inventory cleanup rather than only bumping versions. The implemented result uses `storybook`, `@storybook/react`, `@storybook/react-vite`, and `@storybook/addon-docs` on `10.2.19`, and removes legacy `@storybook/addon-essentials`, `@storybook/addon-interactions`, and `@storybook/test`.

**Alternatives considered**:

- Upgrade only the packages that currently produce peer warnings: rejected because partial alignment leaves hidden incompatibilities in the toolchain.
- Keep deprecated packages if they still install: rejected because Storybook 10 is stricter and deprecations from 9 are likely to become removals.

## Decision: Use repository-standard `vp` and catalog-managed dependency updates, while treating Storybook's automigration guidance as reference material

**Rationale**: Storybook's official migration pages recommend `storybook@latest upgrade`, but this repository's constitution requires dependency and workflow changes to run through Vite+ commands and the shared catalog. The safe plan is to follow Storybook's migration notes and validations while performing dependency changes through repository-standard mechanisms.

**Alternatives considered**:

- Run the Storybook CLI upgrader as the primary workflow: rejected because it conflicts with repository tooling discipline and may bypass catalog ownership.
- Ignore the official migration tool entirely: rejected because the automigration guidance still helps identify package removals, config updates, and known pitfalls.

## Decision: Preserve explicit style import and internal-review story scope as non-negotiable compatibility constraints

**Rationale**: `apps/storybook` is explicitly scoped to internal review, and its preview currently imports `@deweyou-ui/styles/theme.css` directly. These behaviors are local repository contracts, not Storybook defaults, so the migration plan must keep them intact even if Storybook suggests broader docs or testing features.

**Alternatives considered**:

- Expand Storybook into a public documentation surface during the upgrade: rejected because it changes product scope and duplicates `apps/website`.
- Move global style setup into component packages: rejected because it violates the repository's explicit global style import rule.

## Decision: Validate the migration primarily through buildability, story accessibility, and maintainer workflow continuity

**Rationale**: The current Storybook app is small. The most meaningful proof of a successful upgrade is that maintainers can install, build, open, and navigate the preview without dependency mismatches, broken story discovery, or lost docs and controls behavior.

**Alternatives considered**:

- Measure success only by dependency version updates: rejected because version alignment alone does not prove the review workflow still works.
- Rely only on manual review: rejected because the constitution requires repeatable validation commands and preview coverage.

## Implemented Validation Result

**Decision**: Keep the normal maintainer entrypoint as `vp run storybook#dev`, but move the default dev port to `6106`.

**Rationale**: The environment used for validation already had a conflict on `6006`. Moving the default script to `6106` gives the workspace a predictable Storybook port and keeps the standard Vite+ workflow intact.

**Alternatives considered**:

- Keep port `6006`: rejected because it conflicted during end-to-end validation of the upgraded app.
- Require maintainers to pass a manual port override every time: rejected because it weakens the default workspace workflow.
