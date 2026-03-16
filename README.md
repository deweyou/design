# Deweyou UI

A Vite+ monorepo for building and validating an opinionated React UI library.

## Workspace Layout

- `packages/utils`: framework-agnostic helpers and repository assertions.
- `packages/hooks`: reusable React hooks shared across apps and components.
- `packages/styles`: token sources, Less bridge files, and explicit global CSS entrypoints.
- `packages/components`: reusable components with CSS Modules and root `className` overrides.
- `apps/website`: public documentation, theme guidance, and curated demos.
- `apps/storybook`: internal review surface for state coverage and exploratory development.

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run workspace tests:

```bash
vp run test -r
```

- Build the monorepo:

```bash
vp run build -r
```

- Run the component preview site:

```bash
vp run dev
```

## Monorepo Rules

- Reusable UI logic belongs in packages, not in apps.
- Use `vp` commands for install, lint, format, test, pack, build, and preview
  workflows.
- Consumers must import global styles from `@deweyou-ui/styles/theme.css` explicitly.
- `apps/website` owns public guidance; `apps/storybook` stays focused on internal review.
- Every user-visible component change must include automated tests and updated preview coverage in `apps/website`.
