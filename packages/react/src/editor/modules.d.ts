declare module '*.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@deweyou-design/react/editor' {
  export * from './index.ts';
}
