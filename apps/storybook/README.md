# storybook

Internal review surface for component state coverage, edge cases, and exploratory
development. Public installation and theming guidance belongs in `apps/website`.

## Commands

- Start the internal review server with `vp run storybook#dev` on port `6106`.
- Build the internal review app with `vp run storybook#build`.
- Run interaction tests locally (Storybook must be running on port 6106): `vp run storybook#test`
- Run interaction tests in CI (build first, then serve and test): `vp run storybook#build && npx serve storybook-static -p 6106 --no-clipboard & sleep 3 && vp run storybook#test`

## Upgrade Baseline

- Storybook is aligned on the 10.2.19 release line.
- The preview shell keeps its explicit global style import from `@deweyou-ui/styles/theme.css`.
- Stories remain scoped to internal review rather than public documentation ownership.
