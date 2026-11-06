// Syntropic Precision Design System - Color Tokens
// Primary: #2a14b4 (deep electric violet)
// Secondary: #0051d5 (precision azure blue)
// Tertiary: #0d9488 (vibrant teal/emerald cyan)

// Export as RGB for CSS usage
export const colors = {
  // Primary palette
  primary: '#2a14b4',
  primaryDark: '#1d10a0',
  primaryLight: '#3730a3',

  // Secondary palette
  secondary: '#0051d5',
  secondaryDark: '#0044c8',
  secondaryLight: '#3066d8',

  // Tertiary/Accent palette
  tertiary: '#0d9488',
  tertiaryDark: '#0a8078',
  tertiaryLight: '#33a89f',

  // Neutral palette (from DESIGN.md)
  canvas: '#faf8ff',
  surface: '#ffffff',
  surfaceVariant: '#f3f2f1',
  onSurface: '#131b2e',
  onSurfaceVariant: '#475569',
  outline: '#777586',
  outlineVariant: '#c7c4d7',

  // Status colors
  success: '#f0fdfa',
  successBg: '#d1e8e2',
  error: '#fef2f2',
  errorBg: '#fee2e2',
  warning: '#fffbeb',
  warningBg: '#ffe4c5',

  // Interactive states
  hover: '#f8fafc',
  active: '#f1f5f9',
  focus: '#4338ca',
  focusBg: '#e4d8ff',
  disabled: '#9ca3af',
  disabledBg: '#f3f4f6',
} as const;

// Export individual colors for direct use
export type ColorKeys = keyof typeof colors;
