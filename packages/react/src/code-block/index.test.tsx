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
    expect(markup).toContain('data-code-block-toolbar="header"');
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
    expect(screen.getByText('Code copied')).toBeTruthy();
    expect(onCopy).toHaveBeenCalledWith({
      language: 'ts',
      text: 'const value = 1;',
    });
  });

  it('keeps copy-only actions in the header action slot', () => {
    render(<CodeBlock copy>plain text</CodeBlock>);

    const toolbar = screen.getByRole('toolbar');
    const copyButton = screen.getByRole('button', { name: 'Copy code' });

    expect(toolbar.getAttribute('data-code-block-toolbar')).toBe('header');
    expect(copyButton.parentElement?.className).toContain('headerActions');
  });

  it('announces copy failures without calling onCopy', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
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
      expect(screen.getByText('Unable to copy code')).toBeTruthy();
    });
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('omits the copy button when copy is disabled', () => {
    render(<CodeBlock language="ts">const value = 1;</CodeBlock>);

    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });

  it('exposes reusable code block chrome primitives', () => {
    render(
      <CodeBlock.Toolbar aria-label="Code block actions">
        <CodeBlock.LanguageButton aria-label="Code language">JSON</CodeBlock.LanguageButton>
        <CodeBlock.ActionButton active aria-label="Wrap code">
          Wrap
        </CodeBlock.ActionButton>
      </CodeBlock.Toolbar>,
    );

    expect(
      screen
        .getByRole('toolbar', { name: 'Code block actions' })
        .getAttribute('data-code-block-toolbar'),
    ).toBe('header');
    expect(
      screen
        .getByRole('button', { name: 'Code language' })
        .getAttribute('data-code-block-language-button'),
    ).toBe('true');
    expect(screen.getByRole('button', { name: 'Wrap code' }).getAttribute('data-active')).toBe(
      'true',
    );
  });

  it('keeps floating chrome available as an explicit toolbar variant', () => {
    render(<CodeBlock.Toolbar aria-label="Floating code actions" variant="floating" />);

    expect(
      screen
        .getByRole('toolbar', { name: 'Floating code actions' })
        .getAttribute('data-code-block-toolbar'),
    ).toBe('floating');
  });
});
