# 数据模型：升级 Storybook 到最新版本

## Storybook 依赖集合

**说明**：为保证内部预览应用稳定运行，所有 Storybook 相关包都必须保持在同一条稳定发布线上。本模型用于描述这些需要统一对齐的依赖项。

**字段**：

- `packageName`：Storybook 相关包名
- `currentRange`：当前在共享依赖目录或应用 manifest 中声明的版本范围
- `targetRange`：升级后计划统一采用的稳定版本范围
- `role`：该依赖承担的角色，例如核心 CLI、框架适配器、addon 或测试支持
- `status`：当前状态，可为 `aligned`、`skewed`、`deprecated`、`removed` 或 `replacement-needed`

**关系**：

- 一个 `Storybook 依赖集合` 条目可以被 `预览应用配置` 消费
- 一个 `Storybook 依赖集合` 条目可能要求更新一个或多个 `Story 编写界面` 条目

**校验规则**：

- 所有仍在使用的 Storybook 依赖必须统一到同一条稳定发布线
- 已废弃或已移除的包必须在升级完成前被替换或明确移除
- 一旦确定目标版本线，不允许保留任何旧的、不兼容的主版本或补丁版本锁定

## 预览应用配置

**说明**：定义内部 Storybook 的配置模型，涵盖 story 发现方式、addons、框架集成、文档行为以及预览级参数。

**字段**：

- `configArea`：配置区域，例如主配置、预览配置或 package 脚本入口
- `ownedBy`：固定为 `apps/storybook`
- `purpose`：配置目的，例如 story 发现、addon 注册、文档命名、背景参数或预览默认值
- `compatibilityState`：兼容状态，可为 `unchanged`、`migrated`、`deprecated-pattern` 或 `blocked`
- `migrationNotes`：面向贡献者的迁移说明，用于解释必须完成的调整

**关系**：

- `预览应用配置` 会引用多个 `Storybook 依赖集合` 条目
- `预览应用配置` 会管理一个或多个 `Story 编写界面` 条目

**校验规则**：

- 所有配置必须在目标 Storybook 版本线上保持有效
- 预览配置必须继续显式导入共享主题 CSS，除非仓库已记录批准的替代方案
- 该应用必须继续作为内部评审界面，而不能演变为唯一的公开文档来源

## Story 编写界面

**说明**：指维护者在 `apps/storybook` 内部审查的单个 story 或 docs 条目。

**字段**：

- `storyPath`：位于 `apps/storybook/src/stories` 下的源文件路径
- `storyTitle`：展示给评审者的导航标题
- `storyType`：条目类型，例如 canvas story、autodocs 条目或交互状态评审
- `featureUsage`：使用到的 Storybook 能力，例如 args、tags、docs、backgrounds、interactions 等
- `migrationRisk`：迁移风险级别，可为 `low`、`medium` 或 `high`

**关系**：

- `Story 编写界面` 通过 `预览应用配置` 被发现和加载
- `Story 编写界面` 会消费 `packages/components` 中的可复用组件

**校验规则**：

- 升级后，代表性的 stories 必须仍然可以被发现
- 现有 stories 使用的交互控件与文档行为必须继续可评审，或被有文档说明的等价方案替代
- story 标题必须继续体现该应用仅用于内部评审的定位

## 升级说明

**说明**：面向维护者的升级摘要，用于记录本次升级范围、已解决的迁移事项，以及延后的后续工作。

**字段**：

- `scope`：本次升级覆盖的变更范围
- `resolvedIssues`：升级过程中已处理的迁移阻塞项或警告
- `knownFollowUps`：尚未阻塞交付、但需要后续处理的整理事项
- `workflowImpact`：对贡献者工作流造成的变化
- `verificationRecord`：用于验证升级结果的命令与人工检查记录

**关系**：

- `升级说明` 用于汇总 `Storybook 依赖集合`、`预览应用配置` 与 `Story 编写界面` 三部分的变化

**校验规则**：

- 升级说明必须清晰区分已经完成的迁移工作与延后处理的事项
- 升级说明必须记录未来组件贡献者需要了解的编写模式变化或依赖变化
