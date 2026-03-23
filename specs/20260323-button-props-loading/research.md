# 研究：补齐 Button 公开属性与加载态

## 决策 1：默认保持 `<button>`，但在 `href` 场景切到原生 `<a>`

- **决策**：`Button` 与 `IconButton` 默认继续渲染原生 `<button>`；当消费方传入 `href` 时，根节点切换为原生 `<a>`，`target` 只在该路径下生效。
- **理由**：用户进一步明确了“有 `href` 的话最后渲染的时候 `a` 标签，这样子点击才有效果”。因此链接语义必须落到真实 `<a>`，而不是继续停留在 button 透传层。
- **备选方案**：
  - 继续把 `href` / `target` 透传给 `<button>`：拒绝，原因是无法提供真实链接激活能力。
  - 另起 `LinkButton`：拒绝，原因是超出本期范围，也会把统一 Button API 再次拆散。

## 决策 2：`htmlType` 作为公开语义字段，优先于原生 `type`

- **决策**：新增 `htmlType` 作为文档化的公开字段，用于映射原生 button `type`；若消费方同时传入 `htmlType` 与原生 `type`，则以 `htmlType` 为准。
- **理由**：当前 `ButtonProps` 已继承原生 `type`，但本期 spec 明确要求新增 `htmlType`。为了给消费方一个稳定、可文档化的组件层入口，需要定义清晰的优先级，而不是让两个字段并存却无冲突规则。
- **备选方案**：
  - 只保留原生 `type`，不提供 `htmlType`：拒绝，原因是与本期用户要求不符。
  - 新增 `htmlType` 并删除 `type`：拒绝，原因是会把原本兼容的原生 props 变成 breaking change。

## 决策 3：`href` / `target` 进入链接语义分支，并保留统一视觉契约

- **决策**：`href` 与 `target` 会进入 `Button` / `IconButton` 的公开契约；`href` 存在时组件切换到 `<a>` 根节点，`target` 只允许在该场景下使用，同时维持原有 `variant` / `color` / `size` / `shape` 视觉模型。
- **理由**：这样既能满足真实链接激活，又不需要把视觉系统拆成独立的 LinkButton 家族。
- **备选方案**：
  - 收到 `target` 但没有 `href` 时静默忽略：拒绝，原因是会制造隐性无效配置。
  - 拒绝 `href` / `target`：拒绝，原因是违背本期公开 API 要求。

## 决策 4：`danger` 应扩展 `color` 轴，并通过共享 token 暴露

- **决策**：`danger` 作为 `color` 的新增值引入，与 `neutral`、`primary` 并列；由于当前 `packages/styles` 没有公开 danger / error 语义色，本期应先在 `packages/styles` 中新增 danger theme surface，再由 `packages/components` 消费。
- **理由**：按钮危险态是会在多个组件或场景中复用的视觉决策，不应在 Button 内部直接写死一套孤立红色。宪章要求可复用视觉能力通过共享 token 与主题原语表达，当前仓库中也确实没有现成 danger surface 可直接复用。
- **备选方案**：
  - 在 Button less 中直接硬编码一组 danger 颜色：拒绝，原因是绕过 token / theme 体系。
  - 复用 `primary` 颜色并只换文案：拒绝，原因是无法满足“可被明确识别为危险动作”的规格目标。

## 决策 5：`loading` 作为独立状态字段，不并入 `variant` 或 `disabled`

- **决策**：`loading` 保持为独立布尔状态字段；其可观察行为是“显示 loading 图标、阻止重复触发、视觉接近 disabled”，但它不是新的 `variant`，也不替代 `disabled` 作为独立输入。
- **理由**：此前 Button 基础规格已经明确 `loading` 必须独立于 `variant`。本期进一步落地时，还需要保留 `disabled` 与 `loading` 的可组合性，否则消费方无法表达“本来就 disabled”与“异步处理中”的不同来源。
- **备选方案**：
  - 新增 `variant="loading"`：拒绝，原因是违背既有建模原则。
  - 将 `loading` 直接折叠为 `disabled`：拒绝，原因是会丢失 loading 图标和处理中语义。

## 决策 6：`loading` 阻止激活，但不使用 disabled 专属鼠标指针

- **决策**：当 `loading=true` 时，按钮必须阻止再次激活，并采用 disabled 风格的视觉层级；同时移除 `not-allowed` 指针反馈，保留常规鼠标指针样式。若同时存在 `disabled=true` 与 `loading=true`，交互仍保持不可用，loading 图标与 loading 说明继续显示。
- **理由**：用户要求已经明确指出“按钮样式是 disable 状态，但是不需要 disable 的 cursor 样式”。同时，重复点击抑制是 loading 的核心业务价值，不能只显示图标而继续触发事件。
- **备选方案**：
  - loading 时完全沿用 disabled 的光标样式：拒绝，原因是与用户要求冲突。
  - loading 时只显示 spinner，不阻止点击：拒绝，原因是无法防止重复提交。

## 决策 7：普通按钮与图标按钮采用不同的 loading 指示器策略

- **决策**：普通 `Button` 在 `loading` 时保留原有可见文本，并在内容前插入内建 spinner；`IconButton` / `Button.Icon` 在 `loading` 时直接用同一 spinner 替换原图标。
- **理由**：普通按钮需要同时保留动作文案和处理中信号，图标按钮则没有多余内容位，叠加两套图标只会制造噪音。由于 `packages/components` 不能依赖 `@deweyou-ui/icons`，用组件内建 spinner 插槽表达 loading 是最稳定的 shared contract。
- **备选方案**：
  - 所有按钮都在原内容旁边再叠一个 loading 图标：拒绝，原因是 icon-only 情况下会同时出现双图标。
  - 所有按钮都只显示 spinner，不保留文案：拒绝，原因是会削弱普通按钮的动作可理解性。
  - 让 `packages/components` 直接依赖 `@deweyou-ui/icons/loading`：拒绝，原因是会破坏当前的 package 边界约束。

## 决策 8：ref-forwarding 需要跟随真实根节点

- **决策**：`Button` 与 `IconButton` 都应支持 ref-forwarding，且 ref 目标跟随最终渲染根节点：默认是 button，带 `href` 时是 anchor。
- **理由**：一旦链接路径采用真实 `<a>`，ref 继续声称固定指向 button 就会与实际 DOM 不一致。
- **备选方案**：
  - 只给 `Button` 暴露 ref，`IconButton` 保持不支持：拒绝，原因是会造成两个入口能力分叉。
  - 通过额外 `buttonRef` prop 暴露 DOM：拒绝，原因是会偏离 React 组件通行模式，并增加冗余 API。

## 决策 9：验证必须同时覆盖 package、Storybook 和 website 三层

- **决策**：本次验证最小集为 `vp check`、`vp test`、`vp run components#build`、`vp run storybook#build`、`vp run website#build`，并在测试与预览中同时覆盖 `danger`、`loading`、`htmlType`、`href` / `target`、事件与 ref。
- **理由**：这次改动既是 package 公开 API 扩展，也是消费面示例更新；只做单测或只看视觉都不足以覆盖回归风险。
- **备选方案**：
  - 只跑组件单测：拒绝，原因是无法发现 Storybook / website 示例面脱节。
  - 只做手动预览：拒绝，原因是无法稳定验证 props、ref 和 loading 阻断行为。
