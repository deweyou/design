import {
  cloneElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { CheckIcon, CopyIcon } from '@deweyou-design/react-icons';
import hljs from 'highlight.js/lib/common';

import { ScrollArea } from '../scroll-area/index.tsx';

import styles from './index.module.less';

export type CodeBlockSize = 'sm' | 'md';
type CodeBlockDataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};
type CodeBlockCodeProps = ComponentPropsWithoutRef<'code'> & CodeBlockDataAttributes;
type CodeBlockPreProps = ComponentPropsWithoutRef<'pre'> & CodeBlockDataAttributes;
export type CodeBlockToolbarVariant = 'floating' | 'header';
export type CodeBlockToolbarProps = ComponentPropsWithoutRef<'div'> &
  CodeBlockDataAttributes & {
    variant?: CodeBlockToolbarVariant;
  };
export type CodeBlockActionButtonProps = ComponentPropsWithoutRef<'button'> &
  CodeBlockDataAttributes & {
    active?: boolean;
    feedback?: boolean;
  };
export type CodeBlockLanguageButtonProps = ComponentPropsWithoutRef<'button'> &
  CodeBlockDataAttributes;
export type CodeBlockLanguageLabelProps = ComponentPropsWithoutRef<'span'> &
  CodeBlockDataAttributes;

export type CodeBlockCommonLanguage =
  | 'bash'
  | 'css'
  | 'html'
  | 'js'
  | 'json'
  | 'jsx'
  | 'less'
  | 'markdown'
  | 'md'
  | 'shell'
  | 'sh'
  | 'ts'
  | 'tsx'
  | 'typescript'
  | 'xml'
  | 'yaml'
  | 'yml';
export type CodeBlockLanguage = CodeBlockCommonLanguage | (string & {});
export type CodeBlockCopyDetails = {
  language?: CodeBlockLanguage;
  text: string;
};

export type CodeBlockProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children?: ReactNode;
  codeClassName?: string;
  codeProps?: CodeBlockCodeProps;
  /**
   * Enables the compact copy button in the top-right code actions.
   */
  copy?: boolean;
  /**
   * Language id used for the visible label and syntax highlighting.
   */
  language?: CodeBlockLanguage;
  /**
   * Called after the copy button writes code text to the Clipboard API.
   */
  onCopy?: (details: CodeBlockCopyDetails) => void;
  preClassName?: string;
  size?: CodeBlockSize;
  viewportClassName?: string;
};

type CodeBlockInternalProps = {
  languageLabelProps?: CodeBlockLanguageLabelProps;
  preProps?: CodeBlockPreProps;
};

export const CodeBlockToolbar = ({
  children,
  className,
  role = 'toolbar',
  variant = 'header',
  ...props
}: CodeBlockToolbarProps) => (
  <div
    {...props}
    className={classNames(
      styles.toolbar,
      variant === 'header' ? styles.headerToolbar : styles.floatingToolbar,
      className,
    )}
    data-code-block-actions="true"
    data-code-block-toolbar={variant}
    role={role}
  >
    {children}
  </div>
);

export const CodeBlockActionButton = ({
  active,
  children,
  className,
  feedback,
  type = 'button',
  ...props
}: CodeBlockActionButtonProps) => (
  <button
    {...props}
    className={classNames(styles.actionPill, styles.actionButton, className)}
    data-active={active ? 'true' : props['data-active']}
    data-code-block-action-button="true"
    data-feedback={feedback ? 'true' : props['data-feedback']}
    type={type}
  >
    {children}
  </button>
);

export const CodeBlockLanguageButton = ({
  children,
  className,
  type = 'button',
  ...props
}: CodeBlockLanguageButtonProps) => (
  <button
    {...props}
    className={classNames(styles.actionPill, styles.languageButton, className)}
    data-code-block-language-button="true"
    type={type}
  >
    {children}
  </button>
);

export const CodeBlockLanguageLabel = ({
  children,
  className,
  ...props
}: CodeBlockLanguageLabelProps) => (
  <span
    {...props}
    aria-hidden={props['aria-hidden'] ?? true}
    className={classNames(styles.actionPill, styles.language, className)}
    data-code-block-language-label="true"
  >
    {children}
  </span>
);

const isCodeElement = (node: ReactNode): node is ReactElement<CodeBlockCodeProps> =>
  isValidElement<CodeBlockCodeProps>(node);

const languageAliases: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
};

const normalizeHighlightLanguage = (language: string | undefined) => {
  if (!language) {
    return undefined;
  }

  return languageAliases[language.toLowerCase()] ?? language;
};

const getTextContent = (content: ReactNode): string => {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return '';
  }

  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }

  if (Array.isArray(content)) {
    return content.map(getTextContent).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(content)) {
    return getTextContent(content.props.children);
  }

  return '';
};

const highlightCode = (code: string, language: string | undefined) => {
  const normalizedLanguage = normalizeHighlightLanguage(language);

  if (!normalizedLanguage || !hljs.getLanguage(normalizedLanguage)) {
    return undefined;
  }

  return hljs.highlight(code, {
    ignoreIllegals: true,
    language: normalizedLanguage,
  }).value;
};

const CodeBlockBase = ({
  children,
  className,
  codeClassName,
  codeProps,
  copy = false,
  language,
  languageLabelProps,
  onCopy,
  preClassName,
  preProps,
  size = 'md',
  viewportClassName,
  ...props
}: CodeBlockProps & CodeBlockInternalProps) => {
  const resetCopiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const copyText = useMemo(() => getTextContent(children), [children]);
  const highlightedCode =
    typeof children === 'string' ? highlightCode(children, language) : undefined;
  const codeContent = isCodeElement(children) ? (
    cloneElement(children, {
      ...codeProps,
      className: classNames(
        styles.code,
        children.props.className,
        codeProps?.className,
        codeClassName,
      ),
      'data-language': language,
    })
  ) : (
    <code
      {...codeProps}
      className={classNames(
        styles.code,
        highlightedCode && 'hljs',
        language && `language-${language}`,
        codeProps?.className,
        codeClassName,
      )}
      data-language={language}
      {...(highlightedCode
        ? { dangerouslySetInnerHTML: { __html: highlightedCode } }
        : { children })}
    />
  );

  useEffect(() => {
    return () => {
      if (resetCopiedTimer.current) {
        clearTimeout(resetCopiedTimer.current);
      }
    };
  }, []);

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!copyText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setCopyStatus('Code copied');
      onCopy?.({ language, text: copyText });
    } catch {
      setCopied(false);
      setCopyStatus('Unable to copy code');
    }

    if (resetCopiedTimer.current) {
      clearTimeout(resetCopiedTimer.current);
    }

    resetCopiedTimer.current = setTimeout(() => {
      setCopied(false);
      setCopyStatus('');
    }, 1200);
  };

  const hasActions = language !== undefined || copy;
  const toolbarVariant: CodeBlockToolbarVariant = 'header';

  return (
    <ScrollArea.Root
      {...props}
      className={classNames(styles.root, styles[size], className)}
      data-language={language}
      data-code-block-toolbar={hasActions ? toolbarVariant : undefined}
      data-ui-code-block="true"
    >
      {hasActions && (
        <CodeBlockToolbar variant={toolbarVariant}>
          {language !== undefined ? (
            <CodeBlockLanguageLabel
              {...languageLabelProps}
              className={languageLabelProps?.className}
            >
              {language}
            </CodeBlockLanguageLabel>
          ) : (
            <span />
          )}
          {copy && (
            <span className={styles.headerActions}>
              <CodeBlockActionButton
                aria-label={copied ? 'Copied code' : 'Copy code'}
                className={styles.copyButton}
                data-code-block-copy="true"
                data-copied={copied ? 'true' : undefined}
                feedback={copied}
                onClick={handleCopy}
              >
                {copied ? <CheckIcon size="xs" /> : <CopyIcon size="xs" />}
              </CodeBlockActionButton>
            </span>
          )}
        </CodeBlockToolbar>
      )}
      {copy && (
        <span aria-live="polite" className={styles.copyStatus}>
          {copyStatus}
        </span>
      )}
      <ScrollArea.Viewport className={classNames(styles.viewport, viewportClassName)}>
        <pre
          {...preProps}
          className={classNames(styles.pre, preProps?.className, preClassName)}
          data-language={language}
        >
          {codeContent}
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

export const CodeBlock = CodeBlockBase as ((props: CodeBlockProps) => ReactElement) & {
  ActionButton: typeof CodeBlockActionButton;
  displayName?: string;
  LanguageButton: typeof CodeBlockLanguageButton;
  LanguageLabel: typeof CodeBlockLanguageLabel;
  Toolbar: typeof CodeBlockToolbar;
};

CodeBlock.ActionButton = CodeBlockActionButton;
CodeBlock.displayName = 'CodeBlock';
CodeBlock.LanguageButton = CodeBlockLanguageButton;
CodeBlock.LanguageLabel = CodeBlockLanguageLabel;
CodeBlock.Toolbar = CodeBlockToolbar;
