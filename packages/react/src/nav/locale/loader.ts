import { createComponentLocaleText } from '../../config-provider/locale-text.ts';
import enUS from './en-us.ts';
import type { NavLocaleText } from './types.ts';

export const useNavLocaleText = createComponentLocaleText<NavLocaleText>(enUS, {
  'ja-JP': () => import('./ja-jp.ts'),
  'ko-KR': () => import('./ko-kr.ts'),
  'zh-CN': () => import('./zh-cn.ts'),
  'zh-TW': () => import('./zh-tw.ts'),
});
