// @vitest-environment jsdom
import { createElement, type AnchorHTMLAttributes, type ComponentPropsWithoutRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { MarkdownRender, type MarkdownRenderComponents, type MarkdownRenderProps } from './index';

const renderMarkdown = (props: MarkdownRenderProps) => {
  return renderToStaticMarkup(createElement(MarkdownRender, props));
};

describe('MarkdownRender', () => {
  afterEach(() => {
    cleanup();
  });

  it('recognizes and renders leading YAML frontmatter by default', () => {
    const markup = renderMarkdown({
      value: [
        '---',
        'title: Frontmatter support',
        'draft: true',
        'tags: [markdown, editor]',
        '---',
        '',
        '# Body',
      ].join('\n'),
    });

    expect(markup).toContain('data-frontmatter-root="true"');
    expect(markup).toContain('data-frontmatter-property="draft"');
    expect(markup).toContain('data-property-type="checkbox"');
    expect(markup).toContain('data-frontmatter-property="tags"');
    expect(markup).toContain('data-markdown-node="h1"');
    expect(markup).not.toContain('<p data-markdown-node="p">title: Frontmatter support</p>');
  });

  it('supports hidden, source, and disabled frontmatter presentation', () => {
    const value = ['---', 'draft: true', '---', '', 'Body'].join('\n');
    const hidden = renderMarkdown({ frontmatter: { display: 'hidden' }, value });
    const source = renderMarkdown({ frontmatter: { display: 'source' }, value });
    const disabled = renderMarkdown({ frontmatter: false, value });

    expect(hidden).not.toContain('data-frontmatter-root');
    expect(hidden).toContain('Body');
    expect(source).toContain('data-mode="source"');
    expect(source).toContain('draft: true');
    expect(disabled).not.toContain('data-frontmatter-root');
    expect(disabled).toContain('data-markdown-node="hr"');
  });

  it('keeps invalid frontmatter recoverable in source mode', () => {
    const markup = renderMarkdown({
      value: ['---', 'title: [broken', '---', 'Body'].join('\n'),
    });

    expect(markup).toContain('data-frontmatter-root="true"');
    expect(markup).toContain('data-mode="source"');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('title: [broken');
    expect(markup).toContain('Body');
  });

  it('renders CommonMark and GFM nodes with stable data attributes', () => {
    const markup = renderMarkdown({
      value: [
        '# Title',
        '',
        '###### Fine print',
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
    expect(markup).toContain('data-markdown-node="h6"');
    expect(markup).toContain('data-markdown-node="p"');
    expect(markup).toContain('data-markdown-node="a"');
    expect(markup).toContain('rel="noreferrer"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('data-markdown-node="blockquote"');
    expect(markup).toContain('data-markdown-node="ul"');
    expect(markup).toContain('data-markdown-node="ol"');
    expect(markup).toContain('data-markdown-node="li"');
    expect(markup).toContain('data-markdown-task-marker="true"');
    expect(markup).toContain('data-ui-checkbox-mark=""');
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
      value: ['![Alt text](/image.png)', '', '```ts meta value', 'const value = 1;', '```'].join(
        '\n',
      ),
    });

    expect(markup).toContain('class="');
    expect(markup).toContain('consumer-markdown');
    expect(markup).toContain('data-markdown-size="sm"');
    expect(markup).toContain('max-width:640px');
    expect(markup).toContain('data-markdown-node="img"');
    expect(markup).toContain('alt="Alt text"');
    expect(markup).toContain('data-markdown-node="pre"');
    expect(markup).toContain('data-ui-code-block="true"');
    expect(markup).toContain('data-language="ts"');
    expect(markup).toContain('const');
  });

  it('renders mermaid code fences through MermaidRender instead of CodeBlock', () => {
    const markup = renderMarkdown({
      value: ['```mermaid', 'mindmap', '  root((MarkdownRender))', '    MermaidRender', '```'].join(
        '\n',
      ),
    });

    expect(markup).toContain('data-mermaid-renderer="mindmap"');
    expect(markup).toContain('data-mindmap-root="true"');
    expect(markup).toContain('MarkdownRender');
    expect(markup).not.toContain('data-ui-code-block="true"');
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

  it('allows consumers to resolve safe attributes for nodes with per-node indexes', () => {
    const seen: string[] = [];

    const markup = renderMarkdown({
      resolveNodeAttributes: ({ index, node, text }) => {
        seen.push(`${node}:${index}:${text}`);

        if (node !== 'h2') {
          return undefined;
        }

        return {
          id: `section-${index}`,
          className: 'consumer-heading',
          'data-anchor-text': text,
          'data-markdown-node': 'consumer-node',
          href: '/unsafe',
          onClick: () => undefined,
        } as never;
      },
      value: ['## Repeat', '', '## Repeat'].join('\n'),
    });

    expect(seen).toContain('h2:0:Repeat');
    expect(seen).toContain('h2:1:Repeat');
    expect(markup).toContain('id="section-0"');
    expect(markup).toContain('id="section-1"');
    expect(markup).toContain('consumer-heading');
    expect(markup).toContain('data-anchor-text="Repeat"');
    expect(markup).toContain('data-markdown-node="h2"');
    expect(markup).not.toContain('data-markdown-node="consumer-node"');
    expect(markup).not.toContain('href="/unsafe"');
    expect(markup).not.toContain('onClick');
  });

  it('applies resolved node attributes to overridden components', () => {
    const components: MarkdownRenderComponents = {
      a: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
        createElement('a', { ...props, 'data-custom-link': 'true' }, children),
    };

    const markup = renderMarkdown({
      components,
      resolveNodeAttributes: ({ node }) => {
        if (node !== 'a') {
          return undefined;
        }

        return {
          id: 'custom-link',
          'data-tracking-id': 'docs-link',
        };
      },
      value: '[Docs](/docs)',
    });

    expect(markup).toContain('data-custom-link="true"');
    expect(markup).toContain('data-markdown-node="a"');
    expect(markup).toContain('id="custom-link"');
    expect(markup).toContain('data-tracking-id="docs-link"');
  });

  it('calls onLinkClick for default links with link context before consumers prevent default', () => {
    const onLinkClick = vi.fn();
    const defaultPreventedValues: boolean[] = [];

    render(
      <MarkdownRender
        onLinkClick={(details) => {
          defaultPreventedValues.push(details.event.defaultPrevented);
          details.event.preventDefault();
          onLinkClick(details);
        }}
        value={['[Docs](/docs)', '', '[Docs](/docs-again)'].join('\n')}
      />,
    );

    const firstLink = screen.getAllByRole('link', { name: 'Docs' })[0];
    const clickResult = fireEvent.click(firstLink);

    expect(clickResult).toBe(false);
    expect(defaultPreventedValues).toEqual([false]);
    expect(onLinkClick).toHaveBeenCalledTimes(1);
    expect(onLinkClick).toHaveBeenCalledWith(
      expect.objectContaining({
        href: '/docs',
        index: 0,
        text: 'Docs',
      }),
    );
  });

  it('lets onLinkClick prevent the default link click when needed', () => {
    render(
      <MarkdownRender
        onLinkClick={({ event }) => {
          event.preventDefault();
        }}
        value="[Docs](/docs)"
      />,
    );

    expect(fireEvent.click(screen.getByRole('link', { name: 'Docs' }))).toBe(false);
  });

  it('calls onCopy from the markdown root with copied text context', () => {
    const onCopy = vi.fn();

    const { container } = render(<MarkdownRender onCopy={onCopy} value="Copy this **text**." />);

    const root = container.querySelector('[data-markdown-root="true"]');

    expect(root).not.toBeNull();
    fireEvent.copy(root as Element);

    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Copy this text.',
      }),
    );
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
    expect(markup).toContain('role="checkbox"');
    expect(markup).toContain('aria-checked="true"');
    expect(markup).toContain('aria-checked="false"');
  });

  it('renders markdown images with lazy loading defaults', () => {
    const markup = renderMarkdown({
      value: '![Diagram](/diagram.png)',
    });

    expect(markup).toContain('alt="Diagram"');
    expect(markup).toContain('loading="lazy"');
    expect(markup).toContain('decoding="async"');
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

  it('renders copy actions for fenced code blocks', () => {
    const markup = renderMarkdown({
      value: ['```tsx', 'const value = <MarkdownRender value={content} />;', '```'].join('\n'),
    });
    const plainMarkup = renderMarkdown({
      value: ['```', 'plain text', '```'].join('\n'),
    });

    expect(markup).toContain('data-code-block-copy="true"');
    expect(markup).toContain('aria-label="Copy code"');
    expect(plainMarkup).toContain('data-code-block-copy="true"');
  });

  it('wraps fenced code overflow with ScrollArea while preserving pre and code semantics', () => {
    const markup = renderMarkdown({
      value: ['```ts', 'const value = "x".repeat(200);', '```'].join('\n'),
    });

    expect(markup).toContain('data-testid="markdown-code-scroll-area"');
    expect(markup).toContain('data-part="viewport"');
    expect(markup).toContain('data-orientation="horizontal"');
    expect(markup).toContain('data-orientation="vertical"');
    expect(markup).toContain('data-markdown-node="pre"');
    expect(markup).toContain('data-markdown-code="block"');

    const preIndex = markup.indexOf('data-markdown-node="pre"');
    const codeIndex = markup.indexOf('data-markdown-node="code"');

    expect(preIndex).toBeGreaterThan(-1);
    expect(codeIndex).toBeGreaterThan(preIndex);
  });

  it('wraps table overflow with ScrollArea while preserving the table wrapper and table semantics', () => {
    const markup = renderMarkdown({
      value: [
        '| Name | Very long detail |',
        '| --- | --- |',
        '| alpha | beta '.repeat(20) + ' |',
      ].join('\n'),
    });

    expect(markup).toContain('data-testid="markdown-table-scroll-area"');
    expect(markup).toContain('data-part="viewport"');
    expect(markup).toContain('data-orientation="horizontal"');
    expect(markup).toContain('data-orientation="vertical"');
    expect(markup).toContain('data-markdown-node="table-wrapper"');
    expect(markup).toContain('data-markdown-node="table"');

    const wrapperIndex = markup.indexOf('data-markdown-node="table-wrapper"');
    const tableIndex = markup.indexOf('data-markdown-node="table"');

    expect(wrapperIndex).toBeGreaterThan(-1);
    expect(tableIndex).toBeGreaterThan(wrapperIndex);
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
