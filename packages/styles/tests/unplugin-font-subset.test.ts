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
      emitFile: (asset: { fileName?: string; source?: Buffer; type: 'asset' }) => string | void;
      getFileName?: (referenceId: string) => string;
    }) => Promise<void>;
  };
  load?: (id: string) => Promise<string | undefined> | string | undefined;
  name: string;
  renderChunk?: {
    call: (context: { getFileName?: (referenceId: string) => string }, code: string) => string;
  };
  resolveId?: (id: string) => string | undefined;
  transformIndexHtml?: (html: string) => string | Promise<string>;
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
    emitFile: (asset) => {
      emittedFiles.push(asset);
    },
  });

  expect(watchedFiles).toEqual([resolve(root, 'charset.md')]);
  expect(emittedFiles).toHaveLength(4);
});

test('font subset plugin can inject virtual font modules into vite html', async () => {
  const root = createTempDir();
  writeFileSync(resolve(root, 'charset.md'), '按钮');

  const plugin = fontSubset.vite({
    charset: ['charset.md'],
    fullFonts: 'idle',
    inject: true,
    subsetFont: async ({ targetPath }) => {
      writeFileSync(targetPath, 'subset');
    },
  }) as PluginLike;

  plugin.configResolved?.({ root });

  const html = await plugin.transformIndexHtml?.('<html><head></head><body></body></html>');

  expect(html).toContain("import 'virtual:deweyou-font-subset.css';");
  expect(html).toContain("import 'virtual:deweyou-full-fonts-loader.js';");
});

test('font subset plugin exposes an idle full-font loader with stable versioned assets', async () => {
  const root = createTempDir();
  writeFileSync(resolve(root, 'charset.md'), '按钮');

  const emittedFiles: Array<{ fileName?: string; source?: Buffer; type: 'asset' }> = [];
  const plugin = fontSubset.vite({
    charset: ['charset.md'],
    fullFonts: 'idle',
    subsetFont: async ({ targetPath }) => {
      writeFileSync(targetPath, 'subset');
    },
  }) as PluginLike;

  plugin.configResolved?.({ root });

  expect(plugin.resolveId?.('virtual:deweyou-full-fonts-loader.js')).toBe(
    '\0virtual:deweyou-full-fonts-loader.js',
  );

  const loader = await plugin.load?.('\0virtual:deweyou-full-fonts-loader.js');

  expect(loader).toContain('requestIdleCallback');
  expect(loader).toContain('FontFace');
  expect(loader).toContain('Source Han Serif CN Web');
  expect(loader).toContain('/@deweyou-full-fonts/source-han-serif-cn-full-400-v2.003R.otf');

  await plugin.generateBundle?.call({
    addWatchFile: () => {},
    emitFile: (asset) => {
      emittedFiles.push(asset);
      return asset.fileName ?? '';
    },
    getFileName: (referenceId) => referenceId,
  });

  expect(emittedFiles.map((asset) => asset.fileName)).toEqual(
    expect.arrayContaining([
      'assets/fonts/source-han-serif-cn-full-400-v2.003R.otf',
      'assets/fonts/source-han-serif-cn-full-500-v2.003R.otf',
      'assets/fonts/source-han-serif-cn-full-600-v2.003R.otf',
      'assets/fonts/source-han-serif-cn-full-700-v2.003R.otf',
    ]),
  );

  const rendered = plugin.renderChunk?.call(
    { getFileName: (referenceId) => referenceId },
    "const url = '__DEWEYOU_FULL_FONT_source_han_serif_cn_400__';",
  );

  expect(rendered).toContain('assets/fonts/source-han-serif-cn-full-400-v2.003R.otf');
  expect(rendered).not.toContain('__DEWEYOU_FULL_FONT_');
});
