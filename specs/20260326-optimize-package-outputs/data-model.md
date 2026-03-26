# 数据模型：包构建与发布产物治理

## 实体 1：PublicComponentEntry

**说明**：面向组件消费者暴露的公开组件入口。

| 字段                  | 类型   | 说明                                             |
| --------------------- | ------ | ------------------------------------------------ |
| `packageName`         | string | 固定为 `@deweyou-ui/components`                  |
| `componentName`       | string | 公开组件名称，例如 `button`、`popover`、`text`   |
| `subpath`             | string | 消费者使用的子路径入口                           |
| `rootExportName`      | string | 根入口继续暴露的组件标识                         |
| `styleContract`       | enum   | `self-contained` 或 `requires-global-theme-only` |
| `compatibilityStatus` | enum   | `root-and-subpath`、`root-only`、`subpath-only`  |
| `semverImpact`        | enum   | `patch`、`minor`、`major`                        |

**校验规则**：

- 每个公开组件必须拥有唯一的 `subpath`。
- `compatibilityStatus` 在本次功能范围内必须为 `root-and-subpath`。
- `styleContract` 不允许要求额外导入组件专属样式入口。

## 实体 2：PackageBuildPolicy

**说明**：描述某个拟发布包是否采用默认构建约定，或是否被允许保留专用构建配置。

| 字段               | 类型     | 说明                                                                      |
| ------------------ | -------- | ------------------------------------------------------------------------- |
| `packageName`      | string   | `packages/` 下的发布包名称                                                |
| `defaultMode`      | boolean  | 是否直接采用 Vite+ 默认约定                                               |
| `exceptionType`    | enum     | `none`、`multi-entry`、`style-delivery`、`asset-copy`、`manifest-rewrite` |
| `exceptionReason`  | string   | 默认约定不足的具体原因                                                    |
| `documentedInPlan` | boolean  | 是否在 plan 或 package 文档中记录例外原因                                 |
| `validationScope`  | string[] | 需要覆盖的验证面，例如构建、导出、样式、清单                              |

**校验规则**：

- `defaultMode=true` 时，`exceptionType` 必须为 `none`。
- `defaultMode=false` 时，`exceptionReason` 不得为空，且 `documentedInPlan` 必须为 `true`。
- 任一拟发布包都必须存在一条 `PackageBuildPolicy` 记录。

## 实体 3：PublishedDependencyContract

**说明**：包对外发布时呈现给宿主消费者的依赖与版本契约。

| 字段                 | 类型    | 说明                                                         |
| -------------------- | ------- | ------------------------------------------------------------ |
| `packageName`        | string  | 发布包名称                                                   |
| `dependencyName`     | string  | 依赖标识                                                     |
| `dependencyRole`     | enum    | `peer-runtime`、`runtime`、`development`、`internal-package` |
| `sourceSpecifier`    | string  | 源码阶段的版本声明，例如 `workspace:*`、`catalog:` 或 semver |
| `publishedSpecifier` | string  | 发布产物中最终暴露的 semver 范围                             |
| `hostInstalled`      | boolean | 是否由宿主负责安装                                           |
| `publishBlocking`    | boolean | 未正确解析时是否阻断发布                                     |

**校验规则**：

- 运行时依赖 `react` 或 `react-dom` 的包，`dependencyRole` 必须为 `peer-runtime`，且 `hostInstalled=true`。
- `publishedSpecifier` 不允许保留 `workspace:*`、`catalog:` 或其他工作区占位符。
- 对外可发布的内部包依赖必须有明确 `publishedSpecifier`。

## 关系

- 一个 `PackageBuildPolicy` 可以对应多个 `PublicComponentEntry`。
- 一个发布包可以对应多条 `PublishedDependencyContract`。
- `PublicComponentEntry.packageName` 必须引用一条 `PackageBuildPolicy.packageName`。
- `PublishedDependencyContract.packageName` 必须引用一条 `PackageBuildPolicy.packageName`。

## 生命周期

### PackageBuildPolicy

`draft` → `validated-default` 或 `validated-exception` → `released`

- `draft`：尚未确认包是否需要例外配置。
- `validated-default`：已确认默认约定足够。
- `validated-exception`：已确认需要例外，并完成理由文档化。
- `released`：构建、导出和发布清单已通过发布前检查。

### PublishedDependencyContract

`source-declared` → `publish-resolved` → `release-approved`

- `source-declared`：仍处于源码中的依赖声明。
- `publish-resolved`：已转换为最终发布产物中的对外版本表达。
- `release-approved`：通过发布前清单审查，可进入发版流程。
