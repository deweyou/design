export type ThemePreview = {
  mode: 'light' | 'dark';
  label: string;
  description: string;
};

export const themePreviews: ThemePreview[] = [
  {
    mode: 'light',
    label: 'Light',
    description: 'Warm editorial surfaces for public documentation and curated demos.',
  },
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Higher-contrast review mode for late-night component inspection.',
  },
];

export const applyThemeMode = (mode: ThemePreview['mode']) => {
  document.documentElement.dataset.theme = mode;
};
