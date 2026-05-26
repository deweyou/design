import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('cross-package boundary coverage stays in top-level tests', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'),
  ) as {
    dependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const hooksPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/react-hooks/package.json'), 'utf8'),
  ) as {
    dependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const iconsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/react-icons/package.json'), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const stylesPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/styles/package.json'), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };
  const utilsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/utils/package.json'), 'utf8'),
  ) as {
    publishConfig?: { directory?: string };
  };
  const mcpPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/mcp/package.json'), 'utf8'),
  ) as {
    dependencies?: Record<string, string>;
    publishConfig?: { directory?: string };
  };

  expect(componentPackage.dependencies).toMatchObject({
    '@deweyou-design/react-hooks': 'workspace:*',
    '@deweyou-design/react-icons': 'workspace:*',
    '@deweyou-design/styles': 'workspace:*',
  });
  expect(componentPackage.peerDependencies).toMatchObject({
    react: 'catalog:',
    'react-dom': 'catalog:',
  });
  expect(componentPackage.dependencies ?? {}).not.toHaveProperty('@storybook/react');
  expect(hooksPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/utils');
  expect(hooksPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/infra');
  expect(hooksPackage.peerDependencies).toMatchObject({
    react: 'catalog:',
  });
  expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('@tabler/icons-react');
  expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('tdesign-icons-svg');
  expect(iconsPackage.devDependencies).toMatchObject({
    'tdesign-icons-svg': '0.4.2',
    vite: 'catalog:',
  });
  expect(iconsPackage.peerDependencies).toMatchObject({
    react: 'catalog:',
  });
  expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-design/react');
  expect(stylesPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-design/react');
  expect(mcpPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/infra');
  expect(componentPackage.publishConfig?.directory).toBe('dist');
  expect(hooksPackage.publishConfig?.directory).toBe('dist');
  expect(iconsPackage.publishConfig?.directory).toBe('dist');
  expect(stylesPackage.publishConfig?.directory).toBe('dist');
  expect(utilsPackage.publishConfig?.directory).toBe('dist');
  expect(mcpPackage.publishConfig?.directory).toBe('dist');
});

test('components package keeps root compatibility while exposing documented subpath entries', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'),
  ) as {
    exports: Record<string, { default?: string; import?: string; types?: string } | string>;
    files: string[];
    types: string;
  };

  expect(componentPackage.files).toEqual(['dist']);
  expect(componentPackage.types).toBe('./dist/index.d.ts');
  expect(componentPackage.exports).toMatchObject({
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
    './button': {
      default: './dist/button/index.js',
      import: './dist/button/index.js',
      types: './dist/button/index.d.ts',
    },
    './popover': {
      default: './dist/popover/index.js',
      import: './dist/popover/index.js',
      types: './dist/popover/index.d.ts',
    },
    './text': {
      default: './dist/text/index.js',
      import: './dist/text/index.js',
      types: './dist/text/index.d.ts',
    },
    './style.css': './dist/style.css',
  });
  expect(componentPackage.exports).not.toHaveProperty('./icon-button');
});

test('workspace publish flow writes dist package manifests instead of mutating source manifests during release builds', () => {
  const componentsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };
  const hooksPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/react-hooks/package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };
  const utilsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/utils/package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };
  const mcpPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/mcp/package.json'), 'utf8'),
  ) as { scripts?: Record<string, string> };
  const stylesScript = readFileSync(
    resolve(root, 'packages/styles/scripts/copy-assets.mjs'),
    'utf8',
  );
  const iconsScript = readFileSync(
    resolve(root, 'packages/react-icons/scripts/clean-dist.mjs'),
    'utf8',
  );

  expect(componentsPackage.scripts?.build).toContain('write-published-manifest.mjs');
  expect(hooksPackage.scripts?.build).toContain('write-published-manifest.mjs');
  expect(utilsPackage.scripts?.build).toContain('write-published-manifest.mjs');
  expect(mcpPackage.scripts?.build).toContain('write-published-manifest.mjs');
  expect(stylesScript).toContain('writePublishedManifest');
  expect(stylesScript).not.toContain('writeFileSync');
  expect(iconsScript).toContain("resolve(packageRoot, 'dist')");
});

test('components package externalizes markdown runtime dependencies in published builds', () => {
  const viteConfig = readFileSync(resolve(root, 'packages/react/vite.config.ts'), 'utf8');

  expect(viteConfig).toContain("'beautiful-mermaid'");
  expect(viteConfig).toContain("'mermaid'");
  expect(viteConfig).toContain("'react-markdown'");
  expect(viteConfig).toContain("'rehype-highlight'");
  expect(viteConfig).toContain("'remark-gfm'");
});
