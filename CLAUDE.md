# UI Development Guide

## Knowledge Base

- [Ark UI component pattern](docs/architecture/ark-ui.md) - behavior-layer selection and implementation rules for interactive components.
- [Package layer rules](docs/architecture/package-layers.md) - boundaries between published packages and build infrastructure.
- [Testing architecture](docs/architecture/testing.md) - responsibility boundaries for unit tests, contract tests, style tests, and Storybook e2e.

## Technical Stack

- TypeScript 5.x, React 19.x, Node.js 24.14.0
- vite-plus for build, test, lint, and formatting
- React, Less, CSS Modules, Storybook
- `@ark-ui/react` for interactive component behavior and `@deweyou-design/styles` for design tokens

## Project Structure

```text
packages/
├── react/        # @deweyou-design/react - React component library
├── react-hooks/  # @deweyou-design/react-hooks - shared React hooks
├── react-icons/  # @deweyou-design/react-icons - React icon components
├── styles/       # @deweyou-design/styles - design tokens
├── utils/        # @deweyou-design/utils - runtime utilities
├── mcp/          # @deweyou-design/mcp - AI/MCP context for external agents
└── infra/        # @deweyou-ui/infra - build infrastructure, not published
apps/
├── website/      # component preview site
└── storybook/    # component stories
```

## Commands

```bash
vp check            # typecheck + lint + format
vp test             # run tests
vp run build -r     # full build
vp run website#dev  # start preview site
vp install          # install dependencies
```

---

## Repository Conventions

- Use arrow functions by default. Function declarations are allowed only when a framework boundary, hoisting requirement, or external API constraint makes them safer; explain the exception in the change.
- React components must be written in **TSX files**. Do not introduce `React.createElement` component implementations unless a clear tooling limitation is documented.
- New or renamed files and directories in governed areas must use lowercase kebab-case names.
- In `packages/react`, `packages/react-hooks`, and `packages/infra`, each governed source unit should live in its own `src/<unit-name>/` directory.
- Each governed source unit should keep its local entry and unit test colocated as `index` and `index.test`.
- New packages under `packages/` must not keep package-specific build config by default; prefer shared Vite+ conventions.
- Commit messages use `<type>(<scope>): <summary>` when scope is meaningful, or `<type>: <summary>`.
- Recommended commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `chore`.
- Commit subjects use imperative mood, lowercase wording, and one logical change. `.vite-hooks/commit-msg` enforces the format.

## Documentation Language

- Root `README.md`, `AGENTS.md`, `CLAUDE.md`, and durable knowledge under `docs/` are maintained in English.
- Keep Chinese user-facing README content in `README_ZH.md`; root `README.md` and `README_ZH.md` must keep language switch links.
- Historical spec archives under `docs/specs/` and `docs/superpowers/` do not need retroactive translation unless a task explicitly targets them.
- Future knowledge-base updates should be written in English by default. Preserve code identifiers, commands, package names, API names, and version strings exactly.

## Harness Development

AI-assisted development context and repository memory:

- **Knowledge base root**: [docs/](docs/) - future repository knowledge is stored under `docs/`.
- **Constitution**: [docs/constitution.md](docs/constitution.md)
- **Design system**: [docs/design/system.md](docs/design/system.md)
- **Testing standards**: [docs/testing-standards.md](docs/testing-standards.md)
- **Feature specs index**: [docs/specs/index.md](docs/specs/index.md)

> Topic knowledge files, such as `docs/design/system.md`, are added by archive steps when reusable patterns appear.
