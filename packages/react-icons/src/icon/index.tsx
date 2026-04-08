import { startTransition, useEffect, useState, type ReactElement } from 'react';

import { hasIconName, loadIconDefinition, type IconName } from '../icon-registry';

import { BaseIcon, createIconWrapperStyle } from './base-icon';
import { resolveIconSize, type IconDefinition, type SharedIconProps } from './types';

export type IconProps = SharedIconProps & {
  name: IconName;
};

const joinClassName = (...parts: Array<string | undefined>) => {
  return parts.filter(Boolean).join(' ');
};

const IconPlaceholder = ({ className, label, name, size, style }: IconProps): ReactElement => {
  const resolvedSize = resolveIconSize(size);

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={joinClassName('dy-icon', className)}
      data-icon-loading="true"
      data-icon-name={name}
      role={label ? 'img' : undefined}
      style={createIconWrapperStyle(resolvedSize, style)}
    />
  );
};

export const Icon = ({ className, label, name, size, style }: IconProps): ReactElement => {
  const [definition, setDefinition] = useState<IconDefinition | null>(null);
  const [error, setError] = useState<Error | null>(null);

  if (!hasIconName(name)) {
    throw new Error(`Unsupported icon name "${String(name)}".`);
  }

  useEffect(() => {
    let cancelled = false;

    setDefinition(null);
    setError(null);

    void loadIconDefinition(name)
      .then((nextDefinition) => {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setDefinition(nextDefinition);
        });
      })
      .catch((nextError: unknown) => {
        if (cancelled) {
          return;
        }

        const resolvedError =
          nextError instanceof Error ? nextError : new Error(`Failed to load icon "${name}".`);

        startTransition(() => {
          setError(resolvedError);
        });
      });

    return () => {
      cancelled = true;
    };
  }, [name]);

  if (error) {
    throw error;
  }

  if (!definition) {
    return (
      <IconPlaceholder className={className} label={label} name={name} size={size} style={style} />
    );
  }

  return (
    <BaseIcon
      className={className}
      definition={definition}
      label={label}
      name={name}
      size={size}
      style={style}
    />
  );
};
