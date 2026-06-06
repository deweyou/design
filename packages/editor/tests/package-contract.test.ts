import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('editor package publishes explicit root and subpath exports', () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(root, 'packages/editor/package.json'), 'utf8'),
  ) as {
    dependencies: Record<string, string>;
    exports: Record<string, unknown>;
    files: string[];
    peerDependencies: Record<string, string>;
    publishConfig?: { directory?: string };
    types: string;
  };

  expect(packageJson.files).toEqual(['dist']);
  expect(packageJson.types).toBe('./dist/index.d.ts');
  expect(packageJson.publishConfig?.directory).toBe('dist');
  expect(packageJson.exports).toMatchObject({
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
    './editor': {
      default: './dist/editor/index.js',
      import: './dist/editor/index.js',
      types: './dist/editor/index.d.ts',
    },
    './core': {
      default: './dist/core/index.js',
      import: './dist/core/index.js',
      types: './dist/core/index.d.ts',
    },
    './plugins/rich-text': {
      default: './dist/plugins/rich-text/index.js',
      import: './dist/plugins/rich-text/index.js',
      types: './dist/plugins/rich-text/index.d.ts',
    },
    './plugins/markdown-shortcut': {
      default: './dist/plugins/markdown-shortcut/index.js',
      import: './dist/plugins/markdown-shortcut/index.js',
      types: './dist/plugins/markdown-shortcut/index.d.ts',
    },
    './plugins/toolbar': {
      default: './dist/plugins/toolbar/index.js',
      import: './dist/plugins/toolbar/index.js',
      types: './dist/plugins/toolbar/index.d.ts',
    },
    './adapters/markdown': {
      default: './dist/adapters/markdown/index.js',
      import: './dist/adapters/markdown/index.js',
      types: './dist/adapters/markdown/index.d.ts',
    },
    './utils': {
      default: './dist/utils/index.js',
      import: './dist/utils/index.js',
      types: './dist/utils/index.d.ts',
    },
    './style.css': './dist/style.css',
    './package.json': './package.json',
  });

  expect(packageJson.dependencies).toMatchObject({
    '@deweyou-design/react': 'workspace:*',
    '@deweyou-design/react-icons': 'workspace:*',
    '@deweyou-design/styles': 'workspace:*',
    '@lexical/code': 'catalog:',
    '@lexical/link': 'catalog:',
    '@lexical/list': 'catalog:',
    '@lexical/markdown': 'catalog:',
    '@lexical/react': 'catalog:',
    '@lexical/rich-text': 'catalog:',
    '@lexical/selection': 'catalog:',
    '@lexical/utils': 'catalog:',
    classnames: 'catalog:',
    lexical: 'catalog:',
  });
  expect(packageJson.peerDependencies).toMatchObject({
    react: 'catalog:',
    'react-dom': 'catalog:',
  });
});

test('editor package externalizes editor runtime dependencies in published builds', () => {
  const viteConfig = readFileSync(resolve(root, 'packages/editor/vite.config.ts'), 'utf8');

  expect(viteConfig).toContain("'@deweyou-design/react'");
  expect(viteConfig).toContain("'@deweyou-design/react-icons'");
  expect(viteConfig).toContain("'@deweyou-design/styles'");
  expect(viteConfig).toContain("'lexical'");
  expect(viteConfig).toContain('^@lexical');
});
