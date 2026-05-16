# 设计系统知识库索引

仓库知识库统一沉淀在 `docs/` 下。本目录只作为设计系统入口，避免把同一套规则拆散到多个互相矛盾的文档里。

## 必读文档

- [Deweyou 设计系统知识库](system.md) — 设计理念、内容语气、视觉语言、组件约束、website/H5 应用规则。
- [Ark UI 组件范式](../architecture/ark-ui.md) — 交互型组件的行为基础层、Portal、受控模式和样式边界。
- [包层级规则](../architecture/package-layers.md) — `styles`、`react`、`react-icons` 等 package 的职责和依赖方向。

## 理念速记

- 宋体是品牌身份，不是默认字体的偶然结果。
- 三个常规语义色：neutral、primary、danger；warning 只作为反馈类支持角色。
- 暖白/暖黑画布承载内容，避免纯白、渐变和装饰背景。
- 边框优先于阴影；卡片默认无 shadow，浮层才表达抬升。
- 图标统一收敛到 `@deweyou-design/react-icons`：Deweyou curated registry backed by `tdesign-icons-svg`，使用直接命名导入、语义化 size/color，icon-only action 交给 `IconButton` 等具备 accessible name 的控件；详见 [system.md#图标](system.md#图标)。
- 文案简体中文优先，技术性、克制、无 emoji，`·` 是系统内的签名分隔符。

## 修改设计相关代码时

1. 先读 [system.md](system.md)，确认这次改动是否触碰色彩、字体、圆角、状态、动效、图标或内容语气。
2. 若改动涉及复杂交互组件，再读 [../architecture/ark-ui.md](../architecture/ark-ui.md)。
3. 若需要新增 token、组件或 package 依赖，再读 [../architecture/package-layers.md](../architecture/package-layers.md)。
4. 如果 Claude Design handoff、Figma 或实际页面提出了新视觉方向，先把可泛化理念写回 `docs/design/system.md`，再落实现代码。

_Last updated: 2026-05-09 | Reason: aligned the design-system docs entry with Claude Design handoff and the docs/ knowledge-base convention._
