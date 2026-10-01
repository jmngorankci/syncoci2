import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#edf7f1',
          100: '#d0eedb',
          200: '#96d4af',
          300: '#5cb87e',
          400: '#3d9966',
          500: '#2e7d50',
          600: '#256040',
          700: '#1f4a32',
          800: '#1a3a2a',
          900: '#0d2b1a',
          950: '#06170d',
        },
        gold: {
          50: '#fefbf3',
          100: '#fef3d4',
          400: '#f0a500',
          500: '#d98b00',
          600: '#c47f1a',
          700: '#9b5e0c',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
