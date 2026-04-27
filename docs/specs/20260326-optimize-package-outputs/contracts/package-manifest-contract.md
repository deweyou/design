# 发布清单契约

## 适用范围

- `packages/components`
- `packages/hooks`
- `packages/icons`
- `packages/styles`
- `packages/utils`

## 契约规则

1. 所有拟发布包的最终清单中都不得暴露 `workspace:*`、`catalog:` 或其他仅适用于 monorepo 内部的版本占位符。
2. 运行时依赖 `react` 或 `react-dom` 的拟发布包，必须把这两项依赖表达为宿主负责安装的依赖契约。
3. 内部包之间的依赖在最终清单中必须解析为对外可安装的明确 semver 范围。
4. 开发期专用依赖不得误入对外运行时依赖清单。
5. 仅当默认约定无法满足公开入口、产物结构、样式资产或清单重写要求时，才允许保留包级专用构建配置；保留时必须记录理由。
6. 最终对外的 `exports`、`types` 与 `files` 必须指向可发布产物，而不是工作区专用源文件布局。

## 按包最小要求

### `packages/components`

- 提供根入口和组件子路径入口
- 对外清单中明确宿主 React 运行时责任
- 样式交付规则满足单组件直接消费

### `packages/hooks`

- 优先采用默认构建约定
- 对外清单中明确宿主 React 运行时责任

### `packages/icons`

- 保留多入口图标导出能力
- 对外清单中明确宿主 React 运行时责任

### `packages/styles`

- 可对外发布 CSS、Less 和相关静态资产
- 如需清单重写或资产复制，可作为例外配置保留

### `packages/utils`

- 优先采用默认构建约定
- 对外清单中不应引入无关的宿主 React 依赖

## 发布阻断条件

出现以下任一情况必须阻止发布：

- 最终清单仍包含 `workspace:*` 或 `catalog:`
- 运行时 React 依赖未转为宿主安装契约
- 内部包依赖未解析为外部可安装版本
- `exports`、`types` 或 `files` 指向不可发布路径
- 包级专用构建配置缺少例外原因说明
