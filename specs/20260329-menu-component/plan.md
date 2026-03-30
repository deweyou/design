# 实施计划：Menu 组件

**分支**：`20260329-menu-component` | **日期**：2026-03-29 | **规格**：[spec.md](./spec.md)
**输入**：来自 `/specs/20260329-menu-component/spec.md` 的功能规格
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**说明**：该模板由 `/speckit.plan` 命令填充。

## 摘要

实现 `@deweyou-ui/components` 的 `Menu` 组件族，基于 Ark UI Menu 原语提供行为层，通过 CSS Modules（Less）+ 设计 token 提供样式层。功能范围：基础菜单、分组与分割线、二级/多级子菜单、单选（`MenuRadioGroup`/`MenuRadioItem`）、多选（`MenuCheckboxItem`）、右键上下文菜单（`ContextMenu`）。所有交互组件以 `@ark-ui/react` 的 Menu 模块为行为基础，不自行实现状态机、键盘导航或 ARIA。选中态右侧展示 `@deweyou-ui/icons` 的 `"check"` 图标，文字呈现 `--ui-color-brand-bg`（emerald-700）。

---

## 技术上下文

**语言/版本**：TypeScript 5.x、React 19.x、Less（CSS Modules）
**主要依赖**：`@ark-ui/react`（Menu 原语）、`@deweyou-ui/styles`（设计 token）、`@deweyou-ui/icons`（`Icon` 组件 + `"check"` 图标）、`classnames`
**存储**：N/A（纯 UI 组件库，无持久化）
**测试**：`vp test`（Vitest + @testing-library/react）
**目标平台**：现代浏览器（与现有 Button/Popover 组件一致）
**项目类型**：library（`packages/components`，`@deweyou-ui/components`）
**性能目标**：菜单入场动效 ≤ 160ms；组件 tree-shaking 友好（按需引入）
**约束**：公开 API 与 Ark UI 内部接口解耦；不新增设计 token；不使用 Ark UI 默认样式
**规模/范围**：单一 package 内新增 `src/menu/` 目录，影响 `packages/components`、`apps/website`、`apps/storybook`

---

## 宪章检查

_门禁：必须在 Phase 0 research 前通过。Phase 1 设计后重新检查结果如下：_

- **✅ 目标 package 边界**：Menu 组件族完整实现于 `packages/components/src/menu/`，通过 `packages/components/src/index.ts` 暴露公开 API，不在 `website` 中重复实现行为逻辑。
- **✅ 公开 API 变化**：新增导出 `Menu`、`MenuTrigger`、`MenuContent`、`MenuItem`、`MenuGroup`、`MenuGroupLabel`、`MenuSeparator`、`MenuTriggerItem`、`MenuRadioGroup`、`MenuRadioItem`、`MenuCheckboxItem`、`ContextMenu` 及全部类型，详见 [contracts/menu-api.ts](./contracts/menu-api.ts)。semver 影响：minor（新增导出，不破坏现有 API）。
- **✅ 无障碍预期**：正确的 ARIA 角色（`menu`、`menuitem`、`menuitemradio`、`menuitemcheckbox`）由 Ark UI 内置；键盘导航（Arrow、Enter、Space、Escape、Tab、Home、End）由 Ark UI 状态机处理；焦点管理（打开时进入菜单、关闭时回到触发元素）由 Ark UI 处理；禁用项 `aria-disabled`；子菜单 `aria-haspopup`/`aria-expanded` 均由 Ark UI 输出。
- **✅ Token 和主题影响**：复用现有 token（`--ui-color-surface`、`--ui-color-border`、`--ui-color-text`、`--ui-color-brand-bg`、`--ui-shadow-soft`、`--ui-color-focus-ring`），不新增 token。
- **✅ 验证规划**：`vp check`（类型检查 + lint）、`vp test`（单元测试，colocate 于 `src/menu/index.test.tsx`）、`website` 中新增 Menu 预览板块（基础、分组、子菜单、单选、多选、禁用、ContextMenu）。
- **✅ 简体中文文档**：本 plan.md、spec.md、research.md、data-model.md、quickstart.md 均以简体中文撰写；代码标识符保留原文。
- **✅ Vite+ 构建约定**：Menu 组件复用现有 `packages/components` 的 Vite+ 统一构建配置，不新增 package 级专用构建配置。

---

## 项目结构

### 文档（本功能）

```text
specs/20260329-menu-component/
├── plan.md              # 本文件
├── spec.md              # 功能规格
├── research.md          # Phase 0 研究结论
├── data-model.md        # Phase 1 组件实体模型
├── quickstart.md        # Phase 1 使用指南
├── contracts/
│   └── menu-api.ts      # Phase 1 公开 API 类型契约
└── tasks.md             # Phase 2 输出（/speckit.tasks 命令生成）
```

### 源代码（仓库根目录）

```text
packages/
└── components/
    └── src/
        ├── menu/
        │   ├── index.tsx            # 组件实现（全部 Menu 子组件）
        │   ├── index.module.less    # 样式（CSS Modules）
        │   └── index.test.tsx       # 单元测试（colocate）
        └── index.ts                 # 新增 Menu 导出

apps/
├── website/
│   └── src/
│       └── main.tsx                 # 新增 Menu 预览板块
└── storybook/
    └── src/
        └── stories/
            └── menu.stories.tsx     # Menu 组件故事
```

**结构决策**：

- Menu 所有子组件（`MenuItem`、`MenuGroup`、`MenuRadioItem` 等）均实现于同一个 `src/menu/index.tsx` 文件，保持 colocate 约定，避免过早拆分。
- 样式全部集中于 `src/menu/index.module.less`，通过 `data-*` 属性选择器覆盖 Ark UI 的状态数据属性（`data-state`、`data-highlighted`、`data-disabled`）。
- Website 预览在 `main.tsx` 内联添加（与 Button/Popover 现有模式一致），不新建独立页面文件。
- Storybook 新增 `menu.stories.tsx`，覆盖全部使用场景。

---

## Phase 0：研究结论

详见 [research.md](./research.md)。关键决策摘要：

1. **行为层**：`@ark-ui/react` Menu 原语（`Menu.Root` → `Menu.Item` → `Menu.RadioItemGroup` → `Menu.CheckboxItem` → `Menu.ContextTrigger`）
2. **子菜单**：嵌套 `Menu.Root` + `Menu.TriggerItem`，Ark UI 内部协调多层焦点
3. **ContextMenu**：`Menu.ContextTrigger` 包裹目标区域，Ark UI 自动处理光标定位
4. **选中图标**：`@deweyou-ui/icons` 的 `"check"` 图标，通过 `<Icon name="check" />` 懒加载
5. **样式系统**：复用现有 token，不新增，动效与 Popover 保持一致（160ms）

---

## Phase 1：设计与契约

### 组件实体模型

详见 [data-model.md](./data-model.md)。关键组件：

| 组件               | Ark UI 原语映射                     | 受控/非受控                |
| ------------------ | ----------------------------------- | -------------------------- |
| `Menu`             | `Menu.Root`                         | `open`/`defaultOpen`       |
| `MenuTrigger`      | `Menu.Trigger`                      | —                          |
| `MenuContent`      | `Menu.Positioner` + `Menu.Content`  | —                          |
| `MenuItem`         | `Menu.Item`                         | —                          |
| `MenuGroup`        | `Menu.ItemGroup`                    | —                          |
| `MenuGroupLabel`   | `Menu.ItemGroupLabel`               | —                          |
| `MenuSeparator`    | `Menu.Separator`                    | —                          |
| `MenuTriggerItem`  | `Menu.TriggerItem`                  | —                          |
| `MenuRadioGroup`   | `Menu.RadioItemGroup`               | `value`/`defaultValue`     |
| `MenuRadioItem`    | `Menu.RadioItem`                    | —（跟随 RadioGroup）       |
| `MenuCheckboxItem` | `Menu.CheckboxItem`                 | `checked`/`defaultChecked` |
| `ContextMenu`      | `Menu.Root` + `Menu.ContextTrigger` | `open`/`defaultOpen`       |

### 接口契约

详见 [contracts/menu-api.ts](./contracts/menu-api.ts)。

### 样式架构

```less
// index.module.less 关键结构

// 菜单内容面板
.content {
  background: var(--ui-color-surface);
  border: 1px solid var(--ui-color-border);
  border-radius: 0.4rem; // rounded 档位
  box-shadow: var(--ui-shadow-soft);
  padding-block: 0.25rem;
  min-inline-size: 10rem;
  max-inline-size: min(20rem, calc(100vw - 32px));
  z-index: 1080;
}

// 入场/出场动效（与 Popover 一致）
.content[data-state='open'] {
  animation: menuEnter 160ms cubic-bezier(0.22, 1, 0.36, 1);
}
.content[data-state='closed'] {
  animation: menuExit 160ms ease forwards;
}

// 菜单项基础样式
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-block: 0.45rem;
  padding-inline: 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition:
    background 140ms ease,
    color 140ms ease;
  font-size: 1rem;
  color: var(--ui-color-text);
}

// 高亮态（键盘焦点/悬停）
.item[data-highlighted] {
  background: color-mix(in srgb, var(--ui-color-text) 8%, transparent);
  outline: none;
}

// 禁用态
.item[data-disabled] {
  opacity: 0.56;
  cursor: not-allowed;
  pointer-events: none;
}

// 激活态（点击瞬间）
.item:active:not([data-disabled]) {
  background: color-mix(in srgb, var(--ui-color-text) 14%, transparent);
  transform: translateY(1px);
}

// 选中态（RadioItem / CheckboxItem）
.item[data-state='checked'] {
  color: var(--ui-color-brand-bg);
}

// check 图标区域（右侧）
.itemIndicator {
  margin-inline-start: auto;
  display: none;
  color: var(--ui-color-brand-bg);
}
.item[data-state='checked'] .itemIndicator {
  display: inline-flex;
}

// 分组标签
.groupLabel {
  padding-block: 0.3rem 0.1rem;
  padding-inline: 0.75rem;
  font-size: 0.875rem;
  color: var(--ui-color-text);
  opacity: 0.5;
  cursor: default;
}

// 分割线
.separator {
  border: none;
  border-top: 1px solid var(--ui-color-border);
  margin-block: 0.25rem;
}

// 子菜单触发项的展开箭头
.triggerItemArrow {
  margin-inline-start: auto;
  display: inline-flex;
  opacity: 0.6;
}

// 焦点环（仅 focus-visible）
.item:focus-visible {
  outline: 2px solid var(--ui-color-focus-ring);
  outline-offset: -2px;
}
```

### 关键实现细节

**1. MenuContent 内部结构**（含 Positioner + Portal）：

```tsx
// 类似 Popover 的 createPortal 模式
const MenuContentInner = ({ children, portalContainer, className, style }: MenuContentProps) => {
  return (
    <Menu.Positioner>
      <Menu.Content className={classNames(styles.content, className)} style={style}>
        {children}
      </Menu.Content>
    </Menu.Positioner>
  );
};

// MenuContent 通过 Portal 挂载到 document.body
export const MenuContent = ({ portalContainer = document.body, ...props }: MenuContentProps) => {
  return createPortal(<MenuContentInner {...props} />, portalContainer ?? document.body);
};
```

**2. MenuItem + 图标布局**：

```tsx
export const MenuItem = ({
  value,
  disabled,
  onSelect,
  icon,
  children,
  className,
}: MenuItemProps) => (
  <ArkMenu.Item
    value={value ?? ''}
    disabled={disabled}
    onSelect={onSelect}
    className={classNames(styles.item, className)}
  >
    {icon && <span className={styles.itemIcon}>{icon}</span>}
    <span className={styles.itemLabel}>{children}</span>
  </ArkMenu.Item>
);
```

**3. MenuRadioItem + check 图标**：

```tsx
export const MenuRadioItem = ({
  value,
  disabled,
  icon,
  children,
  className,
}: MenuRadioItemProps) => (
  <ArkMenu.RadioItem
    value={value}
    disabled={disabled}
    className={classNames(styles.item, className)}
  >
    {icon && <span className={styles.itemIcon}>{icon}</span>}
    <span className={styles.itemLabel}>{children}</span>
    <ArkMenu.ItemIndicator className={styles.itemIndicator}>
      <Icon name="check" size="small" />
    </ArkMenu.ItemIndicator>
  </ArkMenu.RadioItem>
);
```

**4. 子菜单嵌套结构**：

```tsx
// 消费方用法（由 quickstart.md 展示）：
// <Menu placement="right-start">
//   <MenuTriggerItem>子菜单</MenuTriggerItem>
//   <MenuContent>...</MenuContent>
// </Menu>
//
// MenuTriggerItem 内部使用 ArkMenu.TriggerItem，
// 嵌套的 Menu.Root 无需单独 Trigger，由父菜单的 TriggerItem 驱动。
```

**5. ContextMenu 结构**：

```tsx
export const ContextMenu = ({ children, ...rootProps }: ContextMenuProps) => (
  <ArkMenu.Root {...rootProps}>{children}</ArkMenu.Root>
);

ContextMenu.Trigger = ({ children, className }: ContextMenuTriggerProps) => (
  <ArkMenu.ContextTrigger className={className}>{children}</ArkMenu.ContextTrigger>
);

ContextMenu.Content = MenuContent; // 完全复用
```

---

## 验证计划

```bash
# 类型检查 + lint + 格式化
vp check

# 单元测试
vp test packages/components

# 本地预览（website）
vp run website#dev
```

**测试覆盖要求**（`src/menu/index.test.tsx`）：

- 基础菜单：渲染、点击触发器打开、点击菜单项触发 onSelect 并关闭
- 禁用项：不触发 onSelect，不关闭菜单
- 键盘导航：ArrowDown/ArrowUp、Enter 激活、Escape 关闭
- 单选：点击 RadioItem 更新 value，其他项取消选中
- 多选：点击 CheckboxItem 切换 checked，其他项不受影响
- ContextMenu：右键点击触发区域，菜单出现
- 受控模式：外部 open prop 控制开关

**Website 预览板块**（新增到 `apps/website/src/main.tsx`）：

- 基础菜单示例
- 分组 + 分割线示例
- 子菜单示例
- 单选菜单示例
- 多选菜单示例
- 禁用项示例
- ContextMenu 示例

---

## 复杂度追踪

_宪章检查通过，无需填写此节（无违反项）。_
