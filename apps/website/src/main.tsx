import React from 'react';
import ReactDOM from 'react-dom/client';

import { Button, IconButton } from '@deweyou-ui/components';
import { useThemeMode } from '@deweyou-ui/hooks';
import { AddIcon } from '@deweyou-ui/icons/add';
import { ChevronRightIcon } from '@deweyou-ui/icons/chevron-right';
import { MenuIcon } from '@deweyou-ui/icons/menu';
import { SearchIcon } from '@deweyou-ui/icons/search';
import '@deweyou-ui/styles/theme.css';

import { applyThemeMode, themePreviews } from './counter';
import { IconGuidance } from './pages/icons';
import './style.css';

const colorOptions = ['neutral', 'primary'] as const;
const sizeOptions = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
const shapeOptions = ['rect', 'rounded', 'pill'] as const;
const typographyTiers = [
  {
    body: '正文层级默认覆盖组件文案、按钮、表单说明与普通数据文本。',
    label: 'Body / 400',
    tierClass: 'typography-tier-body',
  },
  {
    body: '次强调层级适合标签、状态和需要轻度抬升的信息。',
    label: 'Emphasis / 500',
    tierClass: 'typography-tier-emphasis',
  },
  {
    body: '标题层级用于页面标题、卡片标题和较强的信息分区。',
    label: 'Title / 600',
    tierClass: 'typography-tier-title',
  },
  {
    body: '强强调层级用于更突出的标题、统计摘要和关键提示。',
    label: 'Strong / 700',
    tierClass: 'typography-tier-strong',
  },
] as const;
const typographyMixRows = [
  'Typography Contract 2026 / 版本 2.003R / 价格 ¥299.00 / 完成率 97%',
  'Publish changes / 审核剩余 14 分钟 / Build v1.4.0 / Delta +12.8%',
  '订单编号 VC-2026-0318 / 截止 2026-03-22 14:30 / 税率 13%',
] as const;

const supportRows = [
  {
    color: 'neutral by default, primary optional',
    defaultShape: 'rounded',
    example: <Button>Publish changes</Button>,
    feedback: 'Solid hierarchy with monochrome-by-default emphasis',
    shapes: 'rect, rounded, pill',
    variant: 'filled',
  },
  {
    color: 'neutral by default, primary optional',
    defaultShape: 'rounded',
    example: (
      <Button color="primary" variant="outlined">
        Review copy
      </Button>
    ),
    feedback: 'Outlined supporting action with optional accent border',
    shapes: 'rect, rounded, pill',
    variant: 'outlined',
  },
  {
    color: 'neutral by default, primary optional',
    defaultShape: 'N/A',
    example: <Button variant="ghost">Inline toolbar</Button>,
    feedback: 'Background hover feedback that can stay neutral or turn accent',
    shapes: 'Not supported',
    variant: 'ghost',
  },
  {
    color: 'neutral by default, primary optional',
    defaultShape: 'N/A',
    example: (
      <Button color="primary" variant="link">
        Read migration
      </Button>
    ),
    feedback: 'Underline hover feedback with optional accent text and underline',
    shapes: 'Not supported',
    variant: 'link',
  },
] as const;

const ThemeSwitcher = () => {
  const { mode, setMode, toggleMode } = useThemeMode('light');

  return (
    <div aria-label="Theme modes" className="preview-actions">
      {themePreviews.map((preview) => (
        <Button
          key={preview.mode}
          aria-pressed={mode === preview.mode}
          color={mode === preview.mode ? 'primary' : 'neutral'}
          size="small"
          variant={mode === preview.mode ? 'filled' : 'outlined'}
          onClick={() => {
            applyThemeMode(preview.mode);
            setMode(preview.mode);
          }}
        >
          {preview.label}
        </Button>
      ))}
      <Button size="small" variant="ghost" onClick={toggleMode}>
        Toggle mode
      </Button>
    </div>
  );
};

const App = () => (
  <main className="shell">
    <section className="hero">
      <p className="eyebrow">Button Contract</p>
      <h1>One `Button` API, plus explicit `IconButton` and `Button.Icon` entries.</h1>
      <p className="hero-copy">
        Deweyou UI exposes text actions through `Button` and icon-only actions through `IconButton`
        or `Button.Icon`. The public model keeps `variant`, `color`, `size`, and `shape`, then adds
        an explicit `icon` slot so mixed-content buttons do not rely on hidden icon-only heuristics.
      </p>
      <div className="hero-actions">
        <Button>Default neutral</Button>
        <Button color="primary" variant="outlined" shape="pill">
          Accent review
        </Button>
        <Button color="primary" variant="link">
          Read the color note
          <ChevronRightIcon />
        </Button>
      </div>
      <div className="meta">
        <span>@deweyou-ui/components: Button, ButtonProps, IconButton, IconButtonProps</span>
        <span>Storybook: internal review matrix</span>
        <span>Website: public usage guidance</span>
      </div>
    </section>

    <section className="typography-grid">
      <article className="typography-panel">
        <h2>Typography direction</h2>
        <p>
          Deweyou UI now uses a Source Han Serif CN default stack for both body and display text.
          The package keeps the serif direction unified across components, then falls back to
          `Songti SC` / `STSong` on `macOS` and `SimSun` / `NSimSun` on `Windows` when the bundled
          font is not ready.
        </p>
        <div className="typography-card-list">
          {typographyTiers.map((tier) => (
            <article key={tier.label} className="typography-card">
              <span>{tier.label}</span>
              <p className={tier.tierClass}>{tier.body}</p>
            </article>
          ))}
        </div>
      </article>
      <article className="typography-panel">
        <h2>Mixed-script review</h2>
        <div className="typography-card-list">
          {typographyMixRows.map((row) => (
            <article key={row} className="typography-card">
              <p className="typography-tier-body">{row}</p>
            </article>
          ))}
          <article className="typography-card">
            <code className="snippet">{'const buildVersion = "v1.4.0";'}</code>
            <p>
              Code and fixed-width identifiers stay on `--ui-font-mono` as an explicit exception.
            </p>
          </article>
        </div>
      </article>
    </section>

    <section className="grid">
      <article className="card">
        <h2>Unified public API</h2>
        <p>
          The standard text-button path is `Button` and `ButtonProps`. Explicit icon-only actions
          now use `IconButton`, while `Button.Icon` keeps the same runtime contract as an alias.
        </p>
        <code className="snippet">
          {'<Button icon={<SearchIcon />} color="primary" variant="outlined">Search</Button>'}
        </code>
      </article>
      <article className="card">
        <h2>Color modes</h2>
        <p>
          `neutral` is the default across every variant, including `filled`. Set
          `color=&quot;primary&quot;` only when the action should opt into theme accent for fill,
          border, hover, text, or underline.
        </p>
        <div className="button-row">
          <Button>Neutral filled</Button>
          <Button color="primary">Primary filled</Button>
        </div>
      </article>
      <article className="card">
        <h2>Feedback modes</h2>
        <p>
          `ghost` and `link` stay lightweight on purpose. The distinction comes from hover behavior,
          not a second shape system: background feedback for `ghost`, underline feedback for `link`.
        </p>
        <div className="button-row">
          <Button variant="ghost">Ghost action</Button>
          <Button color="primary" variant="link">
            Primary link
          </Button>
        </div>
      </article>
      <article className="card">
        <h2>Explicit icon actions</h2>
        <p>
          Square icon actions are now explicit. Use `IconButton` or `Button.Icon`, and always
          provide `aria-label` or `aria-labelledby`.
        </p>
        <div className="button-row">
          <IconButton aria-label="Add item" icon={<AddIcon />} />
          <Button.Icon aria-label="Open menu" icon={<MenuIcon />} shape="pill" variant="outlined" />
        </div>
      </article>
    </section>

    <section className="layout">
      <div className="preview-panel">
        <h2>Curated preview</h2>
        <p className="preview-note">
          Review neutral defaults, primary accent opt-in, text-button density, explicit icon-button
          entries, and theme switching without relying on any private contract object.
        </p>
        <div className="preview-stage">
          <ThemeSwitcher />
          <div className="preview-frame">
            <div className="button-showcase">
              <div className="button-row">
                <Button>Neutral filled</Button>
                <Button variant="outlined">Review copy</Button>
                <Button variant="ghost">Toolbar action</Button>
                <Button variant="link">Read details</Button>
              </div>
              <div className="button-row">
                <Button color="primary">Primary filled</Button>
                <Button color="primary" variant="outlined">
                  Primary outlined
                </Button>
                <Button color="primary" variant="ghost">
                  Primary ghost
                </Button>
                <Button color="primary" variant="link">
                  Primary link
                </Button>
              </div>
              <div className="button-row">
                <Button color="primary" shape="rect">
                  Rect primary
                </Button>
                <Button color="primary" shape="pill" variant="outlined">
                  Pill secondary
                </Button>
                <Button icon={<SearchIcon />}>Search</Button>
                <IconButton aria-label="Open search" icon={<SearchIcon />} />
                <Button size="extra-small" variant="outlined">
                  This extra-small button stays single-line by default, even when the copy gets
                  verbose.
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="split-panel">
        <h2>Support matrix</h2>
        <div className="button-matrix">
          {supportRows.map((row) => (
            <article key={row.variant} className="matrix-card">
              <div className="matrix-header">
                <strong>{row.variant}</strong>
                {row.example}
              </div>
              <span>{row.feedback}</span>
              <code>Color: {row.color}</code>
              <code>Shapes: {row.shapes}</code>
              <code>Default shape: {row.defaultShape}</code>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="button-guidance-grid">
      <article className="button-panel">
        <h2>Color rules</h2>
        <div className="button-boundary-grid">
          <div className="boundary-card">
            <strong>Default neutral</strong>
            <div className="button-row">
              {colorOptions.slice(0, 1).map((color) => (
                <React.Fragment key={color}>
                  <Button color={color}>Filled</Button>
                  <Button color={color} variant="outlined">
                    Outlined
                  </Button>
                  <Button color={color} variant="ghost">
                    Ghost
                  </Button>
                  <Button color={color} variant="link">
                    Link
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="boundary-card">
            <strong>Primary opt-in</strong>
            <div className="button-row">
              <Button color="primary">Filled</Button>
              <Button color="primary" variant="outlined">
                Outlined
              </Button>
              <Button color="primary" variant="ghost">
                Ghost
              </Button>
              <Button color="primary" variant="link">
                Link
              </Button>
            </div>
          </div>
          <div className="boundary-card">
            <strong>Contract</strong>
            <p>
              `color` defaults to `neutral`. Only `primary` applies theme accent to fill, border,
              hover feedback, text, and underline.
            </p>
          </div>
        </div>
      </article>
      <article className="button-panel">
        <h2>Size scale</h2>
        <div className="button-size-list">
          {sizeOptions.map((size) => (
            <div key={size} className="button-size-row">
              <code>{size}</code>
              <Button size={size} variant="outlined">
                {size} button
              </Button>
            </div>
          ))}
        </div>
      </article>
      <article className="button-panel">
        <h2>Shape rules</h2>
        <div className="button-boundary-grid">
          <div className="boundary-card">
            <strong>`filled`</strong>
            <div className="button-row">
              {shapeOptions.map((shape) => (
                <Button key={shape} shape={shape}>
                  {shape}
                </Button>
              ))}
            </div>
          </div>
          <div className="boundary-card">
            <strong>`outlined`</strong>
            <div className="button-row">
              {shapeOptions.map((shape) => (
                <Button key={shape} shape={shape} variant="outlined">
                  {shape}
                </Button>
              ))}
            </div>
          </div>
          <div className="boundary-card">
            <strong>`ghost` and `link`</strong>
            <p>
              Shape is intentionally unsupported. Invalid combinations throw a descriptive error.
            </p>
          </div>
        </div>
      </article>
      <article className="button-panel">
        <h2>Boundary guidance</h2>
        <div className="button-boundary-grid">
          <div className="boundary-card">
            <strong>Disabled</strong>
            <div className="button-row">
              <Button disabled>Save</Button>
              <Button disabled variant="outlined">
                Review
              </Button>
            </div>
          </div>
          <div className="boundary-card">
            <strong>Focus-visible</strong>
            <p>Use keyboard Tab to inspect the shared focus ring across every supported variant.</p>
          </div>
          <div className="boundary-card">
            <strong>Mode boundaries</strong>
            <code className="snippet">
              Button no longer infers icon-only mode from graphic-only children.
            </code>
          </div>
        </div>
      </article>
    </section>

    <IconGuidance />
    <p className="footer-note">
      Storybook owns the exhaustive review matrix. The website keeps the public guidance concise:
      use `Button` for visible-text actions, use `IconButton` or `Button.Icon` for square icon
      actions, keep `color` neutral by default, and only reach for `shape` with `filled` or
      `outlined`.
    </p>
  </main>
);

ReactDOM.createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
