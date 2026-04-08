// changelogen 配置：扩展默认 semver 映射
// 默认 refactor/chore/test 的 semver 为 null（不触发 bump），
// 这里将 refactor 设为 patch，确保重构类 commit 也能触发版本升级。
export default {
  types: {
    refactor: { title: '💅 Refactors', semver: 'patch' },
  },
};
