import { expect, test } from 'vite-plus/test';

import {
  classifyManifestDependencyRole,
  createPublishedPackageManifest,
  isCatalogSpecifier,
  isWorkspaceSpecifier,
  normalizePublishedSpecifier,
} from '../src/package-manifest';

test('publish contract base recognizes workspace and catalog source specifiers', () => {
  expect(isCatalogSpecifier('catalog:')).toBe(true);
  expect(isWorkspaceSpecifier('workspace:*')).toBe(true);
});

test('publish contract base classifies host-installed React runtime as peer dependencies', () => {
  expect(
    classifyManifestDependencyRole({
      dependencyName: 'react',
      manifestField: 'dependencies',
    }),
  ).toBe('peer-runtime');
  expect(
    classifyManifestDependencyRole({
      dependencyName: 'react-dom',
      manifestField: 'peerDependencies',
    }),
  ).toBe('peer-runtime');
});

test('publish contract base normalizes internal package and catalog specifiers for publishing', () => {
  expect(
    normalizePublishedSpecifier({
      dependencyName: '@deweyou-ui/styles',
      internalPackageNames: ['@deweyou-ui/styles'],
      resolvedWorkspaceVersion: '0.1.0',
      specifier: 'workspace:*',
    }),
  ).toBe('^0.1.0');
  expect(
    normalizePublishedSpecifier({
      dependencyName: 'react',
      resolvedCatalogVersion: '^19.1.1',
      specifier: 'catalog:',
    }),
  ).toBe('^19.1.1');
});

test('publish contract base rewrites publishable manifests without internal placeholders', () => {
  const publishedManifest = createPublishedPackageManifest({
    catalogVersions: {
      react: '^19.1.1',
      'react-dom': '^19.1.1',
    },
    internalPackageNames: ['@deweyou-ui/styles'],
    manifest: {
      dependencies: {
        '@deweyou-ui/styles': 'workspace:*',
      },
      exports: {
        '.': {
          import: './dist/index.mjs',
          types: './dist/index.d.mts',
        },
        './package.json': './package.json',
      },
      name: '@deweyou-ui/components',
      peerDependencies: {
        react: 'catalog:',
        'react-dom': 'catalog:',
      },
      publishConfig: {
        directory: 'dist',
      },
      types: './dist/index.d.mts',
      version: '0.1.0',
    },
    workspaceVersions: {
      '@deweyou-ui/styles': '0.1.0',
    },
  });

  expect(publishedManifest.dependencies).toEqual({
    '@deweyou-ui/styles': '^0.1.0',
  });
  expect(publishedManifest.peerDependencies).toEqual({
    react: '^19.1.1',
    'react-dom': '^19.1.1',
  });
  expect(JSON.stringify(publishedManifest)).not.toContain('workspace:*');
  expect(JSON.stringify(publishedManifest)).not.toContain('catalog:');
  expect(publishedManifest.types).toBe('./index.d.mts');
});
