# Markdown Frontmatter Properties Plan

1. Add a direct `yaml` runtime dependency behind a project-owned parser/update boundary.
2. Add the public `Frontmatter` component, property type contracts, read/edit controls, source recovery, styles, and unit tests.
3. Split leading frontmatter from the Markdown body in `MarkdownRender`; add visible, hidden, source, and raw compatibility behavior.
4. Add FrontmatterNode and a multiline Markdown transformer. Register the node through `frontmatterPlugin` and enable the transformer from the adapter registry.
5. Add controlled Editor editing, read-only behavior, invalid YAML recovery, and round-trip tests.
6. Publish root/subpath exports and update package contract tests.
7. Update Storybook interactions, website catalog, MCP catalog, README files, component contracts, the repo-owned component skill, and generated `llms.txt`.
8. Run focused tests, `vp check`, `vp test`, `vp run storybook#test`, the package build, and live browser verification for MarkdownRender and Editor.
9. Refine the editable surface from product references: separate value editing from schema controls, replace persistent type Selects with icon menus, collapse list creation, and verify desktop and compact layouts.
10. Apply review feedback without changing the data contract: make Badge removal a non-layout overlay with a matching gradient scrim, align the property surface to sans-serif body typography, and verify both in the live story.
11. Reuse NumberInput for numeric properties with optional step controls and focus ring disabled, preserving direct entry, keyboard stepping, and row-owned focus feedback.
12. Complete top-level property editing with add, rename, delete, empty state, and YAML-document operations that retain unaffected comments, ordering, and quoting.
13. Make type changes compatibility-safe, prevent scalar list type drift, add per-key editing options and localized copy, and cover the behavior in unit, Editor, Storybook, website, MCP, and skill surfaces.
