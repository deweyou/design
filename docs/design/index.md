# Design System Knowledge Index

Repository knowledge is stored under `docs/`. This directory is only the design-system entry point, so the same rules do not drift across several conflicting documents.

## Required Reading

- [Deweyou design system knowledge](system.md) - design principles, content voice, visual language, component constraints, and website/H5 application rules.
- [Ark UI component pattern](../architecture/ark-ui.md) - behavior layer, Portal, controlled mode, and styling boundaries for interactive components.
- [Package layer rules](../architecture/package-layers.md) - responsibilities and dependency direction for `styles`, `react`, `react-icons`, and related packages.

## Principle Notes

- Sans carries controls; serif carries content. Serif remains the brand identity for content and display surfaces.
- The regular semantic colors are neutral, primary, and danger. Warning is only a supporting feedback role.
- Use neutral light-gray or warm-black canvases for content. Avoid cream, gradients, and decorative backgrounds.
- Prefer borders to shadows. Cards have no shadow by default; floating surfaces express elevation.
- Icons converge on `@deweyou-design/react-icons`: a Deweyou curated registry backed by `tdesign-icons-svg`, direct named imports, semantic size/color, and icon-only actions handled by `IconButton` or another control with an accessible name. See [system.md#icons](system.md#icons).
- UI copy should be factual, technical, restrained, and emoji-free. `·` is the system signature separator.

## When Changing Design-Related Code

1. Read [system.md](system.md) first and check whether the change touches color, typography, radius, state, motion, icons, or content voice.
2. If the change involves a complex interactive component, also read [../architecture/ark-ui.md](../architecture/ark-ui.md).
3. If the change requires a new token, component, or package dependency, also read [../architecture/package-layers.md](../architecture/package-layers.md).
4. If a Claude Design handoff, Figma file, or real page introduces a new visual direction, write the reusable principle back to `docs/design/system.md` before implementing code.

_Last updated: 2026-05-17 | Reason: translated durable knowledge base to English and set future documentation language._
