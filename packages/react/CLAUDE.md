# CLAUDE

## 适用范围

适用于 `packages/react`。

## 约束

- 每个组件都应放在 `src/<component-name>/` 下的独立目录中。
- 每个组件目录内使用 `index.tsx` 作为实现入口，使用 `index.module.less` 承载局部样式。
- 组件单测应与源码同目录放置为 `src/<component-name>/index.test.ts`。
- 本包中的组件和辅助逻辑默认使用箭头函数。
- 除非存在明确的工具限制，否则使用标准 TSX，而不是 `React.createElement`。
- 直接使用 `classnames`，不要再套一层本地 `cx` 包装。
- 组件不得静默注入全局样式。
- 根节点 `className` 仍然是首要的公开样式钩子。
- `packages/react/tests` 下的顶层测试只用于跨 package 或 workspace 边界覆盖。

## 组件开发范式：基于 Ark UI 的行为基础层

本组件库使用 Ark UI（`@ark-ui/react`）作为交互型组件的行为基础层。

### 使用准则

**应当使用 Ark UI 的场景**：

- 浮层类组件（Popover、Tooltip、HoverCard、Menu、Dialog 等）
- 选择器类组件（Select、Combobox、DatePicker、ColorPicker 等）
- 表单增强组件（Checkbox、Switch、RadioGroup、Slider 等）
- 任何 Ark UI 有对应原语的交互型组件

**不需要使用 Ark UI 的场景**：

- 纯展示组件（Text、Icon 等）
- 纯样式封装（如 Button 当前实现已经足够）
- Ark UI 无对应覆盖的特定业务逻辑

### 实现约定

1. 使用 Ark UI 原语提供行为（状态机、ARIA、焦点管理、定位）
2. 所有样式通过 CSS Modules（Less）+ 设计 token 实现，不使用 Ark UI 提供的任何默认样式
3. 保持公开 API 与 Ark UI 原语解耦（不将 Ark UI props 直接透传给消费方）
4. 如需在 Ark UI 不支持的触发类型上叠加行为，使用受控模式（`open` prop）桥接
5. 在开发前安装 Ark UI MCP Server 以便直接查阅 API 文档：`claude mcp add ark-ui -- npx -y @ark-ui/mcp`

### 参考实现

`packages/react/src/popover/index.tsx` 是本范式的参考实现，展示了：

- Ark UI 原生触发（click 模式）的用法
- 受控模式下自定义触发器（hover / focus / context-menu）的桥接方式
- 样式层与 Ark UI 结构的对接方式

---

## 组件设计意图

### Input

**意图**：用于收集用户单行文本输入。`label` 和 `hint` 辅助用户填写，`error` 非空时进入错误状态，错误优先级高于 `hint`。

**正确用法**

```tsx
<Input label="Email" hint="We'll never share it." />
<Input label="Password" error="Password is required." />
<Input label="Search" size="sm" placeholder="Search…" />
```

**反模式**

- 不要手动用 `div` 包裹 `input + label`，直接用 `label` prop
- error 状态用 `error` prop，不要用 `className` 覆盖样式
- 不要同时传 `error` 和 `hint`，`error` 存在时 `hint` 会被忽略

---

### Textarea

**意图**：用于收集多行文本。API 与 `Input` 一致，去掉 `white-space: nowrap`，加 `resize: vertical`。

**正确用法**

```tsx
<Textarea label="Message" hint="Max 500 characters." />
<Textarea label="Feedback" error="Feedback is required." rows={6} />
```

**反模式**

- 不要用 `Input` 替代 `Textarea` 来容纳多行文字
- 不要手动将 `resize` 设为 `none` 除非确实不需要

---

### Badge

**意图**：紧凑的内联标签，用于状态、分类或计数。三个视觉变体 × 五种语义颜色。

**正确用法**

```tsx
<Badge color="success">Active</Badge>
<Badge variant="solid" color="danger">Error</Badge>
<Badge variant="outline" color="warning">Pending</Badge>
```

**反模式**

- 不要用 Badge 展示超过 3-4 个词的长文本，考虑用 Alert
- 不要通过 `style` 手动修改颜色，使用 `color` prop 的语义选项

---

### Spinner

**意图**：表示不确定时长的加载过程。默认 `aria-hidden`；有 `aria-label` 时对无障碍设备可见。

**正确用法**

```tsx
<Spinner />  {/* decorative, hidden from screen readers */}
<Spinner aria-label="Loading results" />  {/* announces to screen readers */}
<Spinner size={24} aria-label="Saving" />
```

**反模式**

- 不要在有 loading 文字旁同时添加 `aria-label`，会造成重复朗读
- 不要手动设置 `role`，`aria-label` 存在时已自动添加 `role="status"`

---

### Separator

**意图**：视觉分隔线。水平方向渲染为 `<hr>`，垂直方向渲染为 `<div>`。水平方向可选文字标签（如 "OR"）。

**正确用法**

```tsx
<Separator />
<Separator label="OR" />
<Separator orientation="vertical" />
```

**反模式**

- 不要在垂直分隔线上使用 `label` prop，该 prop 仅对水平方向有效
- 不要用纯 CSS `border` 代替 `<Separator>`，语义 HTML 更利于无障碍

---

### Alert

**意图**：展示上下文反馈信息，四种语义变体（info / success / warning / danger）。`danger` 变体自动添加 `role="alert"`。

**正确用法**

```tsx
<Alert variant="info" title="Did you know?">
  You can dismiss this message.
</Alert>
<Alert variant="danger">Session expired. Please log in again.</Alert>
```

**反模式**

- 不要把 `Alert` 用于持久的页面内容说明，考虑用 `Card`
- 不要手动添加 `role="alert"`，`danger` 变体已内置

---

### Card

**意图**：通用表面容器，用于对相关内容进行视觉分组。提供统一的边框、背景色和圆角。

**正确用法**

```tsx
<Card padding="lg">
  <h3>Title</h3>
  <p>Card body content.</p>
</Card>
<Card padding="none">
  <img src="cover.jpg" alt="" />
</Card>
```

**反模式**

- 不要用内联 `style` 手动设置背景和边框，使用 `Card` 以保持视觉一致性
- 不要嵌套多层 `Card`，考虑使用内边距变体（`padding="none"`）配合手动布局

---

### Breadcrumb

**意图**：复合导航组件，展示当前页面在层级结构中的位置。使用 Compound 模式组合子组件。

**正确用法**

```tsx
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
      <Breadcrumb.Separator />
    </Breadcrumb.Item>
    <Breadcrumb.Item>
      <Breadcrumb.Current>Current Page</Breadcrumb.Current>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

**反模式**

- 不要省略 `Breadcrumb.Separator`，每个非末尾 `Item` 都应包含分隔符
- 不要在 `Breadcrumb.Current` 上添加 `href`，当前页不应可点击导航
- 不要直接用 `<nav>` 手动实现，`Breadcrumb.Root` 已处理 `aria-label`

---

### Skeleton

**意图**：加载占位符，带 shimmer 动画。`circle` 模式适用于头像占位。所有实例均为 `aria-hidden`。

**正确用法**

```tsx
<Skeleton height="1em" />
<Skeleton height="1em" width="60%" />
<Skeleton circle width={40} height={40} />
```

**反模式**

- 不要给 `Skeleton` 添加 `aria-label`，加载占位符对无障碍设备应当透明
- 不要在加载完成后忘记替换 `Skeleton`，它不应作为永久布局元素存在
