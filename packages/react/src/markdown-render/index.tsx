import {
  cloneElement,
  createElement,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  isValidElement,
  type ReactNode,
} from 'react';
import classNames from 'classnames';
import { CheckIcon } from '@deweyou-design/react-icons';
import rehypeHighlight from 'rehype-highlight';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Separator } from '../separator/index.tsx';
import { ScrollArea } from '../scroll-area/index.tsx';
import { Text, type TextProps } from '../text/index.tsx';

import styles from './index.module.less';

export const markdownRenderSizeOptions = ['sm', 'md', 'lg'] as const;

export type MarkdownRenderSize = (typeof markdownRenderSizeOptions)[number];
export type MarkdownRenderComponents = Components;

export type MarkdownRenderProps = {
  value: string;
  size?: MarkdownRenderSize;
  components?: MarkdownRenderComponents;
  className?: string;
  style?: CSSProperties;
};

const extractLanguage = (className?: string) => {
  const match = /(?:^|\s)language-([^\s]+)/.exec(className ?? '');

  return match?.[1];
};

type MarkdownExtraProps = {
  node?: unknown;
};

type MarkdownCodeKind = 'block' | 'inline';

type MarkdownCodeProps = ComponentPropsWithoutRef<'code'> & {
  'data-markdown-code'?: MarkdownCodeKind;
};

const stripMarkdownExtraProps = <T extends object>(props: T): Omit<T, keyof MarkdownExtraProps> => {
  const { node: _node, ...domProps } = props as T & MarkdownExtraProps;

  return domProps;
};

const withMarkdownNode = <T extends object>(
  props: T,
  node: string,
): Omit<T, keyof MarkdownExtraProps> & { 'data-markdown-node': string } => ({
  ...stripMarkdownExtraProps(props),
  'data-markdown-node': node,
});

const withTextMarkdownNode = <T extends object>(props: T, node: string): TextProps =>
  withMarkdownNode(props, node) as TextProps;

const MarkdownParagraph = ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
  <p {...withMarkdownNode(props, 'p')} className={classNames(styles.paragraph, props.className)}>
    {children}
  </p>
);

const MarkdownHeading1 = ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
  <Text
    {...withTextMarkdownNode(props, 'h1')}
    className={classNames(styles.heading, props.className)}
    variant="h1"
  >
    {children}
  </Text>
);

const MarkdownHeading2 = ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
  <Text
    {...withTextMarkdownNode(props, 'h2')}
    className={classNames(styles.heading, props.className)}
    variant="h2"
  >
    {children}
  </Text>
);

const MarkdownHeading3 = ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
  <Text
    {...withTextMarkdownNode(props, 'h3')}
    className={classNames(styles.heading, props.className)}
    variant="h3"
  >
    {children}
  </Text>
);

const MarkdownHeading4 = ({ children, ...props }: ComponentPropsWithoutRef<'h4'>) => (
  <Text
    {...withTextMarkdownNode(props, 'h4')}
    className={classNames(styles.heading, props.className)}
    variant="h4"
  >
    {children}
  </Text>
);

const MarkdownHeading5 = ({ children, ...props }: ComponentPropsWithoutRef<'h5'>) => (
  <Text
    {...withTextMarkdownNode(props, 'h5')}
    className={classNames(styles.heading, props.className)}
    variant="h5"
  >
    {children}
  </Text>
);

const MarkdownHeading6 = ({ children, ...props }: ComponentPropsWithoutRef<'h6'>) => (
  <Text
    {...withTextMarkdownNode(props, 'h6')}
    className={classNames(styles.heading, props.className)}
    variant="h6"
  >
    {children}
  </Text>
);

const MarkdownLink = ({ children, href, rel, target, ...props }: ComponentPropsWithoutRef<'a'>) => {
  const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);
  const resolvedTarget = target ?? (isExternal ? '_blank' : undefined);
  const resolvedRel = rel ?? (isExternal ? 'noreferrer' : undefined);

  return (
    <a
      {...withMarkdownNode(props, 'a')}
      className={classNames(styles.link, props.className)}
      href={href}
      rel={resolvedRel}
      target={resolvedTarget}
    >
      {children}
    </a>
  );
};

const MarkdownImage = ({ alt, ...props }: ComponentPropsWithoutRef<'img'>) => (
  <img
    {...withMarkdownNode(props, 'img')}
    alt={alt ?? ''}
    className={classNames(styles.image, props.className)}
  />
);

const MarkdownBlockquote = ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
  <blockquote
    {...withMarkdownNode(props, 'blockquote')}
    className={classNames(styles.blockquote, props.className)}
  >
    {children}
  </blockquote>
);

const MarkdownUl = ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
  <ul
    {...withMarkdownNode(props, 'ul')}
    className={classNames(styles.list, styles.unorderedList, props.className)}
  >
    {children}
  </ul>
);

const MarkdownOl = ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
  <ol
    {...withMarkdownNode(props, 'ol')}
    className={classNames(styles.list, styles.orderedList, props.className)}
  >
    {children}
  </ol>
);

const MarkdownListItem = ({ children, className, ...props }: ComponentPropsWithoutRef<'li'>) => (
  <li {...withMarkdownNode(props, 'li')} className={classNames(styles.listItem, className)}>
    {children}
  </li>
);

const MarkdownTaskMarker = ({
  checked,
  className,
  disabled: _disabled,
  readOnly: _readOnly,
  type: _type,
  ...props
}: ComponentPropsWithoutRef<'input'>) => (
  <span
    {...withMarkdownNode(props, 'task-marker')}
    className={classNames(styles.taskMarker, className)}
    data-checked={checked ? 'true' : 'false'}
    data-markdown-task-marker="true"
  >
    <span className={styles.taskMarkerIndicator}>
      <CheckIcon aria-hidden="true" />
    </span>
    <span className={styles.taskMarkerState}>{checked ? 'Completed task' : 'Incomplete task'}</span>
  </span>
);

const MarkdownCode = ({
  children,
  className,
  'data-markdown-code': codeKindProp,
  ...props
}: MarkdownCodeProps) => {
  const language = extractLanguage(className);
  const codeKind = codeKindProp ?? (language === undefined ? 'inline' : 'block');

  return (
    <code
      {...withMarkdownNode(props, 'code')}
      className={classNames(codeKind === 'block' ? styles.code : styles.inlineCode, className)}
      data-markdown-code={codeKind}
      data-language={language}
    >
      {children}
    </code>
  );
};

const MarkdownPre = ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => {
  const child = Array.isArray(children) ? children[0] : children;
  const childProps =
    typeof child === 'object' && child !== null && 'props' in child
      ? (child.props as { className?: string })
      : undefined;
  const language = extractLanguage(childProps?.className);
  const blockChildren = isValidElement<MarkdownCodeProps>(child)
    ? cloneElement(child, { 'data-markdown-code': 'block' })
    : children;

  return (
    <ScrollArea.Root className={styles.codeScrollArea} data-testid="markdown-code-scroll-area">
      {language !== undefined && (
        <span
          aria-hidden="true"
          className={styles.codeLanguage}
          data-markdown-code-language-label="true"
        >
          {language}
        </span>
      )}
      <ScrollArea.Viewport className={styles.codeViewport}>
        <pre
          {...withMarkdownNode(props, 'pre')}
          className={classNames(styles.pre, props.className)}
          data-markdown-code="block"
          data-language={language}
        >
          {blockChildren}
        </pre>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};

const MarkdownTable = ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
  <div className={styles.tableScroller} data-markdown-node="table-wrapper">
    <ScrollArea.Root className={styles.tableScrollArea} data-testid="markdown-table-scroll-area">
      <ScrollArea.Viewport className={styles.tableViewport}>
        <table
          {...withMarkdownNode(props, 'table')}
          className={classNames(styles.table, props.className)}
        >
          {children}
        </table>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  </div>
);

const MarkdownHr = (props: ComponentPropsWithoutRef<'hr'>) => (
  <Separator
    {...stripMarkdownExtraProps(props)}
    className={classNames(styles.separator, props.className)}
    data-markdown-node="hr"
  />
);

const markdownNodeNames: Partial<Record<keyof Components, string>> = {
  a: 'a',
  blockquote: 'blockquote',
  code: 'code',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  hr: 'hr',
  img: 'img',
  input: 'task-marker',
  li: 'li',
  ol: 'ol',
  p: 'p',
  pre: 'pre',
  table: 'table',
  ul: 'ul',
};

const defaultComponents: MarkdownRenderComponents = {
  a: MarkdownLink,
  blockquote: MarkdownBlockquote,
  code: MarkdownCode,
  h1: MarkdownHeading1,
  h2: MarkdownHeading2,
  h3: MarkdownHeading3,
  h4: MarkdownHeading4,
  h5: MarkdownHeading5,
  h6: MarkdownHeading6,
  hr: MarkdownHr,
  img: MarkdownImage,
  input: MarkdownTaskMarker,
  li: MarkdownListItem,
  ol: MarkdownOl,
  p: MarkdownParagraph,
  pre: MarkdownPre,
  table: MarkdownTable,
  ul: MarkdownUl,
};

const mergeMarkdownComponents = (
  components?: MarkdownRenderComponents,
): MarkdownRenderComponents => {
  if (components === undefined) {
    return defaultComponents;
  }

  const merged: Record<string, Components[keyof Components]> = { ...defaultComponents };

  for (const [name, Component] of Object.entries(components) as [
    keyof Components,
    Components[keyof Components],
  ][]) {
    if (Component === undefined) {
      continue;
    }

    const markdownNodeName = markdownNodeNames[name] ?? String(name);

    merged[String(name)] = ((props: Record<string, unknown>) => {
      const domProps = stripMarkdownExtraProps(props);

      return createElement(Component as (props: Record<string, unknown>) => ReactNode, {
        ...domProps,
        'data-markdown-node': markdownNodeName,
      });
    }) as never;
  }

  return merged as MarkdownRenderComponents;
};

export const MarkdownRender = ({
  className,
  components,
  size = 'md',
  style,
  value,
}: MarkdownRenderProps) => (
  <div
    className={classNames(
      styles.root,
      styles[`size${size[0].toUpperCase()}${size.slice(1)}`],
      className,
    )}
    data-markdown-root="true"
    data-markdown-size={size}
    style={style}
  >
    <ReactMarkdown
      components={mergeMarkdownComponents(components)}
      rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
      remarkPlugins={[remarkGfm]}
    >
      {value}
    </ReactMarkdown>
  </div>
);

MarkdownRender.displayName = 'MarkdownRender';
