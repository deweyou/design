# 快速上手：重构 packages 结构

## 变更后的安装方式

```bash
# React 组件库（主包）
npm install @deweyou-design/react

# 图标（独立安装）
npm install @deweyou-design/react-icons

# Hooks（独立安装）
npm install @deweyou-design/react-hooks

# 样式 token
npm install @deweyou-design/styles
```

## 使用方式（与重构前完全等价）

```tsx
import { Button } from '@deweyou-design/react';
import { SearchIcon } from '@deweyou-design/react-icons/search';
import { useThemeMode } from '@deweyou-design/react-hooks';
import '@deweyou-design/styles/theme.css';
```

## 包职责速查

- `@deweyou-design/react` — UI 组件（Button、Popover、Tabs 等）
- `@deweyou-design/react-hooks` — React hooks（useThemeMode 等）
- `@deweyou-design/react-icons` — 图标组件（按需 import）
- `@deweyou-design/styles` — 设计 token CSS 变量
- `@deweyou-design/utils` — runtime 工具函数（初始为空，待后续扩展）
- `@deweyou-ui/infra` — **仅 monorepo 内部 build 使用，消费方勿安装**
