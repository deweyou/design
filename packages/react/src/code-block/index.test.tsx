// @vitest-environment jsdom

import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { CodeBlock, type CodeBlockLanguage, type CodeBlockProps } from './index';

describe('CodeBlock', () => {
  beforeEach(() => {
    class IntersectionObserverMock {
      disconnect = vi.fn();
      observe = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders a scrollable pre/code block with language metadata', () => {
    const markup = renderToStaticMarkup(
      createElement(CodeBlock, { language: 'ts' }, 'const value = 1;'),
    );

    expect(markup).toContain('data-ui-code-block="true"');
    expect(markup).toContain('data-language="ts"');
    expect(markup).toContain('data-code-block-language-label="true"');
    expect(markup).toContain('>ts</span>');
    expect(markup).toContain('<pre');
    expect(markup).toContain('<code');
    expect(markup).toContain('value =');
    expect(markup).toContain('data-part="viewport"');
  });

  it('highlights plain string children when a supported language is provided', () => {
    const markup = renderToStaticMarkup(
      createElement(CodeBlock, { language: 'ts' }, 'const value = "Deweyou";'),
    );

    expect(markup).toContain('hljs-keyword');
    expect(markup).toContain('hljs-string');
  });

  it('omits the language label when language is not provided', () => {
    const markup = renderToStaticMarkup(createElement(CodeBlock, null, 'plain text'));

    expect(markup).toContain('data-ui-code-block="true"');
    expect(markup).not.toContain('data-code-block-language-label="true"');
  });

  it('documents common language values while allowing custom languages', () => {
    const commonLanguage: CodeBlockLanguage = 'tsx';
    const customLanguage: CodeBlockProps['language'] = 'mermaid';

    expect(commonLanguage).toBe('tsx');
    expect(customLanguage).toBe('mermaid');
  });

  it('copies plain string code and reports copied details', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopy = vi.fn();

    vi.stubGlobal('navigator', {
      clipboard: { writeText },
    });

    render(
      <CodeBlock copy language="ts" onCopy={onCopy}>
        const value = 1;
      </CodeBlock>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('const value = 1;');
    });
    expect(onCopy).toHaveBeenCalledWith({
      language: 'ts',
      text: 'const value = 1;',
    });
  });

  it('omits the copy button when copy is disabled', () => {
    render(<CodeBlock language="ts">const value = 1;</CodeBlock>);

    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });
});
