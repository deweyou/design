# Phase 0 Research: Repository Conventions Standardization

## Decision 1: Split enforcement across lint, agent guidance, and review gates

**Decision**: Use repository-level lint for mechanically detectable rules, use root and package `AGENTS.md` for contributor guidance and agent behavior, and use review plus preview requirements for structural and accessibility-sensitive rules that are not reliably lintable.

**Rationale**: Not every repository convention is equally enforceable. Banning `React.createElement` in normal component authoring and discouraging certain naming patterns can be automated, but directory topology and incremental migration decisions need context. A layered governance model avoids overpromising lint coverage and keeps human-readable policy close to the code.

**Alternatives considered**:

- Put everything in lint only: rejected because structure and migration rules are difficult to enforce accurately with built-in lint configuration alone.
- Put everything in documentation only: rejected because purely descriptive rules drift quickly and fail to prevent regressions.
- Enforce everything only in code review: rejected because reviewers should not spend time catching trivial mechanical violations.

## Decision 2: Treat `createElement` and arrow-function defaults as automation candidates

**Decision**: Plan automated checks for disallowed `createElement`-style authoring in governed React component code and for default function-style expectations where the rule can be expressed safely; document fallback review guidance for cases where automated checks cannot distinguish all valid exceptions.

**Rationale**: These are the highest-signal style constraints from the request and they already have supporting context in package guidance. They also influence how contributors write new code immediately, so partial automation provides fast value.

**Alternatives considered**:

- Skip automated checks and rely on package `AGENTS.md`: rejected because the repository already has lint infrastructure and this class of rule is visible enough to justify automation.
- Enforce arrow functions universally without exceptions: rejected because some files may require exceptions such as framework entry points, class methods, or generated code, so the policy should define scope and exceptions clearly before implementation.

## Decision 3: Treat directory naming and source-test colocation as repository policy with selective automation

**Decision**: Document lowercase hyphen naming and colocated `index` / `index.test` structure as repository policy first, then add selective automated checks only where package boundaries and path patterns make false positives unlikely.

**Rationale**: The package layout already shows separate `src` and `tests` directories in shared packages, so this feature needs an incremental migration path rather than an all-at-once rewrite. A policy-first decision allows the implementation phase to introduce path checks for new additions while avoiding brittle blanket rules against the entire existing tree.

**Alternatives considered**:

- Fail all existing non-conforming paths immediately: rejected because the repository currently contains legacy patterns and this would create a noisy, low-value migration spike.
- Ignore automation entirely for paths: rejected because targeted checks for newly added governed source units can still provide value once the migration scope is defined.

## Decision 4: Update root and package `AGENTS.md` to make the rules discoverable at authoring time

**Decision**: Add or refine guidance in the root `AGENTS.md` and affected package `AGENTS.md` files so contributors and agents see the repository conventions before editing package code.

**Rationale**: This repository already uses `AGENTS.md` as an operational guidance surface. Extending that mechanism is lower-friction than inventing another instruction channel, and it complements lint by explaining why rules exist and where exceptions are allowed.

**Alternatives considered**:

- Keep all policy only in the feature spec: rejected because specs are not the day-to-day authoring surface.
- Add guidance only to package READMEs: rejected because the current repository pattern already relies on `AGENTS.md` for active coding constraints.

## Decision 5: Use demo applications as compliance examples, not as the source of truth

**Decision**: Align demo-app examples such as `apps/website` with the new conventions when they currently model disallowed patterns, but keep the source of truth in repository governance and shared package guidance.

**Rationale**: Demo code influences contributor behavior. If the repository bans `createElement` in normal component authoring while the main website still demonstrates it, the policy will undermine itself. Updating examples is necessary, but examples should remain downstream evidence rather than the policy definition.

**Alternatives considered**:

- Leave existing examples untouched until later: rejected because contradictory examples would weaken adoption from the start.
- Define policy only through example code: rejected because examples cannot explain exceptions, migration rules, or enforcement boundaries clearly enough.
