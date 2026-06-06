import {
  Editor,
  markdownEditorAdapter,
  markdownShortcutPlugin,
  richTextPlugin,
  toolbarPlugin,
} from '@deweyou-design/editor';
import { Text } from '@deweyou-design/react';

import styles from './editor.module.less';

const editorPlugins = [toolbarPlugin(), richTextPlugin(), markdownShortcutPlugin()];
const markdownAdapter = markdownEditorAdapter();
const DEFAULT_VALUE =
  '# Editor\n\nUse the toolbar or Markdown shortcuts like `#`, `-`, `>`, and `**bold**`.';

export const EditorPage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Editor / WYSIWYG writing</p>
        <h1>Editor</h1>
        <Text className={styles.lead} variant="body">
          Write directly in a rich text surface with a pluggable toolbar and Markdown-oriented
          shortcuts.
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
            defaultValue={DEFAULT_VALUE}
            plugins={editorPlugins}
            placeholder="Write a comment..."
          />
        </section>
      </section>
    </main>
  );
};
