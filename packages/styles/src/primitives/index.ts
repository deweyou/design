export const internalPrimitives = {
  color: {
    neutralCanvas: '#f6f0e8',
    neutralSurface: '#fffaf2',
    neutralInk: '#211c1a',
    neutralInkMuted: '#655e5a',
    borderSoft: '#d7c8bb',
    borderStrong: '#9c7f67',
    brandAmber: '#b35c20',
    brandAmberHover: '#9b4d18',
    brandAmberActive: '#7f3d12',
    brandText: '#fff6eb',
    focusRing: '#1f6fe5',
    link: '#8b2f14',
  },
  radius: {
    sm: '0.5rem',
    md: '0.9rem',
    pill: '999px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2.5rem',
  },
  shadow: {
    soft: '0 18px 40px rgba(64, 37, 20, 0.12)',
  },
  font: {
    body: '"IBM Plex Sans", "Segoe UI", sans-serif',
    display: '"Space Grotesk", "Avenir Next", sans-serif',
    mono: '"IBM Plex Mono", "SFMono-Regular", monospace',
  },
} as const;
