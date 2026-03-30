# 功能规格：Menu 组件

**功能分支**：`20260329-menu-component`
**创建时间**：2026-03-29
**状态**：草稿
**输入**：用户描述："帮我实现 Menu 组件，结合 ArkUI 和我的设计风格。列表容器除了普通列表之外，需要支持具备分组、分割线、二级或多级 menu、item 选中（选中后内容呈现主题色，且内容右侧有☑️icon，去 icon 组件找），同时支持单选或者多选。然后 menu 也要支持 contextMenu 能力。 api 能力对齐 ark 组件。"
**语言要求**：本文件及同级 `/specs/` 文档正文必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

## 用户场景与测试（必填）

### 用户故事 1 - 基础菜单触发与列表展示（优先级：P1）

应用开发者需要一个可由触发元素（按钮、图标等）打开的浮层菜单，菜单中包含若干可点击的操作项。点击菜单项后执行回调并关闭菜单。

**为什么是这个优先级**：这是 Menu 的最基础能力，其他所有功能都依赖此基础。

**独立测试**：可以单独渲染一个带有触发按钮的 Menu，打开后能看到菜单项列表，点击项目可触发回调并关闭菜单。

**验收场景**：

1. **假如** 页面上存在 Menu 触发按钮，**当** 用户点击该按钮，**那么** 菜单浮层出现，包含所有菜单项。
2. **假如** 菜单已打开，**当** 用户点击某个菜单项，**那么** 对应的回调被触发，菜单关闭。
3. **假如** 菜单已打开，**当** 用户按下 Escape 键或点击菜单外区域，**那么** 菜单关闭。
4. **假如** 某菜单项处于 disabled 状态，**当** 用户点击该项，**那么** 不触发回调，菜单不关闭。

---

### 用户故事 2 - 分组与分割线（优先级：P1）

应用开发者需要将菜单项按逻辑语义分组，分组之间用分割线视觉分隔，每个分组可以有可选的标签文字。

**为什么是这个优先级**：对于复杂菜单（如右键菜单、操作菜单）分组是标配能力，与基础列表并列为核心。

**独立测试**：渲染一个包含多个 MenuGroup 的菜单，验证分组标签和分割线正确展示。

**验收场景**：

1. **假如** 菜单包含多个 MenuGroup，**当** 菜单打开，**那么** 各组之间有分割线视觉区隔，组内标签文字（若有）正确显示。
2. **假如** 使用独立的 MenuSeparator，**当** 菜单打开，**那么** 分割线出现在指定位置。

---

### 用户故事 3 - 二级与多级子菜单（优先级：P2）

应用开发者需要在菜单项上悬停或点击后展开子菜单，子菜单可继续嵌套，支持多级层级。

**为什么是这个优先级**：层级菜单是进阶使用场景，在基础菜单稳定后交付。

**独立测试**：渲染一个包含 TriggerItem 的菜单，悬停后打开子菜单，子菜单中也可嵌套 TriggerItem。

**验收场景**：

1. **假如** 菜单中包含子菜单触发项（带有展开箭头指示），**当** 用户悬停或聚焦该项，**那么** 子菜单在其侧面展开。
2. **假如** 子菜单已展开，**当** 用户将鼠标移出子菜单区域，**那么** 子菜单在合理延迟后关闭。
3. **假如** 子菜单中也包含子菜单触发项，**当** 用户继续悬停，**那么** 更深层子菜单正确展开（支持无限层级）。
4. **假如** 子菜单已展开，**当** 用户按下 ArrowLeft，**那么** 子菜单关闭，焦点回到父菜单触发项。

---

### 用户故事 4 - 单选与多选（优先级：P2）

应用开发者需要菜单项具备选中状态，支持单选组（同组内互斥）或多选组（可复选）。选中项右侧展示 check 图标，文字呈现主题色。

**为什么是这个优先级**：选中态是菜单作为「状态控制器」的关键能力，适用于视图切换、过滤器等场景。

**独立测试**：渲染一个含 RadioGroup 和 CheckboxGroup 的菜单，验证选中/取消选中逻辑及视觉反馈。

**验收场景**：

1. **假如** MenuRadioGroup 中包含多个 MenuRadioItem，**当** 用户点击某项，**那么** 该项被选中（文字变主题色，右侧出现 check 图标），同组其他项取消选中。
2. **假如** MenuCheckboxItem 存在，**当** 用户点击某项，**那么** 该项在选中/未选中之间切换，其他项状态不受影响。
3. **假如** 选中项已有选中状态，**当** 菜单重新打开，**那么** 选中状态被正确保留并展示。
4. **假如** 外部通过受控方式传入选中值，**当** 值变化，**那么** 菜单中对应项的选中状态即时更新。

---

### 用户故事 5 - 右键上下文菜单（ContextMenu）（优先级：P2）

应用开发者需要在某个区域上绑定右键菜单，用户在该区域内右键点击后，在鼠标位置弹出菜单。

**为什么是这个优先级**：ContextMenu 是独立的触发模式，复用菜单列表能力，对编辑器、文件管理等场景有较高价值。

**独立测试**：在一个 div 区域上绑定 ContextMenu，在区域内右击，验证菜单在鼠标坐标附近弹出。

**验收场景**：

1. **假如** 某区域绑定了 ContextMenu，**当** 用户在该区域内右击，**那么** 菜单在光标附近弹出，不超出视口。
2. **假如** ContextMenu 已打开，**当** 用户再次在该区域内右击，**那么** 菜单移动到新的光标位置。
3. **假如** ContextMenu 已打开，**当** 用户点击菜单外区域或按 Escape，**那么** 菜单关闭。

---

### 边界情况

- 菜单项超出视口时，浮层应自动调整位置（flip/shift），保证菜单完整可见。
- 菜单内容为空（无 Item）时，菜单不展示（或展示占位，开发者可控制）。
- 仅使用键盘的用户：Tab 打开触发器，Enter/Space 打开菜单，Arrow 键导航，Enter 选中，Escape 关闭，焦点正确回到触发元素。
- 屏幕阅读器用户：菜单需有正确的 `role="menu"` / `role="menuitem"` / `role="menuitemradio"` / `role="menuitemcheckbox"` ARIA 结构。
- 子菜单触发项需有 `aria-haspopup` 和 `aria-expanded` 标记，子菜单展开时焦点正确进入。
- disabled 状态的 Item 需有 `aria-disabled="true"`，不可通过键盘激活。
- 极长菜单项文字需能截断或换行，不破坏布局。
- 多层级子菜单嵌套过深时，位置计算需防止超出视口。

## 需求（必填）

### 功能需求

- **FR-001**：系统必须提供 Menu 组件，支持由外部触发元素（按钮、图标等）打开和关闭菜单浮层。
- **FR-002**：系统必须提供 MenuItem，支持设置标签文字、图标（前置）、禁用状态，点击时触发 `onSelect` 回调。
- **FR-003**：系统必须提供 MenuGroup，支持将多个 MenuItem 归入一个语义分组，并支持可选的分组标签（label）。
- **FR-004**：系统必须提供 MenuSeparator，作为菜单项之间的视觉分割线。
- **FR-005**：系统必须提供 MenuTriggerItem，作为展开子菜单的触发项，右侧显示展开方向箭头，支持嵌套（无限层级）。
- **FR-006**：系统必须提供 MenuRadioGroup + MenuRadioItem，实现同组内单选逻辑，选中项右侧展示 `check` 图标，文字呈现主题色（`--ui-color-brand-bg`）。
- **FR-007**：系统必须提供 MenuCheckboxItem，实现多选逻辑，选中时右侧展示 `check` 图标，文字呈现主题色。
- **FR-008**：系统必须支持受控（`value` + `onValueChange`）和非受控（`defaultValue`）两种方式管理单选/多选选中状态。
- **FR-009**：系统必须提供 ContextMenu 模式，绑定到目标区域后，右键点击在光标位置展开菜单，并自动防视口溢出。
- **FR-010**：系统必须为每个受影响的 package 定义公开 API 面，包括命名、props，以及受控/非受控行为；API 能力对齐 Ark UI Menu 原语（`@ark-ui/react`）。
- **FR-011**：系统必须满足无障碍要求：正确的 ARIA 角色（`menu`、`menuitem`、`menuitemradio`、`menuitemcheckbox`）、焦点管理（打开时进入菜单、关闭时回到触发元素）、完整的键盘导航（Arrow、Enter、Space、Escape、Tab）。
- **FR-012**：系统必须识别复用现有设计 token（`--ui-color-brand-bg`、`--ui-color-text`、`--ui-color-surface`、`--ui-color-border`、`--ui-shadow-soft`、圆角 `rounded`），不新增 token，除非有明确必要。
- **FR-013**：系统必须在 `website` 和 Storybook 中提供以下预览：普通列表、纯分组（无分割线）、仅分割线、分组+分割线、子菜单、单选、多选、禁用项、ContextMenu、尺寸变体、形状变体。
- **FR-014**：系统必须支持 `size` 属性（`sm` / `md` / `lg`），通过 React context 从 Menu / ContextMenu 传递至 MenuContent，影响菜单面板最小宽度、内边距、字号及圆角。
- **FR-015**：系统必须支持 `shape` 属性（`rounded` / `rect`），控制菜单面板及菜单项的圆角风格；`rounded` 为默认值（`0.4rem`），`rect` 为直角（`0`）。
- **FR-016**：系统必须保证以下视觉规范：① 菜单面板获得焦点时不显示浏览器默认聚焦轮廓；② 菜单触发按钮在菜单交互过程中不显示焦点环（仅键盘 Tab 导航时保留，但由触发元素自身决定）；③ disabled 菜单项显示 `cursor: not-allowed`，不设置 `pointer-events: none`（由 Ark UI 内部控制交互禁用）；④ 相邻 MenuGroup 之间（无 MenuSeparator 分隔时）自动添加 `0.5rem` 上间距，分组标签底部留有充足间距避免与下方菜单项贴合。

### 无障碍与 UI 契约（UI 工作必填）

- **用户角色 / 参与方**：仅键盘用户、屏幕阅读器用户（NVDA/VoiceOver）、消费该 package 的应用开发者。
- **交互模型**：点击触发器打开菜单；ArrowDown/ArrowUp 导航菜单项；ArrowRight 展开子菜单；ArrowLeft 关闭子菜单；Enter/Space 激活菜单项或选中；Escape 关闭当前层级菜单；Tab 关闭整个菜单并移出焦点；右键触发 ContextMenu。
- **需要覆盖的状态**：默认（closed）、open、item-hover、item-focus-visible、item-disabled、item-selected（radio/checkbox）、submenu-open、context-menu-open。
- **主题 / token 影响**：复用 `--ui-color-brand-bg`（选中色）、`--ui-color-text`（正文色）、`--ui-color-surface`（菜单背景）、`--ui-color-border`（分割线/边框）、`--ui-shadow-soft`（浮层阴影）、`rounded` 圆角；无新增 token。

### 关键实体

- **Menu**：顶层容器，管理菜单的开关状态（受控/非受控），包含 Trigger 和 Content；提供 `size`（`sm`/`md`/`lg`）和 `shape`（`rounded`/`rect`）属性，经 React context 向下传递给 MenuContent。
- **MenuItem**：基础菜单项，携带 `value`（可选，用于选中逻辑）、`label`、`icon`、`disabled` 属性。
- **MenuGroup**：将 MenuItem 集合分组，可带 `label` 显示分组标题，组间自动插入 Separator。
- **MenuSeparator**：纯视觉分割线，无语义值。
- **MenuTriggerItem**：既是菜单项又是子菜单触发器，携带 `children`（子 Menu 内容）。
- **MenuRadioGroup**：单选分组容器，持有 `value`/`defaultValue`/`onValueChange`，子项互斥。
- **MenuRadioItem**：单选菜单项，`value` 与 RadioGroup 当前值比对，选中时展示 check 图标。
- **MenuCheckboxItem**：多选菜单项，持有独立 `checked`/`defaultChecked`/`onCheckedChange`，选中时展示 check 图标。
- **ContextMenu**：包裹目标区域，监听右键事件，复用 Menu 内容层；同样支持 `size` 和 `shape` 属性。

## 成功标准（必填）

### 可度量结果

- **SC-001**：开发者可在不引入任何自定义行为逻辑的情况下，通过组合 Menu 子组件在 10 分钟内搭建出一个包含分组和选中状态的完整菜单。
- **SC-002**：菜单从触发到展示的视觉延迟对用户无感（入场动效 ≤ 160ms），符合项目动效规范。
- **SC-003**：键盘用户可以完全通过键盘完成打开菜单、导航所有层级、激活菜单项、关闭菜单的完整流程，无需鼠标。
- **SC-004**：屏幕阅读器（VoiceOver / NVDA）可正确播报菜单的角色、当前项、选中状态及子菜单展开状态。
- **SC-005**：菜单浮层在任意视口尺寸下均不超出视口边界（自动 flip/shift）。
- **SC-006**：主要组件状态（普通、分组、子菜单、单选、多选、禁用、ContextMenu）被自动化测试覆盖，并可在 `website` 中进行可视化评审。
- **SC-007**：ContextMenu 在目标区域内的右键点击位置精准弹出（误差 ≤ 4px），并在同区域内二次右键时移动到新位置。

## 假设与约束

- Menu 行为层完全基于 `@ark-ui/react` 的 Menu 原语，不自行实现状态机、ARIA 管理或浮层定位。
- 所有样式通过 CSS Modules（Less）+ 项目设计 token 实现，不使用 Ark UI 默认样式。
- 公开 API 与 Ark UI 原语解耦：消费方不直接接触 Ark UI props，由封装层转译。
- `check` 图标使用 `@deweyou-ui/icons` 中的 `"check"` 图标名称。
- 子菜单使用 Ark UI 的 `Menu.TriggerItem` + 嵌套 `Menu` 实现，定位由 Ark UI 内置浮层引擎处理。
- ContextMenu 使用 Ark UI 的受控 `open` + `onOpenChange` 结合 `contextmenu` 事件实现，或使用 Ark UI 原生 ContextTrigger（若版本支持）。
- 不支持虚拟滚动（长列表截断不在本期范围内）。
