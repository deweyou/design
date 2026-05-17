import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import { createPublishedPackageManifest } from '../../infra/src/package-manifest';
import {
  baseMonochrome,
  colorFamilyNames,
  colorPaletteStepNames,
  darkTheme,
  internalPrimitives,
  lightTheme,
  sharedColorTheme,
  textColorFamilyNames,
  textPaletteStepNames,
} from '../src';

const cssDir = resolve(import.meta.dirname, '../src/css');
const fontsDir = resolve(import.meta.dirname, '../src/assets/fonts');

test('theme outputs define light, dark, and default entrypoints', () => {
  const color = readFileSync(resolve(cssDir, 'color.css'), 'utf8');
  const theme = readFileSync(resolve(cssDir, 'theme.css'), 'utf8');
  const themeWithFonts = readFileSync(resolve(cssDir, 'theme-with-fonts.css'), 'utf8');
  const light = readFileSync(resolve(cssDir, 'theme-light.css'), 'utf8');
  const dark = readFileSync(resolve(cssDir, 'theme-dark.css'), 'utf8');
  const base = readFileSync(resolve(cssDir, 'base.css'), 'utf8');
  const fonts = readFileSync(resolve(cssDir, 'fonts.css'), 'utf8');

  expect(theme).toContain("@import './reset.css';");
  expect(theme).not.toContain("@import './fonts.css';");
  expect(theme).toContain("@import './base.css';");
  expect(color).toContain('--ui-color-black');
  expect(color).toContain('--ui-color-white-canvas: #fafafa;');
  expect(color).toContain('--ui-color-white-surface: #ffffff;');
  expect(color).toContain('--ui-color-white-surface-raised: #ffffff;');
  expect(color).not.toContain('--ui-color-warm-white');
  expect(themeWithFonts).toContain("@import './fonts.css';");
  expect(themeWithFonts).toContain("@import './theme.css';");
  expect(color).toContain('--ui-color-palette-red-50');
  expect(color).toContain('--ui-color-palette-olive-950');
  expect(light).toContain("@import './color.css';");
  expect(light).toContain('--ui-color-canvas: var(--ui-color-white-canvas);');
  expect(light).toContain('--ui-color-surface: var(--ui-color-white-surface);');
  expect(light).toContain('--ui-color-surface-raised: var(--ui-color-white-surface-raised);');
  expect(light).toContain('--ui-color-brand-bg');
  expect(light).toContain('var(--ui-color-palette-emerald-900)');
  expect(light).toContain('--ui-font-body');
  expect(light).toContain('--ui-font-control');
  expect(light).toContain('--ui-font-content');
  expect(light).toContain('--ui-font-sans');
  expect(light).toContain('--ui-font-serif');
  expect(light).toContain('--ui-font-weight-title');
  expect(light).toContain('--ui-text-size-h1');
  expect(light).toContain('--ui-text-line-height-caption');
  expect(light).toContain('Source Han Sans SC Web');
  expect(light).toContain('Songti SC');
  expect(light).toContain('SimSun');
  expect(dark).toContain("@import './color.css';");
  expect(dark).toContain('[data-theme');
  expect(dark).toContain('--ui-text-size-h5');
  expect(base).toContain('font-family: var(--ui-font-body);');
  expect(base).toContain('font-family: var(--ui-font-control);');
  expect(base).toContain('font-family: var(--ui-font-content);');
  expect(base).toContain('font-family: var(--ui-font-mono);');
  expect(base).toContain('.typography-tier-title');
  expect(base).toContain('.typography-tier-strong');
  expect(base).toContain('.typography-scale-caption');
  expect(base).toContain('.typography-scale-h1');
  expect(fonts).toContain("font-family: 'Source Han Serif CN Web';");
  expect(fonts).toContain("font-family: 'Source Han Sans SC Web';");
  expect(fonts).toContain('font-display: swap;');
});

test('text palette primitives expose 26 color families and 11 steps per family', () => {
  expect(colorFamilyNames).toHaveLength(26);
  expect(colorPaletteStepNames).toEqual([
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    '950',
  ]);
  expect(textColorFamilyNames).toEqual(colorFamilyNames);
  expect(textPaletteStepNames).toEqual(colorPaletteStepNames);
  expect(baseMonochrome).toEqual({
    black: '#000000',
    white: '#ffffff',
  });

  for (const familyName of colorFamilyNames) {
    expect(Object.keys(internalPrimitives.color.palette[familyName])).toEqual(
      colorPaletteStepNames,
    );
  }
});

test('theme outputs expose palette-backed text color and background tokens for every family', () => {
  for (const familyName of colorFamilyNames) {
    expect(lightTheme[`--ui-text-color-${familyName}` as keyof typeof lightTheme]).toBe(
      `var(--ui-color-palette-${familyName}-800)`,
    );
    expect(lightTheme[`--ui-text-background-${familyName}` as keyof typeof lightTheme]).toBe(
      `var(--ui-color-palette-${familyName}-100)`,
    );
    expect(darkTheme[`--ui-text-color-${familyName}` as keyof typeof darkTheme]).toBe(
      `var(--ui-color-palette-${familyName}-200)`,
    );
    expect(darkTheme[`--ui-text-background-${familyName}` as keyof typeof darkTheme]).toBe(
      `var(--ui-color-palette-${familyName}-900)`,
    );
  }
});

test('theme outputs expose the shared color palette and monochrome tokens for every family and step', () => {
  const color = readFileSync(resolve(cssDir, 'color.css'), 'utf8');

  expect(color).toContain('--ui-color-black');
  expect(color).toContain('--ui-color-white');

  for (const familyName of colorFamilyNames) {
    for (const stepName of colorPaletteStepNames) {
      expect(color).toContain(`--ui-color-palette-${familyName}-${stepName}`);
    }
  }
});

test('semantic theme colors trace back to the shared palette foundation or monochrome tokens', () => {
  expect(sharedColorTheme['--ui-color-black']).toBe(baseMonochrome.black);
  expect(sharedColorTheme['--ui-color-white']).toBe(baseMonochrome.white);
  expect(sharedColorTheme['--ui-color-text-on-brand']).toBe('var(--ui-color-white)');
  expect(sharedColorTheme['--ui-color-text-on-danger']).toBe('var(--ui-color-white)');
  expect(lightTheme['--ui-color-canvas']).toBe('#fafafa');
  expect(lightTheme['--ui-color-surface']).toBe('#ffffff');
  expect(darkTheme['--ui-color-canvas']).toBe('var(--ui-color-palette-stone-950)');
  expect(lightTheme['--ui-color-brand-bg']).toBe('var(--ui-color-palette-emerald-900)');
  expect(lightTheme['--ui-color-danger-bg']).toBe('var(--ui-color-palette-red-700)');
  expect(darkTheme['--ui-color-brand-bg']).toBe('var(--ui-color-palette-emerald-600)');
  expect(darkTheme['--ui-color-danger-bg']).toBe('var(--ui-color-palette-red-500)');
});

test('fonts asset directory contains the vendored Source Han Serif CN and Source Han Sans SC files', () => {
  const license = readFileSync(resolve(fontsDir, 'LICENSE.txt'), 'utf8');
  const fontFileNames = [
    'SourceHanSerifCN-Regular.otf',
    'SourceHanSerifCN-Medium.otf',
    'SourceHanSerifCN-SemiBold.otf',
    'SourceHanSerifCN-Bold.otf',
    'SourceHanSansSC-ExtraLight.otf',
    'SourceHanSansSC-Light.otf',
    'SourceHanSansSC-Normal.otf',
    'SourceHanSansSC-Regular.otf',
    'SourceHanSansSC-Medium.otf',
    'SourceHanSansSC-Bold.otf',
    'SourceHanSansSC-Heavy.otf',
  ];

  expect(license).toContain('SIL OPEN FONT LICENSE');

  for (const fontFileName of fontFileNames) {
    expect(statSync(resolve(fontsDir, fontFileName)).size).toBeGreaterThan(0);
  }
});

test('exposes spacing tokens in lightTheme', () => {
  expect(lightTheme['--ui-space-xs']).toBe('0.25rem');
  expect(lightTheme['--ui-space-sm']).toBe('0.5rem');
  expect(lightTheme['--ui-space-md']).toBe('1rem');
  expect(lightTheme['--ui-space-lg']).toBe('1.5rem');
  expect(lightTheme['--ui-space-xl']).toBe('2.5rem');
});

test('exposes shared control and touch target tokens', () => {
  expect(lightTheme['--ui-control-height-xs']).toBe('2rem');
  expect(lightTheme['--ui-control-height-sm']).toBe('2.5rem');
  expect(lightTheme['--ui-control-height-md']).toBe('2.75rem');
  expect(lightTheme['--ui-control-height-lg']).toBe('3rem');
  expect(lightTheme['--ui-control-height-xl']).toBe('3.5rem');
  expect(lightTheme['--ui-touch-target-min']).toBe('2.75rem');
  expect(darkTheme['--ui-touch-target-min']).toBe('2.75rem');
});

test('exposes shared motion tokens', () => {
  expect(lightTheme['--ui-motion-duration-fast']).toBe('140ms');
  expect(lightTheme['--ui-motion-duration-base']).toBe('160ms');
  expect(lightTheme['--ui-motion-duration-slow']).toBe('260ms');
  expect(lightTheme['--ui-motion-ease-standard']).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  expect(lightTheme['--ui-motion-ease-exit']).toBe('ease');
  expect(darkTheme['--ui-motion-duration-base']).toBe('160ms');
});

test('exposes z-index tokens in lightTheme', () => {
  expect(lightTheme['--ui-z-dropdown']).toBe('1080');
  expect(lightTheme['--ui-z-tooltip']).toBe('1090');
  expect(lightTheme['--ui-z-popover']).toBe('1100');
  expect(lightTheme['--ui-z-dialog']).toBe('1200');
  expect(lightTheme['--ui-z-toast']).toBe('1300');
  expect(darkTheme['--ui-z-dropdown']).toBe('1080');
});

test('exposes shadow scale tokens with correct light and dark values', () => {
  expect(lightTheme['--ui-shadow-sm']).toBe('0 2px 8px rgba(24, 33, 29, 0.06)');
  expect(lightTheme['--ui-shadow-md']).toBe('0 8px 24px rgba(24, 33, 29, 0.1)');
  expect(lightTheme['--ui-shadow-lg']).toBe('0 18px 40px rgba(24, 33, 29, 0.12)');
  expect(darkTheme['--ui-shadow-sm']).toBe('0 2px 8px rgba(0, 0, 0, 0.2)');
  expect(darkTheme['--ui-shadow-md']).toBe('0 8px 24px rgba(0, 0, 0, 0.28)');
  expect(darkTheme['--ui-shadow-lg']).toBe('0 18px 40px rgba(0, 0, 0, 0.34)');
});

test('exposes warning color tokens with correct light/dark values', () => {
  expect(lightTheme['--ui-color-warning-bg']).toBe('var(--ui-color-palette-amber-600)');
  expect(darkTheme['--ui-color-warning-bg']).toBe('var(--ui-color-palette-amber-500)');
  expect(lightTheme['--ui-color-text-on-warning']).toBe('var(--ui-color-white)');
});

test('styles publish manifest drops workspace-only metadata and rewrites dist-root entrypaths', () => {
  const sourceManifest = JSON.parse(
    readFileSync(resolve(import.meta.dirname, '../package.json'), 'utf8'),
  ) as import('../../infra/src/package-manifest').PackageManifest;
  const publishedManifest = createPublishedPackageManifest({
    catalogVersions: {
      less: '^4.4.1',
      'subset-font': '^2.5.0',
      typescript: '^5',
      unplugin: '^3.0.0',
      'vite-plus': '^0.1.11',
    },
    manifest: sourceManifest,
    workspaceVersions: {
      '@deweyou-design/styles': sourceManifest.version,
    },
  });

  expect(publishedManifest.devDependencies).toBeUndefined();
  expect(publishedManifest.files).toBeUndefined();
  expect(publishedManifest.publishConfig).toBeUndefined();
  expect(publishedManifest.types).toBe('./index.d.mts');
  expect(publishedManifest.exports).toMatchObject({
    '.': {
      default: './index.mjs',
      import: './index.mjs',
      types: './index.d.mts',
    },
    './font-subset': {
      default: './font-subset/index.mjs',
      import: './font-subset/index.mjs',
      types: './font-subset/index.d.mts',
    },
    './theme.css': './css/theme.css',
    './theme-with-fonts.css': './css/theme-with-fonts.css',
    './unplugin-font-subset': {
      default: './unplugin-font-subset/index.mjs',
      import: './unplugin-font-subset/index.mjs',
      types: './unplugin-font-subset/index.d.mts',
    },
    './less/bridge.less': './less/bridge.less',
  });
});
