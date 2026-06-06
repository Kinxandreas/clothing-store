import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      colors: {
        brand: {
          50:  '#faf9f7',
          100: '#f4f2ee',
          200: '#e8e4dc',
          300: '#c8c2b6',
          400: '#a09890',
          500: '#7a7268',
          600: '#5a5248',
          700: '#3d3830',
          800: '#252118',
          900: '#141210',
        },
        cream: '#faf9f7',
        charcoal: '#1a1916',
        accent: {
          DEFAULT: '#b8a082',
          hover:   '#a08c6e',
          dark:    '#8a7358',
        },
        gold: '#c9a96e',
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
};

export default config;
