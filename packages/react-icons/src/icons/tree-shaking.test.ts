import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { build } from 'vite';
import { expect, test } from 'vite-plus/test';

import { iconRegistry } from '../icon-registry';

const fixtureDir = resolve(import.meta.dirname, '../../.tmp/tree-shaking');

const toGeneratedModuleName = (exportName: string) =>
  exportName
    .replace(/Icon$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

test('one-icon consumer bundle drops unrelated generated icon exports', async () => {
  await rm(fixtureDir, { force: true, recursive: true });
  await mkdir(fixtureDir, { recursive: true });

  const entryPath = join(fixtureDir, 'entry.tsx');
  const outDir = join(fixtureDir, 'dist');
  const unrelatedIcons = iconRegistry.filter(({ exportName }) => exportName !== 'SearchIcon');

  try {
    await writeFile(
      entryPath,
      [
        "import { SearchIcon } from '../../dist/index.mjs';",
        'export const render = () => SearchIcon({ "aria-label": "Search" });',
      ].join('\n'),
    );

    await build({
      build: {
        emptyOutDir: true,
        lib: {
          entry: entryPath,
          formats: ['es'],
        },
        minify: false,
        outDir,
        rollupOptions: {
          external: ['react', 'react/jsx-dev-runtime', 'react/jsx-runtime'],
          output: {
            entryFileNames: 'tree-shaking.mjs',
          },
        },
      },
      configFile: false,
      logLevel: 'silent',
    });

    const bundle = await readFile(join(outDir, 'tree-shaking.mjs'), 'utf8');

    expect(bundle).toContain('SearchIcon');

    for (const { exportName } of unrelatedIcons) {
      expect(bundle).not.toContain(exportName);
      expect(bundle).not.toContain(`generated/${toGeneratedModuleName(exportName)}.tsx`);
    }
  } finally {
    await rm(fixtureDir, { force: true, recursive: true });
  }
});
