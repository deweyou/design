import { describe, expect, it } from 'vite-plus/test';

const { normalizeSvgBody } = await import('./generate-icons.mjs');

describe('normalizeSvgBody', () => {
  it('scopes SVG body ids to the icon source label', () => {
    const { body } = normalizeSvgBody(
      '<svg viewBox="0 0 24 24"><g id="search"><path id="stroke1" d="M4 12h16"/></g></svg>',
      'test:ids',
    );

    expect(body).toContain('id="deweyou-icon-test-ids-search"');
    expect(body).toContain('id="deweyou-icon-test-ids-stroke1"');
  });

  it('scopes SVG paint fragment references', () => {
    const { body } = normalizeSvgBody(
      '<svg viewBox="0 0 24 24"><defs><linearGradient id="paint0"></linearGradient></defs><path fill="url(#paint0)" d="M4 12h16"/></svg>',
      'test:fragment',
    );

    expect(body).toContain('id="deweyou-icon-test-fragment-paint0"');
    expect(body).toContain('fill="url(#deweyou-icon-test-fragment-paint0)"');
  });

  it('scopes SVG clip-path fragment references', () => {
    const { body } = normalizeSvgBody(
      '<svg viewBox="0 0 24 24"><clipPath id="clip0"></clipPath><path clip-path="url(#clip0)" d="M4 12h16"/></svg>',
      'test:clip-path',
    );

    expect(body).toContain('id="deweyou-icon-test-clip-path-clip0"');
    expect(body).toContain('clipPath="url(#deweyou-icon-test-clip-path-clip0)"');
  });
});
