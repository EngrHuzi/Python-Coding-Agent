import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'spin-slow':   'spin 1.2s linear infinite',
        'fade-up':     'fade-up 0.28s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fade-in 0.2s ease-out both',
        'pulse-soft':  'pulse-soft 2.5s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%':       { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
