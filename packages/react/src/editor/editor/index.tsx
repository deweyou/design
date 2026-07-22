import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type ForwardedRef,
  type ReactElement,
  type RefAttributes,
} from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import classNames from 'classnames';

import {
  composeEditorPlugins,
  type EditorAdapter,
  type EditorHandle,
  type EditorPluginRegistry,
  type EditorProps,
} from '../core/index.js';
import { createLexicalRuntime, lexicalEditorNodes } from '../runtime/lexical.js';
import { useEditorLocaleText } from './locale/loader.ts';

import styles from './index.module.less';

type EditorChangePluginProps<TValue> = {
  adapter: EditorAdapter<TValue>;
  onChange: EditorProps<TValue>['onChange'];
};

const EditorChangePlugin = <TValue,>({ adapter, onChange }: EditorChangePluginProps<TValue>) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!onChange) {
      return undefined;
    }

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        onChange({
          value: adapter.readValue({ runtime: createLexicalRuntime(editor) }),
        });
      });
    });
  }, [adapter, editor, onChange]);

  return null;
};

type EditorValueSyncPluginProps<TValue> = {
  adapter: EditorAdapter<TValue>;
  value: TValue | undefined;
};

const EditorValueSyncPlugin = <TValue,>({ adapter, value }: EditorValueSyncPluginProps<TValue>) => {
  const [editor] = useLexicalComposerContext();
  const previousValue = useRef(value);

  useEffect(() => {
    if (value === undefined || Object.is(previousValue.current, value)) {
      return;
    }

    previousValue.current = value;
    editor.update(() => {
      adapter.applyValue?.({ runtime: createLexicalRuntime(editor), value });
    });
  }, [adapter, editor, value]);

  return null;
};

type EditorEditablePluginProps = {
  editable: boolean;
};

const EditorEditablePlugin = ({ editable }: EditorEditablePluginProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(editable);
  }, [editable, editor]);

  return null;
};

type EditorImperativeHandlePluginProps<TValue> = {
  adapter: EditorAdapter<TValue>;
  forwardedRef: ForwardedRef<EditorHandle<TValue>>;
  registry: EditorPluginRegistry;
};

const EditorImperativeHandlePlugin = <TValue,>({
  adapter,
  forwardedRef,
  registry,
}: EditorImperativeHandlePluginProps<TValue>) => {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    forwardedRef,
    () => ({
      blur: () => {
        editor.getRootElement()?.blur();
      },
      focus: () => {
        editor.getRootElement()?.focus();
        editor.focus();
      },
      getValue: () =>
        editor
          .getEditorState()
          .read(() => adapter.readValue({ runtime: createLexicalRuntime(editor) })),
      insertContent: (content) => {
        editor.update(() => {
          adapter.applyValue?.({ runtime: createLexicalRuntime(editor), value: content });
        });
      },
      runCommand: (command, payload) => {
        const editorCommand = registry.commands.get(command);

        if (!editorCommand) {
          return undefined;
        }

        return editorCommand.run({ registry, runtime: createLexicalRuntime(editor) }, payload);
      },
      setValue: (nextValue) => {
        editor.update(() => {
          adapter.applyValue?.({ runtime: createLexicalRuntime(editor), value: nextValue });
        });
      },
    }),
    [adapter, editor, registry],
  );

  return null;
};

const EditorInner = <TValue,>(
  {
    adapter,
    autoCapitalize,
    autoCorrect,
    className,
    defaultValue,
    disabled = false,
    localeText,
    onChange,
    placeholder,
    plugins = [],
    readOnly = false,
    spellCheck,
    style,
    value,
  }: EditorProps<TValue>,
  forwardedRef: ForwardedRef<EditorHandle<TValue>>,
) => {
  const resolvedLocaleText = useEditorLocaleText(localeText);
  const editable = !disabled && !readOnly;
  const registry = useMemo(() => composeEditorPlugins(plugins), [plugins]);
  const beforeContentPlugins = registry.plugins.filter(
    (plugin) => plugin.slot === 'before-content',
  );
  const afterContentPlugins = registry.plugins.filter((plugin) => plugin.slot === 'after-content');
  const editorNodes = useMemo(
    () => [...new Set([...lexicalEditorNodes, ...registry.nodes])] as InitialConfigType['nodes'],
    [registry.nodes],
  );
  const setupContext = useMemo(
    () => ({ registry, runtime: createLexicalRuntime(null) }),
    [registry],
  );
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      editable,
      namespace: 'DeweyouEditor',
      nodes: editorNodes,
      onError: (error: Error) => {
        throw error;
      },
      editorState: () => {
        adapter.createInitialState({ defaultValue, value });
      },
      theme: {
        root: styles.content,
        paragraph: styles.paragraph,
        heading: {
          h1: styles.heading,
          h2: styles.heading,
          h3: styles.heading,
          h4: styles.heading,
          h5: styles.heading,
          h6: styles.heading,
        },
        quote: styles.blockquote,
        list: {
          ul: styles.list,
          ol: styles.list,
          listitem: styles.listItem,
        },
        link: styles.link,
        table: styles.table,
        tableCell: styles.tableCell,
        tableCellHeader: styles.tableCellHeader,
        tableCellSelected: styles.tableCellSelected,
        tableRow: styles.tableRow,
        tableSelection: styles.tableSelection,
        text: {
          bold: styles.bold,
          code: styles.inlineCode,
          italic: styles.italic,
          strikethrough: styles.strikethrough,
        },
        code: styles.codeBlock,
        codeHighlight: {
          attr: styles.codeTokenAttribute,
          boolean: styles.codeTokenLiteral,
          builtin: styles.codeTokenKeyword,
          cdata: styles.codeTokenComment,
          char: styles.codeTokenString,
          'class-name': styles.codeTokenTitle,
          comment: styles.codeTokenComment,
          constant: styles.codeTokenLiteral,
          deleted: styles.codeTokenString,
          doctype: styles.codeTokenComment,
          function: styles.codeTokenTitle,
          important: styles.codeTokenKeyword,
          inserted: styles.codeTokenString,
          keyword: styles.codeTokenKeyword,
          number: styles.codeTokenLiteral,
          operator: styles.codeTokenKeyword,
          property: styles.codeTokenAttribute,
          punctuation: styles.codeTokenPunctuation,
          regex: styles.codeTokenString,
          selector: styles.codeTokenKeyword,
          string: styles.codeTokenString,
          symbol: styles.codeTokenLiteral,
          tag: styles.codeTokenKeyword,
          url: styles.codeTokenString,
          variable: styles.codeTokenAttribute,
        },
      },
    }),
    [adapter, defaultValue, editable, editorNodes, value],
  );

  return (
    <div
      className={classNames(styles.root, className)}
      data-disabled={disabled ? 'true' : undefined}
      data-editor-root="true"
      data-readonly={readOnly ? 'true' : undefined}
      data-testid="editor-root"
      style={style}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {beforeContentPlugins.map((plugin) => (
          <Fragment key={plugin.name}>{plugin.setup(setupContext)}</Fragment>
        ))}
        <div className={styles.contentFrame} data-editor-content-frame="true">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={placeholder ?? resolvedLocaleText.editor}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                className={styles.contentEditable}
                data-editor-content="true"
                data-editor-size="md"
                data-testid="editor-content"
                role="textbox"
                spellCheck={spellCheck}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
            placeholder={
              placeholder ? <div className={styles.placeholder}>{placeholder}</div> : null
            }
          />
        </div>
        <EditorEditablePlugin editable={editable} />
        <EditorChangePlugin adapter={adapter} onChange={onChange} />
        <EditorValueSyncPlugin adapter={adapter} value={value} />
        <EditorImperativeHandlePlugin
          adapter={adapter}
          forwardedRef={forwardedRef}
          registry={registry}
        />
        {afterContentPlugins.map((plugin) => (
          <Fragment key={plugin.name}>{plugin.setup(setupContext)}</Fragment>
        ))}
      </LexicalComposer>
    </div>
  );
};

export const Editor = forwardRef(EditorInner) as (<TValue>(
  props: EditorProps<TValue> & RefAttributes<EditorHandle<TValue>>,
) => ReactElement | null) & {
  displayName?: string;
};

Editor.displayName = 'Editor';

export type { EditorLocaleText } from './locale/types.ts';
