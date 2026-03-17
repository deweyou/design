# Data Model: Upgrade Storybook to Latest

## Storybook Dependency Set

**Description**: The collection of Storybook packages that must stay aligned to one stable release line for the internal preview app to work predictably.

**Fields**:

- `packageName`: Storybook-related package identifier
- `currentRange`: Version range currently declared in the shared catalog or app manifest
- `targetRange`: Planned stable release line after the upgrade
- `role`: Core CLI, framework adapter, addon, or testing support
- `status`: aligned, skewed, deprecated, removed, or replacement-needed

**Relationships**:

- A `Storybook Dependency Set` entry may be consumed by the `Preview App Configuration`.
- A `Storybook Dependency Set` entry may require updates to one or more `Story Authoring Surface` records.

**Validation Rules**:

- All active Storybook dependencies must align to one stable release line.
- Deprecated or removed packages must be replaced or explicitly removed before the upgrade is considered complete.
- No Storybook dependency may remain pinned to an older incompatible major or patch line once the target release is selected.

## Preview App Configuration

**Description**: The internal Storybook configuration that defines story discovery, addons, framework integration, docs behavior, and preview-level parameters.

**Fields**:

- `configArea`: main config, preview config, or package script entrypoint
- `ownedBy`: `apps/storybook`
- `purpose`: Story discovery, addon registration, docs naming, backgrounds, or preview defaults
- `compatibilityState`: unchanged, migrated, deprecated-pattern, or blocked
- `migrationNotes`: Contributor-facing explanation of any required changes

**Relationships**:

- The `Preview App Configuration` references multiple `Storybook Dependency Set` entries.
- The `Preview App Configuration` governs one or more `Story Authoring Surface` records.

**Validation Rules**:

- Configuration must remain valid under the target Storybook release line.
- Preview config must preserve explicit import of the shared theme CSS unless a repository-approved replacement is documented.
- The app must remain an internal review surface and not become the sole public documentation source.

## Story Authoring Surface

**Description**: A story or docs entry reviewed by maintainers inside `apps/storybook`.

**Fields**:

- `storyPath`: Source file path within `apps/storybook/src/stories`
- `storyTitle`: Navigation title shown to reviewers
- `storyType`: canvas story, autodocs entry, or interactive state review
- `featureUsage`: args, tags, docs, backgrounds, interactions, or other Storybook feature usage
- `migrationRisk`: low, medium, or high based on deprecated or changed patterns

**Relationships**:

- A `Story Authoring Surface` is discovered through the `Preview App Configuration`.
- A `Story Authoring Surface` consumes reusable components from `packages/components`.

**Validation Rules**:

- Representative stories must remain discoverable after the upgrade.
- Interactive controls and docs behavior used by existing stories must remain reviewable or be replaced with documented equivalents.
- Story titles must continue to reflect the internal-review scope of the app.

## Upgrade Notes

**Description**: The maintainer-facing summary of upgrade scope, resolved migration items, and any deferred follow-up work.

**Fields**:

- `scope`: What changed in the upgrade
- `resolvedIssues`: Migration blockers or warnings handled during the upgrade
- `knownFollowUps`: Remaining non-blocking cleanup tasks
- `workflowImpact`: Any contributor-facing behavior change
- `verificationRecord`: Commands and manual checks used to validate the upgrade

**Relationships**:

- `Upgrade Notes` summarize changes across `Storybook Dependency Set`, `Preview App Configuration`, and `Story Authoring Surface`.

**Validation Rules**:

- Upgrade notes must clearly distinguish completed migration work from deferred follow-up.
- Upgrade notes must mention any authoring pattern or dependency change that future component contributors need to know.
