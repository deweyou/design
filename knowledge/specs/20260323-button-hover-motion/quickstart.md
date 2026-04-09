# Quickstart：按钮 Hover 反馈整理

## 实现检查

1. 在 `packages/components/src/button/index.tsx` 确认 `ButtonProps` 不再包含 `animated`。
2. 在 `packages/components/src/button/index.module.less` 确认：
   - `link` 使用自定义下划线显现
   - `link` 在 `icon + text` 组合下覆盖整条内容行
   - `outlined` 只做 border 颜色过渡
   - 不存在额外 outline 动画层
3. 在 `packages/components/src/button/index.test.ts` 与 `packages/components/tests/` 中确认旧开关断言已删除。

## 预览检查

1. 打开 Storybook 的 `Button` 相关 story，确认不再展示 `animated` 开关概念。
2. 打开 website 按钮示例，确认：
   - `link` 默认出现左到右下划线反馈
   - `outlined` 默认 border 更克制，hover 时平滑过渡到文字颜色

## 验证命令

```bash
vp check --fix
vp test
vp run storybook#build
vp run website#build
```
