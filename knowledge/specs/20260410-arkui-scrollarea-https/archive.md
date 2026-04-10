# Archive: ScrollArea 滚动区域组件

**Branch**: `20260410-arkui-scrollarea-https`
**Completed**: 2026-04-10
**Type**: harness-component

## Delivery Summary

基于 `@ark-ui/react` 实现了 `ScrollArea` 叠层滚动区域组件：自定义滚动条浮于内容上方，不占布局空间；支持 `color`（primary / neutral）、`horizontal`（水平滚动）、`autoHide`（离开区域后延迟隐藏）三个 prop，以及通过 `ref.scrollToEdge` 的程序式控制。组件对消费方价值在于：3 行 JSX 即可获得完整的符合设计规范的滚动体验，无需手写 CSS。

提供了完整的 Storybook stories（7 个 story + Interaction e2e play 函数）、11 个 Vitest 单测、website 预览（6 个区块）。

相对原始 spec：新增 `autoHide` prop（实现过程中用户提出）；移除 `size` 维度（用户判断无价值）；`neutral` 的颜色从 `--ui-color-text` 改为 `currentColor`（适配深色背景容器场景）。**最大执行缺口**：Storybook story 文件在 tasks.md 中未被列为任务项，实现完成后完全缺失，由用户手动指出后补充。

## Key Decisions

| Decision                       | Choice Made                                                                                       | Rationale                                                                                                                                               | Alternatives Considered                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| neutral 颜色实现               | `currentColor`                                                                                    | `--ui-color-text` 在深色背景容器中不可见（浅色主题下均为深色）；`currentColor` 随父容器 `color` 自动适配深浅                                            | `--ui-color-text`（原始方案，深色背景不可见）                            |
| viewport 高度策略              | root 用 `display: grid; grid-template-rows: 1fr`，viewport 不设 `height: 100%`                    | `height: 100%` on viewport 在 root 无显式高度时产生循环依赖坍缩为 0（水平滚动场景失效）；grid 兼顾两种情况                                              | `height: 100%`（垂直可用，水平失效）、绝对定位 viewport（root 同样坍缩） |
| autoHide 实现方式              | 纯 CSS `transition-delay` + `[data-hover]`                                                        | 无需 JS 计时器；`[data-hover]` 由 Ark UI 在 root `pointerenter/leave` 时管理，精确覆盖"是否在区域内"语义；CSS 规范的目标状态 delay 机制天然实现延迟淡出 | JS `setTimeout` + scroll/pointer 事件（有 timer 管理成本）               |
| hover 轨道 vs hover 内容的区分 | CSS `:hover` on `.scrollbar`（精确轨道）vs `[data-hover]`（整个 root）分别用于不同目的            | Ark UI `[data-hover]` 在鼠标进入 root 内任何位置就为 true，内容区 hover 也会触发；只有 CSS `:hover` on 滚动条 element 才能精确区分                      | 仅用 `[data-hover]`（内容区 hover 也触发全色，体验错误）                 |
| autoHide CSS 覆盖结构          | 基础规则保持"overflow→0.4"不变，autoHide 用更高优先级 `.root[data-auto-hide] .scrollbar` 规则覆盖 | 复用同套 opacity 三档逻辑，差异最小化；高优先级后代选择器天然覆盖，无需 `!important`                                                                    | 为两种模式写完全独立的 CSS 规则（重复度高）                              |

## Pitfalls

**`flex: 1` on thumb 与 Ark UI inline `height: var(--thumb-height)` 冲突**

- **What happened**: 滚动条轨道出现但 thumb 不可见。Storybook 内容可滚动，但滚动条无视觉输出。
- **Why non-obvious**: Ark UI 通过两个独立机制控制 thumb：(1) `height: var(--thumb-height)` inline style 设置尺寸，(2) JS `transform: translate3d(0, offset, 0)` 在 scroll 事件中更新位置。`flex: 1` 在 flex column 容器中撑满整个 scrollbar 高度，覆盖了 inline `height`，导致 thumb 填满轨道后被 transform 推出可视范围。
- **How resolved**: 移除 `flex: 1`；按 `[data-orientation]` 设置截面尺寸：垂直 thumb 用 `width: 100%`，水平 thumb 用 `height: 100%`；长度和位置完全交由 Ark UI 管理。
- **Signal to watch for**: 内容可滚动，轨道宽度/高度正确存在，但就是看不到 thumb。

**`height: 100%` on viewport 在无显式高度的 root 内坍缩为 0**

- **What happened**: 水平滚动 story 中 ScrollArea 内容区完全消失（白色空盒），内容文字不可见。
- **Why non-obvious**: `height: 100%` 造成循环依赖：root 高度由 viewport 决定，viewport 高度是 root 的 100%，浏览器解析为 0。`overflow: hidden` on root 进一步阻止了内容撑开 root 高度。垂直滚动因为有显式 `height: 160px` 不受影响，所以在垂直场景中测试通过后没有发现此问题。
- **How resolved**: root 改为 `display: grid; grid-template-rows: 1fr`，移除 viewport 的 `height: 100%`。有显式高度时 `1fr` = 固定高度；无显式高度时 `1fr` 退化为 auto。
- **Signal to watch for**: ScrollArea 显示为白色空盒，devtools 检查 viewport 高度为 0px。

**`[data-hover]` 覆盖整个 root，内容区 hover 也触发"悬浮在滚动条"效果**

- **What happened**: 鼠标移入内容文字区域时，滚动条就变成 opacity 1 全色，与"hover 到轨道才全色"的设计意图不符。
- **Why non-obvious**: Ark UI `[data-hover]` 在 root 的 `onPointerEnter/onPointerMove` 上触发，只要鼠标在 root 内任意位置即为 true。文档未明确标注这一行为范围。
- **How resolved**: 改用 CSS `:hover` 伪类直接作用于 `.scrollbar` element，精确检测鼠标是否在轨道上；`[data-hover]` 仅用于 autoHide 的"是否在整个区域内"语义。
- **Signal to watch for**: 内容文字区 hover 和滚动条 hover 产生完全相同的视觉变化。

**Storybook story 文件在 tasks.md 模板中系统性缺失**

- **What happened**: 组件 packages 实现和 website 预览全部完成后，Storybook 没有对应 story 文件，由用户手动指出后才补充，损失了流程完整性。
- **Why non-obvious**: tasks.md 模板只覆盖 packages 实现 + website 预览两层，Storybook 不在默认任务结构中。`apps/storybook/CLAUDE.md` 只规范了"改 story 时同步 Interaction"，没有规定"新增组件必须创建 story 文件"。
- **How resolved**: 本次补充后，需要在宪章和任务模板中固化此要求（见 Constitution Feedback）。
- **Signal to watch for**: AI 完成"Phase 3-6"后未在 `apps/storybook/src/stories/` 下创建任何文件。

## Reusable Patterns

**CSS `transition-delay` 实现 auto-hide 行为（无 JS 计时器）**

要实现"N 秒无交互后自动隐藏元素"，用 CSS `transition-delay` 配合 data attribute：

1. 离开（要隐藏）：目标状态设 `transition: opacity 140ms ease 1500ms`——延迟 1500ms 再淡出
2. 进入（要显示）：目标状态设 `transition: opacity 140ms ease 0ms`——立即响应
3. 关键原理：CSS 规范规定过渡使用**目标状态**的 `transition` 值，所以进入立即、离开延迟，自然实现 auto-hide。

```less
.element[data-visible] {
  opacity: 1;
  transition: opacity 140ms ease 0ms; // 立即显示
}
.element:not([data-visible]) {
  opacity: 0;
  transition: opacity 140ms ease 1500ms; // 延迟 1500ms 淡出
}
```

适用于：tooltip auto-hide、overlay scrollbar、toolbar auto-collapse 等任何"闲置后隐藏"的 UI 元素。

**`display: grid; grid-template-rows: 1fr` 实现自适应 fill**

父容器可能有也可能没有显式高度时，让子元素既能填满（有高度），又能随内容撑开（无高度）：

```less
.root {
  display: grid;
  grid-template-rows: 1fr; // 有高度 → 1fr = 固定高度；无高度 → 1fr 退化 auto
}
.child {
  min-height: 0; // 防止 grid item 超出容器
}
```

适用于：ScrollArea、Dialog body、任何"wrapper 高度不确定"的容器组件。

**高优先级后代选择器实现 prop-controlled 样式覆盖**

要为同一组件实现"默认行为 A，特定 prop 时覆盖为行为 B"，用后代选择器天然生成更高优先级：

```less
.scrollbar[data-overflow-y] {
  opacity: 0.4;
} // 基础，优先级低
.root[data-auto-hide] .scrollbar[data-overflow-y]:not([data-hover]) {
  opacity: 0; // 覆盖，优先级高（额外 .root 选择器 + :not 伪类）
}
```

无需 `!important`，源码层面语义清晰。适用于任何"opt-in 模式"的 CSS 覆盖。

## Constitution Feedback

**缺口——Storybook story 文件不在交付检查清单中**

宪章原则 IV（测试与预览门禁）要求"自动化验证和人工评审面"，但只提到 `website` 预览，未明确 Storybook。`apps/storybook/CLAUDE.md` 只规范了"改 story 时同步维护 Interaction"，未涵盖"新增组件必须建 story 文件"。

建议在宪章原则 IV 追加：

> 新增组件时，`apps/storybook/src/stories/` 下必须同步创建对应的 `*.stories.tsx` 文件，包含覆盖所有 props 变体的展示 stories 以及带 `play` 函数的 `Interaction` story。Storybook story 文件与 `website` 预览同属"人工评审面"的必要组成部分，不可省略。

**缺口——tasks.md 模板未强制包含 Storybook 任务项**

tasks.md 模板的 Phase 结构只有 packages 实现和 website 预览，Storybook 不在默认任务列表中，导致 AI 系统性遗漏。

建议在任务模板的 Phase（打磨或交付）中加入强制任务项：

- `T_SBn`：在 `apps/storybook/src/stories/` 下创建 `<ComponentName>.stories.tsx`，覆盖所有 props 变体（各状态一个 story）
- `T_SBn+1`：补充 `Interaction` story，带 `play` 函数，按 testing-standards.md E2E 规范覆盖核心行为断言

## Next Steps

- 考虑将 `autoHide` 的延迟时长（当前硬编码 1500ms）暴露为 CSS 自定义属性，供消费方覆盖
- 嵌套 ScrollArea 的事件穿透行为尚未验证
- `scrollToEdge` 目前无动画参数；Ark UI 原生支持 `behavior: 'smooth'`，可按需暴露
