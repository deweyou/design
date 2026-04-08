import { useEffect, useState } from 'react';

export const themeModes = ['light', 'dark'] as const;

export type ThemeMode = (typeof themeModes)[number];

const readThemeMode = (): ThemeMode => {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};

export const useThemeMode = (initialMode: ThemeMode = 'light') => {
  const [mode, setMode] = useState<ThemeMode>(() =>
    typeof document === 'undefined' ? initialMode : readThemeMode(),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return {
    mode,
    setMode,
    toggleMode: () => {
      setMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
    },
  };
};
