# 数据模型：Tabs 组件

**分支**：`20260331-tabs-component` | **日期**：2026-03-31  
**语言要求**：正文使用简体中文；代码标识符、命令、路径可保留原文。

---

## 核心实体

### TabsValue（激活状态）

表示当前激活的 tab 标识符。

| 字段    | 类型             | 说明                                                  |
| ------- | ---------------- | ----------------------------------------------------- |
| `value` | `string \| null` | 当前激活 tab 的 `value`；`deselectable` 时可为 `null` |

**状态转换**：

```
未激活 tab → 用户点击/键盘激活 → value 更新 → 指示器滑动 → 对应 TabContent 可见
```

---

### TabItem（单个标签项）

描述一个 tab 的数据结构，用于 `TabTrigger` 渲染。

| 字段        | 类型               | 必填 | 说明                                            |
| ----------- | ------------------ | ---- | ----------------------------------------------- |
| `value`     | `string`           | 是   | 唯一标识，传入 Ark UI `Tabs.Trigger` 的 `value` |
| `label`     | `ReactNode`        | 是   | 显示的标签内容（文字、图标等）                  |
| `disabled`  | `boolean`          | 否   | 是否禁用，默认 `false`                          |
| `menuItems` | `TabMenuItemDef[]` | 否   | 若配置则渲染为下拉菜单 tab，否则为普通 tab      |

---

### TabMenuItemDef（tab 子菜单选项）

单个菜单子项，对应下拉菜单中的一行。

| 字段       | 类型        | 必填 | 说明                                                            |
| ---------- | ----------- | ---- | --------------------------------------------------------------- |
| `value`    | `string`    | 是   | 选中后触发 `onValueChange` 的值，同时作为 `TabContent` 对应 key |
| `label`    | `ReactNode` | 是   | 菜单项显示文本                                                  |
| `disabled` | `boolean`   | 否   | 是否禁用该菜单项                                                |

---

## 组件 Props 模型

### Tabs（根容器）

| Prop             | 类型                                        | 默认值         | 说明                                 |
| ---------------- | ------------------------------------------- | -------------- | ------------------------------------ |
| `value`          | `string`                                    | —              | 受控激活 tab 值                      |
| `defaultValue`   | `string`                                    | —              | 非受控默认激活值                     |
| `onValueChange`  | `(details: TabsValueChangeDetails) => void` | —              | 激活 tab 变化回调                    |
| `orientation`    | `'horizontal' \| 'vertical'`                | `'horizontal'` | 标签栏排列方向                       |
| `activationMode` | `'automatic' \| 'manual'`                   | `'automatic'`  | 键盘/焦点激活模式                    |
| `loopFocus`      | `boolean`                                   | `true`         | 键盘导航是否首尾循环                 |
| `variant`        | `'line' \| 'bg'`                            | `'line'`       | 激活指示器样式变体                   |
| `color`          | `'neutral' \| 'primary'`                    | `'neutral'`    | 语义色，控制指示器和激活文字颜色     |
| `size`           | `'small' \| 'medium' \| 'large'`            | `'medium'`     | 尺寸档位                             |
| `overflowMode`   | `'scroll' \| 'collapse'`                    | `'scroll'`     | 超长处理策略                         |
| `hideContent`    | `boolean`                                   | `false`        | 是否隐藏内容面板区域（仅标签栏模式） |
| `lazyMount`      | `boolean`                                   | `false`        | TabContent 是否懒挂载                |
| `unmountOnExit`  | `boolean`                                   | `false`        | 非激活 TabContent 是否卸载           |
| `className`      | `string`                                    | —              | 根节点自定义类名                     |
| `style`          | `CSSProperties`                             | —              | 根节点内联样式                       |
| `children`       | `ReactNode`                                 | —              | 子节点（TabList + TabContent）       |

---

### TabList（标签列表容器）

| Prop        | 类型            | 默认值 | 说明              |
| ----------- | --------------- | ------ | ----------------- |
| `className` | `string`        | —      | 自定义类名        |
| `style`     | `CSSProperties` | —      | 内联样式          |
| `children`  | `ReactNode`     | —      | TabTrigger 子节点 |

---

### TabTrigger（单个标签触发器）

| Prop        | 类型               | 默认值  | 说明                                   |
| ----------- | ------------------ | ------- | -------------------------------------- |
| `value`     | `string`           | —       | **必填**。唯一标识，与 TabContent 对应 |
| `disabled`  | `boolean`          | `false` | 是否禁用                               |
| `menuItems` | `TabMenuItemDef[]` | —       | 配置后渲染为下拉菜单触发器             |
| `className` | `string`           | —       | 自定义类名                             |
| `style`     | `CSSProperties`    | —       | 内联样式                               |
| `children`  | `ReactNode`        | —       | 标签显示内容                           |

---

### TabContent（内容面板）

| Prop        | 类型            | 默认值 | 说明                                 |
| ----------- | --------------- | ------ | ------------------------------------ |
| `value`     | `string`        | —      | **必填**。对应 TabTrigger 的 `value` |
| `className` | `string`        | —      | 自定义类名                           |
| `style`     | `CSSProperties` | —      | 内联样式                             |
| `children`  | `ReactNode`     | —      | 面板内容                             |

---

### TabIndicator（指示器，`line` 变体专属，可选显式使用）

| Prop        | 类型            | 默认值 | 说明       |
| ----------- | --------------- | ------ | ---------- |
| `className` | `string`        | —      | 自定义类名 |
| `style`     | `CSSProperties` | —      | 内联样式   |

> 注：`line` 变体下 `TabList` 内部默认渲染一个 `TabIndicator`，消费者通常无需手动控制。

---

## 事件与回调

| 事件                     | 类型                        | 说明                          |
| ------------------------ | --------------------------- | ----------------------------- |
| `TabsValueChangeDetails` | `{ value: string }`         | `onValueChange` 回调参数      |
| `TabsFocusChangeDetails` | `{ value: string \| null }` | 可选 `onFocusChange` 回调参数 |

---

## 状态模型

```
Tabs
├── activeValue: string | null
├── orientation: 'horizontal' | 'vertical'
├── activationMode: 'automatic' | 'manual'
├── variant: 'line' | 'bg'
├── overflowMode: 'scroll' | 'collapse'
└── TabList
    ├── scrollAtStart: boolean   （scroll 模式渐变遮罩状态）
    ├── scrollAtEnd: boolean     （scroll 模式渐变遮罩状态）
    ├── visibleTabs: TabItem[]   （collapse 模式：当前可见 tab）
    ├── overflowTabs: TabItem[]  （collapse 模式：收入"更多"的 tab）
    ├── TabTrigger[]
    │   ├── value: string
    │   ├── disabled: boolean
    │   ├── isActive: boolean    （由 Ark UI 注入 data-selected）
    │   └── menuOpen?: boolean   （菜单 tab 专属）
    └── TabIndicator             （line 变体）
```
