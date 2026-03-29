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

## 设计风格

> 从 Button、Popover、Text 组件及 `@deweyou-ui/styles` 提炼，是新组件开发的视觉与交互基准。

### 字体排印

字体族：Source Han Serif CN Web → Songti SC → STSong → SimSun → NSimSun → serif（body 和 display 使用同一字族）

| 层级    | 字号                       | 行高 | 字重 |
| ------- | -------------------------- | ---- | ---- |
| caption | 0.875rem                   | 1.45 | 400  |
| body    | 1rem                       | 1.6  | 400  |
| h5      | 1.15rem                    | 1.32 | 700  |
| h4      | 1.45rem                    | 1.22 | 600  |
| h3      | 1.85rem                    | 1.14 | 600  |
| h2      | 2.3rem                     | 1.08 | 600  |
| h1      | clamp(2.8rem, 5vw, 4.6rem) | 1.02 | 700  |

字重四档：400（正文）/ 500（强调）/ 600（标题）/ 700（重标题）

### 色彩系统

语义色三档：**neutral**（默认）/ **primary**（品牌绿）/ **danger**（红）

| 语义         | Token                   | 调色板值    |
| ------------ | ----------------------- | ----------- |
| 品牌/主色    | `--ui-color-brand-bg`   | emerald-700 |
| 危险         | `--ui-color-danger-bg`  | red-700     |
| 焦点环       | `--ui-color-focus-ring` | emerald-500 |
| 链接         | `--ui-color-link`       | emerald-700 |
| 正文         | `--ui-color-text`       | neutral-950 |
| 画布（底层） | `--ui-color-canvas`     | white       |
| 表面（卡片） | `--ui-color-surface`    | neutral-50  |
| 边框（默认） | `--ui-color-border`     | slate-300   |

### 圆角档位

| 档位    | 值     | 适用场景                          |
| ------- | ------ | --------------------------------- |
| rect    | 0      | 贴合容器边缘的嵌入式元素          |
| rounded | 0.4rem | ghost/link 按钮、浮层默认、小控件 |
| auto    | 0.8rem | filled/outlined 按钮默认          |
| pill    | 999px  | 标签、胶囊型按钮                  |

### 阴影

`--ui-shadow-soft`：`0 18px 40px rgba(24, 33, 29, 0.12)` — 大模糊半径、低不透明度，用于浮层和卡片

### 交互反馈

```
hover 背景  = color-mix(in srgb, <color>  6–12%, transparent)
active 背景 = color-mix(in srgb, <color> 10–18%, transparent) + translateY(1px)
disabled    = opacity: 0.56，cursor: not-allowed
```

### 过渡与动效

```
交互元素：140ms ease（background, border-color, color, box-shadow, transform）
浮层入场： 160ms cubic-bezier(0.22, 1, 0.36, 1)  — translateY/X(6px) + scale(0.98) → 归零
浮层出场： 160ms ease forwards                   — 归零 → translateY/X(4.2px) + scale(0.98)
prefers-reduced-motion：浮层 transform 归零，link clip-path 过渡禁用
```

### 焦点

```css
outline: 2px solid var(--ui-color-focus-ring); /* emerald-500 */
outline-offset: 2px;
```

仅 `:focus-visible` 触发，全组件统一。

### 组件变体模型

| 维度    | 可选值                                             | 说明                            |
| ------- | -------------------------------------------------- | ------------------------------- |
| variant | filled / outlined / ghost / link                   | 视觉层级（实心→线框→幽灵→文本） |
| color   | neutral / primary / danger                         | 语义色强调                      |
| size    | extra-small / small / medium / large / extra-large | 尺寸五档                        |
| shape   | rect / rounded / pill                              | 仅 filled/outlined 支持         |

### 常见风格偏差速查

Code Review 时对照以下具体数值：

| 属性        | 正确值                    | 常见错误        |
| ----------- | ------------------------- | --------------- |
| disabled    | `opacity: 0.56`           | 0.3、0.4        |
| 交互过渡    | `140ms ease`              | 200ms、300ms    |
| 浮层动效    | `160ms`                   | 200ms、300ms    |
| 焦点环      | `2px outline，2px offset` | 1px、3px        |
| hover 混色  | `6–12%` 透明混色          | 直接改背景色    |
| active 位移 | `translateY(1px)`         | translateY(2px) |

---

## 仓库约定

- 函数默认使用**箭头函数**风格。仅当框架边界、提升需求或外部 API 约束使函数声明更安全时，才允许例外，并需在变更中说明原因。
- React 组件必须使用 **TSX 文件**编写。除非有明确的工具限制并已文档化，否则不要引入 `React.createElement` 风格的组件写法。
- 受治理区域中新建或重命名的文件和目录必须使用**小写名称并使用连字符分隔**（kebab-case）。
- 在 `packages/components`、`packages/hooks` 和 `packages/utils` 中，每个受治理源码单元都应位于自己的 `src/<unit-name>/` 目录下。
- 每个受治理源码单元都应将本地入口文件和单测保留为同目录下的 `index` 与 `index.test`（**colocate 单测**）。
- `packages/` 下的新包默认不得保留包级专用构建配置；应优先复用 Vite+ 统一约定。
- commit message 格式：`<type>(<scope>): <summary>`（scope 有意义时），或 `<type>: <summary>`。
- 推荐 commit type：`feat`、`fix`、`refactor`、`docs`、`test`、`build`、`chore`。
- commit subject 使用祈使语气、小写，聚焦单一逻辑变更。格式通过 `.vite-hooks/commit-msg` 强制校验。

## 最近变更

- **20260329-distill-design-style**：引入「设计风格」章节；完成 AGENTS.md → CLAUDE.md 全面迁移；清理 Codex 遗留文件
- **20260327-ark-ui-integration**：引入 `@ark-ui/react` 作为组件行为基础层；迁移 popover 组件；建立后续交互型组件开发范式
- **20260317-repo-conventions**：仓库治理规则（箭头函数、TSX-first、kebab-case、单测 colocate）
- **20260316-ui-monorepo-foundation**：monorepo 边界、显式样式导入、受控主题 token、Storybook/website 职责分离

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
