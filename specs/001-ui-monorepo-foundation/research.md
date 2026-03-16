# Research: UI Monorepo Foundation

## Decision: Separate reusable React hooks into `packages/hooks`

**Rationale**: Reusable hooks have a different dependency profile from framework-agnostic utilities. A dedicated hooks package keeps `packages/utils` React-free, clarifies dependency direction, and prevents the lowest-level package from becoming a generic dumping ground.

**Alternatives considered**:

- Keep hooks in `packages/utils`: rejected because it mixes React-specific and framework-agnostic concerns.
- Rename `utils` to `shared`: rejected because it weakens package boundaries and encourages unrelated code to accumulate in one package.

## Decision: Keep Storybook as an app surface under `apps/storybook`

**Rationale**: Storybook is a runnable environment that consumes reusable packages rather than a publishable package itself. Treating it as an app keeps the monorepo model consistent and cleanly separates public documentation from internal review tooling.

**Alternatives considered**:

- Place Storybook inside `packages/components`: rejected because Storybook is not part of the reusable package API or release surface.
- Use only the website and skip Storybook entirely: rejected for v1 because internal state validation and rapid component review still benefit from a dedicated tooling surface.

## Decision: Make `apps/website` the public documentation and curated demo surface

**Rationale**: The project is intended to ship an opinionated component system with a clear design point of view. A dedicated website provides a stronger narrative surface for documentation, design rationale, curated examples, and limited playground experiences than exposing Storybook directly as the primary public face.

**Alternatives considered**:

- Use Storybook as the public documentation surface: rejected because it encourages exhaustive implementation-driven examples rather than curated user guidance.
- Embed Storybook as the long-term public website experience: rejected because it creates a split information architecture and weakens brand and documentation cohesion.

## Decision: Use TypeScript objects as the source of truth for design tokens

**Rationale**: TypeScript token sources are easy to organize, validate, document, and transform into other outputs. They support future documentation use cases, keep token definitions structured, and remain compatible with generated CSS theme files.

**Alternatives considered**:

- Use Less variables as the primary token source: rejected because runtime theme switching, structured token documentation, and future tooling become harder.
- Use raw CSS files as the primary token source: rejected because CSS files are a poor structured source for documentation and transformation workflows.

## Decision: Generate dedicated `theme-light.css`, `theme-dark.css`, and a default `theme.css`

**Rationale**: This keeps the theme model explicit and future-proofs the foundation for a later split-loading strategy while preserving a simple default import path for consumers. It supports runtime light/dark switching without requiring consumers to understand advanced theme loading.

**Alternatives considered**:

- Generate only a single combined theme file: rejected because it makes future evolution to more flexible loading less clean.
- Require consumers to manually import light and dark theme files from the start: rejected because it increases setup complexity for v1.

## Decision: Require consumers to explicitly import global styles

**Rationale**: Explicit global style imports keep package boundaries clear, avoid surprising side effects, and make the difference between global design foundations and local component styling obvious in documentation and in consuming applications.

**Alternatives considered**:

- Auto-inject global styles from the components package: rejected because it hides a global dependency and blurs ownership between packages.
- Import full theme files from every component style entry: rejected because it duplicates global concerns and complicates future theme evolution.

## Decision: Use CSS Modules for component-local styles and keep global style layers in `packages/styles`

**Rationale**: CSS Modules provide scoped implementation styles for each component while preserving a strict separation between local component presentation and shared global theme primitives. This supports the desired customization model: root `className`, limited component-level CSS vars, and no public reliance on internal class names.

**Alternatives considered**:

- Use only global Less files: rejected because it increases collision risk and weakens component boundaries.
- Expose internal component class names as public styling API: rejected because it tightly couples consumers to implementation details.

## Decision: Keep the public theme surface intentionally small and color-only for v1

**Rationale**: The library is meant to be opinionated. Public customization should support brand adaptation and theme switching without allowing consumers to reshape the system's spacing, sizing, radius, typography, or motion language.

**Alternatives considered**:

- Expose broad token customization from day one: rejected because it undermines the intended design language and increases maintenance complexity.
- Expose only a single `primary-color`: rejected because brand expression, focus states, and link styling need a small set of related semantic colors rather than one overloaded token.

## Decision: Organize components by folder and prefer standard TSX plus direct `classnames`

**Rationale**: A component-per-folder layout scales better as components grow to include styles, tests, stories, and supporting files. Standard TSX is the normal React authoring model and is easier for maintainers to read than `React.createElement`. Direct `classnames` usage avoids maintaining a redundant wrapper utility for simple class composition.

**Alternatives considered**:

- Keep component files flat under `packages/components/src`: rejected because it becomes noisy as the package grows.
- Keep a local `cx` helper: rejected because `classnames` already solves the problem cleanly and is clearer to contributors.
- Keep `React.createElement` in component code: rejected because it was a temporary workaround, not a desired project convention.
