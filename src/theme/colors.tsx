/**
 * Add opacity information to a hex color
 * @param amount opacity value from 0 to 100
 * @param hexColor
 */
export function opacify(amount: number, hexColor: string): string {
  if (!hexColor.startsWith('#')) {
    return hexColor;
  };

  if (hexColor.length !== 7) {
    throw new Error(`opacify: provided color ${hexColor} was not in hexadecimal format (e.g. #000000)`);
  };

  if (amount < 0 || amount > 100) {
    throw new Error('opacify: provided amount should be between 0 and 100');
  };

  const opacityHex = Math.round((amount / 100) * 255).toString(16);
  const opacifySuffix = opacityHex.length < 2 ? `0${opacityHex}` : opacityHex;

  return `${hexColor.slice(0, 7)}${opacifySuffix}`;
};

// ---------------------------------------------------------------------------
// XRamp exact color tokens — derived from index.css CSS variables
// --background: 222 30% 5%   → #0a0f1a
// --primary:    185 80% 50%  → #19c5d6 (cyan)
// --card:       222 25% 8%   → #101827
// ---------------------------------------------------------------------------
export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  // Core palette — matches XRamp web app exactly
  appBackground: '#0a0f1a',          // hsl(222 30% 5%)
  foreground: '#e2e8f0',             // hsl(210 20% 92%)

  primary: '#19c5d6',                // hsl(185 80% 50%)
  primaryForeground: '#0a0f1a',      // hsl(222 30% 5%)
  primaryHover: '#14b8c8',
  primaryMuted: 'rgba(25,197,214,0.12)',
  primaryGlow: '0 0 30px -5px rgba(25,197,214,0.3)',

  container: '#101827',              // hsl(222 25% 8%)
  card: '#101827',                   // hsl(222 25% 8%)
  surfaceElevated: '#151d2e',        // hsl(222 22% 10%)

  secondary: '#1a2236',              // hsl(222 20% 12%)
  secondaryForeground: '#c9d1d9',    // hsl(210 20% 85%)

  buttonRed: '#ef4444',              // hsl(0 72% 51%)
  buttonRedDisabled: '#fca5a5',
  warningRed: '#ef4444',
  warningAmber: '#f59e0b',           // hsl(38 92% 50%)
  successGreen: '#22c55e',           // hsl(142 70% 45%)

  disabledGray: '#6b7280',

  // Borders
  border: '#1a2236',                 // hsl(222 20% 14%)
  defaultBorderColor: '#1a2236',
  readOnlyBorderColor: '#161e30',
  inputBorder: '#1a2236',            // hsl(222 20% 12%)

  // Text
  titleColor: '#e2e8f0',            // foreground
  subtitleColor: '#94a3b8',          // hsl(215 15% 55%) — muted-foreground
  mutedForeground: '#64748b',        // slightly dimmer

  // Inputs / Selectors
  defaultInputColor: '#1a2236',      // hsl(222 20% 12%)
  readOnlyInputColor: '#151d2e',

  selectorColor: '#101827',
  selectorHover: '#1a2236',
  selectorHoverBorder: 'rgba(25,197,214,0.25)',

  // Gradient references
  cyanGradientStart: '#22d3ee',      // cyan-400
  cyanGradientMid: '#0ea5e9',        // sky-500
  cyanGradientEnd: '#14b8a6',        // teal-500
  indigoAccent: '#6366f1',           // indigo-500

  ring: '#19c5d6',
};