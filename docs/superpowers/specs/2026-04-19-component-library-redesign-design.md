# Component Library Redesign Design Spec

## 目标

将 `packages/react` 中现有 5 个组件全面 redesign，并新增 19 个组件，共计 24 个组件。所有组件遵循统一的「AI Friendly」设计原则，同时在 `packages/react/CLAUDE.md` 中记录设计意图，辅助 AI 生成正确的组件用法。

---

## 范围

### 现有组件 Redesign（5 个）

Button、Text、Popover、Menu、Tabs

主要改动：

- `size` prop 缩写统一为 `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- 硬编码 border-radius 全部替换为语义 token（`--ui-radius-rect/float/pill`）
- 补全 JSDoc
- 补全 Storybook Interaction story

### 新增组件（19 个）

| 组件              | Ark UI | 类型     |
| ----------------- | ------ | -------- |
| Input / TextField | 否     | 简单     |
| Textarea          | 否     | 简单     |
| Checkbox          | 是     | Compound |
| RadioGroup        | 是     | Compound |
| Switch            | 是     | Compound |
| Select            | 是     | Compound |
| Dialog            | 是     | Compound |
| Tooltip           | 是     | Compound |
| Toast             | 是     | Compound |
| ScrollArea        | 是     | Compound |
| Carousel          | 是     | Compound |
| Pagination        | 是     | Compound |
| Badge             | 否     | 简单     |
| Spinner           | 否     | 简单     |
| Separator         | 否     | 简单     |
| Alert / Callout   | 否     | 简单     |
| Card              | 否     | 简单     |
| Breadcrumb        | 否     | 简单     |
| Skeleton          | 否     | 简单     |

### 文档

新增 `packages/react/CLAUDE.md`，记录每个组件的设计意图、正确用法和反模式。

---

## 架构

### 目录结构

每个组件位于 `packages/react/src/<component-name>/`，内含：

```
src/
├── button/
│   ├── index.tsx          # 组件实现与导出
│   ├── index.module.less  # CSS Modules 样式
│   └── index.test.tsx     # 单测（colocated）
├── input/
│   └── ...
└── index.ts               # 重新导出所有公开 API
```

### 设计方向：受控的 Compound API

- **简单组件**（Badge、Input、Spinner 等）：flat props，单组件导出
- **复杂组件**（Select、Dialog、Menu 等）：Compound pattern，使用 `Foo.Root / Foo.Trigger / Foo.Content / Foo.Item` 结构
- Ark UI 作为内部行为层，类型不透传给消费者

---

## API 契约

### Prop 命名约定

| Prop         | 语义         | 类型示例                               |
| ------------ | ------------ | -------------------------------------- |
| `variant`    | 视觉变体     | `'filled' \| 'outlined' \| 'ghost'`    |
| `color`      | 色彩角色     | `'neutral' \| 'primary' \| 'danger'`   |
| `size`       | 尺寸         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` |
| `disabled`   | 禁用状态     | `boolean`                              |
| `className`  | 外部样式扩展 | `string`                               |
| `style`      | 内联样式     | `CSSProperties`                        |
| `aria-label` | 无障碍标签   | `string`                               |

### TypeScript 约束模式

用判别联合类型在编译期拦截无效 prop 组合，不依赖运行时报错：

```ts
// ghost / link 变体不支持 shape
type ButtonProps =
  | { variant?: 'filled' | 'outlined'; shape?: 'rect' | 'float' | 'pill' }
  | { variant: 'ghost' | 'link'; shape?: never };
```

### Compound 命名规则

| 子组件          | 职责               |
| --------------- | ------------------ |
| `Foo.Root`      | 持有状态和 context |
| `Foo.Trigger`   | 打开 / 激活        |
| `Foo.Content`   | 浮层或面板         |
| `Foo.Item`      | 可重复的单项       |
| `Foo.Label`     | 标签文字           |
| `Foo.Indicator` | 视觉指示器         |

### Border-radius 规则

所有组件的圆角必须引用语义 token，不允许硬编码数值：

| Token               | 值    | 使用场景                |
| ------------------- | ----- | ----------------------- |
| `--ui-radius-rect`  | 0     | 按钮、输入框、卡片      |
| `--ui-radius-float` | 4px   | 浮层、下拉菜单、Tooltip |
| `--ui-radius-pill`  | 999px | Badge、Chip 类          |

---

## 文档策略

### packages/react/CLAUDE.md

每个组件一个小节，固定格式：

```markdown
## ComponentName

**意图**：何时用、用什么 variant/color 组合。

**正确用法**
\`\`\`tsx
// 示例代码
\`\`\`

**反模式**

- 不应该做的事（及原因）
```

### JSDoc 要求

每个 prop 必须有 JSDoc 注释，说明语义而非类型：

```ts
type InputProps = {
  /** 输入框标签，显示在输入框上方 */
  label?: string;
  /** 辅助提示文字，显示在输入框下方 */
  hint?: string;
  /** 错误信息，非空时输入框切换为错误状态 */
  error?: string;
};
```

---

## 测试策略

### 单测（Vitest）

每个组件的 `index.test.tsx` 覆盖：

- 默认渲染（快照或 DOM 断言）
- 关键 prop 变体（variant、color、size、disabled）
- 可交互组件：状态变化（打开/关闭、选中/取消）
- 无障碍属性（aria-label、role、aria-disabled）

### Storybook（E2E）

每个 `*.stories.tsx` 必须包含：

| Story         | 内容                                   |
| ------------- | -------------------------------------- |
| `Default`     | 最基础用法，0 额外配置                 |
| `Variants`    | 所有 variant / color / size 的视觉矩阵 |
| `States`      | disabled、loading、error 等边界状态    |
| `Interaction` | 带 `play` 函数，覆盖行为断言           |

`Interaction` story 的 `play` 函数要求：

- 所有组件：断言核心 DOM 元素存在
- 可交互组件（Select、Dialog、Menu、Tooltip 等）：必须测试打开/关闭行为
- 有状态组件（Checkbox、Switch、RadioGroup）：必须测试状态切换
- 带验证的组件（Input with error）：必须测试错误状态渲染

```tsx
export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();
    const trigger = canvas.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};
```

---

## 不在范围内

- MCP Server（等组件库 API 稳定后再做）
- 全量 Ark UI 组件（仅实现上述 list）
- 现有组件的行为逻辑重写（仅 API 和样式层面的 redesign）
- `apps/website` 和 `apps/storybook` 之外的消费方适配
