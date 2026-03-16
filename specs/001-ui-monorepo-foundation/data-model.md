# Data Model: UI Monorepo Foundation

## Package Boundary

**Description**: A reusable or runnable area of responsibility in the monorepo.

**Fields**:

- `name`: Stable package or app name
- `kind`: `package` or `app`
- `audience`: Maintainer, application developer, or internal reviewer
- `purpose`: Primary responsibility of the boundary
- `allowedDependencies`: Lower-level boundaries this area may consume
- `publicEntrypoints`: Documented public entrypoints exposed to consumers
- `verificationSurface`: Required validation and preview responsibilities

**Relationships**:

- A `Package Boundary` may depend on other lower-level `Package Boundary` records.
- An `App Surface` consumes one or more `Package Boundary` records.

**Validation Rules**:

- Every boundary must have one primary responsibility.
- Package dependencies must point downward only; circular dependencies are invalid.
- Reusable logic may not exist only in an app if it is expected to be consumed elsewhere.

## App Surface

**Description**: A runnable experience in the monorepo serving a specific audience.

**Fields**:

- `name`: App name
- `audience`: Public user or internal maintainer
- `contentScope`: Types of content the app owns
- `excludedScope`: Content the app intentionally does not own
- `themeBehavior`: Supported theme experiences

**Relationships**:

- `website` consumes reusable packages and documents their usage.
- `storybook` consumes reusable packages and validates their states.

**Validation Rules**:

- The website must own official installation, theme, and curated usage guidance.
- Storybook must not become the sole source of official public documentation.

## Public Theme Token

**Description**: A user-facing theme token that may be overridden by consumers.

**Fields**:

- `name`: Token identifier
- `semanticPurpose`: Brand background, interactive state, focus emphasis, or link emphasis
- `defaultThemeValue`: Default mapping in the built-in theme
- `overrideAllowed`: Whether consumer override is supported
- `affectedSurfaces`: Components or app surfaces influenced by the token

**Relationships**:

- A `Public Theme Token` maps into one or more `Component Visual Contract` properties.
- A `Public Theme Token` is derived from or coordinated with the broader `Internal Design Token` set.

**Validation Rules**:

- Public theme tokens must stay limited to the documented color surface.
- Public theme tokens may not redefine structural layout or typography scale in v1.

## Internal Design Token

**Description**: A token that expresses the library's default design language and is not part of the user-facing customization contract.

**Fields**:

- `name`: Token identifier
- `tokenType`: Structural, spacing, radius, typography, motion, neutral color, or state styling
- `defaultValue`: Built-in value
- `themeAwareness`: Whether light/dark mapping changes the effective value
- `publiclyDocumented`: Whether the token is user-facing or internal-only

**Relationships**:

- Internal tokens feed theme outputs and component-local styling.
- Internal tokens may backstop public theme tokens where appropriate.

**Validation Rules**:

- Internal tokens must preserve the library's opinionated design language.
- Internal tokens are not directly exposed as part of the initial public theme surface.

## Component Customization Contract

**Description**: The stable consumer-facing styling interface available on a component.

**Fields**:

- `componentName`: Stable component identifier
- `sourceFolder`: Dedicated component folder containing implementation and style entrypoints
- `rootClassNameSupport`: Whether root `className` is accepted
- `componentStyleVariables`: Limited component-level CSS variables intentionally exposed
- `internalClassExposure`: Whether internal CSS Module classes are public
- `themeDependencies`: Public theme tokens that influence the component

**Relationships**:

- Each `Component Customization Contract` depends on `Public Theme Token` and `Internal Design Token` values.
- Contracts are documented in public package documentation and examples.

**Validation Rules**:

- Root `className` is the default public override entry point.
- Each component lives in its own source folder with colocated implementation and scoped style files.
- Internal CSS Module classes must remain private implementation details.
- Component-level CSS variables should be limited and must not expose full structural reshaping in v1.
