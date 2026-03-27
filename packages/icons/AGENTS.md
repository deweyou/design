# AGENTS

## 适用范围

适用于 `packages/icons`。

## 约束

- 公开 package surface 仅限 `Icon`、图标相关类型，以及命名的 `XxxIcon` 导出。
- 上游资产包的细节必须保持在 `packages/icons` 内部。
- `label` 是唯一公开的无障碍开关；不要再增加单独的 `decorative` prop。
- 图标默认颜色应通过 `currentColor` 继承外层 UI。
- icon registry 必须作为支持名称和 named export 对齐关系的唯一事实来源。
- 单测应与源码单元同目录放置为 `index.test.ts` 或 `index.test.tsx`。
