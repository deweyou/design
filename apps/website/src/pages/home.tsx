import {
  Badge,
  Button,
  Checkbox,
  Input,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Popover,
  Select,
  Spinner,
  Switch,
  TabContent,
  TabList,
  TabTrigger,
  Tabs,
  Text,
  toast,
} from '@deweyou-design/react';
import * as Icons from '@deweyou-design/react-icons';
import { useNavigate } from 'react-router-dom';

import styles from './home.module.less';

// 20 representative icons for the landing preview
const PREVIEW_ICONS: Array<{ name: string; Icon: React.ComponentType<{ size?: number }> }> = [
  { name: 'plus', Icon: Icons.PlusIcon },
  { name: 'x', Icon: Icons.XIcon },
  { name: 'check', Icon: Icons.CheckIcon },
  { name: 'search', Icon: Icons.SearchIcon },
  { name: 'edit', Icon: Icons.EditIcon },
  { name: 'trash', Icon: Icons.TrashIcon },
  { name: 'settings', Icon: Icons.SettingsIcon },
  { name: 'bell', Icon: Icons.BellIcon },
  { name: 'home', Icon: Icons.HomeIcon },
  { name: 'user', Icon: Icons.UserIcon },
  { name: 'download', Icon: Icons.DownloadIcon },
  { name: 'upload', Icon: Icons.UploadIcon },
  { name: 'refresh', Icon: Icons.RefreshIcon },
  { name: 'filter', Icon: Icons.FilterIcon },
  { name: 'copy', Icon: Icons.CopyIcon },
  { name: 'eye', Icon: Icons.EyeIcon },
  { name: 'eye-off', Icon: Icons.EyeOffIcon },
  { name: 'arrow-left', Icon: Icons.ArrowLeftIcon },
  { name: 'arrow-right', Icon: Icons.ArrowRightIcon },
  { name: 'external-link', Icon: Icons.ExternalLinkIcon },
];

export const HomePage = () => (
  <main className={styles.page}>
    <HeroSection />
    <DesignSection />
    <IconsPreviewSection />
    <footer className={styles.footer}>
      <span>MIT · 2026</span>
      <span>§ FIN</span>
    </footer>
  </main>
);

const IconsPreviewSection = () => {
  const navigate = useNavigate();
  return (
    <section className={styles.cell}>
      <CellHead number="05" title="Icons" meta="Tabler · stroke 1.5 square / miter" />
      <div className={styles.cellBodyFlush}>
        <div className={styles.iconGrid}>
          {PREVIEW_ICONS.map(({ name, Icon }) => (
            <div key={name} className={styles.iconCell}>
              <Icon size={18} />
              <span className={styles.iconName}>{name}</span>
            </div>
          ))}
        </div>
        <div className={styles.iconViewAll}>
          <Button variant="link" onClick={() => navigate('/icons')}>
            查看全部图标 →
          </Button>
        </div>
      </div>
    </section>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className={styles.heroCell}>
    <div className={styles.heroGrid} />
    <div className={styles.heroInner}>
      <p className={styles.heroEyebrow}>Component Library · v1.0</p>
      <Text variant="h1" className={styles.heroTitle}>
        Architecture for <span>serif</span> interfaces.
      </Text>
      <Text variant="body" className={styles.heroDesc}>
        二十七个组件，以宋体字形节奏与温暖色系构建，深浅双主题，开箱即用。专为中文优先的产品而设计。
      </Text>
      <div className={styles.heroActions}>
        <code className={styles.installCmd}>$ npm i @deweyou-design/react</code>
        <Button
          color="neutral"
          href="https://design-storybook-deweyous-projects.vercel.app"
          target="_blank"
          variant="filled"
        >
          查看 Storybook →
        </Button>
      </div>
      <div className={styles.stats}>
        <Stat value="27" label="Components" />
        <Stat value="30" label="Icons" />
        <Stat value="26" label="Color Families" />
        <Stat value="02" label="Themes" />
      </div>
    </div>
  </section>
);

// ─── Design & Components ──────────────────────────────────────────────────────

const DesignSection = () => (
  <>
    <ColorSubSection />
    <TypographySubSection />
    <ComponentsSubSection />
  </>
);

// Color swatches — emerald (brand), red (danger), stone (neutral)
const COLOR_ROWS: Array<{ family: string; steps: number[] }> = [
  { family: 'emerald', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
  { family: 'red', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
  { family: 'stone', steps: [950, 900, 800, 700, 600, 500, 400, 300, 200] },
];

const ColorSubSection = () => (
  <section className={styles.cell}>
    <CellHead number="02" title="Palette" meta="3 semantic roles 9 tonal steps each" />
    <div className={styles.cellBodyFlush}>
      <div className={styles.palette}>
        {COLOR_ROWS.flatMap(({ family, steps }) =>
          steps.map((step) => (
            <div
              key={`${family}-${step}`}
              className={styles.colorSwatch}
              style={{ backgroundColor: `var(--ui-color-palette-${family}-${step})` }}
            >
              {step === 950 ? <strong>{family}</strong> : null}
              <span>{step}</span>
            </div>
          )),
        )}
      </div>
    </div>
  </section>
);

const TYPE_SPECIMENS = [
  { label: 'H1', sample: 'Design 设计', variant: 'h1' as const },
  { label: 'H2', sample: '组件库 · 深浅双主题', variant: 'h2' as const },
  { label: 'H3', sample: '简约 · 线条感 · 中文优先', variant: 'h3' as const },
  {
    label: 'Body',
    sample: '基于宋体字形节奏与温暖色系构建，覆盖完整 UI 场景。',
    variant: 'body' as const,
  },
  { label: 'Caption', sample: '辅助信息层级 · 用于标注与说明文字', variant: 'caption' as const },
];

const TypographySubSection = () => (
  <section className={styles.cell}>
    <CellHead number="03" title="Type" meta="Source Han Serif CN 5 levels · 4 weights" />
    <div className={styles.cellBodyFlush}>
      <div className={styles.typeRows}>
        {TYPE_SPECIMENS.map(({ label, sample, variant }) => (
          <div key={label} className={styles.typeRow}>
            <span className={styles.typeLabel}>{label}</span>
            <Text variant={variant}>{sample}</Text>
            <span className={styles.typeMeta}>{variant}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Components tabs ──────────────────────────────────────────────────────────

const ComponentsSubSection = () => (
  <section className={styles.cell}>
    <CellHead number="04" title="Components" meta="27 primitives stable" />
    <div className={styles.cellBodyFlush}>
      <Tabs defaultValue="buttons" variant="line" color="neutral" size="sm">
        <TabList>
          <TabTrigger value="buttons">按钮 / 操作</TabTrigger>
          <TabTrigger value="form">表单输入</TabTrigger>
          <TabTrigger value="overlay">浮层 / 菜单</TabTrigger>
          <TabTrigger value="feedback">反馈 / 徽标</TabTrigger>
        </TabList>

        <TabContent value="buttons">
          <div className={styles.tabContent}>
            <Button color="neutral" variant="filled">
              Neutral
            </Button>
            <Button color="primary" variant="filled">
              Primary
            </Button>
            <Button color="danger" variant="filled">
              Danger
            </Button>
            <div className={styles.tabDivider} />
            <Button color="neutral" variant="outlined">
              Outlined
            </Button>
            <Button color="neutral" variant="ghost">
              Ghost
            </Button>
          </div>
        </TabContent>

        <TabContent value="form">
          <div className={styles.tabContent}>
            <Input placeholder="普通输入框" style={{ width: 160 }} />
            <div className={styles.tabDivider} />
            <div style={{ width: 160 }}>
              <Select.Root placeholder="请选择">
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="a" label="选项 A" />
                  <Select.Item value="b" label="选项 B" />
                  <Select.Item value="c" label="选项 C" />
                </Select.Content>
              </Select.Root>
            </div>
            <div className={styles.tabDivider} />
            <Switch defaultChecked>开启</Switch>
            <Switch>关闭</Switch>
            <div className={styles.tabDivider} />
            <Checkbox defaultChecked>已勾选</Checkbox>
            <Checkbox>未勾选</Checkbox>
          </div>
        </TabContent>

        <TabContent value="overlay">
          <div className={styles.tabContent}>
            <Popover content={<span style={{ fontSize: 13 }}>这是一个 Popover 内容</span>}>
              <Button color="neutral" variant="outlined">
                打开 Popover
              </Button>
            </Popover>
            <div className={styles.tabDivider} />
            <Menu>
              <MenuTrigger>
                <Button color="neutral" variant="outlined">
                  打开菜单
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="edit">编辑</MenuItem>
                <MenuItem value="copy">复制</MenuItem>
                <MenuItem value="delete">删除</MenuItem>
              </MenuContent>
            </Menu>
          </div>
        </TabContent>

        <TabContent value="feedback">
          <div className={styles.tabContent}>
            <Badge color="neutral">中性</Badge>
            <Badge color="primary" variant="soft">
              成功
            </Badge>
            <Badge color="primary" variant="solid">
              主要
            </Badge>
            <Badge color="danger" variant="outline">
              危险
            </Badge>
            <div className={styles.tabDivider} />
            <Spinner />
            <div className={styles.tabDivider} />
            <Button
              color="primary"
              variant="filled"
              onClick={() =>
                toast.create({ title: '操作成功', description: '内容已保存', variant: 'success' })
              }
            >
              触发 Toast
            </Button>
          </div>
        </TabContent>
      </Tabs>
    </div>
  </section>
);

const CellHead = ({ meta, number, title }: { meta: string; number: string; title: string }) => (
  <div className={styles.cellHead}>
    <span className={styles.cellNumber}>§ {number}</span>
    <span className={styles.cellTitle}>{title}</span>
    <span className={styles.cellMeta}>{meta}</span>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.stat}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);
