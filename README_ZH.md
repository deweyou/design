# Deweyou Design

中文 | [English](README.md)

一套基于 React 的 UI 组件库，内置设计 token 和主题系统。

预览：[design.deweyou.me](https://design.deweyou.me)

## 安装

```bash
npm install @deweyou-design/react @deweyou-design/styles
```

如需使用图标，额外安装图标包：

```bash
npm install @deweyou-design/react-icons
```

如果 AI Agent 或 MCP 客户端需要结构化查询组件、样式和图标上下文，可安装 MCP 包：

```bash
npm install @deweyou-design/mcp
```

如需富文本编辑、适配器和编辑器插件能力，可安装 React 包：

```bash
npm install @deweyou-design/react
```

## 快速上手

**1. 引入主题样式**

在应用入口文件（如 `main.tsx`）顶部引入全局主题：

```ts
import '@deweyou-design/styles/theme.css';
```

生产站点如需使用字体 subset，可在 Vite 中启用 `fontSubset`：

```ts
import { fontSubset } from '@deweyou-design/styles/unplugin-font-subset';

export default {
  plugins: [
    fontSubset.vite({
      scan: { include: ['src/**/*.{ts,tsx,md,mdx}'] },
      inject: true,
      fullFonts: 'idle',
    }),
  ],
};
```

`inject: true` 会自动注入 subset 字体 CSS；`fullFonts: 'idle'` 会在页面空闲后异步加载带版本号稳定 URL 的全量字体，方便重复访问命中浏览器缓存。

**2. 使用组件**

```tsx
import { Button, Input } from '@deweyou-design/react';

export default function App() {
  return <Button>Hello</Button>;
}
```

## 导入方式

**统一导入** — 适合大多数场景，支持 tree-shaking 的构建工具（Vite、Webpack 5、Rollup）会自动剔除未使用的组件：

```ts
import { Button, Input } from '@deweyou-design/react';
```

**按组件导入** — 适合对构建产物大小有严格要求的场景：

```ts
import { Button } from '@deweyou-design/react/button';
import { Input } from '@deweyou-design/react/input';
import { NumberInput } from '@deweyou-design/react/number-input';
import { ConfigProvider } from '@deweyou-design/react/config-provider';
```

每个组件的样式会随 JS 导入自动加载，无需单独引入 CSS 文件。如果需要一次性加载所有样式（如 SSR 场景）：

```ts
import '@deweyou-design/react/style.css';
```

## 图标

图标包基于 [Tabler Icons](https://tabler.io/icons) 封装，统一了描边风格（square cap、miter join）。

```tsx
import { SearchIcon, TrashIcon, PlusIcon } from '@deweyou-design/react-icons';

<SearchIcon />
<SearchIcon size={20} stroke={2} />
<SearchIcon aria-label="搜索" />  {/* 有 aria-label 时对屏幕阅读器可见 */}
```

**Props**

| Prop         | 类型               | 默认值  | 说明                       |
| ------------ | ------------------ | ------- | -------------------------- |
| `size`       | `number \| string` | `'1em'` | 图标尺寸                   |
| `stroke`     | `number`           | `1.5`   | 描边宽度                   |
| `className`  | `string`           | -       | 自定义样式类               |
| `aria-label` | `string`           | -       | 传入后图标对无障碍设备可见 |

**内置图标**

`AlertCircle` · `AlertTriangle` · `ArrowLeft` · `ArrowRight` · `Bell` · `Check` · `ChevronDown` · `ChevronLeft` · `ChevronRight` · `ChevronUp` · `Copy` · `Download` · `Edit` · `ExternalLink` · `Eye` · `EyeOff` · `Filter` · `Home` · `Info` · `Loader2` · `Menu2` · `Minus` · `Plus` · `Refresh` · `Search` · `Settings` · `Trash` · `Upload` · `User` · `X`

如需使用 Tabler 中其他图标，可直接用 `createTablerIcon` 自行包装：

```ts
import { createTablerIcon } from '@deweyou-design/react-icons';
import { IconRocket } from '@tabler/icons-react';

export const RocketIcon = createTablerIcon(IconRocket);
```

## Editor

`@deweyou-design/react` 提供 `Editor` 组件、编辑器核心协议、官方插件、适配器和工具函数。
首个官方适配器是 `markdownEditorAdapter()`，Markdown 风格快捷输入由
`markdownShortcutPlugin()` 提供，富文本工具栏通过 `toolbarPlugin()` 插拔接入。

## 国际化

`ConfigProvider` 为下层组件提供类型安全的语言代码。默认和兜底语言均为 `en-US`，组件库
不会自动读取浏览器语言；本期同时支持 `zh-CN`、`zh-TW`、`ja-JP` 和 `ko-KR`。

英文文案同步内置，其他语言的文案按组件放置并懒加载。首次渲染尚未缓存的非英文语言时，
应用需要提供自己的 `Suspense` fallback；运行时切换语言时，已展示的内容会保留到新文案加载完成。

```tsx
import { Suspense } from 'react';
import { ConfigProvider, Pagination } from '@deweyou-design/react';

<Suspense fallback={<span>正在加载语言…</span>}>
  <ConfigProvider locale="zh-CN">
    <Pagination count={100} />
    <Pagination count={100} localeText={{ previous: '返回' }} />
  </ConfigProvider>
</Suspense>;
```

`ConfigProvider` 不暴露 `localeText`。文案覆盖由对应组件或 Editor 插件单独提供，例如
`Pagination`、`codePlugin()` 和 `toolbarPlugin()`。

## 组件

| 组件                    | 说明                                       |
| ----------------------- | ------------------------------------------ |
| `Button`                | 按钮，支持多种变体和尺寸                   |
| `Input`                 | 单行文本输入框                             |
| `NumberInput`           | 支持步进、格式化和范围约束的数字输入框     |
| `Textarea`              | 多行文本输入框                             |
| `Select`                | 下拉选择器                                 |
| `Checkbox`              | 复选框                                     |
| `RadioGroup`            | 单选组                                     |
| `Switch`                | 开关                                       |
| `Badge`                 | 状态标签                                   |
| `Text`                  | 排版文本                                   |
| `ConfigProvider`        | 全局语言等配置的上下文边界                 |
| `Editor`                | 支持适配器和插件的富文本编辑器             |
| `ImagePreview`          | 图片预览，支持缩放和组图切换               |
| `ImageMasonry`          | 图片瀑布流，支持固定列和响应式列           |
| `GroupedVirtualMasonry` | 分组虚拟瀑布流，用于长图片分组列表         |
| `Card`                  | 卡片容器                                   |
| `Separator`             | 分隔线                                     |
| `Skeleton`              | 加载占位符                                 |
| `Spinner`               | 加载指示器                                 |
| `Breadcrumb`            | 面包屑导航                                 |
| `Tabs`                  | 标签页                                     |
| `Pagination`            | 分页器                                     |
| `Menu`                  | 下拉菜单 / 右键菜单                        |
| `Popover`               | 弹出层                                     |
| `Tooltip`               | 文字提示                                   |
| `Dialog`                | 模态对话框                                 |
| `Toast`                 | 轻提示通知                                 |
| `ScrollArea`            | 自定义滚动条容器                           |
| `VirtualList`           | 虚拟列表，支持动态正文高度和长文档锚点滚动 |
| `VirtualMasonry`        | 虚拟瀑布流，用于长图片列表和不规则图片集合 |

交互组件统一使用 `24 / 32 / 40 / 48 / 56px` 可见高度阶梯。组件的 `sm / md / lg` 分别对应
`32 / 40 / 48px`；粗指针环境仍保留最小 `44px` 点击区域，不再因此放大桌面端组件外观。

## 主题定制

组件样式通过 CSS 自定义属性（design token）实现，可以在引入 `theme.css` 后覆盖任意 token：

```css
:root {
  --ui-color-brand-bg: #6366f1;
  --ui-radius-rect: 6px;
}
```

完整 token 列表参见 `@deweyou-design/styles`。

## AI / MCP

公开网站提供 `/llms.txt` 作为面向 LLM 的组件库上下文。支持 MCP 的客户端可以通过类似下面的 client config 添加 stdio server：

```json
{
  "mcpServers": {
    "deweyou-design": {
      "command": "npx",
      "args": ["-y", "@deweyou-design/mcp@latest"]
    }
  }
}
```

MCP server 提供只读的组件、样式入口、图标和 import snippet 查询。Skill 是独立入口，可以通过 Skills CLI 安装：

```bash
npx skills add https://github.com/deweyou/design/tree/main/skills/deweyou-design-components -g -a codex
```
