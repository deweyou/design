# Data Model: Repository Conventions Standardization

## Convention Rule Set

**Purpose**: Represents the repository-level standards that govern code authoring, naming, structure, and verification.

**Fields**:

- `name`: Human-readable rule-set name
- `scope`: Packages, apps, and file categories covered by the rule set
- `functionStyleDefault`: Default function authoring style for governed code
- `componentAuthoringFormat`: Default source-file and authoring format for governed React components
- `namingPattern`: Required file and folder naming convention
- `structurePattern`: Required source-unit directory shape for utilities, hooks, and components
- `testLocationPolicy`: Expected relationship between source units and unit tests
- `adoptionPolicy`: Conditions for applying the rule to new work, migrated work, or deferred legacy files
- `verificationPolicy`: Required automation and review checks

**Validation Rules**:

- Must define governed scope explicitly.
- Must state whether each rule is automated, documented, review-enforced, or hybrid.
- Must identify exceptions or non-governed areas if they exist.

## Governed Source Unit

**Purpose**: Represents a utility, hook, or component subject to the repository conventions.

**Fields**:

- `category`: Utility, hook, or component
- `package`: Owning package name
- `sourceRoot`: Location under `src`
- `directoryName`: Lowercase, hyphen-separated unit directory name
- `entryFile`: Unit-local `index` entry file
- `testFile`: Unit-local `index.test` file
- `styleFile`: Optional unit-local style file when relevant
- `previewCoverage`: Whether the unit requires preview or demo representation
- `accessibilityCoverage`: Whether keyboard, semantics, and state behavior need explicit review artifacts

**Validation Rules**:

- Must live in an owning package under `src`.
- Must use a dedicated unit directory when in governed scope.
- Must colocate unit tests when the unit is expected to have direct automated coverage.

## Enforcement Mechanism

**Purpose**: Represents how a specific convention rule is enforced in practice.

**Fields**:

- `ruleReference`: Link to the applicable part of the convention rule set
- `mechanismType`: Lint, agent guidance, review checklist, preview requirement, or test gate
- `targetPaths`: Files or directories where the mechanism applies
- `failureMode`: What counts as non-compliance
- `exceptionHandling`: How approved exceptions are recorded or reviewed

**Validation Rules**:

- Each high-priority convention rule should map to at least one enforcement mechanism.
- Mechanisms must be scoped tightly enough to avoid blocking unrelated repository areas.

## Adoption Decision

**Purpose**: Records how a maintainer treats a legacy artifact encountered during incremental adoption.

**Fields**:

- `artifactPath`: Existing file or directory under review
- `decision`: Rename, relocate, align opportunistically, or defer
- `reason`: Why the decision was chosen
- `publicApiImpact`: Whether imports or consumer expectations could change
- `followUpNeeded`: Whether later migration work must be scheduled

**State Transitions**:

- `identified` -> `aligned` when the artifact is updated to follow the rule set
- `identified` -> `deferred` when migration risk outweighs immediate cleanup
- `deferred` -> `scheduled` when dedicated cleanup work is created
- `scheduled` -> `aligned` when follow-up work lands
