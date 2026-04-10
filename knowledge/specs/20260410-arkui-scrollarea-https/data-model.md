# 数据模型：ScrollArea 组件

**分支**：`20260410-arkui-scrollarea-https`  
**日期**：2026-04-10

---

## 组件 Props

### `ScrollAreaColor`

```ts
type ScrollAreaColor = 'primary' | 'neutral';
```

| 值        | 滑块颜色来源                  | 行为                                         |
| --------- | ----------------------------- | -------------------------------------------- |
| `primary` | `--ui-color-brand-bg`（默认） | 固定品牌绿，不随主题变化                     |
| `neutral` | `--ui-color-text`             | 随主题自动反转：浅色主题→深色，深色主题→浅色 |

---

### `ScrollAreaProps`

```ts
type ScrollAreaProps = {
  /** 需要在滚动区域内展示的内容 */
  children: ReactNode;
  /** 根元素追加的 CSS class */
  className?: string;
  /** 滑块颜色，默认 'primary'；neutral 随主题自动反转 */
  color?: ScrollAreaColor;
  /** 是否同时显示水平滚动条，默认 false */
  horizontal?: boolean;
  /** 根元素追加的内联样式 */
  style?: CSSProperties;
};
```

---

## DOM 结构

```html
<!-- ScrollArea.Root — position: relative; overflow: hidden -->
<div class="root" data-size="medium">
  <!-- ScrollArea.Viewport — width/height: 100%; overflow: scroll; 隐藏原生滚动条 -->
  <div class="viewport">
    <!-- ScrollArea.Content -->
    <div class="content">{children}</div>
  </div>

  <!-- ScrollArea.Scrollbar orientation="vertical" — position: absolute; right: 0 -->
  <!-- data-overflow-y 控制显隐；data-color 驱动滑块色 -->
  <div class="scrollbar" data-orientation="vertical">
    <!-- ScrollArea.Thumb -->
    <div class="thumb"></div>
  </div>

  <!-- 仅 horizontal=true 时渲染 -->
  <!-- ScrollArea.Scrollbar orientation="horizontal" — position: absolute; bottom: 0 -->
  <div class="scrollbar" data-orientation="horizontal">
    <div class="thumb"></div>
  </div>

  <!-- 仅 horizontal=true 时渲染（双向滚动时填充右下角） -->
  <!-- ScrollArea.Corner -->
  <div class="corner"></div>
</div>
```

---

## 状态流转

```
内容加载
  ↓
Ark UI 检测内容尺寸 vs 容器尺寸
  ├─ 有溢出 → [data-overflow-y] / [data-overflow-x] 出现 → 滚动条由 opacity:0 渐变至 opacity:1
  └─ 无溢出 → 无 data-overflow-* → 滚动条不可见

用户悬停滚动条区域
  → [data-hover] 出现 → 滑块颜色加深（140ms ease）

用户拖拽滑块
  → [data-scrolling] 出现 → 可加深或保持 hover 样式
  → 内容 scrollTop / scrollLeft 同步更新
```

---

## CSS 自定义属性（组件内部）

| 属性                         | 含义         | 值                                         |
| ---------------------------- | ------------ | ------------------------------------------ |
| `--scroll-area-thumb-color`  | 滑块基础颜色 | `var(--ui-color-brand-bg)`（primary 默认） |
| `--scroll-area-thumb-radius` | 滑块圆角     | `999px`（pill 型）                         |
| `--scroll-area-transition`   | 过渡统一值   | `140ms ease`                               |
