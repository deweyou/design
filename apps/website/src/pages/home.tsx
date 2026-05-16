import type { MouseEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Text } from '@deweyou-design/react';
import { ArrowRightIcon, ExternalLinkIcon, LogoGithubIcon } from '@deweyou-design/react-icons';

import styles from './home.module.less';

const PRINCIPLES = [
  ['Serif Identity', 'Serif type is the interface signature across body and display text.'],
  ['Semantic Color', 'Components expose neutral, primary, and danger before decorative palettes.'],
  ['Line Before Shadow', 'Borders and spacing carry structure; shadow is reserved for elevation.'],
  [
    'Typographic Precision',
    'The system reads through glyphs, line height, spacing, and restrained green.',
  ],
] as const;

const SEMANTIC_COLORS = [
  ['neutral', 'text, border, surface'],
  ['primary', 'brand action, focus, selected'],
  ['danger', 'destructive action, error'],
] as const;

const SEMANTIC_SWATCHES = {
  danger: [
    'var(--ui-color-danger-bg-hover)',
    'var(--ui-color-danger-bg)',
    'var(--ui-color-danger-text)',
  ],
  neutral: ['var(--ui-color-surface)', 'var(--ui-color-border)', 'var(--ui-color-text)'],
  primary: [
    'var(--ui-color-brand-bg-hover)',
    'var(--ui-color-brand-bg)',
    'var(--ui-color-brand-text)',
  ],
} as const;

export const HomePage = () => {
  const navigate = useNavigate();

  const handleComponentsClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    navigate('/components');
  };

  return (
    <main className={styles.page}>
      <section className={styles.cover}>
        <p className={styles.eyebrow}>Component Library · Design Manual</p>
        <h1>Deweyou Design</h1>
        <Text className={styles.lead} variant="body">
          A serif-led React component library with crisp lines, quiet light and dark themes, and a
          small semantic color model limited to neutral, primary, and danger.
        </Text>
        <div className={styles.coverActions}>
          <Button
            href="/components"
            icon={<ArrowRightIcon aria-hidden size="xs" />}
            variant="outlined"
            onClick={handleComponentsClick}
          >
            Browse components
          </Button>
          <Button
            href="https://design-storybook-deweyous-projects.vercel.app"
            icon={<ExternalLinkIcon aria-hidden size="xs" />}
            rel="noopener noreferrer"
            size="md"
            target="_blank"
            variant="outlined"
          >
            Storybook
          </Button>
        </div>
      </section>

      <SpecSection meta="install · import · links" number="01" title="Get Started">
        <div className={styles.startBody}>
          <div className={styles.startGrid}>
            <code>npm i @deweyou-design/react @deweyou-design/styles</code>
            <code>import '@deweyou-design/styles/theme.css';</code>
            <code>import {'{ Button, Input }'} from '@deweyou-design/react';</code>
          </div>
          <nav className={styles.startLinks} aria-label="Get started resources">
            <Button
              href="/components"
              icon={<ArrowRightIcon aria-hidden size="xs" />}
              variant="link"
              onClick={handleComponentsClick}
            >
              Components
            </Button>
            <Button
              href="https://design-storybook-deweyous-projects.vercel.app"
              icon={<ExternalLinkIcon aria-hidden size="xs" />}
              rel="noopener noreferrer"
              target="_blank"
              variant="link"
            >
              Storybook
            </Button>
            <Button
              href="https://github.com/deweyou/design"
              icon={<LogoGithubIcon aria-hidden size="xs" />}
              rel="noopener noreferrer"
              target="_blank"
              variant="link"
            >
              GitHub
            </Button>
          </nav>
        </div>
      </SpecSection>

      <SpecSection meta="identity · semantics · restraint" number="02" title="Principles">
        <div className={styles.principleGrid}>
          {PRINCIPLES.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </SpecSection>

      <SpecSection meta="neutral · primary · danger" number="03" title="Color Semantics">
        <div className={styles.semanticGrid}>
          {SEMANTIC_COLORS.map(([name, usage]) => (
            <article key={name}>
              <div className={styles.semanticSwatches}>
                {SEMANTIC_SWATCHES[name].map((backgroundColor) => (
                  <span key={backgroundColor} style={{ backgroundColor }} />
                ))}
              </div>
              <h3>{name}</h3>
              <p>{usage}</p>
            </article>
          ))}
        </div>
      </SpecSection>

      <SpecSection meta="source han serif cn · subset loading" number="04" title="Typography">
        <div className={styles.typeSpec}>
          <Text variant="h1">Design System</Text>
          <Text variant="h3">Serif is interface identity, not decoration.</Text>
          <Text variant="body">
            Website uses a font subset path so the design language stays faithful without loading
            full original font files on first paint.
          </Text>
        </div>
      </SpecSection>
    </main>
  );
};

type SpecSectionProps = {
  children: ReactNode;
  meta: string;
  number: string;
  title: string;
};

const SpecSection = ({ children, meta, number, title }: SpecSectionProps) => (
  <section className={styles.section}>
    <header className={styles.sectionHead}>
      <span>{number}</span>
      <h2>{title}</h2>
      <p>{meta}</p>
    </header>
    <div className={styles.sectionBody}>{children}</div>
  </section>
);
