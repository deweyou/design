import type { ReactElement } from 'react';

import {
  resolveIconSize,
  resolveIconViewBox,
  type IconDefinition,
  type SharedIconProps,
} from './types';

const joinClassName = (...parts: Array<string | undefined>) => {
  return parts.filter(Boolean).join(' ');
};

export type BaseIconProps = SharedIconProps & {
  definition: IconDefinition;
  name: string;
};

export const createIconWrapperStyle = (
  resolvedSize: number | string,
  style: SharedIconProps['style'],
) => {
  return {
    alignItems: 'center',
    display: 'inline-flex',
    flex: 'none',
    height: resolvedSize,
    justifyContent: 'center',
    lineHeight: 0,
    verticalAlign: 'middle',
    width: resolvedSize,
    ...style,
  };
};

export const BaseIcon = ({
  className,
  definition,
  label,
  name,
  size,
  style,
}: BaseIconProps): ReactElement => {
  const resolvedSize = resolveIconSize(size);
  const resolvedViewBox = resolveIconViewBox(definition.viewBox);

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={joinClassName('dy-icon', className)}
      data-icon-name={name}
      role={label ? 'img' : undefined}
      style={createIconWrapperStyle(resolvedSize, style)}
    >
      <svg
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: definition.body }}
        fill="none"
        focusable="false"
        style={{
          display: 'block',
          height: '100%',
          width: '100%',
        }}
        viewBox={resolvedViewBox}
      />
    </span>
  );
};
