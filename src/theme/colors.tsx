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

export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  // XRamp brand — dark charcoal background, emerald accent
  appBackground: '#0a0a0a',
  primary: '#10b981',
  primaryHover: '#059669',
  primaryMuted: 'rgba(16,185,129,0.15)',

  container: '#111111',
  card: '#1a1a1a',

  buttonRed: '#ef4444',
  buttonRedDisabled: '#fca5a5',

  disabledGray: '#6b7280',
  warningRed: '#ef4444',
  successGreen: '#10b981',

  defaultBorderColor: 'rgba(255,255,255,0.08)',
  readOnlyBorderColor: 'rgba(255,255,255,0.06)',

  titleColor: '#FFFFFF',
  subtitleColor: '#9ca3af',
  mutedForeground: '#6b7280',

  defaultInputColor: '#111111',
  readOnlyInputColor: '#0d0d0d',

  selectorColor: '#111111',
  selectorHover: '#1f1f1f',
  selectorHoverBorder: 'rgba(16,185,129,0.2)',
};