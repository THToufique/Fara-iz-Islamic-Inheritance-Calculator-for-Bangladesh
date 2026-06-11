/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fara'iz design system tokens
        teal: {
          DEFAULT: '#1F4E45',
          deep: '#16352F',
          light: '#3E6B60',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#D9C896',
          dark: '#8A6D1A',
        },
        cream: {
          DEFAULT: '#FAF6EE',
          deep: '#F1EBDD',
        },
        sage: '#E8EDE9',
        ink: {
          DEFAULT: '#2B2B2B',
          soft: '#5C5C54',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
