import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import {
  createFontFaceCss,
  createFontSubset,
  createFontSubsetInput,
  sourceHanSansScManifest,
  sourceHanSerifCnManifest,
} from '../src/font-subset';

const createTempDir = () => {
  const dir = resolve(tmpdir(), `deweyou-font-subset-${Date.now()}-${Math.random()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

test('font subset input merges built-in safelist with charset files and user safelist', async () => {
  const root = createTempDir();
  const charsetFile = resolve(root, 'font-charset.md');
  const safelistFile = resolve(root, 'font-safelist.txt');

  writeFileSync(charsetFile, '# 字体字符\n按钮');
  writeFileSync(safelistFile, '℃');

  const input = await createFontSubsetInput({
    root,
    charset: ['font-charset.md'],
    safelist: {
      chars: '￥',
      files: ['font-safelist.txt'],
    },
  });

  expect(input.charset).toContain('按');
  expect(input.charset).toContain('钮');
  expect(input.charset).toContain('A');
  expect(input.charset).toContain('9');
  expect(input.charset).toContain('。');
  expect(input.charset).toContain('￥');
  expect(input.charset).toContain('℃');
  expect(input.watchFiles.map((file) => file.replace(`${root}/`, ''))).toEqual([
    'font-charset.md',
    'font-safelist.txt',
  ]);

  rmSync(root, { recursive: true, force: true });
});

test('font subset input scans configured files and respects excludes and blocklist', async () => {
  const root = createTempDir();
  mkdirSync(resolve(root, 'src/generated'), { recursive: true });
  mkdirSync(resolve(root, 'src/components'), { recursive: true });

  writeFileSync(resolve(root, 'src/components/button.tsx'), 'export const label = "提交订单";');
  writeFileSync(
    resolve(root, 'src/components/button.test.tsx'),
    'export const fixture = "测试夹具";',
  );
  writeFileSync(resolve(root, 'src/generated/icons.ts'), 'export const generated = "生成文件";');
  writeFileSync(resolve(root, 'blocklist.txt'), '单');

  const input = await createFontSubsetInput({
    root,
    scan: {
      include: ['src/**/*.tsx', 'src/**/*.ts'],
      exclude: ['**/*.test.*', 'src/generated/**'],
    },
    blocklist: {
      chars: '交',
      files: ['blocklist.txt'],
    },
  });

  expect(input.charset).toContain('提');
  expect(input.charset).toContain('订');
  expect(input.charset).not.toContain('交');
  expect(input.charset).not.toContain('单');
  expect(input.charset).not.toContain('测');
  expect(input.charset).not.toContain('生');

  rmSync(root, { recursive: true, force: true });
});

test('font subset css generation declares one font face per requested weight', () => {
  const css = createFontFaceCss({
    assets: [
      {
        fileName: 'assets/fonts/source-han-serif-cn-400.subset.abc123.woff2',
        weight: 400,
      },
      {
        fileName: 'assets/fonts/source-han-serif-cn-700.subset.def456.woff2',
        weight: 700,
      },
    ],
    family: 'Source Han Serif CN Web',
  });

  expect(css).toContain("font-family: 'Source Han Serif CN Web';");
  expect(css).toContain('font-weight: 400;');
  expect(css).toContain('font-weight: 700;');
  expect(css).toContain("format('woff2')");
  expect(css).not.toContain('--ui-font-body');
});

test('font subset creation validates supported weights and delegates binary generation', async () => {
  const root = createTempDir();
  const outputDir = resolve(root, 'dist');

  const result = await createFontSubset({
    root,
    safelist: {
      chars: '按钮',
      builtin: false,
    },
    output: {
      fontDir: 'assets/fonts',
    },
    subsetFont: async ({ targetPath }) => {
      writeFileSync(targetPath, 'subset-font');
    },
    weights: [400, 700],
    outputDir,
  });

  expect(result.css).toContain('font-weight: 400;');
  expect(result.css).toContain('font-weight: 700;');
  expect(result.assets).toHaveLength(2);
  expect(readFileSync(resolve(outputDir, result.assets[0]!.fileName), 'utf8')).toBe('subset-font');

  await expect(
    createFontSubset({
      root,
      safelist: {
        chars: '按钮',
        builtin: false,
      },
      subsetFont: async ({ targetPath }) => {
        writeFileSync(targetPath, 'subset-font');
      },
      weights: [300],
      outputDir,
    }),
  ).rejects.toThrow('Unsupported Source Han Serif CN weight: 300');

  rmSync(root, { recursive: true, force: true });
});

test('font subset creation can target the Source Han Sans SC manifest', async () => {
  const root = createTempDir();
  const outputDir = resolve(root, 'dist');

  const result = await createFontSubset({
    root,
    source: 'source-han-sans-sc',
    safelist: {
      chars: '按钮',
      builtin: false,
    },
    subsetFont: async ({ sourcePath, targetPath, weight }) => {
      expect(sourcePath).toContain('SourceHanSansSC');
      expect([250, 300, 350, 400, 500, 600, 700, 900]).toContain(weight);
      writeFileSync(targetPath, 'subset-font');
    },
    weights: [250, 400, 600, 700, 900],
    outputDir,
  });

  expect(result.css).toContain("font-family: 'Source Han Sans SC Web';");
  expect(result.assets.map((asset) => asset.fileName)).toEqual([
    expect.stringMatching(/source-han-sans-sc-250\.subset\.[a-f0-9]+\.woff2$/),
    expect.stringMatching(/source-han-sans-sc-400\.subset\.[a-f0-9]+\.woff2$/),
    expect.stringMatching(/source-han-sans-sc-600\.subset\.[a-f0-9]+\.woff2$/),
    expect.stringMatching(/source-han-sans-sc-700\.subset\.[a-f0-9]+\.woff2$/),
    expect.stringMatching(/source-han-sans-sc-900\.subset\.[a-f0-9]+\.woff2$/),
  ]);

  await expect(
    createFontSubset({
      root,
      source: 'source-han-sans-sc',
      safelist: {
        chars: '按钮',
        builtin: false,
      },
      subsetFont: async ({ targetPath }) => {
        writeFileSync(targetPath, 'subset-font');
      },
      // @ts-expect-error invalid runtime input
      weights: [800],
      outputDir,
    }),
  ).rejects.toThrow('Unsupported Source Han Sans SC weight: 800');

  rmSync(root, { recursive: true, force: true });
});

test('font subset creation can generate a real woff2 subset from the vendored source font', async () => {
  const root = createTempDir();
  const outputDir = resolve(root, 'dist');

  const result = await createFontSubset({
    root,
    safelist: {
      chars: '按钮',
      builtin: false,
    },
    weights: [400],
    outputDir,
  });

  expect(result.assets).toHaveLength(1);
  expect(result.assets[0]!.fileName).toMatch(/source-han-serif-cn-400\.subset\.[a-f0-9]+\.woff2$/);
  expect(readFileSync(resolve(outputDir, result.assets[0]!.fileName)).byteLength).toBeGreaterThan(
    0,
  );

  rmSync(root, { recursive: true, force: true });
});

test('source han serif cn manifest maps all required weights to source font files', () => {
  expect(sourceHanSerifCnManifest.family).toBe('Source Han Serif CN Web');
  expect(Object.keys(sourceHanSerifCnManifest.weights)).toEqual(['400', '500', '600', '700']);
  expect(sourceHanSerifCnManifest.weights[400]).toContain('SourceHanSerifCN-Regular.otf');
  expect(sourceHanSerifCnManifest.weights[700]).toContain('SourceHanSerifCN-Bold.otf');
});

test('source han sans sc manifest maps official static weights and the semantic 600 alias', () => {
  expect(sourceHanSansScManifest.family).toBe('Source Han Sans SC Web');
  expect(Object.keys(sourceHanSansScManifest.weights)).toEqual([
    '250',
    '300',
    '350',
    '400',
    '500',
    '600',
    '700',
    '900',
  ]);
  expect(sourceHanSansScManifest.weights[250]).toContain('SourceHanSansSC-ExtraLight.otf');
  expect(sourceHanSansScManifest.weights[350]).toContain('SourceHanSansSC-Normal.otf');
  expect(sourceHanSansScManifest.weights[600]).toContain('SourceHanSansSC-Medium.otf');
  expect(sourceHanSansScManifest.weights[900]).toContain('SourceHanSansSC-Heavy.otf');
});
