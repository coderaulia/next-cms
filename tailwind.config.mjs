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
        deepSlate: '#111b31'
      },
      fontFamily: {
        display: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 60px -12px rgba(37, 99, 235, 0.15)',
        'glass-card': '0 16px 42px -12px rgba(15, 23, 42, 0.18)'
      }
    }
  }
};

export default config;

