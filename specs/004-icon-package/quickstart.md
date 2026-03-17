# Quickstart: Icon Package for UI Library

## Goal

Implement a new `@deweyou-ui/icons` package that ships a foundational curated icon catalog, keeps the root entry focused on the generic `Icon` API, exposes icon components from per-icon subpaths, and is reviewable in Storybook and documented in the website.

## Proposed Build Order

1. Create `packages/icons` with package metadata, build config, README, root entrypoint, and package-local test configuration aligned with other workspace packages.
2. Add the internal icon registry and the base `Icon` renderer.
3. Add the initial foundational catalog entries and generated per-icon subpath exports from the same registry.
4. Add package tests for catalog uniqueness, runtime failure behavior, and accessibility semantics.
5. Add Storybook stories that cover catalog browsing, unlabeled versus labeled usage, sizing, theming, and unsupported-name failure.
6. Add `apps/website` documentation or curated demo content that explains installation, usage patterns, and catalog expectations.

## Implementation Notes

- Use `tdesign-icons-svg` as the upstream asset source for the initial foundational catalog.
- Do not expose upstream package naming or file structure through the public package API.
- Keep icon color inherited from surrounding UI by default so icons align with existing semantic color tokens.
- Keep the generic `Icon` component and subpath icon exports generated from one canonical registry to avoid drift.
- Prefer subpath icon imports for static component usage, and reserve the generic `Icon` component for dynamic icon lookup.

## Verification

Run these commands from the repository root:

```bash
vp check
vp test
vp run storybook#build
vp run website#build
```

## Completion Checklist

- `packages/icons` builds and tests successfully.
- The foundational catalog has stable names and generated subpath icon exports.
- Unsupported names fail explicitly.
- Unlabeled and labeled usage are both documented and tested.
- Source attribution for `tdesign-icons-svg` remains visible in package and website docs.
- Storybook and website both reflect the new icon package contract.
