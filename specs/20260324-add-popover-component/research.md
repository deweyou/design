# 研究：实现 Popover 组件

## 决策：使用 `@floating-ui/react` 作为 Popover 的定位与交互原语

**理由**：规格要求同时覆盖锚定定位、边界回退、箭头、portal 挂载、自定义安全边距、多触发方式和非模态交互。`@floating-ui/react` 已提供成熟的定位和交互 primitives，能把复杂逻辑留在组件 package 内，而不是分散到 `website` 或 `storybook`。它还天然适配 React 组件场景，适合作为当前仓库的基础浮层能力。

**备选方案**：

- 手写定位与边界回退：拒绝，原因是会把滚动、视口碰撞、箭头位置和事件协同的复杂度全部转移到组件自身，测试成本过高。
- 直接采用更高层的 headless 组件库：拒绝，原因是当前仓库需要维护自有公开 API、视觉契约和 semver 边界，高层封装会压缩定制空间。

## 决策：将公开 placement 保持为规格约定的 8 个方向，并在内部映射到定位引擎的逻辑 placement

**理由**：规格已经将公开位置收敛为上、下、左、右、左上、左下、右上、右下。实现上可将这些值映射到定位引擎支持的逻辑方向，例如 `left-top -> left-start`、`right-bottom -> right-end`，以保持公开契约稳定，同时利用底层定位能力。

**备选方案**：

- 直接暴露底层库的全部 placement 字符串：拒绝，原因是会扩大公开 API 面，并引入规格未要求的额外方位组合。
- 只保留四向 placement：拒绝，原因是无法满足已确认的 `left-top`、`left-bottom`、`right-top`、`right-bottom` 需求。

## 决策：边界回退由 `offset`、碰撞检测、安全边距和箭头协同完成

**理由**：规格要求支持 `offset`、`boundaryPadding`、边界回退和小箭头。实现上应把 `offset` 视为触发目标与浮层之间的用户级间距，把 `boundaryPadding` 视为与边界框的最小安全距离，并在位置回退时继续保持箭头与目标的关联性。这样既能满足边缘场景，也能让文档中的 props 含义清晰分层。

**备选方案**：

- 只在空间不足时简单翻转方向：拒绝，原因是无法保证边界安全距离，也难以处理复杂的窄容器场景。
- 让 `offset` 同时承担边界安全边距：拒绝，原因是会把“目标间距”和“边界安全距离”两个不同概念混在一起。

## 决策：默认通过 portal 渲染浮层，并允许 `popupPortalContainer` 覆盖挂载父节点

**理由**：Popover 需要穿透常见的 `overflow: hidden` 或局部 stacking context，同时规格也要求使用方可指定挂载父节点。因此默认应使用 portal 渲染浮层，且将自定义容器视为对默认 portal 根节点的可控覆盖，而不是关闭 portal 机制本身。

**备选方案**：

- 默认不使用 portal：拒绝，原因是更容易受到容器裁切和层级上下文影响，不利于实现稳定的通用组件。
- 将 portal 容器固定写死到 `document.body`：拒绝，原因是无法满足 `popupPortalContainer` 的公开契约。

## 决策：保持非模态焦点行为，不为 Popover 引入焦点陷阱

**理由**：规格已明确 Popover 为非阻断式浮层，并要求键盘用户可以进入内容区域、离开内容区域，并在关闭后回到触发元素。因此实现应该是“可进入、可退出、可返回”的非模态模型，而不是 Dialog 式焦点陷阱。这样既能承载轻量交互内容，又不会越过组件边界。

**备选方案**：

- 总是启用焦点陷阱：拒绝，原因是会把基础 Popover 推向 Dialog 的职责边界。
- 只要内容中有可交互元素就启用焦点陷阱：拒绝，原因是会让相同 API 在不同内容下表现不一致，增加维护和测试成本。

## 决策：动画使用定位包装层与内容层分离的方式实现

**理由**：定位引擎默认依赖定位元素的 transform 计算位置。如果把缩放或位移动画直接压在同一层上，容易和定位 transform 互相冲突。因此实现时应将“负责定位的外层容器”和“负责过渡动画的内层面板”分离，让打开与关闭动画可中断且不影响定位结果。

**备选方案**：

- 在同一 DOM 层同时做定位和缩放动画：拒绝，原因是容易破坏定位 transform，造成抖动或错误位移。
- 完全不做关闭动画：拒绝，原因是已与规格确认的显示/关闭动画能力不符。

## 决策：默认复用现有主题 token，不新增 Popover 专属 token

**理由**：`@deweyou-ui/styles` 已提供 `--ui-color-surface`、`--ui-color-border`、`--ui-shadow-soft`、`--ui-radius-md` 和 `--ui-color-focus-ring`，并且已有 `surface-card`、`focus-ring` 这类 mixin。对于当前 Popover 范围，border、shadow、rounded 圆角和焦点环都可以复用现有 token。箭头视觉也应先沿用同一套 surface 和 border 语义，而不是扩张 token 面。

**备选方案**：

- 新增 `popover-*` 专属 token：拒绝，原因是当前视觉差异不足以证明现有共享 token 不能覆盖。
- 直接写死阴影、边框和圆角值：拒绝，原因是违反 token 作为事实来源的仓库原则。

## 决策：公开 API 采用单入口 `Popover` 组件，`children` 作为触发元素，`content` 作为必填浮层内容

**理由**：当前组件库的公开面以单组件根导出为主，且本次规格已经将 `content` 确认为必填。初版采用单入口 `Popover` 组件可以最小化公开面，保持与现有 package 的命名和导出模式一致，也更便于在 `website` 与 `storybook` 中直接展示。

**备选方案**：

- 初版就拆成 compound API，例如 `Popover.Trigger` / `Popover.Content`：拒绝，原因是会扩大公开面和实现复杂度，而规格当前并未要求。
- 只提供 hook，不提供组件：拒绝，原因是与当前 `@deweyou-ui/components` 的交付形态不一致，也不利于统一预览和 semver 管理。

## 决策：验证范围同时覆盖 package 测试、根入口测试、website demo 与 Storybook review

**理由**：宪章要求用户可见组件变更同时具备自动化验证和可视评审面。对于 Popover，这意味着不仅要验证 props 和交互行为，还要验证它作为 package 根公开面的导出稳定性，以及在公开 website demo 和内部 Storybook review 中的状态覆盖。

**备选方案**：

- 只补组件单测：拒绝，原因是无法覆盖公开导出面和预览面要求。
- 只在 Storybook 里做人工验证：拒绝，原因是缺少可重复执行的自动化验证。
