export const internalPrimitives = {
  color: {
    neutralCanvas: '#ffffff',
    neutralSurface: '#fbfcfb',
    neutralInk: '#18211d',
    neutralInkMuted: '#5f6d66',
    borderSoft: '#cfd8d3',
    borderStrong: '#91a198',
    brandAmber: '#5f8f7a',
    brandAmberHover: '#527d6a',
    brandAmberActive: '#456a59',
    brandText: '#f7fbf8',
    focusRing: '#6fa690',
    link: '#3f6f5b',
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
    soft: '0 18px 40px rgba(24, 33, 29, 0.12)',
  },
  font: {
    body: '"Source Han Serif CN Web", "Songti SC", "STSong", "SimSun", "NSimSun", serif',
    display: '"Source Han Serif CN Web", "Songti SC", "STSong", "SimSun", "NSimSun", serif',
    mono: '"IBM Plex Mono", "SFMono-Regular", monospace',
    roles: {
      body: {
        defaultWeightTier: 'body',
        usageScope: 'body text, buttons, forms, and data cells',
      },
      display: {
        defaultWeightTier: 'title',
        usageScope: 'headings and stronger content hierarchy',
      },
      mono: {
        defaultWeightTier: 'body',
        usageScope: 'code, fixed-width identifiers, and explicit exceptions',
      },
    },
    fallbacks: {
      macos: ['Songti SC', 'STSong'],
      windows: ['SimSun', 'NSimSun'],
    },
    weights: {
      body: '400',
      emphasis: '500',
      title: '600',
      strong: '700',
    },
  },
} as const;
