# 数据模型：Menu 组件

**分支**：`20260329-menu-component`
**日期**：2026-03-29
**规格**：[spec.md](./spec.md)

## 组件实体

### Menu（根容器）

管理菜单的开关状态，提供定位配置，包裹 Trigger 和 Content。

| 属性            | 类型                                   | 默认值           | 说明                                 |
| --------------- | -------------------------------------- | ---------------- | ------------------------------------ |
| `open`          | `boolean`                              | —                | 受控：菜单是否展开                   |
| `defaultOpen`   | `boolean`                              | `false`          | 非受控初始展开状态                   |
| `onOpenChange`  | `(details: OpenChangeDetails) => void` | —                | 开关状态变化回调                     |
| `closeOnSelect` | `boolean`                              | `true`           | 点击菜单项后是否自动关闭             |
| `onSelect`      | `(details: SelectionDetails) => void`  | —                | 全局选中回调（携带选中项的 value）   |
| `placement`     | `Placement`                            | `'bottom-start'` | 浮层位置（Ark UI placement 子集）    |
| `gutter`        | `number`                               | `4`              | 触发器与菜单面板之间的间距（px）     |
| `disabled`      | `boolean`                              | `false`          | 禁用触发（不响应交互）               |
| `children`      | `ReactNode`                            | —                | 必填，包含 MenuTrigger + MenuContent |

**状态转换**：

```
closed → [触发器点击 / Enter / Space] → open
open   → [Escape / 外部点击 / closeOnSelect] → closed
open   → [MenuTriggerItem 悬停] → submenu-open（子菜单层级管理由 Ark UI 内部处理）
```

---

### MenuTrigger

触发菜单打开的元素包装器，透传 `asChild` 给 Ark UI Trigger。

| 属性       | 类型        | 默认值 | 说明                                          |
| ---------- | ----------- | ------ | --------------------------------------------- |
| `asChild`  | `boolean`   | `true` | 将触发行为合并到子元素上（避免额外 DOM 节点） |
| `children` | `ReactNode` | —      | 必填，触发元素（通常是 Button）               |

---

### MenuContent

菜单面板容器，管理菜单项列表。由 `Menu` 内部渲染，通过 Portal 挂载到 `document.body`。

| 属性              | 类型                  | 默认值          | 说明               |
| ----------------- | --------------------- | --------------- | ------------------ |
| `className`       | `string`              | —               | 额外 CSS 类        |
| `style`           | `CSSProperties`       | —               | 内联样式           |
| `children`        | `ReactNode`           | —               | 菜单项列表         |
| `portalContainer` | `HTMLElement \| null` | `document.body` | 自定义 Portal 容器 |

---

### MenuItem

基础可点击菜单项。

| 属性        | 类型                                  | 默认值  | 说明                           |
| ----------- | ------------------------------------- | ------- | ------------------------------ |
| `value`     | `string`                              | —       | 唯一标识，用于 `onSelect` 回调 |
| `disabled`  | `boolean`                             | `false` | 禁用态，不响应交互             |
| `onSelect`  | `(details: SelectionDetails) => void` | —       | 该项被激活时的回调             |
| `icon`      | `ReactNode`                           | —       | 前置图标（可选）               |
| `children`  | `ReactNode`                           | —       | 菜单项标签内容                 |
| `className` | `string`                              | —       | 额外 CSS 类                    |

**状态**：`default` / `highlighted`（键盘焦点或鼠标悬停）/ `disabled`

---

### MenuGroup

将多个 MenuItem 归为一个语义分组，分组之间可选展示标签。

| 属性       | 类型        | 默认值 | 说明                         |
| ---------- | ----------- | ------ | ---------------------------- |
| `id`       | `string`    | —      | 分组唯一 ID，用于 ARIA label |
| `label`    | `string`    | —      | 可选分组标签文字             |
| `children` | `ReactNode` | —      | 包含的 MenuItem 列表         |

**约定**：当 `label` 存在时，自动渲染 `MenuGroupLabel`；分组之间的 `MenuSeparator` 由消费方显式控制（或 `MenuContent` 内部根据分组结构自动插入）。

---

### MenuGroupLabel

分组的标签文字，视觉上小于正常菜单项。

| 属性       | 类型        | 默认值 | 说明            |
| ---------- | ----------- | ------ | --------------- |
| `htmlFor`  | `string`    | —      | 关联的 group id |
| `children` | `ReactNode` | —      | 标签文字        |

---

### MenuSeparator

纯视觉分割线，无语义值。

| 属性        | 类型     | 默认值 | 说明        |
| ----------- | -------- | ------ | ----------- |
| `className` | `string` | —      | 额外 CSS 类 |

---

### MenuTriggerItem

兼具菜单项和子菜单触发器双重角色，右侧显示展开方向箭头。

| 属性        | 类型        | 默认值  | 说明             |
| ----------- | ----------- | ------- | ---------------- |
| `disabled`  | `boolean`   | `false` | 禁用态           |
| `icon`      | `ReactNode` | —       | 前置图标（可选） |
| `children`  | `ReactNode` | —       | 菜单项标签内容   |
| `className` | `string`    | —       | 额外 CSS 类      |

**嵌套方式**：`MenuTriggerItem` 作为嵌套 `Menu.Root` 的触发器：

```
<Menu.Root>
  <MenuTriggerItem>打开子菜单</MenuTriggerItem>
  <MenuContent>...</MenuContent>
</Menu.Root>
```

---

### MenuRadioGroup

单选分组容器，管理子 `MenuRadioItem` 的互斥选中状态。

| 属性            | 类型                                    | 默认值 | 说明                      |
| --------------- | --------------------------------------- | ------ | ------------------------- |
| `value`         | `string`                                | —      | 受控选中值                |
| `defaultValue`  | `string`                                | —      | 非受控初始选中值          |
| `onValueChange` | `(details: ValueChangeDetails) => void` | —      | 选中值变化回调            |
| `children`      | `ReactNode`                             | —      | 包含的 MenuRadioItem 列表 |

---

### MenuRadioItem

单选菜单项，value 与 RadioGroup 当前值比对以确定选中态。选中时右侧展示 `check` 图标，文字呈现主题色。

| 属性       | 类型                                  | 默认值  | 说明                    |
| ---------- | ------------------------------------- | ------- | ----------------------- |
| `value`    | `string`                              | —       | 必填，与分组 value 比对 |
| `disabled` | `boolean`                             | `false` | 禁用态                  |
| `onSelect` | `(details: SelectionDetails) => void` | —       | 激活时额外回调          |
| `icon`     | `ReactNode`                           | —       | 前置图标（可选）        |
| `children` | `ReactNode`                           | —       | 菜单项标签内容          |

**状态**：`default` / `checked`（`data-state="checked"`）/ `highlighted` / `disabled`

---

### MenuCheckboxItem

多选菜单项，持有独立的 checked 状态。选中时右侧展示 `check` 图标，文字呈现主题色。

| 属性              | 类型                                      | 默认值  | 说明                       |
| ----------------- | ----------------------------------------- | ------- | -------------------------- |
| `checked`         | `boolean`                                 | —       | 受控选中状态               |
| `defaultChecked`  | `boolean`                                 | `false` | 非受控初始选中状态         |
| `onCheckedChange` | `(details: CheckedChangeDetails) => void` | —       | 选中状态变化回调           |
| `disabled`        | `boolean`                                 | `false` | 禁用态                     |
| `value`           | `string`                                  | —       | 可选，用于 `onSelect` 回调 |
| `icon`            | `ReactNode`                               | —       | 前置图标（可选）           |
| `children`        | `ReactNode`                               | —       | 菜单项标签内容             |

**状态**：`default` / `checked`（`data-state="checked"`）/ `highlighted` / `disabled`

---

### ContextMenu

绑定到目标区域的右键菜单。包裹目标区域后，用户在区域内右击即在光标位置打开菜单。

| 属性            | 类型                                   | 默认值  | 说明                                     |
| --------------- | -------------------------------------- | ------- | ---------------------------------------- |
| `open`          | `boolean`                              | —       | 受控开关                                 |
| `defaultOpen`   | `boolean`                              | `false` | 非受控初始展开状态                       |
| `onOpenChange`  | `(details: OpenChangeDetails) => void` | —       | 开关状态变化回调                         |
| `closeOnSelect` | `boolean`                              | `true`  | 点击菜单项后是否自动关闭                 |
| `onSelect`      | `(details: SelectionDetails) => void`  | —       | 全局选中回调                             |
| `children`      | `ReactNode`                            | —       | 必填，包含 ContextMenu.Trigger + Content |

**子组件**：

- `ContextMenu.Trigger`（= `Menu.ContextTrigger` 封装，包裹右键目标区域）
- `ContextMenu.Content`（复用 MenuContent 内容层）

---

## 公开类型定义

```typescript
// 开关状态变化详情
type OpenChangeDetails = { open: boolean };

// Item 选中详情
type SelectionDetails = { value: string };

// RadioGroup 值变化详情
type ValueChangeDetails = { value: string };

// CheckboxItem checked 变化详情
type CheckedChangeDetails = { checked: boolean };
```

---

## 文件结构

```
packages/components/src/menu/
├── index.tsx                  # 公开导出入口
├── index.module.less          # 全部菜单样式
└── index.test.tsx             # 单元测试（colocate）
```

```
apps/website/src/main.tsx      # 新增 Menu 预览板块（行内）
apps/storybook/src/stories/    # 新增 menu.stories.tsx
```
