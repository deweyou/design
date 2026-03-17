# Research: Icon Package for UI Library

## Decision 1: Use `tdesign-icons-svg` as the initial SVG asset source, not as the public consumer API

- Decision: Build `@deweyou-ui/icons` on top of curated assets imported from `tdesign-icons-svg`, while keeping the public contract limited to Deweyou UI's own icon names, props, and named exports.
- Rationale: This preserves control over naming stability, accessibility defaults, failure behavior, and future source swaps. It also fits the user's preference for eventually owning SVG assets while avoiding the need to draw every icon immediately.
- Alternatives considered:
  - Expose `tdesign-icons-react` directly: rejected because it would leak an upstream React API into Deweyou UI's public contract and reduce control over future migration to self-owned SVG assets.
  - Store raw SVG files manually in the repo from day one: rejected for higher maintenance cost and weaker contributor ergonomics while the initial catalog is still being established.
  - Use a sprite or icon font: rejected because it weakens per-icon tree-shaking, accessibility clarity, and package-first API ergonomics.

## Decision 2: Start with one coherent TDesign icon family for the foundational catalog

- Decision: Source the initial foundational set from `tdesign-icons-svg` rather than mixing multiple visual families.
- Rationale: The spec requires icons to be visually consistent enough for side-by-side use. A single source family keeps stroke weight, corner treatment, and optical balance aligned while the package contract is still being established.
- Alternatives considered:
  - Mix multiple third-party icon families immediately: rejected because visual drift would force additional governance rules before the basic package contract is stable.
  - Create a custom bespoke icon set from day one: rejected because it increases up-front design and asset-production cost before the catalog governance and API are proven.

## Decision 3: Publish a package-owned registry with dual consumption modes

- Decision: Implement a package-owned icon registry that drives both a generic `Icon` component and official named exports generated from the same canonical map.
- Rationale: This matches the clarified requirement to support both usage styles while keeping them behaviorally aligned. It also gives the package one place to enforce unsupported-name failures and metadata used for docs.
- Alternatives considered:
  - Named exports only: rejected because catalog-driven docs and dynamic icon selection become awkward.
  - Generic lookup only: rejected because named exports improve discoverability, editor autocomplete, and usage ergonomics in component code.

## Decision 4: Treat unsupported icon names as contract errors

- Decision: Unsupported icon names will throw a descriptive runtime error from the generic entry point, while TypeScript types prevent most invalid names during development.
- Rationale: The clarified failure strategy is explicit failure. Combining type-level narrowing with runtime error reporting catches both normal and escape-hatch misuse without introducing visual ambiguity.
- Alternatives considered:
  - Placeholder icon fallback: rejected because it hides catalog governance problems and creates ambiguous UI output.
  - Render nothing: rejected because silent absence is harder to detect and debug than an explicit error.

## Decision 5: Reuse existing theme semantics before adding icon-specific global tokens

- Decision: Default icon color will inherit from surrounding text through `currentColor`, and size options will map to the package contract first; new global icon tokens are deferred unless review uncovers a real gap.
- Rationale: The styles package already exposes semantic text and link tokens. Reusing them keeps icons aligned with surrounding content and avoids premature theme-surface growth.
- Alternatives considered:
  - Add dedicated global icon color tokens immediately: rejected because current requirements do not prove a separate global token family is necessary.
  - Hard-code icon colors in the package: rejected because it violates token-driven theming and reduces reuse.

## Decision 6: Cover both internal review and public guidance surfaces

- Decision: Use `apps/storybook` for internal catalog review and state coverage, and update `apps/website` for official package guidance and curated examples.
- Rationale: The repository constitution requires a reviewer-visible preview surface, while the website guidance rules state that official usage documentation belongs in `apps/website`.
- Alternatives considered:
  - Storybook only: rejected because it would leave official package guidance outside the project’s documented public documentation surface.
  - Website only: rejected because Storybook is already the stronger internal state-review surface for dense catalog browsing.
