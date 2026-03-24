import { expect, test } from 'vite-plus/test';

import {
  internalPrimitives,
  internalTypographyRoleNames,
  publicThemeTokens,
  textColorFamilyNames,
} from '../src';

test('styles package exposes the documented public color token surface', () => {
  const expectedBaseTokens = [
    '--ui-color-brand-bg',
    '--ui-color-brand-bg-hover',
    '--ui-color-brand-bg-active',
    '--ui-color-text-on-brand',
    '--ui-color-danger-bg',
    '--ui-color-danger-bg-hover',
    '--ui-color-danger-bg-active',
    '--ui-color-danger-text',
    '--ui-color-text-on-danger',
    '--ui-color-focus-ring',
    '--ui-color-link',
    '--ui-text-size-body',
    '--ui-text-line-height-body',
    '--ui-text-size-caption',
    '--ui-text-line-height-caption',
    '--ui-text-size-h1',
    '--ui-text-line-height-h1',
    '--ui-text-size-h2',
    '--ui-text-line-height-h2',
    '--ui-text-size-h3',
    '--ui-text-line-height-h3',
    '--ui-text-size-h4',
    '--ui-text-line-height-h4',
    '--ui-text-size-h5',
    '--ui-text-line-height-h5',
  ];
  const expectedTextPaletteTokens = textColorFamilyNames.flatMap((familyName) => {
    return [`--ui-text-color-${familyName}`, `--ui-text-background-${familyName}`];
  });

  expect(publicThemeTokens.map((token) => token.cssVar)).toEqual([
    ...expectedBaseTokens,
    ...expectedTextPaletteTokens,
  ]);
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
