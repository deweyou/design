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
      <div className={styles.container}>
        <Text variant="caption">MIT License · 2026</Text>
      </div>
    </footer>
  </main>
);

const IconsPreviewSection = () => {
  const navigate = useNavigate();
  return (
    <section className={styles.iconsSection}>
      <div className={styles.container}>
        <p className={styles.sectionLabel}>Icons · Tabler Icons</p>
        <div className={styles.iconGrid}>
          {PREVIEW_ICONS.map(({ name, Icon }) => (
            <div key={name} className={styles.iconCell}>
              <div className={styles.iconBox}>
                <Icon size={18} />
              </div>
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
      <ComponentsSubSection />
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

// ─── Components tabs ──────────────────────────────────────────────────────────

const ComponentsSubSection = () => (
  <div className={styles.subSection}>
    <p className={styles.subLabel}>Components · 27 个</p>
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
          <Input placeholder="错误状态" error="必填项" style={{ width: 160 }} />
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
          <Badge color="success" variant="soft">
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
);
