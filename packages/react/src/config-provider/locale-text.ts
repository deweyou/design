import { useDeferredValue } from 'react';

import { defaultConfigLocale, type ConfigLocale, useConfigLocale } from './context.ts';

type LazyConfigLocale = Exclude<ConfigLocale, typeof defaultConfigLocale>;

export type ComponentLocaleTextLoader<LocaleText extends object> = () => Promise<{
  default: LocaleText;
}>;

export type ComponentLocaleTextLoaders<LocaleText extends object> = Record<
  LazyConfigLocale,
  ComponentLocaleTextLoader<LocaleText>
>;

type PendingLocaleText = {
  promise: Promise<void>;
  status: 'pending';
};

type ResolvedLocaleText<LocaleText extends object> = {
  localeText: LocaleText;
  status: 'resolved';
};

type RejectedLocaleText = {
  error: unknown;
  status: 'rejected';
};

type LocaleTextRecord<LocaleText extends object> =
  | PendingLocaleText
  | RejectedLocaleText
  | ResolvedLocaleText<LocaleText>;

export const createComponentLocaleText = <LocaleText extends object>(
  englishLocaleText: LocaleText,
  loaders: ComponentLocaleTextLoaders<LocaleText>,
) => {
  const localeTextCache = new Map<LazyConfigLocale, LocaleTextRecord<LocaleText>>();

  const readLocaleText = (locale: LazyConfigLocale) => {
    let localeTextRecord = localeTextCache.get(locale);
    if (!localeTextRecord) {
      const pendingRecord: PendingLocaleText = {
        promise: Promise.resolve(),
        status: 'pending',
      };
      const localeTextPromise = loaders[locale]().then(
        (module) => {
          localeTextCache.set(locale, { localeText: module.default, status: 'resolved' });
        },
        (error: unknown) => {
          localeTextCache.set(locale, { error, status: 'rejected' });
        },
      );
      pendingRecord.promise = localeTextPromise;
      localeTextCache.set(locale, pendingRecord);
      localeTextRecord = pendingRecord;
    }

    if (localeTextRecord.status === 'pending') throw localeTextRecord.promise;
    if (localeTextRecord.status === 'rejected') throw localeTextRecord.error;
    return localeTextRecord.localeText;
  };

  const useLocaleText = (override?: Partial<LocaleText>) => {
    const requestedLocale = useConfigLocale();
    const locale = useDeferredValue(requestedLocale);
    const builtInLocaleText =
      locale === defaultConfigLocale ? englishLocaleText : readLocaleText(locale);

    if (!override) return builtInLocaleText;
    return { ...builtInLocaleText, ...override };
  };

  return useLocaleText;
};
