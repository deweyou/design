import {
  cloneElement,
  type ClipboardEvent,
  createElement,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import classNames from 'classnames';
import rehypeHighlight from 'rehype-highlight';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CheckboxMark } from '../checkbox-mark/index.tsx';
import { CodeBlock, type CodeBlockProps } from '../code-block/index.tsx';
import { MermaidRender } from '../mermaid-render/index.tsx';
import { Separator } from '../separator/index.tsx';
import { ScrollArea } from '../scroll-area/index.tsx';
import { Text, type TextProps } from '../text/index.tsx';

import styles from './index.module.less';
import { useMarkdownRenderLocaleText } from './locale/loader.ts';
import type { MarkdownRenderLocaleText } from './locale/types.ts';

export const markdownRenderSizeOptions = ['sm', 'md', 'lg'] as const;
const markdownRenderNodeNames = [
  'a',
  'blockquote',
  'code',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'table',
  'table-wrapper',
  'task-marker',
  'ul',
] as const;

export type MarkdownRenderSize = (typeof markdownRenderSizeOptions)[number];
export type MarkdownRenderNodeName = (typeof markdownRenderNodeNames)[number];
export type MarkdownRenderComponents = Components;
export type MarkdownRenderNodeAttributeValue = string | number | boolean | undefined;
export type MarkdownRenderNodeAttributes = {
  id?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  role?: string;
  tabIndex?: number;
  [key: `aria-${string}`]: MarkdownRenderNodeAttributeValue;
  [key: `data-${string}`]: MarkdownRenderNodeAttributeValue;
};
export type MarkdownRenderResolveNodeAttributes = (context: {
  node: MarkdownRenderNodeName;
  text: string;
  index: number;
}) => MarkdownRenderNodeAttributes | undefined;
export type MarkdownRenderLinkClickDetails = {
  event: MouseEvent<HTMLAnchorElement>;
  href: string | undefined;
  text: string;
  index: number;
};
export type MarkdownRenderCopyDetails = {
  event: ClipboardEvent<HTMLDivElement>;
  text: string;
};

export type MarkdownRenderProps = {
  value: string;
  size?: MarkdownRenderSize;
  components?: MarkdownRenderComponents;
  resolveNodeAttributes?: MarkdownRenderResolveNodeAttributes;
  onLinkClick?: (details: MarkdownRenderLinkClickDetails) => void;
  onCopy?: (details: MarkdownRenderCopyDetails) => void;
  localeText?: Partial<MarkdownRenderLocaleText>;
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
type MarkdownDataAttributes = {
  [key: `data-${string}`]: MarkdownRenderNodeAttributeValue;
};
type MarkdownCodeBlockProps = CodeBlockProps & {
  languageLabelProps?: ComponentPropsWithoutRef<'span'> & MarkdownDataAttributes;
  preProps?: ComponentPropsWithoutRef<'pre'> & MarkdownDataAttributes;
};

const MarkdownCodeBlock = CodeBlock as (props: MarkdownCodeBlockProps) => ReactElement;

type ResolveMarkdownNodeProps = <T extends object>(
  props: T,
  node: MarkdownRenderNodeName,
  children?: ReactNode,
) => Omit<T, keyof MarkdownExtraProps> & { 'data-markdown-node': MarkdownRenderNodeName };

const stripMarkdownExtraProps = <T extends object>(props: T): Omit<T, keyof MarkdownExtraProps> => {
  const { node: _node, ...domProps } = props as T & MarkdownExtraProps;

  return domProps;
};

const safeNodeAttributeNames = new Set(['id', 'className', 'style', 'title', 'role', 'tabIndex']);

const isSafeNodeAttributeName = (name: string) =>
  safeNodeAttributeNames.has(name) || name.startsWith('aria-') || name.startsWith('data-');

const pickSafeNodeAttributes = (
  attributes: MarkdownRenderNodeAttributes | undefined,
): MarkdownRenderNodeAttributes => {
  if (attributes === undefined) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(attributes).filter(([name, value]) => {
      return value !== undefined && isSafeNodeAttributeName(name);
    }),
  ) as MarkdownRenderNodeAttributes;
};

const getReactNodeText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getReactNodeText).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getReactNodeText(node.props.children);
  }

  return '';
};

const createMarkdownNodePropsResolver = (
  resolveNodeAttributes?: MarkdownRenderResolveNodeAttributes,
): ResolveMarkdownNodeProps => {
  const indexes = new Map<MarkdownRenderNodeName, number>();

  return <T extends object>(props: T, node: MarkdownRenderNodeName, children?: ReactNode) => {
    const domProps = stripMarkdownExtraProps(props);
    const index = indexes.get(node) ?? 0;

    indexes.set(node, index + 1);

    const resolvedAttributes = pickSafeNodeAttributes(
      resolveNodeAttributes?.({
        index,
        node,
        text: getReactNodeText(children),
      }),
    );
    const className = classNames(
      (domProps as { className?: string }).className,
      resolvedAttributes.className,
    );

    return {
      ...domProps,
      ...resolvedAttributes,
      ...(className === '' ? {} : { className }),
      'data-markdown-node': node,
    };
  };
};

const withTextMarkdownNode = <T extends object>(
  resolveMarkdownNodeProps: ResolveMarkdownNodeProps,
  props: T,
  node: MarkdownRenderNodeName,
  children: ReactNode,
): TextProps => resolveMarkdownNodeProps(props, node, children) as TextProps;

const createMarkdownParagraph =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'p', children);

    return (
      <p {...nodeProps} className={classNames(styles.paragraph, nodeProps.className)}>
        {children}
      </p>
    );
  };

const createMarkdownHeading1 =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => {
    const nodeProps = withTextMarkdownNode(resolveMarkdownNodeProps, props, 'h1', children);

    return (
      <Text {...nodeProps} className={classNames(styles.heading, nodeProps.className)} variant="h1">
        {children}
      </Text>
    );
  };

const createMarkdownHeading2 =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => {
    const nodeProps = withTextMarkdownNode(resolveMarkdownNodeProps, props, 'h2', children);

    return (
      <Text {...nodeProps} className={classNames(styles.heading, nodeProps.className)} variant="h2">
        {children}
      </Text>
    );
  };

const createMarkdownHeading3 =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => {
    const nodeProps = withTextMarkdownNode(resolveMarkdownNodeProps, props, 'h3', children);

    return (
      <Text {...nodeProps} className={classNames(styles.heading, nodeProps.className)} variant="h3">
        {children}
      </Text>
    );
  };

const createMarkdownHeading4 =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'h4'>) => {
    const nodeProps = withTextMarkdownNode(resolveMarkdownNodeProps, props, 'h4', children);

    return (
      <Text {...nodeProps} className={classNames(styles.heading, nodeProps.className)} variant="h4">
        {children}
      </Text>
    );
  };

const createMarkdownHeading5 =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'h5'>) => {
    const nodeProps = withTextMarkdownNode(resolveMarkdownNodeProps, props, 'h5', children);

    return (
      <Text {...nodeProps} className={classNames(styles.heading, nodeProps.className)} variant="h5">
        {children}
      </Text>
    );
  };

const createMarkdownHeading6 =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'h6'>) => {
    const nodeProps = withTextMarkdownNode(resolveMarkdownNodeProps, props, 'h6', children);

    return (
      <Text {...nodeProps} className={classNames(styles.heading, nodeProps.className)} variant="h6">
        {children}
      </Text>
    );
  };

const createMarkdownLink = (
  resolveMarkdownNodeProps: ResolveMarkdownNodeProps,
  onLinkClick?: MarkdownRenderProps['onLinkClick'],
) => {
  let linkIndex = 0;

  return ({ children, href, rel, target, ...props }: ComponentPropsWithoutRef<'a'>) => {
    const index = linkIndex;

    linkIndex += 1;

    const text = getReactNodeText(children);
    const isExternal = typeof href === 'string' && /^https?:\/\//.test(href);
    const resolvedTarget = target ?? (isExternal ? '_blank' : undefined);
    const resolvedRel = rel ?? (isExternal ? 'noreferrer' : undefined);
    const nodeProps = resolveMarkdownNodeProps(props, 'a', children);

    return (
      <a
        {...nodeProps}
        className={classNames(styles.link, nodeProps.className)}
        href={href}
        onClick={(event) => {
          onLinkClick?.({
            event,
            href,
            index,
            text,
          });
        }}
        rel={resolvedRel}
        target={resolvedTarget}
      >
        {children}
      </a>
    );
  };
};

const createMarkdownImage =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ alt, ...props }: ComponentPropsWithoutRef<'img'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'img', alt);

    return (
      <img
        {...nodeProps}
        alt={alt ?? ''}
        className={classNames(styles.image, nodeProps.className)}
        decoding={nodeProps.decoding ?? 'async'}
        loading={nodeProps.loading ?? 'lazy'}
      />
    );
  };

const createMarkdownBlockquote =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'blockquote', children);

    return (
      <blockquote {...nodeProps} className={classNames(styles.blockquote, nodeProps.className)}>
        {children}
      </blockquote>
    );
  };

const createMarkdownUl =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'ul', children);

    return (
      <ul
        {...nodeProps}
        className={classNames(styles.list, styles.unorderedList, nodeProps.className)}
      >
        {children}
      </ul>
    );
  };

const createMarkdownOl =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'ol', children);

    return (
      <ol
        {...nodeProps}
        className={classNames(styles.list, styles.orderedList, nodeProps.className)}
      >
        {children}
      </ol>
    );
  };

const createMarkdownListItem =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'li', children);

    return (
      <li {...nodeProps} className={classNames(styles.listItem, nodeProps.className)}>
        {children}
      </li>
    );
  };

const createMarkdownTaskMarker =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps, localeText: MarkdownRenderLocaleText) =>
  ({
    checked,
    disabled: _disabled,
    readOnly: _readOnly,
    type: _type,
    ...props
  }: ComponentPropsWithoutRef<'input'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'task-marker', checked ? 'true' : 'false');

    return (
      <CheckboxMark
        {...nodeProps}
        aria-checked={checked ? 'true' : 'false'}
        className={classNames(styles.taskMarker, nodeProps.className)}
        data-checked={checked ? 'true' : 'false'}
        data-markdown-task-marker="true"
        data-readonly="true"
        role="checkbox"
        state={checked ? 'checked' : 'unchecked'}
        stateLabel={checked ? localeText.completedTask : localeText.incompleteTask}
      />
    );
  };

const createMarkdownCode =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, className, 'data-markdown-code': codeKindProp, ...props }: MarkdownCodeProps) => {
    const language = extractLanguage(className);
    const codeKind = codeKindProp ?? (language === undefined ? 'inline' : 'block');
    const nodeProps = resolveMarkdownNodeProps({ ...props, className }, 'code', children);

    return (
      <code
        {...nodeProps}
        className={classNames(
          codeKind === 'block' ? styles.code : styles.inlineCode,
          nodeProps.className,
        )}
        data-markdown-code={codeKind}
        data-language={language}
      >
        {children}
      </code>
    );
  };

const createMarkdownPre =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => {
    const child = Array.isArray(children) ? children[0] : children;
    const childProps =
      typeof child === 'object' && child !== null && 'props' in child
        ? (child.props as { className?: string })
        : undefined;
    const language = extractLanguage(childProps?.className);
    const blockChildren = isValidElement<MarkdownCodeProps>(child)
      ? cloneElement(child, { 'data-markdown-code': 'block' })
      : children;
    const nodeProps = resolveMarkdownNodeProps(props, 'pre', children);
    const codeValue =
      childProps === undefined
        ? getReactNodeText(children).replace(/\n$/, '')
        : getReactNodeText(
            (child as ReactElement<{ children?: ReactNode }>).props.children,
          ).replace(/\n$/, '');

    if (language === 'mermaid') {
      return (
        <div
          {...(nodeProps as ComponentPropsWithoutRef<'div'>)}
          className={classNames(styles.mermaidBlock, nodeProps.className)}
          data-language={language}
        >
          <MermaidRender value={codeValue} />
        </div>
      );
    }

    return (
      <MarkdownCodeBlock
        className={styles.codeBlock}
        copy
        data-testid="markdown-code-scroll-area"
        language={language}
        languageLabelProps={{ 'data-markdown-code-language-label': 'true' }}
        preProps={{
          ...nodeProps,
          className: nodeProps.className,
          'data-markdown-code': 'block',
          'data-language': language,
        }}
      >
        {blockChildren}
      </MarkdownCodeBlock>
    );
  };

const createMarkdownTable =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => {
    const wrapperProps = resolveMarkdownNodeProps(
      {} as { className?: string },
      'table-wrapper',
      children,
    );
    const nodeProps = resolveMarkdownNodeProps(props, 'table', children);

    return (
      <div {...wrapperProps} className={classNames(styles.tableScroller, wrapperProps.className)}>
        <ScrollArea.Root
          className={styles.tableScrollArea}
          data-testid="markdown-table-scroll-area"
        >
          <ScrollArea.Viewport className={styles.tableViewport}>
            <table {...nodeProps} className={classNames(styles.table, nodeProps.className)}>
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
  };

const createMarkdownHr =
  (resolveMarkdownNodeProps: ResolveMarkdownNodeProps) =>
  (props: ComponentPropsWithoutRef<'hr'>) => {
    const nodeProps = resolveMarkdownNodeProps(props, 'hr');

    return (
      <Separator {...nodeProps} className={classNames(styles.separator, nodeProps.className)} />
    );
  };

const createDefaultComponents = (
  resolveMarkdownNodeProps: ResolveMarkdownNodeProps,
  localeText: MarkdownRenderLocaleText,
  onLinkClick?: MarkdownRenderProps['onLinkClick'],
): MarkdownRenderComponents => ({
  a: createMarkdownLink(resolveMarkdownNodeProps, onLinkClick),
  blockquote: createMarkdownBlockquote(resolveMarkdownNodeProps),
  code: createMarkdownCode(resolveMarkdownNodeProps),
  h1: createMarkdownHeading1(resolveMarkdownNodeProps),
  h2: createMarkdownHeading2(resolveMarkdownNodeProps),
  h3: createMarkdownHeading3(resolveMarkdownNodeProps),
  h4: createMarkdownHeading4(resolveMarkdownNodeProps),
  h5: createMarkdownHeading5(resolveMarkdownNodeProps),
  h6: createMarkdownHeading6(resolveMarkdownNodeProps),
  hr: createMarkdownHr(resolveMarkdownNodeProps),
  img: createMarkdownImage(resolveMarkdownNodeProps),
  input: createMarkdownTaskMarker(resolveMarkdownNodeProps, localeText),
  li: createMarkdownListItem(resolveMarkdownNodeProps),
  ol: createMarkdownOl(resolveMarkdownNodeProps),
  p: createMarkdownParagraph(resolveMarkdownNodeProps),
  pre: createMarkdownPre(resolveMarkdownNodeProps),
  table: createMarkdownTable(resolveMarkdownNodeProps),
  ul: createMarkdownUl(resolveMarkdownNodeProps),
});

const markdownNodeNames: Partial<Record<keyof Components, MarkdownRenderNodeName>> = {
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

const mergeMarkdownComponents = (
  defaultComponents: MarkdownRenderComponents,
  resolveMarkdownNodeProps: ResolveMarkdownNodeProps,
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

    const markdownNodeName = markdownNodeNames[name] ?? (String(name) as MarkdownRenderNodeName);

    merged[String(name)] = ((props: Record<string, unknown>) => {
      const resolvedProps = resolveMarkdownNodeProps(
        props,
        markdownNodeName,
        (props as { children?: ReactNode }).children,
      );

      return createElement(Component as (props: Record<string, unknown>) => ReactNode, {
        ...resolvedProps,
      });
    }) as never;
  }

  return merged as MarkdownRenderComponents;
};

export const MarkdownRender = ({
  className,
  components,
  localeText,
  onCopy,
  onLinkClick,
  resolveNodeAttributes,
  size = 'md',
  style,
  value,
}: MarkdownRenderProps) => {
  const text = useMarkdownRenderLocaleText(localeText);
  const resolveMarkdownNodeProps = createMarkdownNodePropsResolver(resolveNodeAttributes);
  const defaultComponents = createDefaultComponents(resolveMarkdownNodeProps, text, onLinkClick);

  return (
    <div
      className={classNames(
        styles.root,
        styles[`size${size[0].toUpperCase()}${size.slice(1)}`],
        className,
      )}
      data-markdown-root="true"
      data-markdown-size={size}
      onCopy={(event) => {
        onCopy?.({
          event,
          text: event.currentTarget.textContent ?? '',
        });
      }}
      style={style}
    >
      <ReactMarkdown
        components={mergeMarkdownComponents(
          defaultComponents,
          resolveMarkdownNodeProps,
          components,
        )}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        remarkPlugins={[remarkGfm]}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
};

MarkdownRender.displayName = 'MarkdownRender';

export type { MarkdownRenderLocaleText } from './locale/types.ts';
