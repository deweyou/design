# Quickstart: UI Monorepo Foundation

## Goal

Validate the v1 monorepo foundation after the repository is reorganized into packages and apps.

## Setup Flow

1. Install dependencies using the project-standard workflow:

```bash
vp install
```

2. Confirm the monorepo contains:
   - `apps/website`
   - `apps/storybook`
   - `packages/utils`
   - `packages/hooks`
   - `packages/styles`
   - `packages/components`
3. Confirm package documentation or READMEs describe each package purpose and public entrypoints.

## Consumer Validation Flow

1. Open the documented consumer setup guidance.
2. Import the documented global style entrypoint from the styles package.
3. Import at least one component from the components package.
4. Confirm the component renders with the default design language and no custom theme configuration.
5. Switch between light and dark themes using the documented theme mechanism.
6. Override one approved public brand color token and confirm the component reflects the new brand expression while preserving the default layout and structure.

Example consumer setup:

```ts
import '@deweyou-ui/styles/theme.css';
import { FoundationButton } from '@deweyou-ui/components';
```

## Maintainer Validation Flow

1. Review package dependency direction and verify no circular dependency is introduced.
2. Review website content and confirm it owns official installation, theming, and curated example guidance.
3. Review Storybook and confirm it focuses on internal state coverage and exploratory validation rather than duplicating full public documentation.
4. Review at least one component contract and confirm:
   - global styles are not silently injected
   - component-local styles are scoped
   - root `className` is the primary public styling entry point
   - internal class names are not treated as public API

## Verification Commands

Run the standard monorepo checks:

```bash
vp install
vp check
vp test
```

Run any app- or package-specific verification commands that are introduced as part of the implementation plan using `vp run`.

Recommended app checks:

```bash
vp run website#build
vp run storybook#build
```

## Follow-up Notes

- Verified on 2026-03-16 with `vp check`, `vp test`, `vp run website#build`, and `vp run storybook#build`.
- Storybook build emits upstream warnings about direct `eval` use in Storybook internals and large preview chunks; the build still succeeds.
