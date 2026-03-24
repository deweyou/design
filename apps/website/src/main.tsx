import React from 'react';
import ReactDOM from 'react-dom/client';

import { Button, IconButton, Text } from '@deweyou-ui/components';
import { useThemeMode } from '@deweyou-ui/hooks';
import { AddIcon } from '@deweyou-ui/icons/add';
import { ChevronRightIcon } from '@deweyou-ui/icons/chevron-right';
import { MenuIcon } from '@deweyou-ui/icons/menu';
import { SearchIcon } from '@deweyou-ui/icons/search';
import '@deweyou-ui/styles/theme.css';

import { applyThemeMode, themePreviews } from './counter';
import { IconGuidance } from './pages/icons';
import './style.css';

const colorOptions = ['neutral', 'primary', 'danger'] as const;
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
const textVariantRows = [
  {
    variant: 'plain',
    label: 'plain',
    node: 'span',
    copy: '支持常见文本层级时，plain 负责默认行内文本。',
  },
  { variant: 'body', label: 'body', node: 'div', copy: 'body 与 plain 同级，但用于块级正文段落。' },
  {
    variant: 'caption',
    label: 'caption',
    node: 'div',
    copy: 'caption 更小、更轻，适合说明和元信息。',
  },
  {
    variant: 'h1',
    label: 'h1',
    node: 'h1',
    copy: 'h1 到 h5 默认渲染为对应的原生标题标签。',
  },
  { variant: 'h2', label: 'h2', node: 'h2', copy: 'h2 适合模块标题和二级层级抬升。' },
  { variant: 'h3', label: 'h3', node: 'h3', copy: 'h3 适合子分组和卡片标题。' },
  { variant: 'h4', label: 'h4', node: 'h4', copy: 'h4 适合作为辅助抬升标题。' },
  { variant: 'h5', label: 'h5', node: 'h5', copy: 'h5 适合更紧凑的信息标题。' },
] as const;
const textDecorationRows = [
  { label: 'italic', props: { italic: true }, copy: '斜体适合轻度语气变化。' },
  { label: 'bold', props: { bold: true }, copy: '加粗适合更明确的强调。' },
  { label: 'underline', props: { underline: true }, copy: '下划线可为重点信息加标记。' },
  { label: 'strikethrough', props: { strikethrough: true }, copy: '删除线适合修订或失效文本。' },
  {
    label: 'combined',
    props: { bold: true, italic: true, strikethrough: true, underline: true },
    copy: '组合样式可以叠加，而不是互相覆盖。',
  },
] as const;
const textPaletteFamilies = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive',
] as const;
const textClampSample =
  'Text 组件在设置 lineClamp 后会保留指定的最大显示行数，并通过省略提示仍有未显示内容；未设置时则保持自然延展。';
const textReadingLead =
  'Palette-backed highlight 让长文里的关键词、数值和中英混排摘要可以共享同一套语义色卡，而不是让消费方自己拼接任意颜色字符串。';

const supportRows = [
  {
    color: 'neutral by default, primary or danger optional',
    defaultShape: 'rounded',
    example: <Button>Publish changes</Button>,
    feedback: 'Solid hierarchy with monochrome-by-default emphasis',
    shapes: 'rect, rounded, pill',
    variant: 'filled',
  },
  {
    color: 'neutral by default, primary or danger optional',
    defaultShape: 'rounded',
    example: (
      <Button color="primary" variant="outlined">
        Review copy
      </Button>
    ),
    feedback:
      'Outlined supporting action with a lower-chroma border that eases into the text color on hover',
    shapes: 'rect, rounded, pill',
    variant: 'outlined',
  },
  {
    color: 'neutral by default, primary or danger optional',
    defaultShape: 'N/A',
    example: (
      <Button color="danger" variant="ghost">
        Destructive helper
      </Button>
    ),
    feedback: 'Background hover feedback can stay neutral, turn accent, or signal destructive work',
    shapes: 'Not supported',
    variant: 'ghost',
  },
  {
    color: 'neutral by default, primary or danger optional',
    defaultShape: 'N/A',
    example: (
      <Button color="danger" variant="link">
        Review deletion policy
      </Button>
    ),
    feedback:
      'Underline hover feedback reveals from left to right by default, while `primary` and `danger` change the semantic emphasis only',
    shapes: 'Not supported',
    variant: 'link',
  },
] as const;

const PublicPropsPreview = () => {
  const [captureCount, setCaptureCount] = React.useState(0);
  const [clickCount, setClickCount] = React.useState(0);
  const [submitCount, setSubmitCount] = React.useState(0);
  const focusTargetRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="button-boundary-grid">
      <div className="boundary-card">
        <strong>Click handlers</strong>
        <div className="button-row">
          <Button
            onClick={() => {
              setClickCount((count) => count + 1);
            }}
            onClickCapture={() => {
              setCaptureCount((count) => count + 1);
            }}
            variant="outlined"
          >
            Trigger handlers
          </Button>
        </div>
        <p>{`capture ${captureCount} / bubble ${clickCount}`}</p>
      </div>
      <div className="boundary-card">
        <strong>Form semantics</strong>
        <form
          className="button-row"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitCount((count) => count + 1);
          }}
        >
          <Button color="primary" htmlType="submit" type="reset">
            Submit with htmlType
          </Button>
          <Button type="reset" variant="ghost">
            Reset form
          </Button>
        </form>
        <p>{`submitted ${submitCount} times. htmlType wins over the native type prop when both are present.`}</p>
      </div>
      <div className="boundary-card">
        <strong>href / target + ref</strong>
        <div className="button-row">
          <Button href="/components/button" target="_blank" variant="ghost">
            Open docs
          </Button>
          <IconButton
            aria-label="Open search metadata preview"
            href="/search"
            icon={<SearchIcon />}
            target="_blank"
            variant="outlined"
          />
          <Button ref={focusTargetRef} variant="outlined">
            Focus target
          </Button>
          <Button
            size="small"
            onClick={() => {
              focusTargetRef.current?.focus();
            }}
          >
            Focus via ref
          </Button>
        </div>
        <p>
          `href` renders a real anchor, `target` requires `href`, and refs resolve to the rendered
          root node.
        </p>
      </div>
    </div>
  );
};

const LoadingGuidancePreview = () => {
  return (
    <div className="button-boundary-grid">
      <div className="boundary-card">
        <strong>Text button loading</strong>
        <div className="button-row">
          <Button loading>Saving changes</Button>
          <Button color="danger" loading>
            Delete item
          </Button>
        </div>
        <p>
          Loading prepends the spinner, keeps the label visible, and blocks repeated activation.
        </p>
      </div>
      <div className="boundary-card">
        <strong>Icon-only loading</strong>
        <div className="button-row">
          <IconButton
            aria-label="Refreshing search results"
            icon={<SearchIcon />}
            loading
            variant="outlined"
          />
          <Button.Icon aria-label="Syncing menu state" icon={<MenuIcon />} loading />
        </div>
        <p>Icon-only actions replace the original icon with the spinner and still need a name.</p>
      </div>
      <div className="boundary-card">
        <strong>Loading + disabled</strong>
        <div className="button-row">
          <Button disabled loading variant="outlined">
            Publishing
          </Button>
          <IconButton
            aria-label="Refreshing disabled action"
            disabled
            icon={<AddIcon />}
            loading
            variant="ghost"
          />
        </div>
        <p>
          Loading keeps the disabled-like visual state without switching to a `not-allowed` cursor.
        </p>
      </div>
    </div>
  );
};

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

const TextComponentPreview = () => {
  return (
    <section className="text-contract-grid">
      <article className="text-panel">
        <h2>Text component</h2>
        <p>
          `Text` 现在负责统一的文本渲染入口，覆盖 `plain`、`body`、`caption` 与 `h1`-`h5`
          这八种层级。标题类 variant 默认直接渲染为原生 `h1`-`h5`，正文和说明文字仍保持 `div`
          根节点。
        </p>
        <div className="text-card-grid">
          {textVariantRows.map((sample) => (
            <article key={sample.label} className="text-card">
              <span>{`${sample.label} / ${sample.node}`}</span>
              <Text variant={sample.variant}>{sample.copy}</Text>
            </article>
          ))}
        </div>
      </article>
      <article className="text-panel">
        <h2>Decoration and emphasis</h2>
        <div className="text-card-grid">
          {textDecorationRows.map((sample) => (
            <article key={sample.label} className="text-card">
              <span>{sample.label}</span>
              <Text variant="body" {...sample.props}>
                {sample.copy}
              </Text>
            </article>
          ))}
        </div>
      </article>
      <article className="text-panel">
        <h2>Palette-backed highlight</h2>
        <p>
          `color` 和 `background` 只接受 26
          色族的合法名称，具体色阶会随主题自动映射。浅色主题使用较深字色与较浅底色，深色主题反转为较浅字色与较深底色。
        </p>
        <div className="text-palette-grid">
          {textPaletteFamilies.map((family) => (
            <article key={family} className="text-card">
              <span>{family}</span>
              <Text background={family} bold color={family} variant="body">
                {`26 色族 / ${family} / Build v1.4.0 / ¥299.00`}
              </Text>
            </article>
          ))}
        </div>
      </article>
      <article className="text-panel">
        <h2>Long copy and native heading roots</h2>
        <div className="text-card-grid">
          <article className="text-card">
            <span>Unclamped body</span>
            <Text variant="body">{textClampSample}</Text>
          </article>
          <article className="text-card">
            <span>lineClamp</span>
            <Text lineClamp={2} variant="body">
              {textClampSample}
            </Text>
          </article>
          <article className="text-card">
            <span>Native heading</span>
            <Text className="text-prop-sample" data-slot="help-copy" variant="h2">
              标题 variant 会直接落到原生 heading 节点。
            </Text>
          </article>
        </div>
        <div className="text-reading-surface">
          <Text variant="h2">Reading surface</Text>
          <Text lineClamp={3} variant="body">
            {textReadingLead}
          </Text>
          <div className="text-reading-section">
            <Text variant="body">
              在一段连续正文里，
              <Text background="amber" bold color="amber" style={{ display: 'inline' }}>
                重点摘要
              </Text>
              、
              <Text color="violet" italic style={{ display: 'inline' }}>
                语气变化
              </Text>
              和
              <Text underline style={{ display: 'inline' }}>
                数据引用
              </Text>
              应该可以自然组合。
            </Text>
            <Text variant="caption">
              支持 mixed script：Q2 revenue +18.6% / 审核完成率 97% / 截止 2026-03-31。
            </Text>
          </div>
        </div>
      </article>
    </section>
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
        an explicit `icon` slot plus `htmlType`, `href`, `target`, `loading`, and ref-forwarding so
        common button semantics stay on the documented API surface.
      </p>
      <div className="hero-actions">
        <Button>Default neutral</Button>
        <Button color="primary" variant="outlined" shape="pill">
          Accent review
        </Button>
        <Button color="danger" loading>
          Delete record
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

    <TextComponentPreview />

    <section className="grid">
      <article className="card">
        <h2>Unified public API</h2>
        <p>
          The standard text-button path is `Button` and `ButtonProps`. Explicit icon-only actions
          now use `IconButton`, while `Button.Icon` keeps the same runtime contract as an alias and
          shares the same ref-forwarding target.
        </p>
        <code className="snippet">
          {'<Button icon={<SearchIcon />} color="primary" variant="outlined">Search</Button>'}
        </code>
      </article>
      <article className="card">
        <h2>Color modes</h2>
        <p>
          `neutral` is the default across every variant, including `filled`. Set
          `color=&quot;primary&quot;` for accent emphasis, or `color=&quot;danger&quot;` when the
          action is destructive but should keep the same variant semantics.
        </p>
        <div className="button-row">
          <Button>Neutral filled</Button>
          <Button color="primary">Primary filled</Button>
          <Button color="danger">Danger filled</Button>
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
          Review neutral defaults, semantic color opt-in, loading feedback, explicit icon-button
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
                <Button color="danger">Danger filled</Button>
                <Button color="danger" variant="outlined">
                  Danger outlined
                </Button>
                <Button color="danger" loading variant="ghost">
                  Deleting
                </Button>
                <IconButton aria-label="Refreshing search" icon={<SearchIcon />} loading />
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
            <strong>Danger emphasis</strong>
            <div className="button-row">
              <Button color="danger">Filled</Button>
              <Button color="danger" variant="outlined">
                Outlined
              </Button>
              <Button color="danger" variant="ghost">
                Ghost
              </Button>
              <Button color="danger" variant="link">
                Link
              </Button>
            </div>
          </div>
          <div className="boundary-card">
            <strong>Contract</strong>
            <p>
              `color` defaults to `neutral`. `primary` applies accent emphasis; `danger` keeps the
              same interaction model but signals destructive intent.
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
        <h2>Hover feedback</h2>
        <div className="motion-comparison-grid">
          <div className="boundary-card">
            <strong>Link underline reveal</strong>
            <div className="button-row">
              <Button variant="link">Neutral link</Button>
              <Button color="primary" variant="link">
                Primary link
              </Button>
              <Button size="extra-small" variant="link">
                Compact link
              </Button>
            </div>
            <p>`link` 默认就是从左到右展开的下划线反馈，不再区分 fallback 和 opt-in 两套行为。</p>
          </div>
          <div className="boundary-card">
            <strong>Outlined border transition</strong>
            <div className="button-row">
              <Button variant="outlined">Neutral outlined</Button>
              <Button color="primary" variant="outlined">
                Primary outlined
              </Button>
              <Button color="primary" shape="pill" variant="outlined">
                Primary pill
              </Button>
            </div>
            <p>
              `outlined` 不再叠加额外描边层。默认边框保持更低色度，hover
              时平滑过渡到与文字一致的颜色。
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
      <article className="button-panel">
        <h2>Public prop passthrough</h2>
        <PublicPropsPreview />
      </article>
      <article className="button-panel">
        <h2>Loading guidance</h2>
        <LoadingGuidancePreview />
      </article>
    </section>

    <IconGuidance />
    <p className="footer-note">
      Storybook owns the exhaustive review matrix. The website keeps the public guidance concise:
      use `Button` for visible-text actions, use `IconButton` or `Button.Icon` for square icon
      actions, keep `color` neutral by default, use `danger` only for destructive actions, keep
      `loading` as a temporary processing state, treat `htmlType` as the documented form-semantic
      entry, and remember that `href` switches the root to an anchor while refs always follow the
      rendered root node.
    </p>
  </main>
);

ReactDOM.createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
