import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { CheckIcon, LinkIcon, LinkUnlinkIcon, XIcon } from '@deweyou-design/react-icons';
import { $createLinkNode, $isLinkNode, $toggleLink, LinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $findMatchingParent } from '@lexical/utils';
import {
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  type NodeKey,
  type LexicalNode,
} from 'lexical';

import {
  createEditorPlugin,
  type EditorActionStateContext,
  type EditorCommandContext,
} from '../../core/index.js';
import { isLexicalRuntime } from '../../runtime/lexical.js';
import { useLinkPluginLocaleText } from './locale/loader.ts';
import type { LinkPluginLocaleText } from './locale/types.ts';

import styles from '../toolbar/index.module.less';

export type LinkCommandPayload = {
  position?: LinkUrlPromptPosition;
  requestUrl?: boolean;
  url?: string;
};

export type LinkUrlRequestDetails = {
  currentText?: string;
  currentUrl?: string;
  defaultText?: string;
  defaultUrl: string;
  position?: LinkUrlPromptPosition;
};

export type LinkUrlRequestResult = string | null | undefined | Promise<string | null | undefined>;

export type LinkPluginOptions = {
  defaultUrl?: string;
  localeText?: Partial<LinkPluginLocaleText>;
  requestUrl?: (details: LinkUrlRequestDetails) => LinkUrlRequestResult;
};

const defaultUrl = 'https://example.com';

const isLinkCommandPayload = (payload: unknown): payload is LinkCommandPayload =>
  typeof payload === 'object' && payload !== null;

const normalizeUrl = (url: string | null | undefined) => {
  const nextUrl = url?.trim();

  return nextUrl ? nextUrl : undefined;
};

const normalizeText = (text: string | null | undefined) => {
  const nextText = text?.trim();

  return nextText ? nextText : undefined;
};

const validLinkProtocols = new Set(['http:', 'https:', 'mailto:', 'sms:', 'tel:']);

const isValidLinkUrl = (url: string) => {
  try {
    return validLinkProtocols.has(new URL(url).protocol);
  } catch {
    return false;
  }
};

const requestLinkUrl = (
  { currentUrl, defaultUrl: nextDefaultUrl }: LinkUrlRequestDetails,
  promptLabel: string,
) => {
  if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
    return nextDefaultUrl;
  }

  return window.prompt(promptLabel, currentUrl ?? nextDefaultUrl);
};

type LinkEntityRequestResult =
  | {
      action?: 'apply';
      text?: string | null;
      url?: string | null;
    }
  | {
      action: 'unlink';
    };

type LinkValidationError = {
  field: 'text' | 'url';
  reason: 'invalid' | 'required';
};

type LinkEntityRequestHandler = (
  details: LinkUrlRequestDetails,
) => Promise<LinkEntityRequestResult | null | undefined>;

type LinkUrlRequestController = {
  request: LinkEntityRequestHandler;
  setFallbackPromptLabel: (label: string) => void;
  subscribe: (handler: LinkEntityRequestHandler) => () => void;
};

type LinkUrlPromptPosition = {
  bottom?: number;
  left: number;
  selection?: {
    bottom: number;
    left: number;
    top: number;
  };
  top: number;
};

type LinkUrlPromptRequest = {
  canUnlink: boolean;
  initialText: string;
  initialUrl: string;
  position: LinkUrlPromptPosition;
  resolve: (result: LinkEntityRequestResult | null | undefined) => void;
};

type ResolvedLinkPluginOptions = {
  defaultUrl: string;
  requestLinkEntity: LinkEntityRequestHandler;
};

const viewportPadding = 12;
const linkPromptEstimatedBlockSize = 160;

const getClampedLinkPromptPosition = (
  left: number,
  preferredTop: number,
): LinkUrlPromptPosition => {
  const maxTop = Math.max(viewportPadding, window.innerHeight - linkPromptEstimatedBlockSize);

  return {
    left: Math.min(Math.max(left, viewportPadding), window.innerWidth - viewportPadding),
    top: Math.min(Math.max(preferredTop, viewportPadding), maxTop),
  };
};

const getLinkUrlPromptPositionFromElement = (element: HTMLElement): LinkUrlPromptPosition => {
  const rect = element.getBoundingClientRect();
  const topAboveElement = rect.top - linkPromptEstimatedBlockSize - viewportPadding;

  return getClampedLinkPromptPosition(
    rect.left + rect.width / 2,
    topAboveElement >= viewportPadding ? topAboveElement : rect.bottom + viewportPadding,
  );
};

const getClampedLinkPromptPositionFromAnchor = ({
  bottom,
  left,
  selection,
  top,
}: LinkUrlPromptPosition): LinkUrlPromptPosition => {
  if (bottom === undefined) {
    return getClampedLinkPromptPosition(left, top);
  }

  const topAlignedToAnchorBottom = bottom - linkPromptEstimatedBlockSize;
  const fallbackTop = selection ? selection.bottom + viewportPadding : bottom + viewportPadding;

  return getClampedLinkPromptPosition(
    left,
    topAlignedToAnchorBottom >= viewportPadding ? topAlignedToAnchorBottom : fallbackTop,
  );
};

const getLinkUrlPromptPosition = (): LinkUrlPromptPosition => {
  if (typeof window === 'undefined') {
    return { left: 0, top: 0 };
  }

  const selection = window.getSelection();
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined;
  const rect =
    range && typeof range.getBoundingClientRect === 'function'
      ? range.getBoundingClientRect()
      : undefined;

  if (rect && (rect.width > 0 || rect.height > 0)) {
    return getClampedLinkPromptPosition(rect.left + rect.width / 2, rect.bottom + viewportPadding);
  }

  return {
    left: window.innerWidth / 2,
    top: 72,
  };
};

const createLinkUrlRequestController = (): LinkUrlRequestController => {
  let activeHandler: LinkEntityRequestHandler | undefined;
  let fallbackPromptLabel = 'Link URL';

  return {
    request: async (details) =>
      activeHandler?.(details) ?? {
        text: details.currentText ?? details.defaultText,
        url: await Promise.resolve(requestLinkUrl(details, fallbackPromptLabel)),
      },
    setFallbackPromptLabel: (label) => {
      fallbackPromptLabel = label;
    },
    subscribe: (handler) => {
      activeHandler = handler;

      return () => {
        if (activeHandler === handler) {
          activeHandler = undefined;
        }
      };
    },
  };
};

const getLinkNode = (node: LexicalNode) =>
  $isLinkNode(node) ? node : $findMatchingParent(node, $isLinkNode);

const getAnchorElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return undefined;
  }

  return target.closest('a[href]') as HTMLAnchorElement | null;
};

const getSelectedLinkNode = () => {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    return (
      getLinkNode(selection.anchor.getNode()) ??
      selection
        .getNodes()
        .map(getLinkNode)
        .find((node) => node)
    );
  }

  if ($isNodeSelection(selection)) {
    return selection
      .getNodes()
      .map(getLinkNode)
      .find((node) => node);
  }

  return undefined;
};

const getSelectedTextContent = () => {
  const selection = $getSelection();

  if ($isRangeSelection(selection) && !selection.isCollapsed()) {
    const selectedText = normalizeText(selection.getTextContent());

    if (selectedText) {
      return selectedText;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    if (anchorNode === focusNode && $isTextNode(anchorNode)) {
      const startOffset = Math.min(selection.anchor.offset, selection.focus.offset);
      const endOffset = Math.max(selection.anchor.offset, selection.focus.offset);

      return normalizeText(anchorNode.getTextContent().slice(startOffset, endOffset));
    }
  }

  return normalizeText(getSelectedLinkNode()?.getTextContent());
};

const isLinkSelectionActive = ({ runtime }: EditorActionStateContext) => {
  if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
    return false;
  }

  return Boolean(getSelectedLinkNode());
};

const resolveLinkUrl =
  (
    payload: unknown,
    {
      currentUrl,
      currentText,
      defaultUrl: nextDefaultUrl,
      requestLinkEntity,
    }: LinkUrlRequestDetails & ResolvedLinkPluginOptions,
  ) =>
  async () => {
    if (isLinkCommandPayload(payload) && payload.url !== undefined) {
      const url = normalizeUrl(payload.url);

      return url ? { text: currentText, url } : undefined;
    }

    if (isLinkCommandPayload(payload) && payload.requestUrl) {
      return requestLinkEntity({
        currentText,
        currentUrl,
        defaultText: currentText,
        defaultUrl: nextDefaultUrl,
        position: payload.position,
      });
    }

    return { text: currentText, url: nextDefaultUrl };
  };

const createLinkNodeWithText = (url: string, text: string) => {
  const linkNode = $createLinkNode(url);

  linkNode.append($createTextNode(text));

  return linkNode;
};

const unwrapLinkNode = (linkNode: LinkNode) => {
  linkNode.getChildren().forEach((child) => {
    linkNode.insertBefore(child);
  });
  linkNode.remove();
};

const updateLinkNode = (linkNode: LinkNode, url: string, text: string) => {
  linkNode.setURL(url);

  const textNode = linkNode.getChildren().find((child) => $isTextNode(child));

  if (textNode && $isTextNode(textNode)) {
    textNode.setTextContent(text);
    return;
  }

  linkNode.append($createTextNode(text));
};

const runInsertLinkCommand =
  (options: ResolvedLinkPluginOptions) =>
  async ({ runtime }: EditorCommandContext, payload: unknown) => {
    if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
      return;
    }

    const { editor } = runtime.handle;
    const { currentText, currentUrl, selectionBeforeRequest } = editor.getEditorState().read(() => {
      const selection = $getSelection();

      return {
        currentText: getSelectedTextContent(),
        currentUrl: getSelectedLinkNode()?.getURL(),
        selectionBeforeRequest: selection?.clone() ?? null,
      };
    });
    const result = await resolveLinkUrl(payload, { ...options, currentText, currentUrl })();

    if (result?.action === 'unlink') {
      editor.update(() => {
        if (selectionBeforeRequest) {
          $setSelection(selectionBeforeRequest.clone());
        }

        $toggleLink(null);
      });
      return;
    }

    const nextUrl = normalizeUrl(result?.url);

    if (!nextUrl || !isValidLinkUrl(nextUrl)) {
      return;
    }

    const nextText = normalizeText(result?.text) ?? normalizeText(currentText) ?? nextUrl;

    editor.update(() => {
      if (selectionBeforeRequest) {
        $setSelection(selectionBeforeRequest.clone());
      }

      const selection = $getSelection();

      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        selection.insertNodes([createLinkNodeWithText(nextUrl, nextText)]);
        return;
      }

      if ($isRangeSelection(selection)) {
        $toggleLink(nextUrl);

        const linkNode = getSelectedLinkNode();

        if (linkNode && nextText !== currentText) {
          updateLinkNode(linkNode, nextUrl, nextText);
        }
      }
    });
  };

const runUnlinkCommand = ({ runtime }: EditorCommandContext) => {
  if (!isLexicalRuntime(runtime) || !runtime.handle.editor) {
    return;
  }

  runtime.handle.editor.update(() => {
    $toggleLink(null);
  });
};

const LinkUrlPromptPlugin = ({
  controller,
  localeText,
}: {
  controller: LinkUrlRequestController;
  localeText?: Partial<LinkPluginLocaleText>;
}) => {
  const resolvedLocaleText = useLinkPluginLocaleText(localeText);
  const textInputId = useId();
  const urlInputId = useId();
  const validationMessageId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [request, setRequest] = useState<LinkUrlPromptRequest | undefined>(undefined);
  const [validationError, setValidationError] = useState<LinkValidationError | undefined>(
    undefined,
  );

  const close = useCallback(
    (result: LinkEntityRequestResult | null | undefined) => {
      if (!request) {
        return;
      }

      request.resolve(result);
      setValidationError(undefined);
      setRequest(undefined);
    },
    [request],
  );

  useEffect(() => {
    controller.setFallbackPromptLabel(resolvedLocaleText.linkUrl);
  }, [controller, resolvedLocaleText.linkUrl]);

  useEffect(() => {
    return controller.subscribe(
      (details) =>
        new Promise((resolve) => {
          setValidationError(undefined);
          setRequest({
            canUnlink: Boolean(details.currentUrl),
            initialText:
              normalizeText(details.currentText) ?? normalizeText(details.defaultText) ?? '',
            initialUrl: details.currentUrl ?? details.defaultUrl,
            position: details.position
              ? getClampedLinkPromptPositionFromAnchor(details.position)
              : getLinkUrlPromptPosition(),
            resolve,
          });
        }),
    );
  }, [controller]);

  useEffect(() => {
    if (!request) {
      return;
    }

    urlInputRef.current?.focus();
    urlInputRef.current?.select();
  }, [request]);

  useEffect(() => {
    if (!request || typeof document === 'undefined') {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && formRef.current?.contains(target)) {
        return;
      }

      close(undefined);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [close, request]);

  if (!request) {
    return null;
  }

  const validateSubmission = (): LinkValidationError | undefined => {
    const nextText = normalizeText(textInputRef.current?.value);
    const nextUrl = normalizeUrl(urlInputRef.current?.value);

    if (!nextText) {
      return { field: 'text', reason: 'required' };
    }

    if (!nextUrl) {
      return { field: 'url', reason: 'required' };
    }

    if (!isValidLinkUrl(nextUrl)) {
      return { field: 'url', reason: 'invalid' };
    }

    return undefined;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextError = validateSubmission();

    if (nextError) {
      setValidationError(nextError);

      if (nextError.field === 'text') {
        textInputRef.current?.focus();
      } else {
        urlInputRef.current?.focus();
      }

      return;
    }

    close({
      action: 'apply',
      text: textInputRef.current?.value,
      url: urlInputRef.current?.value,
    });
  };
  const textHasError = validationError?.field === 'text';
  const urlHasError = validationError?.field === 'url';
  const validationMessage = validationError
    ? validationError.field === 'text'
      ? resolvedLocaleText.enterLinkText
      : validationError.reason === 'invalid'
        ? resolvedLocaleText.enterValidUrl
        : resolvedLocaleText.enterLinkUrl
    : undefined;
  const clearValidationError = () => {
    if (validationError) {
      setValidationError(undefined);
    }
  };

  return (
    <form
      aria-label={resolvedLocaleText.linkEditor}
      className={styles.linkPrompt}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close(undefined);
        }
      }}
      onSubmit={handleSubmit}
      ref={formRef}
      noValidate
      style={
        {
          '--editor-link-prompt-left': `${request.position.left}px`,
          '--editor-link-prompt-top': `${request.position.top}px`,
        } as CSSProperties
      }
    >
      <div className={styles.linkField}>
        <label className={styles.linkLabel} htmlFor={textInputId}>
          <span>{resolvedLocaleText.text}</span>
          {textHasError ? (
            <span className={styles.linkFieldError} id={validationMessageId} role="alert">
              {validationMessage}
            </span>
          ) : null}
        </label>
        <input
          aria-describedby={textHasError ? validationMessageId : undefined}
          aria-invalid={textHasError ? 'true' : undefined}
          aria-label={resolvedLocaleText.linkText}
          className={styles.linkInput}
          defaultValue={request.initialText}
          id={textInputId}
          onChange={clearValidationError}
          placeholder={resolvedLocaleText.text}
          ref={textInputRef}
          required
        />
      </div>
      <div className={styles.linkField}>
        <label className={styles.linkLabel} htmlFor={urlInputId}>
          <span>{resolvedLocaleText.url}</span>
          {urlHasError ? (
            <span className={styles.linkFieldError} id={validationMessageId} role="alert">
              {validationMessage}
            </span>
          ) : null}
        </label>
        <input
          aria-describedby={urlHasError ? validationMessageId : undefined}
          aria-invalid={urlHasError ? 'true' : undefined}
          aria-label={resolvedLocaleText.linkUrl}
          autoCapitalize="none"
          className={styles.linkInput}
          defaultValue={request.initialUrl}
          id={urlInputId}
          inputMode="url"
          onChange={clearValidationError}
          placeholder="https://example.com"
          ref={urlInputRef}
          required
          spellCheck={false}
        />
      </div>
      <div className={styles.linkPromptActions}>
        {request.canUnlink ? (
          <button
            aria-label={resolvedLocaleText.unlink}
            className={styles.linkPromptButton}
            data-editor-link-action="unlink"
            type="button"
            onClick={() => close({ action: 'unlink' })}
          >
            <LinkUnlinkIcon size="sm" />
          </button>
        ) : null}
        <button
          aria-label={resolvedLocaleText.applyLink}
          className={styles.linkPromptButton}
          data-editor-link-action="apply"
          type="submit"
        >
          <CheckIcon size="sm" />
        </button>
        <button
          aria-label={resolvedLocaleText.cancelLink}
          className={styles.linkPromptButton}
          data-editor-link-action="cancel"
          type="button"
          onClick={() => close(undefined)}
        >
          <XIcon size="sm" />
        </button>
      </div>
    </form>
  );
};

const ClickableLinkEditorPlugin = ({
  defaultUrl: nextDefaultUrl,
  requestLinkEntity,
}: ResolvedLinkPluginOptions) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();

    if (!rootElement) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      const anchorElement = getAnchorElement(event.target);

      if (!anchorElement || !rootElement.contains(anchorElement)) {
        return;
      }

      event.preventDefault();

      const position = getLinkUrlPromptPositionFromElement(anchorElement);
      const linkDetails = editor.getEditorState().read(
        () => {
          const node = $getNearestNodeFromDOMNode(anchorElement);
          const linkNode = node ? getLinkNode(node) : undefined;

          return linkNode
            ? {
                key: linkNode.getKey(),
                text: linkNode.getTextContent(),
                url: linkNode.getURL(),
              }
            : undefined;
        },
        { editor },
      );

      if (!linkDetails) {
        return;
      }

      void (async () => {
        const result = await requestLinkEntity({
          currentText: linkDetails.text,
          currentUrl: linkDetails.url,
          defaultText: linkDetails.text,
          defaultUrl: nextDefaultUrl,
          position,
        });

        if (result?.action === 'unlink') {
          editor.update(() => {
            const linkNode = $getNodeByKey<LinkNode>(linkDetails.key as NodeKey);

            if ($isLinkNode(linkNode)) {
              unwrapLinkNode(linkNode);
            }
          });
          return;
        }

        const nextUrl = normalizeUrl(result?.url);

        if (!nextUrl || !isValidLinkUrl(nextUrl)) {
          return;
        }

        const nextText = normalizeText(result?.text) ?? normalizeText(linkDetails.text) ?? nextUrl;

        editor.update(() => {
          const linkNode = $getNodeByKey<LinkNode>(linkDetails.key as NodeKey);

          if ($isLinkNode(linkNode)) {
            updateLinkNode(linkNode, nextUrl, nextText);
          }
        });
      })();
    };

    rootElement.addEventListener('click', handleClick);

    return () => {
      rootElement.removeEventListener('click', handleClick);
    };
  }, [editor, nextDefaultUrl, requestLinkEntity]);

  return null;
};

export const linkPlugin = ({
  defaultUrl: nextDefaultUrl = defaultUrl,
  localeText,
  requestUrl,
}: LinkPluginOptions = {}) => {
  const urlRequestController = createLinkUrlRequestController();
  const requestLinkEntity: LinkEntityRequestHandler = async (details) => {
    if (!requestUrl) {
      return urlRequestController.request(details);
    }

    return {
      text: details.currentText ?? details.defaultText,
      url: await requestUrl(details),
    };
  };
  const options = {
    defaultUrl: nextDefaultUrl,
    requestLinkEntity,
  };

  return createEditorPlugin({
    name: 'link',
    feature: { id: 'link' },
    nodes: [LinkNode],
    commands: [
      { id: 'link.insert', run: runInsertLinkCommand(options) },
      { id: 'link.unlink', run: runUnlinkCommand },
    ],
    floatingToolbarActions: [
      {
        command: 'link.insert',
        icon: LinkIcon,
        id: 'link.insert',
        isVisible: (context) => !isLinkSelectionActive(context),
        label: localeText?.link ?? 'Link',
        payload: { requestUrl: true },
      },
      {
        command: 'link.unlink',
        icon: LinkUnlinkIcon,
        id: 'link.unlink',
        isVisible: isLinkSelectionActive,
        label: localeText?.unlink ?? 'Unlink',
      },
    ],
    toolbarActions: [
      {
        command: 'link.insert',
        icon: LinkIcon,
        id: 'link.insert',
        isActive: isLinkSelectionActive,
        label: localeText?.link ?? 'Link',
        payload: { requestUrl: true },
      },
    ],
    setup: () => (
      <>
        <LinkPlugin />
        <ClickableLinkEditorPlugin {...options} />
        {requestUrl ? null : (
          <LinkUrlPromptPlugin controller={urlRequestController} localeText={localeText} />
        )}
      </>
    ),
  });
};

export type { LinkPluginLocaleText } from './locale/types.ts';
