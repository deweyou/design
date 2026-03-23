# 任务清单：按钮 Hover 反馈整理

## Phase 1：源码与样式

- [x] T001 在 `packages/components/src/button/index.tsx` 中移除 `animated` 公开属性与相关状态标记
- [x] T002 在 `packages/components/src/button/index.module.less` 中移除 `outlined` 额外描边动画实现
- [x] T003 在 `packages/components/src/button/index.module.less` 中将 `link` 下划线改为默认显现反馈并避免原生下划线叠加
- [x] T004 在 `packages/components/src/button/index.module.less` 中为 `outlined` 调整默认低色度 border 与 hover 颜色过渡

## Phase 2：测试

- [x] T005 在 `packages/components/src/button/index.test.ts` 中移除旧开关断言并覆盖新的 `link` / `outlined` 行为
- [x] T005A 在 `packages/components/src/button/index.test.ts` 中补充 `link` 的 `icon + text` 整行下划线覆盖断言
- [x] T006 在 `packages/components/tests/button-support-matrix.test.ts` 中更新默认支持矩阵断言
- [x] T007 在 `packages/components/tests/package-entrypoint.test.ts` 中移除 `animated` 类型示例

## Phase 3：评审面与文档

- [x] T008 在 `apps/storybook/src/stories/Button.stories.tsx` 中移除旧的 opt-in 动效说明并改为默认 hover 反馈展示
- [x] T009 在 `apps/website/src/main.tsx` 中移除 `animated` 示例并更新 hover 文案
- [x] T010 在 `packages/components/README.md` 中移除 `animated` 公开 API 说明
- [x] T011 在 `specs/20260323-button-hover-motion/` 中同步删除旧需求与实现描述

## Phase 4：验证

- [x] T012 运行 `vp check --fix`
- [x] T013 运行 `vp test`
- [x] T014 运行 `vp run storybook#build`
- [x] T015 运行 `vp run website#build`
