declare module '*.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@deweyou-design/editor/editor' {
  export * from './editor/index.tsx';
}
