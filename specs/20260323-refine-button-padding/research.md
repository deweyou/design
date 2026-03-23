# 研究：优化 Button 间距平衡

## 决策 1：用显式 `icon` 入口取代 icon-only 内容推断

- **决策**：`Button` 新增 `icon` prop，图标按钮模式只通过显式 `icon` 能力进入，不再依赖对任意 `children` 结构的猜测。
- **理由**：当前实现通过可见内容推断 `data-icon-only`，这会把“内容结构”误当成“交互模式”，既不稳定，也会让纯文本按钮被 icon-only 的方形约束反向影响。显式 `icon` 入口能让模式切换变成公开、可测试、可文档化的行为。
- **备选方案**：
  - 继续根据 `children` 推断 icon-only：拒绝，原因是启发式判断不稳定，且与用户明确提出的“不要太 hack”相冲突。
  - 新增 `variant="icon"`：拒绝，原因是图标按钮是内容/布局模式，不是视觉 `variant`。

## 决策 2：同时提供 `IconButton` 和 `Button.Icon`

- **决策**：保留 `IconButton` 作为主导出，同时让 `Button.Icon` 指向同一个组件；并同步导出 `IconButtonProps`。
- **理由**：`IconButton` 适合作为文档、类型和迁移说明里的主名词，`Button.Icon` 则提升使用者在主组件入口上的发现性。两者并存能减少 API 争议，同时通过同一能力契约避免重复实现。
- **备选方案**：
  - 只导出 `IconButton`：可行，但入口发现性较弱。
  - 只提供 `Button.Icon`：拒绝，原因是会把 API 叙事完全推向 compound component 形式，且不利于单独的 props 类型导出。
  - 只依赖 `Button` 的 `icon` + 空内容：拒绝，原因是缺少专门语义名词，不利于文档与迁移。

## 决策 3：旧的 icon-only children 方形行为视为 breaking 迁移项

- **决策**：`<Button aria-label="..."><SearchIcon /></Button>` 这类旧写法不再作为标准方式请求方形 icon button；标准入口改为 `Button` 的 `icon` prop、`IconButton` 或 `Button.Icon`，并在 README 中记录迁移说明。
- **理由**：一旦继续保留旧的隐式平方模式，内部实现仍然要依赖 children 结构猜测，和本次重构目标相冲突。把它视为 breaking 迁移项，才能真正清理旧约束。
- **备选方案**：
  - 保留旧推断并标记弃用：拒绝，原因是会长期保留双轨逻辑。
  - 无迁移说明直接切换：拒绝，原因是现有 README 和 website 已把 icon-only Button 作为普通 `Button` 示例，会造成消费方困惑。

## 决策 4：密度模式按显式入口分成内容按钮与方形图标按钮

- **决策**：纯文本 Button 与带 `icon` 的文本 Button 共用内容型密度；`IconButton` 使用独立的方形密度和稳定点击目标。
- **理由**：导致当前视觉问题的根因是所有按钮都在为 icon-only 的正方形目标让路。将 icon-only 单独建模后，文本按钮可以恢复更自然的 block/inline 留白，而不必牺牲图标按钮的一致性。
- **备选方案**：
  - 所有按钮继续共享统一四边留白：拒绝，原因是纯文本按钮会继续显得上下偏重。
  - 只为纯文本按钮特殊处理：拒绝，原因是图标加文本按钮同样应属于内容型密度，不应落入单独特判。

## 决策 5：`IconButton` 支持 `filled`、`outlined`、`ghost`，不支持 `link`

- **决策**：`IconButton` 复用 `filled`、`outlined`、`ghost` 的视觉层级与颜色模式；不支持 `link`，因为 `link` 的主要反馈依赖文本与下划线。
- **理由**：图标按钮在工具栏和操作组中仍需要实体、描边或轻量背景反馈，但没有文本时，`link` 的下划线反馈不再成立。将 `link` 排除可以减少无意义组合和测试面。
- **备选方案**：
  - 让 `IconButton` 支持全部 `variant`：拒绝，原因是 icon-only `link` 缺少清晰的用户反馈语义。
  - 只支持 `filled` / `outlined`：可行，但会无故收窄当前轻量操作的使用空间。

## 决策 6：`IconButton` 的视觉形态仍沿用现有 shape 规则

- **决策**：`IconButton` 保持方形尺寸，但仍沿用 `filled` / `outlined` 的 `shape` 支持矩阵；`ghost` 不对外暴露 `shape`，继续使用内部统一圆角。
- **理由**：正方形点击目标与圆角风格不是同一个维度。保留 `shape` 能让 `IconButton` 与现有 `Button` 的轮廓语义一致，同时不需要再引入额外的圆角建模。
- **备选方案**：
  - `IconButton` 完全不支持 `shape`：拒绝，原因是会让 `filled` / `outlined` 图标按钮与同系列文本按钮的轮廓语义脱节。
  - 为 `ghost` 公开 `shape`：拒绝，原因是现有契约已经明确 `ghost` 不支持 `shape`。

## 决策 7：优先复用组件内部变量，不新增公共 spacing token

- **决策**：本次优先在 Button 样式内部拆分内容按钮的 `padding-block` / `padding-inline` 与 `IconButton` 的方形尺寸变量，不默认新增公共 spacing token。
- **理由**：当前宪章和 styles 契约都要求先复用现有主题 surface。此次调整只影响 Button 的局部密度模型，还不足以证明要扩展整个公共 token 面。
- **备选方案**：
  - 立即新增全局 Button spacing token：拒绝，原因是当前需求主要是修正组件内部密度，而不是开放新的主题能力。
  - 继续使用单一私有 `--button-padding`：拒绝，原因是无法同时准确表达内容按钮与方形图标按钮。

## 决策 8：验证要覆盖三种入口和两种消费面

- **决策**：验证最小集为 `vp check`、`vp test`、`vp run storybook#build`、`vp run website#build`，并在测试与预览中同时覆盖 `Button`、`IconButton`、`Button.Icon`。
- **理由**：这次变更既是样式重构，也是公开 API 扩展；只测 package 或只看视觉都不够。需要同时验证类型/行为、一致性别名和两个消费 app 的示例面。
- **备选方案**：
  - 只跑组件单测：拒绝，原因是无法发现 Storybook / website 的文档与示例脱节。
  - 只做人工预览：拒绝，原因是无法为 alias 一致性和无障碍回归提供重复验证。
