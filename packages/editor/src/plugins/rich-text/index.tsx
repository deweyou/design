import { useEffect, useState } from 'react';
import '../../runtime/prism.js';

import { $isCodeNode, PrismTokenizer, registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { $getNearestNodeFromDOMNode, $getNodeByKey } from 'lexical';
import classNames from 'classnames';

import { createEditorPlugin } from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';

import styles from './index.module.less';

type CodeLanguageOption = {
  label: string;
  value: string | undefined;
};

type CodeLanguageMenuState = {
  nodeKey: string;
  currentLanguage: string;
  top: number;
  right: number;
};

const codeLanguageOptions = [
  { label: 'TypeScript', value: 'ts' },
  { label: 'TSX', value: 'tsx' },
  { label: 'JavaScript', value: 'js' },
  { label: 'JSX', value: 'jsx' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Bash', value: 'bash' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Plain text', value: undefined },
] as const satisfies readonly CodeLanguageOption[];

const codeHighlightTokenizer = {
  ...PrismTokenizer,
  defaultLanguage: null,
};

const CodeHighlightRegistrationPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor, codeHighlightTokenizer);
  }, [editor]);

  return null;
};

const isCodeLanguagePillClick = (element: HTMLElement, event: MouseEvent) => {
  const rect = element.getBoundingClientRect();
  const maxPillInlineSize = 5.75 * 16;
  const pillBlockSize = 2.1 * 16;

  return (
    event.clientX >= rect.right - maxPillInlineSize &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.top + pillBlockSize
  );
};

const CodeLanguageMenuPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [menu, setMenu] = useState<CodeLanguageMenuState | undefined>(undefined);

  useEffect(() => {
    const rootElement = editor.getRootElement();

    if (!rootElement) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const codeElement = target.closest('code[data-language]');

      if (!(codeElement instanceof HTMLElement) || !codeElement.dataset.language) {
        setMenu(undefined);
        return;
      }

      if (!isCodeLanguagePillClick(codeElement, event)) {
        setMenu(undefined);
        return;
      }

      event.preventDefault();

      const rect = codeElement.getBoundingClientRect();

      editor.getEditorState().read(
        () => {
          const node = $getNearestNodeFromDOMNode(codeElement);

          if (!$isCodeNode(node)) {
            return;
          }

          setMenu({
            currentLanguage: node.getLanguage() ?? '',
            nodeKey: node.getKey(),
            right: window.innerWidth - rect.right + 8,
            top: rect.top + 34,
          });
        },
        { editor },
      );
    };

    rootElement.addEventListener('click', handleClick);

    return () => {
      rootElement.removeEventListener('click', handleClick);
    };
  }, [editor]);

  useEffect(() => {
    if (!menu) {
      return undefined;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (target instanceof HTMLElement && target.closest('[data-editor-code-language-menu]')) {
        return;
      }

      setMenu(undefined);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [menu]);

  if (!menu) {
    return null;
  }

  const applyLanguage = (language: string | undefined) => {
    editor.update(() => {
      const node = $getNodeByKey(menu.nodeKey);

      if ($isCodeNode(node)) {
        node.setLanguage(language);
      }
    });
    setMenu(undefined);
  };

  return (
    <div
      aria-label="Code language"
      className={styles.languageMenu}
      data-editor-code-language-menu="true"
      role="listbox"
      style={{ insetBlockStart: menu.top, insetInlineEnd: menu.right }}
    >
      {codeLanguageOptions.map((option) => (
        <button
          aria-selected={(option.value ?? '') === menu.currentLanguage}
          className={classNames(styles.languageOption)}
          data-selected={(option.value ?? '') === menu.currentLanguage ? 'true' : undefined}
          key={option.label}
          onClick={() => applyLanguage(option.value)}
          role="option"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export const richTextPlugin = () =>
  createEditorPlugin({
    name: 'rich-text',
    setup: ({ runtime }) => {
      if (!isLexicalRuntime(runtime)) {
        return null;
      }

      return (
        <>
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <CodeHighlightRegistrationPlugin />
          <CodeLanguageMenuPlugin />
        </>
      );
    },
  });
