# Merge Editor Into React Design

## Goal

Move the editor capability from the unpublished `@deweyou-design/editor` package into
`@deweyou-design/react` so release no longer needs to create a new npm package.

## Decision

`@deweyou-design/react` becomes the public home for `Editor`, editor contracts,
official plugins, adapters, and utility exports. The standalone
`packages/editor` package is removed from the workspace and from the release
queue because it has not been successfully published.

## Public API

Consumers import the common editor surface from the react package root:

```ts
import { Editor, markdownEditorAdapter, richTextPlugin } from '@deweyou-design/react';
```

Focused subpaths live under the `editor` namespace:

```ts
import { Editor } from '@deweyou-design/react/editor';
import { createEditorPlugin } from '@deweyou-design/react/editor/core';
import { richTextPlugin } from '@deweyou-design/react/editor/plugins/rich-text';
import { markdownEditorAdapter } from '@deweyou-design/react/editor/adapters/markdown';
```

The old `@deweyou-design/editor` import path is not retained because the package
never completed its first npm publish.

## Implementation Notes

- Move `packages/editor/src/*` into `packages/react/src/editor/*`.
- Add editor runtime dependencies to `packages/react/package.json`.
- Add `@deweyou-design/react/editor/*` subpath exports to
  `packages/react/package.json`.
- Update website, Storybook, MCP catalog, README, and component docs to point to
  `@deweyou-design/react`.
- Remove `@deweyou-design/editor` from `scripts/release.mjs` and package-layer
  documentation.
- Preserve the existing editor tests by moving them with the source and adjusting
  relative imports.

## Verification

Run focused contract and editor tests first, then the broader package checks:

```bash
vp test packages/react/tests/subpath-entrypoint.test.ts packages/react/tests/package-entrypoint.test.ts
vp test packages/react/src/editor
vp test apps/website/src/pages/editor.test.tsx apps/website/src/data/component-catalog.test.tsx packages/mcp/src/catalog/index.test.ts
vp run build -r
```

## Update Footer

Last updated: 2026-07-07. Reason: avoid a failed first publish for a standalone
editor package by folding editor capability into the already published react
package.
