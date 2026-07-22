import { createComponentLocaleText } from '../../config-provider/locale-text.ts';
import enUS from './en-us.ts';
import type { ToastLocaleText } from './types.ts';

export const useToastLocaleText = createComponentLocaleText<ToastLocaleText>(enUS, {
  'ja-JP': () => import('./ja-jp.ts'),
  'ko-KR': () => import('./ko-kr.ts'),
  'zh-CN': () => import('./zh-cn.ts'),
  'zh-TW': () => import('./zh-tw.ts'),
});
