# 快速开始：建立统一颜色 token 体系

## 目标

在 `@deweyou-ui/styles` 中建立统一颜色基础设施：维护 26 个颜色家族、每个家族 11 个色阶，并补齐纯黑、纯白两个基础颜色；同时让现有品牌色、危险色、链接色、焦点色以及 `Text` 高亮语义都回归同一来源，并通过 Storybook 色卡 story 和 website 指导区完成评审与说明。

## 建议实现顺序

1. 在 `packages/styles/src/primitives/index.ts` 中把当前色卡提升为通用共享基础色卡，并新增纯黑、纯白两个基础颜色；如果需要引入新的通用导出命名，保留现有 text-specific 命名作为兼容 alias。
2. 在 `packages/styles/src/semantics/index.ts` 中重建语义主题色与消费层映射，明确品牌色、危险色、链接色、焦点色以及 `Text` 前景 / 背景语义变量都能追溯到共享基础色卡或基础黑白。
3. 在 `packages/styles/src/themes/index.ts` 中整理浅色 / 深色主题映射，保证语义角色切换主题后仍然保持连续。
4. 在 `packages/styles/src/index.ts` 与 `packages/styles/README.md` 中补充新的公开导出、颜色层级说明、兼容命名策略和“非必要不得新增特化 token”的治理规则。
5. 在 `packages/styles/tests/theme-outputs.test.ts` 中补充对完整色卡、纯黑白、语义主题色和兼容导出的断言。
6. 在 `packages/components/src/text/` 中移除任何仍然假定“色卡只属于 Text”的实现细节，确保 `Text` 继续通过稳定语义变量消费共享色卡映射结果。
7. 在 `packages/components/src/button/` 中确认 `neutral`、`primary`、`danger`、`link`、focus 等颜色路径都来自统一语义主题色，而不是残留私有颜色来源。
8. 在 `apps/storybook/src/stories/Color.stories.tsx` 中新增专门的色卡 story，覆盖完整色卡、纯黑白、现有主题色和 `Button` / `Text` 的代表性消费关系。
9. 在 `apps/website/src/main.tsx` 中补充颜色使用指导区，说明基础色卡、语义主题色、默认复用路径，以及为什么非必要不新增特化 token。

## 实现说明

- 共享基础色卡是颜色体系的唯一标准来源，但组件通常仍应优先消费语义主题色，而不是直接依赖原始色阶编号。
- 纯黑与纯白必须作为独立基础颜色维护，不能继续散落在各个主题对象或组件样式里。
- `Text` 的公开 `color` / `background` API 不应因为色卡泛化而扩张到直接暴露色阶编号。
- `Button` 的 `neutral`、`primary`、`danger` 等公开模式不应新增新的公开配置轴；本期重点是来源统一，而不是组件 API 扩张。
- 如果需要引入新的通用导出命名，应采用 additive-first 策略，避免为了泛化语义而立即移除当前 text-specific 导出。
- Storybook 色卡 story 是本期主评审面，website 负责公开指导，不需要复制完整矩阵。
- 非必要不得新增特化 token；任何例外都必须先证明共享基础色卡和现有语义主题色不足以满足需求。

## 验证

在仓库根目录运行：

```bash
vp check
vp test
vp run styles#build
vp run components#build
vp run storybook#build
vp run website#build
```

说明：

- `vp check` 和 `vp test` 覆盖工作区级格式、lint、类型和测试门禁。
- `vp run styles#build` 用于确认主题产物、公开导出和 less / css bridge 保持可发布。
- `vp run components#build` 用于确认 `Button` 和 `Text` 的消费路径在统一色源下仍能构建。
- `vp run storybook#build` 用于确认色卡 story 与内部评审面完整。
- `vp run website#build` 用于确认公开指导区和实际消费示例没有脱节。

## 完成检查清单

- `packages/styles` 已建立完整的共享基础色卡与纯黑白基础颜色。
- 现有品牌色、危险色、链接色、焦点色以及 `Text` 高亮语义都能追溯到统一来源。
- `Button` 与 `Text` 的颜色来源都已收敛到共享基础色卡或语义主题色。
- 不存在未经证明必要性的新增特化 token。
- Storybook 已新增专门的色卡 story。
- website 已新增或更新公开颜色指导区。
- `packages/styles/README.md` 已记录新的公开 surface 与治理规则。
