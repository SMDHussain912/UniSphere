// Syntropic Precision Design System - Typography Tokens
// Plus Jakarta Sans for headings, Inter for body, JetBrains Mono for code

export const typography = {
  // Font families
  fontFamily: {
    display: 'Plus Jakarta Sans, sans-serif',
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    monospace: 'JetBrains Mono, monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    md: '1rem',        // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },

  // Font weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeight: {
    none: '1',
    tighter: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',
  },

  // Letter tracking
  letterTracking: {
    tighter: '-0.05em',
    normal: '-0.025em',
    wide: '0.025em',
  },
} as const;
