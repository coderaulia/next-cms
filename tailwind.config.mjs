/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        vanailaNavy: '#1f314f',
        electricBlue: '#3b82f6',
        royalPurple: '#6366f1',
        vibrantCyan: '#06b6d4',
        deepSlate: '#111b31',
        vInk: '#0A0E1A',
        vInk2: '#1A1F2E',
        vPaper: '#F4F4F0',
        vPaper2: '#ECEBE3',
        vBlue: '#0033FF',
        vBlueGlow: '#2D5FFF',
        vOrange: '#FF5B22',
        vLime: '#C8E64B'
      },
      fontFamily: {
        display: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tight: ['var(--font-tight)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['var(--font-mono)', 'Courier New', 'monospace']
      },
      boxShadow: {
        glass: '0 8px 60px -12px rgba(37, 99, 235, 0.15)',
        'glass-card': '0 16px 42px -12px rgba(15, 23, 42, 0.18)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};

export default config;

