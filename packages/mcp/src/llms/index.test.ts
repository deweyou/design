import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, test } from 'vite-plus/test';

import { generateLlmTxtCompatibilityText, generateLlmsTxt } from './index.js';

describe('llms text generation', () => {
  test('generates canonical llms.txt content for Deweyou Design', () => {
    const text = generateLlmsTxt();

    expect(text.startsWith('# Deweyou Design\n')).toBe(true);
    expect(text).toContain('npm install @deweyou-design/react @deweyou-design/styles');
    expect(text).toContain("import '@deweyou-design/styles/theme.css';");
    expect(text).toContain("import { Button } from '@deweyou-design/react';");
    expect(text).toContain("import { MermaidRender } from '@deweyou-design/react';");
    expect(text).toContain("import { NumberInput } from '@deweyou-design/react';");
    expect(text).toContain('Read-only Mermaid diagram renderer');
    expect(text).toContain('@deweyou-design/styles/unplugin-font-subset');
    expect(text).toContain('@deweyou-design/react-icons');
    expect(text).toContain('SearchIcon');
    expect(text).toContain('https://design-storybook-deweyous-projects.vercel.app');
    expect(text).toContain('docs/design/components.md');
    expect(text).toContain('docs/architecture/ark-ui.md');
  });

  test('generates singular compatibility text pointing to llms.txt', () => {
    expect(generateLlmTxtCompatibilityText()).toBe(
      'The canonical Deweyou Design LLM context file is /llms.txt.\n',
    );
  });

  test('keeps website public files synchronized with generators', async () => {
    const repositoryRoot = resolve(import.meta.dirname, '../../../..');
    const llmsFile = await readFile(
      resolve(repositoryRoot, 'apps/website/public/llms.txt'),
      'utf8',
    );
    const llmFile = await readFile(resolve(repositoryRoot, 'apps/website/public/llm.txt'), 'utf8');

    expect(llmsFile).toBe(generateLlmsTxt());
    expect(llmFile).toBe(generateLlmTxtCompatibilityText());
  });
});
