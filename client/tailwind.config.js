/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#F1F5F1',
          100: '#E1EAE1',
          200: '#C9DCC9',
          300: '#A8C4AA',
          400: '#8FB391',
          500: '#7FA087',
          600: '#698C71',
          700: '#4F6B54',
          800: '#3D5341',
          900: '#2C3D2F',
          950: '#1B251D',
        },
        accent: {
          400: '#E8AF95',
          500: '#E29578',
          600: '#C97D61',
          700: '#A8654C',
        },
        info: {
          400: '#A9C5D6',
          500: '#8FB1C7',
          600: '#6F93AB',
        },
        base: {
          bg: '#FBF7F0',
          text: '#33302B',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};