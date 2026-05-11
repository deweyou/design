import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import { fontSubset } from '../src/unplugin-font-subset';

const createTempDir = () => {
  const dir = resolve(tmpdir(), `deweyou-font-subset-plugin-${Date.now()}-${Math.random()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

type PluginLike = {
  configResolved?: (config: { root: string }) => void;
  generateBundle?: {
    call: (context: {
      addWatchFile: (file: string) => void;
      emitFile: (asset: unknown) => void;
    }) => Promise<void>;
  };
  load?: (id: string) => Promise<string | undefined> | string | undefined;
  name: string;
  resolveId?: (id: string) => string | undefined;
};

test('font subset vite adapter exposes a virtual css module', async () => {
  const root = createTempDir();
  writeFileSync(resolve(root, 'charset.md'), '按钮');

  const plugin = fontSubset.vite({
    charset: ['charset.md'],
    subsetFont: async ({ targetPath }) => {
      writeFileSync(targetPath, 'subset');
    },
  }) as PluginLike;

  plugin.configResolved?.({ root });

  expect(plugin.name).toBe('deweyou-font-subset');
  expect(plugin.resolveId?.('virtual:deweyou-font-subset.css')).toBe(
    '\0virtual:deweyou-font-subset.css',
  );

  const css = await plugin.load?.('\0virtual:deweyou-font-subset.css');

  expect(css).toContain("font-family: 'Source Han Serif CN Web';");
  expect(css).toContain('font-weight: 400;');
  expect(css).not.toContain('--ui-font-body');
});

test('font subset plugin registers character source files for watch mode', async () => {
  const root = createTempDir();
  writeFileSync(resolve(root, 'charset.md'), '按钮');

  const watchedFiles: string[] = [];
  const emittedFiles: unknown[] = [];
  const plugin = fontSubset.vite({
    charset: ['charset.md'],
    subsetFont: async ({ targetPath }) => {
      writeFileSync(targetPath, 'subset');
    },
  }) as PluginLike;

  plugin.configResolved?.({ root });
  await plugin.generateBundle?.call({
    addWatchFile: (file) => watchedFiles.push(file),
    emitFile: (asset) => emittedFiles.push(asset),
  });

  expect(watchedFiles).toEqual([resolve(root, 'charset.md')]);
  expect(emittedFiles).toHaveLength(4);
});
