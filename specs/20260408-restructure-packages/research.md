# 研究报告：重构 packages 结构

**日期**：2026-04-08  
**结论**：所有决策在 spec 阶段已确认，无需额外调研。

## 关键决定

### 包命名 scope

- **决定**：`@deweyou-design/*`
- **依据**：用户明确指定，与品牌名一致
- **替代方案**：`@deweyou-ui/*`（现状）— 不够清晰，ui 是目录名而非品牌名

### 图标包策略

- **决定**：`@deweyou-design/react-icons`，继续暴露 React 组件
- **依据**：命名诚实（React 专属），当前不需要多框架支持
- **替代方案**：`@deweyou-design/icons`（框架无关名）— 保留，但当前无多框架计划；SVG 拆包 — 工程量过大，收益不明

### hooks 独立发包

- **决定**：`@deweyou-design/react-hooks`，保持独立包
- **依据**：消费方可单独安装 hooks 而无需引入全部组件
- **替代方案**：合并进 react — 降低灵活性

### build 工具与 runtime 工具分层

- **决定**：`packages/infra`（`@deweyou-ui/infra`，不发布）vs `packages/utils`（`@deweyou-design/utils`，runtime）
- **依据**：原 `utils` 包含的是 manifest 操作逻辑，服务于 build，不是消费方的 runtime 依赖；分层后职责明确，防止后续混入 build 逻辑
- **替代方案**：保持 `utils` 名称混用 — 不可接受，已有混乱案例（hooks 的僵尸依赖）

## 技术约束

| 项目                         | 结论                                             |
| ---------------------------- | ------------------------------------------------ |
| pnpm-workspace.yaml          | 无需修改，`packages/*` 模式自动包含新目录名      |
| infra publishConfig          | 移除，pnpm publish 不会处理无 publishConfig 的包 |
| 引用更新顺序                 | 先 git mv 重命名目录 → 再批量更新引用 → 最后验证 |
| workspace-boundaries.test.ts | 需同步更新所有包名断言和路径读取                 |
