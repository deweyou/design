import { describe, expect, test } from 'vite-plus/test';

import {
  createComponentDetailPayload,
  createComponentImportPayload,
  createComponentListPayload,
  createIconImportPayload,
  createIconListPayload,
  createMcpResourcePayload,
  createStyleEntrypointListPayload,
  designMcpResourceDefinitions,
} from './index.js';

describe('MCP payload helpers', () => {
  test('defines read-only resources for AI clients', () => {
    expect(designMcpResourceDefinitions.map((resource) => resource.name)).toEqual([
      'Deweyou Design overview',
      'Deweyou Design component catalog',
      'Deweyou Design style entrypoints',
      'Deweyou Design icon catalog',
      'Deweyou Design import matrix',
      'Deweyou Design implementation rules',
    ]);

    expect(createMcpResourcePayload('deweyou://design/components')).toContain('Button');
    expect(createMcpResourcePayload('deweyou://design/components')).toContain('MermaidRender');
    expect(createMcpResourcePayload('deweyou://design/imports')).toContain(
      '@deweyou-design/react/mermaid-render',
    );
    expect(createMcpResourcePayload('deweyou://design/rules')).toContain('Ark UI');
    expect(createMcpResourcePayload('deweyou://design/rules')).toContain('AI-facing context');
    expect(createMcpResourcePayload('deweyou://design/styles')).toContain('theme.css');
    expect(createMcpResourcePayload('deweyou://design/icons')).toContain('SearchIcon');
  });

  test('lists components by category', () => {
    const payload = createComponentListPayload({ category: 'feedback' });

    expect(payload.components.map((component) => component.name)).toEqual(
      expect.arrayContaining(['Badge', 'Skeleton', 'Spinner', 'toast', 'Toaster']),
    );
    expect(payload.components.every((component) => component.category === 'feedback')).toBe(true);
  });

  test('returns details and import snippets for a component', () => {
    expect(createComponentDetailPayload({ name: 'dialog' }).component?.name).toBe('Dialog');
    expect(createComponentImportPayload({ name: 'Button', subpath: true }).snippet).toBe(
      "import { Button } from '@deweyou-design/react/button';",
    );
  });

  test('marks unknown components as not found', () => {
    expect(createComponentDetailPayload({ name: 'unknown' })).toEqual({
      component: undefined,
      found: false,
    });
    expect(createComponentImportPayload({ name: 'unknown' })).toEqual({
      found: false,
      snippet: undefined,
    });
  });

  test('returns style and icon payloads', () => {
    expect(createStyleEntrypointListPayload().styleEntrypoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ importPath: '@deweyou-design/styles/theme.css' }),
      ]),
    );
    expect(createIconListPayload({ query: 'search', limit: 5 }).icons.length).toBeGreaterThan(0);
    expect(createIconImportPayload({ name: 'SearchIcon' }).snippet).toBe(
      "import { SearchIcon } from '@deweyou-design/react-icons';",
    );
  });
});
