# 任务：Tabs 组件

**输入**：来自 `/specs/20260331-tabs-component/` 的设计文档  
**前置条件**：plan.md（必需）、spec.md（用户故事必需）、research.md、data-model.md、contracts/  
**语言要求**：任务名称、描述、目标、测试说明、检查点与收尾说明必须使用简体中文；代码标识符、命令、文件路径、协议字段和第三方 API 名称可保留原文。

**测试**：根据宪章，组件逻辑与用户可见行为必须有测试。生成的任务包含自动化测试与预览更新。

**组织方式**：任务按用户故事分组，以便每个故事都能独立实现与测试。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可并行执行（文件不同、无依赖）
- **[Story]**：该任务所属的用户故事（US1～US5）
- 描述中必须包含准确文件路径

---

## Phase 1：准备（共享基础设施）

**目的**：创建组件目录结构，建立开发基线

- [x] T001 创建 `packages/components/src/tabs/` 目录，新建空文件 `index.tsx`、`index.module.less`、`index.test.tsx`（遵循 colocate 规范）
- [x] T002 [P] 在 `apps/website/src/` 中确认预览页面路由路径，新建 `pages/tabs/index.tsx` 预览外壳（仅导出空页面，后续各阶段填充）

---

## Phase 2：基础阶段（阻塞性前置条件）

**目的**：建立所有用户故事共用的 TypeScript 类型定义、CSS token 变量基础和导出入口

**⚠️ 关键**：在本阶段完成前，任何用户故事都不能开始

- [x] T003 在 `packages/components/src/tabs/index.tsx` 中定义并导出全部公开 TypeScript 类型（`TabsVariant`、`TabsColor`、`TabsSize`、`TabsOrientation`、`TabsActivationMode`、`TabsOverflowMode`、`TabMenuItemDef`、`TabsValueChangeDetails`、`TabsFocusChangeDetails`、`TabsProps`、`TabListProps`、`TabTriggerProps`、`TabContentProps`、`TabIndicatorProps`），仅导出类型，暂不实现组件逻辑
- [x] T004 [P] 在 `packages/components/src/tabs/index.module.less` 中定义组件级 CSS 自定义属性基础层（`--tabs-tab-gap: 4px`、`--tabs-indicator-thickness: 2px`、`--tabs-overflow-fade-width: 40px`）及复用语义色 token（`--ui-color-brand-bg`、`--ui-color-text`、`--ui-color-border`、`--ui-color-focus-ring`、`--ui-color-surface`）
- [x] T005 [P] 在 `packages/components/src/index.ts` 中新增 tabs 导出占位（导出所有类型；组件导出等 T010 实现后补全）

**检查点**：本阶段完成后，类型可在 IDE 中正常推断，`vp check` 类型检查通过

---

## Phase 3：用户故事 1 - 基础标签页切换（优先级：P1）🎯 MVP

**目标**：实现横排/竖排 Tabs 的核心切换功能，支持 `line`（滑动指示器）和 `bg`（背景高亮）两种视觉变体，以及 hover 背景反馈；受控/非受控均支持；三档尺寸；`primary` 语义色。

**独立测试**：在 website 预览页中渲染横排和竖排两组 Tabs，分别点击各 tab 验证内容切换与指示器动画；切换到 `bg` 变体验证背景高亮；`vp test` 通过。

### 用户故事 1 的测试 ⚠️

- [x] T006 [P] [US1] 在 `packages/components/src/tabs/index.test.tsx` 中编写单测：渲染横排/竖排 Tabs，验证 `defaultValue` 默认激活正确、点击 tab 后 `onValueChange` 触发且参数正确、禁用 tab 点击无响应
- [x] T007 [P] [US1] 在 `packages/components/src/tabs/index.test.tsx` 中编写单测：验证 `variant="line"` 时 `TabIndicator` 节点存在、`variant="bg"` 时不渲染 `TabIndicator`；验证 `data-selected` 属性随切换正确更新

### 用户故事 1 的实现

- [x] T008 [US1] 在 `packages/components/src/tabs/index.tsx` 中实现 `Tabs` 根组件（接入 Ark UI `Tabs.Root`，处理受控/非受控、`orientation`、`activationMode`、`loopFocus`、`lazyMount`、`unmountOnExit`、`color`、`variant`、`size` props；通过 `data-*` 属性下传给 CSS）
- [x] T009 [US1] 在 `packages/components/src/tabs/index.tsx` 中实现 `TabList`（接入 `Tabs.List`）、`TabTrigger`（接入 `Tabs.Trigger`，处理 `disabled`）、`TabContent`（接入 `Tabs.Content`）、`TabIndicator`（接入 `Tabs.Indicator`，`line` 变体下 `TabList` 内部自动渲染）
- [x] T010 [P] [US1] 在 `packages/components/src/tabs/index.module.less` 中实现 `line` 变体指示器动画样式：横排时 `TabIndicator` 定位到 `TabList` 底部，`transition: left 160ms cubic-bezier(0.22,1,0.36,1), width 160ms`；竖排时定位到左侧，`transition: top/height`；`prefers-reduced-motion` 时 `transition: none`
- [x] T011 [P] [US1] 在 `packages/components/src/tabs/index.module.less` 中实现 `bg` 变体样式（激活 tab 使用 `color-mix` 背景高亮，无指示器线条）及所有 tab 的 hover 背景反馈（`color-mix(in srgb, currentColor 8%, transparent)`）
- [x] T012 [P] [US1] 在 `packages/components/src/tabs/index.module.less` 中实现三档尺寸（`small`/`medium`/`large`）对应的字号、内边距、行高，以及 `neutral`/`primary` 语义色对应的指示器颜色和激活文字颜色
- [x] T013 [US1] 在 `packages/components/src/tabs/index.module.less` 中完善竖排模式布局（`flex-direction: column` 的 TabList；TabList 与 TabContent 的并排布局；左侧竖线指示器与圆角）
- [x] T014 [US1] 在 `packages/components/src/tabs/index.module.less` 中实现 focus-visible 焦点环（`outline: 2px solid var(--ui-color-focus-ring); outline-offset: 2px`）和禁用 tab 样式（`opacity: 0.56; cursor: not-allowed`）
- [x] T015 [US1] 在 `apps/website/src/pages/tabs/index.tsx` 中添加 US1 预览场景：横排基础（line 变体）、竖排基础（line 变体）、bg 变体、primary 色、三档尺寸对比、含禁用 tab

**检查点**：此时基础 Tabs 切换功能完整可用，指示器动画流畅，`vp test` 中 T006/T007 通过

---

## Phase 4：用户故事 2 - 仅标签栏模式（优先级：P1）

**目标**：支持 `hideContent` prop，关闭内容面板区域，适配路由驱动导航场景；`onValueChange` 回调和指示器动画仍正常工作。

**独立测试**：在 website 中渲染 `hideContent` 模式，确认 DOM 中无 `TabContent` 节点，切换 tab 触发 `onValueChange`，`vp test` 中 T016 通过。

### 用户故事 2 的测试 ⚠️

- [x] T016 [P] [US2] 在 `packages/components/src/tabs/index.test.tsx` 中编写单测：`hideContent=true` 时 DOM 中不存在 `role="tabpanel"` 节点；`onValueChange` 在 `hideContent` 模式下切换 tab 时仍正确触发

### 用户故事 2 的实现

- [x] T017 [US2] 在 `packages/components/src/tabs/index.tsx` 中为 `Tabs` 根组件增加 `hideContent` prop，通过 React context 下传；`TabContent` 组件读取 context，`hideContent=true` 时返回 `null`（不渲染面板）
- [x] T018 [US2] 在 `apps/website/src/pages/tabs/index.tsx` 中添加 US2 预览场景：仅标签栏模式（横排、竖排各一组）

**检查点**：此时 `hideContent` 功能完整，与 US1 基础切换功能共存无冲突

---

## Phase 5：用户故事 3 - Tab 下拉菜单（优先级：P2）

**目标**：`TabTrigger` 支持 `menuItems` prop，配置后渲染为 Menu 触发器；横排向下弹出，竖排向右弹出；选中子项后激活对应 TabContent；菜单 tab 带正确 ARIA 属性。

**独立测试**：在 website 中渲染含 `menuItems` 的 tab，点击后菜单正确方向弹出；从菜单选项中选择一项后对应内容激活；`vp test` 中 T019 通过。

### 用户故事 3 的测试 ⚠️

- [x] T019 [P] [US3] 在 `packages/components/src/tabs/index.test.tsx` 中编写单测：带 `menuItems` 的 `TabTrigger` 渲染后存在 `aria-haspopup="menu"` 属性；点击菜单项后 `onValueChange` 以对应 `value` 触发；菜单触发器禁用时菜单无法打开

### 用户故事 3 的实现

- [x] T020 [US3] 在 `packages/components/src/tabs/index.tsx` 中实现 Menu Tab 逻辑：`TabTrigger` 检测到 `menuItems` 时，使用现有 `Menu` 组件（`packages/components/src/menu`）包裹触发器，通过受控 `open` prop 管理菜单状态；选项选中后调用 `onValueChange`；Menu 的 `placement` 根据 `orientation` 自动选择（横排 `bottom-start`，竖排 `right-start`）
- [x] T021 [US3] 在 `packages/components/src/tabs/index.module.less` 中为 Menu Tab 触发器添加样式：箭头图标旋转指示、菜单打开时激活态视觉、`data-has-menu="true"` 样式钩子
- [x] T022 [US3] 在 `apps/website/src/pages/tabs/index.tsx` 中添加 US3 预览场景：横排含 Menu Tab（多个子选项）、竖排含 Menu Tab

**检查点**：此时 Menu Tab 功能完整，与 US1 切换和 US2 仅标签栏模式均可共存

---

## Phase 6：用户故事 4 - 标签栏超长滚动模式（优先级：P2）

**目标**：tab 数量超出容器宽度时，`TabList` 支持横向滚动；左右边缘展示渐变遮罩，到达边缘时对应侧渐变消失；切换到不可见 tab 时自动滚动使其可见。

**独立测试**：在 website 中渲染 20 个 tab 的横排 Tabs，验证渐变遮罩出现/消失逻辑，滚动到边缘渐变正确关闭；`vp test` 中 T023 通过。

### 用户故事 4 的测试 ⚠️

- [x] T023 [P] [US4] 在 `packages/components/src/tabs/index.test.tsx` 中编写单测：模拟 scrollLeft=0 时 `data-scroll-at-start="true"`；模拟 scrollLeft=scrollWidth-clientWidth 时 `data-scroll-at-end="true"`；验证 `onValueChange` 触发后 `scrollIntoView` 被调用

### 用户故事 4 的实现

- [x] T024 [US4] 在 `packages/components/src/tabs/index.tsx` 中为 `TabList` 包裹 scroll wrapper：`useRef` 引用滚动容器，`onScroll` 事件更新 `data-scroll-at-start` 和 `data-scroll-at-end` 属性；初次渲染时执行一次检测
- [x] T025 [US4] 在 `packages/components/src/tabs/index.tsx` 中实现激活 tab 自动滚动：在 `Tabs.Root` `onValueChange` 触发时，查找对应 `TabTrigger` DOM 节点并调用 `scrollIntoView({ block: 'nearest', inline: 'nearest' })`
- [x] T026 [P] [US4] 在 `packages/components/src/tabs/index.module.less` 中实现 scroll 模式的 `mask-image` 渐变遮罩 CSS（四种状态：两端均有渐变、仅左渐变、仅右渐变、无渐变）；`overflow-x: auto; scrollbar-width: none`（隐藏滚动条）
- [x] T027 [US4] 在 `apps/website/src/pages/tabs/index.tsx` 中添加 US4 预览场景：横排 20 个 tab（scroll 模式）、竖排 20 个 tab（scroll 模式，纵向渐变）

**检查点**：此时超长滚动功能完整，渐变遮罩行为正确，`vp test` 中 T023 通过

---

## Phase 7：用户故事 5 - 标签栏超长收齐模式（优先级：P3）

**目标**：`overflowMode="collapse"` 时，超出容器的 tab 收入末尾"更多"下拉菜单；当前激活 tab 在溢出列表中时"更多"按钮呈激活视觉；从"更多"菜单选择可正常激活对应 tab。

**独立测试**：在 website 中渲染 collapse 模式 20 个 tab，验证"更多"按钮出现、菜单列出溢出 tab，从中选择后内容激活；`vp test` 中 T028 通过。

### 用户故事 5 的测试 ⚠️

- [x] T028 [P] [US5] 在 `packages/components/src/tabs/index.test.tsx` 中编写单测：mock `ResizeObserver`，模拟容器宽度小于 tab 总宽度时"更多"按钮出现；从溢出菜单点击一项后 `onValueChange` 以正确 value 触发；激活 tab 在溢出列表中时"更多"按钮带 `data-has-active-overflow="true"` 属性

### 用户故事 5 的实现

- [x] T029 [US5] 在 `packages/components/src/tabs/index.tsx` 中实现 collapse 模式的 `ResizeObserver` 溢出检测逻辑：观察 TabList 容器宽度，累加各 tab 自然宽度，动态计算 `visibleTabs` 和 `overflowTabs` 数组；预留"更多"按钮的宽度（约 60px）
- [x] T030 [US5] 在 `packages/components/src/tabs/index.tsx` 中实现"更多"溢出菜单：使用现有 `Menu` 组件（`packages/components/src/menu`）渲染溢出 tab 列表；选中后触发 `onValueChange`；激活 tab 在溢出列表中时为"更多"按钮添加 `data-has-active-overflow="true"`
- [x] T031 [P] [US5] 在 `packages/components/src/tabs/index.module.less` 中实现"更多"按钮样式：与普通 tab 等高、匹配尺寸档位；`data-has-active-overflow="true"` 时呈激活视觉（颜色与 active tab 一致）
- [x] T032 [US5] 在 `apps/website/src/pages/tabs/index.tsx` 中添加 US5 预览场景：collapse 模式 20 个 tab（横排）、激活 tab 在溢出区域时的视觉状态

**检查点**：此时所有 5 个用户故事均可独立运行并测试

---

## Phase 8：打磨与横切关注点

**目的**：补充边界测试、完善无障碍、确保全量验证通过

- [x] T033 [P] 在 `packages/components/src/tabs/index.test.tsx` 中补充边界状态测试：单 tab 时指示器固定不动画；快速连续切换多个 tab 时指示器最终停在最后激活位置；`activationMode="manual"` 时焦点移动不自动激活，按 Enter 后才激活
- [ ] T034 [P] 在 `packages/components/src/tabs/index.test.tsx` 中补充键盘导航测试：`ArrowRight`/`ArrowLeft` 在横排模式切换焦点；`Home`/`End` 跳到首尾 tab；`Tab` 键将焦点移入激活 TabContent；`loopFocus=true` 时末尾 tab 按 `ArrowRight` 回到第一个
- [x] T035 [P] 在 `packages/components/src/tabs/index.module.less` 中补充 `prefers-reduced-motion` 媒体查询覆盖：指示器 `transition: none`；确认 hover/active 等非动画交互不受影响
- [x] T036 在 `packages/components/src/index.ts` 中确认所有组件（`Tabs`、`TabList`、`TabTrigger`、`TabContent`、`TabIndicator`）及全部 TypeScript 类型已正确导出
- [x] T037 [P] 在 `apps/website/src/pages/tabs/index.tsx` 中补充边界状态预览：仅单个 tab、含禁用 tab（禁用 tab 为首/中/末）、manual 激活模式说明
- [x] T038 运行 `vp check`（类型检查 + lint + 格式化），修复所有报错，确认零错误零警告
- [x] T039 运行 `vp test` 确认全量测试通过（T006～T028 全部绿色）；运行 `vp run website#dev` 人工验证所有预览场景正常渲染

---

## 依赖与执行顺序

### 阶段依赖

- **Phase 1（准备）**：无依赖，可立即开始
- **Phase 2（基础）**：依赖 Phase 1 完成；**阻塞所有用户故事**
- **Phase 3（US1）**：依赖 Phase 2 完成；是所有后续 Phase 的视觉基础
- **Phase 4（US2）**：依赖 Phase 2 完成；与 Phase 3 无强依赖，可并行
- **Phase 5（US3）**：依赖 Phase 2 完成；需引用现有 `Menu` 组件，与 Phase 3/4 可并行
- **Phase 6（US4）**：依赖 Phase 3 完成（scroll wrapper 扩展 TabList）
- **Phase 7（US5）**：依赖 Phase 3 完成（collapse 扩展 TabList）；与 Phase 6 可并行
- **Phase 8（打磨）**：依赖所有用户故事 Phase 完成

### 用户故事依赖

- **US1（P1）**：基础阶段完成后可开始，无其他依赖
- **US2（P1）**：基础阶段完成后可开始；与 US1 可并行（操作不同 prop）
- **US3（P2）**：基础阶段完成后可开始；与 US1/US2 可并行
- **US4（P2）**：依赖 US1 的 `TabList` 基础实现完成后开始
- **US5（P3）**：依赖 US1 的 `TabList` 基础实现完成后开始；与 US4 可并行

### 每个用户故事内部顺序

1. 测试任务先行（TDD），确保在实现前运行失败
2. TypeScript 实现（`index.tsx`）先于样式（`index.module.less`）
3. 组件 package 实现先于 website 预览
4. 本故事完成后再进入下一优先级

---

## 并行机会

### Phase 2 内部并行

```bash
# 同时执行（不同文件，无依赖）：
Task: T003 "在 index.tsx 中定义 TypeScript 类型"
Task: T004 "在 index.module.less 中定义 CSS token 变量基础"
Task: T005 "在 index.ts 中新增 tabs 导出占位"
```

### US1 内部并行

```bash
# 测试并行：
Task: T006 "编写切换逻辑单测"
Task: T007 "编写 variant 渲染单测"

# 样式并行（均操作 index.module.less 不同选择器）：
Task: T010 "line 变体指示器动画"
Task: T011 "bg 变体与 hover 样式"
Task: T012 "尺寸与语义色变体"
```

### US4/US5 并行

```bash
# Phase 6 和 Phase 7 可并行（操作不同的 overflowMode 分支）：
Task: T024 "scroll 模式 onScroll 检测"  ←→  Task: T029 "collapse 模式 ResizeObserver"
Task: T025 "scroll 自动滚动"            ←→  Task: T030 "collapse 更多菜单"
Task: T026 "scroll mask-image 样式"     ←→  Task: T031 "collapse 更多按钮样式"
```

---

## 实施策略（MVP 优先）

1. **MVP（Phase 1–3）**：完成基础切换功能（US1）即可交付可用的 Tabs 组件，适合优先集成验证
2. **P1 完整（Phase 1–4）**：加入仅标签栏模式（US2），满足路由导航场景
3. **P2 完整（Phase 1–6）**：加入 Menu Tab（US3）和超长滚动（US4）
4. **完整交付（Phase 1–8）**：全功能含收齐模式（US5）和打磨

**建议优先级**：Phase 1 → Phase 2 → Phase 3（US1）→ Phase 4（US2）→ Phase 5/6（US3/US4 并行）→ Phase 7（US5）→ Phase 8（打磨）
