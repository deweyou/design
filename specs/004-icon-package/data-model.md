# Data Model: Icon Package for UI Library

## Entity: Icon Catalog Entry

- Purpose: Represents one officially supported icon in the shared catalog.
- Fields:
  - `name`: stable consumer-facing identifier used by the generic `Icon` API.
  - `exportName`: stable named export identifier mapped to the same icon.
  - `category`: foundational grouping such as action, status, navigation, or feedback.
  - `sourceCollection`: internal source family used to keep the catalog visually coherent.
  - `sourceKey`: internal identifier for the upstream icon within that family.
  - `keywords`: contributor-facing discovery terms used in docs and review surfaces.
  - `directional`: whether the icon has left/right or start/end meaning that may need explicit review.
  - `status`: `active`, `deprecated`, or `removed`.
  - `replacementName`: optional successor when an entry is deprecated.
  - `a11yGuidance`: contributor note describing when the icon is typically decorative versus meaningful.
- Validation rules:
  - `name` must be unique within the official catalog.
  - `exportName` must be unique within the package public API.
  - `category` must map to the foundational set scope defined in the spec.
  - `status=deprecated` requires documented migration guidance.
  - `status=removed` cannot remain available through the public registry.

## Entity: Icon Definition

- Purpose: Represents the renderable vector data used internally by the package.
- Fields:
  - `viewBox`: coordinate system metadata for rendering.
  - `body`: vector path or shape payload required to render the icon.
  - `defaultStrokeOrFill`: source metadata needed to preserve the visual family.
  - `intrinsicAlignment`: optional metadata for optical alignment adjustments when needed.
- Relationships:
  - Each `Icon Catalog Entry` references exactly one active `Icon Definition`.
  - One source collection can supply many `Icon Definitions`.
- Validation rules:
  - Definitions in the same public catalog must render consistently with the chosen visual family.
  - Definitions must be renderable without network lookup.

## Entity: Icon Render Request

- Purpose: Represents one consumer request to render an icon through the package.
- Fields:
  - `name`: official icon name when using the generic entry point.
  - `size`: supported package size option or explicit consumer override.
  - `label`: optional accessible name; when omitted, the icon is treated as decorative.
  - `className`: public styling hook.
  - `tone`: optional semantic color role inherited from surrounding UI styling.
- Validation rules:
  - `name` must resolve to an active catalog entry or the request fails explicitly.
  - Numeric `size` values must be positive.
  - Standard named `size` values must come from the package-owned `IconSize` set.
  - When `label` is omitted, the rendered icon must be hidden from assistive technology.

## Entity: Icon Preview Example

- Purpose: Represents a reviewable example used in Storybook and website guidance.
- Fields:
  - `exampleId`: stable identifier for docs and test references.
  - `scenario`: the usage context being demonstrated.
  - `iconNames`: one or more catalog entries shown in the example.
  - `statesCovered`: unlabeled, labeled, size, theme, and failure cases included in the example.
  - `notes`: contributor guidance tied to the example.
- Validation rules:
  - Each foundational category must appear in at least one preview example.
  - Failure-state examples must show explicit unsupported-name behavior.

## State Transitions

- `active -> deprecated`: allowed when a replacement or migration note is documented.
- `deprecated -> removed`: allowed only after migration guidance exists and the removal is explicitly documented before release.
- `active -> removed`: discouraged for the foundational catalog and requires explicit release documentation because it breaks the stable consumer contract.
