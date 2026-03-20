<!--
同步影响报告
- 版本变更：1.0.0 -> 1.1.0
- 修改的原则：
  - V. Vite+ Monorepo 纪律 -> V. Vite+ Monorepo 与规格文档纪律
- 新增章节：
  - 无
- 移除章节：
  - 无
- 需要同步更新的模板：
  - ✅ 已更新 .specify/templates/plan-template.md
  - ✅ 已更新 .specify/templates/spec-template.md
  - ✅ 已更新 .specify/templates/tasks-template.md
  - ✅ 已更新 .specify/templates/checklist-template.md
  - ✅ 已更新 README.md
  - ✅ 已更新 AGENTS.md
  - ⚠ 待处理 .specify/templates/commands/*.md（目录不存在，无需更新）
- 后续 TODO：
  - 无
-->

# Deweyou UI 宪章

## 核心原则

### I. 包优先的组件架构

所有可复用的 UI 能力都必须先作为 monorepo 中的 package 实现，然后才能被 demo 站点或任何下游应用消费。每个 package 都必须只承担清晰且收敛的职责，暴露明确的公开 API，并避免与 `website` 内部实现形成隐式耦合。共享逻辑、hooks、tokens 和 primitives 必须放在 package 中，不能在各个 app 中重复实现。理由：这个 monorepo 的目标是交付一个可维护的组件库，而不是单独维护一个网站。

### II. 无障碍与 API 一致性

所有公开组件都必须在实现前定义其无障碍契约与交互模型。键盘行为、焦点管理、语义化标记、ARIA 使用、禁用态以及受本地化影响的文本都必须被说明并验证。props、slots、events、variants 以及受控/非受控行为等公开 API，除非有文档化例外并获得批准，否则必须遵循现有命名与组合模式。理由：无障碍和 API 一致性是产品要求，不是最后补上的打磨工作。

### III. Token 与主题作为事实来源

凡是预期会复用的视觉决策，都必须通过共享设计 tokens 与主题 primitives 表达。组件必须消费规范化的 tokens 来处理颜色、排版、间距、圆角、动效和状态样式，而不能直接写死一次性的值。任何新的视觉 primitive 都必须文档化其浅色/深色主题行为、密度影响以及可覆盖边界。理由：以 token 驱动的样式系统可以让组件库保持一致、可主题化，并能安全扩展。

### IV. 测试与预览门禁

每一次组件 package 的变更都必须同时附带自动化验证和人工评审面。最低要求是：功能变更必须包含组件逻辑单测、用户可见行为的交互或集成测试，以及 `website` 中覆盖主要状态的预览或 demo 更新。如果某个缺陷首次是在人工 QA 中发现，而它本来可以通过自动化测试提前发现，那么在关闭该问题前必须补充相应测试。理由：对 UI 回归来说，可重复执行的测试加上可视化评审是成本最低的发现方式。

### V. Vite+ Monorepo 与规格文档纪律

所有依赖管理、lint、格式化、测试、打包和构建操作，都必须使用 `vp` 命令或
`vp run` 的任务入口。除非已经文档化工具能力缺口，否则项目工作流和文档中都不允许
直接使用 `pnpm`、`npm`、`yarn`、`npx`、独立 `vite` 或独立 `vitest`。所有
package 都必须能够在 monorepo 的任务图中独立构建和测试。

`/specs/` 目录下由 Speckit 生成或维护的 `spec.md`、`plan.md`、`tasks.md`、
`research.md`、`data-model.md`、`quickstart.md`、`checklist` 及同类评审文档，
正文必须使用简体中文。代码标识符、命令、文件路径、环境变量、协议字段名、
第三方 API 名称和 semver 版本号可以保留原文。理由：统一工具链与统一文档语言
可以同时减少流程偏差，并确保评审、协作和交接面向当前团队保持一致。

## Package 标准

- 每个可发布的 package 都必须在 README 或 package 级文档中说明其目标使用者、入口点以及 semver 影响面。
- 任何破坏性 API、样式 token 或行为变更，都必须在合并前于相关 spec、plan 或 release note 中附带迁移说明。
- 仅用于演示的代码可以存在于 `website` 中，但它不能成为可复用 package 的组件行为、样式或文档的唯一来源。
- 跨 package 依赖必须从高层组件指向低层 primitives 或 utilities，禁止循环依赖。

## 工作流与质量门禁

- 功能 spec 必须明确目标 package、公开 API 变化、无障碍预期、token 或主题影响，以及 demo 覆盖计划。
- `/specs/` 下新建或更新的评审文档必须默认使用简体中文；如需保留英文，仅限代码标识符、命令、路径和外部协议原文。
- 如果 implementation plan 缺少 package 边界、可访问交互定义、必要测试或 `vp` 验证命令，那么其 Constitution Check 必须视为失败。
- 任务拆解必须包含 package 侧工作、website 预览更新，以及 `vp check` 加相关 `vp test` 或 `vp run` 命令的验证任务。
- 只有当受影响 package 可以构建、测试通过、预览覆盖已更新、且面向评审者的文档反映了变更时，该变更才算完成。

## 治理

本宪章优先于与其冲突的本地实践和模板。任何修订都必须记录在 `.specify/memory/constitution.md` 中，附带同步影响报告，并在同一变更中同步更新所有受影响的模板或指导文件。

本宪章采用语义化版本控制：MAJOR 用于以不兼容方式移除或重定义原则，MINOR 用于
新增原则或实质性扩大治理范围，PATCH 用于不改变政策含义的措辞澄清。每个 plan 和
pull request 都必须进行合规评审：评审者在批准前必须确认包优先架构、无障碍、
token 使用、测试与预览覆盖、Vite+ 工作流合规性，以及 `/specs/` 下文档语言是否
符合简体中文要求。

**版本**： 1.1.0 | **批准日期**： 2026-03-15 | **最后修订**： 2026-03-20
