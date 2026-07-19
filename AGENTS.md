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

## Component Delivery Flow

- When adding or substantially modifying a component, also deliver colocated unit tests, Storybook `Interaction` e2e coverage, and necessary package/export/docs contract tests by default.
- When adding, removing, or changing the public import or behavior contract of a component, update `README.md`, `README_ZH.md`, `docs/design/components.md`, `packages/react/package.json` exports, `packages/react/src/index.ts`, the website catalog or dedicated website page, Storybook coverage, package/export/docs contract tests, MCP catalog metadata, and regenerated `apps/website/public/llms.txt`.
- Update repo-owned skills such as `skills/deweyou-design-components/SKILL.md` when a component change also changes agent workflow, routing, checklist, or verification guidance; do not edit dependency skills in-place.
- If a change contains a new design decision, component boundary, or future evolution direction, record it in `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- At wrap-up, run `vp check`, `vp test`, and related Storybook e2e. When adding or modifying a Storybook story, run `vp run storybook#test`; run `vp run build -r` when needed.

## Documentation Language

- Root `README.md`, `AGENTS.md`, and durable knowledge under `docs/` are maintained in English.
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

> Scripts and templates are managed by harness-dev under `docs/.scripts/`; do not edit them manually.
> Topic knowledge files, such as `docs/design/system.md`, are added by archive steps when reusable patterns appear.

<!-- deweyou-agent:start -->

## Dewey Workflow

This repository uses Dewey's personal agent workflow. Inspect `.agents/` before making changes, then run `deweyou-cli agent context --format markdown` and follow the returned rules, skill index, asset paths, and runtime notices.

If a root `DESIGN.md` exists, read it before making UI, UX, or visual design changes.

<!-- deweyou-agent:end -->

<!-- deweyou-codex-rules:start -->

## Dewey Rules for Codex

Follow these selected Dewey rules. Read a rule only when its description is relevant to the current task.

- code-style - Code expression preferences for naming, functions, comments, errors, and tests.
  Path: ../../../../.deweyou/agents/assets/rules/code-style.md
- engineering-principles - Design preferences for module boundaries, abstraction, dependencies, state, and easy-to-delete code.
Path: ../../../../.deweyou/agents/assets/rules/engineering-principles.md
<!-- deweyou-codex-rules:end -->
