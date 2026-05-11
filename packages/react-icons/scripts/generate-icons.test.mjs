import { describe, expect, it } from 'vite-plus/test';

const { normalizeSvgBody } = await import('./generate-icons.mjs');

describe('normalizeSvgBody', () => {
  it('strips unused ids from SVG body output', () => {
    const { body } = normalizeSvgBody(
      '<svg viewBox="0 0 24 24"><g id="search"><path id="stroke1" d="M4 12h16"/></g></svg>',
      'test:ids',
    );

    expect(body).not.toContain(' id=');
    expect(body).toContain('<g><path d="M4 12h16"/></g>');
  });

  it('rejects SVG body fragment id references', () => {
    expect(() =>
      normalizeSvgBody(
        '<svg viewBox="0 0 24 24"><path fill="url(#paint0)" d="M4 12h16"/></svg>',
        'test:fragment',
      ),
    ).toThrow('Fragment-referenced SVG ids are not supported yet for test:fragment.');
  });

  it('rejects unresolved clip-path fragment references', () => {
    expect(() =>
      normalizeSvgBody(
        '<svg viewBox="0 0 24 24"><path clip-path="url(#clip0)" d="M4 12h16"/></svg>',
        'test:clip-path',
      ),
    ).toThrow('Fragment-referenced SVG ids are not supported yet for test:clip-path.');
  });
});
