# LLM Discovery, MCP, and Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public `llms.txt`, a published read-only Deweyou Design MCP server, and an external skill backed by the current component, styles, and icon packages.

**Architecture:** `packages/mcp` owns reusable component metadata, style entrypoint metadata, icon registry metadata, llms generation, and MCP stdio wiring. `apps/website/public` contains checked-in generated text files for site hosting. `skills/deweyou-design-components` contains the independently installable agent skill.

**Tech Stack:** TypeScript, vite-plus, `@modelcontextprotocol/sdk`, Codex skill markdown, Vite public assets.

---

### Task 1: Metadata and llms Tests

**Files:**

- Create: `packages/mcp/package.json`
- Create: `packages/mcp/tsconfig.json`
- Create: `packages/mcp/vite.config.ts`
- Create: `packages/mcp/src/catalog/index.test.ts`
- Create: `packages/mcp/src/llms/index.test.ts`

- [x] **Step 1: Create package scaffolding for tests**

Create the private workspace package with `vp test` and `vp pack` scripts.

- [x] **Step 2: Write failing metadata tests**

Assert the catalog includes exported components such as `Button`, `Dialog`, `NavOverlay`, `VirtualList`, `toast`, and `Toaster`; assert lookup is case-insensitive and unknown lookups return `undefined`.

- [x] **Step 3: Write failing llms tests**

Assert generated `llms.txt` starts with `# Deweyou Design`, includes install commands, component import snippets, Storybook URLs, and links to design docs. Assert compatibility text points to `/llms.txt`.

### Task 2: Metadata and llms Implementation

**Files:**

- Create: `packages/mcp/src/catalog/index.ts`
- Create: `packages/mcp/src/llms/index.ts`
- Create: `packages/mcp/src/index.ts`
- Create: `apps/website/public/llms.txt`
- Create: `apps/website/public/llm.txt`

- [x] **Step 1: Implement catalog metadata**

Mirror the website component catalog as JSX-free structured data with package names, import snippets, categories, dimensions, story ids, and documentation URLs.

- [x] **Step 2: Implement llms generation**

Generate canonical and compatibility text from the catalog helpers.

- [x] **Step 3: Write website public files**

Commit `llms.txt` as the generated canonical content and `llm.txt` as the compatibility pointer.

### Task 3: MCP Server

**Files:**

- Create: `packages/mcp/src/server/index.test.ts`
- Create: `packages/mcp/src/server/index.ts`
- Modify: `packages/mcp/package.json`

- [x] **Step 1: Write failing MCP payload tests**

Assert resource payloads include overview, component catalog, import matrix, and design rules. Assert tool handlers list components, return one component, and generate import snippets.

- [x] **Step 2: Implement MCP helpers and stdio server**

Use pure helper functions for tests and wire them into `@modelcontextprotocol/sdk/server/mcp.js` with `StdioServerTransport`.

- [x] **Step 3: Add package scripts and bin**

Expose `deweyou-design-mcp` from the built package and add an `mcp` script that runs the server after build.

### Task 4: Repository Skill

**Files:**

- Create: `skills/deweyou-design-components/SKILL.md`
- Create: `skills/deweyou-design-components/agents/openai.yaml`

- [x] **Step 1: Write concise skill instructions**

Cover when to use the skill, which docs to inspect, component implementation rules, MCP usage, and verification expectations.

- [x] **Step 2: Add UI metadata**

Add deterministic display metadata for the skill list.

### Task 5: Verification

**Files:**

- Verify the changed files only, then run repository checks if targeted checks pass.

- [ ] **Step 1: Install dependencies**

Run `pnpm install` so `@modelcontextprotocol/sdk` is locked for `packages/mcp`.

- [ ] **Step 2: Run package tests**

Run `pnpm --filter @deweyou-design/mcp test`.

- [ ] **Step 3: Run package build**

Run `pnpm --filter @deweyou-design/mcp build`.

- [ ] **Step 4: Run repository check**

Run `vp check`.
