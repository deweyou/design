import { Button, Text } from '@deweyou-design/react';

import styles from './home.module.less';

export const HomePage = () => (
  <main className={styles.page}>
    <HeroSection />
    <DesignSection />
  </main>
);

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className={styles.hero}>
    <div className={styles.container}>
      <p className={styles.heroEyebrow}>Component Library · v1.0</p>
      <Text variant="h1" className={styles.heroTitle}>
        为汉字排印
        <br />
        而生的
        <br />
        组件库
      </Text>
      <div className={styles.heroRule} />
      <Text variant="body" className={styles.heroDesc}>
        基于宋体字形节奏与温暖色系构建，27 个组件覆盖完整 UI 场景。深浅双主题，开箱即用。
      </Text>
      <div className={styles.heroActions}>
        <Button color="neutral" variant="filled">
          查看文档 →
        </Button>
        <Button color="neutral" variant="outlined">
          Storybook ↗
        </Button>
      </div>
      <code className={styles.installCmd}>npm install @deweyou-design/react</code>
    </div>
  </section>
);

// ─── Design & Components ──────────────────────────────────────────────────────

const DesignSection = () => (
  <section className={styles.designSection}>
    <div className={styles.container}>
      <p className={styles.sectionLabel}>Design &amp; Components</p>
      <ColorSubSection />
      <TypographySubSection />
    </div>
  </section>
);

// Color swatches — emerald (brand), red (danger), stone (neutral)
const COLOR_ROWS: Array<{ family: string; steps: number[] }> = [
  { family: 'emerald', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
  { family: 'red', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
  { family: 'stone', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
];

const ColorSubSection = () => (
  <div className={styles.subSection}>
    <p className={styles.subLabel}>Color · 26 色族 · 11 色阶</p>
    {COLOR_ROWS.map(({ family, steps }) => (
      <div key={family} className={styles.colorStrip}>
        {steps.map((step) => (
          <div
            key={step}
            className={styles.colorSwatch}
            style={{ backgroundColor: `var(--ui-color-palette-${family}-${step})` }}
          />
        ))}
      </div>
    ))}
  </div>
);

const TypographySubSection = () => (
  <div className={styles.subSection}>
    <p className={styles.subLabel}>Type · Source Han Serif CN · 4 字重</p>
    <div className={styles.typeStack}>
      <Text variant="h1">标题一 H1</Text>
      <Text variant="h3">标题三 H3</Text>
      <Text variant="body">正文 Body — 清晰易读，适合长文阅读</Text>
      <Text variant="caption">说明 Caption · 辅助信息层级</Text>
    </div>
  </div>
);
