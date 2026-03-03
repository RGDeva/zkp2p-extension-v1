/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#19c5d6',
        'primary-hover': '#14b8c8',
        background: '#0a0f1a',
        card: '#101827',
        border: '#1a2236',
        foreground: '#e2e8f0',
        'muted-foreground': '#94a3b8',
        success: '#22c55e',
        warning: '#f59e0b',
        destructive: '#ef4444',
      },
      fontFamily: {
        sans: ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
