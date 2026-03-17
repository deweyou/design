<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->

## Active Technologies

- TypeScript 5.x, React 19.x-compatible APIs, Node.js 24.14.0 baseline + vite-plus, Storybook 10.2 target line, React, React DOM, TypeScrip (003-upgrade-storybook)
- File-based source, config, and generated preview artifacts only (003-upgrade-storybook)

- TypeScript 5.x, React 19.x-compatible package APIs, Node.js 24.14.0 baseline + `vite-plus`, React, Less, Storybook, CSS Modules, monorepo package workspaces (002-repo-conventions)
- File-based source tree and generated package artifacts; no persistent runtime storage (002-repo-conventions)

- TypeScript 5.x, React 19.x-compatible package APIs, Node.js 24.14.0 tooling baseline + vite-plus, React, Less, Storybook, TypeScript, CSS Modules (001-ui-monorepo-foundation)
- File-based source and generated style artifacts only (001-ui-monorepo-foundation)

## Recent Changes

- 001-ui-monorepo-foundation: Added app/package monorepo boundaries, explicit style imports, controlled theme tokens, and Storybook/website surface separation
- 002-repo-conventions: Added repository governance for arrow functions, TSX-first React authoring, kebab-case naming, and colocated unit tests in governed packages

## Repository Conventions

- Functions default to arrow-function style in governed source files. Use a function declaration only when a framework boundary, hoisting requirement, or external API makes it the safer choice, and document the exception in the change.
- React components must be authored in TSX files. Do not introduce `React.createElement`-style component authoring in packages or demo apps unless a concrete tooling limitation is documented.
- New or renamed files and folders in governed areas must use lowercase names with hyphen separators.
- In `packages/components`, `packages/hooks`, and `packages/utils`, each governed source unit lives in its own `src/<unit-name>/` directory.
- Each governed source unit keeps its local entry file and unit test together as `index` and `index.test` within that unit directory.
- Preserve package root entrypoints when relocating source files so consumers keep importing from the documented package surface.
- Top-level package `tests/` directories are reserved for cross-cutting or workspace-boundary coverage once a governed unit has its own colocated unit test.
- Commit messages must use the format `<type>(<scope>): <summary>` when a scope is meaningful, or `<type>: <summary>` when it is not.
- Preferred commit types are `feat`, `fix`, `refactor`, `docs`, `test`, `build`, and `chore`.
- Keep commit subjects imperative, lowercase, and focused on one logical change set.
- The repository enforces this format through `.vite-hooks/commit-msg`.
