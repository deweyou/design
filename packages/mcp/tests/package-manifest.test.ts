import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, test } from 'vite-plus/test';

type MpcPackageManifest = {
  bin?: Record<string, string>;
  files?: string[];
  name?: string;
  private?: boolean;
  publishConfig?: {
    directory?: string;
  };
  scripts?: Record<string, string>;
};

const packageRoot = resolve(import.meta.dirname, '..');

const readPackageManifest = async () => {
  const packageJson = await readFile(resolve(packageRoot, 'package.json'), 'utf8');

  return JSON.parse(packageJson) as MpcPackageManifest;
};

describe('@deweyou-design/mcp package manifest', () => {
  test('is configured as a published @deweyou-design package', async () => {
    const manifest = await readPackageManifest();

    expect(manifest.name).toBe('@deweyou-design/mcp');
    expect(manifest.private).toBeUndefined();
    expect(manifest.files).toEqual(['dist']);
    expect(manifest.publishConfig?.directory).toBe('dist');
  });

  test('publishes a stdio MCP binary from dist', async () => {
    const manifest = await readPackageManifest();

    expect(manifest.bin).toEqual({
      'deweyou-design-mcp': './dist/bin/index.mjs',
    });
  });

  test('normalizes the dist manifest after pack builds', async () => {
    const manifest = await readPackageManifest();

    expect(manifest.scripts?.build).toBe(
      'vp pack && node ../infra/scripts/write-published-manifest.mjs .',
    );
  });
});
