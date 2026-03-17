# Feature Specification: Repository Conventions Standardization

**Feature Branch**: `002-repo-conventions`  
**Created**: 2026-03-17  
**Status**: Draft  
**Input**: User description: "我想先来约束一下整个仓库的一些规范: 函数默认使用箭头函数; react 组件统一使用 tsx,而不要使用 createElement; 文件夹和文件命名都用小写+横线; utils 和 hooks 的项目结构是在 src 下,每个工具函数或者 hook单独一个目录, 里面存放 index 和 index.test, 就不需要跟src并行有一个 test了,单测放在对应目录里比较好维护; components 也是如此."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Enforce Shared Authoring Rules (Priority: P1)

As a contributor, I want clear repository-wide authoring rules for functions, component source files, and naming so that new code follows a consistent style without team-by-team interpretation.

**Why this priority**: Without a single baseline, contributors will continue to introduce mixed patterns that increase review cost and make the codebase harder to scan.

**Independent Test**: Can be fully tested by reviewing the documented rules and verifying that a contributor can determine the correct function style, component file format, and naming pattern for a new change without consulting maintainers.

**Acceptance Scenarios**:

1. **Given** a contributor is creating a new non-class function, **When** they consult the convention specification, **Then** the specification states that arrow-function style is the default pattern.
2. **Given** a contributor is creating a new React component, **When** they consult the convention specification, **Then** the specification states that component source files use TSX and do not rely on `createElement`-based authoring.
3. **Given** a contributor is naming a new file or directory, **When** they consult the convention specification, **Then** the specification states that names use lowercase words separated by hyphens.

---

### User Story 2 - Standardize Shared Source Layout (Priority: P2)

As a maintainer, I want shared utilities, hooks, and components to follow one directory pattern so that repository structure is predictable and code can be found quickly.

**Why this priority**: Structure inconsistency slows down maintenance, increases review overhead, and makes refactoring across packages more error-prone.

**Independent Test**: Can be fully tested by checking whether a maintainer can infer the expected location and directory shape for a new utility, hook, or component from the specification alone.

**Acceptance Scenarios**:

1. **Given** a contributor adds a new utility or hook, **When** they create the source structure, **Then** the item is placed under `src` in its own dedicated directory.
2. **Given** a contributor adds a new component, **When** they create the source structure, **Then** the component is placed under `src` in its own dedicated directory.
3. **Given** a contributor reviews the expected directory shape for a utility, hook, or component, **When** they consult the specification, **Then** the structure includes an `index` entry file and a colocated `index.test` test file within that same directory.

---

### User Story 3 - Co-locate Tests With Source Units (Priority: P3)

As a maintainer, I want tests for shared source units to live beside the source they verify so that updates, reviews, and future cleanup happen in one place.

**Why this priority**: Co-located tests reduce the chance of orphaned test files and make the relationship between a source unit and its coverage easier to understand.

**Independent Test**: Can be fully tested by confirming that the specification disallows parallel top-level test directories for utilities, hooks, and components when the corresponding source unit already has a dedicated directory.

**Acceptance Scenarios**:

1. **Given** a contributor adds or updates a utility, hook, or component, **When** they add tests for that unit, **Then** the tests are stored in the unit's own directory rather than in a parallel top-level test tree.
2. **Given** a reviewer inspects a new shared source unit, **When** they look at the expected structure, **Then** source and tests can be located together without traversing a separate test hierarchy.

### Edge Cases

- When an existing file or directory does not follow the new naming pattern, the convention must define that newly added or migrated artifacts adopt the standard rather than creating a second competing pattern.
- When a source unit does not yet have automated tests, the required directory structure must still reserve the unit-local location where `index.test` belongs.
- When a contributor adds keyboard- or screen-reader-sensitive components, the colocated test and preview expectations must still cover the relevant interaction states.
- When a component appears in multiple theme or token contexts, the convention must still keep previews and tests tied to the same source unit directory instead of splitting them into separate structures.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The repository standard MUST define arrow-function style as the default authoring pattern for functions created or updated within scope of this policy.
- **FR-002**: The repository standard MUST define TSX-based component source files as the default format for React components created or updated within scope of this policy.
- **FR-003**: The repository standard MUST prohibit `createElement`-style component authoring as the default pattern for new or updated React component implementations.
- **FR-004**: The repository standard MUST require lowercase, hyphen-separated naming for new and migrated files and directories within the governed areas of the repository.
- **FR-005**: The repository standard MUST define that shared utilities live under `src`, with each utility occupying its own dedicated directory.
- **FR-006**: The repository standard MUST define that shared hooks live under `src`, with each hook occupying its own dedicated directory.
- **FR-007**: The repository standard MUST define that shared components live under `src`, with each component occupying its own dedicated directory.
- **FR-008**: The repository standard MUST require each governed utility, hook, and component directory to include an `index` entry file and a colocated `index.test` test file.
- **FR-009**: The repository standard MUST define that tests for governed utilities, hooks, and components are maintained in the same directory as the source unit rather than in a parallel top-level test directory.
- **FR-010**: The repository standard MUST describe how contributors determine whether an existing artifact should be renamed, relocated, or left unchanged during incremental adoption.
- **FR-011**: The repository standard MUST define the public API surface expectations for any affected shared package so that reorganizing internal directories does not create ambiguity about what consumers should import.
- **FR-012**: The repository standard MUST preserve accessibility review expectations for components, including semantic structure, focus behavior, keyboard interaction, and assistive-technology labels, even when source files and tests are reorganized.
- **FR-013**: The repository standard MUST state whether new design tokens, theme hooks, or visual primitives are introduced by this policy change or whether existing ones remain sufficient.
- **FR-014**: The repository standard MUST require preview coverage for governed components in `website`, including primary, edge, and disabled or error states, so structural changes do not hide reviewable behavior.
- **FR-015**: The repository standard MUST define a commit message convention for contributor and agent authored commits, including the required subject format and expected scope usage.

### Accessibility and UI Contract _(mandatory for UI work)_

- **User roles / actors**: Contributor adding code, maintainer reviewing structure, keyboard-only user, screen-reader user, package consumer validating imports, designer validating previews and tokens
- **Interaction model**: Documentation-guided authoring, directory-based discovery, keyboard review of component behavior, source-and-test colocation, preview inspection for component states
- **States to cover**: Default, hover, focus-visible, disabled, error, empty, loading, and any keyboard-navigation state relevant to governed components
- **Theming / token impact**: No new token requirement is assumed; the policy must explicitly confirm reuse of existing theme and token patterns unless a later implementation phase proves a gap

### Key Entities _(include if feature involves data)_

- **Convention Rule Set**: The authoritative set of repository rules covering function style, component source format, naming pattern, directory structure, test colocation, and adoption expectations.
- **Commit Convention**: The required commit subject pattern contributors and agents use when recording changes in the repository history.
- **Governed Source Unit**: A utility, hook, or component that is subject to the convention rule set and is expected to live in its own `src` subdirectory with colocated entry and test files.
- **Adoption Decision**: The contributor or maintainer choice to rename, relocate, or defer changes for an existing artifact while keeping new work aligned with the standard.

## Assumptions

- The policy applies first to utilities, hooks, and components that contributors newly add or materially update, allowing incremental adoption across the repository.
- Existing public import behavior should remain understandable during adoption, even if internal folder layouts change over time.
- Co-located unit tests remain the default expectation for governed source units; broader integration or end-to-end coverage may continue to live elsewhere when needed.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of newly created or materially updated utilities, hooks, and components in governed areas follow the documented naming and directory rules during review.
- **SC-002**: Contributors can identify the correct directory structure and file naming pattern for a new governed source unit in under 2 minutes using the specification alone.
- **SC-003**: Reviewers can determine whether a change follows the repository convention without requesting clarification on function style, component file format, or test location in at least 90% of sampled pull requests after rollout.
- **SC-004**: At least 90% of newly added governed source units include colocated test coverage in the expected directory at the time the change is merged.
- **SC-005**: All governed components continue to expose reviewable primary and edge states in the project preview surface after the convention is adopted.
