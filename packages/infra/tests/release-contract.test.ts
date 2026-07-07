import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

type PackageManifest = {
  name?: string;
  private?: boolean;
  repository?: {
    type?: string;
    url?: string;
  };
  publishConfig?: {
    directory?: string;
  };
};

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;

test('release script includes every public Deweyou Design package with a dist publish target', () => {
  const packagesDir = resolve(root, 'packages');
  const releaseScript = readFileSync(resolve(root, 'scripts/release.mjs'), 'utf8');
  const publishablePackageNames = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(resolve(packagesDir, entry.name, 'package.json')))
    .map((entry) => {
      const manifest = readJson<PackageManifest>(resolve(packagesDir, entry.name, 'package.json'));

      return manifest;
    })
    .flatMap((manifest) =>
      manifest.private !== true &&
      manifest.name?.startsWith('@deweyou-design/') &&
      manifest.publishConfig?.directory === 'dist'
        ? [manifest.name]
        : [],
    )
    .sort((left, right) => left.localeCompare(right));

  expect(publishablePackageNames).toEqual([
    '@deweyou-design/mcp',
    '@deweyou-design/react',
    '@deweyou-design/react-hooks',
    '@deweyou-design/react-icons',
    '@deweyou-design/styles',
    '@deweyou-design/utils',
  ]);

  for (const packageName of publishablePackageNames) {
    expect(releaseScript).toContain(`npmName: '${packageName}'`);
  }
});

test('release workflow forwards the selected semver bump to the release script', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/release.yml'), 'utf8');
  const releaseScript = readFileSync(resolve(root, 'scripts/release.mjs'), 'utf8');

  expect(workflow).toContain('bump:');
  expect(workflow).toContain('- patch');
  expect(workflow).toContain('- minor');
  expect(workflow).toContain('- major');
  expect(workflow).toContain(
    'node scripts/release.mjs ${{ inputs.channel }} --bump ${{ inputs.bump }} $DRY_RUN_FLAG',
  );
  expect(releaseScript).toContain("const SUPPORTED_BUMPS = ['patch', 'minor', 'major'];");
  expect(releaseScript).toContain(
    'const targetVersion = getNextVersion(prevVersion, channel, bump);',
  );
});

test('release workflow grants oidc publishing without forwarding a long-lived npm token', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/release.yml'), 'utf8');

  expect(workflow).toContain('id-token: write');
  expect(workflow).not.toContain('NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}');
});

test('release script lets trusted publishing use the GitHub Actions oidc token exchange', () => {
  const releaseScript = readFileSync(resolve(root, 'scripts/release.mjs'), 'utf8');

  expect(releaseScript).toContain('const isTrustedPublishingRuntime =');
  expect(releaseScript).toContain('ACTIONS_ID_TOKEN_REQUEST_TOKEN');
  expect(releaseScript).toContain('trusted publishing');
});

test('publishable package manifests identify the trusted publishing repository', () => {
  const packagesDir = resolve(root, 'packages');
  const publishableManifests = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(resolve(packagesDir, entry.name, 'package.json')))
    .map((entry) => readJson<PackageManifest>(resolve(packagesDir, entry.name, 'package.json')))
    .filter(
      (manifest) =>
        manifest.private !== true &&
        manifest.name?.startsWith('@deweyou-design/') &&
        manifest.publishConfig?.directory === 'dist',
    );

  expect(publishableManifests).toHaveLength(6);
  for (const manifest of publishableManifests) {
    expect(manifest.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/deweyou/design.git',
    });
  }
});
