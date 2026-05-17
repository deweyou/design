import { CodeBlock, Text } from '@deweyou-design/react';

import styles from './fonts.module.less';

const FONT_ROLES = [
  {
    body: 'Source Han Sans SC keeps dense controls legible without losing the CJK rhythm.',
    meta: 'body · control',
    sample: '按钮 输入 导航 Tooltip',
    title: 'Control Sans',
  },
  {
    body: 'Source Han Serif CN remains the editorial voice for Markdown, Text, and display copy.',
    meta: 'content · display',
    sample: '设计系统 文字排版 内容阅读',
    title: 'Content Serif',
  },
] as const;

const LOADING_STEPS = [
  ['01', 'theme.css', 'Defines tokens and platform fallback stacks without forcing font files.'],
  ['02', 'fontSubset', 'Scans product copy and emits small first-paint woff2 subset assets.'],
  ['03', "fullFonts: 'idle'", 'Optionally loads stable full font files after the page is idle.'],
  ['04', 'browser cache', 'Versioned full-font URLs can be cached for repeat visits.'],
] as const;

export const FontsPage = () => (
  <main className={styles.page}>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Typography · Loading Strategy</p>
      <h1>Fonts</h1>
      <Text className={styles.lead} variant="body">
        Deweyou Design now uses sans-serif for operational UI and serif for content surfaces. Font
        subset keeps first paint small; idle full-font loading is an explicit fallback for dynamic
        text.
      </Text>
    </section>

    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <span>01</span>
        <h2>Roles</h2>
        <p>control · content</p>
      </header>
      <div className={styles.roleGrid}>
        {FONT_ROLES.map((role) => (
          <article key={role.title}>
            <span>{role.meta}</span>
            <h3>{role.title}</h3>
            <p>{role.body}</p>
            <strong>{role.sample}</strong>
          </article>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <span>02</span>
        <h2>Loading</h2>
        <p>subset · idle full fonts</p>
      </header>
      <div className={styles.loadingGrid}>
        {LOADING_STEPS.map(([number, title, body]) => (
          <article key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <span>03</span>
        <h2>Usage</h2>
        <p>explicit by default</p>
      </header>
      <div className={styles.codeBlock}>
        <CodeBlock language="ts">{`import { fontSubset } from '@deweyou-design/styles/unplugin-font-subset';

export default {
  plugins: [
    fontSubset.vite({
      scan: { include: ['src/**/*.{ts,tsx,md,mdx}'] },
      inject: true,
      fullFonts: 'idle',
    }),
  ],
};`}</CodeBlock>
        <Text variant="body">
          With `inject: true`, the plugin injects the subset CSS immediately and the idle full-font
          loader only when `fullFonts` is enabled.
        </Text>
      </div>
    </section>
  </main>
);
