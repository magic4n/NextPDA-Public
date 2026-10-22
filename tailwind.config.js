/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f8',
          500: '#2b7ec9', // 4PDA pastel signature blue
          600: '#1b65b1',
          700: '#165191',
          800: '#164578',
          900: '#173a63',
          950: '#0d223c',
        },
        surface: {
          light: '#f8fafc',
          cardLight: '#ffffff',
          dark: '#0b111e',
          cardDark: '#131b2e',
          borderDark: '#1e293b',
          subtleDark: '#192338',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
        'glow-sm': '0 0 15px rgba(56, 165, 248, 0.25)',
        'glow': '0 0 25px rgba(56, 165, 248, 0.35)',
        'glow-lg': '0 0 40px rgba(56, 165, 248, 0.45)',
        'pill': '0 10px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
      },
      borderRadius: {
        'pill': '9999px',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
