import { expect, test } from 'vite-plus/test';

import {
  baseMonochrome,
  colorFamilyNames,
  colorPalette,
  colorPaletteStepNames,
  internalPrimitives,
  internalColorFamilyNames,
  internalTypographyRoleNames,
  publicThemeTokens,
  textColorFamilyNames,
} from '../src';

test('styles package exposes the documented semantic and foundational color token surface', () => {
  const publicCssVars = publicThemeTokens.map((token) => token.cssVar);

  expect(publicCssVars).toContain('--ui-color-black');
  expect(publicCssVars).toContain('--ui-color-white');
  expect(publicCssVars).toContain('--ui-color-brand-bg');
  expect(publicCssVars).toContain('--ui-color-danger-bg');
  expect(publicCssVars).toContain('--ui-color-surface-raised');
  expect(publicCssVars).toContain('--ui-color-palette-red-50');
  expect(publicCssVars).toContain('--ui-color-palette-olive-950');
  expect(publicCssVars).toContain('--ui-text-color-emerald');
  expect(publicCssVars).toContain('--ui-text-background-mist');
});

test('styles package exposes the shared palette foundation while keeping text aliases stable', () => {
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
  expect(internalColorFamilyNames).toEqual(colorFamilyNames);
  expect(baseMonochrome).toEqual({
    black: '#000000',
    white: '#ffffff',
  });
  expect(colorPalette.emerald['700']).toBeTruthy();
  expect(colorPalette.neutral['950']).toBeTruthy();
  expect(internalPrimitives.color.palette).toEqual(colorPalette);
  expect(internalPrimitives.color.textPalette).toEqual(colorPalette);
});

test('styles package keeps typography internal while defining the serif defaults', () => {
  expect(publicThemeTokens.some((token) => token.cssVar.startsWith('--ui-font'))).toBe(false);
  expect(internalTypographyRoleNames).toEqual(['body', 'display', 'mono']);
  expect(internalPrimitives.font.roles.body.defaultWeightTier).toBe('body');
  expect(internalPrimitives.font.roles.display.defaultWeightTier).toBe('title');
  expect(internalPrimitives.font.body).toContain('Source Han Serif CN Web');
  expect(internalPrimitives.font.display).toContain('Songti SC');
  expect(internalPrimitives.font.fallbacks.windows).toEqual(['SimSun', 'NSimSun']);
  expect(internalPrimitives.font.weights).toEqual({
    body: '400',
    emphasis: '500',
    title: '600',
    strong: '700',
  });
  expect(internalPrimitives.font.mono).toContain('IBM Plex Mono');
});
