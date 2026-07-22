import { createContext, useContext } from 'react';

export const configLocales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'] as const;

export type ConfigLocale = (typeof configLocales)[number];

export const defaultConfigLocale = 'en-US' satisfies ConfigLocale;

export type ConfigContextValue = {
  locale: ConfigLocale;
};

export const ConfigContext = createContext<ConfigContextValue>({
  locale: defaultConfigLocale,
});

export const useConfig = () => useContext(ConfigContext);

export const useConfigLocale = () => useConfig().locale;
