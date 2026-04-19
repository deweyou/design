# 设计系统重写 · 设计文档

> Created: 2026-04-19
> Scope: `packages/styles`、`packages/react-icons`
> 不含：组件库全量实现（独立 spec）

---

## 背景与目标

当前设计系统存在以下问题：

- Token 层缺乏 global / semantic 分层，浅色和暗色 token 混在一起，难以扩展暗色主题
- 色彩使用 slate（冷蓝灰）作为中性色，与宋体字族和墨绿品牌色的温暖气质不符
- 圆角档位语义模糊（`rounded` / `auto` 含义不清晰），且全局统一圆角不适合"控件锐利、浮层柔和"的设计意图
- `react-icons` 使用异步动态加载架构，2347 个 export 文件 + 近 12000 行生成代码，图标渲染有 loading placeholder 闪烁，维护成本高

**目标**：在保持现有 `--ui-*` 命名空间的前提下，全面重写 token 体系和图标包，建立支持暗色主题的双层 token 架构，并确立「温暖简洁 + 线条感」的视觉风格。

---

## 设计风格定位

| 维度   | 方向               | 说明                           |
| ------ | ------------------ | ------------------------------ |
| 字体   | 保留宋体字族       | 温暖、印刷感，不变             |
| 底色   | 暖白（非纯白）     | canvas `#fefcf8`，有纸张质感   |
| 主色   | 墨绿（深 emerald） | 浅色 emerald-900，沉稳不跳     |
| 中性色 | Stone（暖棕灰）    | 替换 Slate（冷蓝灰）           |
| 线条感 | outlined 控件优先  | 边框作为结构语言，少用背景色块 |
| 圆角   | 语境分层           | 控件 0 / 浮层 4px / 标记 pill  |

---

## 一、Token 架构

### 1.1 两层结构

**Global Tokens**（原始色板）

- 存放在 `packages/styles/src/css/palette.css`
- 命名格式：`--ui-palette-<color>-<shade>`，如 `--ui-palette-stone-200`、`--ui-palette-emerald-900`
- 浅色 canvas 系列为自定义暖白（`warm-white-1/2/3`），不是标准 stone 色阶
- 不带语义角色，不参与主题切换
- 组件层不得直接引用 global token

**Semantic Tokens**（语义变量）

- 存放在 `packages/styles/src/css/theme-light.css` 和 `theme-dark.css`
- 通过 `[data-theme="light"]` / `[data-theme="dark"]` 属性切换
- 命名格式：`--ui-color-<role>`
- 组件只消费 semantic token，不消费 global token

### 1.2 Semantic Token 清单

**画布与表面**

| Token                       | 浅色                                     | 暗色                                  | 说明                    |
| --------------------------- | ---------------------------------------- | ------------------------------------- | ----------------------- |
| `--ui-color-canvas`         | `--ui-palette-warm-white-1`（`#fefcf8`） | `--ui-palette-stone-950`（`#0c0a09`） | 页面底色                |
| `--ui-color-surface`        | `--ui-palette-warm-white-2`（`#fffefb`） | `--ui-palette-stone-900`（`#1c1917`） | 卡片、面板底色          |
| `--ui-color-surface-raised` | `--ui-palette-warm-white-3`（`#ffffff`） | `--ui-palette-stone-800`（`#292524`） | 悬浮层（Popover、Menu） |

> 层次逻辑：浅色主题中 canvas 最亮 → surface 次之 → surface-raised 最亮；暗色主题反转，canvas 最暗 → surface-raised 最亮（略突出）。

**边框**

| Token                      | 浅色                                  | 暗色                                  |
| -------------------------- | ------------------------------------- | ------------------------------------- |
| `--ui-color-border`        | `--ui-palette-stone-200`（`#e7e5e4`） | `--ui-palette-stone-700`（`#44403c`） |
| `--ui-color-border-strong` | `--ui-palette-stone-300`（`#d6d3d1`） | `--ui-palette-stone-600`（`#57534e`） |

**文字**

| Token                      | 浅色                                  | 暗色                                  |
| -------------------------- | ------------------------------------- | ------------------------------------- |
| `--ui-color-text`          | `--ui-palette-stone-950`（`#1c1917`） | `--ui-palette-stone-50`（`#fafaf9`）  |
| `--ui-color-text-muted`    | `--ui-palette-stone-500`（`#78716c`） | `--ui-palette-stone-400`（`#a8a29e`） |
| `--ui-color-text-disabled` | `--ui-palette-stone-400`（`#a8a29e`） | `--ui-palette-stone-600`（`#57534e`） |

**品牌色（Emerald 下沉）**

| Token                        | 浅色                     | 暗色                       | 说明                   |
| ---------------------------- | ------------------------ | -------------------------- | ---------------------- |
| `--ui-color-brand-bg`        | emerald-900（`#064e3b`） | emerald-600（`#059669`）   | 深底需更亮绿才有对比度 |
| `--ui-color-brand-bg-hover`  | emerald-950（`#022c22`） | emerald-500（`#10b981`）   |                        |
| `--ui-color-brand-bg-active` | emerald-950 + overlay    | emerald-400（`#34d399`）bg |                        |
| `--ui-color-brand-text`      | emerald-800（`#065f46`） | emerald-400（`#34d399`）   | ghost/link 用          |
| `--ui-color-focus-ring`      | emerald-600（`#059669`） | emerald-400（`#34d399`）   |                        |

**危险色**

| Token                    | 浅色                 | 暗色                 |
| ------------------------ | -------------------- | -------------------- |
| `--ui-color-danger-bg`   | red-700（`#b91c1c`） | red-500（`#ef4444`） |
| `--ui-color-danger-text` | red-700（`#b91c1c`） | red-400（`#f87171`） |

---

## 二、圆角策略

现有四档（`rect` / `rounded` / `auto` / `pill`）调整为三档，语义更清晰：

| 档位    | CSS 变量            | 值      | 适用场景                                                    |
| ------- | ------------------- | ------- | ----------------------------------------------------------- |
| `rect`  | `--ui-radius-rect`  | `0`     | 嵌入式控件：Button、Input、Select、Checkbox、Tab、内嵌 Card |
| `float` | `--ui-radius-float` | `4px`   | 浮动容器：Popover、Menu、Dialog、Tooltip、独立 Card         |
| `pill`  | `--ui-radius-pill`  | `999px` | 小型标记：Tag、Badge、Chip                                  |

**组件默认值映射**：

- Button（filled / outlined）：`rect`（原来是 `rounded` 0.4rem）
- Button（ghost / link）：`rect`（不变）
- Popover / Menu / Dialog：`float`（原来是 `rounded`）
- Tag / Badge：`pill`（不变）

---

## 三、图标系统

### 3.1 基础图标集

使用 **Tabler Icons**（`@tabler/icons-react`，MIT 协议）替换现有 Iconify 方案。

选型理由：

- Square line caps / miter joins（与无圆角风格一致）
- 1.5px stroke width，24×24 viewport，线条感强
- 4000+ 图标，持续维护
- 同步 SVG 组件，无需 registry / 动态加载

### 3.2 包架构重写

`packages/react-icons` 从"异步加载架构"改为"薄封装层"：

**改变前**：

```
Icon（async） → loadIconDefinition → dynamic import → BaseIcon
+ 2347 export 文件 + 11748 行生成 loaders + icon-registry
```

**改变后**：

```
TablerIcon → 统一 wrapper（square caps + currentColor） → 导出
+ src/custom/ 放自定义图标，接口一致
```

**核心 wrapper**（所有导出图标共用）：

```tsx
// src/icon-wrapper/index.tsx
type IconWrapperProps = {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
};

// 统一 override：square caps + miter joins
const defaultTablerProps = {
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  stroke: 'currentColor',
};
```

**自定义图标规范**（`src/custom/`）：

- 24×24 viewport，1.5px stroke
- Square line caps / miter joins
- `currentColor`，不硬编码颜色
- 每个图标一个文件，命名 kebab-case

### 3.3 公开 API

- 命名图标：`<HomeIcon size={20} aria-label="首页" />`
- 通用入口（可选）：`<Icon name="home" size={20} />`（同步，基于 named export map）
- `size` prop 接受数字（px）或 CSS 字符串
- `aria-label` 缺省时图标为 `aria-hidden`

---

## 四、文件结构变更

### packages/styles

```
src/
├── css/
│   ├── palette.css        # 新增：global token（色板原始值）
│   ├── theme-light.css    # 重写：semantic token，浅色映射
│   ├── theme-dark.css     # 新增：semantic token，暗色映射
│   ├── radius.css         # 新增：三档圆角变量
│   └── typography.css     # 保留：字体栈（不变）
└── index.ts
```

### packages/react-icons

```
src/
├── icon-wrapper/
│   └── index.tsx          # 新增：Tabler 统一 wrapper
├── icons/                 # 新增：从 @tabler/icons-react 封装的命名导出
│   ├── home.tsx
│   └── ...
├── custom/                # 保留目录：自定义 SVG 图标
└── index.ts               # 公开 API 入口
```

旧的 `exports/`、`generated/`、`foundation-icons/`、`icon-registry/` 目录全部删除。

---

## 五、不在本 spec 范围内

- 现有 5 个组件（Button、Text、Popover、Menu、Tabs）的样式适配——token 重写后需要更新，但作为独立任务跟进
- 组件库全量实现——独立 spec
- Storybook / website 的主题切换 UI——独立 spec

---

## 六、验证标准

- `vp check` 全量通过（类型、lint、格式化）
- `vp test` 在浅色和暗色主题下均通过
- 所有 semantic token 在两种主题下都有明确映射，无遗漏
- `react-icons` 不再有异步 loading state，图标渲染同步
- 自定义图标与 Tabler 图标在视觉上线条属性一致
