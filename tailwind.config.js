/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './js/**/*.js',
    './public/**/*.html',
    './public/js/**/*.js',
    './views/**/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Scholar palette
        scholar: {
          50: '#F5F8F6',
          100: '#E4ECE7',
          700: '#234C38',
          800: '#163526',
          900: '#10261C',
          950: '#0B1A13'
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F8F4EB',
          200: '#EFE8D8',
          300: '#E4D8BE',
          400: '#D4C2A2'
        },
        gold: {
          300: '#D4A853',
          400: '#DDB35D',
          500: '#C59B4B',
          600: '#A97F33'
        },
        forest: {
          50: '#F0F5F2',
          100: '#D9E6DE',
          200: '#B3CDBD',
          600: '#234C38',
          700: '#1A3A2B',
          800: '#152E21',
          900: '#0F2218',
          950: '#0A1610'
        }
      },
      fontFamily: {
        ui: ['"Be Vietnam Pro"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        reading: ['Lora', 'Merriweather', 'Times New Roman', 'serif'],
        display: ['"Playfair Display"', 'Merriweather', 'Times New Roman', 'serif'],
        heading: ['"Playfair Display"', 'Merriweather', 'Times New Roman', 'serif'],
        serif: ['Lora', 'Merriweather', 'Times New Roman', 'serif']
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
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
