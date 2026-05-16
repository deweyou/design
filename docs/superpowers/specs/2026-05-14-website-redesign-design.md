# Website Redesign Design

## Purpose

Redesign `apps/website` as the public face of Deweyou Design: a design-specification-first component library site. The site should help visitors understand why the system looks the way it does before asking them to install packages or inspect APIs.

The redesign should not become a marketing landing page, a Storybook replacement, or a theme-token playground. It should feel like a restrained design manual for a Chinese-first, serif-led React component library.

## Confirmed Direction

The chosen direction is **Design Specification First**.

- The site prioritizes Deweyou Design's visual language: serif typography, clean lines, warm canvas colors, restrained semantic color, and low-decoration layouts.
- The first screen should feel like a design manual cover, not a SaaS landing page.
- Component previews are evidence of the design language, not the primary hero content.
- Developer entry points remain available, but install commands and API details do not dominate the first screen.

## Top-Level Information Architecture

Top-level navigation:

- `Overview`
- `Components`
- `Icons`
- `Storybook ↗`
- `GitHub ↗`

There is no top-level `Theme` page in the first version. The previous `Theme` idea is folded into the Overview design-specification narrative. If the specification later grows too large, the future split should be named `Design` or `Guidelines`, not `Theme`, because `theme` reads as a technical skin/configuration page rather than a design standard.

The top navigation should be fixed, compact, and quiet. It should not compete with the page narrative. The right side includes a global light/dark theme toggle button.

## Overview Page

`Overview` is the home page and the design manual cover for Deweyou Design.

### Goals

- Explain the design system's identity before showing package mechanics.
- Make the site feel more like an editorial design specification than a generic component library homepage.
- Use real system primitives and components as proof of the design language.

### Sections

1. **Cover**
   - Primary title: `Deweyou Design`.
   - Supporting text should describe a Chinese-first React component library built with serif typography, clean lines, semantic colors, and light/dark themes.
   - Install command can appear, but as secondary utility content.

2. **Principles**
   - Use the principles from `docs/design/system.md`:
     - Serif typography is the brand identity.
     - Semantics should be quieter than decoration.
     - Borders come before shadows.
     - Typographic precision matters more than illustration.
   - Copy should stay concise and factual.

3. **Color Semantics**
   - Show semantic roles, not every palette step.
   - Required roles:
     - `neutral`
     - `primary`
     - `danger`
   - The section should clarify that component APIs use semantic roles rather than arbitrary palette colors.

4. **Typography**
   - Show the Source Han Serif CN type scale.
   - Explain that serif typography is intentional for both body and display text.
   - Include the font split/subset story as a website performance requirement, not as a decorative feature.

5. **Shape & Interaction**
   - Summarize radius, borders, focus, hover, active, disabled, and loading behavior.
   - Keep the presentation visual and compact.

6. **Component Evidence**
   - Show a small number of high-quality component examples.
   - Suggested examples:
     - `Button`
     - `Input`
     - `Tabs`
     - `Menu`
     - `Dialog`
   - These examples should demonstrate the design language rather than expose full controls.

7. **Get Started**
   - Place practical developer entry points near the end:
     - package install
     - theme CSS import
     - React component import
     - links to Components, Storybook, and GitHub

## Components Page

`Components` is a lightweight component manual and Storybook entry surface. It is not an embedded Storybook, and it must not use Storybook iframes.

### Goals

- Cover every public React component.
- Help users quickly understand what each component is for.
- Provide direct Storybook deep links for full controls, edge states, and interaction testing.

### Structure

1. **Intro**
   - Explain that the website provides curated usage context and Storybook provides full controls.
   - Make the boundary explicit: no iframe embedding.

2. **Category Navigation**
   - Categories:
     - `Actions`
     - `Forms`
     - `Overlays`
     - `Navigation`
     - `Feedback`
     - `Content`
     - `Data`
   - Category navigation may be implemented as anchors or filters.

3. **Component Cards**
   - First version covers all public components with a consistent simplified card format.
   - Each card includes:
     - component name
     - one-sentence purpose
     - category
     - import snippet
     - key prop dimensions summary, such as `variant`, `color`, `size`, or component-specific state
     - small preview area
     - `View in Storybook ↗` deep link

4. **Storybook Linking**
   - Storybook links should be direct external links.
   - Do not embed Storybook in an iframe because of cross-origin, loading, theme synchronization, and scrolling risks.
   - Link generation should be centralized in one data/mapping file so story IDs are not scattered through UI markup.
   - If deterministic story ID generation does not match the deployed Storybook, use an explicit mapping table.

### Component Coverage

Use `docs/design/components.md`, `packages/react/package.json` exports, and `packages/react/src/index.ts` as sources of truth.

The first version should include all current public React components as cards, including but not limited to:

- `Badge`
- `Breadcrumb`
- `Button`
- `IconButton`
- `Card`
- `Checkbox`
- `Dialog`
- `Field`
- `Input`
- `MarkdownRender`
- `Menu`
- `ContextMenu`
- `Nav`
- `NavOverlay`
- `Pagination`
- `Popover`
- `RadioGroup`
- `ScrollArea`
- `Select`
- `Separator`
- `Skeleton`
- `Spinner`
- `Switch`
- `Tabs`
- `Text`
- `Textarea`
- `toast`
- `Toaster`
- `Tooltip`
- `VirtualList`

Cards may use compact previews rather than full interactive demos. Overlay components can use trigger-like static previews or lightweight interactions; complex behavior belongs in Storybook.

## Icons Page

`Icons` remains an independent page.

Requirements:

- Keep search.
- Keep click-to-copy import behavior.
- Keep empty state behavior.
- Align visual language with the redesigned site: compact top navigation, warm canvas, serif hierarchy, line-based grid.
- Avoid presenting the icon package as "Tabler" in primary copy. The page should present `@deweyou-design/react-icons` as the product surface.

## Theme Toggle

The light/dark toggle is a global site tool, not a navigation destination.

Requirements:

- The control lives in the compact top navigation.
- It uses existing Deweyou components and icons where possible.
- It has a clear accessible name:
  - `切换深色模式`
  - `切换浅色模式`
- It should work on Overview, Components, and Icons.
- It should not be implemented with hand-written SVG if an existing icon export is available.

## Font Split Requirement

The website should use the recent font split/subset capability for Source Han Serif CN.

Goals:

- `@deweyou-design/styles/theme.css` should remain appropriate for consumers and should not force the website's full font payload into every default usage path.
- The website can import a website-specific font subset or generated virtual CSS entry.
- Production build output should show subset font assets rather than full original font files for the website.

The implementation plan should decide the exact mechanism after inspecting the current styles package and build tooling. The design requirement is that website typography remains faithful to the Deweyou system while reducing first-load font weight.

## Navigation And Anchors

The top navigation should remain fixed and compact.

Requirements:

- Anchor navigation must not land content underneath the fixed header.
- If manual hash scrolling is needed, it should calculate the actual nav height rather than relying only on hard-coded padding.
- Mobile navigation can wrap or scroll horizontally, but it must not create text overlap.

## Visual Language

The redesign must follow `docs/design/system.md`.

Required qualities:

- Serif-first typography.
- Warm light canvas and warm dark canvas.
- Line-based structure.
- restrained `neutral` / `primary` / `danger` semantics.
- Minimal decoration.
- No gradient-orb, glassmorphism, or stock-hero treatment.
- No oversized marketing composition.

The website can be editorial and distinctive, but it should stay dense enough to be useful as a component library website.

## Testing And Verification

Implementation should add or update focused tests for:

- top navigation renders the final link set and theme toggle
- no top-level `Theme` link exists
- Components card data covers public React exports
- Components cards render Storybook external links
- Icons search and copy behavior still work

Manual/browser verification should cover:

- Overview at desktop and narrow widths
- Components at desktop and narrow widths
- Icons at desktop and narrow widths
- light/dark theme toggle on each page
- fixed-nav anchor behavior

Build verification should include:

- `pnpm exec vp test` or focused website tests during development
- `pnpm exec vp run website#build`
- a final repo-level check if practical, while documenting any pre-existing failures separately

## Non-Goals

- Do not implement Storybook iframe embedding.
- Do not create a top-level `Theme` page in the first version.
- Do not write full API documentation for every component in the first version.
- Do not replace Storybook controls with website controls.
- Do not add new component package APIs just to support the website redesign.
- Do not broaden the design system beyond the established Deweyou visual language.

## Open Decisions Closed In This Spec

- The direction is `Design Specification First`.
- The top navigation is a compact fixed bar.
- `Theme` is removed from top-level IA.
- `Components` covers all public components with simplified cards.
- Storybook is linked directly and never embedded.
- Icons remains a separate page.
