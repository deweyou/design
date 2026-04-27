# 归档：重构 packages 结构

**分支**：`20260408-restructure-packages`  
**完成时间**：2026-04-08  
**类型**：refactor

---

## 交付摘要

完成包结构重命名：`packages/components` → `packages/react`（`@deweyou-design/react`）、`packages/icons` → `packages/react-icons`（`@deweyou-design/react-icons`）、`packages/hooks` → `packages/react-hooks`（`@deweyou-design/react-hooks`）、`packages/styles` → 保留目录但 `name` 更新为 `@deweyou-design/styles`、原 `packages/utils`（build 工具）→ `packages/infra`（`@deweyou-ui/infra`，不发布），并新建空 `packages/utils`（`@deweyou-design/utils`）作为 runtime 工具落地点。所有 monorepo 内部引用、`workspace:*` 依赖和导入路径全部更新，`dist/package.json` 中不再出现版本占位符。在架构文档中新增包职责分层规则（`infra` = build 工具不发布，`utils` = 消费方可安装的 runtime 工具）。

---

## 关键决策

| 决策                    | 选择                                                             | 理由                                                             | 备选方案                 |
| ----------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| 包 scope                | `@deweyou-design/*`（消费方包），`@deweyou-ui/infra`（内部工具） | 发布面与内部工具明确区分，scope 语义清晰                         | 统一使用 `@deweyou-ui/*` |
| `infra` 是否发布        | 不发布                                                           | 纯 build 时工具，消费方不应依赖                                  | 发布为 `devDependency`   |
| 新建空 `packages/utils` | 建立占位结构                                                     | 为后续 runtime 工具提供固定落地点，防止将 build 工具混入 `utils` | 延后到有实际内容时再建   |

---

## 踩坑记录

- **问题**：`packages/react-hooks/package.json` 中遗留了对 `@deweyou-ui/utils`（已变为 `infra`）的僵尸依赖。  
  **解决方案**：重构分支开始时清理该僵尸依赖，并同步更新 `workspace-boundaries.test.ts` 中的对应断言。

---

## 可复用模式

- [包职责分层规则]：`infra`（monorepo build 工具，不发布）vs `utils`（消费方可安装 runtime 工具），新 build 脚本必须放 `infra`，不得放 `utils`，是本仓库后续新包的边界约定。

---

## 宪章反馈

- [ ] 无需更新

---

## 后续待办

- 无
