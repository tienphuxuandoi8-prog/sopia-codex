/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './public/js/**/*.js',
    './views/**/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sophia Codex brand palette (from mockup)
        parchment: {
          50:  '#FDFBF6',
          100: '#F8F5EE',
          200: '#EFE8D8',
          300: '#E2D5BD',
          400: '#D4C2A2',
        },
        gold: {
          300: '#D4A853',
          400: '#C59B4B',
          500: '#A97F33',
          600: '#8A6628',
        },
        forest: {
          50:  '#F0F5F2',
          100: '#D9E6DE',
          200: '#B3CDBD',
          600: '#234C38',
          700: '#1A3A2B',
          800: '#152E21',
          900: '#0F2218',
          950: '#0A1610',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        reading: ['"Source Serif 4"', '"Noto Serif"', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
