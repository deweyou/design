import type { ReactElement } from 'react';

import { resolveIconSize, type IconDefinition, type SharedIconProps } from './types';

const joinClassName = (...parts: Array<string | undefined>) => {
  return parts.filter(Boolean).join(' ');
};

export type BaseIconProps = SharedIconProps & {
  definition: IconDefinition;
  name: string;
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

  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={joinClassName('dy-icon', className)}
      data-icon-name={name}
      fill="none"
      focusable="false"
      role={label ? 'img' : undefined}
      style={{
        flex: 'none',
        height: resolvedSize,
        width: resolvedSize,
        ...style,
      }}
      viewBox={definition.viewBox}
      dangerouslySetInnerHTML={{ __html: definition.body }}
    />
  );
};
