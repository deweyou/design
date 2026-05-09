# CLAUDE

## 适用范围

适用于 `packages/react-icons`。

## 约束

- 公开 package surface 仅限图标相关类型，以及命名的 `XxxIcon` 导出；不要恢复通用 `Icon` registry 或子路径生成体系。
- 上游 `@tabler/icons-react` 的细节必须保持在 `packages/react-icons` 内部。
- `aria-label` 是唯一公开的无障碍开关；不要再增加单独的 `decorative` 或 `label` prop。
- 图标默认颜色应通过 `currentColor` 继承外层 UI。
- 图标集合必须保持 curated set；不要从上游 bulk generate。
- 单测应与源码单元同目录放置为 `index.test.ts` 或 `index.test.tsx`。
