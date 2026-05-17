# LLM Discovery, MCP, and Skill Design

## Goal

Expose Deweyou Design components, styles, and icons to AI agents through three aligned entrypoints:

- a website-hosted `llms.txt` file for public model context discovery
- a local MCP server for structured component lookup
- an installable skill for agents that need reusable Deweyou Design workflow guidance

## Naming

`llms.txt` is the canonical public file because it follows the common LLM-readable site convention. `llm.txt` remains as a short compatibility pointer for clients or prompts that use the singular name.

## Architecture

The implementation adds a published workspace package, `@deweyou-design/mcp`, under `packages/mcp`. The package owns reusable component metadata, style entrypoint metadata, icon registry metadata, llms text generation, and the stdio MCP server. The website consumes the generated static text as checked-in public files under `apps/website/public/`.

The external skill lives under `skills/deweyou-design-components/` and can be installed with `npx skills add https://github.com/deweyou/design/tree/main/skills/deweyou-design-components -g -a codex`. It points agents toward the same contracts used by contributors: package exports, component docs, Storybook, Ark UI rules, and optional MCP resources.

## Public Content

The canonical `apps/website/public/llms.txt` must summarize:

- package purpose and install commands for components, styles, and icons
- theme setup and style import rules
- component categories and import snippets
- style entrypoints and icon usage
- Storybook and documentation links
- design and testing rules useful to code-generating agents

`apps/website/public/llm.txt` must remain short and direct users to `/llms.txt`.

## MCP Contract

The MCP server exposes read-only data:

- resources for package overview, component catalog, style entrypoints, icon catalog, import matrix, and design rules
- tools for listing components, reading one component, generating component import snippets, listing style entrypoints, listing icons, and generating icon import snippets

The server must not mutate files, run builds, or rely on browser state.

## Skill Contract

The skill should trigger when an agent is asked to build, modify, inspect, or document Deweyou Design components, styles, icons, or AI context. It should keep the core workflow concise and direct the agent to MCP resources or detailed docs only when needed.

## Verification

Coverage should include:

- unit tests for component metadata lookup
- unit tests for generated `llms.txt` and compatibility text
- unit tests for MCP resource/tool payload helpers
- repository check and package tests before completion
