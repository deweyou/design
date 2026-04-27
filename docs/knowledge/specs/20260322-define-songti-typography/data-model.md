# 数据模型：定义组件库宋体字体系统

## 实体：字体角色

- **目的**：定义组件库内全局可复用的字体职责，使正文、标题和例外文本都通过稳定角色而不是分散写死值使用字体。
- **字段**：
  - `roleName`：稳定角色名，如 `body`、`display`、`mono`
  - `usageScope`：角色适用的组件与文本范围
  - `primaryFamily`：默认开源字体目标
  - `fallbackFamilySet`：该角色在各平台的回退家族集合
  - `defaultWeightTier`：该角色默认绑定的字重层级
  - `themeCoverage`：该角色是否在 light / dark 主题中共用同一字体栈
  - `isPublicToken`：该角色是否承诺为消费者公开可覆盖 token
- **校验规则**：
  - `body` 与 `display` 必须共同指向思源宋体系方向。
  - `mono` 必须保持例外角色，不得被默认宋体方向覆盖。
  - `isPublicToken=false` 的角色不得被写入 `publicThemeTokens`。

## 实体：默认字体家族栈

- **目的**：描述某个字体角色在开源默认、平台回退和最终通用回退之间的优先顺序。
- **字段**：
  - `stackId`：稳定标识，用于文档和测试引用
  - `targetRole`：对应的 `字体角色`
  - `openSourceFamilyGroup`：默认开源字体体系，本期为思源宋体系
  - `macFallbacks`：`macOS` 的系统回退家族顺序
  - `windowsFallbacks`：`Windows` 的系统回退家族顺序
  - `genericFallback`：最终通用家族方向
  - `loadingPhasePolicy`：字体未就绪时的显示策略
- **校验规则**：
  - `body` / `display` 的 `openSourceFamilyGroup` 必须收敛到思源宋体系。
  - `macFallbacks` 必须包含 `Songti SC`、`STSong`。
  - `windowsFallbacks` 必须包含 `SimSun`、`NSimSun`。
  - `loadingPhasePolicy` 必须允许先显示系统回退文本，而不是等待默认开源字体导致空白。

## 实体：字重层级

- **目的**：以语义方式定义组件库的可复用字重差异，而不是要求组件逐个写死权重值。
- **字段**：
  - `tierName`：如正文、次强调、标题、强强调
  - `semanticPurpose`：该层级表达的内容优先级
  - `preferredWeight`：默认开源字体下优先使用的目标权重
  - `fallbackWeightRule`：当平台回退家族不具备完整权重时的最近似规则
  - `allowedRoles`：该层级可被哪些字体角色使用
- **校验规则**：
  - 必须至少存在四个稳定层级：正文、次强调、标题、强强调。
  - `fallbackWeightRule` 不得产生与相邻层级完全不可分辨的结果。
  - 紧凑控件文本和标题文本都必须能映射到某个字重层级。

## 实体：混排规则

- **目的**：定义中文、英文、数字及常见符号在同一组件中的默认字体归属和预期表现。
- **字段**：
  - `ruleId`：稳定规则标识
  - `contentCategories`：覆盖的字符类别，如中文、英文、数字、日期、价格、百分比、版本号
  - `familyStrategy`：这些字符默认跟随的字体体系
  - `spacingExpectation`：混排时的节奏与协调要求
  - `exceptionNotes`：是否存在例外说明
- **校验规则**：
  - 默认规则必须指定英文与数字跟随思源宋体系内置字形。
  - 不得要求默认混排场景再切换到额外西文字体。
  - 日期、价格、百分比和版本号必须被纳入代表性示例覆盖。

## 实体：平台回退家族

- **目的**：定义默认开源字体不可用时，每个平台必须退回的系统字体集合。
- **字段**：
  - `platform`：平台名称，如 `macOS`、`Windows`
  - `families`：按优先顺序排列的系统家族列表
  - `supportedScripts`：该回退家族必须承接的字符范围
  - `weightLimitNotes`：该平台回退在字重上的已知限制
- **校验规则**：
  - `macOS` 条目必须包含 `Songti SC` 和 `STSong`。
  - `Windows` 条目必须包含 `SimSun` 和 `NSimSun`。
  - 每个平台条目都必须明确说明其字重限制如何影响层级评审。

## 实体：字体覆盖场景

- **目的**：表示 Storybook、website 和测试中用于验证字体系统的具体评审样例。
- **字段**：
  - `scenarioId`：稳定场景标识
  - `surface`：场景所在评审面，如 styles 测试、Storybook、website
  - `componentClass`：对应的组件类别，如标题、正文、按钮、表单、数据展示、代码样例
  - `textContentMix`：该场景包含的文本类型组合
  - `themeMode`：light、dark 或两者
  - `expectedRole`：该场景预期使用的字体角色
  - `fallbackSensitive`：该场景是否需要验证字体未就绪或平台回退表现
- **校验规则**：
  - 必须覆盖标题、正文、操作控件、数据展示和等宽例外文本。
  - 至少一个场景必须验证中文、英文、数字同屏混排。
  - 至少一个场景必须验证默认开源字体未就绪时的系统回退表现。

## 状态迁移

- `系统回退中 -> 默认开源字体已就绪`：允许，前提是文本在过渡过程中保持可读且层级关系不被破坏。
- `默认开源字体已就绪 -> 系统回退中`：允许，发生在字体不可用或加载失败时；表现必须仍保持宋体方向。
- `默认字体角色 -> 等宽例外角色`：仅对代码、固定宽度编号和文档化例外内容允许发生，不得扩散到常规正文与控件文本。
