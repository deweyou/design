import { describe, expect, it } from 'vite-plus/test';

import {
  deleteFrontmatterPath,
  parseFrontmatterSource,
  parseMarkdownFrontmatter,
  renameFrontmatterKey,
  updateFrontmatterSource,
} from './parser';

describe('frontmatter parser', () => {
  it('extracts only a leading YAML mapping and leaves the Markdown body intact', () => {
    const markdown = [
      '---',
      'title: Frontmatter support',
      'draft: true',
      'tags:',
      '  - markdown',
      '  - editor',
      '---',
      '',
      '# Body',
      '',
      '---',
    ].join('\n');

    const parsed = parseMarkdownFrontmatter(markdown);

    expect(parsed.frontmatter?.value).toEqual({
      title: 'Frontmatter support',
      draft: true,
      tags: ['markdown', 'editor'],
    });
    expect(parsed.frontmatter?.error).toBeUndefined();
    expect(parsed.body).toBe(['', '# Body', '', '---'].join('\n'));
  });

  it('does not treat a non-leading horizontal rule or an unclosed fence as frontmatter', () => {
    expect(parseMarkdownFrontmatter('Intro\n\n---\n\ntail').frontmatter).toBeUndefined();
    expect(parseMarkdownFrontmatter('---\ntitle: Draft').frontmatter).toBeUndefined();
  });

  it('keeps invalid or non-mapping YAML available for source recovery', () => {
    const invalid = parseMarkdownFrontmatter('---\ntitle: [broken\n---\nBody');
    const arrayRoot = parseMarkdownFrontmatter('---\n- one\n- two\n---\nBody');

    expect(invalid.frontmatter?.source).toBe('title: [broken\n');
    expect(invalid.frontmatter?.error).toContain('YAML');
    expect(invalid.body).toBe('Body');
    expect(arrayRoot.frontmatter?.value).toBeUndefined();
    expect(arrayRoot.frontmatter?.error).toContain('mapping');
  });

  it('parses empty frontmatter as an empty property mapping', () => {
    expect(parseFrontmatterSource('').value).toEqual({});
  });

  it('updates one path while preserving comments, key order, and quoted strings', () => {
    const source = ['# publication state', 'title: "Quoted title"', 'draft: false', ''].join('\n');

    const updated = updateFrontmatterSource(source, ['draft'], true);

    expect(updated.error).toBeUndefined();
    expect(updated.source).toContain('# publication state');
    expect(updated.source).toContain('title: "Quoted title"');
    expect(updated.source.indexOf('title:')).toBeLessThan(updated.source.indexOf('draft:'));
    expect(updated.source).toContain('draft: true');
  });

  it('deletes one path without normalizing the remaining document', () => {
    const source = [
      '# publication state',
      'title: "Quoted title"',
      'draft: false',
      'tags: [markdown]',
      '',
    ].join('\n');

    const updated = deleteFrontmatterPath(source, ['draft']);

    expect(updated.error).toBeUndefined();
    expect(updated.source).toContain('# publication state');
    expect(updated.source).toContain('title: "Quoted title"');
    expect(updated.source).toContain('tags: [ markdown ]');
    expect(updated.source).not.toContain('draft:');
    expect(updated.value).toEqual({ title: 'Quoted title', tags: ['markdown'] });
  });

  it('renames a top-level key in place and rejects duplicate keys', () => {
    const source = ['# publication state', 'title: "Quoted title"', 'draft: false', ''].join('\n');

    const updated = renameFrontmatterKey(source, 'draft', 'published');
    const duplicate = renameFrontmatterKey(source, 'draft', 'title');

    expect(updated.error).toBeUndefined();
    expect(updated.source).toContain('# publication state');
    expect(updated.source).toContain('title: "Quoted title"');
    expect(updated.source.indexOf('title:')).toBeLessThan(updated.source.indexOf('published:'));
    expect(updated.source).toContain('published: false');
    expect(duplicate.error).toContain('already exists');
    expect(duplicate.source).toBe(source);
  });
});
