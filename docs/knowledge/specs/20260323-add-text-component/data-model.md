# 数据模型：新增 Text 排版组件

## 实体：Text 公开入口

- **目的**：表示 `@deweyou-ui/components` 对外暴露的统一文本渲染入口。
- **字段**：
  - `componentName`：组件名，固定为 `Text`
  - `propsTypeName`：公开 props 类型名，固定为 `TextProps`
  - `rootExportPath`：根级 package 导出路径
  - `semverImpact`：本次公开 API 变化对应的版本语义
- **校验规则**：
  - 根级 package 必须导出 `Text` 与 `TextProps`。
  - `Text` 必须作为统一文本渲染入口，不拆分为多个并列基础排版组件。
  - `semverImpact` 必须记录为 additive public API change，而不是 breaking rename。

## 实体：Text Variant 定义

- **目的**：表示每个 `variant` 对应的视觉层级、默认节点和排版规则。
- **字段**：
  - `name`：`plain`、`body`、`caption`、`h1`、`h2`、`h3`、`h4`、`h5`
  - `defaultNode`：默认渲染节点，取值为 `span`、`div` 或对应原生 heading 节点
  - `fontRole`：使用的字体角色，取值为 `body` 或 `display`
  - `weightTier`：使用的字重层级
  - `sizeToken`：对应字号 token
  - `lineHeightToken`：对应行高 token
  - `colorTreatment`：正文色或弱化文本色
- **校验规则**：
  - `plain` 必须是默认 `variant`，且 `defaultNode=span`。
  - `body` 与 `caption` 的 `defaultNode` 必须为 `div`。
  - `h1`-`h5` 的 `defaultNode` 必须为对应的 `h1`-`h5` 原生节点。
  - `caption` 必须比 `plain` / `body` 更小且强调更弱。
  - `h1`-`h5` 必须形成从强到弱可区分的五级标题层级。

## 实体：文本装饰集合

- **目的**：描述可叠加在任意 `variant` 上的基础强调样式与高亮能力。
- **字段**：
  - `italic`：是否启用斜体
  - `bold`：是否启用加粗
  - `underline`：是否启用下划线
  - `strikethrough`：是否启用删除线
  - `colorFamily`：可选文字颜色家族
  - `backgroundFamily`：可选背景颜色家族
  - `compositeClassList`：最终应用到根节点的装饰状态集合
- **校验规则**：
  - 四个布尔字段均为独立能力，不得互斥。
  - `colorFamily` 与 `backgroundFamily` 必须只接受公开 26 色族中的合法家族名。
  - 任意字段组合都不得改变当前 `variant` 的默认节点映射。
  - 任意字段组合都不得要求额外包装节点才能生效。

## 实体：共享色卡 token

- **目的**：表示供 `Text` 高亮能力复用的共享颜色家族与色阶体系。
- **字段**：
  - `familyName`：颜色家族名，取值为公开 26 色族之一
  - `shadeScale`：固定的 11 档色阶，覆盖 `50` 到 `950`
  - `lightTextShade`：浅色主题下供 `color` 使用的较深色阶，当前固定为 `800`
  - `lightBackgroundShade`：浅色主题下供 `background` 使用的较浅色阶，当前固定为 `100`
  - `darkTextShade`：深色主题下供 `color` 使用的较浅色阶，当前固定为 `200`
  - `darkBackgroundShade`：深色主题下供 `background` 使用的较深色阶，当前固定为 `900`
- **校验规则**：
  - 每个颜色家族都必须具备完整的 11 档色阶。
  - `Text` 的公开 props 不得直接暴露 `shadeScale` 中的编号。
  - 浅色 / 深色主题的映射必须保持同一家族语义连续。

## 实体：截断规则

- **目的**：定义 `lineClamp` 对文本显示行数的限制与归一逻辑。
- **字段**：
  - `inputValue`：消费方传入的 `lineClamp`
  - `normalizedValue`：归一后的有效值，正整数或空值
  - `isClamped`：是否启用截断
  - `overflowTreatment`：超出后的显示策略
- **校验规则**：
  - `normalizedValue` 仅允许为正整数或空值。
  - `inputValue` 为非正整数、非有限数字或未设置时，`isClamped=false`。
  - `isClamped=true` 时，`overflowTreatment` 必须表达省略，而不是裁切为不可读结果。

## 实体：Text 渲染请求

- **目的**：表示消费方一次对 `Text` 的公开配置请求。
- **字段**：
  - `variant`：目标文本层级
  - `decorations`：文本装饰集合
  - `color`：可选文字颜色家族
  - `background`：可选背景颜色家族
  - `lineClamp`：最大显示行数
  - `children`：文本或混合内容
  - `className`：自定义类名
  - `style`：内联样式
  - `id`：节点标识
  - `role`：可选语义角色
  - `tabIndex`：可选键盘导航属性
  - `ariaAttributes`：辅助技术属性集合
  - `dataAttributes`：测试或业务标识属性集合
  - `eventHandlers`：透传到根节点的事件属性集合
- **校验规则**：
  - 所有原生节点属性必须落到最终渲染节点。
  - `variant` 未设置时必须解析为 `plain`。
  - `color` 与 `background` 未设置时必须退回默认文字与背景表现。
  - 标题类 `variant` 必须默认输出原生 heading 节点，同时仍允许透传额外语义属性。

## 实体：共享主题变量

- **目的**：表示 `packages/styles` 为 `Text` 及其他后续排版能力提供的可复用 theme surface。
- **字段**：
  - `bodySizeToken`：`--ui-text-size-body`
  - `bodyLineHeightToken`：`--ui-text-line-height-body`
  - `captionSizeToken`：`--ui-text-size-caption`
  - `captionLineHeightToken`：`--ui-text-line-height-caption`
  - `heading1SizeToken`：`--ui-text-size-h1`
  - `heading1LineHeightToken`：`--ui-text-line-height-h1`
  - `heading2SizeToken`：`--ui-text-size-h2`
  - `heading2LineHeightToken`：`--ui-text-line-height-h2`
  - `heading3SizeToken`：`--ui-text-size-h3`
  - `heading3LineHeightToken`：`--ui-text-line-height-h3`
  - `heading4SizeToken`：`--ui-text-size-h4`
  - `heading4LineHeightToken`：`--ui-text-line-height-h4`
  - `heading5SizeToken`：`--ui-text-size-h5`
  - `heading5LineHeightToken`：`--ui-text-line-height-h5`
  - `mutedTextToken`：`--ui-color-text-muted`
  - `paletteFamilies`：26 色族共享色卡 token 集合
  - `textColorFamilyTokens`：`--ui-text-color-<family>` 语义变量集合
  - `textBackgroundFamilyTokens`：`--ui-text-background-<family>` 语义变量集合
- **校验规则**：
  - 所有标题尺寸与行高变量必须在浅色 / 深色主题下同时可用。
  - `mutedTextToken` 必须复用现有弱化文本语义色，而不是新增重复色值来源。
  - `paletteFamilies` 必须在浅色 / 深色主题下提供稳定映射来源。
  - `textColorFamilyTokens` 与 `textBackgroundFamilyTokens` 必须对 26 个颜色家族全部可用。
  - `Text` 组件不得绕过这些变量直接写死公开排版层级。

## 实体：预览场景

- **目的**：表示 Storybook 或 website 中一个用于评审的 Text 示例。
- **字段**：
  - `scenarioId`：稳定的示例标识
  - `surface`：`storybook` 或 `website`
  - `variantsCovered`：该示例覆盖的 `variant` 集合
  - `decorationsCovered`：该示例覆盖的布尔样式集合
  - `paletteCoverage`：是否覆盖颜色家族与主题切换场景
  - `lineClampCoverage`：是否覆盖未截断与截断场景
  - `attributeCoverage`：是否覆盖 `aria-*`、`data-*`、`className` 等透传能力
  - `purpose`：内部评审矩阵、公开指导或边界验证
- **校验规则**：
  - Storybook 必须覆盖全部 `variant`、装饰组合、颜色高亮和 `lineClamp` 状态。
  - website 必须覆盖推荐接入方式、至少一组长文本截断示例，以及至少一组色卡高亮示例。
  - 至少一个场景必须展示标题视觉层级、色卡高亮和主题切换边界。

## 状态迁移

- `unclamped -> clamped`：当 `lineClamp` 从空值切换到有效正整数时允许发生。
- `clamped -> unclamped`：当 `lineClamp` 被移除或归一为空值时允许发生。
- `plain/body/caption -> heading variant`：允许；必须同时切换字号、行高和默认节点映射。
- `heading variant -> plain/body/caption`：允许；必须恢复对应层级的默认节点和排版变量。
- `decorations off -> decorations on`：任意布尔装饰字段都允许独立开启。
- `decorations on -> decorations off`：任意布尔装饰字段都允许独立关闭。
- `default colors -> palette colors`：当 `color` 或 `background` 设置为合法颜色家族时允许发生。
- `light theme mapping -> dark theme mapping`：当主题切换时允许发生；必须保持同一颜色家族语义连续。
