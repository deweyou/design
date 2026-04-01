# 研究报告：Tabs 组件

**分支**：`20260331-tabs-component` | **日期**：2026-03-31  
**语言要求**：正文使用简体中文；代码标识符、命令、路径可保留原文。

---

## 1. Ark UI Tabs 原语选用

**决策**：使用 `@ark-ui/react` 中的 `Tabs.Root`、`Tabs.List`、`Tabs.Trigger`、`Tabs.Content`、`Tabs.Indicator`。

**理由**：

- 宪章 I 强制要求具有复杂行为的组件基于 Ark UI 构建；Tabs 涉及状态机（激活值）、ARIA 输出（`role=tablist/tab/tabpanel`）、键盘导航（方向键、Home/End）、焦点管理，完全符合 Ark UI 使用判断准则。
- Ark UI Tabs 提供 `Tabs.Indicator`——一个自动跟随激活 tab 位置的浮动元素，通过 CSS 自定义属性（`--left`、`--top`、`--width`、`--height`）表达位置，天然支持 CSS `transition` 动画。

**替代方案**：手工实现状态机 + ARIA —— 已被宪章 I 明确排除。

---

## 2. 激活指示器动画方案

**决策**：使用 `Tabs.Indicator` + CSS `transform` 动画。

**理由**：
Ark UI `Tabs.Indicator` 渲染一个绝对定位元素，通过如下 CSS 自定义属性暴露激活 tab 的位置信息：

```css
/* Ark UI 注入的自定义属性（TabList 上） */
--left:   /* 激活 tab 左偏移 */ --top: /* 激活 tab 上偏移 */ --width: /* 激活 tab 宽度 */
  --height: /* 激活 tab 高度 */;
```

`Tabs.Indicator` 本身会跟随这些属性定位。实现滑动动画只需为其添加 `transition`：

```css
.indicator {
  position: absolute;
  /* 横排：底部线 */
  bottom: 0;
  left: var(--left);
  width: var(--width);
  height: 2px;
  transition:
    left 160ms cubic-bezier(0.22, 1, 0.36, 1),
    width 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* 竖排：左侧线 */
[data-orientation='vertical'] .indicator {
  left: 0;
  top: var(--top);
  width: 2px;
  height: var(--height);
  transition:
    top 160ms cubic-bezier(0.22, 1, 0.36, 1),
    height 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .indicator {
    transition: none;
  }
}
```

**替代方案**：手工计算 tab 位置 + `transform: translateX/Y` —— 放弃，Ark UI 已提供此信息，无需重复。

---

## 3. hover bg 样式方案

**决策**：与仓库现有 hover 规范一致，使用 `color-mix(in srgb, currentColor 8%, transparent)` 作为 hover 背景。

**理由**：CLAUDE.md 中明确规定 `hover 背景 = color-mix(in srgb, <color> 6–12%, transparent)`，Tab trigger 沿用此规范，无需引入新 token。

---

## 4. Tab 下拉菜单（Menu Tab）方案

**决策**：对于配置了 `menuItems` 的 tab，渲染为现有 `Menu` 组件包裹一个自定义 Tab 触发器，使用受控模式（`open`）桥接 Ark UI Tabs 的激活值。

**实现细节**：

- 该 tab 在 Ark UI `Tabs.List` 中占位，但渲染为 `Menu` 组件的触发器而非 `Tabs.Trigger`。
- 当菜单中某选项被选择时，调用 `Tabs.Root` 的 `setValue` 或通过 `onValueChange` 触发外部受控切换。
- 横排模式：Menu `placement="bottom-start"`；竖排模式：Menu `placement="right-start"`。
- 该 tab 自身视觉显示为当前激活的子选项名称（或配置的默认标签），附箭头图标。
- 无障碍：该触发器带 `aria-haspopup="menu"` 和 `aria-expanded`，由 Ark UI Menu 原语自动注入。

**替代方案**：将菜单选项直接作为独立的 `Tabs.Trigger` 渲染——会导致无法在视觉上将它们折叠为一个 tab，用户体验不符合需求。

---

## 5. 超长滚动（scroll）模式 + 渐变遮罩

**决策**：`TabList` 容器使用 `overflow-x: auto`（横排）或 `overflow-y: auto`（竖排）实现原生滚动，通过 CSS `mask-image` 线性渐变实现边缘淡出效果，用 `onScroll` 事件动态切换渐变类名。

**实现细节**：

```css
/* 渐变遮罩容器（mask 加在外层 wrapper 上） */
.listWrapper {
  --fade-width: 40px;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black var(--fade-width),
    black calc(100% - var(--fade-width)),
    transparent 100%
  );
}

/* 到达左边缘时，左侧无渐变 */
.listWrapper[data-scroll-at-start='true'] {
  mask-image: linear-gradient(
    to right,
    black 0,
    black calc(100% - var(--fade-width)),
    transparent 100%
  );
}

/* 到达右边缘时，右侧无渐变 */
.listWrapper[data-scroll-at-end='true'] {
  mask-image: linear-gradient(to right, transparent 0, black var(--fade-width), black 100%);
}

/* 两侧均到边缘时，不渐变 */
.listWrapper[data-scroll-at-start='true'][data-scroll-at-end='true'] {
  mask-image: none;
}
```

React 侧使用 `useRef` + `onScroll` 事件检查 `scrollLeft`、`scrollWidth`、`clientWidth`，更新 `data-scroll-at-start` 和 `data-scroll-at-end` 属性。

切换到不可见 tab 时，调用 `tabElement.scrollIntoView({ block: 'nearest', inline: 'nearest' })` 使其进入视口。

**替代方案**：使用自定义左右滚动按钮 —— 不符合设计需求，且使用原生滚动更简洁。

---

## 6. 超长收齐（collapse）模式

**决策**：使用 `ResizeObserver` 监听 `TabList` 容器及各 tab 宽度变化，实时计算哪些 tab 超出容器，将溢出部分收入"更多"菜单（复用现有 `Menu` 组件）。

**实现细节**：

- `ResizeObserver` 观察 TabList 容器，每次触发时重新计算可见 tab 数量。
- 计算逻辑：累加各 tab 自然宽度，减去"更多"按钮预留宽度（如无溢出则不占位），超出容器宽度的 tab 移入溢出列表。
- "更多"菜单使用现有 `Menu` + `MenuItem` 渲染溢出 tab；选中后触发 `onValueChange`。
- 若当前激活 tab 在溢出列表中，"更多"按钮呈激活视觉状态（`data-has-active-overflow="true"`）。

**替代方案**：CSS `overflow: hidden` + `visibility: hidden` 模拟溢出 —— 无法精确计算溢出点，且浏览器行为不稳定。

---

## 7. 新增设计 token 评估

**决策**：不引入新颜色 token。以下尺寸约定作为局部 CSS 变量硬编码于组件内部（不进入 `@deweyou-ui/styles`），因为它们是组件专属间距，无复用需求：

| 变量                         | 值     | 用途          |
| ---------------------------- | ------ | ------------- |
| `--tabs-tab-gap`             | `4px`  | tab 间距      |
| `--tabs-indicator-thickness` | `2px`  | 指示器线宽/高 |
| `--tabs-overflow-fade-width` | `40px` | 渐变遮罩宽度  |

如日后需要主题化这些值，可提升到 `@deweyou-ui/styles`，但当前不做预设。

---

## 8. 文件产出摘要

| 文件                                             | 说明                                                            |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `packages/components/src/tabs/index.tsx`         | 组件实现（Tabs, TabList, TabTrigger, TabContent, TabIndicator） |
| `packages/components/src/tabs/index.module.less` | CSS Modules 样式                                                |
| `packages/components/src/tabs/index.test.tsx`    | 单测                                                            |
| `packages/components/src/index.ts`               | 新增 tabs 导出                                                  |
| `apps/website/src/pages/tabs/`                   | 预览页（9 个场景）                                              |
