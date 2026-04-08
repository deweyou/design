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

declare module '@deweyou-ui/components/button' {
  export * from './button/index.tsx';
}

declare module '@deweyou-ui/components/popover' {
  export * from './popover/index.tsx';
}

declare module '@deweyou-ui/components/text' {
  export * from './text/index.tsx';
}
