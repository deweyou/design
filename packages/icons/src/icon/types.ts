import type { CSSProperties } from 'react';

export const iconSizeMap = {
  'extra-small': 12,
  small: 14,
  medium: 16,
  large: 20,
  'extra-large': 24,
} as const;

export type IconSize = keyof typeof iconSizeMap;

export type SharedIconProps = {
  className?: string;
  label?: string;
  size?: number | IconSize;
  style?: CSSProperties;
};

export type IconDefinition = {
  body: string;
  sourceKey: string;
  viewBox: string;
};

export type IconCategory = 'action' | 'feedback' | 'general' | 'navigation' | 'status';

export type IconCatalogEntry<Name extends string = string> = {
  a11yGuidance: string;
  category: IconCategory;
  definition: IconDefinition;
  directional: boolean;
  exportName: string;
  keywords: readonly string[];
  name: Name;
  sourceCollection: 'tdesign-icons-svg';
  sourceKey: string;
  status: 'active';
};

export const resolveIconSize = (size: number | IconSize | undefined) => {
  if (typeof size === 'number') {
    return size;
  }

  return iconSizeMap[size ?? 'medium'];
};
