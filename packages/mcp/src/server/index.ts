import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
  type ComponentCategoryId,
  componentCatalog,
  findComponent,
  getComponentImportSnippet,
} from '../catalog/index.js';
import { getIconImportSnippet, listIcons } from '../icons/index.js';
import { generateLlmsTxt } from '../llms/index.js';
import { colorFamilies, semanticThemeTokens, styleEntrypoints } from '../styles/index.js';

export type DesignMcpResourceDefinition = {
  description: string;
  mimeType: 'application/json' | 'text/markdown';
  name: string;
  uri: string;
};

export const designMcpResourceDefinitions: DesignMcpResourceDefinition[] = [
  {
    name: 'Deweyou Design overview',
    uri: 'deweyou://design/overview',
    description: 'LLM-oriented overview of Deweyou Design packages, setup, and rules.',
    mimeType: 'text/markdown',
  },
  {
    name: 'Deweyou Design component catalog',
    uri: 'deweyou://design/components',
    description: 'Structured component metadata mirrored from the website catalog.',
    mimeType: 'application/json',
  },
  {
    name: 'Deweyou Design style entrypoints',
    uri: 'deweyou://design/styles',
    description: 'Structured @deweyou-design/styles CSS, Less, token, and plugin entrypoints.',
    mimeType: 'application/json',
  },
  {
    name: 'Deweyou Design icon catalog',
    uri: 'deweyou://design/icons',
    description: 'Structured @deweyou-design/react-icons registry with public export names.',
    mimeType: 'application/json',
  },
  {
    name: 'Deweyou Design import matrix',
    uri: 'deweyou://design/imports',
    description: 'Root and subpath import snippets for every public component.',
    mimeType: 'text/markdown',
  },
  {
    name: 'Deweyou Design implementation rules',
    uri: 'deweyou://design/rules',
    description: 'Repository rules for component implementation, docs, and verification.',
    mimeType: 'text/markdown',
  },
];

export const createComponentListPayload = ({
  category,
}: {
  category?: ComponentCategoryId;
} = {}) => {
  const components = category
    ? componentCatalog.filter((component) => component.category === category)
    : componentCatalog;

  return { components };
};

export const createComponentDetailPayload = ({ name }: { name: string }) => {
  const component = findComponent(name);

  return {
    component,
    found: Boolean(component),
  };
};

export const createComponentImportPayload = ({
  name,
  subpath,
}: {
  name: string;
  subpath?: boolean;
}) => {
  const snippet = getComponentImportSnippet(name, { subpath });

  return {
    found: Boolean(snippet),
    snippet,
  };
};

export const createStyleEntrypointListPayload = () => {
  return {
    colorFamilies,
    semanticThemeTokens,
    styleEntrypoints,
  };
};

export const createIconListPayload = ({
  category,
  limit,
  query,
}: {
  category?: 'action' | 'feedback' | 'navigation' | 'status' | 'content';
  limit?: number;
  query?: string;
} = {}) => {
  return {
    icons: listIcons({ category, limit, query }),
  };
};

export const createIconImportPayload = ({ name }: { name: string }) => {
  const snippet = getIconImportSnippet(name);

  return {
    found: Boolean(snippet),
    snippet,
  };
};

const createImportMatrix = () => {
  return componentCatalog
    .map((component) => {
      const subpathSnippet = getComponentImportSnippet(component.name, { subpath: true });

      return `- ${component.name}: \`${component.importSnippet}\` or \`${subpathSnippet}\``;
    })
    .join('\n');
};

const createImplementationRules = () => {
  return `# Deweyou Design Implementation Rules

- Use Ark UI for interactive behavior when it matches the component pattern.
- Keep React components in TSX files under lowercase kebab-case component directories.
- Use @deweyou-design/styles tokens through CSS Modules instead of hard-coded one-off styles.
- Keep local entry and unit tests colocated as src/<unit-name>/index and index.test.
- New public components must update README.md, docs/design/components.md, package exports, website catalog, unit tests, Storybook stories, and contract tests.
- Run focused package tests first, then vp check before claiming completion.
`;
};

export const createMcpResourcePayload = (uri: string) => {
  if (uri === 'deweyou://design/overview') {
    return generateLlmsTxt();
  }

  if (uri === 'deweyou://design/components') {
    return JSON.stringify(componentCatalog, null, 2);
  }

  if (uri === 'deweyou://design/styles') {
    return JSON.stringify(createStyleEntrypointListPayload(), null, 2);
  }

  if (uri === 'deweyou://design/icons') {
    return JSON.stringify(createIconListPayload({ limit: 200 }).icons, null, 2);
  }

  if (uri === 'deweyou://design/imports') {
    return `# Deweyou Design Import Matrix\n\n${createImportMatrix()}\n`;
  }

  if (uri === 'deweyou://design/rules') {
    return createImplementationRules();
  }

  throw new Error(`Unknown Deweyou Design MCP resource: ${uri}`);
};

const toTextContent = (value: unknown) => {
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
};

export const createDesignMcpServer = () => {
  const server = new McpServer({
    name: '@deweyou-design/mcp',
    version: '0.0.0',
  });

  for (const resource of designMcpResourceDefinitions) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        description: resource.description,
        mimeType: resource.mimeType,
        title: resource.name,
      },
      (url) => ({
        contents: [
          {
            uri: url.href,
            mimeType: resource.mimeType,
            text: createMcpResourcePayload(resource.uri),
          },
        ],
      }),
    );
  }

  server.registerTool(
    'list_components',
    {
      title: 'List Deweyou Design components',
      description: 'List public Deweyou Design components, optionally filtered by category.',
      inputSchema: {
        category: z
          .enum(['actions', 'forms', 'overlays', 'navigation', 'feedback', 'content', 'data'])
          .optional(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    (args) => toTextContent(createComponentListPayload(args)),
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get Deweyou Design component',
      description: 'Return metadata for one public Deweyou Design component.',
      inputSchema: {
        name: z.string(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    (args) => toTextContent(createComponentDetailPayload(args)),
  );

  server.registerTool(
    'get_component_import',
    {
      title: 'Get Deweyou Design import snippet',
      description: 'Return a root or subpath import snippet for one component.',
      inputSchema: {
        name: z.string(),
        subpath: z.boolean().optional(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    (args) => toTextContent(createComponentImportPayload(args)),
  );

  server.registerTool(
    'list_style_entrypoints',
    {
      title: 'List Deweyou Design style entrypoints',
      description: 'List @deweyou-design/styles CSS, Less, token, and plugin entrypoints.',
      annotations: {
        readOnlyHint: true,
      },
    },
    () => toTextContent(createStyleEntrypointListPayload()),
  );

  server.registerTool(
    'list_icons',
    {
      title: 'List Deweyou Design icons',
      description:
        'List @deweyou-design/react-icons exports, optionally filtered by query/category.',
      inputSchema: {
        category: z.enum(['action', 'feedback', 'navigation', 'status', 'content']).optional(),
        limit: z.number().int().min(1).max(200).optional(),
        query: z.string().optional(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    (args) => toTextContent(createIconListPayload(args)),
  );

  server.registerTool(
    'get_icon_import',
    {
      title: 'Get Deweyou Design icon import snippet',
      description: 'Return an import snippet for one @deweyou-design/react-icons export.',
      inputSchema: {
        name: z.string(),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    (args) => toTextContent(createIconImportPayload(args)),
  );

  return server;
};

export const runDesignMcpServer = async () => {
  const server = createDesignMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
};
