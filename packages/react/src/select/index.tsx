import {
  Children,
  createContext,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import {
  SelectRoot as ArkSelectRoot,
  SelectTrigger as ArkSelectTrigger,
  SelectContent as ArkSelectContent,
  SelectPositioner as ArkSelectPositioner,
  SelectItem as ArkSelectItem,
  SelectItemText as ArkSelectItemText,
  SelectValueText as ArkSelectValueText,
  createListCollection,
} from '@ark-ui/react/select';
import classNames from 'classnames';

import styles from './index.module.less';

type ItemData = { value: string; label: string; disabled?: boolean };

type SelectContextValue = {
  placeholder?: string;
  disabled?: boolean;
};

const SelectContext = createContext<SelectContextValue>({});

const ChevronDownSvg = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" aria-hidden="true">
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="square" d="M6 9L12 15L18 9" />
  </svg>
);

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      d="M5 12L10 17L19 8"
    />
  </svg>
);

/** Recursively extract SelectItem data from children tree at render time. */
const extractItems = (children: ReactNode): ItemData[] => {
  const items: ItemData[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const { type, props } = child as React.ReactElement<Record<string, unknown>>;
    // Match our own SelectItem component
    if (type === SelectItem) {
      items.push({
        value: props['value'] as string,
        label: props['label'] as string,
        disabled: props['disabled'] as boolean | undefined,
      });
    } else if (props['children']) {
      items.push(...extractItems(props['children'] as ReactNode));
    }
  });
  return items;
};

export type SelectRootProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  placeholder?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type SelectTriggerProps = {
  className?: string;
  style?: CSSProperties;
};

export type SelectContentProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  portalContainer?: HTMLElement | null;
};

export type SelectItemProps = {
  value: string;
  label: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

const SelectRoot = ({
  value,
  defaultValue,
  onValueChange,
  disabled,
  multiple,
  placeholder,
  children,
  className,
  style,
}: SelectRootProps) => {
  const items = useMemo(() => extractItems(children), [children]);

  const collection = useMemo(
    () => createListCollection<ItemData>({ items }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(items)],
  );

  const handleValueChange = useCallback(
    (details: { value: string[] }) => {
      onValueChange?.(details.value);
    },
    [onValueChange],
  );

  const ctxValue = useMemo(() => ({ placeholder, disabled }), [placeholder, disabled]);

  return (
    <SelectContext.Provider value={ctxValue}>
      <ArkSelectRoot
        collection={collection}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        multiple={multiple}
        className={classNames(styles.root, className)}
        style={style}
      >
        {children}
      </ArkSelectRoot>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ className, style }: SelectTriggerProps) => {
  const { placeholder, disabled } = useContext(SelectContext);
  return (
    <ArkSelectTrigger
      className={classNames(styles.trigger, className)}
      style={style}
      aria-disabled={disabled ? 'true' : undefined}
    >
      <ArkSelectValueText className={styles.valueText} placeholder={placeholder} />
      <span className={styles.chevron}>
        <ChevronDownSvg />
      </span>
    </ArkSelectTrigger>
  );
};

const SelectContent = ({ children, className, style, portalContainer }: SelectContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // jsdom does not implement Element.scrollTo — patch the content element after
  // mount so that Ark UI's internal scrollContentToTop action does not throw.
  useEffect(() => {
    const el = contentRef.current;
    if (el && typeof el.scrollTo !== 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el as any).scrollTo = () => {};
    }
  }, []);

  const container =
    portalContainer !== undefined
      ? portalContainer
      : typeof document !== 'undefined'
        ? document.body
        : null;

  const inner = (
    <ArkSelectPositioner>
      <ArkSelectContent
        ref={contentRef}
        className={classNames(styles.content, className)}
        style={style}
      >
        {children}
      </ArkSelectContent>
    </ArkSelectPositioner>
  );

  return container ? createPortal(inner, container) : inner;
};

const SelectItem = ({ value, label, disabled, className, style }: SelectItemProps) => (
  <ArkSelectItem
    item={{ value, label, disabled }}
    className={classNames(styles.item, className)}
    style={style}
  >
    <ArkSelectItemText>{label}</ArkSelectItemText>
    <span className={styles.itemCheck}>
      <CheckSvg />
    </span>
  </ArkSelectItem>
);

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
};
