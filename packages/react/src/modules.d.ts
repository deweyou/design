declare module '*.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module './button/index.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module './popover/index.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module './text/index.module.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@deweyou-design/react/button' {
  export * from './button/index.tsx';
}

declare module '@deweyou-design/react/popover' {
  export * from './popover/index.tsx';
}

declare module '@deweyou-design/react/text' {
  export * from './text/index.tsx';
}
