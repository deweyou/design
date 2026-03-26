# AGENTS

## 适用范围

适用于 `packages/utils`。

## 约束

- 这个包必须保持与框架无关。
- 每个 util 都应放在 `src/<util-name>/` 的独立目录中。
- 受治理区域内的 util 目录和文件必须使用小写加连字符命名。
- 每个 util 的单测应与其目录 colocate，命名为 `index.test.ts`。
- 导出的 util 和本地 helper 默认使用箭头函数。
- 不要在这里加入 React、组件或 app 专属逻辑。
- 如果没有明确共享 util 需求，就保持包最小化，不要添加猜测性的 helper。
- `packages/utils/tests` 下的顶层测试保留给仓库级约定和结构检查。
