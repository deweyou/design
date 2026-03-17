# storybook

Internal review surface for component state coverage, edge cases, and exploratory
development. Public installation and theming guidance belongs in `apps/website`.

## Commands

- Start the internal review server with `vp run storybook#dev` on port `6106`.
- Build the internal review app with `vp run storybook#build`.

## Upgrade Baseline

- Storybook is aligned on the 10.2.19 release line.
- The preview shell keeps its explicit global style import from `@deweyou-ui/styles/theme.css`.
- Stories remain scoped to internal review rather than public documentation ownership.
