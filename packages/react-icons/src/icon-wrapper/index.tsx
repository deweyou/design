import type { ReactElement, SVGProps } from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'inherit' | 'neutral' | 'primary' | 'danger';
type CustomIconSize = string & {};

export type IconProps = Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'dangerouslySetInnerHTML' | 'color'
> & {
  color?: IconColor;
  size?: IconSize | number | CustomIconSize;
};

export type IconDefinition = {
  body: ReactElement | readonly ReactElement[];
  viewBox: string;
};

export type IconComponent = ((props: IconProps) => ReactElement) & {
  displayName: string;
};

const iconSizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const satisfies Record<IconSize, number>;

const iconColorMap = {
  inherit: 'currentColor',
  neutral: 'var(--ui-color-text)',
  primary: 'var(--ui-color-brand-text)',
  danger: 'var(--ui-color-danger-text)',
} as const satisfies Record<IconColor, string>;

const resolveSize = (size: IconProps['size']) => {
  if (size === undefined) {
    return iconSizeMap.md;
  }

  if (typeof size === 'string' && size in iconSizeMap) {
    return iconSizeMap[size as IconSize];
  }

  return size;
};

const resolveColor = (color: IconProps['color']) => {
  return iconColorMap[color ?? 'inherit'];
};

export const createIcon = (displayName: string, definition: IconDefinition): IconComponent => {
  const Icon = ({
    'aria-hidden': ariaHidden,
    'aria-label': ariaLabel,
    color,
    role,
    size,
    ...svgProps
  }: IconProps): ReactElement => {
    const resolvedSize = resolveSize(size);
    const resolvedAriaHidden = ariaHidden ?? (ariaLabel ? undefined : true);
    const resolvedRole = role ?? (ariaLabel ? 'img' : undefined);

    return (
      <svg
        aria-hidden={resolvedAriaHidden}
        aria-label={ariaLabel}
        color={resolveColor(color)}
        fill="none"
        height={resolvedSize}
        role={resolvedRole}
        viewBox={definition.viewBox}
        width={resolvedSize}
        xmlns="http://www.w3.org/2000/svg"
        {...svgProps}
      >
        {definition.body}
      </svg>
    );
  };

  Icon.displayName = displayName;

  return Icon as IconComponent;
};
