# Deweyou UI

A Vite+ monorepo for building and validating a reusable UI component library.

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

- Reusable UI logic belongs in packages, not only in `website`.
- Use `vp` commands for install, lint, format, test, pack, build, and preview
  workflows.
- Every user-visible component change must include automated tests and updated
  preview coverage in `website`.
