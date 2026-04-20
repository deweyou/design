import { Button, Text } from '@deweyou-design/react';

import styles from './home.module.less';

export const HomePage = () => (
  <main className={styles.page}>
    <HeroSection />
  </main>
);

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
