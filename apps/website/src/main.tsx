import React from 'react';
import ReactDOM from 'react-dom/client';

import {
  Button,
  ContextMenu,
  IconButton,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerItem,
  Popover,
  TabContent,
  TabList,
  Tabs,
  TabTrigger,
  Text,
} from '@deweyou-design/react';
import { useThemeMode } from '@deweyou-design/react-hooks';
import { ChevronRightIcon, Menu2Icon, PlusIcon, SearchIcon } from '@deweyou-design/react-icons';
import '@deweyou-design/styles/theme.css';
import { colorFamilyNames } from '@deweyou-design/styles';

import { applyThemeMode, themePreviews } from './counter';
import { IconGuidance } from './pages/icons';
import './style.css';

const colorOptions = ['neutral', 'primary', 'danger'] as const;
const sizeOptions = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const shapeOptions = ['rect', 'float', 'pill'] as const;
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
const textPaletteFamilies = colorFamilyNames;
const colorFoundationPreviewFamilies = colorFamilyNames.slice(0, 8);
const colorFoundationPreviewSteps = ['50', '500', '950'] as const;
const semanticColorRows = [
  {
    description: 'primary Button、品牌强调和重点 CTA 统一消费这组主题色。',
    label: 'brand',
    token: '--ui-color-brand-bg',
  },
  {
    description: 'danger Button、破坏性提醒和相关文本统一消费这组主题色。',
    label: 'danger',
    token: '--ui-color-danger-bg',
  },
  {
    description: '链接与焦点环保持统一语义，不允许组件层私自扩张颜色轴。',
    label: 'link / focus',
    token: '--ui-color-link',
  },
  {
    description: 'surface、canvas、text、border 属于基础主题层，供所有消费方共享。',
    label: 'surface system',
    token: '--ui-color-surface',
  },
] as const;
const textClampSample =
  'Text 组件在设置 lineClamp 后会保留指定的最大显示行数，并通过省略提示仍有未显示内容；未设置时则保持自然延展。';
const textReadingLead =
  'Palette-backed highlight 让长文里的关键词、数值和中英混排摘要可以共享同一套语义色卡，而不是让消费方自己拼接任意颜色字符串。';
const governanceNotes = [
  'packages 默认复用 Vite+ 统一构建约定，只有公开产物确有需要时才保留例外配置。',
  '仓库自有 AGENTS.md 正文统一使用简体中文，第三方依赖目录中的同名文件不在治理范围内。',
] as const;

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
            size="sm"
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

const GovernancePreview = () => {
  return (
    <div className="boundary-card">
      <strong>Build governance</strong>
      <ul>
        {governanceNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
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
          <Button.Icon aria-label="Syncing menu state" icon={<Menu2Icon />} loading />
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
            icon={<PlusIcon />}
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
          size="sm"
          variant={mode === preview.mode ? 'filled' : 'outlined'}
          onClick={() => {
            applyThemeMode(preview.mode);
            setMode(preview.mode);
          }}
        >
          {preview.label}
        </Button>
      ))}
      <Button size="sm" variant="ghost" onClick={toggleMode}>
        Toggle mode
      </Button>
    </div>
  );
};

const ColorFoundationPreview = () => {
  return (
    <section className="color-grid">
      <article className="color-panel">
        <h2>Color foundation</h2>
        <p>
          所有颜色依赖先回到 `@deweyou-design/styles` 的共享基础色卡：26 个颜色家族、11
          个色阶，再加上纯黑白。 `Button`、`Text`
          和后续组件都优先复用这套颜色事实来源，非必要不得新增特化 token。
        </p>
        <div className="color-family-grid">
          {colorFoundationPreviewFamilies.map((family) => (
            <article key={family} className="color-family-card">
              <span>{family}</span>
              <div className="color-step-row">
                {colorFoundationPreviewSteps.map((step) => (
                  <div
                    key={step}
                    className="color-swatch"
                    style={{ background: `var(--ui-color-palette-${family}-${step})` }}
                  >
                    <code>{step}</code>
                  </div>
                ))}
              </div>
              <code className="color-meta">{`--ui-color-palette-${family}-*`}</code>
            </article>
          ))}
        </div>
      </article>
      <article className="color-panel">
        <h2>Governed semantic colors</h2>
        <p>
          现有主题色同样受统一治理。品牌色、危险色、链接色和焦点色都必须能追溯到共享基础色卡或纯黑白，不再允许组件自己扩展特化颜色。
        </p>
        <div className="semantic-color-grid">
          {semanticColorRows.map((row) => (
            <article key={row.label} className="semantic-color-card">
              <div
                aria-hidden="true"
                className="semantic-color-swatch"
                style={{ background: `var(${row.token})` }}
              />
              <strong>{row.label}</strong>
              <code>{row.token}</code>
              <p>{row.description}</p>
            </article>
          ))}
        </div>
        <div className="button-row">
          <Button color="primary">Shared primary</Button>
          <Button color="danger" variant="outlined">
            Shared danger
          </Button>
          <Text background="emerald" bold color="emerald" variant="body">
            Shared Text highlight
          </Text>
        </div>
      </article>
    </section>
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

const PopoverComponentPreview = () => {
  const [controlledVisible, setControlledVisible] = React.useState(false);
  const [placement, setPlacement] = React.useState<'top' | 'bottom' | 'right-bottom'>(
    'right-bottom',
  );
  const portalContainerRef = React.useRef<HTMLDivElement>(null);

  return (
    <section className="button-guidance-grid">
      <article className="button-panel">
        <h2>Popover component</h2>
        <p>
          `Popover` 是新的基础浮层入口。它默认用 `click` 打开，保持非模态，不会把焦点困在面板里；
          同时支持受控状态、位置回退、自定义挂载容器和交互型内容。
        </p>
        <div className="button-boundary-grid">
          <div className="boundary-card">
            <strong>Default click</strong>
            <div className="button-row">
              <Popover
                content={
                  <div className="popover-copy">
                    <strong>Review summary</strong>
                    <p>默认卡片带 border、shadow、arrow，并会在外部点击或 `Escape` 时关闭。</p>
                  </div>
                }
              >
                <Button variant="outlined">Open summary</Button>
              </Popover>
            </div>
          </div>
          <div className="boundary-card">
            <strong>Controlled + pure mode</strong>
            <div className="button-row">
              <Popover
                content={
                  <div className="popover-copy popover-copy-plain">
                    <Text bold variant="body">
                      Controlled content
                    </Text>
                    <Text color="slate" variant="caption">
                      面板内点击默认保持打开；这里用显式动作关闭。
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setControlledVisible(false);
                      }}
                    >
                      Close popover
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setControlledVisible(true);
                      }}
                    >
                      Keep open
                    </Button>
                  </div>
                }
                mode="pure"
                onVisibleChange={(nextVisible, details) => {
                  if (nextVisible || details.reason === 'explicit-action') {
                    setControlledVisible(nextVisible);
                  }
                }}
                shape="rounded"
                visible={controlledVisible}
              >
                <Button color="primary">
                  {controlledVisible ? 'Popover open' : 'Open controlled'}
                </Button>
              </Popover>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setControlledVisible((value) => !value);
                }}
              >
                Toggle state
              </Button>
            </div>
          </div>
          <div className="boundary-card">
            <strong>Placement + custom portal</strong>
            <div className="button-row">
              {(['top', 'bottom', 'right-bottom'] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={placement === option ? 'filled' : 'outlined'}
                  onClick={() => {
                    setPlacement(option);
                  }}
                >
                  {option}
                </Button>
              ))}
            </div>
            <div ref={portalContainerRef} className="popover-portal-shell">
              <Popover
                boundaryPadding={24}
                content={
                  <div className="popover-copy">
                    <strong>Portal container</strong>
                    <p>这个浮层挂到局部容器里，同时仍然保留位置回退和安全边距。</p>
                  </div>
                }
                mode="loose"
                placement={placement}
                popupPortalContainer={portalContainerRef.current ?? undefined}
                trigger={['click', 'focus']}
              >
                <Button>Open in review box</Button>
              </Popover>
            </div>
          </div>
          <div className="boundary-card">
            <strong>Interactive content + disabled</strong>
            <div className="button-row">
              <Popover
                content={
                  <div className="popover-copy">
                    <Text bold variant="body">
                      Quick action
                    </Text>
                    <input
                      aria-label="Quick action note"
                      className="popover-input"
                      placeholder="Focus should keep popover open"
                    />
                    <div className="button-row">
                      <Button size="sm">Apply</Button>
                      <Button size="sm" variant="ghost">
                        Keep open
                      </Button>
                    </div>
                  </div>
                }
                trigger={['click', 'focus']}
              >
                <Button icon={<SearchIcon />}>Interactive popover</Button>
              </Popover>
              <Popover content={<span>Disabled popover should never open.</span>} disabled>
                <Button disabled variant="outlined">
                  Disabled trigger
                </Button>
              </Popover>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

const MenuComponentPreview = () => {
  const [radioValue, setRadioValue] = React.useState('grid');
  const [sidebarChecked, setSidebarChecked] = React.useState(true);
  const [toolbarChecked, setToolbarChecked] = React.useState(false);

  return (
    <section className="button-guidance-grid">
      <article className="button-panel">
        <h2>Menu component</h2>
        <p>
          `Menu` 基于 Ark UI
          构建，支持普通菜单项、分组、分割线、多级子菜单、单选、多选，以及右键菜单（ContextMenu）。
        </p>
        <div className="button-boundary-grid">
          <div className="boundary-card">
            <strong>基础菜单</strong>
            <div className="button-row">
              <Menu>
                <MenuTrigger>
                  <Button variant="outlined">打开菜单</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="new">新建文件</MenuItem>
                  <MenuItem value="open">打开文件</MenuItem>
                  <MenuItem value="save">保存</MenuItem>
                  <MenuSeparator />
                  <MenuItem value="delete" disabled>
                    删除（禁用）
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>分组与分割线</strong>
            <div className="button-row">
              <Menu>
                <MenuTrigger>
                  <Button variant="outlined">文件操作</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuGroup label="创建">
                    <MenuItem value="new-file">新建文件</MenuItem>
                    <MenuItem value="new-folder">新建文件夹</MenuItem>
                  </MenuGroup>
                  <MenuSeparator />
                  <MenuGroup label="编辑">
                    <MenuItem value="cut">剪切</MenuItem>
                    <MenuItem value="copy">复制</MenuItem>
                    <MenuItem value="paste">粘贴</MenuItem>
                  </MenuGroup>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>二级子菜单</strong>
            <div className="button-row">
              <Menu>
                <MenuTrigger>
                  <Button variant="outlined">更多选项</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="undo">撤销</MenuItem>
                  <Menu>
                    <MenuTriggerItem>导出为</MenuTriggerItem>
                    <MenuContent>
                      <MenuItem value="export-pdf">PDF</MenuItem>
                      <MenuItem value="export-png">PNG</MenuItem>
                      <MenuItem value="export-svg">SVG</MenuItem>
                    </MenuContent>
                  </Menu>
                  <MenuItem value="redo">重做</MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>单选（RadioGroup）</strong>
            <div className="button-row">
              <Menu closeOnSelect={false}>
                <MenuTrigger>
                  <Button variant="outlined">
                    视图：{radioValue === 'grid' ? '网格' : '列表'}
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuRadioGroup
                    value={radioValue}
                    onValueChange={({ value }) => {
                      setRadioValue(value);
                    }}
                  >
                    <MenuRadioItem value="list">列表视图</MenuRadioItem>
                    <MenuRadioItem value="grid">网格视图</MenuRadioItem>
                  </MenuRadioGroup>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>多选（CheckboxItem）</strong>
            <div className="button-row">
              <Menu closeOnSelect={false}>
                <MenuTrigger>
                  <Button variant="outlined">面板显示</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuCheckboxItem
                    checked={sidebarChecked}
                    value="sidebar"
                    onCheckedChange={({ checked }) => {
                      setSidebarChecked(checked);
                    }}
                  >
                    侧边栏
                  </MenuCheckboxItem>
                  <MenuCheckboxItem
                    checked={toolbarChecked}
                    value="toolbar"
                    onCheckedChange={({ checked }) => {
                      setToolbarChecked(checked);
                    }}
                  >
                    工具栏
                  </MenuCheckboxItem>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>禁用项</strong>
            <div className="button-row">
              <Menu>
                <MenuTrigger>
                  <Button variant="outlined">操作菜单</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="view">查看</MenuItem>
                  <MenuItem value="edit">编辑</MenuItem>
                  <MenuItem value="share" disabled>
                    分享（无权限）
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem value="delete" disabled>
                    删除（禁用）
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>右键菜单（ContextMenu）</strong>
            <ContextMenu>
              <ContextMenu.Trigger>
                <div
                  style={{
                    border: '1px dashed var(--ui-color-border)',
                    borderRadius: '0.4rem',
                    color: 'var(--ui-color-text)',
                    cursor: 'context-menu',
                    fontSize: '0.875rem',
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                  }}
                >
                  在此区域右键点击
                </div>
              </ContextMenu.Trigger>
              <ContextMenu.Content>
                <MenuItem value="cut">剪切</MenuItem>
                <MenuItem value="copy">复制</MenuItem>
                <MenuItem value="paste">粘贴</MenuItem>
                <MenuSeparator />
                <MenuItem value="properties">属性</MenuItem>
              </ContextMenu.Content>
            </ContextMenu>
          </div>
          <div className="boundary-card">
            <strong>尺寸（size）</strong>
            <div className="button-row">
              <Menu size="sm">
                <MenuTrigger>
                  <Button size="sm" variant="outlined">
                    sm
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="a">选项 A</MenuItem>
                  <MenuItem value="b">选项 B</MenuItem>
                  <MenuItem value="c">选项 C</MenuItem>
                </MenuContent>
              </Menu>
              <Menu size="md">
                <MenuTrigger>
                  <Button size="sm" variant="outlined">
                    md
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="a">选项 A</MenuItem>
                  <MenuItem value="b">选项 B</MenuItem>
                  <MenuItem value="c">选项 C</MenuItem>
                </MenuContent>
              </Menu>
              <Menu size="lg">
                <MenuTrigger>
                  <Button size="sm" variant="outlined">
                    lg
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="a">选项 A</MenuItem>
                  <MenuItem value="b">选项 B</MenuItem>
                  <MenuItem value="c">选项 C</MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>
          <div className="boundary-card">
            <strong>形状（shape）</strong>
            <div className="button-row">
              <Menu shape="rounded">
                <MenuTrigger>
                  <Button size="sm" variant="outlined">
                    rounded
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="a">选项 A</MenuItem>
                  <MenuItem value="b">选项 B</MenuItem>
                </MenuContent>
              </Menu>
              <Menu shape="rect">
                <MenuTrigger>
                  <Button size="sm" variant="outlined">
                    rect
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="a">选项 A</MenuItem>
                  <MenuItem value="b">选项 B</MenuItem>
                </MenuContent>
              </Menu>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

const TabsComponentPreview = () => {
  const [controlledTab, setControlledTab] = React.useState('overview');

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}>
      <h2>Tabs component</h2>

      <article>
        <h3>基础 Tabs（line 变体，默认）</h3>
        <Tabs defaultValue="overview">
          <TabList>
            <TabTrigger value="overview">概览</TabTrigger>
            <TabTrigger value="settings">设置</TabTrigger>
            <TabTrigger value="history">历史</TabTrigger>
            <TabTrigger disabled value="disabled">
              禁用标签
            </TabTrigger>
          </TabList>
          <TabContent value="overview">概览内容区域</TabContent>
          <TabContent value="settings">设置内容区域</TabContent>
          <TabContent value="history">历史内容区域</TabContent>
          <TabContent value="disabled">禁用标签内容</TabContent>
        </Tabs>
      </article>

      <article>
        <h3>bg 变体</h3>
        <Tabs defaultValue="all" variant="bg">
          <TabList>
            <TabTrigger value="all">全部</TabTrigger>
            <TabTrigger value="active">活跃</TabTrigger>
            <TabTrigger value="closed">已关闭</TabTrigger>
          </TabList>
          <TabContent value="all">全部内容</TabContent>
          <TabContent value="active">活跃内容</TabContent>
          <TabContent value="closed">已关闭内容</TabContent>
        </Tabs>
      </article>

      <article>
        <h3>primary 颜色</h3>
        <Tabs color="primary" defaultValue="tab1">
          <TabList>
            <TabTrigger value="tab1">标签一</TabTrigger>
            <TabTrigger value="tab2">标签二</TabTrigger>
            <TabTrigger value="tab3">标签三</TabTrigger>
          </TabList>
          <TabContent value="tab1">标签一内容</TabContent>
          <TabContent value="tab2">标签二内容</TabContent>
          <TabContent value="tab3">标签三内容</TabContent>
        </Tabs>
      </article>

      <article>
        <h3>尺寸对比（small / medium / large）</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Tabs key={size} defaultValue="a" size={size}>
              <TabList>
                <TabTrigger value="a">标签 A</TabTrigger>
                <TabTrigger value="b">标签 B</TabTrigger>
                <TabTrigger value="c">标签 C</TabTrigger>
              </TabList>
              <TabContent value="a">{size} — 内容 A</TabContent>
              <TabContent value="b">{size} — 内容 B</TabContent>
              <TabContent value="c">{size} — 内容 C</TabContent>
            </Tabs>
          ))}
        </div>
      </article>

      <article>
        <h3>竖排（vertical）</h3>
        <Tabs defaultValue="profile" orientation="vertical">
          <TabList>
            <TabTrigger value="profile">个人资料</TabTrigger>
            <TabTrigger value="security">安全</TabTrigger>
            <TabTrigger value="billing">账单</TabTrigger>
          </TabList>
          <TabContent value="profile">个人资料内容</TabContent>
          <TabContent value="security">安全内容</TabContent>
          <TabContent value="billing">账单内容</TabContent>
        </Tabs>
      </article>

      <article>
        <h3>受控模式</h3>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          当前激活：{controlledTab}
        </div>
        <Tabs value={controlledTab} onValueChange={({ value }) => setControlledTab(value)}>
          <TabList>
            <TabTrigger value="overview">概览</TabTrigger>
            <TabTrigger value="settings">设置</TabTrigger>
            <TabTrigger value="history">历史</TabTrigger>
          </TabList>
          <TabContent value="overview">概览内容区域</TabContent>
          <TabContent value="settings">设置内容区域</TabContent>
          <TabContent value="history">历史内容区域</TabContent>
        </Tabs>
      </article>

      <article>
        <h3>hideContent 模式（仅标签栏）</h3>
        <Tabs hideContent defaultValue="home">
          <TabList>
            <TabTrigger value="home">首页</TabTrigger>
            <TabTrigger value="docs">文档</TabTrigger>
            <TabTrigger value="about">关于</TabTrigger>
          </TabList>
        </Tabs>
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
          （无 TabContent，切换时可驱动路由跳转）
        </div>
      </article>

      <article>
        <h3>Tab 下拉菜单（menuItems）</h3>
        <Tabs defaultValue="typescript">
          <TabList>
            <TabTrigger value="javascript">JavaScript</TabTrigger>
            <TabTrigger
              menuItems={[
                { value: 'typescript', label: 'TypeScript' },
                { value: 'tsx', label: 'TSX / React' },
                { value: 'dts', label: '类型声明文件' },
              ]}
              value="typescript"
            >
              TypeScript
            </TabTrigger>
          </TabList>
          <TabContent value="javascript">JS 内容</TabContent>
          <TabContent value="typescript">TS 内容</TabContent>
          <TabContent value="tsx">TSX 内容</TabContent>
          <TabContent value="dts">DTS 内容</TabContent>
        </Tabs>
      </article>

      <article>
        <h3>超长滚动（overflowMode="scroll"，默认）</h3>
        <Tabs defaultValue="t1">
          <TabList>
            {Array.from({ length: 20 }, (_, i) => (
              <TabTrigger key={i} value={`t${i + 1}`}>
                标签 {i + 1}
              </TabTrigger>
            ))}
          </TabList>
          {Array.from({ length: 20 }, (_, i) => (
            <TabContent key={i} value={`t${i + 1}`}>
              内容 {i + 1}
            </TabContent>
          ))}
        </Tabs>
      </article>

      <article>
        <h3>超长收齐（overflowMode="collapse"）</h3>
        <Tabs defaultValue="t1" overflowMode="collapse">
          <TabList>
            {Array.from({ length: 20 }, (_, i) => (
              <TabTrigger key={i} value={`t${i + 1}`}>
                标签 {i + 1}
              </TabTrigger>
            ))}
          </TabList>
          {Array.from({ length: 20 }, (_, i) => (
            <TabContent key={i} value={`t${i + 1}`}>
              内容 {i + 1}
            </TabContent>
          ))}
        </Tabs>
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
        <span>@deweyou-design/react: Button, ButtonProps, IconButton, IconButtonProps</span>
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
    <ColorFoundationPreview />
    <section className="button-guidance-grid">
      <article className="button-panel">
        <h2>Build governance</h2>
        <GovernancePreview />
      </article>
    </section>

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
          <IconButton aria-label="Add item" icon={<PlusIcon />} />
          <Button.Icon
            aria-label="Open menu"
            icon={<Menu2Icon />}
            shape="pill"
            variant="outlined"
          />
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
                <Button size="xs" variant="outlined">
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
              <Button size="xs" variant="link">
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

    <PopoverComponentPreview />
    <MenuComponentPreview />
    <TabsComponentPreview />
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
