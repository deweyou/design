# 数据模型：仓库规范统一

## 规范规则集

**目的**：表示仓库级的标准集合，用于约束代码编写方式、命名、目录结构和验证方式。

**字段**：

- `name`：规则集的人类可读名称
- `scope`：规则集覆盖的 packages、apps 和文件类别
- `functionStyleDefault`：受治理代码的默认函数写法
- `componentAuthoringFormat`：受治理 React 组件的默认源码文件与编写格式
- `namingPattern`：必需的文件和目录命名约定
- `structurePattern`：utilities、hooks 和 components 必需的源码单元目录结构
- `testLocationPolicy`：源码单元与单测之间的预期位置关系
- `adoptionPolicy`：该规则对新增代码、迁移代码和延期处理历史文件时的适用条件
- `verificationPolicy`：必需的自动化和评审检查方式

**校验规则**：

- 必须明确受治理范围。
- 必须说明每条规则是自动化执行、文档指导、评审强制还是混合执行。
- 如果存在例外或非受治理区域，必须明确标出。

## 受治理源码单元

**目的**：表示受仓库规范约束的 utility、hook 或 component。

**字段**：

- `category`：utility、hook 或 component
- `package`：所属 package 名称
- `sourceRoot`：位于 `src` 下的路径
- `directoryName`：小写连字符形式的单元目录名
- `entryFile`：单元本地的 `index` 入口文件
- `testFile`：单元本地的 `index.test` 文件
- `styleFile`：如果需要，可选的单元本地样式文件
- `previewCoverage`：该单元是否需要预览或 demo 覆盖
- `accessibilityCoverage`：该单元是否需要对键盘、语义与状态行为提供明确评审证据

**校验规则**：

- 必须存在于所属 package 的 `src` 下。
- 当位于受治理范围时，必须使用独立单元目录。
- 当该单元要求直接自动化覆盖时，测试必须与源码共置。

## 执行机制

**目的**：表示某条规范在实际中如何被执行。

**字段**：

- `ruleReference`：指向规范规则集对应条目的引用
- `mechanismType`：lint、agent 指导、评审清单、预览要求或测试门禁
- `targetPaths`：机制生效的文件或目录
- `failureMode`：什么情况会被判定为不合规
- `exceptionHandling`：获批例外如何记录或评审

**校验规则**：

- 每条高优先级规范都应至少对应一种执行机制。
- 机制的作用范围必须足够精确，避免阻塞无关区域。

## 采纳决策

**目的**：记录维护者在渐进采纳过程中如何处理历史产物。

**字段**：

- `artifactPath`：被评审的现有文件或目录路径
- `decision`：重命名、重定位、机会式对齐，或延后处理
- `reason`：作出该决策的原因
- `publicApiImpact`：是否会影响导入方式或消费者预期
- `followUpNeeded`：是否需要安排后续迁移工作

**状态迁移**：

- `identified` -> `aligned`：该产物已按规则完成对齐
- `identified` -> `deferred`：当前迁移风险高于立即清理收益
- `deferred` -> `scheduled`：已创建专门治理工作
- `scheduled` -> `aligned`：后续治理工作已落地
