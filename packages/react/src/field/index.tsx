import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

type FieldContextValue = {
  controlId: string;
  describedBy?: string;
  descriptionId: string;
  disabled?: boolean;
  errorId: string;
  invalid?: boolean;
  required?: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export type FieldRootProps = HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  hasDescription?: boolean;
  hasError?: boolean;
  id?: string;
  invalid?: boolean;
  required?: boolean;
};

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  requiredIndicator?: ReactNode;
};

export type FieldControlProps = {
  children: ReactElement<Record<string, unknown>>;
};

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type FieldErrorTextProps = HTMLAttributes<HTMLParagraphElement>;

const createFieldId = (reactId: string) => {
  return `field-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
};

const mergeIds = (...ids: Array<string | undefined>) => {
  const merged = ids
    .flatMap((id) => id?.split(/\s+/) ?? [])
    .filter((id): id is string => id.length > 0);

  return merged.length > 0 ? Array.from(new Set(merged)).join(' ') : undefined;
};

export const useFieldContext = () => {
  return useContext(FieldContext);
};

export const useFieldControlProps = <T extends Record<string, unknown>>(props: T = {} as T): T => {
  const field = useFieldContext();

  if (!field) {
    return props;
  }

  return {
    ...props,
    'aria-describedby': mergeIds(
      props['aria-describedby'] as string | undefined,
      field.describedBy,
    ),
    'aria-disabled': field.disabled ? true : props['aria-disabled'],
    'aria-invalid': field.invalid ? true : props['aria-invalid'],
    'aria-required': field.required ? true : props['aria-required'],
    disabled: (props['disabled'] as boolean | undefined) ?? field.disabled,
    id: (props['id'] as string | undefined) ?? field.controlId,
    required: (props['required'] as boolean | undefined) ?? field.required,
  } as T;
};

const FieldRoot = ({
  children,
  className,
  disabled,
  hasDescription,
  hasError,
  id,
  invalid,
  required,
  ...props
}: FieldRootProps) => {
  const reactId = useId();
  const controlId = id ?? createFieldId(reactId);
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;
  const describedBy = mergeIds(
    hasDescription ? descriptionId : undefined,
    hasError ? errorId : undefined,
  );

  return (
    <FieldContext.Provider
      value={{
        controlId,
        describedBy,
        descriptionId,
        disabled,
        errorId,
        invalid,
        required,
      }}
    >
      <div
        {...props}
        className={classNames(styles.root, className)}
        data-disabled={disabled ? 'true' : undefined}
        data-invalid={invalid ? 'true' : undefined}
        data-required={required ? 'true' : undefined}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
};

const FieldLabel = ({
  children,
  className,
  requiredIndicator = '*',
  ...props
}: FieldLabelProps) => {
  const field = useFieldContext();

  return (
    <label
      {...props}
      className={classNames(styles.label, className)}
      htmlFor={props.htmlFor ?? field?.controlId}
    >
      {children}
      {field?.required && (
        <span aria-hidden className={styles.requiredMark}>
          {requiredIndicator}
        </span>
      )}
    </label>
  );
};

const FieldControl = ({ children }: FieldControlProps) => {
  if (Children.count(children) !== 1 || !isValidElement<Record<string, unknown>>(children)) {
    throw new Error('Field.Control expects a single React element child.');
  }

  return cloneElement(children, useFieldControlProps(children.props));
};

const FieldDescription = ({ children, className, ...props }: FieldDescriptionProps) => {
  const field = useFieldContext();

  return (
    <p
      {...props}
      className={classNames(styles.description, className)}
      id={props.id ?? field?.descriptionId}
    >
      {children}
    </p>
  );
};

const FieldErrorText = ({ children, className, ...props }: FieldErrorTextProps) => {
  const field = useFieldContext();

  return (
    <p
      {...props}
      className={classNames(styles.error, className)}
      id={props.id ?? field?.errorId}
      role={props.role ?? 'alert'}
    >
      {children}
    </p>
  );
};

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  ErrorText: FieldErrorText,
};
