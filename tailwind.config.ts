import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#1a5c3a',
          dark:    '#0d3d26',
          light:   '#246b47',
          edge:    '#0a2e1c',
        },
        gold: {
          DEFAULT: '#c9a227',
          light:   '#e8c542',
          dark:    '#9a7a1a',
        },
        card: {
          bg:    '#f8f8f6',
          red:   '#d92b2b',
          black: '#1a1a1a',
        },
      },
      boxShadow: {
        'nm':             '6px 6px 12px #0d3d26, -4px -4px 10px #246b47',
        'nm-inset':       'inset 5px 5px 10px #0d3d26, inset -3px -3px 8px #246b47',
        'nm-flat':        '2px 2px 5px #0d3d26, -1px -1px 4px #246b47',
        'card':           '4px 8px 20px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.4)',
        'chip':           '3px 3px 8px rgba(0,0,0,0.7), -1px -1px 4px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18)',
        'action':         '4px 4px 10px rgba(0,0,0,0.55), -2px -2px 6px rgba(255,255,255,0.06)',
        'action-press':   'inset 3px 3px 8px rgba(0,0,0,0.45), inset -1px -1px 5px rgba(255,255,255,0.04)',
      },
      borderRadius: {
        card: '8px',
      },
      fontFamily: {
        casino: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
