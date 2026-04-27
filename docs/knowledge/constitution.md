# Deweyou UI 宪章

> Version: 1.3.0 | Created: 2026-03-15 | Last revised: 2026-04-08
>
> 本文件由 `/harness-init` 初始化，并由 `/harness-dev` 的 archive 步骤持续更新。
> CLAUDE.md 引用此文件 — Claude 在每次 harness-dev 工作流开始时读取它。

---

## 核心原则

### I. 包优先的组件架构

所有可复用的 UI 能力都必须先作为 monorepo 中的 package 实现，然后才能被 demo 站点或任何下游应用消费。每个 package 都必须只承担清晰且收敛的职责，暴露明确的公开 API，并避免与 `website` 内部实现形成隐式耦合。共享逻辑、hooks、tokens 和 primitives 必须放在 package 中，不能在各个 app 中重复实现。理由：这个 monorepo 的目标是交付一个可维护的组件库，而不是单独维护一个网站。

**Ark UI 行为基础层**：凡是具有复杂交互行为（浮层定位、焦点管理、状态机、ARIA 输出）的组件，必须优先基于 Ark UI（`@ark-ui/react`）构建，而不是手工实现相同能力。样式层保持使用 CSS Modules（Less）+ 设计 token，不依赖 Ark UI 的默认样式。公开 API 必须与 Ark UI 内部接口解耦。非 click 触发类型应通过受控模式（`open` prop）桥接。参考实现：`packages/react/src/popover/index.tsx`。

### II. 无障碍与 API 一致性

所有公开组件都必须在实现前定义其无障碍契约与交互模型。键盘行为、焦点管理、语义化标记、ARIA 使用、禁用态以及受本地化影响的文本都必须被说明并验证。props、slots、events、variants 以及受控/非受控行为等公开 API，除非有文档化例外并获得批准，否则必须遵循现有命名与组合模式。理由：无障碍和 API 一致性是产品要求，不是最后补上的打磨工作。

### III. Token 与主题作为事实来源

凡是预期会复用的视觉决策，都必须通过共享设计 tokens 与主题 primitives 表达。组件必须消费规范化的 tokens 来处理颜色、排版、间距、圆角、动效和状态样式，而不能直接写死一次性的值。任何新的视觉 primitive 都必须文档化其浅色/深色主题行为、密度影响以及可覆盖边界。`@deweyou-design/styles` 是所有 `--ui-*` 变量的唯一事实来源；组件直接消费这些变量，不得内联 token 值。理由：以 token 驱动的样式系统可以让组件库保持一致、可主题化，并能安全扩展。

### IV. 测试与预览门禁

每一次组件 package 的变更都必须同时附带自动化验证和人工评审面。最低要求是：功能变更必须包含组件逻辑单测、用户可见行为的交互或集成测试，以及 `website` 中覆盖主要状态的预览或 demo 更新。如果某个缺陷首次是在人工 QA 中发现，而它本来可以通过自动化测试提前发现，那么在关闭该问题前必须补充相应测试。理由：对 UI 回归来说，可重复执行的测试加上可视化评审是成本最低的发现方式。

### V. Vite+ Monorepo 与规格文档纪律

所有依赖管理、lint、格式化、测试、打包和构建操作，都必须使用 `vp` 命令或
`vp run` 的任务入口。除非已经文档化工具能力缺口，否则项目工作流和文档中都不允许
直接使用 `pnpm`、`npm`、`yarn`、`npx`、独立 `vite` 或独立 `vitest`。所有
package 都必须能够在 monorepo 的任务图中独立构建和测试。

所有 `packages/` 下拟发布的 package 都必须默认复用 Vite+ 的统一构建约定，而不是
预设保留包级专用构建配置。只有在公开入口、产物结构、资产复制或发布契约等要求无法
通过统一约定满足时，才允许保留 package 级构建配置，并且必须在对应 spec、plan 或
package 文档中说明为什么默认约定不足。理由：Vite+ 的价值之一就是统一构建心智和
降低维护成本，例外必须被显式约束，而不能成为新包的默认起点。

`docs/knowledge/specs/` 目录下由 harness-dev 生成或维护的 `spec.md`、`plan.md`、
`tasks.md`、`research.md`、`data-model.md`、`quickstart.md`、`checklist` 及同类
评审文档，正文必须使用简体中文。代码标识符、命令、文件路径、环境变量、协议字段名、
第三方 API 名称和 semver 版本号可以保留原文。理由：统一工具链与统一文档语言
可以同时减少流程偏差，并确保评审、协作和交接面向当前团队保持一致。

### VI. 仓库编码规范

以下规范适用于 `packages/` 下所有受治理源码单元，违反时必须在变更中说明原因。

**函数风格**：所有函数默认使用箭头函数。仅当框架边界（如 React 的 `forwardRef`
之外的场景）、提升需求或外部 API 约束使函数声明更安全时，才允许使用 `function`
声明，且必须在变更中注明原因。

**React 组件文件**：React 组件必须使用 `.tsx` 文件编写。除非有明确的工具链限制
并已文档化，否则不得引入 `React.createElement` 风格的组件写法。

**文件与目录命名**：受治理区域中新建或重命名的文件和目录必须使用小写字母加连字符
（kebab-case）命名。

**源码单元结构**：`packages/react`、`packages/react-hooks`、`packages/utils` 中，
每个受治理源码单元必须位于 `src/<unit-name>/` 目录下，并将本地入口文件和单测保留
为同目录下的 `index.tsx`（或 `index.ts`）与 `index.test.tsx`（colocate 单测）。

**Commit 格式**：提交信息必须遵循 `<type>(<scope>): <summary>` 格式（scope 有意义时），
或 `<type>: <summary>`。推荐 type：`feat`、`fix`、`refactor`、`docs`、`test`、
`build`、`chore`。subject 使用祈使语气、小写，聚焦单一逻辑变更。格式通过
`.vite-hooks/commit-msg` 强制校验。理由：一致的编码风格和提交格式降低评审认知
负担，并保证 changelog 可读性。

### VII. 设计系统视觉规范

所有组件的视觉与交互实现必须严格对照以下约束，不得随意偏差。评审时以下数值视为
不可谈判（non-negotiable）。详细规范参见 [docs/knowledge/design-style.md](design-style.md)。

**组件变体模型**：交互组件必须基于以下四个正交维度建模：

| 维度    | 可选值                                             | 说明                            |
| ------- | -------------------------------------------------- | ------------------------------- |
| variant | filled / outlined / ghost / link                   | 视觉层级（实心→线框→幽灵→文本） |
| color   | neutral / primary / danger                         | 语义色三档                      |
| size    | extra-small / small / medium / large / extra-large | 尺寸五档                        |
| shape   | rect / rounded / pill                              | 仅 filled/outlined 支持         |

ghost 和 link variant 不支持 shape prop。

**交互状态数值**（以下数值为强制值，常见偏差见括号）：

| 属性        | 强制值                                                               | 常见错误        |
| ----------- | -------------------------------------------------------------------- | --------------- |
| disabled    | `opacity: 0.56`                                                      | 0.3、0.4        |
| 交互过渡    | `140ms ease`                                                         | 200ms、300ms    |
| 浮层动效    | `160ms`（入场 cubic-bezier，出场 ease）                              | 200ms、300ms    |
| 焦点环      | `outline: 2px solid var(--ui-color-focus-ring); outline-offset: 2px` | 1px、3px        |
| hover 混色  | `color-mix(in srgb, <color> 6–12%, transparent)`                     | 直接改背景色    |
| active 位移 | `translateY(1px)`                                                    | translateY(2px) |

**字体族**：Source Han Serif CN Web → Songti SC → STSong → SimSun → NSimSun → serif（body 与 display 同族）。

**圆角档位**：rect（0）/ rounded（0.4rem）/ auto（0.8rem）/ pill（999px）。

**阴影**：浮层与卡片使用 `--ui-shadow-soft`（`0 18px 40px rgba(24, 33, 29, 0.12)`），不得使用其他阴影值。

**焦点**：所有可交互元素仅在 `:focus-visible` 时显示焦点环，不在鼠标点击时触发。

**prefers-reduced-motion**：浮层 transform 归零，link clip-path 过渡禁用。

理由：设计系统数值的一致性直接影响用户体验可信度，任何随意偏差都会破坏整体视觉
语言。将数值入宪可确保 checklist 和 code review 有明确的数值基准。

---

## Package 标准

- 每个可发布的 package 都必须在 README 或 package 级文档中说明其目标使用者、入口点以及 semver 影响面。
- 任何破坏性 API、样式 token 或行为变更，都必须在合并前于相关 spec、plan 或 release note 中附带迁移说明。
- 仅用于演示的代码可以存在于 `website` 中，但它不能成为可复用 package 的组件行为、样式或文档的唯一来源。
- 跨 package 依赖必须从高层组件指向低层 primitives 或 utilities，禁止循环依赖。

---

## 工作流与质量门禁

- 功能 spec 必须明确目标 package、公开 API 变化、无障碍预期、token 或主题影响，以及 demo 覆盖计划。
- `docs/knowledge/specs/` 下新建或更新的评审文档必须默认使用简体中文；如需保留英文，仅限代码标识符、命令、路径和外部协议原文。
- 如果 implementation plan 缺少 package 边界、可访问交互定义、必要测试、`vp` 验证命令，或违反原则 VI（编码规范）、VII（设计数值），那么其 Constitution Check 必须视为失败。
- 任务拆解必须包含 package 侧工作、website 预览更新，以及 `vp check` 加相关 `vp test` 或 `vp run` 命令的验证任务。
- 只有当受影响 package 可以构建、测试通过、预览覆盖已更新、且面向评审者的文档反映了变更时，该变更才算完成。

---

## 治理

本宪章优先于与其冲突的本地实践和模板。任何修订都必须记录在 `docs/knowledge/constitution.md` 中，附带同步影响报告，并在同一变更中同步更新所有受影响的模板或指导文件。

本宪章采用语义化版本控制：MAJOR 用于以不兼容方式移除或重定义原则，MINOR 用于
新增原则或实质性扩大治理范围，PATCH 用于不改变政策含义的措辞澄清。每个 plan 和
pull request 都必须进行合规评审：评审者在批准前必须确认包优先架构、无障碍、
token 使用、测试与预览覆盖、Vite+ 工作流合规性、仓库编码规范（原则 VI）、
设计系统数值合规性（原则 VII），以及 `docs/knowledge/specs/` 下文档语言是否符合简体中文要求。

---

## VIII. Accumulated Learnings

> 各 feature 的完整归档记录见 [docs/knowledge/specs/index.md](specs/index.md)，每个 spec 目录下的 `archive.md` 包含关键决策、踩坑和可复用模式。
> 本节仅保留需要直接影响宪章决策的跨 feature 级别洞察。

<!-- harness-dev archive step appends entries here -->
