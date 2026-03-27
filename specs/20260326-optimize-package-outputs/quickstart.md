# Quickstart：包构建与发布产物治理

## 1. 安装并校验工作区

```bash
vp install
vp check
vp test
```

预期结果：

- 工作区依赖安装完成
- 基础 lint、格式化、类型检查和测试可通过

## 2. 构建所有受影响包

```bash
vp run build -r
```

预期结果：

- `packages/components`、`packages/hooks`、`packages/icons`、`packages/styles`、`packages/utils` 均可构建
- 未因为清理冗余配置或调整依赖契约而破坏现有构建

## 3. 验证组件入口契约

检查点：

- `@deweyou-ui/components` 根入口仍可消费 `button`、`popover`、`text`
- `@deweyou-ui/components/<component-name>` 子路径入口可直接消费对应组件
- 子路径入口不要求额外导入组件专属样式入口

建议验证面：

- 在 `apps/website` 中添加或更新单组件消费示例
- 在 `apps/storybook` 中保留根入口兼容示例

## 4. 验证发布清单契约

检查点：

- 运行时依赖 React 的包已改为宿主安装契约
- 最终清单不再出现 `workspace:*`、`catalog:`
- 内部包依赖已转换为明确 semver 范围
- `exports`、`types`、`files` 指向可发布产物

## 5. 审核构建配置治理

检查点：

- `packages/hooks`、`packages/utils` 优先收敛到默认构建约定
- `packages/components`、`packages/icons`、`packages/styles` 若保留例外配置，必须在实现文档中说明原因
- 不再新增“只是为了复制现有包做法”的包级专用构建配置
