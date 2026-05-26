import { useState } from 'react';

import { IconButton, MermaidRender, Text, Textarea } from '@deweyou-design/react';
import { EditIcon, EyeIcon } from '@deweyou-design/react-icons';

import styles from './markdown-render.module.less';

const DEFAULT_MERMAID = `mindmap
  root((MermaidRender))
    Beautiful
      Flowchart
      Sequence
      Class
    Mindmap
      Deweyou SVG
      Token aligned
    Fallback
      Native Mermaid
      Read-only preview
`;

export const MermaidRenderPage = () => {
  const [mermaid, setMermaid] = useState(DEFAULT_MERMAID);
  const [mobileMode, setMobileMode] = useState<'preview' | 'edit'>('preview');
  const isEditing = mobileMode === 'edit';

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Mermaid · Live Preview</p>
        <h1>Mermaid Render</h1>
        <Text className={styles.lead} variant="body">
          Edit Mermaid source on the left and inspect the rendered Deweyou Design diagram on the
          right.
        </Text>
      </section>

      <section className={styles.workspace} aria-label="Mermaid render playground">
        <section
          aria-label="Mermaid editor"
          className={styles.editorPane}
          data-mobile-active={isEditing ? 'true' : 'false'}
        >
          <div className={styles.paneHeader}>
            <span>Source</span>
            <strong>{mermaid.length} chars</strong>
          </div>
          <Textarea
            aria-label="Mermaid source"
            className={styles.editor}
            label="Mermaid source"
            value={mermaid}
            variant="ghost"
            onChange={(event) => setMermaid(event.target.value)}
          />
        </section>

        <section
          aria-label="Mermaid preview"
          className={styles.previewPane}
          data-mobile-active={isEditing ? 'false' : 'true'}
        >
          <div className={styles.paneHeader}>
            <span>Preview</span>
            <strong>live</strong>
          </div>
          <div className={styles.previewSurface}>
            <MermaidRender value={mermaid} />
          </div>
        </section>
      </section>

      <IconButton
        aria-label={isEditing ? 'Preview rendered mermaid' : 'Edit mermaid source'}
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
