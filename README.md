# Deweyou UI

A Vite+ monorepo for building and validating an opinionated React UI library.

## Workspace Layout

- `packages/utils`: framework-agnostic helpers and repository assertions.
- `packages/react-hooks`: reusable React hooks shared across apps and components.
- `packages/styles`: token sources, Less bridge files, and explicit global CSS entrypoints.
- `packages/react`: reusable React components with CSS Modules and root `className` overrides.
- `apps/website`: public documentation, theme guidance, and curated demos.
- `apps/storybook`: Storybook 10 internal review surface for state coverage and exploratory development.

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

- Run internal Storybook review:

```bash
vp run storybook#dev
```

## Publishing

Packages are versioned independently. Only packages with changes since their last release are published.

**Publish a beta package (from any non-`main` branch):**

```bash
scripts/release.sh beta
```

This bumps the version to `X.Y.Z-beta.N`, publishes to the `beta` dist-tag, and does not affect `latest`.

**Publish a stable release (from `main` only):**

```bash
scripts/release.sh stable
```

This infers the version bump from commit types (`fix` → patch, `feat` → minor, breaking → major), publishes to `latest`, and updates each package's `CHANGELOG.md`.

**Dry-run (no files written, no publish, no push):**

```bash
scripts/release.sh beta --dry-run
scripts/release.sh stable --dry-run
```

**Via GitHub Actions:** Go to Actions → Release → Run workflow, select `channel` and optionally enable `dry_run`.

Requires npm login locally (`npm login`) or `NODE_AUTH_TOKEN` in the environment for CI.

## Consuming the Library

### Importing Components

**Barrel import** — convenient for development; modern bundlers (Vite, Webpack 5, Rollup) will tree-shake unused components automatically because `sideEffects` is declared in each package:

```ts
import { Button, Text } from '@deweyou-design/react';
```

**Per-component import** — most explicit, recommended for production builds or bundlers without reliable tree-shaking:

```ts
import { Button } from '@deweyou-design/react/button';
import { Text } from '@deweyou-design/react/text';
```

### Styles

Each component's CSS is emitted as a side effect of its JS import. Bundlers that respect the `sideEffects` field (Vite, Webpack 5, Rollup) include component styles automatically when the component is imported.

To load all styles at once — for example in SSR or non-bundled contexts:

```ts
import '@deweyou-design/react/style.css';
```

## Monorepo Rules

- Reusable UI logic belongs in packages, not in apps.
- Use `vp` commands for install, lint, format, test, pack, build, and preview
  workflows.
- Functions default to arrow functions in governed packages and demo-app source.
- React components should be authored in TSX files instead of `React.createElement`
  patterns.
- Governed files and folders use lowercase names with hyphen separators.
- In `packages/react`, `packages/react-hooks`, and `packages/utils`, each source
  unit lives in its own `src/<unit-name>/` directory with colocated `index` and
  `index.test` files.
- Commit messages use `<type>(<scope>): <summary>` when a scope is useful, or
  `<type>: <summary>` otherwise.
- Consumers must import global styles from `@deweyou-design/styles/theme.css` explicitly.
- `apps/website` owns public guidance; `apps/storybook` stays focused on internal review.
- Storybook runs on the repository-standard `vp run storybook#dev` workflow and defaults to port `6106`.
- Every user-visible component change must include automated tests and updated preview coverage in `apps/website`.
- Generated documents under `specs/` must use Simplified Chinese, except for literal code identifiers, commands, paths, protocol fields, and third-party API names.
