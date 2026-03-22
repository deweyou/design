import { expect, test } from 'vite-plus/test';

import { internalPrimitives, internalTypographyRoleNames, publicThemeTokens } from '../src';

test('styles package exposes the documented public color token surface', () => {
  expect(publicThemeTokens.map((token) => token.cssVar)).toEqual([
    '--ui-color-brand-bg',
    '--ui-color-brand-bg-hover',
    '--ui-color-brand-bg-active',
    '--ui-color-text-on-brand',
    '--ui-color-focus-ring',
    '--ui-color-link',
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
