# 组件缺口修复设计文档

> 日期：2026-05-05
> 范围：`packages/react`
> 背景：业务场景使用组件时发现的 4 个缺口，2 个需求（Text 语义色、Button muted）经澄清后确认用 `className` + token 覆盖即可，不需要修改组件库。

---

## 需求范围

| #   | 需求                     | 结论                                                  |
| --- | ------------------------ | ----------------------------------------------------- |
| 1   | Card `as` 多态 prop      | 实现：新增 `href` 触发多态                            |
| 2   | Tooltip `placement` prop | 实现：透传 Ark UI positioning                         |
| 3   | 缺少 Nav/Link 组件       | 实现：`Nav.Root + Nav.Link` 复合组件                  |
| 4   | Menu 全屏 overlay 模式   | 实现：新增 `NavOverlay` 组件                          |
| 5   | Text 语义色 token 未暴露 | 不改库：业务侧 `style`/`className` + `semanticTokens` |
| 6   | Button muted/subtle 变体 | 不改库：业务侧 `className` 覆盖，场景极少             |

---

## 1. Card 多态（href 触发）

### 目标

支持 Card 渲染为 `<a>` 元素，用于可点击的卡片链接场景。

### API 变更

```tsx
// 新增 prop
href?: string;
target?: string;

// 有 href → 渲染 <a>；无 href → 保持 <div>
<Card href="/detail/123">内容</Card>
<Card href="/detail/123" target="_blank">新标签打开</Card>
<Card padding="lg">普通卡片（不变）</Card>
```

### 实现细节

- `CardProps` 从 `HTMLAttributes<HTMLDivElement>` 改为 `HTMLAttributes<HTMLElement>`，追加 `href?: string` 和 `target?: string`
- 渲染逻辑：`const Component = href ? 'a' : 'div'`
- `target` 存在但 `href` 缺失时，runtime 抛出错误（与 Button 行为一致）
- 无障碍：`<a>` 天然支持键盘导航，不需要额外处理

### 文件

- `packages/react/src/card/index.tsx`

---

## 2. Tooltip placement

### 目标

允许消费者控制 Tooltip 的弹出方向，覆盖 Ark UI 默认值（`'bottom'`）。

### API 变更

```tsx
// TooltipRootProps 新增
placement?: TooltipPlacement;

// 使用
<Tooltip.Root placement="top">
  <Tooltip.Trigger>悬停</Tooltip.Trigger>
  <Tooltip.Content>提示文字</Tooltip.Content>
</Tooltip.Root>
```

### 类型定义

```ts
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
```

与 `MenuPlacement` 值域相同，独立定义（不共享，避免包间依赖）。

### 实现细节

- `TooltipRoot` 接收 `placement`，透传至 `ArkTooltip.Root` 的 `positioning={{ placement }}`
- 不传时由 Ark UI 使用其默认值（`'bottom'`），行为不变

### 文件

- `packages/react/src/tooltip/index.tsx`

---

## 3. Nav 组件

### 目标

提供带 active 状态的导航链接组件，支持水平/垂直两种布局方向。路由集成完全由消费者负责（pure presentational）。

### API

```tsx
<Nav.Root
  aria-label="主导航" // 默认 'navigation'
  orientation="vertical" // 'horizontal'（默认）| 'vertical'
  size="md" // 'sm' | 'md'（默认）| 'lg'
>
  <Nav.Link href="/" active={pathname === '/'} icon={<HomeIcon />}>
    首页
  </Nav.Link>
  <Nav.Link href="/about" active={pathname === '/about'}>
    关于
  </Nav.Link>
</Nav.Root>
```

### 组件结构

**`Nav.Root`**

- 渲染 `<nav>` 元素
- 通过 React Context 向下传递 `size` 和 `orientation`
- `aria-label` 默认值 `'navigation'`

**`Nav.Link`**

- 渲染 `<a>` 元素，继承 `AnchorHTMLAttributes<HTMLAnchorElement>`
- `active?: boolean` — active 时添加 `data-active=""` 属性
- `icon?: ReactNode` — 可选前置图标，渲染在文字左侧

### 样式规范

| 状态          | 视觉                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- |
| 默认          | 文字色 `--ui-color-text-muted`，无背景                                                              |
| hover         | 文字色 `--ui-color-text`，背景 `color-mix(in srgb, var(--ui-color-text) 8%, transparent)`           |
| active        | 文字色 `--ui-color-text`，指示条 `--ui-color-brand-bg`（水平方向在下方，垂直方向在左侧，宽/高 2px） |
| focus-visible | 标准焦点环（`--ui-color-focus-ring`，`box-shadow` 实现）                                            |

字号/间距跟随 `size` context，与 Button 的 `sm/md/lg` 档位对齐。

### 文件

- `packages/react/src/nav/index.tsx`
- `packages/react/src/nav/index.module.less`
- `packages/react/src/nav/index.test.ts`

### 导出

```ts
// packages/react/src/index.ts 追加
export { Nav, type NavRootProps, type NavLinkProps } from './nav/index.tsx';
```

---

## 4. NavOverlay 组件

### 目标

移动端全屏导航 overlay。点击触发后全屏接管 viewport，支持 Escape 关闭、焦点捕获、无障碍语义。

### API

```tsx
<NavOverlay.Root>
  <NavOverlay.Trigger>
    <IconButton aria-label="打开导航" icon={<MenuIcon />} variant="ghost" />
  </NavOverlay.Trigger>
  <NavOverlay.Content>
    <NavOverlay.CloseButton />
    <Nav.Root orientation="vertical">
      <Nav.Link href="/" active={pathname === '/'}>首页</Nav.Link>
      <Nav.Link href="/about" active={pathname === '/about'}>关于</Nav.Link>
    </Nav.Root>
  </NavOverlay.Content>
</NavOverlay.Root>

// 受控模式
<NavOverlay.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
  ...
</NavOverlay.Root>
```

### 组件结构

**`NavOverlay.Root`**

- 包裹 `ArkDialog.Root`
- props：`open?`、`defaultOpen?`、`onOpenChange?`、`children`
- 固定 `lazyMount + unmountOnExit`

**`NavOverlay.Trigger`**

- 包裹 `ArkDialog.Trigger asChild`，消费者传入任意触发元素

**`NavOverlay.Content`**

- 包裹 `ArkDialog.Positioner + ArkDialog.Content`，Portal 到 `document.body`
- 样式：`position: fixed; inset: 0`，全屏铺满
- z-index：`var(--ui-z-dialog)`（1200）
- 背景色：`--ui-color-surface`
- 无遮罩层（全屏本身即内容区域）
- 入场动画：`opacity 0→1 + translateY(-8px→0)`，160ms，`cubic-bezier(0.22, 1, 0.36, 1)`
- 出场动画：`opacity 1→0 + translateY(-8px)`，160ms，`ease`
- 响应 `prefers-reduced-motion`：仅保留 opacity，移除位移

**`NavOverlay.CloseButton`**

- 包裹 `ArkDialog.CloseTrigger asChild`，渲染预置关闭 `IconButton`（`variant="ghost"`，`aria-label="关闭导航"`）
- 默认定位右上角（`position: absolute; top: var(--ui-space-md); right: var(--ui-space-md)`）
- 接受 `className` 供消费者覆盖位置

### 行为（来自 Ark UI Dialog）

- Escape 键关闭
- 焦点捕获（open 时焦点锁定在 overlay 内）
- `aria-modal="true"` + `role="dialog"`

### 文件

- `packages/react/src/nav-overlay/index.tsx`
- `packages/react/src/nav-overlay/index.module.less`
- `packages/react/src/nav-overlay/index.test.tsx`

### 导出

```ts
// packages/react/src/index.ts 追加
export {
  NavOverlay,
  type NavOverlayRootProps,
  type NavOverlayTriggerProps,
  type NavOverlayContentProps,
  type NavOverlayCloseButtonProps,
} from './nav-overlay/index.tsx';
```

---

## 变更范围汇总

| 文件                                               | 变更类型                                          |
| -------------------------------------------------- | ------------------------------------------------- |
| `packages/react/src/card/index.tsx`                | 修改：新增 `href`/`target` prop，支持渲染为 `<a>` |
| `packages/react/src/tooltip/index.tsx`             | 修改：新增 `placement` prop                       |
| `packages/react/src/nav/index.tsx`                 | 新增：Nav.Root + Nav.Link                         |
| `packages/react/src/nav/index.module.less`         | 新增                                              |
| `packages/react/src/nav/index.test.ts`             | 新增                                              |
| `packages/react/src/nav-overlay/index.tsx`         | 新增：NavOverlay 复合组件                         |
| `packages/react/src/nav-overlay/index.module.less` | 新增                                              |
| `packages/react/src/nav-overlay/index.test.tsx`    | 新增                                              |
| `packages/react/src/index.ts`                      | 修改：追加 Nav、NavOverlay 导出                   |
