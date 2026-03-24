import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expect, test } from 'vite-plus/test';

import { internalPrimitives, textColorFamilyNames, textPaletteStepNames } from '../src';

const cssDir = resolve(import.meta.dirname, '../src/css');
const fontsDir = resolve(import.meta.dirname, '../src/assets/fonts');

test('theme outputs define light, dark, and default entrypoints', () => {
  const theme = readFileSync(resolve(cssDir, 'theme.css'), 'utf8');
  const light = readFileSync(resolve(cssDir, 'theme-light.css'), 'utf8');
  const dark = readFileSync(resolve(cssDir, 'theme-dark.css'), 'utf8');
  const base = readFileSync(resolve(cssDir, 'base.css'), 'utf8');
  const fonts = readFileSync(resolve(cssDir, 'fonts.css'), 'utf8');

  expect(theme).toContain("@import './reset.css';");
  expect(theme).toContain("@import './fonts.css';");
  expect(theme).toContain("@import './base.css';");
  expect(light).toContain('--ui-color-brand-bg');
  expect(light).toContain('--ui-font-body');
  expect(light).toContain('--ui-font-weight-title');
  expect(light).toContain('--ui-text-size-h1');
  expect(light).toContain('--ui-text-line-height-caption');
  expect(light).toContain('--ui-text-color-red');
  expect(light).toContain('--ui-text-background-olive');
  expect(light).toContain('Songti SC');
  expect(light).toContain('SimSun');
  expect(dark).toContain('[data-theme');
  expect(dark).toContain('--ui-text-size-h5');
  expect(dark).toContain('--ui-text-color-violet');
  expect(dark).toContain('--ui-text-background-neutral');
  expect(base).toContain('font-family: var(--ui-font-body);');
  expect(base).toContain('font-family: var(--ui-font-mono);');
  expect(base).toContain('.typography-tier-title');
  expect(base).toContain('.typography-tier-strong');
  expect(base).toContain('.typography-scale-caption');
  expect(base).toContain('.typography-scale-h1');
  expect(fonts).toContain("font-family: 'Source Han Serif CN Web';");
  expect(fonts).toContain('font-display: swap;');
});

test('text palette primitives expose 26 color families and 11 steps per family', () => {
  expect(textColorFamilyNames).toHaveLength(26);
  expect(textPaletteStepNames).toEqual([
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

  for (const familyName of textColorFamilyNames) {
    expect(Object.keys(internalPrimitives.color.textPalette[familyName])).toEqual(
      textPaletteStepNames,
    );
  }
});

test('theme outputs expose palette-backed text color and background tokens for every family', () => {
  const light = readFileSync(resolve(cssDir, 'theme-light.css'), 'utf8');
  const dark = readFileSync(resolve(cssDir, 'theme-dark.css'), 'utf8');

  for (const familyName of textColorFamilyNames) {
    expect(light).toContain(`--ui-text-color-${familyName}`);
    expect(light).toContain(`--ui-text-background-${familyName}`);
    expect(dark).toContain(`--ui-text-color-${familyName}`);
    expect(dark).toContain(`--ui-text-background-${familyName}`);
  }
});

test('fonts asset directory contains the vendored Source Han Serif CN files', () => {
  const license = readFileSync(resolve(fontsDir, 'LICENSE.txt'), 'utf8');

  expect(license).toContain('SIL OPEN FONT LICENSE');
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-Regular.otf'))).toBeTruthy();
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-Medium.otf'))).toBeTruthy();
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-SemiBold.otf'))).toBeTruthy();
  expect(readFileSync(resolve(fontsDir, 'SourceHanSerifCN-Bold.otf'))).toBeTruthy();
});
