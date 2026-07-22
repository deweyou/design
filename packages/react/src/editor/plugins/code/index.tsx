import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import '../../runtime/prism.js';

import {
  $createCodeNode,
  $isCodeNode,
  CodeHighlightNode,
  CodeNode,
  PrismTokenizer,
  registerCodeHighlighting,
} from '@lexical/code';
import { CODE } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $setBlocksType } from '@lexical/selection';
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor,
  type NodeKey,
} from 'lexical';
import {
  CaretDownSmallIcon,
  CheckIcon,
  CopyIcon,
  FormatPainterIcon,
  TextformatWrapIcon,
} from '@deweyou-design/react-icons';
import {
  CodeBlockActionButton,
  CodeBlockLanguageButton,
  CodeBlockToolbar,
} from '../../../code-block/index.js';
import { Tooltip } from '../../../tooltip/index.js';
import classNames from 'classnames';

import {
  createEditorPlugin,
  type EditorCommandContext,
  type EditorRuntime,
} from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';
import { useCodePluginLocaleText } from './locale/loader.ts';
import type { CodePluginLocaleText } from './locale/types.ts';

import styles from './index.module.less';

export { formatJsonPreservingDuplicateKeys, hasDuplicateJsonObjectKeys } from './json-format.js';

export type CodeLanguageOption = {
  label: string;
  value: string | undefined;
};

export type CodeFormatter = (
  code: string,
  language: string | undefined,
) => string | Promise<string>;

export type CodePluginOptions = {
  languages?: CodeLanguageOption[];
  copy?: boolean;
  highlight?: boolean;
  languageMenu?: boolean;
  localeText?: Partial<CodePluginLocaleText>;
  wrap?: boolean;
  format?:
    | false
    | {
        formatters: Record<string, CodeFormatter>;
      };
};

type CodeLanguageMenuState = {
  currentLanguage: string;
  left: number;
  nodeKey: string;
  top: number;
};

type CodeBlockActionsState = {
  code: string;
  currentLanguage: string;
  left: number;
  nodeKey: string;
  top: number;
  width: number;
};

type CodeActionTooltipProps = {
  children: ReactNode;
  label: string;
};

const CodeActionTooltip = ({ children, label }: CodeActionTooltipProps) => (
  <Tooltip.Root closeDelay={0} openDelay={250} placement="top">
    <Tooltip.Trigger>{children}</Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip.Root>
);

const defaultCodeLanguageOptions = [
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

const getEditor = (runtime: EditorRuntime) => {
  if (!isLexicalRuntime(runtime)) {
    return undefined;
  }

  return runtime.handle.editor ?? undefined;
};

const getEditorRootElement = (runtime: EditorRuntime) =>
  getEditor(runtime)?.getRootElement()?.closest('[data-editor-root]') as HTMLElement | null;

const getLexicalEditorRootElement = (editor: LexicalEditor) =>
  editor.getRootElement()?.closest('[data-editor-root]') as HTMLElement | null;

const getSelectedCodeNode = () => {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return undefined;
  }

  const anchorTopLevelNode = selection.anchor.getNode().getTopLevelElementOrThrow();

  if ($isCodeNode(anchorTopLevelNode)) {
    return anchorTopLevelNode;
  }

  for (const node of selection.getNodes()) {
    const topLevelNode = node.getTopLevelElementOrThrow();

    if ($isCodeNode(topLevelNode)) {
      return topLevelNode;
    }
  }

  return undefined;
};

const CodeHighlightRegistrationPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) {
      return undefined;
    }

    return registerCodeHighlighting(editor, codeHighlightTokenizer);
  }, [editor]);

  return null;
};

const getCodeActionPosition = (element: HTMLElement, rootElement: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const rootRect = rootElement.getBoundingClientRect();

  return {
    left: Math.max(0, rect.left - rootRect.left + 1),
    top: Math.max(0, rect.top - rootRect.top + 1),
    width: Math.max(0, rect.width - 2),
  };
};

const getCodeBlockStates = (editor: LexicalEditor) => {
  const rootElement = editor.getRootElement();
  const chromeRootElement = getLexicalEditorRootElement(editor);

  if (!rootElement || !chromeRootElement) {
    return [];
  }

  const codeElements = Array.from(rootElement.querySelectorAll('code')).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );

  return editor.getEditorState().read(
    () =>
      codeElements.flatMap((element) => {
        const node = $getNearestNodeFromDOMNode(element);

        if (!$isCodeNode(node)) {
          return [];
        }

        return [
          {
            code: node.getTextContent(),
            currentLanguage: node.getLanguage() ?? '',
            nodeKey: node.getKey(),
            ...getCodeActionPosition(element, chromeRootElement),
          },
        ];
      }),
    { editor },
  );
};

const stopToolbarMouseDown = (event: ReactMouseEvent<HTMLElement>) => {
  event.preventDefault();
};

const CodeBlockActionsPlugin = ({
  copy,
  format,
  languageMenu,
  languages,
  localeText,
  localizePlainText,
  wrap,
}: {
  copy: boolean;
  format: CodePluginOptions['format'];
  languageMenu: boolean;
  languages: readonly CodeLanguageOption[];
  localeText?: Partial<CodePluginLocaleText>;
  localizePlainText: boolean;
  wrap: boolean;
}) => {
  const resolvedLocaleText = useCodePluginLocaleText(localeText);
  const resolvedLanguages = localizePlainText
    ? languages.map((language) =>
        language.value === undefined
          ? { ...language, label: resolvedLocaleText.plainText }
          : language,
      )
    : languages;
  const [editor] = useLexicalComposerContext();
  const resetCopiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resetFormattedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [actions, setActions] = useState<CodeBlockActionsState[]>([]);
  const [copiedNodeKey, setCopiedNodeKey] = useState<string | undefined>(undefined);
  const [copyStatus, setCopyStatus] = useState<'copied' | 'error' | undefined>(undefined);
  const [formattedNodeKey, setFormattedNodeKey] = useState<string | undefined>(undefined);
  const [wrapEnabled, setWrapEnabled] = useState(wrap);
  const [menu, setMenu] = useState<CodeLanguageMenuState | undefined>(undefined);
  const hasActions = copy || languageMenu || wrap || Boolean(format);

  const syncCodeBlocks = useCallback(() => {
    if (!hasActions) {
      setActions([]);
      return;
    }

    setActions(getCodeBlockStates(editor));
    setWrapEnabled(getLexicalEditorRootElement(editor)?.dataset.editorCodeWrap === 'true');
  }, [editor, hasActions]);

  useEffect(() => {
    syncCodeBlocks();

    const unregisterUpdate = editor.registerUpdateListener(() => syncCodeBlocks());
    const unregisterSelection = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        syncCodeBlocks();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    return () => {
      unregisterUpdate();
      unregisterSelection();
    };
  }, [editor, syncCodeBlocks]);

  useEffect(() => {
    const rootElement = editor.getRootElement();

    if (!rootElement) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest('[data-editor-code-block-actions]')) {
        return;
      }

      if (!target.closest('code')) {
        setMenu(undefined);
      }

      syncCodeBlocks();
    };

    rootElement.addEventListener('pointerdown', handlePointerDown);

    return () => {
      rootElement.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [editor, syncCodeBlocks]);

  useEffect(() => {
    if (actions.length === 0) {
      return undefined;
    }

    const handleWindowChange = () => syncCodeBlocks();

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [actions.length, syncCodeBlocks]);

  useEffect(() => {
    if (!menu) {
      return undefined;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.closest('[data-editor-code-language-menu]') ||
          target.closest('[data-editor-code-language-trigger]'))
      ) {
        return;
      }

      setMenu(undefined);
    };

    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [menu]);

  useEffect(() => {
    return () => {
      if (resetCopiedTimer.current) {
        clearTimeout(resetCopiedTimer.current);
      }

      if (resetFormattedTimer.current) {
        clearTimeout(resetFormattedTimer.current);
      }
    };
  }, []);

  const toggleWrap = () => {
    const editorRootElement = getLexicalEditorRootElement(editor);

    if (editorRootElement instanceof HTMLElement) {
      const nextWrap = editorRootElement.dataset.editorCodeWrap !== 'true';

      editorRootElement.dataset.editorCodeWrap = nextWrap ? 'true' : 'false';
      setWrapEnabled(nextWrap);
    }
  };

  const formatCode = async (action: CodeBlockActionsState) => {
    if (!format) {
      return;
    }

    const formatted = await formatCodeNode(editor, format.formatters, action.nodeKey as NodeKey);

    if (!formatted) {
      return;
    }

    setFormattedNodeKey(action.nodeKey);

    if (resetFormattedTimer.current) {
      clearTimeout(resetFormattedTimer.current);
    }

    resetFormattedTimer.current = setTimeout(() => {
      setFormattedNodeKey(undefined);
    }, 1200);
  };

  if (!hasActions || actions.length === 0) {
    return null;
  }

  const openLanguageMenu = (action: CodeBlockActionsState) => {
    setMenu({
      currentLanguage: action.currentLanguage,
      left: action.left + 8,
      nodeKey: action.nodeKey,
      top: action.top + 36,
    });
  };

  const applyLanguage = (language: string | undefined) => {
    if (!menu) {
      return;
    }

    editor.update(() => {
      const node = $getNodeByKey(menu.nodeKey as NodeKey);

      if ($isCodeNode(node)) {
        node.setLanguage(language);
      }
    });
    setMenu(undefined);
  };

  const copyCode = async (action: CodeBlockActionsState) => {
    if (!action.code || !navigator.clipboard?.writeText) {
      setCopiedNodeKey(undefined);
      setCopyStatus('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(action.code);
      setCopiedNodeKey(action.nodeKey);
      setCopyStatus('copied');
    } catch {
      setCopiedNodeKey(undefined);
      setCopyStatus('error');
    }

    if (resetCopiedTimer.current) {
      clearTimeout(resetCopiedTimer.current);
    }

    resetCopiedTimer.current = setTimeout(() => {
      setCopiedNodeKey(undefined);
      setCopyStatus(undefined);
    }, 1200);
  };

  return (
    <>
      {actions.map((action) => {
        const copied = copiedNodeKey === action.nodeKey;
        const formatted = formattedNodeKey === action.nodeKey;
        const copyLabel = copied ? resolvedLocaleText.copiedCode : resolvedLocaleText.copyCode;
        const formatLabel = formatted
          ? resolvedLocaleText.formattedCode
          : resolvedLocaleText.formatCode;
        const toolbarStyle = {
          inlineSize: action.width,
          insetBlockStart: action.top,
          insetInlineStart: action.left,
        } as CSSProperties;

        return (
          <CodeBlockToolbar
            aria-label={resolvedLocaleText.codeBlockActions}
            className={styles.codeActions}
            data-editor-code-block-actions="true"
            data-editor-code-block-header="true"
            key={action.nodeKey}
            onMouseDown={stopToolbarMouseDown}
            onPointerDown={stopToolbarMouseDown}
            style={toolbarStyle}
            variant="header"
          >
            {languageMenu ? (
              <CodeActionTooltip label={resolvedLocaleText.codeLanguage}>
                <CodeBlockLanguageButton
                  aria-label={resolvedLocaleText.codeLanguage}
                  className={styles.codeLanguageButton}
                  data-editor-code-language-trigger="true"
                  onClick={() => openLanguageMenu(action)}
                >
                  {action.currentLanguage || 'text'}
                  <CaretDownSmallIcon size="xs" />
                </CodeBlockLanguageButton>
              </CodeActionTooltip>
            ) : (
              <span />
            )}
            <span className={styles.codeHeaderActions}>
              {copy ? (
                <CodeActionTooltip label={copyLabel}>
                  <CodeBlockActionButton
                    aria-label={copyLabel}
                    className={styles.codeActionButton}
                    data-copied={copied ? 'true' : undefined}
                    feedback={copied}
                    onClick={() => void copyCode(action)}
                  >
                    {copied ? <CheckIcon size="xs" /> : <CopyIcon size="xs" />}
                  </CodeBlockActionButton>
                </CodeActionTooltip>
              ) : null}
              {wrap ? (
                <CodeActionTooltip label={resolvedLocaleText.wrapCode}>
                  <CodeBlockActionButton
                    active={wrapEnabled}
                    aria-pressed={wrapEnabled}
                    aria-label={resolvedLocaleText.wrapCode}
                    className={styles.codeActionButton}
                    onClick={toggleWrap}
                  >
                    <TextformatWrapIcon size="xs" />
                  </CodeBlockActionButton>
                </CodeActionTooltip>
              ) : null}
              {format ? (
                <CodeActionTooltip label={formatLabel}>
                  <CodeBlockActionButton
                    aria-label={formatLabel}
                    className={styles.codeActionButton}
                    data-success={formatted ? 'true' : undefined}
                    feedback={formatted}
                    onClick={() => void formatCode(action)}
                  >
                    {formatted ? <CheckIcon size="xs" /> : <FormatPainterIcon size="xs" />}
                  </CodeBlockActionButton>
                </CodeActionTooltip>
              ) : null}
            </span>
          </CodeBlockToolbar>
        );
      })}
      {copy ? (
        <span aria-live="polite" className={styles.codeStatus}>
          {copyStatus === 'copied'
            ? resolvedLocaleText.codeCopied
            : copyStatus === 'error'
              ? resolvedLocaleText.unableToCopyCode
              : null}
        </span>
      ) : null}
      {menu ? (
        <div
          aria-label={resolvedLocaleText.codeLanguage}
          className={styles.languageMenu}
          data-editor-code-language-menu="true"
          role="listbox"
          style={{ insetBlockStart: menu.top, insetInlineStart: menu.left }}
        >
          {resolvedLanguages.map((option) => (
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
      ) : null}
    </>
  );
};

const runToggleCodeBlock = ({ runtime }: EditorCommandContext) => {
  const editor = getEditor(runtime);

  if (!editor) {
    return;
  }

  editor.update(() => {
    $setBlocksType($getSelection(), () => $createCodeNode());
  });
};

const runSetLanguage =
  (languages: readonly CodeLanguageOption[]) =>
  ({ runtime }: EditorCommandContext, payload: unknown) => {
    const editor = getEditor(runtime);

    if (!editor) {
      return;
    }

    const hasLanguagePayload = typeof payload === 'object' && payload && 'language' in payload;
    const payloadLanguage =
      hasLanguagePayload && typeof (payload as { language?: unknown }).language === 'string'
        ? (payload as { language: string }).language
        : undefined;

    editor.update(() => {
      const node = getSelectedCodeNode();

      if (!$isCodeNode(node)) {
        return;
      }

      if (hasLanguagePayload) {
        node.setLanguage(payloadLanguage);
        return;
      }

      const languageValues = languages.map((option) => option.value);
      const currentLanguage = node.getLanguage() ?? undefined;
      const currentIndex = languageValues.findIndex((language) => language === currentLanguage);
      const nextLanguage = languageValues[(currentIndex + 1) % languageValues.length];

      node.setLanguage(nextLanguage);
    });
  };

const runToggleWrap = ({ runtime }: EditorCommandContext) => {
  const editorRootElement = getEditorRootElement(runtime);

  if (!editorRootElement) {
    return;
  }

  editorRootElement.dataset.editorCodeWrap =
    editorRootElement.dataset.editorCodeWrap === 'true' ? 'false' : 'true';
};

const resolveFormatter = (
  formatters: Record<string, CodeFormatter>,
  language: string | undefined,
) =>
  (language ? formatters[language] : undefined) ??
  formatters.default ??
  formatters.text ??
  formatters.plain;

const formatCodeNode = async (
  editor: LexicalEditor,
  formatters: Record<string, CodeFormatter>,
  nodeKey?: NodeKey,
) => {
  const selectedCode = editor.getEditorState().read(() => {
    const node = nodeKey ? $getNodeByKey(nodeKey) : getSelectedCodeNode();

    if (!$isCodeNode(node)) {
      return undefined;
    }

    return {
      code: node.getTextContent(),
      language: node.getLanguage() ?? undefined,
      nodeKey: node.getKey(),
    };
  });

  if (!selectedCode) {
    return false;
  }

  const formatter = resolveFormatter(formatters, selectedCode.language);

  if (!formatter) {
    return false;
  }

  const formattedCode = await formatter(selectedCode.code, selectedCode.language);

  editor.update(() => {
    const node = $getNodeByKey(selectedCode.nodeKey);

    if (!$isCodeNode(node)) {
      return;
    }

    node.clear();

    if (formattedCode.length > 0) {
      node.append($createTextNode(formattedCode));
    }
  });

  return true;
};

const runFormatCode =
  (formatters: Record<string, CodeFormatter>) =>
  async ({ runtime }: EditorCommandContext) => {
    const editor = getEditor(runtime);

    if (!editor) {
      return;
    }

    await formatCodeNode(editor, formatters);
  };

const CodeSettingsPlugin = ({ actions, wrap }: { actions: boolean; wrap: boolean }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const editorRootElement = editor.getRootElement()?.closest('[data-editor-root]');

    if (!(editorRootElement instanceof HTMLElement)) {
      return undefined;
    }

    editorRootElement.dataset.editorCodeWrap = wrap ? 'true' : 'false';
    editorRootElement.dataset.editorCodeActions = actions ? 'true' : 'false';

    return () => {
      delete editorRootElement.dataset.editorCodeWrap;
      delete editorRootElement.dataset.editorCodeActions;
    };
  }, [actions, editor, wrap]);

  return null;
};

export const codePlugin = ({
  copy = true,
  format = false,
  highlight = true,
  languageMenu = true,
  languages,
  localeText,
  wrap = false,
}: CodePluginOptions = {}) => {
  const resolvedLanguages = languages ?? [...defaultCodeLanguageOptions];
  const hasCodeActions = copy || languageMenu || wrap || Boolean(format);

  return createEditorPlugin({
    name: 'code',
    feature: { id: 'code' },
    nodes: highlight ? [CodeNode, CodeHighlightNode] : [CodeNode],
    commands: [
      { id: 'code.toggle-block', run: runToggleCodeBlock },
      { id: 'code.set-language', run: runSetLanguage(resolvedLanguages) },
      { id: 'code.toggle-wrap', run: runToggleWrap },
      ...(format
        ? [
            {
              id: 'code.format',
              run: runFormatCode(format.formatters),
            },
          ]
        : []),
    ],
    blockToolbarActions: [],
    markdownShortcuts: [
      {
        feature: 'code',
        transformers: [CODE],
      },
    ],
    setup: () => (
      <>
        <CodeSettingsPlugin actions={hasCodeActions} wrap={wrap} />
        {highlight ? <CodeHighlightRegistrationPlugin /> : null}
        {hasCodeActions ? (
          <CodeBlockActionsPlugin
            copy={copy}
            format={format}
            languageMenu={languageMenu}
            languages={resolvedLanguages}
            localeText={localeText}
            localizePlainText={languages === undefined}
            wrap={wrap}
          />
        ) : null}
      </>
    ),
  });
};

export type { CodePluginLocaleText } from './locale/types.ts';
