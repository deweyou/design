import { type ReactNode, useMemo } from 'react';

import { ConfigContext, type ConfigLocale, useConfig } from './context.ts';

export type ConfigProviderProps = {
  children: ReactNode;
  locale?: ConfigLocale;
};

export const ConfigProvider = ({ children, locale }: ConfigProviderProps) => {
  const parentConfig = useConfig();
  const config = useMemo(
    () => ({
      ...parentConfig,
      locale: locale ?? parentConfig.locale,
    }),
    [locale, parentConfig],
  );

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export { configLocales, defaultConfigLocale, type ConfigLocale } from './context.ts';
