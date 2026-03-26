# AGENTS

## 适用范围

适用于 `packages/hooks`。

## 约束

- 这里只放可复用的 React hooks。
- 不要把与框架无关的 helpers 挪进这个包。
- 每个 hook 都应放在 `src/<hook-name>/` 下，并包含 `index.ts` 和 `index.test.ts`。
- 导出的 hooks 和本地 helper 默认使用箭头函数。
- 优先使用标准 TSX/TypeScript 模式，不要引入绕路式的 React element factory 写法。
- hooks 可以依赖 `utils`，但不能依赖 `components`。
- 当 hook 已有 colocated 单测后，顶层 tests 只保留跨领域覆盖。
