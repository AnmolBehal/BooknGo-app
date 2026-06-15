/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette — deep navy to electric blue
        brand: {
          50:  '#eef5ff',
          100: '#d9e8ff',
          200: '#bcd6ff',
          300: '#8ebbff',
          400: '#5995ff',
          500: '#336dff',
          600: '#1a4df5',
          700: '#1339e1',
          800: '#162fb6',
          900: '#182d8f',
          950: '#131e57',
        },
        // Accent — coral to warm orange
        accent: {
          50:  '#fff5f0',
          100: '#ffe8db',
          200: '#ffd0b7',
          300: '#ffab82',
          400: '#ff7e4c',
          500: '#ff5722',
          600: '#f03c08',
          700: '#c72b09',
          800: '#9e2510',
          900: '#802310',
          950: '#450e06',
        },
        // Surface colors for dark mode
        surface: {
          900: '#0b0f1a',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(51, 109, 255, 0.3)',
        'glow-accent': '0 0 20px rgba(255, 87, 34, 0.3)',
        'glass':       '0 8px 32px rgba(0, 0, 0, 0.36)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':    'slideUp 0.5s ease-out',
        'fade-in':     'fadeIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
