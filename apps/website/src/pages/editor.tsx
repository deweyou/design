import {
  codePlugin,
  Editor,
  floatingToolbarPlugin,
  headingPlugin,
  historyPlugin,
  keyboardShortcutPlugin,
  linkPlugin,
  listPlugin,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  pastePlugin,
  quotePlugin,
  tablePlugin,
  textFormatPlugin,
  toolbarPlugin,
  formatJsonPreservingDuplicateKeys,
} from '@deweyou-design/editor';
import { Text } from '@deweyou-design/react';

import styles from './editor.module.less';

const editorPlugins = [
  historyPlugin(),
  textFormatPlugin(),
  headingPlugin({ levels: [1, 2, 3] }),
  listPlugin(),
  quotePlugin(),
  linkPlugin(),
  codePlugin({
    format: { formatters: { json: formatJsonPreservingDuplicateKeys } },
    wrap: true,
  }),
  tablePlugin({
    initialTable: {
      cells: [
        ['Feature', 'Plugin', 'Status'],
        ['Tables', 'tablePlugin', 'Visible cells'],
        ['Code blocks', 'codePlugin', 'Language + format'],
      ],
    },
  }),
  toolbarPlugin(),
  floatingToolbarPlugin(),
  markdownShortcutPlugin(),
  keyboardShortcutPlugin(),
  pastePlugin(),
];
const markdownAdapter = markdownEditorAdapter();
const DEFAULT_VALUE = [
  '# Editor',
  '',
  'A focused writing surface with structured text, links, lists, quotes, code blocks, and table commands.',
  '',
  '## Structured blocks',
  '',
  '- Bulleted plugin registry',
  '- Configurable markdown shortcuts',
  '- Storybook interaction coverage',
  '',
  '1. Numbered follow-up',
  '2. Release checklist',
  '',
  '> Editing state is owned by Lexical nodes.',
  '',
  '### Inline formatting',
  '',
  'Use **bold**, *italic*, ~~strikethrough~~, `inline code`, and [Deweyou Design](https://deweyou.com) in one paragraph.',
  '',
  '```json',
  '{"version":"1.0.0","plugins":["toolbar","markdown","link","code","table"]}',
  '```',
].join('\n');

export const EditorPage = () => (
  <main className={styles.page}>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Editor / Full feature</p>
      <h1>Editor</h1>
      <Text className={styles.lead} variant="body">
        A pluggable writing surface for structured content.
      </Text>
    </section>

    <section className={styles.workspace} aria-label="Editor playground">
      <section className={styles.editorPane} aria-label="Editor input">
        <div className={styles.paneHeader}>
          <span>Editor</span>
          <strong>live</strong>
        </div>
        <Editor
          adapter={markdownAdapter}
          autoCapitalize="off"
          autoCorrect="off"
          defaultValue={DEFAULT_VALUE}
          plugins={editorPlugins}
          placeholder="Write a comment..."
          spellCheck={false}
        />
      </section>
    </section>
  </main>
);
