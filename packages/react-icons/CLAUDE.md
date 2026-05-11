# CLAUDE

## 适用范围

适用于 `packages/react-icons`。

## 约束

- 公开 package surface 仅限图标相关类型，以及命名的 `XxxIcon` 导出；不要恢复通用 `Icon` registry 或子路径生成体系。
- `tdesign-icons-svg` 是默认 SVG 资产来源，但只能通过 Deweyou 自己维护的 curated registry 读取，不要从上游 bulk generate。
- 上游 SVG 来源、registry、生成器和本地 SVG 资产必须保持在 `packages/react-icons` 内部。
- `aria-label` 是默认无障碍开关；不要增加单独的 `decorative` 或 `label` prop。
- `size` 和 `color` 必须对齐设计系统语义，保留常见 SVG props 透传。
- 图标默认颜色应通过 `currentColor` 继承外层 UI。
- 生成文件必须由 `scripts/generate-icons.mjs` 产生，不要手写修改 generated 文件。
- 单测应与源码单元同目录放置为 `index.test.ts` 或 `index.test.tsx`；tree-shaking contract 可作为 `tree-shaking.test.ts` 放在 `src/icons/`。
