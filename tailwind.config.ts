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
        sans:    ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink:   '#0f0e0c',
        paper: '#fafaf8',
        stone: {
          50:  '#fafaf8',
          100: '#f4f3f0',
          200: '#e8e7e2',
          300: '#ccc9c0',
          400: '#a8a49a',
          500: '#827e74',
          600: '#5e5b52',
          700: '#3e3c35',
          800: '#232118',
          900: '#0f0e0c',
        },
        accent: '#c8a96e',
        sand:   '#e8e3d8',
      },
      fontSize: {
        '2xs': ['0.625rem', { letterSpacing: '0.15em', lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};

export default config;
