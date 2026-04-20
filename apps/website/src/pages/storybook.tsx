import styles from './storybook.module.less';

const STORYBOOK_URL = 'https://design-storybook-deweyous-projects.vercel.app';

export const StorybookPage = () => (
  <div className={styles.wrapper}>
    <iframe
      allow="clipboard-write"
      className={styles.frame}
      src={STORYBOOK_URL}
      title="Storybook"
    />
  </div>
);
