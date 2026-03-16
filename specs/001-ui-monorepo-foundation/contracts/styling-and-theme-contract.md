# Contract: Styling and Theme

## Purpose

Define the public styling contract for consumers and the internal styling boundaries between `styles` and `components`.

## Consumer Setup Contract

- Consumers must explicitly import the documented global style entrypoint before relying on component presentation.
- The documented setup path must provide a complete default design language without requiring custom theme overrides.
- Consumers may opt into light or dark theme behavior through the documented theme mechanism.

## Theme Output Contract

- The styles package must provide:
  - A dedicated light theme output
  - A dedicated dark theme output
  - A documented default theme entrypoint suitable for standard consumer setup
- Theme outputs must support runtime light or dark switching.

## Public Theme Surface Contract

- The initial public theme surface is intentionally limited to key color tokens.
- Public theme tokens exist for:
  - Brand background
  - Brand hover state
  - Brand active state
  - Text on brand surfaces
  - Focus emphasis
  - Link emphasis
- Public theme tokens are intended for brand adaptation, not structural redesign.

## Internal Token Contract

- Structural, spacing, radius, typography scale, motion, and other design-language tokens remain internal by default.
- Internal tokens define the library's visual identity and are not part of the initial consumer-facing customization promise.

## Component Styling Contract

- Component-local styles are implemented per component and remain separate from global theme and reset layers.
- Component-local styles use CSS Modules.
- Internal CSS Module class names are implementation details and are not public customization hooks.
- Each component must support a root `className` as the default public override entry point.

## Local Override Contract

- Components may expose a limited set of component-level CSS variables where localized visual adjustment is valuable.
- Initial component-level CSS variables should primarily cover color-related adjustments.
- Component-level overrides must not expose unrestricted reshaping of layout, spacing, radius, or motion in v1.
