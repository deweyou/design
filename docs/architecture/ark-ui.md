# 组件开发范式：基于 Ark UI 的行为基础层

交互型组件（含浮层、选择器、对话框、菜单等）必须基于 Ark UI 原语（`@ark-ui/react`）构建，而非自行实现行为逻辑。

## 判断准则

- Ark UI 有对应组件（Popover、Dialog、Menu、Tooltip 等）→ 必须使用
- Ark UI 无对应覆盖（纯展示组件、特定业务逻辑）→ 可自行实现，需在 spec/plan 中说明原因

## 实现约定

1. 用 Ark UI 原语提供行为（状态机、ARIA、焦点管理、定位）
2. 所有样式通过 CSS Modules（Less）+ 设计 token 实现，不使用 Ark UI 默认样式
3. 保持公开 API 与 Ark UI 原语解耦（不直接透传 Ark UI props 给消费方）
4. 如需在 Ark UI 不支持的触发类型上叠加行为，使用受控模式（`open` prop）桥接

参考实现：`packages/components/src/popover/index.tsx`

## 开发工具

实现基于 Ark UI 的组件前，需在 Claude Code 中安装 Ark UI MCP Server：

```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

安装后可在对话中直接查阅 Ark UI 组件 API、props 和用法。
