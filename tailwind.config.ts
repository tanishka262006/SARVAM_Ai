import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F7F3',
          100: '#DFEFE6',
          200: '#BFDFCE',
          300: '#94C7AE',
          400: '#5EA783',
          500: '#348B61',
          600: '#22704B',
          700: '#1A5A3C',
          800: '#144A32', // Primary Brand Forest Green
          900: '#0D3823', // Deep Forest Navy
          950: '#072416',
        },
        ivory: {
          50: '#FCFBF9',
          100: '#F9F8F5',
          200: '#F3F1EC',
          300: '#E9E6DF',
          400: '#DBD7CE',
          500: '#C5C0B4',
        },
        navy: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        saffron: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309', // Sophisticated Civic Saffron
          800: '#92400E',
          900: '#78350F',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'soundwave': 'soundwave 1.2s ease-in-out infinite',
      },
      keyframes: {
        soundwave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
