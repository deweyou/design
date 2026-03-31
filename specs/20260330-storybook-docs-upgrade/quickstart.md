# 快速上手：在本功能中添加或修改 Story

**分支**：`20260330-storybook-docs-upgrade` | **日期**：2026-03-30

---

## 本地启动 Storybook

```bash
vp run storybook#dev
```

默认监听 `http://localhost:6106`，修改 story 文件后热更新。

---

## Story 文件位置

```text
apps/storybook/src/stories/
├── Button.stories.tsx
├── Color.stories.tsx
├── Icon.stories.tsx
├── Menu.stories.tsx
├── Popover.stories.tsx
└── Typography.stories.tsx
```

---

## 修改现有 Story 的 title（分类重组）

仅需修改 `meta.title` 字段：

```typescript
// 修改前
const meta = {
  title: 'Internal review/Button',
  // ...
} satisfies Meta<typeof Button>;

// 修改后
const meta = {
  title: 'Components/Button',
  // ...
} satisfies Meta<typeof Button>;
```

---

## 添加 argTypes（API 文档）

在 `meta` 对象中增加 `tags` 和 `argTypes`：

```typescript
const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description:
        'Visual style of the button. Use "filled" for primary actions, "outlined" for secondary, "ghost" for tertiary, and "link" for inline text actions.',
      control: { type: 'select' },
      options: ['filled', 'outlined', 'ghost', 'link'],
      table: {
        type: { summary: "'filled' | 'outlined' | 'ghost' | 'link'" },
        defaultValue: { summary: 'filled' },
      },
    },
    disabled: {
      description: 'When true, prevents all user interaction and reduces opacity to 0.56.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      description: 'Button label content.',
      control: false,
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Button triggers an action or navigates to a destination...',
      },
    },
  },
} satisfies Meta<typeof Button>;
```

---

## 升级 Storybook 版本

1. 查询最新稳定版本：

   ```bash
   npm view storybook version
   ```

2. 更新 `pnpm-workspace.yaml` 中的 `catalog:` 节（统一修改，无需逐文件改）：

   ```yaml
   catalog:
     '@storybook/addon-docs': <新版本>
     '@storybook/react': <新版本>
     '@storybook/react-vite': <新版本>
     storybook: <新版本>
   ```

3. 重新安装依赖：

   ```bash
   vp install
   ```

4. 启动验证：
   ```bash
   vp run storybook#dev
   ```

---

## 验证通过标准

```bash
vp check          # 类型检查 + lint + 格式化，无报错
vp run storybook#dev  # 启动后所有 6 个 story 加载无错误
```

- 侧边栏仅出现 `Components/` 和 `Foundations/` 两个顶层分类
- 每个组件的 Docs 页面 Props 表格完整，描述为英文
- Light / Dark 主题切换正常
