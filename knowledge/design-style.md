---
name: design-style
description: 从 Button、Popover、Text 及全量 Phase 2/3 组件提炼的设计风格——字体/色彩/圆角/动效/焦点/变体模型/控件约定，新组件开发的视觉与交互基准
type: project
---

从 `packages/react/src/` 全量组件（button、popover、text、input、badge、tabs、menu、checkbox、radio-group、switch、select、dialog、tooltip、toast、scroll-area、carousel、pagination 等）及 `packages/styles/` 中提炼，最后更新：2026-04-19。

**Why:** 将组件代码中隐含的设计决策显式化，使后续所有组件开发无需反向推断，保持视觉与交互一致性。

**How to apply:** 规划新组件的 spec/plan 时，以本文件作为设计约束的事实来源；实现时对照具体数值，避免偏差。

---

## 字体排印

字体族（优先级顺序）：Source Han Serif CN Web → Songti SC → STSong → SimSun → NSimSun → serif

body 和 display 使用同一字族（宋体/serif），有别于常见的无衬线方案。

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

---

## 色彩系统

语义色三档：neutral（默认）/ primary（品牌绿）/ danger（红）

| 语义         | Token                        | 调色板值    |
| ------------ | ---------------------------- | ----------- |
| 品牌/主色    | `--ui-color-brand-bg`        | emerald-700 |
| 品牌 hover   | `--ui-color-brand-bg-hover`  | emerald-800 |
| 品牌 active  | `--ui-color-brand-bg-active` | emerald-900 |
| 危险         | `--ui-color-danger-bg`       | red-700     |
| 焦点环       | `--ui-color-focus-ring`      | emerald-500 |
| 链接         | `--ui-color-link`            | emerald-700 |
| 正文         | `--ui-color-text`            | neutral-950 |
| 辅助文字     | `--ui-color-text-muted`      | slate-700   |
| 画布（底层） | `--ui-color-canvas`          | white       |
| 表面（卡片） | `--ui-color-surface`         | neutral-50  |
| 边框（默认） | `--ui-color-border`          | slate-300   |
| 边框（强调） | `--ui-color-border-strong`   | slate-400   |

---

## 圆角档位

| 档位  | 变量                | 值     | 适用场景                                 |
| ----- | ------------------- | ------ | ---------------------------------------- |
| rect  | `--ui-radius-rect`  | 0      | 贴合容器边缘的嵌入式元素、Input/Textarea |
| float | `--ui-radius-float` | 0.4rem | ghost/link 按钮、Tooltip、浮层内小元素   |
| auto  | `--ui-radius-auto`  | 0.8rem | filled/outlined 按钮、Card、Dialog panel |
| pill  | `--ui-radius-pill`  | 999px  | Badge、Switch track、胶囊型按钮、下划线  |

---

## 阴影

`--ui-shadow-soft`：`0 18px 40px rgba(24, 33, 29, 0.12)`

适用场景：浮层（Popover、Dialog）、卡片。特点：大模糊半径、低不透明度，产生柔和漂浮感。

---

## 交互反馈

```
hover 背景  = color-mix(in srgb, <base-color>  6–12%, transparent)
active 背景 = color-mix(in srgb, <base-color> 10–18%, transparent)
active 位移 = translateY(1px)
disabled    = opacity: 0.56，cursor: not-allowed
loading     = spinner 覆盖图标，cursor: default
```

---

## 过渡与动效

```
交互元素过渡：
  duration: 140ms
  easing: ease
  properties: background, border-color, color, box-shadow, transform

浮层入场：
  duration: 160ms
  easing: cubic-bezier(0.22, 1, 0.36, 1)
  from: translateY/X(6px) + scale(0.98) + opacity 0
  to:   translate3d(0,0,0) + scale(1) + opacity 1

浮层出场：
  duration: 160ms
  easing: ease
  timing: forwards
  from: translate3d(0,0,0) + scale(1) + opacity 1
  to:   translateY/X(4.2px) + scale(0.98) + opacity 0

link 下划线展开：
  duration: 260ms
  easing: ease
  property: clip-path

loading spinner：
  duration: 0.9s linear infinite
  prefers-reduced-motion: 1.8s linear infinite

prefers-reduced-motion 降级：
  浮层 transform 归零（translateY/X(0)）
  link clip-path 过渡禁用
```

---

## 焦点样式

所有可交互元素统一：

```css
outline: 2px solid var(--ui-color-focus-ring); /* emerald-500 */
outline-offset: 2px;
```

仅 `:focus-visible` 时显示，不在鼠标点击时触发。

**实现规则**：

- 简单元素（button、a、input）：直接在元素上 `:focus-visible { outline: ... }`
- 复合控件（Checkbox、RadioGroup、Switch）：父容器用 `:has(:focus-visible)` 选择器控制子元素 outline，**禁止使用 `:focus-within`**（后者在鼠标点击时也触发）
- Overlay 触发器（Popover、Tooltip）：outline 应用在触发器元素本身，不是浮层内容

---

## 组件变体模型

四个正交维度（以 Button 为参考实现）：

| 维度    | 可选值                                             | 说明                            |
| ------- | -------------------------------------------------- | ------------------------------- |
| variant | filled / outlined / ghost / link                   | 视觉层级（实心→线框→幽灵→文本） |
| color   | neutral / primary / danger                         | 语义色强调                      |
| size    | extra-small / small / medium / large / extra-large | 尺寸五档                        |
| shape   | rect / rounded / pill                              | 仅 filled/outlined 支持         |

约束：ghost 和 link 不支持 shape prop；IconButton 不支持 link variant。

---

## 主题机制

- 所有视觉决策通过 CSS 自定义属性（`--ui-*`）表达，无硬编码值。
- 主题切换：通过 `[data-theme='light']` / `[data-theme='dark']` 属性实现，在 `:root` 设置默认（light）。
- `@deweyou-design/styles` 是 token 的唯一事实来源；组件直接消费 `--ui-*` 变量，不内联 token 值。

---

## 控件约定

### 表单控件（Checkbox、RadioGroup、Switch）

- 控件尺寸：`1rem × 1rem`（标准），间距用 `gap: 0.5rem`
- label 字号：`0.875rem`，`line-height: 1.4`，颜色 `--ui-color-text`
- 选中态：背景 `--ui-color-brand-bg`，边框同色
- 禁用态：`opacity: 0.56`，`cursor: not-allowed`
- 过渡：`background 140ms ease, border-color 140ms ease`
- focus ring：通过 `:has(:focus-visible)` 控制，不用 `:focus-within`

### 浮层组件（Popover、Tooltip、Dialog、Toast）

- 所有浮层必须通过 portal 渲染到 `document.body`，不受父容器 overflow 限制
- z-index 层级：Tooltip < Popover/Dropdown < Dialog < Toast（Toast 最顶层）
- 背景：Dialog/Card 用 `--ui-color-surface`；Tooltip 用 `--ui-color-text`（深色反转）
- 阴影：浮层统一用 `--ui-shadow-soft`
- 动画：入场 `cubic-bezier(0.22, 1, 0.36, 1)`，出场 `ease`，均 `160ms`

### 复合组件（Compound Components）

- 采用 namespace pattern：`Dialog.Root` / `Dialog.Content` / `Dialog.Trigger`
- Size prop 通过 React Context 向下传递（Root → 子组件），子组件不需要重复声明 size
- 共享状态（placeholder、disabled、size）都用 Context 传递，不 prop drilling

### 滚动条（ScrollArea）

- 默认隐藏（`opacity: 0`），hover 根元素或滚动中/拖拽时显示（`opacity: 1`）
- 过渡：`opacity 200ms ease`
- 滚动条宽度：`8px`，thumb 颜色：`color-mix(in srgb, --ui-color-text 28%, transparent)`
- 样式：macOS 风格，圆角 pill，无轨道背景

### 分页（Pagination）

- 支持 `button`（默认，有边框）和 `link`（纯文字）两种 variant
- 当前页：button 模式用 `--ui-color-brand-bg` 背景；link 模式用 brand 色文字 + 加粗
- 省略号：`--ui-color-text-muted`，无交互态

### 选中状态指示

- Select item 选中：右侧 `✓`，颜色 `--ui-color-brand-bg`（通过 `data-state='checked'` + CSS `::after` 实现）
- RadioGroup item 选中：圆心实色点（`0.4375rem × 0.4375rem`，颜色 `--ui-color-brand-bg`）
- Checkbox 选中：白色 checkmark SVG，背景 `--ui-color-brand-bg`
