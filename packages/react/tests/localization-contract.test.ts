import { globSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { describe, expect, it } from 'vite-plus/test';

const componentRoot = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(componentRoot, 'src');

describe('localization package contract', () => {
  it('keeps localeText off ConfigProvider', () => {
    const providerSource = readFileSync(resolve(sourceRoot, 'config-provider/index.tsx'), 'utf8');

    expect(providerSource).not.toContain('localeText');
  });

  it('keeps English synchronous and lazy-loads every additional locale per source unit', () => {
    const loaderFiles = globSync('**/locale/loader.ts', { cwd: sourceRoot });

    expect(loaderFiles.length).toBeGreaterThan(10);

    for (const loaderFile of loaderFiles) {
      const source = readFileSync(resolve(sourceRoot, loaderFile), 'utf8');

      expect(source, loaderFile).toContain("import enUS from './en-us.ts'");
      expect(source, loaderFile).not.toContain("import('./en-us.ts')");
      expect(source, loaderFile).toContain("'zh-CN': () => import('./zh-cn.ts')");
      expect(source, loaderFile).toContain("'zh-TW': () => import('./zh-tw.ts')");
      expect(source, loaderFile).toContain("'ja-JP': () => import('./ja-jp.ts')");
      expect(source, loaderFile).toContain("'ko-KR': () => import('./ko-kr.ts')");
    }
  });

  it('colocates every supported dictionary with its source unit', () => {
    const loaderFiles = globSync('**/locale/loader.ts', { cwd: sourceRoot });

    for (const loaderFile of loaderFiles) {
      const localeDirectory = dirname(resolve(sourceRoot, loaderFile));

      for (const localeFile of ['en-us.ts', 'zh-cn.ts', 'zh-tw.ts', 'ja-jp.ts', 'ko-kr.ts']) {
        expect(
          readFileSync(resolve(localeDirectory, localeFile), 'utf8'),
          `${loaderFile}: ${localeFile}`,
        ).not.toHaveLength(0);
      }
    }
  });
});
