import { Fragment, useEffect, useMemo, useRef } from 'react';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import classNames from 'classnames';

import { composeEditorPlugins, type EditorAdapter, type EditorProps } from '../core/index.js';
import { createLexicalRuntime, lexicalEditorNodes } from '../runtime/lexical.js';

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

export const Editor = <TValue,>({
  adapter,
  className,
  defaultValue,
  disabled = false,
  onChange,
  placeholder,
  plugins = [],
  readOnly = false,
  style,
  value,
}: EditorProps<TValue>) => {
  const editable = !disabled && !readOnly;
  const composedPlugins = useMemo(() => composeEditorPlugins(plugins), [plugins]);
  const beforeContentPlugins = composedPlugins.filter((plugin) => plugin.slot === 'before-content');
  const afterContentPlugins = composedPlugins.filter((plugin) => plugin.slot === 'after-content');
  const initialConfig = useMemo(
    () => ({
      editable,
      namespace: 'DeweyouEditor',
      nodes: lexicalEditorNodes,
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
    [adapter, defaultValue, editable, value],
  );
  const runtime = createLexicalRuntime(null);

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
          <Fragment key={plugin.name}>{plugin.setup({ runtime })}</Fragment>
        ))}
        <div className={styles.contentFrame} data-editor-content-frame="true">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={placeholder ?? 'Editor'}
                className={styles.contentEditable}
                data-editor-content="true"
                data-editor-size="md"
                data-testid="editor-content"
                role="textbox"
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
        {afterContentPlugins.map((plugin) => (
          <Fragment key={plugin.name}>{plugin.setup({ runtime })}</Fragment>
        ))}
      </LexicalComposer>
    </div>
  );
};

Editor.displayName = 'Editor';
