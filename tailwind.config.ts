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
          50: '#f9f8f5',
          100: '#f3f0ec',
          200: '#e6e4df',
          300: '#d4d1ca',
          800: '#28251d',
          900: '#1c1b19',
        },
        accent: {
          DEFAULT: '#01696f',
          hover: '#0c4e54',
        },
      },
    },
  },
  plugins: [],
};

export default config;
