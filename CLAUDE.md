# ui 开发指南

根据所有功能计划自动生成。最后更新：2026-03-27

## 当前技术栈

- TypeScript 5.x、React 19.x、Node.js 24.14.0
- vite-plus（统一工具链：构建、测试、lint、格式化）
- React、Less、CSS Modules、Storybook
- `@ark-ui/react`（交互型组件行为基础层，自 20260327-ark-ui-integration 起）
- `@deweyou-ui/styles`（共享设计 token）

## 项目结构

```text
packages/
├── components/      # UI 组件库（@deweyou-ui/components）
│   └── src/
│       ├── button/
│       ├── popover/  ← 本次变更：基于 Ark UI 重写
│       └── text/
├── hooks/           # 共享 React hooks
├── icons/           # 图标包
├── styles/          # 设计 token
└── utils/           # 工具函数

apps/
├── website/         # 组件预览站
└── storybook/       # 组件故事
```

## 开发工具

### Ark UI MCP Server（必装）

实现基于 Ark UI 的组件前，需在 Claude Code 中安装 Ark UI MCP Server：

```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

安装后可在对话中直接查阅 Ark UI 组件 API、props 和用法，无需手动查阅文档网站。

## 命令

```bash
vp check            # 类型检查 + lint + 格式化
vp test             # 运行测试
vp run build -r     # 全量构建
vp run website#dev  # 启动预览站
vp install          # 安装依赖
```

## 组件开发范式：基于 Ark UI 的行为基础层

交互型组件（含浮层、选择器、对话框、菜单等）必须基于 Ark UI 原语（`@ark-ui/react`）构建，而非自行实现行为逻辑。

**判断准则**：

- Ark UI 有对应组件（Popover、Dialog、Menu、Tooltip 等）→ 必须使用
- Ark UI 无对应覆盖（纯展示组件、特定业务逻辑）→ 可自行实现，需在 spec/plan 中说明原因

**实现约定**：

1. 用 Ark UI 原语提供行为（状态机、ARIA、焦点管理、定位）
2. 所有样式通过 CSS Modules（Less）+ 设计 token 实现，不使用 Ark UI 默认样式
3. 保持公开 API 与 Ark UI 原语解耦（不直接透传 Ark UI props 给消费方）
4. 如需在 Ark UI 不支持的触发类型上叠加行为，使用受控模式（`open` prop）桥接

参考实现：`packages/components/src/popover/index.tsx`

## 最近变更

- **20260327-ark-ui-integration**：引入 `@ark-ui/react` 作为组件行为基础层；迁移 popover 组件；建立后续交互型组件开发范式
- **20260317-repo-conventions**：仓库治理规则（箭头函数、TSX-first、kebab-case、单测 colocate）
- **20260316-ui-monorepo-foundation**：monorepo 边界、显式样式导入、受控主题 token、Storybook/website 职责分离

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
