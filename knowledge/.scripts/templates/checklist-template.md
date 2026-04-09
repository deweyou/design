# [检查清单类型] 检查清单：[功能名称]

**目的**： [对该检查清单覆盖内容的简要说明]
**创建时间**： [日期]
**功能**： [指向 spec.md 或相关文档的链接]
**语言要求**：检查项、备注和结论必须使用简体中文；代码标识符、命令、文件路径、
协议字段和第三方 API 名称可保留原文。

**说明**：该检查清单由 `/speckit.checklist` 命令根据功能上下文和需求生成。

<!--
  ============================================================================
  重要：下面的检查项仅为示例，用于说明格式。

  /speckit.checklist 命令必须根据以下内容替换成真实检查项：
  - 用户当前请求的具体检查清单
  - spec.md 中的功能需求
  - plan.md 中的技术上下文
  - tasks.md 中的实现细节

  以下「设计系统数值」和「宪章合规」两个分类是固定分类，每次都必须生成，
  不得省略，具体检查项根据本次变更涉及的组件按需裁剪。
  ============================================================================
-->

## [分类 1：功能需求]

<!--
  根据 spec.md 中的用户故事和验收场景生成，每个 story 至少一条。
-->

- [ ] CHK001 [根据实际功能需求填写]
- [ ] CHK002 [根据实际功能需求填写]

## [分类 2：无障碍与交互]

<!--
  根据 spec.md 的「无障碍与 UI 契约」和 plan.md 的 Ark UI 选型生成。
-->

- [ ] CHK010 键盘导航覆盖：Tab、Enter/Space、Escape、方向键行为符合预期
- [ ] CHK011 焦点管理：打开/关闭时焦点位置正确，无焦点丢失
- [ ] CHK012 ARIA 标签：role、aria-expanded、aria-controls、aria-label 等属性齐全
- [ ] CHK013 屏幕阅读器：状态变化有语义通知
- [ ] CHK014 禁用态：`disabled` 时不可交互，视觉和行为一致

## 设计系统数值（宪章原则 VII — 必检）

<!--
  本分类为固定分类，每次必须生成。按本次变更涉及的属性勾选核查。
  数值均为强制值，不得偏差。
-->

- [ ] CHK020 `disabled` 状态 opacity 为 `0.56`（非 0.3、0.4 等其他值）
- [ ] CHK021 交互元素过渡为 `140ms ease`（background、border-color、color、box-shadow、transform）
- [ ] CHK022 浮层入场动效为 `160ms cubic-bezier(0.22, 1, 0.36, 1)`，出场为 `160ms ease`
- [ ] CHK023 焦点环为 `outline: 2px solid var(--ui-color-focus-ring); outline-offset: 2px`，仅 `:focus-visible` 触发
- [ ] CHK024 hover 背景使用 `color-mix(in srgb, <color> 6–12%, transparent)`，未直接修改背景色
- [ ] CHK025 active 位移为 `translateY(1px)`（非 2px）
- [ ] CHK026 阴影（浮层/卡片）使用 `--ui-shadow-soft`，未使用其他阴影值
- [ ] CHK027 `prefers-reduced-motion`：浮层 transform 归零，link clip-path 过渡禁用
- [ ] CHK028 所有视觉值通过 `--ui-*` token 表达，无硬编码颜色/字号/间距

## 组件变体模型（如本次涉及新组件）

- [ ] CHK030 variant 维度覆盖：filled / outlined / ghost / link（按需取子集，需在 spec 中说明）
- [ ] CHK031 color 维度覆盖：neutral / primary / danger
- [ ] CHK032 size 维度覆盖：extra-small / small / medium / large / extra-large
- [ ] CHK033 shape 维度（仅 filled/outlined）：rect / rounded / pill；ghost/link 不暴露 shape prop

## 宪章合规（必检）

- [ ] CHK040 新增文件和目录使用 kebab-case 命名（宪章原则 VI）
- [ ] CHK041 React 组件使用 `.tsx` 文件，无 `React.createElement` 写法（宪章原则 VI）
- [ ] CHK042 函数使用箭头函数风格；如有例外，变更中已注明原因（宪章原则 VI）
- [ ] CHK043 组件位于 `src/<unit-name>/` 目录下，单测 colocate 为 `index.test.tsx`（宪章原则 VI）
- [ ] CHK044 交互组件基于 Ark UI primitive，未自行实现状态机或焦点管理（宪章原则 I）
- [ ] CHK045 所有样式通过 CSS Modules（Less）+ `--ui-*` token 实现，未引入 Ark UI 默认样式（宪章原则 I）
- [ ] CHK046 公开 API 与 Ark UI 内部接口解耦，未直接透传 Ark UI props（宪章原则 I）
- [ ] CHK047 `vp check` 通过（类型检查 + lint + 格式化）
- [ ] CHK048 `vp test` 通过（受影响 package 单测）
- [ ] CHK049 `website` 中已更新预览，覆盖主要状态和边界状态（宪章原则 IV）

## 备注

- 完成后使用 `[x]` 勾选
- 可直接内联补充评论或发现
- CHK020–CHK028 为设计系统强制数值，发现偏差必须修复后才能合并
- CHK040–CHK049 为宪章合规项，发现违反必须在变更中说明原因或修复
