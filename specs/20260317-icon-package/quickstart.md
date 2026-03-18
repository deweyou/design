# 快速开始：为 UI 组件库新增图标包

## 目标

实现一个新的 `@deweyou-ui/icons` package，提供一套精选基础图标目录，将根级入口聚焦在泛型 `Icon` API 上，通过按图标 subpath 暴露命名图标组件，并在 Storybook 中可评审、在 website 中有完整文档。

## 建议实现顺序

1. 创建 `packages/icons`，补齐 package 元数据、构建配置、README、根级入口和与其他 workspace packages 一致的 package 本地测试配置。
2. 新增内部图标 registry 和基础 `Icon` 渲染器。
3. 基于同一 registry 新增初始基础图标目录项以及按图标 subpath 生成的导出。
4. 新增 package 测试，覆盖目录唯一性、运行时失败行为和无障碍语义。
5. 新增 Storybook stories，覆盖目录浏览、无标签 / 有标签使用、尺寸、主题和不支持图标名时的失败行为。
6. 新增 `apps/website` 的文档或精选 demo 内容，说明安装方式、使用模式和目录预期。

## 实现说明

- 初始基础目录以上游 `tdesign-icons-svg` 作为图标资产来源。
- 公开 package API 不暴露上游 package 的命名或文件结构。
- 默认情况下图标颜色应继承周围 UI 的颜色，从而与现有语义颜色 token 保持一致。
- 泛型 `Icon` 组件与 subpath 图标导出都应由同一 canonical registry 生成，以避免漂移。
- 对静态组件使用场景，优先推荐按图标 subpath 导入；泛型 `Icon` 组件主要用于动态图标查找。

## 验证

在仓库根目录运行：

```bash
vp check
vp test
vp run storybook#build
vp run website#build
```

## 完成检查清单

- `packages/icons` 能成功构建并通过测试。
- 基础图标目录具有稳定名称，并生成按图标 subpath 的导出。
- 不支持的图标名会显式失败。
- 无标签与有标签使用方式都被文档化并经过测试。
- `tdesign-icons-svg` 的来源说明在 package 与 website 文档中清晰可见。
- Storybook 与 website 都反映了新的图标 package 契约。
