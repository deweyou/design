import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

test('cross-package boundary coverage stays in top-level tests', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/components/package.json'), 'utf8'),
  ) as { dependencies: Record<string, string> };
  const hooksPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/hooks/package.json'), 'utf8'),
  ) as { dependencies: Record<string, string> };
  const iconsPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/icons/package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> };
  const stylesPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/styles/package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> };

  expect(componentPackage.dependencies).toMatchObject({
    '@deweyou-ui/hooks': 'workspace:*',
    '@deweyou-ui/styles': 'workspace:*',
  });
  expect(componentPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/icons');
  expect(componentPackage.dependencies ?? {}).not.toHaveProperty('@storybook/react');
  expect(hooksPackage.dependencies).toMatchObject({
    '@deweyou-ui/utils': 'workspace:*',
  });
  expect(iconsPackage.dependencies).toMatchObject({
    react: 'catalog:',
    'tdesign-icons-svg': 'catalog:',
  });
  expect(iconsPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/components');
  expect(stylesPackage.dependencies ?? {}).not.toHaveProperty('@deweyou-ui/components');
});

test('button and icon button stay owned by the components package root entry', () => {
  const componentPackage = JSON.parse(
    readFileSync(resolve(root, 'packages/components/package.json'), 'utf8'),
  ) as {
    exports: Record<string, { default?: string; import?: string; types?: string } | string>;
    files: string[];
  };
  const componentEntry = readFileSync(resolve(root, 'packages/components/src/index.ts'), 'utf8');

  expect(componentEntry).toContain('Button');
  expect(componentEntry).toContain('IconButton');
  expect(componentEntry).toContain("from './button'");
  expect(componentPackage.files).toEqual(['dist', 'src']);
  expect(componentPackage.exports).toMatchObject({
    '.': {
      default: './dist/index.js',
      import: './dist/index.js',
      types: './src/index.ts',
    },
    './style.css': './dist/style.css',
  });
  expect(componentPackage.exports).not.toHaveProperty('./button');
  expect(componentPackage.exports).not.toHaveProperty('./icon-button');
});

test('storybook button review matrix covers native prop passthrough and loading states', () => {
  const storybookEntry = readFileSync(
    resolve(root, 'apps/storybook/src/stories/Button.stories.tsx'),
    'utf8',
  );

  expect(storybookEntry).toContain("['neutral', 'primary', 'danger']");
  expect(storybookEntry).toContain('export const PublicProps');
  expect(storybookEntry).toContain('export const LoadingStates');
  expect(storybookEntry).toContain('htmlType');
  expect(storybookEntry).toContain('loading');
  expect(storybookEntry).toContain('focusTargetRef.current?.focus()');
});

test('website button guidance documents danger, loading, and ref boundaries', () => {
  const websiteEntry = readFileSync(resolve(root, 'apps/website/src/main.tsx'), 'utf8');

  expect(websiteEntry).toContain('Public prop passthrough');
  expect(websiteEntry).toContain('Loading guidance');
  expect(websiteEntry).toContain('htmlType');
  expect(websiteEntry).toContain('loading');
  expect(websiteEntry).toContain('focusTargetRef.current?.focus()');
  expect(websiteEntry).toContain("['neutral', 'primary', 'danger']");
});
