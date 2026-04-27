# 研究报告：Menu 组件

**分支**：`20260329-menu-component`
**日期**：2026-03-29
**状态**：完成

## 决策 1：行为基础层选型

**决策**：使用 `@ark-ui/react` 的 `Menu` 原语作为全部交互行为的基础层。

**依据**：

- 项目宪章第 I 条明确规定：具有复杂交互行为（浮层定位、焦点管理、状态机、ARIA 输出）的组件必须优先基于 Ark UI 构建。
- Ark UI Menu 已内置完整的键盘导航状态机（Arrow 键导航、Enter/Space 激活、Escape 关闭、子菜单 ArrowRight/ArrowLeft）。
- Ark UI Menu 已内置 ARIA 角色管理（`role="menu"`、`role="menuitem"`、`role="menuitemradio"`、`role="menuitemcheckbox"`）。
- Ark UI Menu 使用 `@floating-ui` 处理浮层定位和视口溢出防护。

**备选方案评估**：

- 自行实现：成本极高，ARIA + 键盘 + 浮层定位需大量代码，且维护风险大，不符合宪章。
- Radix UI Menu：可行，但项目已选定 Ark UI 作为统一行为基础层（参见 Popover 实现），保持一致性更重要。

---

## 决策 2：Ark UI Menu 模块 API 映射

**决策**：使用以下 Ark UI Menu 原语构建公开 API：

| Ark UI 原语           | 封装为                    | 说明                                   |
| --------------------- | ------------------------- | -------------------------------------- |
| `Menu.Root`           | `Menu`（根容器）          | 持有 open 状态、定位配置               |
| `Menu.Trigger`        | `MenuTrigger`             | 点击触发器，透传 `asChild`             |
| `Menu.ContextTrigger` | `MenuContextTrigger`      | 右键触发区域                           |
| `Menu.Positioner`     | 内部（不暴露）            | 浮层定位，由 Menu 内部处理             |
| `Menu.Content`        | `MenuContent`（内部）     | 菜单面板，样式由 CSS Modules 控制      |
| `Menu.Item`           | `MenuItem`                | 基础菜单项                             |
| `Menu.ItemGroup`      | `MenuGroup`               | 分组容器                               |
| `Menu.ItemGroupLabel` | `MenuGroupLabel`          | 分组标签                               |
| `Menu.Separator`      | `MenuSeparator`           | 分割线                                 |
| `Menu.TriggerItem`    | `MenuTriggerItem`         | 子菜单触发项（搭配嵌套 Menu 使用）     |
| `Menu.RadioItemGroup` | `MenuRadioGroup`          | 单选分组（`value`/`onValueChange`）    |
| `Menu.RadioItem`      | `MenuRadioItem`           | 单选项                                 |
| `Menu.CheckboxItem`   | `MenuCheckboxItem`        | 多选项（独立 checked 状态）            |
| `Menu.ItemIndicator`  | 内部（渲染 `check` 图标） | 选中指示，在 RadioItem/CheckboxItem 内 |

**关键 Ark UI Root Props**：

- `open` / `defaultOpen` / `onOpenChange` — 受控/非受控开关
- `closeOnSelect` — 点击 Item 后是否自动关闭（默认 true）
- `positioning` — 传递给 `@floating-ui`（`placement`、`gutter`、`flip`、`shift`、`overflowPadding`）
- `onSelect` — 全局 select 回调（也可在单 Item 上设置）

---

## 决策 3：子菜单实现方案

**决策**：嵌套 `Menu.Root` + `Menu.TriggerItem` 实现多级子菜单。

**依据**：

- Ark UI 官方推荐模式：在父 `Menu.Content` 内部放置嵌套的 `Menu.Root`，以 `Menu.TriggerItem` 作为触发项。
- Ark UI 内部通过 zag.js 状态机协调多层菜单的焦点和键盘导航，不需要手动处理 ArrowRight/ArrowLeft 行为。
- 子菜单的浮层定位由各自的 `Menu.Positioner` 独立处理，默认 `placement: 'right-start'`，支持自动 flip。

**子菜单结构示例（内部实现参考）**：

```
Menu.Root (父)
  Menu.Trigger
  Menu.Positioner
    Menu.Content
      Menu.Item
      Menu.TriggerItem (子菜单触发)
        Menu.Root (子)
          Menu.Positioner
            Menu.Content
              Menu.Item
```

---

## 决策 4：ContextMenu 实现方案

**决策**：使用 `Menu.ContextTrigger` 原语，包裹目标区域即可启用右键菜单。

**依据**：

- Ark UI 内置 `Menu.ContextTrigger`，监听 `contextmenu` 事件，自动在光标位置定位菜单（`anchorPoint` 模式）。
- 无需手动管理坐标计算或二次右键时的菜单移动——Ark UI 内部处理。

**公开 API 设计**：

```
ContextMenu（复合组件）
  ContextMenu.Trigger（= Menu.ContextTrigger 封装）
  ContextMenu.Content（复用 MenuContent 内容层）
```

或直接在 `Menu` 组件上通过 `trigger="context"` prop 切换模式（类似 Popover 的 trigger prop 设计）。

**决策**：采用独立的 `ContextMenu` 组件而非在 `Menu` 上加 trigger prop，以保持 API 清晰性和 Ark UI 原语对齐。

---

## 决策 5：选中态视觉（图标 + 主题色）

**决策**：

- 选中图标：`@deweyou-ui/icons` 中的 `"check"` 图标（通过 `<Icon name="check" />` 懒加载）。
- 选中文字颜色：`var(--ui-color-brand-bg)`（emerald-700，与按钮 primary 色一致）。
- `Menu.ItemIndicator` 渲染位置：菜单项右侧，通过 flex 布局 `justify-content: space-between` 实现。

**选中态样式约定**：

```less
.item[data-highlighted] {
  background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
}

.item[data-state='checked'] {
  color: var(--ui-color-brand-bg);
}

.itemIndicator {
  display: none;
  color: var(--ui-color-brand-bg);
}

.item[data-state='checked'] .itemIndicator {
  display: inline-flex;
}
```

---

## 决策 6：样式系统

**决策**：CSS Modules（Less）+ 设计 token，复用以下现有 token，不新增 token：

| 用途          | Token                                     |
| ------------- | ----------------------------------------- |
| 菜单背景      | `--ui-color-surface`                      |
| 菜单边框      | `--ui-color-border`                       |
| 菜单阴影      | `--ui-shadow-soft`                        |
| 正文色        | `--ui-color-text`                         |
| 选中色/主题色 | `--ui-color-brand-bg`                     |
| 焦点环        | `--ui-color-focus-ring`                   |
| 圆角          | `0.4rem`（rounded 档位）                  |
| 分组标签色    | `--ui-color-text`（降低 opacity，约 0.5） |

**动效**：入场 `160ms cubic-bezier(0.22, 1, 0.36, 1)`，出场 `160ms ease`，与 Popover 保持一致。

---

## 决策 7：公开 API 设计原则

**决策**：公开 API 与 Ark UI 原语解耦，但命名和 prop 语义对齐，便于开发者迁移。

- 不直接透传 Ark UI props（消费方不感知 Ark UI）。
- prop 命名遵循 Ark UI 的语义命名（如 `closeOnSelect`、`onSelect`、`value`、`onValueChange`）。
- 公开 `placement` 使用项目 PopoverPlacement 风格还是 Ark UI 原生字符串？决策：直接使用 Ark UI 的 `Placement` 字符串子集，避免维护映射表（Menu 不像 Popover 需要自定义方向名）。

---

## 无需进一步研究的事项

- 测试工具：项目已统一使用 `vp test`（Vitest）。
- 构建工具：复用 Vite+ 统一约定，不需要 package 级专用配置。
- storybook 结构：复用现有 `apps/storybook/src/` 下同 Popover 模式的结构。
- website 预览：在 `apps/website/src/main.tsx` 中新增 Menu 预览板块（与现有 Button/Popover/Text 并列）。
