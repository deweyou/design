import type { Icon as TablerIconType, IconProps as TablerIconProps } from '@tabler/icons-react';
import type { ReactElement } from 'react';

export type IconProps = {
  'aria-label'?: string;
  className?: string;
  size?: number | string;
  stroke?: number;
  style?: React.CSSProperties;
};

/**
 * 将任意 Tabler icon 组件包装为符合设计系统规范的图标组件：
 * - strokeLinecap="square"（配合无圆角风格）
 * - strokeLinejoin="miter"
 * - stroke="currentColor"（继承文字颜色）
 * - aria-hidden 默认为 true；传 aria-label 后图标获得 role="img"
 */
export const createTablerIcon = (
  TablerIcon: TablerIconType,
): ((props: IconProps) => ReactElement) => {
  const WrappedIcon = ({
    'aria-label': ariaLabel,
    className,
    size = '1em',
    stroke = 1.5,
    style,
  }: IconProps): ReactElement => {
    const svgProps: TablerIconProps = {
      'aria-hidden': ariaLabel ? undefined : true,
      'aria-label': ariaLabel,
      className,
      role: ariaLabel ? 'img' : undefined,
      size,
      stroke,
      strokeLinecap: 'square',
      strokeLinejoin: 'miter',
      style,
    };

    return <TablerIcon {...svgProps} />;
  };

  return WrappedIcon;
};
