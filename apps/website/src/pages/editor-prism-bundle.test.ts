import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'vite';
import { expect, test } from 'vite-plus/test';

const repoRoot = join(import.meta.dirname, '../../../../');
const richTextPluginEntry = join(repoRoot, 'packages/react/src/editor/plugins/rich-text/index.tsx');
const stylesLessBridge = join(repoRoot, 'packages/styles/src/less/bridge.less');

type RichTextBundleGlobal = typeof globalThis & {
  __richTextPluginName?: string;
  Prism?: {
    languages?: Record<string, unknown>;
  };
};

test('website production bundle can load editor rich text syntax highlighting', async () => {
  const fixtureDir = await mkdtemp(join(tmpdir(), 'deweyou-editor-prism-'));
  const outputDir = join(fixtureDir, 'dist');
  const testGlobal = globalThis as RichTextBundleGlobal;

  try {
    await writeFile(
      join(fixtureDir, 'entry.ts'),
      `import { richTextPlugin } from ${JSON.stringify(richTextPluginEntry)};\n` +
        'globalThis.__richTextPluginName = richTextPlugin().name;\n',
    );

    await build({
      build: {
        emptyOutDir: true,
        outDir: outputDir,
        rollupOptions: {
          input: join(fixtureDir, 'entry.ts'),
        },
      },
      css: {
        preprocessorOptions: {
          less: {
            additionalData: `@import "${stylesLessBridge}";\n`,
          },
        },
      },
      logLevel: 'silent',
      root: fixtureDir,
    });

    const assetNames = await readdir(join(outputDir, 'assets'));
    const scriptName = assetNames.find((assetName) => assetName.endsWith('.js'));

    expect(scriptName).toBeDefined();

    const scriptPath = join(outputDir, 'assets', scriptName as string);
    const scriptSource = await readFile(scriptPath, 'utf8');

    expect(scriptSource).toContain('Prism');

    globalThis.window = globalThis as Window & typeof globalThis;
    globalThis.document = {
      addEventListener: () => undefined,
      currentScript: null,
      getElementsByTagName: () => [],
      querySelectorAll: () => [],
      readyState: 'complete',
    } as unknown as Document;
    globalThis.Element = class {
      matches() {
        return false;
      }
    } as unknown as typeof Element;
    globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    };

    await import(`${pathToFileURL(scriptPath).href}?${Date.now()}`);

    expect(testGlobal.__richTextPluginName).toBe('rich-text');
    expect(testGlobal.Prism?.languages?.json).toBeDefined();
  } finally {
    Reflect.deleteProperty(globalThis, '__richTextPluginName');
    Reflect.deleteProperty(globalThis, 'Prism');
    Reflect.deleteProperty(globalThis, 'requestAnimationFrame');
    Reflect.deleteProperty(globalThis, 'Element');
    Reflect.deleteProperty(globalThis, 'document');
    Reflect.deleteProperty(globalThis, 'window');
    await rm(fixtureDir, { force: true, recursive: true });
  }
}, 20_000);
