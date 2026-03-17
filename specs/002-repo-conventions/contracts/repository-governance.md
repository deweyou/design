# Repository Governance Contract

## Purpose

Define how repository conventions are communicated and enforced for contributors, reviewers, and automation.

## Contract Scope

- Root repository guidance
- Shared package authoring rules for `packages/components`, `packages/hooks`, and `packages/utils`
- Demo-app examples that should not model prohibited authoring patterns

## Rule-to-Enforcement Mapping

| Rule Area                                                                   | Primary Enforcement                                         | Secondary Enforcement                                | Notes                                                                 |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| Functions default to arrow functions                                        | Lint where safely expressible                               | Root or package `AGENTS.md`, code review             | Scope and exceptions must be explicit before enabling strict failures |
| React components use TSX instead of `createElement`                         | Lint or restricted-syntax check in governed React code      | Package `AGENTS.md`, example cleanup in demo apps    | Exceptions require documented tooling justification                   |
| File and folder names use lowercase hyphen separation                       | Path-based repository checks where scope is clear           | `AGENTS.md`, code review                             | Existing legacy paths may require incremental migration               |
| Utilities, hooks, and components use dedicated unit directories under `src` | Path-based repository checks for newly added governed units | Package `AGENTS.md`, code review                     | Migration should avoid accidental API breakage                        |
| Unit tests live beside the source unit as `index.test`                      | Repository checks for governed unit directories             | `AGENTS.md`, code review, `vp test`                  | Broader integration tests may still live outside unit folders         |
| Component changes preserve preview and accessibility review coverage        | Preview update requirements and review gates                | `vp test`, `website` validation, constitution checks | Applies when governed components are added or materially changed      |

## Contributor Expectations

1. Read root and local `AGENTS.md` guidance before editing governed packages.
2. Follow the unit-directory structure when adding new utilities, hooks, or components.
3. Keep demo code aligned with repository standards when it serves as an example of package usage.
4. Record exceptions when a rule cannot be followed safely in the current change.

## Reviewer Expectations

1. Confirm whether the changed paths are in governed scope.
2. Verify automated checks cover the mechanical parts of the rule.
3. Reject changes that rely on undocumented exceptions or that reintroduce conflicting patterns.
4. Require preview and accessibility evidence when component behavior is affected.

## Verification Contract

- `vp check` must validate formatting, lint, and type-safety expectations for the changed code.
- `vp test` must validate automated test coverage for affected packages or apps.
- Relevant demo or preview surfaces must remain reviewable when governed components change.

## Exception Contract

- Exceptions are allowed only when the current tooling or runtime boundary makes the default rule unsafe or impossible.
- Exceptions must be narrow in scope, documented in the change, and must not become the new default pattern.
- Deferred structural migrations must identify whether a later follow-up is required to eliminate the exception.
