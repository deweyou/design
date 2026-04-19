import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { colorFamilyNames, type ColorFamilyName } from '@deweyou-design/styles';

import styles from './index.module.less';

export const textColorFamilyOptions = colorFamilyNames;

/**
 * Typographic role the component renders into.
 * - 'plain' → <span> (inline, default)
 * - 'body' / 'caption' → <div> (block)
 * - 'h1'–'h5' → the corresponding native heading element
 */
export type TextVariant = 'plain' | 'body' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

/**
 * A color family name from @deweyou-design/styles shared palette.
 * Used for both color (foreground) and background (highlight) props.
 */
export type TextColorFamily = ColorFamilyName;

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** Text content rendered inside the element. */
  children?: ReactNode;
  /**
   * Typographic role and rendered HTML element. Defaults to 'plain' (<span>).
   */
  variant?: TextVariant;
  /** Applies italic style for tone variation. */
  italic?: boolean;
  /** Applies font-weight: 700 (strong emphasis tier). */
  bold?: boolean;
  /** Adds an underline text-decoration to mark key information. */
  underline?: boolean;
  /** Adds a strikethrough to mark revised or deprecated content. */
  strikethrough?: boolean;
  /**
   * Foreground color from the shared palette.
   * Accepts any ColorFamilyName from @deweyou-design/styles.
   */
  color?: TextColorFamily;
  /**
   * Background highlight from the shared palette.
   * Applied with box-decoration-break: clone so it wraps correctly across line breaks.
   */
  background?: TextColorFamily;
  /**
   * Clamps the visible text to the given number of lines with ellipsis.
   * Only positive integers are accepted; 0 and non-integers are treated as unclamped.
   */
  lineClamp?: number;
  [dataAttr: `data-${string}`]: string | number | boolean | undefined;
};

const variantElementMap: Record<TextVariant, 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5'> = {
  plain: 'span',
  body: 'div',
  caption: 'div',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
};

const variantClassMap: Record<TextVariant, string> = {
  plain: styles.plain,
  body: styles.body,
  caption: styles.caption,
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
  h4: styles.h4,
  h5: styles.h5,
};

const decorationClassMap = {
  underline: styles.underline,
  strikethrough: styles.strikethrough,
} as const;

const normalizeLineClamp = (lineClamp?: number) => {
  if (lineClamp === undefined || !Number.isInteger(lineClamp) || lineClamp <= 0) {
    return undefined;
  }

  return lineClamp;
};

export const Text = ({
  children,
  className,
  style,
  variant = 'plain',
  italic = false,
  bold = false,
  underline = false,
  strikethrough = false,
  color,
  background,
  lineClamp,
  ...domProps
}: TextProps) => {
  const Component = variantElementMap[variant];
  const normalizedLineClamp = normalizeLineClamp(lineClamp);
  const decorationLine =
    [underline ? 'underline' : null, strikethrough ? 'line-through' : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const mergedStyle: CSSProperties & {
    WebkitLineClamp?: CSSProperties['WebkitLineClamp'];
    ['--text-background-current']?: string;
    ['--text-color-current']?: string;
    ['--text-line-clamp']?: number;
  } = {
    ...style,
  };

  if (color !== undefined) {
    mergedStyle['--text-color-current'] = `var(--ui-text-color-${color})`;
  }

  if (background !== undefined) {
    mergedStyle['--text-background-current'] = `var(--ui-text-background-${background})`;
  }

  if (normalizedLineClamp !== undefined) {
    mergedStyle.WebkitLineClamp = normalizedLineClamp;
    mergedStyle['--text-line-clamp'] = normalizedLineClamp;
  }

  if (decorationLine !== undefined) {
    mergedStyle.textDecorationLine = decorationLine;
  }

  return (
    <Component
      {...domProps}
      className={classNames(
        styles.root,
        variantClassMap[variant],
        {
          [styles.bold]: bold,
          [styles.clamped]: normalizedLineClamp !== undefined,
          [styles.highlighted]: background !== undefined,
          [styles.italic]: italic,
          [decorationClassMap.strikethrough]: strikethrough,
          [decorationClassMap.underline]: underline,
        },
        className,
      )}
      style={mergedStyle}
    >
      {children}
    </Component>
  );
};

Text.displayName = 'Text';
