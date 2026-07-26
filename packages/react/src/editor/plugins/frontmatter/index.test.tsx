// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index';
import { Editor } from '../../editor/index';
import { frontmatterPlugin } from './index';

const adapter = markdownEditorAdapter();

beforeEach(() => {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('frontmatterPlugin', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders frontmatter through the shared editable component and serializes changes', async () => {
    const onChange = vi.fn();

    render(
      <Editor
        adapter={adapter}
        defaultValue={[
          '---',
          '# publication state',
          'title: "Frontmatter support"',
          'draft: false',
          'tags: [markdown]',
          '---',
          '',
          '# Body',
        ].join('\n')}
        onChange={onChange}
        plugins={[frontmatterPlugin()]}
      />,
    );

    const titleInput = await screen.findByRole('textbox', { name: 'title' });
    fireEvent.change(titleInput, { target: { value: 'Updated title' } });

    await waitFor(() => {
      const markdownValues = onChange.mock.calls.map(
        (call) => (call[0] as { value: string }).value,
      );

      expect(markdownValues.some((value) => value.includes('title: "Updated title"'))).toBe(true);
      expect(markdownValues.some((value) => value.includes('# publication state'))).toBe(true);
      expect(markdownValues.some((value) => value.includes('# Body'))).toBe(true);
    });
  });

  it('respects Editor readOnly state for metadata controls', async () => {
    render(
      <Editor
        adapter={adapter}
        defaultValue={['---', 'draft: true', '---', 'Body'].join('\n')}
        plugins={[frontmatterPlugin()]}
        readOnly
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'draft' }).getAttribute('aria-checked')).toBe(
        'true',
      );
    });
    expect(screen.queryByRole('textbox', { name: 'Frontmatter YAML source' })).toBeNull();
  });

  it('keeps invalid YAML editable in source mode', async () => {
    const onChange = vi.fn();

    render(
      <Editor
        adapter={adapter}
        defaultValue={['---', 'title: [broken', '---', 'Body'].join('\n')}
        onChange={onChange}
        plugins={[frontmatterPlugin()]}
      />,
    );

    const sourceInput = await screen.findByRole('textbox', { name: 'Frontmatter YAML source' });
    fireEvent.change(sourceInput, { target: { value: 'title: fixed\n' } });

    await waitFor(() => {
      const markdownValues = onChange.mock.calls.map(
        (call) => (call[0] as { value: string }).value,
      );

      expect(markdownValues.some((value) => value.includes('title: fixed'))).toBe(true);
    });
  });

  it('serializes property rename and delete actions back to Markdown', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Editor
        adapter={adapter}
        defaultValue={['---', 'title: Draft', 'draft: false', '---', 'Body'].join('\n')}
        onChange={onChange}
        plugins={[frontmatterPlugin()]}
      />,
    );

    await user.click(await screen.findByRole('button', { name: 'Rename title property' }));
    const renameInput = screen.getByRole('textbox', { name: 'Rename title property' });
    await user.clear(renameInput);
    await user.type(renameInput, 'name{Enter}');

    await user.click(screen.getByRole('button', { name: 'Change draft property type' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete property' }));

    await waitFor(() => {
      const markdownValues = onChange.mock.calls.map(
        (call) => (call[0] as { value: string }).value,
      );
      const finalValue = markdownValues.at(-1);

      expect(finalValue).toContain('name: Draft');
      expect(finalValue).not.toContain('title:');
      expect(finalValue).not.toContain('draft:');
      expect(finalValue).toContain('Body');
    });
  });
});
