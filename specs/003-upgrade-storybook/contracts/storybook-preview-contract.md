# Contract: Storybook Preview Upgrade

## Purpose

Define the maintainer-facing contract that must remain stable while `apps/storybook` is upgraded to the latest Storybook release line.

## Dependency Alignment Contract

- All Storybook-related packages used by `apps/storybook` must resolve to one shared stable release line.
- Shared version ownership belongs in the workspace catalog, with `apps/storybook/package.json` consuming catalog references rather than hard-coded one-off versions.
- Deprecated or removed Storybook packages must not remain in active use once the upgrade is complete.
- The current aligned release line is `10.2.19` for `storybook`, `@storybook/react`, `@storybook/react-vite`, and `@storybook/addon-docs`.

## App Boundary Contract

- `apps/storybook` remains an internal review and state-validation surface.
- The upgrade must not move official public documentation ownership away from `apps/website`.
- Reusable component behavior, tokens, or hooks must continue to live in `packages/*`, not inside Storybook-only source files.

## Preview Configuration Contract

- Story discovery remains scoped to internal review stories under `apps/storybook/src`.
- The preview shell continues to load shared global styles explicitly from `@deweyou-ui/styles/theme.css`.
- Main and preview configuration must remain valid for the target Storybook release and for the repository's Node baseline.

## Story Authoring Contract

- Existing representative stories must remain discoverable from the Storybook navigation.
- Canvas and docs views used by current stories must remain available, or any intentional replacement must be documented in upgrade notes.
- Story labels and docs copy must continue to communicate the internal-review scope of the app.

## Verification Contract

- The upgraded workspace must pass `vp check`.
- The upgraded workspace must pass `vp test`.
- The internal review app must build successfully with `vp run storybook#build`.
- Maintainers must be able to open the preview app with `vp run storybook#dev` and verify representative stories, docs visibility, and interactive controls without unresolved dependency mismatch warnings.
- The repository-standard Storybook dev workflow listens on port `6106` unless a maintainer overrides it intentionally.
