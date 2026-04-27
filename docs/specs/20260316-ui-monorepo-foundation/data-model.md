# 数据模型：UI Monorepo 基础建设

## Package 边界

**说明**：monorepo 中一个可复用或可运行的职责区域。

**字段**：

- `name`：稳定的 package 或 app 名称
- `kind`：`package` 或 `app`
- `audience`：维护者、应用开发者或内部评审者
- `purpose`：该边界的主要职责
- `allowedDependencies`：该区域允许消费的更低层边界
- `publicEntrypoints`：面向消费者暴露的文档化公开入口
- `verificationSurface`：该边界必须承担的验证与预览责任

**关系**：

- 一个 `Package 边界` 可以依赖其他更低层的 `Package 边界`。
- 一个 `App 表面` 会消费一个或多个 `Package 边界`。

**校验规则**：

- 每个边界都必须只有一个主要职责。
- Package 依赖只能向下指向低层边界；循环依赖无效。
- 如果某段逻辑预期要在多个地方复用，就不能只存在于某个 app 中。

## App 表面

**说明**：monorepo 中服务于特定受众的一个可运行体验。

**字段**：

- `name`：app 名称
- `audience`：公开用户或内部维护者
- `contentScope`：该 app 负责的内容类型
- `excludedScope`：该 app 明确不负责的内容
- `themeBehavior`：支持的主题体验

**关系**：

- `website` 消费可复用 packages，并负责说明它们的使用方式。
- `storybook` 消费可复用 packages，并负责验证它们的状态。

**校验规则**：

- website 必须承担官方安装、主题和精选使用指导。
- Storybook 不能成为唯一的官方公开文档来源。

## 公开主题 Token

**说明**：一个面向用户的主题 token，允许由消费者覆盖。

**字段**：

- `name`：token 标识符
- `semanticPurpose`：品牌背景、交互状态、焦点强调或链接强调
- `defaultThemeValue`：内置主题中的默认映射值
- `overrideAllowed`：是否允许消费者覆盖
- `affectedSurfaces`：受该 token 影响的组件或 app 表面

**关系**：

- 一个 `公开主题 Token` 会映射到一个或多个 `组件视觉契约` 属性。
- 一个 `公开主题 Token` 来源于，或与更广义的 `内部设计 Token` 集协调。

**校验规则**：

- 公开主题 tokens 必须严格限制在文档化的颜色表面内。
- 在 v1 中，公开主题 tokens 不得重新定义结构布局或字号体系。

## 内部设计 Token

**说明**：用于表达组件库默认设计语言、但不属于面向消费者自定义契约的 token。

**字段**：

- `name`：token 标识符
- `tokenType`：结构、间距、圆角、排版、动效、中性色或状态样式
- `defaultValue`：内置默认值
- `themeAwareness`：亮 / 暗模式映射是否会改变其有效值
- `publiclyDocumented`：该 token 是公开给用户还是仅内部使用

**关系**：

- 内部 tokens 会流入主题产物和组件本地样式。
- 在适当情况下，内部 tokens 可以作为公开主题 tokens 的底层支撑。

**校验规则**：

- 内部 tokens 必须维持组件库既定的设计语言。
- 内部 tokens 不直接暴露为初始公开主题面的一部分。

## 组件自定义契约

**说明**：一个组件可供消费者稳定依赖的样式接口。

**字段**：

- `componentName`：稳定的组件标识符
- `sourceFolder`：包含实现与样式入口的独立组件目录
- `rootClassNameSupport`：是否接受根级 `className`
- `componentStyleVariables`：刻意暴露出来的有限组件级 CSS 变量
- `internalClassExposure`：内部 CSS Module 类名是否对外公开
- `themeDependencies`：会影响该组件的公开主题 tokens

**关系**：

- 每个 `组件自定义契约` 都依赖 `公开主题 Token` 与 `内部设计 Token` 的值。
- 这些契约会在公开 package 文档与示例中被记录。

**校验规则**：

- 根级 `className` 是默认的公开覆盖入口。
- 每个组件都必须位于自己的源码目录中，并共置实现文件和作用域样式文件。
- 内部 CSS Module 类名必须保持为私有实现细节。
- 组件级 CSS 变量必须保持有限，且在 v1 中不能暴露完整结构重塑能力。
