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

  it('does not render raw HTML as live HTML', () => {
    const markup = renderMarkdown({
      value: '<script>alert("x")</script><span data-dangerous="true">HTML</span>',
    });

    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('data-dangerous="true"');
    expect(markup).toContain('&lt;script&gt;');
  });
});
