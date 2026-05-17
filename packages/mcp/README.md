# @deweyou-design/mcp

Read-only MCP server and LLM context generator for Deweyou Design components, styles, and icons.

## Installation

```bash
npm install @deweyou-design/mcp
```

## MCP Server

Run the stdio server:

```bash
npx deweyou-design-mcp
```

Resources:

- `deweyou://design/overview`
- `deweyou://design/components`
- `deweyou://design/styles`
- `deweyou://design/icons`
- `deweyou://design/imports`
- `deweyou://design/rules`

Tools:

- `list_components`
- `get_component`
- `get_component_import`
- `list_style_entrypoints`
- `list_icons`
- `get_icon_import`

## Programmatic Usage

```ts
import {
  componentCatalog,
  generateLlmsTxt,
  iconCatalog,
  styleEntrypoints,
} from '@deweyou-design/mcp';

console.log(componentCatalog);
console.log(styleEntrypoints);
console.log(iconCatalog.length);
console.log(generateLlmsTxt());
```

## License

MIT
