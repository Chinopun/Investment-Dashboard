import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#f8f9fb',
          dark: '#000000',
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#1c1c1e',
        },
        border: {
          DEFAULT: '#e2e4e9',
          dark: '#2c2c2e',
        },
        accent: '#0a84ff',
        pos: {
          DEFAULT: '#0a8a3f',
          dark: '#30d158',
        },
        neg: {
          DEFAULT: '#c83a3a',
          dark: '#ff453a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
