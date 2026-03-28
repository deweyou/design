# 快速上手：引入 Ark UI 作为组件库基础层

**分支**：`20260327-ark-ui-integration`
**日期**：2026-03-27

---

## 对消费方

### 无需任何变更

如果你是 `@deweyou-ui/components` 的消费方，本次变更对你完全透明。现有的 Popover 用法保持不变：

```tsx
import { Popover } from '@deweyou-ui/components/popover'

// 所有现有用法继续有效
<Popover content={<div>内容</div>}>
  <button>打开</button>
</Popover>

<Popover
  trigger="hover"
  placement="top"
  mode="loose"
  visible={open}
  onVisibleChange={setOpen}
  content={<div>悬浮内容</div>}
>
  <button>悬停打开</button>
</Popover>
```

---

## 对组件开发者

### 前置：安装 Ark UI MCP Server

在开始实现前，安装 Ark UI 官方 MCP Server，这样在 Claude Code 开发对话中可以直接查阅 Ark UI 组件的 API 文档，无需手动查阅网页：

```bash
claude mcp add ark-ui -- npx -y @ark-ui/mcp
```

安装后，在任意 Claude Code 对话中即可直接问询 Ark UI 组件的 props、用法和最佳实践。

### 新增组件时的范式

从本次变更起，交互型新组件应优先基于 Ark UI 构建：

```bash
# 1. 安装 Ark UI（已作为 packages/components 依赖，无需重复安装）

# 2. 在组件目录中导入对应 Ark UI 原语
import { Popover } from '@ark-ui/react/popover'
import { Dialog } from '@ark-ui/react/dialog'
# ...

# 3. 样式层继续使用 CSS Modules + 设计 token
```

### 决策树

```
新增组件需要复杂交互行为？
├── 是 → Ark UI 是否有对应原语？
│   ├── 是 → 使用 Ark UI 构建，参考 popover 实现模式
│   └── 否 → 自行实现，并在 spec 或 plan 中记录原因
└── 否（纯展示组件）→ 直接实现，无需 Ark UI
```

### 参考实现

迁移后的 `packages/components/src/popover/index.tsx` 是本范式的参考实现，展示了：

- Ark UI 原生触发（click 模式）的用法
- 受控模式下自定义触发器（hover / focus / context-menu）的桥接方式
- 样式层与 Ark UI 结构的对接方式

---

## 开发验证命令

```bash
# 类型检查 + Lint
vp check

# 运行 popover 单测
vp test packages/components

# 构建组件包
vp run build -r

# 启动 website 预览
vp run website#dev
```
