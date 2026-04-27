# 数据模型：建立统一颜色 token 体系

## 实体：共享颜色基础层

- **目的**：表示 `@deweyou-ui/styles` 中统一维护的颜色事实来源。
- **字段**：
  - `familyCount`：颜色家族总数，固定为 26
  - `stepCountPerFamily`：每个家族的色阶数，固定为 11
  - `stepNames`：色阶名称集合，固定覆盖 `50` 到 `950`
  - `families`：颜色家族集合
  - `baseMonochrome`：纯黑与纯白基础颜色集合
  - `semverImpact`：公开 surface 的版本语义
- **校验规则**：
  - 必须完整覆盖 26 个颜色家族与 11 个色阶。
  - 纯黑与纯白必须作为独立基础颜色存在，而不是并入任意家族色阶。
  - 该实体必须是颜色相关能力的唯一标准来源。
  - `semverImpact` 对 `@deweyou-ui/styles` 必须记录为 additive public API change。

## 实体：颜色家族

- **目的**：表示共享基础色卡中的一个同色相颜色集合。
- **字段**：
  - `familyName`：颜色家族名
  - `displayOrder`：在文档、Storybook 与导出中的稳定顺序
  - `shadeScale`：该家族的 11 个色阶
  - `intendedUseNotes`：可选的人类可读说明
- **校验规则**：
  - `familyName` 必须遵循统一命名，不得出现同义重复家族。
  - 每个家族都必须包含完整 `50`-`950` 色阶。
  - `displayOrder` 必须在 Storybook、website 与文档中保持一致。

## 实体：颜色色阶

- **目的**：表示颜色家族中的一个具体层级。
- **字段**：
  - `stepName`：`50`、`100`、`200`、`300`、`400`、`500`、`600`、`700`、`800`、`900`、`950`
  - `tokenName`：对应该层级的稳定 token 名称
  - `colorValue`：该层级的实际颜色值
  - `relativeDepth`：从浅到深的有序位置
- **校验规则**：
  - `stepName` 必须与共享步进命名完全一致。
  - 每个家族中的 `relativeDepth` 必须保持从浅到深的单调顺序。
  - 组件默认不应直接依赖该实体作为最终消费面。

## 实体：基础黑白

- **目的**：表示不属于任意颜色家族但必须统一维护的两个基础颜色。
- **字段**：
  - `name`：`black` 或 `white`
  - `tokenName`：稳定的基础 token 名称
  - `colorValue`：实际颜色值
  - `usageBoundary`：允许使用的边界说明
- **校验规则**：
  - 只能存在纯黑和纯白两个基础颜色。
  - 当组件需要纯黑或纯白时，必须使用该实体，而不是在局部重新写死颜色值。

## 实体：语义主题色

- **目的**：表示基于共享基础色卡或基础黑白构建的稳定消费语义。
- **字段**：
  - `roleName`：例如品牌背景、品牌 hover、危险背景、链接、焦点、文本高亮前景、文本高亮背景
  - `sourceType`：来源于基础色卡或基础黑白
  - `sourceReference`：追溯到具体颜色家族 / 色阶，或黑白基础色
  - `themeMapping`：浅色 / 深色主题下的映射结果
  - `consumerSet`：允许直接消费该语义色的组件或场景
- **校验规则**：
  - 每个语义主题色都必须能追溯到共享基础色卡或基础黑白。
  - 语义主题色命名必须保持稳定，避免与基础色卡同义重复。
  - 主题切换后必须保持语义连续，不得切换到无关颜色家族。

## 实体：组件颜色消费契约

- **目的**：表示组件如何使用共享基础色卡与语义主题色。
- **字段**：
  - `consumerName`：`Button`、`Text` 或后续组件名称
  - `preferredSource`：优先消费的语义主题色或共享色卡入口
  - `fallbackSource`：当首选来源不存在时的合法回退
  - `disallowedSources`：禁止直接依赖的颜色来源
  - `publicApiImpact`：本次是否新增组件公开配置轴
- **校验规则**：
  - `Button` 与 `Text` 本期不得新增颜色相关公开 props。
  - 组件必须优先消费语义主题色，只有明确需要时才直接读共享基础色卡。
  - 组件不得继续维护来源不明的私有颜色常量。

## 实体：特化 token 例外申请

- **目的**：表示一次请求新增特化 token 的治理记录。
- **字段**：
  - `requester`：提出申请的角色或组件
  - `requestedTokenPurpose`：拟新增 token 的用途
  - `failedExistingSources`：为何共享基础色卡与现有语义主题色不足
  - `scopeBoundary`：预期适用范围
  - `decision`：批准或驳回
  - `decisionReason`：审批理由
- **校验规则**：
  - 未证明现有体系不足时，`decision` 必须为驳回。
  - 任何批准记录都必须包含明确的适用范围，不能为“未来可能有用”。
  - 本期默认预期是绝大多数申请被驳回。

## 实体：颜色预览故事

- **目的**：表示 Storybook 中用于集中评审颜色体系的专门 story。
- **字段**：
  - `storyId`：稳定 story 标识
  - `surface`：固定为 `storybook`
  - `paletteCoverage`：是否覆盖完整 26 色族 x 11 色阶
  - `monochromeCoverage`：是否覆盖纯黑白
  - `semanticCoverage`：是否覆盖品牌、危险、链接、焦点和文本高亮语义层
  - `consumerCoverage`：是否覆盖 `Button`、`Text` 等代表性消费关系
  - `themeCoverage`：是否覆盖浅色 / 深色主题切换
- **校验规则**：
  - Storybook 必须存在专门的颜色预览 story。
  - 该 story 必须能在单一入口完成完整色卡与代表性消费关系评审。
  - 主题切换前后展示顺序与命名必须保持稳定。

## 实体：website 颜色指导区

- **目的**：表示面向消费方的精简颜色接入说明。
- **字段**：
  - `sectionId`：稳定页面区块标识
  - `guidanceFocus`：推荐复用方式、语义主题色边界和特化 token 禁止规则
  - `exampleSet`：精选示例集合
  - `excludedContent`：不在 website 公开面重复展示的内部矩阵内容
- **校验规则**：
  - website 必须提供公开指导，但不需要复制 Storybook 的完整色卡矩阵。
  - 该指导区必须明确“默认复用，不新增特化 token”的边界。

## 状态迁移

- `text-specific palette -> shared palette foundation`：允许；必须保留兼容语义层和已有消费路径。
- `standalone semantic color -> traced semantic color`：允许；每个语义色都必须补全来源追溯。
- `component-private color -> shared token consumption`：允许；迁移后不得保留未治理私有颜色来源。
- `specialized token request -> rejected`：默认路径；当现有基础色卡或语义层足以满足需求时必须发生。
- `specialized token request -> approved`：仅在已记录必要性、适用范围和复用失败原因时允许发生。
