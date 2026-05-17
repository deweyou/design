import {
  componentCatalog,
  componentCategories,
  getComponentStorybookUrl,
  storybookUrl,
  websiteUrl,
} from '../catalog/index.js';
import { iconCatalog } from '../icons/index.js';
import { styleEntrypoints } from '../styles/index.js';

const formatComponentLine = (component: (typeof componentCatalog)[number]) => {
  return `- ${component.name} (${component.category}): ${component.description} Import: \`${component.importSnippet}\` Storybook: ${getComponentStorybookUrl(component.storyId)}`;
};

export const generateLlmsTxt = () => {
  const categories = componentCategories
    .map((category) => {
      const componentNames = componentCatalog
        .filter((component) => component.category === category.id)
        .map((component) => component.name)
        .join(', ');

      return `- ${category.label}: ${componentNames}`;
    })
    .join('\n');

  const components = componentCatalog.map(formatComponentLine).join('\n');
  const styles = styleEntrypoints
    .map((entrypoint) => `- \`${entrypoint.importPath}\`: ${entrypoint.description}`)
    .join('\n');
  const iconExamples = iconCatalog
    .slice(0, 24)
    .map((icon) => icon.exportName)
    .join(', ');

  return `# Deweyou Design

> React UI component library with design tokens, Ark UI behavior primitives, icon components, and a Vite preview website.

Website: ${websiteUrl}
Storybook: ${storybookUrl}
Repository docs: docs/

## Install

\`\`\`bash
npm install @deweyou-design/react @deweyou-design/styles
npm install @deweyou-design/react-icons
\`\`\`

## Required Theme Setup

Import the global theme once near the app entry:

\`\`\`ts
import '@deweyou-design/styles/theme.css';
\`\`\`

Component styles are loaded by component imports. For SSR or full upfront CSS, use:

\`\`\`ts
import '@deweyou-design/react/style.css';
\`\`\`

## Import Rules

Use root imports when consuming several components together:

\`\`\`tsx
import { Button, Input } from '@deweyou-design/react';
\`\`\`

Use subpath imports for docs, examples, and single-component usage:

\`\`\`tsx
import { Button } from '@deweyou-design/react/button';
\`\`\`

## Component Categories

${categories}

## Component Catalog

${components}

## Styles

${styles}

## Icons

Install and import icons from \`@deweyou-design/react-icons\`. The current MCP catalog includes ${iconCatalog.length} icon exports from the Deweyou-maintained registry.

\`\`\`tsx
import { SearchIcon, CheckIcon, ChevronDownIcon } from '@deweyou-design/react-icons';
\`\`\`

Example icon exports: ${iconExamples}

## Design And Implementation Rules

- Follow docs/design/components.md for public component import and composition contracts.
- Follow docs/design/system.md for visual language and token usage.
- Follow docs/architecture/ark-ui.md when choosing Ark UI behavior primitives for interactive components.
- Follow docs/architecture/package-layers.md before adding packages or dependencies.
- React components must live in TSX files and use CSS Modules plus @deweyou-design/styles tokens.
- Interactive icons should be wrapped in IconButton, Button.Icon, or a native button.
- New public components should update package exports, docs, README files, website catalog, unit tests, Storybook stories, and contract tests.

## MCP And Skill

Use @deweyou-design/mcp for structured component, style, and icon lookup through MCP. Use the Deweyou Design component skill when an AI agent is modifying or documenting Deweyou Design components.
`;
};

export const generateLlmTxtCompatibilityText = () => {
  return 'The canonical Deweyou Design LLM context file is /llms.txt.\n';
};
