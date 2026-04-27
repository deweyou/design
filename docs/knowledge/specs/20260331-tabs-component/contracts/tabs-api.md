# API 契约：Tabs 组件

**分支**：`20260331-tabs-component` | **日期**：2026-03-31  
**语言要求**：正文使用简体中文；代码标识符、命令、路径可保留原文。

---

## 公开导出面（`packages/components/src/index.ts`）

新增以下导出：

```typescript
// 组件
export { Tabs, TabList, TabTrigger, TabContent, TabIndicator } from './tabs/index.tsx';

// 类型
export type {
  TabsProps,
  TabListProps,
  TabTriggerProps,
  TabContentProps,
  TabIndicatorProps,
  TabsVariant,
  TabsColor,
  TabsSize,
  TabsOrientation,
  TabsActivationMode,
  TabsOverflowMode,
  TabsValueChangeDetails,
  TabsFocusChangeDetails,
  TabMenuItemDef,
} from './tabs/index.tsx';
```

---

## 组件组合模型

```tsx
// 基础用法（横排，含内容面板）
<Tabs defaultValue="tab1">
  <TabList>
    <TabTrigger value="tab1">标签一</TabTrigger>
    <TabTrigger value="tab2">标签二</TabTrigger>
    <TabTrigger value="tab3" disabled>标签三（禁用）</TabTrigger>
  </TabList>
  <TabContent value="tab1">内容一</TabContent>
  <TabContent value="tab2">内容二</TabContent>
  <TabContent value="tab3">内容三</TabContent>
</Tabs>

// 竖排
<Tabs orientation="vertical" defaultValue="tab1">
  <TabList>…</TabList>
  <TabContent value="tab1">…</TabContent>
</Tabs>

// 仅标签栏（无内容面板）
<Tabs hideContent value={activeTab} onValueChange={({ value }) => setActiveTab(value)}>
  <TabList>…</TabList>
</Tabs>

// bg 变体
<Tabs variant="bg" defaultValue="tab1">
  <TabList>…</TabList>
  …
</Tabs>

// 含下拉菜单的 tab
<Tabs defaultValue="sub1">
  <TabList>
    <TabTrigger value="tab1">基础</TabTrigger>
    <TabTrigger
      value="group"
      menuItems={[
        { value: 'sub1', label: '子项一' },
        { value: 'sub2', label: '子项二' },
      ]}
    >
      更多
    </TabTrigger>
  </TabList>
  <TabContent value="tab1">…</TabContent>
  <TabContent value="sub1">子项一内容</TabContent>
  <TabContent value="sub2">子项二内容</TabContent>
</Tabs>

// 超长滚动（默认）
<Tabs defaultValue="t1" overflowMode="scroll">
  <TabList>
    {Array.from({ length: 20 }, (_, i) => (
      <TabTrigger key={i} value={`t${i + 1}`}>标签{i + 1}</TabTrigger>
    ))}
  </TabList>
  …
</Tabs>

// 超长收齐
<Tabs defaultValue="t1" overflowMode="collapse">
  <TabList>…</TabList>
  …
</Tabs>
```

---

## 行为契约

### 激活切换

- 点击非禁用 tab → `onValueChange` 触发，指示器动画（`line` 变体）
- `activationMode="automatic"`：焦点到达 tab 时即激活（方向键移动焦点即切换）
- `activationMode="manual"`：焦点到达 tab 后，需按 `Enter` 或 `Space` 激活

### 键盘导航

| 按键                       | 行为                                    |
| -------------------------- | --------------------------------------- |
| `ArrowRight` / `ArrowDown` | 焦点移至下一个 tab（分别对应横排/竖排） |
| `ArrowLeft` / `ArrowUp`    | 焦点移至上一个 tab（分别对应横排/竖排） |
| `Home`                     | 焦点移至第一个 tab                      |
| `End`                      | 焦点移至最后一个 tab                    |
| `Tab`                      | 焦点离开 tablist，进入激活内容面板      |
| `Enter` / `Space`          | `manual` 模式下激活当前 focused tab     |
| `Escape`                   | 关闭下拉菜单（仅 menu tab）             |

### 禁用 tab

- 不可点击，不可键盘激活
- 键盘导航自动跳过
- 视觉：`opacity: 0.56`，`cursor: not-allowed`

### 受控/非受控

- 提供 `value` → 受控模式，切换必须通过 `onValueChange` 回调更新外部状态
- 提供 `defaultValue` → 非受控，内部管理激活状态
- 两者均未提供 → 首个非禁用 tab 自动激活

---

## ARIA 输出

```html
<!-- 横排 Tabs -->
<div role="tablist" aria-orientation="horizontal">
  <button role="tab" aria-selected="true" aria-controls="panel-tab1" id="trigger-tab1">
    标签一
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-tab2" id="trigger-tab2">
    标签二
  </button>
  <button role="tab" aria-selected="false" aria-disabled="true" …>标签三</button>
</div>
<div role="tabpanel" id="panel-tab1" aria-labelledby="trigger-tab1">内容一</div>
<div role="tabpanel" id="panel-tab2" aria-labelledby="trigger-tab2" hidden>内容二</div>

<!-- 菜单 tab -->
<button role="tab" aria-haspopup="menu" aria-expanded="false" …>更多</button>
```

---

## 样式钩子（`data-*` 属性）

组件在根节点和子节点暴露以下 `data-*` 属性，供消费者覆写样式：

| 元素         | 属性                       | 值                             |
| ------------ | -------------------------- | ------------------------------ |
| Tabs 根节点  | `data-orientation`         | `horizontal \| vertical`       |
| Tabs 根节点  | `data-variant`             | `line \| bg`                   |
| Tabs 根节点  | `data-color`               | `neutral \| primary`           |
| Tabs 根节点  | `data-size`                | `small \| medium \| large`     |
| TabList 外层 | `data-scroll-at-start`     | `true \| false`                |
| TabList 外层 | `data-scroll-at-end`       | `true \| false`                |
| TabList 外层 | `data-overflow-mode`       | `scroll \| collapse`           |
| TabTrigger   | `data-selected`            | `true \| false`（Ark UI 注入） |
| TabTrigger   | `data-disabled`            | `true \| false`                |
| TabTrigger   | `data-has-menu`            | `true \| false`                |
| "更多" 按钮  | `data-has-active-overflow` | `true \| false`                |

---

## semver 影响

- 首次发布，无破坏性变更。
- 新增导出：`Tabs`, `TabList`, `TabTrigger`, `TabContent`, `TabIndicator` 及相关类型。
- 版本：`@deweyou-ui/components` minor bump（新增功能）。
