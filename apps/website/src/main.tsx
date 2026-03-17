import React from 'react';
import ReactDOM from 'react-dom/client';

import { FoundationButton } from '@deweyou-ui/components';
import { useThemeMode } from '@deweyou-ui/hooks';
import '@deweyou-ui/styles/theme.css';

import { applyThemeMode, themePreviews } from './counter';
import './style.css';

const ThemeSwitcher = () => {
  const { mode, setMode, toggleMode } = useThemeMode('light');

  return (
    <div aria-label="Theme modes" className="preview-actions">
      {themePreviews.map((preview) => (
        <FoundationButton
          key={preview.mode}
          aria-pressed={mode === preview.mode}
          label={preview.label}
          onClick={() => {
            applyThemeMode(preview.mode);
            setMode(preview.mode);
          }}
          tone={mode === preview.mode ? 'brand' : 'neutral'}
        />
      ))}
      <FoundationButton label="Toggle mode" onClick={toggleMode} />
    </div>
  );
};

const App = () => (
  <main className="shell">
    <section className="hero">
      <p className="eyebrow">UI Monorepo Foundation</p>
      <h1>Package boundaries first. Themes explicit. Docs public.</h1>
      <p className="hero-copy">
        Deweyou UI now separates reusable utilities, hooks, styles, and components from app
        surfaces. Consumers import global styles intentionally, switch Theme modes without
        undocumented behavior, and keep Brand token overrides limited to color.
      </p>
      <div className="hero-actions">
        <FoundationButton label="Installation" />
        <FoundationButton label="Theme modes" tone="neutral" />
      </div>
      <div className="meta">
        <span>apps/website: public guidance</span>
        <span>apps/storybook: internal review</span>
        <span>@deweyou-ui/styles/theme.css: explicit setup</span>
      </div>
    </section>
    <section className="grid" style={{ marginTop: '20px' }}>
      <article className="card">
        <svg aria-hidden="true" className="card-icon">
          <use href="/icons.svg#package" />
        </svg>
        <h2>Installation</h2>
        <p>
          Import <code>@deweyou-ui/styles/theme.css</code> once, then consume components from the
          reusable packages. Global styles remain visible in setup instead of being injected by
          component code.
        </p>
      </article>
      <article className="card">
        <svg aria-hidden="true" className="card-icon">
          <use href="/icons.svg#theme" />
        </svg>
        <h2>Theme modes</h2>
        <p>
          First-class light and dark outputs share the same structural tokens. Only the documented
          public color surface is intended for consumer overrides.
        </p>
      </article>
      <article className="card">
        <svg aria-hidden="true" className="card-icon">
          <use href="/icons.svg#review" />
        </svg>
        <h2>Brand token overrides</h2>
        <p>
          Adjust brand expression with a small set of CSS variables while layout, spacing, radius,
          typography, and motion remain library-owned.
        </p>
      </article>
    </section>
    <section className="layout">
      <div className="preview-panel">
        <h2>Curated preview</h2>
        <p className="preview-note">
          Keyboard reachable controls, semantic headings, and a single component example are enough
          for the foundation baseline.
        </p>
        <div className="preview-stage">
          <ThemeSwitcher />
          <div className="preview-frame">
            <FoundationButton label="Foundation button" />
          </div>
        </div>
      </div>
      <div className="split-panel">
        <h2>Public token surface</h2>
        <div className="token-grid">
          <div>
            <strong>Brand background</strong>
            <code>--ui-color-brand-bg</code>
          </div>
          <div>
            <strong>Brand hover</strong>
            <code>--ui-color-brand-bg-hover</code>
          </div>
          <div>
            <strong>Brand active</strong>
            <code>--ui-color-brand-bg-active</code>
          </div>
          <div>
            <strong>Text on brand</strong>
            <code>--ui-color-text-on-brand</code>
          </div>
          <div>
            <strong>Focus emphasis</strong>
            <code>--ui-color-focus-ring</code>
          </div>
          <div>
            <strong>Link emphasis</strong>
            <code>--ui-color-link</code>
          </div>
        </div>
        <div style={{ marginTop: '18px' }}>
          <div className="brand-swatch">Brand token preview</div>
        </div>
      </div>
    </section>
    <p className="footer-note">
      Storybook remains available for internal review matrices and exploratory states, while the
      website owns official setup and curated examples.
    </p>
  </main>
);

ReactDOM.createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
