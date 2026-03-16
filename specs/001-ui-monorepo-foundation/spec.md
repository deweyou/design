# Feature Specification: UI Monorepo Foundation

**Feature Branch**: `001-ui-monorepo-foundation`  
**Created**: 2026-03-16  
**Status**: Draft  
**Input**: User description: "Define the v1 monorepo architecture for a React + TypeScript + Less UI library using Vite+, including packages for utils, hooks, styles, and components, apps for website and storybook, a controlled theme system with TS token source and CSS theme outputs, CSS Modules for component styles, and explicit documentation-driven global style import."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Establish Package Boundaries (Priority: P1)

As the maintainer of the UI library, I want the monorepo to define clear package and app responsibilities so that future work on components, styles, hooks, and documentation can be added without reworking the project structure.

**Why this priority**: This is the foundation for every later component, theme, and documentation task. Without agreed boundaries, the repo will drift quickly and later work will become harder to organize or publish.

**Independent Test**: Can be fully tested by reviewing the repo structure, package and app responsibilities, and documented dependency rules, and confirming that each major concern has one clear home.

**Acceptance Scenarios**:

1. **Given** a maintainer reviews the v1 architecture, **When** they inspect the defined packages and apps, **Then** they can identify where utilities, hooks, styles, components, website content, and Storybook work belong without ambiguity.
2. **Given** a maintainer plans a new feature, **When** they classify the work by responsibility, **Then** they can determine the correct package or app without moving existing foundations.

---

### User Story 2 - Establish a Controlled Theme System (Priority: P2)

As an application developer consuming the library, I want the library to provide a stable default design language with a small, clearly defined theme override surface so that I can adapt brand colors and switch between light and dark themes without redesigning the component system.

**Why this priority**: The library is intended to be opinionated. Theme boundaries must be set early so component APIs, documentation, and future visual decisions remain consistent.

**Independent Test**: Can be fully tested by reviewing the documented theme model, confirming that only approved public theme color tokens are user-configurable, and verifying that all other design tokens remain internal by default.

**Acceptance Scenarios**:

1. **Given** a consumer uses the library without custom theme overrides, **When** they import the documented global styles, **Then** the default design language is applied with no additional configuration.
2. **Given** a consumer wants brand adaptation, **When** they override the documented public theme color surface, **Then** brand-relevant component colors change while component shape, spacing, typography scale, and motion remain governed by the library defaults.

---

### User Story 3 - Separate Public Documentation from Internal Development Tooling (Priority: P3)

As the maintainer of the UI library, I want website and Storybook responsibilities to be separated so that the public-facing site can focus on documentation and curated demos while Storybook remains an internal tool for state coverage and implementation validation.

**Why this priority**: Without a clear split, the project will duplicate examples and documentation in two places, increasing maintenance cost and causing inconsistent guidance.

**Independent Test**: Can be fully tested by reviewing the documented role of each app and verifying that public documentation, curated examples, and exploratory state validation are assigned to the correct surface.

**Acceptance Scenarios**:

1. **Given** a maintainer prepares user-facing guidance, **When** they decide where it belongs, **Then** official documentation, installation guidance, design rationale, and curated demos are directed to the website.
2. **Given** a maintainer needs to inspect edge cases or unstable states, **When** they decide where that work belongs, **Then** exploratory stories, exhaustive state matrices, and internal validation are directed to Storybook.

### Edge Cases

- What happens when a consumer imports components but does not import the required global styles?
- How does the system behave when a consumer overrides public brand colors with values that reduce contrast against default text or surface colors?
- What happens when a keyboard-only user navigates curated website demos and theme toggles across light and dark themes?
- How does the library behave when no custom theme is defined and only the default internal token mapping is available?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST reorganize the monorepo into separate `packages` and `apps` concerns, with dedicated homes for utilities, reusable React hooks, styles, components, the website, and Storybook.
- **FR-002**: The system MUST define `utils` as the location for framework-agnostic utility logic and MUST define a separate `hooks` package for reusable React hooks.
- **FR-003**: The system MUST define `styles` as the source of design tokens, theme definitions, reset or base global styles, and theme style outputs for consumers.
- **FR-004**: The system MUST define `components` as the location for reusable UI components and their component-specific styles.
- **FR-005**: The system MUST define the website as the public-facing surface for installation guidance, design principles, theme documentation, curated component examples, and limited interactive playground content.
- **FR-006**: The system MUST define Storybook as an internal-facing surface for component state coverage, edge-case validation, exploratory stories, and implementation-oriented review.
- **FR-007**: The system MUST require consumers to explicitly import the documented global style entry point rather than relying on component packages to silently inject global styles.
- **FR-008**: The system MUST provide a default design language that works with no consumer theme overrides once the documented global styles are imported.
- **FR-009**: The system MUST support light and dark themes as first-class theme modes.
- **FR-010**: The system MUST define a public theme surface limited to a small set of key color tokens used for brand expression and interactive emphasis.
- **FR-011**: The system MUST treat all non-public tokens, including structural, spacing, radius, typography scale, motion, and other design-language tokens, as internal by default.
- **FR-012**: The system MUST identify and document the initial public theme color surface, including brand background, brand interactive states, text-on-brand, focus emphasis, and link emphasis.
- **FR-013**: The system MUST produce theme style outputs that include dedicated light and dark theme files and a documented default theme entry point for consumer import.
- **FR-013a**: The styles package MUST publish CSS and Less theme assets from `dist/` rather than relying on source-directory exports.
- **FR-014**: The system MUST define that component-local styles are managed per component and are separate from global theme and reset styles.
- **FR-015**: The system MUST require component-local styles to use CSS Modules so component implementation styles remain scoped by default.
- **FR-015a**: The system MUST organize component source files by component folder, with colocated `index.tsx` and `index.module.less` entrypoints.
- **FR-016**: The system MUST define a consistent component customization contract that includes a root `className` entry point for consumer overrides.
- **FR-017**: The system MUST allow components to expose a limited set of component-level style variables for localized visual overrides without opening the full design system for reshaping.
- **FR-018**: The system MUST define that internal CSS Module class names are implementation details and are not part of the public customization contract.
- **FR-019**: The system MUST define the public API surface for every affected package, including naming, package purpose, and expected dependency direction.
- **FR-019a**: The system MUST publish all reusable workspace packages under the `@deweyou-ui/*` scope, and all internal app or package consumers MUST reference those scoped package names rather than unscoped aliases.
- **FR-020**: The system MUST document the dependency direction so that utilities and styles remain foundational, hooks remain separate from generic utilities, and components consume the lower-level packages rather than the reverse.
- **FR-021**: The system MUST meet explicit accessibility requirements for semantic structure, focus handling, keyboard interaction, and assistive technology labels across the website, Storybook examples, and component states covered by this foundation.
- **FR-022**: The system MUST identify whether new design tokens, theme hooks, or visual primitives are introduced, reused, or intentionally not needed.
- **FR-023**: The system MUST provide preview coverage in the website for primary component examples, theme behavior, and representative edge or disabled states once components are introduced on top of this foundation.

### Accessibility and UI Contract _(mandatory for UI work)_

- **User roles / actors**: UI library maintainer, application developer consuming the packages, keyboard-only user reviewing demos, screen-reader user interacting with website examples, designer validating the theme surface.
- **Interaction model**: explicit global style import, light or dark theme switching, component consumption through package APIs, root-level `className` overrides, limited component-level visual overrides.
- **Repository conventions**: component code prefers standard TSX, component class composition uses `classnames` directly, reusable packages use the `@deweyou-ui/*` scope, and utilities are added only when a concrete shared need exists.
- **States to cover**: default, hover, focus-visible, active, disabled, light theme, dark theme, default theme with no overrides, consumer-provided brand color overrides.
- **Theming / token impact**: introduces a controlled public color theme surface, preserves broader design tokens as internal, and establishes theme outputs plus a default theme entry point.

### Key Entities _(include if feature involves data)_

- **Package Boundary**: A documented responsibility area in the monorepo, including its purpose, expected contents, and allowed dependency direction.
- **App Surface**: A runnable experience in the monorepo that consumes packages for a specific audience, such as public documentation or internal component review.
- **Public Theme Token**: A consumer-facing color token that may be overridden to adapt brand expression without changing the system's core design language.
- **Internal Design Token**: A token used to preserve the library's design language and defaults that is not part of the consumer-facing customization contract.
- **Component Customization Contract**: The stable consumer entry points for styling a component, including root `className` and any explicitly allowed component-level style variables.

## Assumptions

- Consumers are willing to import a documented global style entry point as part of initial library setup.
- The initial public theme surface is intentionally small and color-focused because the library is opinionated and is not intended to expose full design-language reshaping in v1.
- Storybook remains valuable as an internal review surface even if the website becomes the primary public-facing documentation and demo experience.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Maintainers can classify 100% of the initial monorepo concerns into a single documented package or app responsibility without overlap.
- **SC-002**: Consumers can complete initial library setup by following documented global style import and package usage guidance in one pass without requiring undocumented behavior.
- **SC-003**: Consumers can switch between light and dark themes and apply approved brand color overrides without changing component structure or undocumented internals.
- **SC-004**: 100% of the initial public theme surface is documented with its intended use and boundary between public and internal customization.
- **SC-005**: Official website documentation and internal Storybook usage can be reviewed without maintaining duplicate full-length guidance for the same component usage flows.
