# 设计风格文档（AI 操作手册）

> 受众：AI 辅助开发（harness 知识库）
> 最后更新：2026-04-20
> 用途：AI 在构建或修改组件时的决策依据

---

## 0. 设计哲学

在没有明确规定的情况下，依据以下原则推断正确决策：

**原则一：语义优先，永不触碰原始值**
组件代码只能消费语义 token（如 `--ui-color-brand-bg`），禁止直接引用调色板原始值（如 `--color-emerald-700`）。原始值是给主题层用的，不是给组件用的。

**原则二：CSS 变量是唯一真值**
所有视觉决策通过 `--ui-*` CSS 自定义属性表达。需要计算颜色变体时用 `color-mix()`，不要引入 JS 计算或 hardcode 透明度值。

**原则三：行为与样式解耦**
Ark UI 负责状态机、ARIA、焦点管理；CSS Modules + Less 负责全部视觉表现。不要在样式文件里处理状态逻辑，不要在 TS 里 inline 样式。

**原则四：宋体是品牌身份，不是偶然选择**
中英文 body/display 统一使用宋体。这是刻意的差异化选择，不要在组件里局部覆盖为无衬线字体，除非有充分的可读性理由并已文档化。

**原则五：最小色彩复杂度**
全局语义色只有三个角色：neutral、primary（emerald）、danger（red）。遇到需要新增颜色角色的场景，应优先思考是否能用现有三色解决，而不是扩展调色板。

---

## 1. 色彩系统

### 语义色三角色

| 角色    | 代表色  | 主要 Token                                                                      | 适用场景                               |
| ------- | ------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| neutral | stone   | `--ui-color-text`<br>`--ui-color-border`<br>`--ui-color-surface`                | 默认文字、边框、背景、中性按钮         |
| primary | emerald | `--ui-color-brand-bg`<br>`--ui-color-brand-bg-hover`<br>`--ui-color-focus-ring` | 主要行动按钮、选中态、品牌强调、焦点环 |
| danger  | red     | `--ui-color-danger-bg`<br>`--ui-color-danger-bg-hover`                          | 破坏性操作（删除、清空）、错误状态     |

### 场景决策树

**需要设置背景色时 →**

- 主要行动按钮或品牌强调元素 → `--ui-color-brand-bg`
- 危险/破坏性操作 → `--ui-color-danger-bg`
- 卡片/面板/表面 → `--ui-color-surface`
- 页面画布（最底层背景） → `--ui-color-canvas`
- hover/active 半透明反馈 → `color-mix(in srgb, <base-color> 8%, transparent)`

**需要设置文字色时 →**

- 主要正文/标题 → `--ui-color-text`
- 辅助说明/placeholder → `--ui-color-text-muted`
- 在品牌色背景上的文字 → `--ui-color-text-on-brand`
- 链接/可点击文字 → `--ui-color-brand-bg`（不需要额外 token）

**需要设置边框时 →**

- 普通分隔线/卡片边框 → `--ui-color-border`
- 输入框、强调边框 → `--ui-color-border-strong`
- 焦点轮廓 → `--ui-color-focus-ring`（用 `outline`，不是 `border`）

### 正确 / 错误示例

```less
// ✓ 消费语义 token
.root {
  background: var(--ui-color-brand-bg);
  color: var(--ui-color-text-on-brand);
}
.root:hover {
  background: var(--ui-color-brand-bg-hover);
}
// ✓ hover 反馈用 color-mix
.ghost:hover {
  background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
}

// ✗ 直接使用调色板原始值
.root {
  background: var(--color-emerald-700);
}
// ✗ hardcode rgba
.ghost:hover {
  background: rgba(28, 25, 23, 0.08);
}
// ✗ 使用未定义的颜色角色
.warning {
  background: var(--color-amber-500);
}
```

---

## 2. 字体排印

### 字族

```css
--ui-font-body: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', serif;
--ui-font-display: 'Source Han Serif CN Web', 'Songti SC', 'STSong', 'SimSun', serif;
--ui-font-mono: 'IBM Plex Mono', 'SFMono-Regular', monospace;
```

### 字号层级

| 层级    | 字号                       | 行高 | 字重 | 适用场景                 |
| ------- | -------------------------- | ---- | ---- | ------------------------ |
| h1      | clamp(2.8rem, 5vw, 4.6rem) | 1.02 | 700  | 页面主标题，每页最多一个 |
| h2      | 2.3rem                     | 1.08 | 600  | 页面次级标题/模块名      |
| h3      | 1.85rem                    | 1.14 | 600  | 卡片标题/区域标题        |
| h4      | 1.45rem                    | 1.22 | 600  | 列表组标题/侧边栏标题    |
| h5      | 1.15rem                    | 1.32 | 700  | 小节标题/表单分组标签    |
| body    | 1rem (16px)                | 1.6  | 400  | 段落正文，默认文字层级   |
| caption | 0.875rem (14px)            | 1.45 | 400  | 表单提示/时间戳/图注     |
| mono    | 0.875rem                   | 1.6  | 400  | 代码、token 名、技术标识 |

### 字重四档

| 字重     | 值  | 场景                             |
| -------- | --- | -------------------------------- |
| regular  | 400 | 正文、caption、表单输入值        |
| medium   | 500 | 强调词、Badge 文字、选中态菜单项 |
| semibold | 600 | h2–h4、卡片标题                  |
| bold     | 700 | h1、h5                           |

### 中英文混排规则

- 中英文之间**不手动插入空格**——宋体已为中英混排做优化，手动加空格会造成视觉不均匀
- 英文和数字在宋体下渲染为衬线体，这是设计的一部分，不要局部切换为无衬线字体
- 使用 `<Text>` 组件保证排版样式一致，不要直接使用裸 HTML 标签

```tsx
// ✓ 使用 Text 组件
<Text variant="h3">区域标题</Text>
<Text variant="caption" as="time">2026-04-20</Text>

// ✗ 裸 HTML 标签（无样式保障）
<h3>区域标题</h3>
```

---

## 3. 空间与形态

### 圆角四档

| 档位  | Token               | 值    | 适用场景                                    |
| ----- | ------------------- | ----- | ------------------------------------------- |
| rect  | `--ui-radius-rect`  | 0     | Input、Textarea、嵌入式元素                 |
| float | `--ui-radius-float` | 4px   | Ghost/Link 按钮、Tooltip、小浮层            |
| auto  | `--ui-radius-auto`  | 8px   | Filled/Outlined 按钮、Card、Dialog、Popover |
| pill  | `--ui-radius-pill`  | 999px | Badge、Switch、胶囊型按钮                   |

**选圆角档位决策树 →**

- 元素需要融入行文/表单区域 → `rect`
- 元素是悬浮提示或幽灵态（无实体感） → `float`
- 元素是独立实体容器（卡片、对话框、主按钮） → `auto`
- 元素需要胶囊/药丸形态（标签、开关） → `pill`

不要使用四档之外的任意圆角值。如现有档位不满足需求，应先评估场景分类是否有误，再考虑扩展。

### 尺寸变体

| 档位 | 高度 | 字号 | 适用场景                         |
| ---- | ---- | ---- | -------------------------------- |
| xs   | 24px | 12px | 紧凑表格操作、内联标签旁辅助按钮 |
| sm   | 32px | 14px | 工具栏、侧边栏、表单次要操作     |
| md   | 40px | 16px | **默认尺寸**，绝大多数场景首选   |
| lg   | 48px | 17px | 页面主要行动按钮、登录/注册表单  |
| xl   | 56px | 18px | 营销落地页 CTA、Hero 区域        |

同一表单/操作区域内尺寸应保持一致。通过 React Context 向下传递 `size`，避免 prop drilling。

---

## 4. 交互反馈规范

### 五种状态实现方式

| 状态     | 视觉实现                   | CSS 写法                                                                                 |
| -------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| hover    | 背景加深约 8%              | `color-mix(in srgb, var(--ui-color-text) 8%, transparent)`                               |
| active   | 背景加深约 14% + 下移 1px  | `color-mix(...14%...) ; transform: translateY(1px)`                                      |
| disabled | 整体降至 56% 不透明度      | `[data-disabled] { opacity: 0.56; cursor: not-allowed; }`                                |
| loading  | 文字隐藏，中心显示 spinner | `color: transparent; position: relative; ::after { spinner }`                            |
| focus    | emerald 焦点环，仅键盘触发 | `:focus-visible { outline: 2px solid var(--ui-color-focus-ring); outline-offset: 2px; }` |

### 焦点规范

- 焦点环使用 `outline`，不用 `border` 模拟（注：`box-shadow` 方案已列入优化计划，待 spec 落地后更新）
- 必须使用 `:focus-visible` 而非 `:focus`，确保鼠标点击不触发焦点环

```less
// ✓ 当前实现
.root:focus-visible {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: 2px;
}

// ✗ 错误：鼠标点击也触发
.root:focus {
  outline: 2px solid var(--ui-color-focus-ring);
}
```

### 常见陷阱

- 不要用 JS inline style 控制 disabled 样式，用 `[data-disabled]` 属性选择器
- 不要 hardcode `rgba()` 颜色，用 `color-mix()` 从语义 token 派生

---

## 5. 动效规范

### 四种场景

| 场景                       | 时长      | 曲线                           | 属性                                                   |
| -------------------------- | --------- | ------------------------------ | ------------------------------------------------------ |
| 交互元素（按钮、复选框等） | 140ms     | ease                           | background, border-color, color, box-shadow, transform |
| 浮层入场                   | 160ms     | cubic-bezier(0.22, 1, 0.36, 1) | opacity + translateY/X(6px) + scale(0.98→1)            |
| 浮层出场                   | 160ms     | ease                           | opacity + translateY/X(6px) + scale(1→0.98)            |
| Link 下划线展开            | 260ms     | ease                           | clip-path: inset(0 100%→0% 0 0)                        |
| Loading Spinner            | 0.9s 无限 | linear                         | transform: rotate(360deg)                              |

### 无障碍适配

所有动效必须响应 `prefers-reduced-motion`：

```less
@media (prefers-reduced-motion: reduce) {
  // Spinner 减缓但保留
  .spinner {
    animation-duration: 1.8s;
  }
  // 浮层移除位移和缩放，仅保留 opacity
  .overlay {
    animation: overlayFade 160ms ease;
  }
  // 交互元素去掉 transition
  .button {
    transition: none;
  }
}
```

---

## 6. 组件变体模型

### 四维度正交设计

以 Button 为参考模型，四个维度互相独立、完全正交：

| 维度    | 问题             | 可选值                                   |
| ------- | ---------------- | ---------------------------------------- |
| variant | 视觉层级是什么？ | `filled` / `outlined` / `ghost` / `link` |
| color   | 语义意图是什么？ | `neutral` / `primary` / `danger`         |
| size    | 在布局中占多大？ | `xs` / `sm` / `md` / `lg` / `xl`         |
| shape   | 边角形态是什么？ | `rect` / `auto` / `pill`                 |

任意组合都应是合法的视觉结果（如 `filled + danger + lg + pill`）。实现时每个维度对应独立的 CSS class，不要用 variant 同时控制颜色或尺寸。

### 何时增加新维度？

依次判断新 prop 属于哪个维度：

1. 影响视觉层级（实心/空心/幽灵）→ 归入 `variant`
2. 改变语义意图（正常/危险/品牌）→ 归入 `color`
3. 只调整尺度（高度/字号/间距联动）→ 归入 `size`
4. 只改变形态（圆角档位）→ 归入 `shape`
5. 以上都不符合，多个组件都需要 → 新增维度，立 spec 讨论
6. 只有一个组件需要且场景极少 → 不加维度，用 `className` 覆盖

### prop 命名规范

- 四维度名称在所有组件中保持一致：`variant` / `color` / `size` / `shape`
- 不要用 `type`、`theme`、`kind` 等同义词
- 不要在 variant 中合并颜色语义（如 `variant="primary"` 实际上混入了 color 维度）
- 布尔 prop 直接用形容词，不加 `is-` 前缀（如 `indeterminate`，不是 `isIndeterminate`）

---

## 7. 复合组件模式

### Root / Trigger / Content 三层结构

```tsx
// 标准结构
<Popover.Root>
  <Popover.Trigger asChild>
    <Button>打开</Button>
  </Popover.Trigger>
  <Popover.Content>
    内容区域
  </Popover.Content>
</Popover.Root>

// 受控模式
<Dialog.Root open={open} onOpenChange={setOpen}>
  ...
</Dialog.Root>
```

- Root 由 Ark UI 原语提供状态机与 ARIA，不要手动维护 open/close 状态
- Trigger 必须支持 `asChild`，允许消费者使用任意元素触发
- 受控模式通过 `open` + `onOpenChange` 桥接，不要绕过 Ark UI 状态机

### Context 传递规则

通过 React Context 向下传递共享属性（如 `size`），避免在每个子组件上重复传 prop：

```tsx
// ✓ Root 提供 Context，子组件消费
const RadioGroupContext = createContext<{ size: Size }>(...)
const Root = ({ size = 'md', ...props }) => (
  <RadioGroupContext.Provider value={{ size }}>
    <Ark.RadioGroup.Root {...props} />
  </RadioGroupContext.Provider>
)

// ✗ 每个 Item 都手传，冗余且易漏
<RadioGroup.Item size="lg" value="a" />
<RadioGroup.Item size="lg" value="b" />
```

### Portal 渲染规则

所有浮层内容（Popover、Dialog、Tooltip、Menu、Toast）必须 Portal 渲染到 `document.body`，避免被父元素的 `overflow:hidden` 或 `z-index` 上下文裁切。

Ark UI Content 原语默认已启用 Portal，不要手动关闭（`portalled={false}`），除非嵌套弹窗层级有特殊需求且已充分测试。

### Z-index 层级约定

| 组件                      | 层级 | 说明                     |
| ------------------------- | ---- | ------------------------ |
| Tooltip                   | 1000 | 最轻量浮层               |
| Popover / Dropdown / Menu | 1100 | 交互型浮层               |
| Dialog                    | 1200 | 模态遮罩层               |
| Toast                     | 1300 | 最高层，不被 Dialog 遮挡 |
