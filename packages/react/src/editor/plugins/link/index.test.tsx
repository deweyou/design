// @vitest-environment jsdom

import '../../test-setup';

import { createRef, useEffect } from 'react';
import { LinkUnlinkIcon } from '@deweyou-design/react-icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { afterEach, expect, test, vi } from 'vite-plus/test';

import { markdownEditorAdapter } from '../../adapters/markdown/index.js';
import { createEditorPlugin, type EditorHandle } from '../../core/index.js';
import { Editor } from '../../editor/index.js';
import { floatingToolbarPlugin } from '../floating-toolbar/index.js';
import { toolbarPlugin } from '../toolbar/index.js';
import { linkPlugin } from './index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const SelectLinkTargetPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('Link target');

      paragraph.append(text);
      $getRoot().clear().append(paragraph);
      text.select(0, 4);
    });
  }, [editor]);

  return null;
};

const selectLinkTargetPlugin = () =>
  createEditorPlugin({
    name: 'select-link-target',
    setup: () => <SelectLinkTargetPlugin />,
  });

const SelectCollapsedLinkTargetPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      const text = $createTextNode('Link target');

      paragraph.append(text);
      $getRoot().clear().append(paragraph);
      text.select(4, 4);
    });
  }, [editor]);

  return null;
};

const selectCollapsedLinkTargetPlugin = () =>
  createEditorPlugin({
    name: 'select-collapsed-link-target',
    setup: () => <SelectCollapsedLinkTargetPlugin />,
  });

test('linkPlugin contributes link commands and floating toolbar actions', () => {
  const plugin = linkPlugin();

  expect(plugin.feature).toEqual({ id: 'link' });
  expect(plugin.commands?.map((command) => command.id)).toEqual(['link.insert', 'link.unlink']);
  expect(plugin.floatingToolbarActions?.map((action) => action.id)).toEqual([
    'link.insert',
    'link.unlink',
  ]);
});

test('linkPlugin inserts and removes links from selected text', async () => {
  const editorRef = createRef<EditorHandle<string>>();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[linkPlugin(), selectLinkTargetPlugin()]}
      ref={editorRef}
    />,
  );

  await waitFor(() => {
    expect(editorRef.current).not.toBeNull();
  });

  await act(async () => {
    await editorRef.current?.runCommand('link.insert');
  });

  expect(await screen.findByRole('link', { name: 'Link' })).toHaveAttribute(
    'href',
    'https://example.com',
  );

  await act(async () => {
    await editorRef.current?.runCommand('link.unlink');
  });

  expect(screen.queryByRole('link', { name: 'Link' })).not.toBeInTheDocument();
});

test('linkPlugin toolbar action opens a link editor before linking selected text', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        linkPlugin(),
        toolbarPlugin({ actions: ['link.insert'] }),
        selectLinkTargetPlugin(),
      ]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Link' }));

  const textInput = await screen.findByRole('textbox', { name: 'Link text' });
  const urlInput = screen.getByRole('textbox', { name: 'Link URL' });

  expect(textInput).toHaveValue('Link');
  expect(urlInput).toHaveValue('https://example.com');

  await user.clear(textInput);
  await user.type(textInput, 'Editor docs');
  await user.clear(urlInput);
  await user.type(urlInput, 'https://deweyou.com/editor');
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  expect(await screen.findByRole('link', { name: 'Editor docs' })).toHaveAttribute(
    'href',
    'https://deweyou.com/editor',
  );
});

test('linkPlugin floating toolbar action opens a link editor before linking selected text', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[linkPlugin(), floatingToolbarPlugin(), selectLinkTargetPlugin()]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Editor floating toolbar' });

  await user.click(within(toolbar).getByRole('button', { name: 'Link' }));

  expect(await screen.findByRole('textbox', { name: 'Link text' })).toHaveValue('Link');
  expect(screen.getByRole('textbox', { name: 'Link URL' })).toHaveValue('https://example.com');
});

test('linkPlugin opens the link editor at the floating toolbar position', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[linkPlugin(), floatingToolbarPlugin(), selectLinkTargetPlugin()]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Editor floating toolbar' });

  toolbar.getBoundingClientRect = () =>
    ({
      bottom: 352,
      height: 32,
      left: 640,
      right: 800,
      top: 320,
      width: 160,
      x: 640,
      y: 320,
    }) as DOMRect;

  await user.click(within(toolbar).getByRole('button', { name: 'Link' }));

  const prompt = await screen.findByRole('form', { name: 'Link editor' });

  expect(prompt.style.getPropertyValue('--editor-link-prompt-left')).toBe('720px');
  expect(prompt.style.getPropertyValue('--editor-link-prompt-top')).toBe('192px');
});

test('linkPlugin toolbar action reuses the visible floating toolbar position', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        linkPlugin(),
        toolbarPlugin({ actions: ['link.insert'] }),
        floatingToolbarPlugin(),
        selectLinkTargetPlugin(),
      ]}
    />,
  );

  const floatingToolbar = await screen.findByRole('toolbar', {
    name: 'Editor floating toolbar',
  });

  floatingToolbar.getBoundingClientRect = () =>
    ({
      bottom: 352,
      height: 32,
      left: 640,
      right: 800,
      top: 320,
      width: 160,
      x: 640,
      y: 320,
    }) as DOMRect;

  const formattingToolbar = screen.getByRole('toolbar', { name: 'Editor formatting toolbar' });

  await user.click(within(formattingToolbar).getByRole('button', { name: 'Link' }));

  const prompt = await screen.findByRole('form', { name: 'Link editor' });

  expect(prompt.style.getPropertyValue('--editor-link-prompt-left')).toBe('720px');
  expect(prompt.style.getPropertyValue('--editor-link-prompt-top')).toBe('192px');
});

test('linkPlugin opens the link editor below a top-edge floating toolbar', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[linkPlugin(), floatingToolbarPlugin(), selectLinkTargetPlugin()]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Editor floating toolbar' });

  toolbar.getBoundingClientRect = () =>
    ({
      bottom: 96,
      height: 32,
      left: 640,
      right: 800,
      top: 64,
      width: 160,
      x: 640,
      y: 64,
    }) as DOMRect;

  await user.click(within(toolbar).getByRole('button', { name: 'Link' }));

  const prompt = await screen.findByRole('form', { name: 'Link editor' });

  expect(prompt.style.getPropertyValue('--editor-link-prompt-left')).toBe('720px');
  expect(prompt.style.getPropertyValue('--editor-link-prompt-top')).toBe('108px');
});

test('linkPlugin keeps the link editor below selected text at the top edge', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[linkPlugin(), floatingToolbarPlugin(), selectLinkTargetPlugin()]}
    />,
  );

  const toolbar = await screen.findByRole('toolbar', { name: 'Editor floating toolbar' });

  toolbar.getBoundingClientRect = () =>
    ({
      bottom: 96,
      height: 32,
      left: 640,
      right: 800,
      top: 64,
      width: 160,
      x: 640,
      y: 64,
    }) as DOMRect;

  vi.spyOn(window, 'getSelection').mockReturnValue({
    getRangeAt: () =>
      ({
        getBoundingClientRect: () =>
          ({
            bottom: 156,
            height: 20,
            left: 680,
            right: 760,
            top: 136,
            width: 80,
            x: 680,
            y: 136,
          }) as DOMRect,
      }) as Range,
    rangeCount: 1,
  } as unknown as Selection);

  await user.click(within(toolbar).getByRole('button', { name: 'Link' }));

  const prompt = await screen.findByRole('form', { name: 'Link editor' });

  expect(prompt.style.getPropertyValue('--editor-link-prompt-left')).toBe('720px');
  expect(prompt.style.getPropertyValue('--editor-link-prompt-top')).toBe('168px');
});

test('linkPlugin keeps existing link text visible when opening the link editor', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="[Deweyou Design](https://deweyou.com)"
      plugins={[linkPlugin()]}
    />,
  );

  const link = await screen.findByRole('link', { name: 'Deweyou Design' });

  link.getBoundingClientRect = () =>
    ({
      bottom: 352,
      height: 24,
      left: 640,
      right: 800,
      top: 328,
      width: 160,
      x: 640,
      y: 328,
    }) as DOMRect;

  fireEvent.click(link);

  const prompt = await screen.findByRole('form', { name: 'Link editor' });

  expect(prompt.style.getPropertyValue('--editor-link-prompt-left')).toBe('720px');
  expect(prompt.style.getPropertyValue('--editor-link-prompt-top')).toBe('156px');
});

test('linkPlugin opens a link editor when clicking existing link text', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="[Deweyou Design](https://deweyou.com)"
      plugins={[linkPlugin()]}
    />,
  );

  fireEvent.click(await screen.findByRole('link', { name: 'Deweyou Design' }));

  const textInput = await screen.findByRole('textbox', { name: 'Link text' });
  const urlInput = screen.getByRole('textbox', { name: 'Link URL' });

  expect(textInput).toHaveValue('Deweyou Design');
  expect(urlInput).toHaveValue('https://deweyou.com');

  await user.clear(textInput);
  await user.type(textInput, 'Editor docs');
  await user.clear(urlInput);
  await user.type(urlInput, 'https://deweyou.com/editor');
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  expect(await screen.findByRole('link', { name: 'Editor docs' })).toHaveAttribute(
    'href',
    'https://deweyou.com/editor',
  );
  expect(screen.queryByRole('link', { name: 'Deweyou Design' })).not.toBeInTheDocument();
});

test('linkPlugin validates link editor text and URL before applying', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        linkPlugin(),
        toolbarPlugin({ actions: ['link.insert'] }),
        selectLinkTargetPlugin(),
      ]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Link' }));

  const textInput = await screen.findByRole('textbox', { name: 'Link text' });
  const urlInput = screen.getByRole('textbox', { name: 'Link URL' });
  const form = screen.getByRole('form', { name: 'Link editor' });

  expect(form.children).toHaveLength(3);

  await user.clear(textInput);
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  const textError = await screen.findByRole('alert');

  expect(textError).toHaveTextContent('Enter link text.');
  expect(textError.closest('label')).toHaveTextContent('Text');
  expect(textInput).toHaveAttribute('aria-invalid', 'true');
  expect(form.children).toHaveLength(3);

  await user.type(textInput, 'Editor docs');
  await user.clear(urlInput);
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  const urlError = await screen.findByRole('alert');

  expect(urlError).toHaveTextContent('Enter link URL.');
  expect(urlError.closest('label')).toHaveTextContent('URL');
  expect(urlInput).toHaveAttribute('aria-invalid', 'true');
  expect(form.children).toHaveLength(3);

  await user.type(urlInput, 'not-a-url');
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Enter a valid URL.');
  expect(urlInput).toHaveAttribute('aria-invalid', 'true');

  await user.clear(urlInput);
  await user.type(urlInput, 'https://deweyou.com/editor');
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  expect(await screen.findByRole('link', { name: 'Editor docs' })).toHaveAttribute(
    'href',
    'https://deweyou.com/editor',
  );
});

test('linkPlugin unlinks an existing link from the link editor', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="[Deweyou Design](https://deweyou.com)"
      plugins={[linkPlugin()]}
    />,
  );

  fireEvent.click(await screen.findByRole('link', { name: 'Deweyou Design' }));

  await user.click(await screen.findByRole('button', { name: 'Unlink' }));

  await waitFor(() => {
    expect(screen.queryByRole('link', { name: 'Deweyou Design' })).not.toBeInTheDocument();
  });
  expect(screen.getByText('Deweyou Design')).toBeInTheDocument();
});

test('linkPlugin uses icon-only controls in the link editor', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="[Deweyou Design](https://deweyou.com)"
      plugins={[linkPlugin()]}
    />,
  );

  fireEvent.click(await screen.findByRole('link', { name: 'Deweyou Design' }));

  const applyButton = await screen.findByRole('button', { name: 'Apply link' });
  const cancelButton = screen.getByRole('button', { name: 'Cancel link' });
  const unlinkButton = screen.getByRole('button', { name: 'Unlink' });

  expect(applyButton.textContent).toBe('');
  expect(cancelButton.textContent).toBe('');
  expect(unlinkButton.textContent).toBe('');
  expect(applyButton.querySelector('svg')).not.toBeNull();
  expect(cancelButton.querySelector('svg')).not.toBeNull();
  expect(unlinkButton.querySelector('svg')).not.toBeNull();
});

test('linkPlugin closes the link editor when clicking outside it', async () => {
  render(
    <Editor
      adapter={markdownEditorAdapter()}
      defaultValue="[Deweyou Design](https://deweyou.com)"
      plugins={[linkPlugin()]}
    />,
  );

  fireEvent.click(await screen.findByRole('link', { name: 'Deweyou Design' }));

  expect(await screen.findByRole('form', { name: 'Link editor' })).toBeInTheDocument();

  fireEvent.pointerDown(document.body);

  await waitFor(() => {
    expect(screen.queryByRole('form', { name: 'Link editor' })).not.toBeInTheDocument();
  });
  expect(await screen.findByRole('link', { name: 'Deweyou Design' })).toHaveAttribute(
    'href',
    'https://deweyou.com',
  );
});

test('linkPlugin keeps URL input visible when the selection rect is below the viewport', async () => {
  const originalInnerHeight = window.innerHeight;

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: 720,
  });
  vi.spyOn(window, 'getSelection').mockReturnValue({
    getRangeAt: () =>
      ({
        getBoundingClientRect: () => ({
          bottom: 780,
          height: 20,
          left: 800,
          right: 840,
          top: 760,
          width: 40,
          x: 800,
          y: 760,
        }),
      }) as Range,
    rangeCount: 1,
    setBaseAndExtent: vi.fn(),
  } as unknown as Selection);

  try {
    render(
      <Editor
        adapter={markdownEditorAdapter()}
        plugins={[
          linkPlugin(),
          toolbarPlugin({ actions: ['link.insert'] }),
          selectLinkTargetPlugin(),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Link' }));

    await screen.findByRole('textbox', { name: 'Link URL' });

    const prompt = screen.getByRole('form', { name: 'Link editor' });
    const promptTop = Number.parseFloat(prompt.style.getPropertyValue('--editor-link-prompt-top'));

    expect(promptTop).toBeLessThanOrEqual(window.innerHeight - 160);
  } finally {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  }
});

test('linkPlugin keeps unlink contextual to existing links', () => {
  const plugin = linkPlugin();
  const unlinkAction = plugin.floatingToolbarActions?.find((action) => action.id === 'link.unlink');

  expect(unlinkAction?.isVisible).toBeDefined();
  expect(unlinkAction?.icon).toBe(LinkUnlinkIcon);
});

test('linkPlugin toolbar action inserts the submitted URL at a collapsed selection', async () => {
  const user = userEvent.setup();

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        linkPlugin(),
        toolbarPlugin({ actions: ['link.insert'] }),
        selectCollapsedLinkTargetPlugin(),
      ]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Link' }));

  const textInput = await screen.findByRole('textbox', { name: 'Link text' });
  const urlInput = screen.getByRole('textbox', { name: 'Link URL' });

  await user.type(textInput, 'Editor docs');
  await user.clear(urlInput);
  await user.type(urlInput, 'https://deweyou.com/editor');
  await user.click(screen.getByRole('button', { name: 'Apply link' }));

  expect(await screen.findByRole('link', { name: 'Editor docs' })).toHaveAttribute(
    'href',
    'https://deweyou.com/editor',
  );
});

test('linkPlugin accepts an injected URL requester', async () => {
  const user = userEvent.setup();
  const requestUrl = vi.fn(() => 'https://deweyou.com/requester');

  render(
    <Editor
      adapter={markdownEditorAdapter()}
      plugins={[
        linkPlugin({ requestUrl }),
        toolbarPlugin({ actions: ['link.insert'] }),
        selectLinkTargetPlugin(),
      ]}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Link' }));

  expect(requestUrl).toHaveBeenCalledWith(
    expect.objectContaining({
      currentText: 'Link',
      currentUrl: undefined,
      defaultText: 'Link',
      defaultUrl: 'https://example.com',
    }),
  );
  expect(await screen.findByRole('link', { name: 'Link' })).toHaveAttribute(
    'href',
    'https://deweyou.com/requester',
  );
});
