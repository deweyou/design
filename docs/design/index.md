# 设计风格

从 Button、Popover、Text 组件及 `@deweyou-ui/styles` 提炼，是新组件开发的视觉与交互基准。

## 字体排印

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

## 色彩系统

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

## 圆角档位

| 档位    | 值     | 适用场景                          |
| ------- | ------ | --------------------------------- |
| rect    | 0      | 贴合容器边缘的嵌入式元素          |
| rounded | 0.4rem | ghost/link 按钮、浮层默认、小控件 |
| auto    | 0.8rem | filled/outlined 按钮默认          |
| pill    | 999px  | 标签、胶囊型按钮                  |

## 阴影

`--ui-shadow-soft`：`0 18px 40px rgba(24, 33, 29, 0.12)` — 大模糊半径、低不透明度，用于浮层和卡片

## 交互反馈

```
hover 背景  = color-mix(in srgb, <color>  6–12%, transparent)
active 背景 = color-mix(in srgb, <color> 10–18%, transparent) + translateY(1px)
disabled    = opacity: 0.56，cursor: not-allowed
```

## 过渡与动效

```
交互元素：140ms ease（background, border-color, color, box-shadow, transform）
浮层入场： 160ms cubic-bezier(0.22, 1, 0.36, 1)  — translateY/X(6px) + scale(0.98) → 归零
浮层出场： 160ms ease forwards                   — 归零 → translateY/X(4.2px) + scale(0.98)
prefers-reduced-motion：浮层 transform 归零，link clip-path 过渡禁用
```

## 焦点

```css
outline: 2px solid var(--ui-color-focus-ring); /* emerald-500 */
outline-offset: 2px;
```

仅 `:focus-visible` 触发，全组件统一。

## 组件变体模型

| 维度    | 可选值                                             | 说明                            |
| ------- | -------------------------------------------------- | ------------------------------- |
| variant | filled / outlined / ghost / link                   | 视觉层级（实心→线框→幽灵→文本） |
| color   | neutral / primary / danger                         | 语义色强调                      |
| size    | extra-small / small / medium / large / extra-large | 尺寸五档                        |
| shape   | rect / rounded / pill                              | 仅 filled/outlined 支持         |

## 常见风格偏差速查

Code Review 时对照以下具体数值：

| 属性        | 正确值                    | 常见错误        |
| ----------- | ------------------------- | --------------- |
| disabled    | `opacity: 0.56`           | 0.3、0.4        |
| 交互过渡    | `140ms ease`              | 200ms、300ms    |
| 浮层动效    | `160ms`                   | 200ms、300ms    |
| 焦点环      | `2px outline，2px offset` | 1px、3px        |
| hover 混色  | `6–12%` 透明混色          | 直接改背景色    |
| active 位移 | `translateY(1px)`         | translateY(2px) |
