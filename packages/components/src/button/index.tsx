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
 * Supported visual variants for the public `IconButton` API.
 */
export const iconButtonVariantOptions = ['filled', 'outlined', 'ghost'] as const;

/**
 * The primary visual treatment for an IconButton.
 */
export type IconButtonVariant = (typeof iconButtonVariantOptions)[number];

/**
 * Supported color modes for the public button APIs.
 */
export const buttonColorOptions = ['neutral', 'primary'] as const;

/**
 * Color emphasis for Button and IconButton.
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
 * Supported size names for the public button APIs.
 */
export const buttonSizeOptions = [
  'extra-small',
  'small',
  'medium',
  'large',
  'extra-large',
] as const;

/**
 * Standard size scale for Button and IconButton spacing.
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
type NonShapeableIconButtonVariant = Exclude<IconButtonVariant, ShapeableButtonVariant>;

/**
 * Documents which shapes are supported by each public button variant.
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
   * Explicit icon slot for Button and IconButton.
   */
  icon?: ReactNode;
  /**
   * Legacy content alias kept for migration. `children` takes precedence when both are provided.
   */
  label?: ReactNode;
  /**
   * Standard size scale for the Button. Defaults to `medium`.
   */
  size?: ButtonSize;
};

type SharedIconButtonProps = Omit<SharedButtonProps, 'children' | 'label'> & {
  /**
   * Explicit icon slot for the IconButton entry.
   */
  icon: ReactNode;
};

/**
 * Public props for Deweyou UI Button.
 *
 * `variant` controls the visual treatment, `color` controls whether the button stays
 * monochrome or uses theme accent color, `size` controls the scale, `icon` provides the
 * explicit graphic slot, and `shape` is only available for `filled` and `outlined`.
 */
export type ButtonProps =
  | (SharedButtonProps & {
      color?: ButtonColor;
      variant?: ShapeableButtonVariant;
      shape?: ButtonShape;
    })
  | (SharedButtonProps & {
      color?: ButtonColor;
      variant: NonShapeableButtonVariant;
      shape?: never;
    });

/**
 * Public props for Deweyou UI IconButton.
 *
 * IconButton exposes the explicit square icon-button mode and keeps the same color,
 * size, and shape semantics where applicable.
 */
export type IconButtonProps =
  | (SharedIconButtonProps & {
      color?: ButtonColor;
      variant?: ShapeableButtonVariant;
      shape?: ButtonShape;
    })
  | (SharedIconButtonProps & {
      color?: ButtonColor;
      variant: NonShapeableIconButtonVariant;
      shape?: never;
    });

const variantClassNames: Record<ButtonVariant | IconButtonVariant, string> = {
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

const modeClassNames = {
  'icon-button': styles.modeIconButton,
  'text-only': styles.modeTextOnly,
  'text-with-icon': styles.modeTextWithIcon,
} as const;

type ButtonRenderMode = keyof typeof modeClassNames;

type ContentAnalysis = {
  hasGraphic: boolean;
  hasUnknown: boolean;
  hasVisibleText: boolean;
};

const emptyContentAnalysis: ContentAnalysis = {
  hasGraphic: false,
  hasUnknown: false,
  hasVisibleText: false,
};

const combineContentAnalysis = (analyses: ContentAnalysis[]): ContentAnalysis => {
  return {
    hasGraphic: analyses.some((analysis) => analysis.hasGraphic),
    hasUnknown: analyses.some((analysis) => analysis.hasUnknown),
    hasVisibleText: analyses.some((analysis) => analysis.hasVisibleText),
  };
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

const analyzeContent = (content: ReactNode): ContentAnalysis => {
  if (content === null || content === undefined || typeof content === 'boolean') {
    return emptyContentAnalysis;
  }

  if (typeof content === 'string') {
    return content.trim().length > 0
      ? { ...emptyContentAnalysis, hasVisibleText: true }
      : emptyContentAnalysis;
  }

  if (typeof content === 'number') {
    return { ...emptyContentAnalysis, hasVisibleText: true };
  }

  if (Array.isArray(content)) {
    return combineContentAnalysis(content.map(analyzeContent));
  }

  if (isValidElement(content) && content.type === Fragment) {
    const props = content.props as { children?: ReactNode } | null;

    return analyzeContent(props?.children);
  }

  if (looksLikeGraphicElement(content)) {
    return { ...emptyContentAnalysis, hasGraphic: true };
  }

  if (isValidElement(content)) {
    const props = content.props as { children?: ReactNode } | null;
    const nestedAnalysis = analyzeContent(props?.children);

    if (nestedAnalysis.hasGraphic || nestedAnalysis.hasUnknown || nestedAnalysis.hasVisibleText) {
      return nestedAnalysis;
    }

    return { ...emptyContentAnalysis, hasUnknown: true };
  }

  return { ...emptyContentAnalysis, hasUnknown: true };
};

const hasAccessibleName = (
  props: Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-labelledby'>,
): boolean => {
  const ariaLabel = props['aria-label'];
  const ariaLabelledBy = props['aria-labelledby'];

  return (
    (typeof ariaLabel === 'string' && ariaLabel.trim().length > 0) ||
    (typeof ariaLabelledBy === 'string' && ariaLabelledBy.trim().length > 0)
  );
};

const hasTextLikeContent = (analysis: ContentAnalysis): boolean => {
  return analysis.hasVisibleText || analysis.hasUnknown;
};

const isShapeableVariant = (
  variant: ButtonVariant | IconButtonVariant,
): variant is ShapeableButtonVariant => {
  return buttonShapeableVariantOptions.some((supportedVariant) => supportedVariant === variant);
};

const isIconButtonVariant = (
  variant: ButtonVariant | IconButtonVariant,
): variant is IconButtonVariant => {
  return iconButtonVariantOptions.some((supportedVariant) => supportedVariant === variant);
};

const resolveIconButtonVariant = (
  variant: ButtonVariant | IconButtonVariant,
): IconButtonVariant => {
  if (!isIconButtonVariant(variant)) {
    throw new Error(
      `IconButton does not support the "${variant}" variant. Use Button with visible text for link actions.`,
    );
  }

  return variant;
};

const resolveButtonShape = (
  variant: ButtonVariant | IconButtonVariant,
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

const renderContentItem = ({ content, key }: { content: ReactNode; key: string }): ReactNode => {
  const analysis = analyzeContent(content);

  if (analysis.hasGraphic && !analysis.hasVisibleText && !analysis.hasUnknown) {
    return (
      <span className={styles.contentGraphic} key={key}>
        {content}
      </span>
    );
  }

  return (
    <span className={styles.contentLabel} key={key}>
      {content}
    </span>
  );
};

const renderButtonContent = ({
  content,
  icon,
  variant,
}: {
  content: ReactNode;
  icon: ReactNode;
  variant: ButtonVariant | IconButtonVariant;
}): ReactNode => {
  const renderedItems: ReactNode[] = [];

  if (hasRenderableContent(icon)) {
    renderedItems.push(
      <span className={styles.contentGraphic} key="icon-slot">
        {icon}
      </span>,
    );
  }

  const contentItems = renderedItems.concat(
    flattenButtonContent(content).map((item, index) =>
      renderContentItem({
        content: item,
        key: `content-${index}`,
      }),
    ),
  );

  if (variant === 'link') {
    return (
      <span className={styles.linkContent}>
        {contentItems}
        <span aria-hidden className={styles.linkUnderlineDecoration} />
      </span>
    );
  }

  return contentItems;
};

const renderButtonSurface = ({
  className,
  color,
  icon,
  mode,
  shape,
  size,
  slotContent,
  type,
  variant,
  ...props
}: {
  className?: string;
  color: ButtonColor;
  icon: ReactNode;
  mode: ButtonRenderMode;
  shape?: ButtonShape;
  size: ButtonSize;
  slotContent: ReactNode;
  type: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  variant: ButtonVariant | IconButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const resolvedShape = resolveButtonShape(variant, shape);
  const resolvedShapeClassName = resolvedShape
    ? shapeClassNames[resolvedShape]
    : isShapeableVariant(variant)
      ? styles.shapeAuto
      : undefined;

  return (
    <button
      {...props}
      className={classNames(
        styles.root,
        colorClassNames[color],
        variantClassNames[variant],
        sizeClassNames[size],
        modeClassNames[mode],
        resolvedShapeClassName,
        className,
      )}
      data-color={color}
      data-content-mode={mode}
      data-disabled={props.disabled ? 'true' : 'false'}
      data-icon-only={mode === 'icon-button' ? 'true' : 'false'}
      data-shape={resolvedShape ?? 'none'}
      data-size={size}
      data-variant={variant}
      type={type}
    >
      {renderButtonContent({
        content: slotContent,
        icon,
        variant,
      })}
    </button>
  );
};

/**
 * IconButton is the explicit square icon-button entry for Deweyou UI packages and apps.
 */
export const IconButton = ({
  className,
  color = 'neutral',
  icon,
  shape,
  size = 'medium',
  type = 'button',
  variant = 'filled',
  ...props
}: IconButtonProps) => {
  if (!hasRenderableContent(icon)) {
    throw new Error('IconButton requires the icon prop.');
  }

  if (!hasAccessibleName(props)) {
    throw new Error(
      'Button requires aria-label or aria-labelledby when no visible text is rendered.',
    );
  }

  const resolvedVariant = resolveIconButtonVariant(variant);

  return renderButtonSurface({
    ...props,
    className,
    color,
    icon,
    mode: 'icon-button',
    shape,
    size,
    slotContent: null,
    type,
    variant: resolvedVariant,
  });
};

const ButtonBase = ({
  children,
  className,
  color = 'neutral',
  icon,
  label,
  shape,
  size = 'medium',
  type = 'button',
  variant = 'filled',
  ...props
}: ButtonProps) => {
  const content = hasRenderableContent(children) ? children : label;
  const contentAnalysis = analyzeContent(content);
  const explicitIconProvided = hasRenderableContent(icon);
  const textLikeContent = hasTextLikeContent(contentAnalysis);

  if (explicitIconProvided && !textLikeContent) {
    const resolvedVariant = resolveIconButtonVariant(variant);

    if (!hasAccessibleName(props)) {
      throw new Error(
        'Button requires aria-label or aria-labelledby when no visible text is rendered.',
      );
    }

    return renderButtonSurface({
      ...props,
      className,
      color,
      icon,
      mode: 'icon-button',
      shape,
      size,
      slotContent: null,
      type,
      variant: resolvedVariant,
    });
  }

  if (!explicitIconProvided && contentAnalysis.hasGraphic && !textLikeContent) {
    throw new Error(
      'Button no longer infers icon-only mode from children. Pass the graphic through the icon prop or use IconButton/Button.Icon.',
    );
  }

  if (!textLikeContent) {
    throw new Error('Button requires visible content or the icon prop.');
  }

  return renderButtonSurface({
    ...props,
    className,
    color,
    icon,
    mode: explicitIconProvided || contentAnalysis.hasGraphic ? 'text-with-icon' : 'text-only',
    shape,
    size,
    slotContent: content,
    type,
    variant,
  });
};

type ButtonRuntimeComponent = typeof ButtonBase & {
  Icon: typeof IconButton;
};

/**
 * Button is the shared action primitive for Deweyou UI packages and apps.
 */
export const Button = Object.assign(ButtonBase, {
  Icon: IconButton,
}) as ButtonRuntimeComponent;
