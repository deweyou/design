# Deweyou 设计系统知识库

> 受众：AI 辅助开发、组件实现、网站/移动端界面设计评审
> 来源：仓库现有组件实现 + Claude Design handoff（Deweyou Design System）
> 目标：沉淀设计意图与不可轻易从代码推断的判断规则，而不是复述每个组件实现。

---

## 设计理念

Deweyou Design 是 Dewey Ou 的个人设计系统。它服务于博客、组件预览站和小型工具应用，不追求通用 SaaS 风格，而追求克制、清楚、有字形记忆点的个人产品气质。

核心判断语是：**Simple, clean, and with clean lines. Less is more.**

落到界面上有五条原则：

- **黑体承载控件，宋体承载内容**：默认 UI、导航、表单、按钮、tooltip 等控件使用思源黑体方向；Markdown、Text 内容排版和展示标题保留思源宋体方向，作为品牌字形记忆点。
- **语义少于装饰**：全局只承认 neutral、primary、danger 三个组件语义色。色彩用于表达角色，不用于制造热闹。
- **中性画布承载内容**：页面底色使用中性浅灰/白色层级，不使用奶黄或米色作为默认底；深色主题也应像纸面墨色，而不是高对比发光界面。
- **边框优先于阴影**：卡片、容器、表单首先用 1px 边框建立结构。阴影只表达浮层抬升，不承担普通分组职责。
- **排版精度胜过插画装饰**：不要用渐变背景、hero 图片、emoji、玻璃拟态或大面积插画补气氛。系统的辨识度来自宋体、留白、线条、圆角和极少量绿色。

这些原则优先于单个页面的临时审美。若某个需求看起来需要更多颜色、更多装饰或更戏剧化动效，先判断是否已经偏离 Deweyou 的个人设计语言。

---

## 内容与语气

主要界面文案使用简体中文，可内联英文技术词，如 `Popover 内容`、`Component Library · v1.0`。

语气应当是事实性的、技术性的、克制的：

- 用短句和清楚的名词，不写营销式承诺。
- 操作用祈使语气，如 `打开菜单`、`复制`、`删除`。
- 少用代词，避免“我们为你打造”这类广告语。
- 不使用 emoji。
- 中英文之间不手动插入空格，宋体本身已经承担视觉平衡。
- `·` 是系统内的签名分隔符，适合 eyebrow、section label、版本/类别并列信息。

示例：

```text
Component Library · v1.0
基于宋体字形节奏与温暖色系构建，27 个组件覆盖完整 UI 场景。深浅双主题，开箱即用。
Design & Components
Icons · Deweyou registry
查看全部图标 →
```

英文 eyebrow 或微标签可以使用 uppercase + letter-spacing，但只用于很小的辅助层级。控件文案默认走黑体，正文型内容和展示型标题走宋体。

---

## Token 是事实来源

组件代码只能消费 `--ui-*` 语义 token。调色板 primitive、具体 hex/hsl/rgba 值、临时透明度都不应出现在组件样式里。

正确方式：

```less
.root {
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
}

.root:hover {
  background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
}
```

错误方式：

```less
.root {
  background: #ffffff;
  border-color: var(--color-stone-200);
}

.root:hover {
  background: rgba(28, 25, 23, 0.08);
}
```

新增视觉值前先问三个问题：

1. 这是设计系统可复用的 primitive，还是某个页面一次性布局需要？
2. 它能否由现有语义 token + `color-mix()` 推导？
3. 它是否会引入第四种语义角色或第五种圆角/阴影层级？

若答案显示它会扩大系统语言，必须先更新设计文档和 token，再实现组件。

---

## 色彩系统

### 语义角色

| 角色    | 视觉来源 | 用途                             |
| ------- | -------- | -------------------------------- |
| neutral | stone    | 默认文字、边框、表面、中性操作   |
| primary | emerald  | 品牌强调、主要操作、选中、焦点环 |
| danger  | red      | 破坏性操作、错误状态             |

`warning` 可以在 Toast 等反馈类组件中作为支持角色存在，但不要把它扩展成通用组件 color。Badge、Button、Tabs、Menu、表单控件等常规组件应只暴露三色语义。

### 品牌绿

UI 的 primary 是深 emerald，不是 logo 里的亮 mint 渐变。logo 渐变只属于字标本身，不应用作按钮、背景、卡片或浮层装饰。

### 画布与表面

浅色主题使用中性浅灰 canvas 和白色 surface；surface 和 raised surface 逐级抬高。不要使用奶黄、米色或大面积渐变承载页面气氛。

深色主题应保持暖黑、低眩光。文字不是纯白发光，而是接近纸面墨色的 warm off-white。

---

## 字体与排版

字体栈：

```css
--ui-font-sans:
  'Source Han Sans SC Web', 'PingFang SC', 'Heiti SC', 'Microsoft YaHei', 'Noto Sans CJK SC',
  sans-serif;
--ui-font-serif: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', 'NSimSun', serif;
--ui-font-body: var(--ui-font-sans);
--ui-font-control: var(--ui-font-sans);
--ui-font-content: var(--ui-font-serif);
--ui-font-display: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', serif;
--ui-font-mono: 'IBM Plex Mono', 'SFMono-Regular', ui-monospace, monospace;
```

排版规则：

- body/control 使用黑体/Sans，优先服务组件可读性和控件密度。
- content/display 使用宋体/Serif，优先用于 MarkdownRender、Text、长文和展示型标题。
- 只使用 400 / 500 / 600 / 700 四档字重。
- display 行高紧，正文行高舒展。
- 页面中同级标题不要混用尺寸；组件内部标题不要使用 hero 级字号。
- 技术 token、代码片段、包名用 mono，但不要把普通英文 UI 文案切到 mono。
- 使用 `<Text>` 组件承接排版语义，不要直接在组件中裸写 h1-h5/p 再补样式。

字体资产：

- `theme-with-fonts.css` 同时声明 `Source Han Sans SC Web` 和 `Source Han Serif CN Web`。
- `theme.css` 只声明 token，不强制加载字体文件；生产站点应通过 font subset 插件或自有字体加载策略显式引入。
- Source Han Sans SC 的官方静态字重中没有 600；系统把 600 语义映射到 Medium 文件，避免浏览器临时合成过重字形。
- `fontSubset.vite({ inject: true })` 可在 Vite SPA 中自动注入 subset CSS；库、SSR、多入口应用应保持显式 import。
- `fullFonts: 'idle'` 是可选兜底策略：首屏仍使用 subset，页面空闲后通过 FontFace API 注册全量字体。全量字体文件名使用字体发行版本号而不是构建 hash，例如 `source-han-serif-cn-full-400-v2.003R.otf`，便于浏览器长期缓存。

字号基线：

| 层级    | 字号                       | 行高 | 字重 |
| ------- | -------------------------- | ---- | ---- |
| h1      | clamp(2.8rem, 5vw, 4.6rem) | 1.02 | 700  |
| h2      | 2.3rem                     | 1.08 | 600  |
| h3      | 1.85rem                    | 1.14 | 600  |
| h4      | 1.45rem                    | 1.22 | 600  |
| h5      | 1.15rem                    | 1.32 | 700  |
| body    | 1rem                       | 1.6  | 400  |
| caption | 0.875rem                   | 1.45 | 400  |

---

## 空间、尺寸与形态

空间使用 4px grid：

| Token | 值   |
| ----- | ---- |
| xs    | 4px  |
| sm    | 8px  |
| md    | 16px |
| lg    | 24px |
| xl    | 40px |

交互组件尺寸五档：

| size | 高度 | 用途                         |
| ---- | ---- | ---------------------------- |
| xs   | 24px | 紧凑表格操作、内联辅助按钮   |
| sm   | 32px | 工具栏、侧边栏、表单次要操作 |
| md   | 40px | 默认尺寸                     |
| lg   | 48px | 页面主要操作、关键表单       |
| xl   | 56px | hero 或落地页 CTA            |

圆角只有四档：

| 档位  | 值    | 判断方式                                 |
| ----- | ----- | ---------------------------------------- |
| rect  | 0     | 输入、文本域、嵌入式表单元素             |
| float | 4px   | ghost/link 按钮、tooltip、小型轻浮层     |
| auto  | 8px   | filled/outlined 按钮、card、dialog、menu |
| pill  | 999px | badge、switch、胶囊操作                  |

不要写 `6px`、`10px`、`12px` 这类中间圆角。如果视觉不对，通常是组件分类错了，而不是缺少新圆角。

---

## 组件变体模型

公开组件优先使用四个正交维度：

| 维度    | 问题             | 可选值                                   |
| ------- | ---------------- | ---------------------------------------- |
| variant | 视觉层级是什么？ | `filled` / `outlined` / `ghost` / `link` |
| color   | 语义意图是什么？ | `neutral` / `primary` / `danger`         |
| size    | 在布局中占多大？ | `xs` / `sm` / `md` / `lg` / `xl`         |
| shape   | 边角形态是什么？ | `rect` / `float` / `auto` / `pill`       |

变体维度要互相独立。不要让 `variant="primary"` 同时表达视觉层级和颜色，也不要让 `size` 偷偷改变圆角。

只有当多个组件都需要新的表达能力时，才新增维度；单个页面的偶发需求优先用 `className` 在应用侧处理。

复杂交互组件可以拥有自己的领域能力，例如 Tabs 的 overflow、菜单化展示、受控状态等。这类能力不应为了“通用视觉”被删掉；需要收敛的是默认视觉语言和 token 使用，不是行为能力。

---

## 交互状态

状态表现必须稳定、短促、低戏剧性：

| 状态     | 规则                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| hover    | 使用 `color-mix()` 让基色加深约 8%                                                          |
| active   | 加深约 14%，并 `transform: translateY(1px)`                                                 |
| disabled | `[data-disabled] { opacity: 0.56; cursor: not-allowed; }`                                   |
| focus    | 仅 `:focus-visible`，使用统一柔和 `box-shadow` 替代默认 `outline`，不改布局性 border        |
| loading  | 保留原内容占位，文字 `color: transparent`，中心 spinner overlay，避免按钮宽度或文字布局跳动 |

焦点环标准写法：

```less
.root:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-color-focus-ring) 18%, transparent);
  outline: none;
}
```

所有可交互 disabled 样式都应通过属性选择器表达。不要用 React inline style 控制颜色、透明度或 cursor。

---

## 动效

动效只服务于状态确认，不制造视觉表演。

| 场景     | 时长  | 曲线                           | 属性                                                   |
| -------- | ----- | ------------------------------ | ------------------------------------------------------ |
| 交互元素 | 140ms | ease                           | background, border-color, color, box-shadow, transform |
| 浮层入场 | 160ms | cubic-bezier(0.22, 1, 0.36, 1) | opacity + 小幅 translate/scale                         |
| 浮层出场 | 160ms | ease                           | opacity + 小幅 translate/scale                         |
| Link     | 260ms | ease                           | underline / clip-path                                  |
| Spinner  | 0.9s  | linear infinite                | rotate                                                 |

必须响应 `prefers-reduced-motion`：

- spinner 和 loading indicator 停止无限旋转，保留静态可感知状态。
- 浮层保留 opacity，移除位移和缩放。
- 普通交互 transition 可关闭。

## 响应式与移动端标准

组件库不使用内部 `isMobile` 判断，也不在不同组件里发明不同断点。移动端特化按能力和空间约束表达：

- 窄视口统一使用 `@ui-breakpoint-compact: 30rem`，来自 `@deweyou-design/styles/less/bridge`；尺寸型样式可消费同源 token `--ui-breakpoint-compact`。
- 触控目标使用 `--ui-touch-target-min`，默认 44px；视觉控件可以更小，但可点击根节点不能更小。
- 输入方式相关行为使用能力查询，如 `(pointer: coarse)`、`(hover: none)`，不要把它们混同为手机判断。
- safe-area 使用 `env(safe-area-inset-*)`，不要写固定 top/bottom offset 覆盖。
- Storybook 和 website 示例使用 `width: min(30rem, 100%)`、`max-width: 100%`、wrap 或滚动 rail，不写一次性 `480px` / `500px` 断点。

当 React 行为必须分叉时，优先暴露显式 prop，例如 `density`、`placement`、`modal`、`strategy`。只有无法用 CSS/能力查询表达时，才在应用层用统一 hook 判断 media query；组件内部不要直接读 `window.innerWidth`。

---

## 容器与浮层

卡片是内容容器，不是装饰卡片：

- 默认 `background: var(--ui-color-surface)`。
- 默认 `border: 1px solid var(--ui-color-border)`。
- 默认 `radius: var(--ui-radius-auto)`。
- 默认无 shadow。

浮层代表 z 轴抬升，应使用 shadow token：

| 层级                      | z-index token    | 阴影       |
| ------------------------- | ---------------- | ---------- |
| Tooltip                   | `--ui-z-tooltip` | sm 或 none |
| Popover / Dropdown / Menu | `--ui-z-popover` | md         |
| Dialog                    | `--ui-z-dialog`  | lg         |
| Toast                     | `--ui-z-toast`   | sm         |

Dialog backdrop 使用低调遮罩，不使用 blur/glassmorphism。不要引入 `backdrop-filter`。

所有浮层内容必须 Portal 到 `document.body`，避免被父级 `overflow` 或 z-index 上下文裁切。复杂交互和 ARIA 由 Ark UI 负责，视觉由 CSS Modules + Less 负责。

---

## 表单控件

表单控件应体现“线条清楚、输入区域安静”的原则：

- Input/Textarea 使用 `rect`，不做胶囊输入框。
- 默认背景为 surface，边框为 `--ui-color-border-strong`。
- focus 使用统一焦点环，不通过加粗 border 表达。
- placeholder 使用 muted text。
- disabled 通过 `[data-disabled]` 表达，整体 opacity 0.56。
- Checkbox/Radio/Switch 的选中态使用 primary；危险语义不应出现在基础选择控件里，除非业务状态明确要求。

---

## 图标

所有生产组件中的图标都从 `@deweyou-design/react-icons` 导入。组件内部不要维护私有 SVG 图标，也不要直接依赖上游 icon 包。

图标规则：

- `@deweyou-design/react-icons` 由 Deweyou curated registry 驱动，默认 SVG 来源为 `tdesign-icons-svg`。
- 应用代码优先使用命名导入，例如 `import { SearchIcon } from '@deweyou-design/react-icons'`，不要为了普通使用场景引入整个 icon namespace。
- 图标支持 `xs` / `sm` / `md` / `lg` / `xl` 尺寸语义，默认 `md`。
- 图标支持 `inherit` / `neutral` / `primary` / `danger` 颜色语义，默认 `inherit`。
- icon-only action 必须使用 `IconButton`、`Button.Icon` 或带清晰 accessible name 的交互控件承载语义。
- 不使用 emoji 或 Unicode 符号替代图标，`·` 分隔符除外。

logo 是例外：`assets/logo.svg` / `logo-animated.svg` 的 mint 渐变只属于 Dewey Ou 字标。静态 logo 适合 header；动画 logo 只适合 hero、loading 或品牌展示时刻。

---

## 页面与 H5 应用

website 和 H5 都应继承同一套系统语言，而不是分别发明视觉风格。

页面布局基线：

- 首屏可以有 hero，但 hero 应以字标、标题、短文案和组件实例为主，不使用大图背景或插画。
- 内容最大宽度保持克制，常见中心内容宽度约 640px，组件展示区可以更宽。
- Section header 使用小号 uppercase eyebrow + 宋体标题。
- 组件 demo 可以密集，但分组要靠 gap、细边框、短分隔线，而不是嵌套卡片。
- 44×2px 的短横线可作为 h1 下的品牌 motif，但不要滥用为每个卡片装饰。

H5 设计应保留这些原则：

- 不为移动端引入新的色彩、圆角或字体系统。
- 触控目标不小于 `--ui-touch-target-min`，默认使用 `md` 或 `lg`。
- 底部/浮层交互仍按 Ark UI/Portal/焦点规则实现。
- 文案更短，但语气不变。

---

## 不要做的事

- 不要新增 blue、purple、orange 等通用组件语义色。
- 不要把 warning 扩展成所有组件都有的 color。
- 不要在组件里 hardcode hex、hsl、rgba、box-shadow 或圆角值。
- 不要用渐变背景、光斑、玻璃拟态、bokeh、纯装饰插图撑页面。
- 不要把品牌 logo 的 mint gradient 挪到按钮、卡片或页面背景。
- 不要在组件内部复制 SVG 图标。
- 不要为了视觉“更高级”加大阴影、延长动效或堆叠卡片。
- 不要让 app/website 的临时 demo 成为 package 行为的唯一来源。

---

## 评审检查清单

修改组件或页面时，至少检查：

- 是否只消费 `--ui-*` 语义 token？
- 是否仍然只有 neutral / primary / danger 三个常规语义色？
- 是否保持宋体为 body/display 字体？
- 圆角是否属于 rect / float / auto / pill？
- 卡片是否 border-first，浮层才使用 shadow？
- focus 是否只在 `:focus-visible` 下出现，并使用统一柔和 `box-shadow`？
- 移动端/窄视口规则是否使用 `@ui-breakpoint-compact` 或能力查询，而不是私有像素断点？
- loading 是否保留布局，不造成按钮或文字跳动？
- 图标是否来自 `@deweyou-design/react-icons`？
- 文案是否简体中文优先、技术性、克制、无 emoji？
- website 和 H5 是否复用同一套理念，而不是另起一套移动端视觉？

_Last updated: 2026-05-17 | Reason: added shared responsive/mobile standards and updated focus/reduced-motion rules._
