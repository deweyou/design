# Config Provider Localization Implementation Plan

**Goal:** Deliver the approved `ConfigProvider` locale contract with component-owned translations, synchronous `en-US` fallback, per-component lazy locale chunks, complete public documentation, and bundle evidence.

**Alignment:** Confirmed by the user on 2026-07-22. Material decisions: use `ConfigProvider`; keep `localeText` component-local; split translations by component; lazy-load non-English locales; keep `en-US` synchronous.

---

### Task 1: Protect the provider and lazy-loading contract with tests

**Files:**

- Create: `packages/react/src/config-provider/index.test.tsx`
- Update: `packages/react/src/pagination/index.test.tsx`
- Create or update: locale/bundle contract tests under `packages/react/tests/`

- [x] Cover the default locale, explicit locale, and nested provider behavior.
- [x] Cover component-level `localeText` override priority.
- [x] Cover an uncached lazy locale through Suspense and cached locale switching.
- [x] Add a build/source contract proving component-local dynamic locale boundaries.

### Task 2: Implement the shared configuration and locale loader boundary

**Files:**

- Create: `packages/react/src/config-provider/index.tsx`
- Create: internal context and locale-loader modules under `packages/react/src/config-provider/`
- Create: component-local locale modules beginning with `packages/react/src/pagination/locale/`

- [x] Add the typed five-locale union and deterministic `en-US` default.
- [x] Keep internal config access private to package source.
- [x] Cache locale imports and use deferred locale reads so revealed content remains stable during switches.
- [x] Avoid new runtime dependencies.

### Task 3: Migrate existing component and editor-plugin copy

**Files:**

- Modify: affected component and editor plugin source units under `packages/react/src/`
- Create: a `locale/` directory within each affected public component or plugin unit

- [x] Move built-in visible and accessibility copy into typed component-owned locale dictionaries.
- [x] Add component-owned `localeText` props where consumers need copy overrides.
- [x] Preserve existing explicit label props and precedence.
- [x] Pass provider locale to formatting components unless an explicit component locale wins.

### Task 4: Publish the API and contracts

**Files:**

- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/package.json`
- Modify: package, subpath, SSR, documentation, and workspace contract tests as needed

- [x] Export `ConfigProvider`, `ConfigProviderProps`, and locale types from the root and `./config-provider` subpath.
- [x] Keep private locale-loader helpers out of the public entrypoint.
- [x] Verify published dynamic locale chunks and manifest paths.

### Task 5: Update Storybook, website, documentation, MCP, and skill guidance

**Files:**

- Create: `apps/storybook/src/stories/ConfigProvider.stories.tsx`
- Modify: affected Storybook stories
- Modify: website component catalog and tests
- Modify: `README.md`, `README_ZH.md`, and `docs/design/components.md`
- Modify: `packages/mcp/src/catalog/index.ts` and related tests
- Modify: `skills/deweyou-design-components/SKILL.md` if the public workflow changes
- Regenerate: `apps/website/public/llms.txt`

- [x] Demonstrate all five locales, runtime switching, and a component-local override.
- [x] Document Suspense ownership and synchronous English fallback.
- [x] Keep component catalog, MCP context, and generated LLM guidance synchronized.

### Task 6: Verify behavior and bundle shape

- [x] Run focused provider, component, and contract tests.
- [x] Run `vp check`.
- [x] Run `vp test`.
- [x] Run `vp run storybook#test`.
- [x] Run `vp run build -r`.
- [x] Inspect emitted locale chunks and verify the component-level tree-shaking contract.
- [x] Render the Storybook locale-switching story and check first load, runtime switch, component override, and accessibility labels.

### Task 7: Durable knowledge and delivery readiness

- [x] Run the DDev `repo-memory` module against the final diff.
- [x] Record only expensive-to-recover localization and bundle constraints in durable repository knowledge.
- [x] Leave `.harness_local/` and unrelated work unstaged.
- [x] Offer commit, push, PR, and CI follow-up only after verification.

_Last updated: 2026-07-22 | Reason: record the completed ConfigProvider localization delivery steps and evidence_
