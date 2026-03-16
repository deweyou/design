import React from 'react';
import ReactDOM from 'react-dom/client';

import { FoundationButton } from '@deweyou-ui/components';
import { useThemeMode } from '@deweyou-ui/hooks';
import '@deweyou-ui/styles/theme.css';

import { applyThemeMode, themePreviews } from './counter';
import './style.css';

const e = React.createElement;

function ThemeSwitcher() {
  const { mode, setMode, toggleMode } = useThemeMode('light');

  return e(
    'div',
    { className: 'preview-actions', 'aria-label': 'Theme modes' },
    ...themePreviews.map((preview) =>
      e(FoundationButton, {
        key: preview.mode,
        'aria-pressed': mode === preview.mode,
        label: preview.label,
        tone: mode === preview.mode ? 'brand' : 'neutral',
        onClick: () => {
          applyThemeMode(preview.mode);
          setMode(preview.mode);
        },
      }),
    ),
    e(FoundationButton, { label: 'Toggle mode', onClick: toggleMode }),
  );
}

function App() {
  return e(
    'main',
    { className: 'shell' },
    e(
      'section',
      { className: 'hero' },
      e('p', { className: 'eyebrow' }, 'UI Monorepo Foundation'),
      e('h1', null, 'Package boundaries first. Themes explicit. Docs public.'),
      e(
        'p',
        { className: 'hero-copy' },
        'Deweyou UI now separates reusable utilities, hooks, styles, and components from app surfaces. Consumers import global styles intentionally, switch Theme modes without undocumented behavior, and keep Brand token overrides limited to color.',
      ),
      e(
        'div',
        { className: 'hero-actions' },
        e(FoundationButton, { label: 'Installation' }),
        e(FoundationButton, { label: 'Theme modes', tone: 'neutral' }),
      ),
      e(
        'div',
        { className: 'meta' },
        e('span', null, 'apps/website: public guidance'),
        e('span', null, 'apps/storybook: internal review'),
        e('span', null, '@deweyou-ui/styles/theme.css: explicit setup'),
      ),
    ),
    e(
      'section',
      { className: 'grid', style: { marginTop: '20px' } },
      e(
        'article',
        { className: 'card' },
        e(
          'svg',
          { className: 'card-icon', 'aria-hidden': 'true' },
          e('use', { href: '/icons.svg#package' }),
        ),
        e('h2', null, 'Installation'),
        e(
          'p',
          null,
          'Import ',
          e('code', null, '@deweyou-ui/styles/theme.css'),
          ' once, then consume components from the reusable packages. Global styles remain visible in setup instead of being injected by component code.',
        ),
      ),
      e(
        'article',
        { className: 'card' },
        e(
          'svg',
          { className: 'card-icon', 'aria-hidden': 'true' },
          e('use', { href: '/icons.svg#theme' }),
        ),
        e('h2', null, 'Theme modes'),
        e(
          'p',
          null,
          'First-class light and dark outputs share the same structural tokens. Only the documented public color surface is intended for consumer overrides.',
        ),
      ),
      e(
        'article',
        { className: 'card' },
        e(
          'svg',
          { className: 'card-icon', 'aria-hidden': 'true' },
          e('use', { href: '/icons.svg#review' }),
        ),
        e('h2', null, 'Brand token overrides'),
        e(
          'p',
          null,
          'Adjust brand expression with a small set of CSS variables while layout, spacing, radius, typography, and motion remain library-owned.',
        ),
      ),
    ),
    e(
      'section',
      { className: 'layout' },
      e(
        'div',
        { className: 'preview-panel' },
        e('h2', null, 'Curated preview'),
        e(
          'p',
          { className: 'preview-note' },
          'Keyboard reachable controls, semantic headings, and a single component example are enough for the foundation baseline.',
        ),
        e(
          'div',
          { className: 'preview-stage' },
          e(ThemeSwitcher),
          e(
            'div',
            { className: 'preview-frame' },
            e(FoundationButton, { label: 'Foundation button' }),
          ),
        ),
      ),
      e(
        'div',
        { className: 'split-panel' },
        e('h2', null, 'Public token surface'),
        e(
          'div',
          { className: 'token-grid' },
          e(
            'div',
            null,
            e('strong', null, 'Brand background'),
            e('code', null, '--ui-color-brand-bg'),
          ),
          e(
            'div',
            null,
            e('strong', null, 'Brand hover'),
            e('code', null, '--ui-color-brand-bg-hover'),
          ),
          e(
            'div',
            null,
            e('strong', null, 'Brand active'),
            e('code', null, '--ui-color-brand-bg-active'),
          ),
          e(
            'div',
            null,
            e('strong', null, 'Text on brand'),
            e('code', null, '--ui-color-text-on-brand'),
          ),
          e(
            'div',
            null,
            e('strong', null, 'Focus emphasis'),
            e('code', null, '--ui-color-focus-ring'),
          ),
          e('div', null, e('strong', null, 'Link emphasis'), e('code', null, '--ui-color-link')),
        ),
        e(
          'div',
          { style: { marginTop: '18px' } },
          e('div', { className: 'brand-swatch' }, 'Brand token preview'),
        ),
      ),
    ),
    e(
      'p',
      { className: 'footer-note' },
      'Storybook remains available for internal review matrices and exploratory states, while the website owns official setup and curated examples.',
    ),
  );
}

ReactDOM.createRoot(document.querySelector('#app')!).render(e(React.StrictMode, null, e(App)));
