# Quickstart: Upgrade Storybook to Latest

## Goal

Validate that the internal Storybook review app has been upgraded to the current stable release line without breaking the contributor workflow.

## Setup Flow

1. Install workspace dependencies using the repository-standard workflow:

```bash
vp install
```

2. Confirm Storybook version ownership is centralized in the workspace catalog and consumed by `apps/storybook/package.json`.
3. Review `apps/storybook/.storybook/main.ts` and `apps/storybook/.storybook/preview.ts` for any documented migration changes.

## Maintainer Validation Flow

1. Run the standard workspace validation:

```bash
vp check
vp test
```

2. Build the internal preview app:

```bash
vp run storybook#build
```

3. Start the internal preview app and open a representative story:

```bash
vp run storybook#dev
```

4. Confirm the following in the running preview:
   - Storybook is reachable on `http://localhost:6106/`
   - the story navigation still shows the expected internal review grouping
   - a representative story renders in canvas view
   - docs content remains reachable for a story that uses autodocs
   - interactive controls remain usable
   - theme styling still loads from the shared styles package

## Migration Review Checklist

1. Verify there are no unresolved Storybook version-mismatch warnings.
2. Verify deprecated or removed Storybook packages are no longer required by the app.
3. Verify any contributor-facing authoring changes are captured in upgrade notes.
4. Verify `apps/storybook` still functions as an internal review surface rather than public docs.

## Follow-up Notes

- Implemented target: Storybook `10.2.19`.
- The workspace now uses `@storybook/addon-docs`, `@storybook/react`, `@storybook/react-vite`, and `storybook` on one aligned release line.
- Verified on 2026-03-17 with `vp check`, `vp test`, `vp run storybook#build`, and `vp run storybook#dev`.
