import { expect, test } from 'vite-plus/test';

import {
  classifyManifestDependencyRole,
  createPublishedPackageManifest,
  hostInstalledReactPackages,
  isCatalogSpecifier,
  isHostInstalledReactPackage,
  isWorkspaceSpecifier,
  normalizePublishedSpecifier,
  resolveCatalogSpecifier,
  resolveWorkspaceSpecifier,
} from './index';

test('package manifest helpers detect workspace and catalog specifiers', () => {
  expect(isCatalogSpecifier('catalog:')).toBe(true);
  expect(isCatalogSpecifier('^1.2.3')).toBe(false);
  expect(isWorkspaceSpecifier('workspace:*')).toBe(true);
  expect(isWorkspaceSpecifier('workspace:^')).toBe(true);
  expect(isWorkspaceSpecifier('^1.2.3')).toBe(false);
});

test('package manifest helpers track host-installed React packages', () => {
  expect(hostInstalledReactPackages).toEqual(['react', 'react-dom']);
  expect(isHostInstalledReactPackage('react')).toBe(true);
  expect(isHostInstalledReactPackage('react-dom')).toBe(true);
  expect(isHostInstalledReactPackage('@deweyou-ui/styles')).toBe(false);
});

test('package manifest helpers classify dependency roles', () => {
  expect(
    classifyManifestDependencyRole({
      dependencyName: 'react',
      manifestField: 'dependencies',
    }),
  ).toBe('peer-runtime');
  expect(
    classifyManifestDependencyRole({
      dependencyName: '@deweyou-ui/styles',
      internalPackageNames: ['@deweyou-ui/styles'],
      manifestField: 'dependencies',
    }),
  ).toBe('internal-package');
  expect(
    classifyManifestDependencyRole({
      dependencyName: 'typescript',
      manifestField: 'devDependencies',
    }),
  ).toBe('development');
});

test('package manifest helpers resolve catalog and workspace specifiers', () => {
  expect(
    resolveCatalogSpecifier({
      specifier: 'catalog:',
      resolvedVersion: '^19.1.1',
    }),
  ).toBe('^19.1.1');
  expect(
    resolveWorkspaceSpecifier({
      specifier: 'workspace:*',
      resolvedVersion: '0.2.0',
    }),
  ).toBe('^0.2.0');
  expect(
    resolveWorkspaceSpecifier({
      specifier: 'workspace:^',
      resolvedVersion: '0.2.0',
    }),
  ).toBe('^0.2.0');
});

test('package manifest helpers normalize published specifiers', () => {
  expect(
    normalizePublishedSpecifier({
      dependencyName: 'react',
      resolvedCatalogVersion: '^19.1.1',
      specifier: 'catalog:',
    }),
  ).toBe('^19.1.1');
  expect(
    normalizePublishedSpecifier({
      dependencyName: '@deweyou-ui/styles',
      internalPackageNames: ['@deweyou-ui/styles'],
      resolvedWorkspaceVersion: '0.2.0',
      specifier: 'workspace:*',
    }),
  ).toBe('^0.2.0');
});

test('package manifest helpers create a published manifest with peer React deps and dist-root paths', () => {
  expect(
    createPublishedPackageManifest({
      catalogVersions: {
        '@ark-ui/react': '^5.35.0',
        react: '^19.1.1',
        'react-dom': '^19.1.1',
      },
      internalPackageNames: ['@deweyou-ui/hooks'],
      manifest: {
        dependencies: {
          '@deweyou-ui/hooks': 'workspace:*',
          '@ark-ui/react': 'catalog:',
        },
        devDependencies: {
          vite: 'catalog:',
        },
        exports: {
          '.': {
            import: './dist/index.js',
            types: './dist/index.d.ts',
          },
          './package.json': './package.json',
        },
        files: ['dist'],
        name: '@deweyou-ui/components',
        peerDependencies: {
          react: 'catalog:',
          'react-dom': 'catalog:',
        },
        publishConfig: {
          directory: 'dist',
        },
        scripts: {
          build: 'vp build',
        },
        types: './dist/index.d.ts',
        version: '0.2.0',
      },
      workspaceVersions: {
        '@deweyou-ui/hooks': '0.2.0',
      },
    }),
  ).toEqual({
    dependencies: {
      '@deweyou-ui/hooks': '^0.2.0',
      '@ark-ui/react': '^5.35.0',
    },
    exports: {
      '.': {
        import: './index.js',
        types: './index.d.ts',
      },
      './package.json': './package.json',
    },
    name: '@deweyou-ui/components',
    peerDependencies: {
      react: '^19.1.1',
      'react-dom': '^19.1.1',
    },
    types: './index.d.ts',
    version: '0.2.0',
  });
});
