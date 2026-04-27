# 任务：Menu 组件

**输入**：来自 `/specs/20260329-menu-component/` 的设计文档
**前置条件**：plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅、contracts/ ✅
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章第 IV 条，组件逻辑与用户可见行为必须有测试。生成的任务包含自动化测试与 `website` 预览更新。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（不同文件、无未完成依赖）
- **[Story]**：所属用户故事（US1~US5）
- 描述中包含准确文件路径

---

## Phase 1：准备（共享基础设施）

**目的**：建立 `menu/` 目录结构，确认受影响的入口路径

- [x] T001 在 `packages/components/src/` 下创建 `menu/` 目录，新建 `index.tsx`、`index.module.less`、`index.test.tsx` 三个空文件
- [x] T002 [P] 确认 `@ark-ui/react` 中 Menu 模块的导出路径（`import { Menu } from '@ark-ui/react/menu'`），以及 `@deweyou-ui/icons` 中 `Icon` 组件和 `"check"` 图标的导入路径
- [x] T003 [P] 确认 `@deweyou-ui/styles` 的 Less bridge 文件路径（`packages/styles/src/less/bridge.less`）及所需 token 变量名

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事都依赖的骨架结构、公开 API 导出面和 Less 样式基础变量

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

- [x] T004 在 `packages/components/src/menu/index.tsx` 中定义所有公开类型（`MenuProps`、`MenuItemProps`、`MenuRadioGroupProps`、`MenuCheckboxItemProps`、`ContextMenuProps` 等，参考 `specs/20260329-menu-component/contracts/menu-api.ts`），并以空组件占位导出所有公开成员
- [x] T005 [P] 在 `packages/components/src/menu/index.module.less` 中定义 CSS 自定义属性和 Less 变量（引入 `@deweyou-ui/styles` bridge，声明 `--menu-z-index`、`--menu-min-width`、`--menu-radius` 等局部变量），不实现具体样式规则
- [x] T006 [P] 在 `packages/components/src/index.ts` 中添加 Menu 组件族的导出占位（所有类型和组件名称），确保 `vp check` 通过（此时为空实现）

**检查点**：`vp check` 通过，`packages/components/src/index.ts` 导出面无类型错误

---

## Phase 3：用户故事 1 - 基础菜单触发与列表展示（优先级：P1）🎯 MVP

**目标**：可由触发按钮打开浮层菜单，展示可点击菜单项，支持 disabled 状态，点击项目触发回调并关闭菜单，Escape 或外部点击关闭菜单

**独立测试**：单独渲染含触发按钮的 `Menu`，验证打开/关闭/回调/禁用行为，无需其他故事功能

### 用户故事 1 的测试 ⚠️

- [x] T007 [P] [US1] 在 `packages/components/src/menu/index.test.tsx` 中编写 `Menu` 开关状态测试：点击触发器后菜单出现，点击菜单项后触发 `onSelect` 并关闭，点击外部区域后关闭，按 Escape 键后关闭
- [x] T008 [P] [US1] 在 `packages/components/src/menu/index.test.tsx` 中编写 `MenuItem` 测试：`disabled` 项不触发 `onSelect`、不关闭菜单，菜单项正确渲染标签文字和前置图标

### 用户故事 1 的实现

- [x] T009 [US1] 在 `packages/components/src/menu/index.tsx` 中实现 `Menu` 根组件（包装 `ArkMenu.Root`，处理 `open`/`defaultOpen`/`onOpenChange`/`closeOnSelect`/`placement`/`gutter`/`disabled` props）
- [x] T010 [US1] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuTrigger`（包装 `ArkMenu.Trigger`，使用 `asChild` 透传触发行为到子元素）
- [x] T011 [US1] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuContent`（包装 `ArkMenu.Positioner` + `ArkMenu.Content`，通过 `createPortal` 挂载到 `document.body`，支持 `portalContainer` prop）
- [x] T012 [US1] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuItem`（包装 `ArkMenu.Item`，支持 `value`、`disabled`、`onSelect`、`icon`、`children` props，布局：前置图标 + 标签文字）
- [x] T013 [US1] 在 `packages/components/src/menu/index.module.less` 中实现菜单面板样式（`.content`：背景 `--ui-color-surface`、边框 `--ui-color-border`、阴影 `--ui-shadow-soft`、圆角 `0.4rem`、`padding-block: 0.25rem`、`min-inline-size: 10rem`）
- [x] T014 [US1] 在 `packages/components/src/menu/index.module.less` 中实现菜单项样式（`.item`：flex 布局、`padding-block: 0.45rem`、`padding-inline: 0.75rem`、`transition: 140ms ease`；`[data-highlighted]`：`color-mix 8%` 背景；`[data-disabled]`：`opacity: 0.56`，`cursor: not-allowed`；`:active`：`color-mix 14%` + `translateY(1px)`；`:focus-visible`：`2px outline` + `2px offset`）
- [x] T015 [US1] 在 `apps/website/src/main.tsx` 中添加「基础菜单」预览板块（含触发按钮、多个 MenuItem、至少一个 disabled 项）

**检查点**：`vp test` 通过 T007/T008，`vp run website#dev` 可看到基础菜单展示并交互正常

---

## Phase 4：用户故事 2 - 分组与分割线（优先级：P1）

**目标**：支持 `MenuGroup` 对菜单项语义分组（含可选 label），`MenuSeparator` 在任意位置插入视觉分割线

**独立测试**：渲染含多个 `MenuGroup` 和 `MenuSeparator` 的菜单，验证分组标签和分割线渲染正确，无需子菜单/选中功能

### 用户故事 2 的测试 ⚠️

- [x] T016 [P] [US2] 在 `packages/components/src/menu/index.test.tsx` 中编写 `MenuGroup` 测试：有 label 时正确渲染分组标签文字，无 label 时不渲染额外节点
- [x] T017 [P] [US2] 在 `packages/components/src/menu/index.test.tsx` 中编写 `MenuSeparator` 测试：分割线出现在菜单项之间的正确位置，具有正确的 ARIA 语义（`role="separator"` 由 Ark UI 输出）

### 用户故事 2 的实现

- [x] T018 [P] [US2] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuGroup`（包装 `ArkMenu.ItemGroup`，当 `label` prop 存在时自动渲染 `MenuGroupLabel`，关联 `id`/`htmlFor`）
- [x] T019 [P] [US2] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuGroupLabel`（包装 `ArkMenu.ItemGroupLabel`，接受 `htmlFor` prop）
- [x] T020 [P] [US2] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuSeparator`（包装 `ArkMenu.Separator`）
- [x] T021 [US2] 在 `packages/components/src/menu/index.module.less` 中实现分组标签样式（`.groupLabel`：`font-size: 0.875rem`、`padding-block: 0.3rem 0.1rem`、`padding-inline: 0.75rem`、`opacity: 0.5`、`cursor: default`）和分割线样式（`.separator`：`border-top: 1px solid --ui-color-border`、`margin-block: 0.25rem`）
- [x] T022 [US2] 在 `apps/website/src/main.tsx` 中更新 Menu 预览，添加「分组 + 分割线」示例（两个 MenuGroup，每组含若干 MenuItem，组间 MenuSeparator）

**检查点**：`vp test` 通过 T016/T017，website 分组菜单视觉正确

---

## Phase 5：用户故事 3 - 二级与多级子菜单（优先级：P2）

**目标**：`MenuTriggerItem` 可展开嵌套子菜单，支持多级嵌套，子菜单侧面定位，ArrowRight 展开、ArrowLeft 关闭

**独立测试**：渲染含 `MenuTriggerItem` 的菜单，验证悬停后子菜单展开，ArrowLeft 关闭，支持三级嵌套

### 用户故事 3 的测试 ⚠️

- [x] T023 [P] [US3] 在 `packages/components/src/menu/index.test.tsx` 中编写 `MenuTriggerItem` 测试：触发后子菜单展开并可交互，键盘 ArrowRight 展开子菜单，ArrowLeft 关闭子菜单并回到父菜单项，disabled 状态下不展开

### 用户故事 3 的实现

- [x] T024 [US3] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuTriggerItem`（包装 `ArkMenu.TriggerItem`，右侧渲染展开方向箭头图标，支持 `disabled`、`icon`、`children` props）；子菜单通过在 `MenuTriggerItem` 外部嵌套 `Menu.Root` 使用（消费方模式：`<Menu><MenuTriggerItem>...</MenuTriggerItem><MenuContent>...</MenuContent></Menu>`）
- [x] T025 [US3] 在 `packages/components/src/menu/index.module.less` 中实现子菜单触发项样式（`.triggerItemArrow`：`margin-inline-start: auto`、`opacity: 0.6`；子菜单 `MenuContent` 复用 `.content` 样式）
- [x] T026 [US3] 在 `apps/website/src/main.tsx` 中添加「子菜单」预览示例（两级子菜单，第二级也含一个 `MenuTriggerItem` 展示三级菜单）

**检查点**：`vp test` 通过 T023，website 子菜单多级展开视觉正确，键盘导航可用

---

## Phase 6：用户故事 4 - 单选与多选（优先级：P2）

**目标**：`MenuRadioGroup`/`MenuRadioItem` 实现互斥单选，`MenuCheckboxItem` 实现独立多选，选中项文字呈现主题绿色，右侧展示 `check` 图标，支持受控/非受控

**独立测试**：渲染含 `MenuRadioGroup` 的菜单，验证选中互斥；单独渲染 `MenuCheckboxItem`，验证独立切换；check 图标正确显隐

### 用户故事 4 的测试 ⚠️

- [x] T027 [P] [US4] 在 `packages/components/src/menu/index.test.tsx` 中编写 `MenuRadioGroup` + `MenuRadioItem` 测试：点击某项后该项 checked，同组其他项取消，`onValueChange` 携带正确 value，受控模式外部 value 变化同步到 UI
- [x] T028 [P] [US4] 在 `packages/components/src/menu/index.test.tsx` 中编写 `MenuCheckboxItem` 测试：点击后切换 checked 状态，`onCheckedChange` 携带正确 checked 值，其他 CheckboxItem 状态不受影响，check 图标在 checked 时可见

### 用户故事 4 的实现

- [x] T029 [P] [US4] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuRadioGroup`（包装 `ArkMenu.RadioItemGroup`，透传 `value`/`defaultValue`/`onValueChange`）
- [x] T030 [P] [US4] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuRadioItem`（包装 `ArkMenu.RadioItem`，内部使用 `ArkMenu.ItemIndicator` 渲染 `<Icon name="check" size="small" />`，布局：前置图标 + 标签文字 + 右侧指示器）
- [x] T031 [P] [US4] 在 `packages/components/src/menu/index.tsx` 中实现 `MenuCheckboxItem`（包装 `ArkMenu.CheckboxItem`，内部使用 `ArkMenu.ItemIndicator` 渲染 `<Icon name="check" size="small" />`，透传 `checked`/`defaultChecked`/`onCheckedChange`）
- [x] T032 [US4] 在 `packages/components/src/menu/index.module.less` 中实现选中态样式（`.item[data-state='checked']`：`color: --ui-color-brand-bg`；`.itemIndicator`：默认 `display: none`，`[data-state='checked']` 时 `display: inline-flex`，颜色继承 `--ui-color-brand-bg`；`.itemIcon`：前置图标包装）
- [x] T033 [US4] 在 `apps/website/src/main.tsx` 中添加「单选菜单」和「多选菜单」预览示例（单选示例含视图切换三个选项，多选示例含三个面板显隐开关，`closeOnSelect={false}`）

**检查点**：`vp test` 通过 T027/T028，website 选中态视觉正确（主题绿 + check 图标）

---

## Phase 7：用户故事 5 - 右键上下文菜单 ContextMenu（优先级：P2）

**目标**：`ContextMenu` 绑定目标区域，右键点击在光标位置弹出菜单，二次右键移动到新位置，Escape 或外部点击关闭

**独立测试**：在 div 区域上绑定 `ContextMenu`，模拟 `contextmenu` 事件，验证菜单在正确位置出现，与普通 `Menu` 共享内容层能力

### 用户故事 5 的测试 ⚠️

- [x] T034 [P] [US5] 在 `packages/components/src/menu/index.test.tsx` 中编写 `ContextMenu` 测试：触发区域内 `contextmenu` 事件后菜单出现，Escape 关闭，外部点击关闭，受控模式 `open`/`onOpenChange` 正确工作

### 用户故事 5 的实现

- [x] T035 [US5] 在 `packages/components/src/menu/index.tsx` 中实现 `ContextMenu` 复合组件（`ContextMenu` 根组件包装 `ArkMenu.Root`；`ContextMenu.Trigger` 包装 `ArkMenu.ContextTrigger`；`ContextMenu.Content` 直接复用 `MenuContent`，无需额外代码）
- [x] T036 [US5] 在 `packages/components/src/menu/index.module.less` 中为 `ContextMenu.Trigger` 添加样式（`.contextTrigger`：`display: contents` 或 `display: block` 根据实际渲染决定，确保区域可右键）
- [x] T037 [US5] 在 `apps/website/src/main.tsx` 中添加「ContextMenu」预览示例（一个带虚线边框的区域，提示「在此区域内右键点击」，菜单含刷新/复制/粘贴等操作项）

**检查点**：`vp test` 通过 T034，website ContextMenu 右键弹出视觉与行为正确

---

## Phase 8：打磨与横切关注点

**目的**：动效完善、prefers-reduced-motion、Storybook 故事、最终 lint/测试验证

- [x] T038 在 `packages/components/src/menu/index.module.less` 中实现入场/出场动效 keyframes（入场：`160ms cubic-bezier(0.22, 1, 0.36, 1)`，`translateY(6px) + scale(0.98) → 0`；出场：`160ms ease forwards`，`0 → translateY(4.2px) + scale(0.98)`，与 Popover 保持一致）
- [x] T039 [P] 在 `packages/components/src/menu/index.module.less` 中添加 `@media (prefers-reduced-motion: reduce)` 规则，禁用菜单 transform 动效，仅保留 opacity 变化
- [x] T040 [P] 在 `apps/storybook/src/stories/menu.stories.tsx` 中编写 Storybook 故事，覆盖：基础菜单、分组+分割线、子菜单、单选、多选、禁用项、ContextMenu（每个场景一个 Story，含简体中文说明）
- [x] T041 [P] 在 `packages/components/src/index.ts` 中核查 Menu 组件族的完整导出列表（组件 + 类型），确保与 `contracts/menu-api.ts` 一致
- [x] T042 运行 `vp check` 修复所有类型错误和 lint 问题
- [x] T043 运行 `vp test packages/components` 确保全部测试通过（T007/T008/T016/T017/T023/T027/T028/T034）
- [x] T044 在 `apps/website/src/main.tsx` 中核查所有 7 个 Menu 预览板块存在（基础、分组、子菜单、单选、多选、禁用项、ContextMenu）并正确渲染，运行 `vp run website#dev` 人工验收

---

## 依赖与执行顺序

### 阶段依赖

- **准备阶段（Phase 1）**：无依赖，可立即开始
- **基础阶段（Phase 2）**：依赖 Phase 1 完成，阻塞所有用户故事
- **US1 阶段（Phase 3）**：依赖 Phase 2，阻塞所有后续故事（MenuItem 是 US2~US5 的基础）
- **US2 阶段（Phase 4）**：依赖 Phase 3（MenuGroup 在 MenuContent 内使用）
- **US3 阶段（Phase 5）**：依赖 Phase 3（MenuTriggerItem 是 MenuItem 的扩展）
- **US4 阶段（Phase 6）**：依赖 Phase 3（RadioItem/CheckboxItem 是 MenuItem 的变体）
- **US5 阶段（Phase 7）**：依赖 Phase 3（ContextMenu 复用 MenuContent）
- **打磨阶段（Phase 8）**：依赖所有用户故事完成

### 用户故事依赖

```
Phase 1 → Phase 2 → Phase 3 (US1, P1)
                           ↓
          Phase 4 (US2, P1) ──┐
          Phase 5 (US3, P2) ──┤ 可并行（依赖 Phase 3 完成）
          Phase 6 (US4, P2) ──┤
          Phase 7 (US5, P2) ──┘
                           ↓
                       Phase 8
```

- **US2、US3、US4、US5** 均依赖 US1 基础结构，但彼此相互独立，可在 Phase 3 完成后并行推进

### 阶段内任务顺序（Phase 3 示例）

```
T007, T008（测试，可并行）
   ↓
T009（Menu 根组件）
   ↓
T010（MenuTrigger）→ T011（MenuContent）→ T012（MenuItem）（顺序依赖）
   ↓
T013, T014（样式，可并行）
   ↓
T015（website 预览）
```

---

## 并行执行示例

### Phase 2 并行

```bash
# 同时启动：
T005: packages/components/src/menu/index.module.less 中定义 CSS 变量
T006: packages/components/src/index.ts 中添加导出占位
```

### Phase 3（US1）测试并行

```bash
# 同时启动：
T007: index.test.tsx 中菜单开关状态测试
T008: index.test.tsx 中 MenuItem 行为测试
```

### Phase 4/5/6/7 并行（Phase 3 完成后）

```bash
# Phase 3 完成后，同时启动：
T016: US2 分组测试
T023: US3 子菜单测试
T027: US4 单选测试
T034: US5 ContextMenu 测试
# 对应实现任务随后并行推进
```

### Phase 8 并行

```bash
# 同时启动：
T039: prefers-reduced-motion 媒体查询
T040: Storybook 故事
T041: index.ts 导出核查
```

---

## 实现策略

**MVP 范围（Phase 1 + Phase 2 + Phase 3）**：基础菜单触发与列表展示，覆盖核心开关状态、MenuItem 点击回调、disabled 状态、Escape 关闭。此时即可交付可用的最小菜单组件，支持完整键盘访问。

**增量交付顺序**：

1. MVP：Phase 1~3（基础菜单）
2. 增补：Phase 4（分组，与 Phase 5/6/7 并行）
3. 增补：Phase 5（子菜单）
4. 增补：Phase 6（单选/多选）
5. 增补：Phase 7（ContextMenu）
6. 打磨：Phase 8

**任务总数**：44 个任务（T001–T044）

| 阶段                       | 任务数 | 用户故事 |
| -------------------------- | ------ | -------- |
| Phase 1 准备               | 3      | —        |
| Phase 2 基础               | 3      | —        |
| Phase 3 US1（基础菜单）    | 9      | US1      |
| Phase 4 US2（分组分割线）  | 7      | US2      |
| Phase 5 US3（子菜单）      | 4      | US3      |
| Phase 6 US4（单选多选）    | 7      | US4      |
| Phase 7 US5（ContextMenu） | 4      | US5      |
| Phase 8 打磨               | 7      | —        |
| **合计**                   | **44** |          |
