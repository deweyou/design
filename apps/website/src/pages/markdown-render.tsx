import { useState } from 'react';

import { IconButton, MarkdownRender, Text, Textarea } from '@deweyou-design/react';
import { EditIcon, EyeIcon } from '@deweyou-design/react-icons';

import styles from './markdown-render.module.less';

const DEFAULT_MARKDOWN = `# Release note

Deweyou Design renders Markdown with editorial spacing, readable CJK-friendly typography, and product UI details.

## What it covers

- Headings with clear hierarchy
- Lists that keep dense notes scannable
- **Strong text**, _emphasis_, and \`Inline code\`
- [Documentation links](https://github.com/deweyou/design)

> Markdown surfaces should feel like a polished product view, not a raw parser output.

### Checklist

- [x] Render GitHub-flavored Markdown
- [x] Highlight code blocks
- [ ] Tune copy for your product voice

| Token | Role |
| --- | --- |
| \`--ui-font-content\` | Reading surfaces |
| \`--ui-color-border\` | Table and quote rhythm |

\`\`\`tsx
import { MarkdownRender } from '@deweyou-design/react';

export const Preview = () => (
  <MarkdownRender value={markdown} />
);
\`\`\`
`;

export const MarkdownRenderPage = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [mobileMode, setMobileMode] = useState<'preview' | 'edit'>('preview');
  const isEditing = mobileMode === 'edit';

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Markdown · Live Preview</p>
        <h1>Markdown Render</h1>
        <Text className={styles.lead} variant="body">
          Edit Markdown on the left and inspect the rendered Deweyou Design surface on the right.
        </Text>
      </section>

      <section className={styles.workspace} aria-label="Markdown render playground">
        <section
          aria-label="Markdown editor"
          className={styles.editorPane}
          data-mobile-active={isEditing ? 'true' : 'false'}
        >
          <div className={styles.paneHeader}>
            <span>Source</span>
            <strong>{markdown.length} chars</strong>
          </div>
          <Textarea
            aria-label="Markdown source"
            className={styles.editor}
            label="Markdown source"
            value={markdown}
            variant="ghost"
            onChange={(event) => setMarkdown(event.target.value)}
          />
        </section>

        <section
          aria-label="Markdown preview"
          className={styles.previewPane}
          data-mobile-active={isEditing ? 'false' : 'true'}
        >
          <div className={styles.paneHeader}>
            <span>Preview</span>
            <strong>live</strong>
          </div>
          <div className={styles.previewSurface}>
            <MarkdownRender value={markdown} />
          </div>
        </section>
      </section>

      <IconButton
        aria-label={isEditing ? 'Preview rendered markdown' : 'Edit markdown source'}
        className={styles.mobileToggle}
        icon={isEditing ? <EyeIcon /> : <EditIcon />}
        shape="pill"
        size="lg"
        variant="filled"
        onClick={() => setMobileMode(isEditing ? 'preview' : 'edit')}
      />
    </main>
  );
};
