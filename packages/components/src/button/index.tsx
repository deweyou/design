import { Fragment, isValidElement, type ButtonHTMLAttributes, type ReactNode } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

/**
 * Supported visual variants for the public `Button` API.
 */
export const buttonVariantOptions = ['filled', 'outlined', 'ghost', 'link'] as const;

/**
 * The primary visual treatment for a Button.
 */
export type ButtonVariant = (typeof buttonVariantOptions)[number];

/**
 * Supported color modes for the public `Button` API.
 */
export const buttonColorOptions = ['neutral', 'primary'] as const;

/**
 * Color emphasis for the Button. `neutral` keeps buttons monochrome, while `primary`
 * opts into the theme accent color.
 */
export type ButtonColor = (typeof buttonColorOptions)[number];

/**
 * Variants that support the public `shape` prop.
 */
export const buttonShapeableVariantOptions = ['filled', 'outlined'] as const;

/**
 * Variants that allow consumers to choose a public `shape`.
 */
export type ShapeableButtonVariant = (typeof buttonShapeableVariantOptions)[number];

/**
 * Supported size names for the public `Button` API.
 */
export const buttonSizeOptions = [
  'extra-small',
  'small',
  'medium',
  'large',
  'extra-large',
] as const;

/**
 * Standard size scale for Button spacing and typography.
 */
export type ButtonSize = (typeof buttonSizeOptions)[number];

/**
 * Supported shape names for variants that expose the `shape` prop.
 */
export const buttonShapeOptions = ['rect', 'rounded', 'pill'] as const;

/**
 * Public shape values for `filled` and `outlined` Buttons.
 */
export type ButtonShape = (typeof buttonShapeOptions)[number];

type NonShapeableButtonVariant = Exclude<ButtonVariant, ShapeableButtonVariant>;

/**
 * Documents which shapes are supported by each public variant.
 */
export const buttonShapeSupport = {
  filled: ['rect', 'rounded', 'pill'],
  outlined: ['rect', 'rounded', 'pill'],
  ghost: [],
  link: [],
} as const satisfies Record<ButtonVariant, readonly ButtonShape[]>;

/**
 * Documents the default shape used when a shapeable variant omits `shape`.
 */
export const buttonDefaultShapeByVariant = {
  filled: 'rounded',
  outlined: 'rounded',
} as const satisfies Record<ShapeableButtonVariant, ButtonShape>;

type SharedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * React content rendered inside the Button.
   */
  children?: ReactNode;
  /**
   * Color emphasis for the Button. Defaults to `neutral`; use `primary` to opt into theme color.
   */
  color?: ButtonColor;
  /**
   * Disables interaction and keeps native disabled button semantics.
   */
  disabled?: boolean;
  /**
   * Legacy content alias kept for migration. `children` takes precedence when both are provided.
   */
  label?: ReactNode;
  /**
   * Standard size scale for the Button. Defaults to `medium`.
   */
  size?: ButtonSize;
};

/**
 * Public props for Deweyou UI Button.
 *
 * `variant` controls the visual treatment, `color` controls whether the button stays
 * monochrome or uses theme accent color, `size` controls the scale, and `shape` is
 * only available for `filled` and `outlined`.
 *
 * Native button props such as `type`, `disabled`, `onClick`, and `aria-*` remain supported.
 */
export type ButtonProps =
  | (SharedButtonProps & {
      /**
       * Theme accent opt-in for shapeable variants. Defaults to `neutral`.
       */
      color?: ButtonColor;
      /**
       * Visual variant for primary and secondary buttons. Defaults to `filled`.
       */
      variant?: ShapeableButtonVariant;
      /**
       * Shape preset for `filled` and `outlined`. Defaults to `rounded`.
       */
      shape?: ButtonShape;
    })
  | (SharedButtonProps & {
      /**
       * Theme accent opt-in for lightweight variants. Defaults to `neutral`.
       */
      color?: ButtonColor;
      /**
       * Lightweight text-oriented variants that do not expose shape selection.
       */
      variant: NonShapeableButtonVariant;
      /**
       * `ghost` and `link` do not support `shape`.
       */
      shape?: never;
    });

const variantClassNames: Record<ButtonVariant, string> = {
  filled: styles.filled,
  outlined: styles.outlined,
  ghost: styles.ghost,
  link: styles.link,
};

const colorClassNames: Record<ButtonColor, string> = {
  neutral: styles.colorNeutral,
  primary: styles.colorPrimary,
};

const sizeClassNames: Record<ButtonSize, string> = {
  'extra-small': styles.sizeExtraSmall,
  small: styles.sizeSmall,
  medium: styles.sizeMedium,
  large: styles.sizeLarge,
  'extra-large': styles.sizeExtraLarge,
};

const shapeClassNames: Record<ButtonShape, string> = {
  rect: styles.shapeRect,
  rounded: styles.shapeRounded,
  pill: styles.shapePill,
};

type ButtonContentKind = 'empty' | 'text' | 'graphic' | 'unknown';

const combineContentKinds = (kinds: ButtonContentKind[]): ButtonContentKind => {
  if (kinds.some((kind) => kind === 'text')) {
    return 'text';
  }

  if (kinds.some((kind) => kind === 'unknown')) {
    return 'unknown';
  }

  if (kinds.some((kind) => kind === 'graphic')) {
    return 'graphic';
  }

  return 'empty';
};

const hasRenderableContent = (content: ReactNode): boolean => {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return false;
  }

  if (typeof content === 'string') {
    return content.trim().length > 0;
  }

  if (typeof content === 'number') {
    return true;
  }

  if (Array.isArray(content)) {
    return content.some(hasRenderableContent);
  }

  if (isValidElement(content) && content.type === Fragment) {
    const props = content.props as { children?: ReactNode } | null;

    return hasRenderableContent(props?.children);
  }

  return isValidElement(content);
};

const getElementDisplayName = (content: ReactNode): string | undefined => {
  if (!isValidElement(content)) {
    return undefined;
  }

  const elementType = content.type as string | { displayName?: string; name?: string } | undefined;

  if (typeof elementType === 'string') {
    return elementType;
  }

  return elementType?.displayName ?? elementType?.name;
};

const looksLikeGraphicElement = (content: ReactNode): boolean => {
  const elementName = getElementDisplayName(content);

  if (!elementName) {
    return false;
  }

  return elementName === 'svg' || elementName === 'img' || elementName.endsWith('Icon');
};

const resolveContentKind = (content: ReactNode): ButtonContentKind => {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return 'empty';
  }

  if (typeof content === 'string') {
    return content.trim().length > 0 ? 'text' : 'empty';
  }

  if (typeof content === 'number') {
    return 'text';
  }

  if (Array.isArray(content)) {
    return combineContentKinds(content.map(resolveContentKind));
  }

  if (isValidElement(content) && content.type === Fragment) {
    const props = content.props as { children?: ReactNode } | null;

    return resolveContentKind(props?.children);
  }

  if (looksLikeGraphicElement(content)) {
    return 'graphic';
  }

  if (isValidElement(content)) {
    const props = content.props as { children?: ReactNode } | null;
    const childKind = resolveContentKind(props?.children);

    return childKind === 'empty' ? 'unknown' : childKind;
  }

  return 'unknown';
};

const hasAccessibleName = (props: ButtonProps): boolean => {
  const ariaLabel = props['aria-label'];
  const ariaLabelledBy = props['aria-labelledby'];

  return (
    (typeof ariaLabel === 'string' && ariaLabel.trim().length > 0) ||
    (typeof ariaLabelledBy === 'string' && ariaLabelledBy.trim().length > 0)
  );
};

const isShapeableVariant = (variant: ButtonVariant): variant is ShapeableButtonVariant => {
  return buttonShapeableVariantOptions.some((supportedVariant) => supportedVariant === variant);
};

const resolveButtonShape = (
  variant: ButtonVariant,
  shape?: ButtonShape,
): ButtonShape | undefined => {
  if (!isShapeableVariant(variant)) {
    if (shape !== undefined) {
      throw new Error(
        `Button variant "${variant}" does not support the shape prop. Remove shape or choose "filled" or "outlined".`,
      );
    }

    return undefined;
  }

  if (shape === undefined) {
    return buttonDefaultShapeByVariant[variant];
  }

  const supportedShapes = buttonShapeSupport[variant];

  if (!supportedShapes.some((supportedShape) => supportedShape === shape)) {
    throw new Error(
      `Button variant "${variant}" does not support the "${String(shape)}" shape. Supported shapes: ${supportedShapes.join(', ')}.`,
    );
  }

  return shape;
};

const validateButtonContent = (content: ReactNode, props: ButtonProps) => {
  const contentKind = resolveContentKind(content);

  if (contentKind === 'text' || contentKind === 'unknown') {
    return;
  }

  if (!hasAccessibleName(props)) {
    throw new Error(
      'Button requires aria-label or aria-labelledby when no visible text is rendered.',
    );
  }
};

const flattenButtonContent = (content: ReactNode): ReactNode[] => {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return [];
  }

  if (Array.isArray(content)) {
    return content.flatMap(flattenButtonContent);
  }

  if (isValidElement(content) && content.type === Fragment) {
    const props = content.props as { children?: ReactNode } | null;

    return flattenButtonContent(props?.children);
  }

  return [content];
};

const renderButtonContent = (content: ReactNode): ReactNode => {
  return flattenButtonContent(content).map((item, index) => {
    const contentKind = resolveContentKind(item);

    if (contentKind === 'text' || contentKind === 'unknown') {
      return (
        <span className={styles.contentLabel} key={`label-${index}`}>
          {item}
        </span>
      );
    }

    return (
      <span className={styles.contentGraphic} key={`graphic-${index}`}>
        {item}
      </span>
    );
  });
};

/**
 * Button is the shared action primitive for Deweyou UI packages and apps.
 */
export const Button = ({
  children,
  className,
  color = 'neutral',
  label,
  shape,
  size = 'medium',
  type = 'button',
  variant = 'filled',
  ...props
}: ButtonProps) => {
  const content = hasRenderableContent(children) ? children : label;
  const contentKind = resolveContentKind(content);
  const isShapeable = isShapeableVariant(variant);
  const resolvedShape = resolveButtonShape(variant, shape);
  const resolvedShapeClassName = resolvedShape
    ? shapeClassNames[resolvedShape]
    : isShapeable
      ? styles.shapeAuto
      : undefined;

  validateButtonContent(content, props);

  return (
    <button
      {...props}
      className={classNames(
        styles.root,
        colorClassNames[color],
        variantClassNames[variant],
        sizeClassNames[size],
        resolvedShapeClassName,
        className,
      )}
      data-color={color}
      data-disabled={props.disabled ? 'true' : 'false'}
      data-icon-only={contentKind === 'graphic' ? 'true' : 'false'}
      data-shape={resolvedShape ?? 'none'}
      data-size={size}
      data-variant={variant}
      type={type}
    >
      {renderButtonContent(content)}
    </button>
  );
};
