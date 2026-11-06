// Syntropic Precision Design System - Border Radius Tokens
// Pill: 9999px for fully rounded elements

export const radii = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.25rem',    // 4px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  full: '9999px',
} as const;

export type RadiusKeys = keyof typeof radii;
