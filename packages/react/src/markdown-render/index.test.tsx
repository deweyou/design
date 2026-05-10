import { createElement, type AnchorHTMLAttributes, type ComponentPropsWithoutRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vite-plus/test';

import { MarkdownRender, type MarkdownRenderComponents, type MarkdownRenderProps } from './index';

const renderMarkdown = (props: MarkdownRenderProps) => {
  return renderToStaticMarkup(createElement(MarkdownRender, props));
};

describe('MarkdownRender', () => {
  it('renders CommonMark and GFM nodes with stable data attributes', () => {
    const markup = renderMarkdown({
      value: [
        '# Title',
        '',
        'Paragraph with **strong**, *emphasis*, ~~deleted~~, `inline`, and [link](https://example.com).',
        '',
        '> Quote',
        '',
        '- [x] done',
        '- [ ] open',
        '',
        '1. first',
        '2. second',
        '',
        '| Name | Value |',
        '| --- | --- |',
        '| alpha | beta |',
        '',
        '---',
      ].join('\n'),
    });

    expect(markup).toContain('data-markdown-root="true"');
    expect(markup).toContain('data-markdown-size="md"');
    expect(markup).toContain('data-markdown-node="h1"');
    expect(markup).toContain('data-markdown-node="p"');
    expect(markup).toContain('data-markdown-node="a"');
    expect(markup).toContain('rel="noreferrer"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('data-markdown-node="blockquote"');
    expect(markup).toContain('data-markdown-node="ul"');
    expect(markup).toContain('data-markdown-node="ol"');
    expect(markup).toContain('data-markdown-node="li"');
    expect(markup).toContain('data-markdown-task-marker="true"');
    expect(markup).toContain('data-checked="true"');
    expect(markup).toContain('data-checked="false"');
    expect(markup).toContain('data-markdown-node="table"');
    expect(markup).toContain('data-markdown-node="hr"');
  });

  it('renders paragraphs as native paragraph elements', () => {
    const markup = renderMarkdown({
      value: 'Paragraph with **strong** text.',
    });

    expect(markup).toContain('<p');
    expect(markup).toContain('data-markdown-node="p"');
    expect(markup).not.toContain('<div data-markdown-node="p"');
  });

  it('preserves size, className, style, images, and code fence language', () => {
    const markup = renderMarkdown({
      className: 'consumer-markdown',
      size: 'sm',
      style: { maxWidth: 640 },
      value: [
        '![Alt text](/image.png)',
        '',
        '```mermaid meta value',
        'graph TD',
        '  A --> B',
        '```',
      ].join('\n'),
    });

    expect(markup).toContain('class="');
    expect(markup).toContain('consumer-markdown');
    expect(markup).toContain('data-markdown-size="sm"');
    expect(markup).toContain('max-width:640px');
    expect(markup).toContain('data-markdown-node="img"');
    expect(markup).toContain('alt="Alt text"');
    expect(markup).toContain('data-markdown-node="pre"');
    expect(markup).toContain('data-language="mermaid"');
    expect(markup).toContain('graph TD');
  });

  it('allows consumers to override nodes while keeping MarkdownRender data attributes', () => {
    const components: MarkdownRenderComponents = {
      a: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
        createElement('a', { ...props, 'data-custom-link': 'true' }, children),
      pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) =>
        createElement('pre', { ...props, 'data-custom-code-block': 'true' }, children),
    };

    const markup = renderMarkdown({
      components,
      value: ['[Docs](/docs)', '', '```ts', 'const value = 1;', '```'].join('\n'),
    });

    expect(markup).toContain('data-custom-link="true"');
    expect(markup).toContain('data-custom-code-block="true"');
    expect(markup).toContain('data-markdown-node="a"');
    expect(markup).toContain('data-markdown-node="pre"');
  });

  it('does not leak react-markdown node objects into rendered DOM attributes', () => {
    const components: MarkdownRenderComponents = {
      a: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
        createElement('a', props, children),
    };

    const markup = renderMarkdown({
      components,
      value: ['# Title', '', '[Docs](/docs)', '', '```', 'const value = 1;', '```'].join('\n'),
    });

    expect(markup).not.toContain('node="[object Object]"');
  });

  it('renders task markers as accessible read-only state instead of checkbox controls', () => {
    const markup = renderMarkdown({
      value: ['- [x] done', '- [ ] open'].join('\n'),
    });

    expect(markup).toContain('data-markdown-task-marker="true"');
    expect(markup).toContain('data-checked="true"');
    expect(markup).toContain('data-checked="false"');
    expect(markup).toContain('Completed task');
    expect(markup).toContain('Incomplete task');
    expect(markup).not.toContain('role="checkbox"');
  });

  it('marks fenced code without a language as block code', () => {
    const markup = renderMarkdown({
      value: ['```', 'const value = 1;', '```', '', '`inline`'].join('\n'),
    });

    expect(markup).toContain('data-markdown-node="pre"');
    expect(markup).toContain('data-markdown-code="block"');
    expect(markup).toContain('data-markdown-code="inline"');
  });

  it('highlights language code fences with semantic token classes', () => {
    const markup = renderMarkdown({
      value: ['```ts', 'const value = 1;', '```'].join('\n'),
    });

    expect(markup).toContain('class="hljs-keyword"');
    expect(markup).toContain('const');
    expect(markup).toContain('data-language="ts"');
  });

  it('renders a language label for language code fences only', () => {
    const markup = renderMarkdown({
      value: ['```tsx', 'const value = <MarkdownRender value={content} />;', '```'].join('\n'),
    });
    const plainMarkup = renderMarkdown({
      value: ['```', 'plain text', '```'].join('\n'),
    });

    expect(markup).toContain('data-markdown-code-language-label="true"');
    expect(markup).toContain('>tsx</span>');
    expect(plainMarkup).not.toContain('data-markdown-code-language-label="true"');
  });

  it('does not render raw HTML as live HTML', () => {
    const markup = renderMarkdown({
      value: '<script>alert("x")</script><span data-dangerous="true">HTML</span>',
    });

    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('data-dangerous="true"');
    expect(markup).toContain('&lt;script&gt;');
  });
});
