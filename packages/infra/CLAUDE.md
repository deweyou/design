# CLAUDE

## 适用范围

适用于 `packages/infra`。

## 约束

- 这个包是 monorepo 的 **build-time 专用工具**，不对外发布，消费方不应安装。
- 只放服务于构建流程的工具逻辑（manifest 处理、发布脚本、构建辅助等）。
- 不要在这里加入 React、组件或 app 专属逻辑，也不要加入消费方 runtime 需要的 util。
- 受治理区域内的目录和文件必须使用小写加连字符命名。
- 导出的 util 和本地 helper 默认使用箭头函数。
- `packages/infra/tests` 下的顶层测试保留给仓库级约定和结构检查。
