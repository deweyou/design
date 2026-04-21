# Deweyou UI

一套基于 React 的 UI 组件库，内置设计 token 和主题系统。

预览：[design.deweyou.me](https://design.deweyou.me)

## 安装

```bash
npm install @deweyou-design/react @deweyou-design/styles
```

## 快速上手

**1. 引入主题样式**

在应用入口文件（如 `main.tsx`）顶部引入全局主题：

```ts
import '@deweyou-design/styles/theme.css';
```

**2. 使用组件**

```tsx
import { Button, Input, Toast } from '@deweyou-design/react';

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
```

每个组件的样式会随 JS 导入自动加载，无需单独引入 CSS 文件。如果需要一次性加载所有样式（如 SSR 场景）：

```ts
import '@deweyou-design/react/style.css';
```

## 组件

| 组件         | 说明                     |
| ------------ | ------------------------ |
| `Button`     | 按钮，支持多种变体和尺寸 |
| `Input`      | 单行文本输入框           |
| `Textarea`   | 多行文本输入框           |
| `Select`     | 下拉选择器               |
| `Checkbox`   | 复选框                   |
| `RadioGroup` | 单选组                   |
| `Switch`     | 开关                     |
| `Badge`      | 状态标签                 |
| `Text`       | 排版文本                 |
| `Card`       | 卡片容器                 |
| `Separator`  | 分隔线                   |
| `Skeleton`   | 加载占位符               |
| `Spinner`    | 加载指示器               |
| `Breadcrumb` | 面包屑导航               |
| `Tabs`       | 标签页                   |
| `Pagination` | 分页器                   |
| `Menu`       | 下拉菜单 / 右键菜单      |
| `Popover`    | 弹出层                   |
| `Tooltip`    | 文字提示                 |
| `Dialog`     | 模态对话框               |
| `Toast`      | 轻提示通知               |
| `ScrollArea` | 自定义滚动条容器         |

## 主题定制

组件样式通过 CSS 自定义属性（design token）实现，可以在引入 `theme.css` 后覆盖任意 token：

```css
:root {
  --ui-color-brand-bg: #6366f1;
  --ui-radius-rect: 6px;
}
```

完整 token 列表参见 `@deweyou-design/styles`。
