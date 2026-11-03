/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Team Exact Color Palette from SkillSwap_MiniProject_Team_SD.aia
        // Primary Pine Green (#1F5240)
        brand: {
          50: '#F6F7F3',
          100: '#E4ECE5', // Exact team pill/badge tint
          200: '#C8D7CB',
          300: '#9BB6A0',
          400: '#5C8E64',
          500: '#2D6A53',
          600: '#255D49',
          700: '#1F5240', // Exact team primary color
          800: '#174032',
          900: '#102D23',
          950: '#0A1C16',
        },
        forest: {
          50: '#F6F7F3',
          100: '#E4ECE5',
          200: '#C8D7CB',
          300: '#9BB6A0',
          400: '#5C8E64',
          500: '#2D6A53',
          600: '#255D49',
          700: '#1F5240',
          800: '#174032',
          900: '#102D23',
        },
        primary: {
          DEFAULT: '#1F5240',
          dark: '#174032',
          light: '#2D6A53',
          tint: '#E4ECE5',
        },
        // Surfaces matching team App Inventor designer:
        surface: {
          bg: '#F6F7F3',       // Exact Screen1.BackgroundColor
          card: '#FFFFFF',     // Exact White Card
          pill: '#E4ECE5',     // Exact Selection / Badge color
          border: '#DDE3DE',   // Soft border
          text: '#1E2A24',     // Exact Dark Charcoal Pine
          muted: '#6B7570',    // Exact Muted Sage Slate
        },
        // Text scale
        slate: {
          50: '#F6F7F3',       // Canvas
          100: '#E4ECE5',      // Pill / Badge
          200: '#DDE3DE',      // Border
          300: '#CBD2CD',
          400: '#9AA49F',
          500: '#6B7570',      // Exact team hint/muted text
          600: '#545D59',
          700: '#3D4541',
          800: '#28302C',
          900: '#1E2A24',      // Exact team headline text
          950: '#121715',
        },
        // Time Credits / Wallet Accents
        credit: {
          50: '#FDF8EC',
          100: '#FBF0D5',
          200: '#F7DC9E',
          300: '#F2C662',
          400: '#EAA932',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        amber: {
          50: '#FDF8EC',
          100: '#FBF0D5',
          200: '#F7DC9E',
          300: '#F2C662',
          400: '#EAA932',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        mint: {
          50: '#F6F7F3',
          100: '#E4ECE5',
          200: '#C8D7CB',
          300: '#9BB6A0',
          400: '#5C8E64',
          500: '#2D6A53',
          600: '#1F5240',
        },
        teal: {
          50: '#F6F7F3',
          100: '#E4ECE5',
          200: '#C8D7CB',
          300: '#9BB6A0',
          400: '#5C8E64',
          500: '#2D6A53',
          600: '#1F5240',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(31, 82, 64, 0.04)',
        'card': '0 2px 8px -1px rgba(31, 82, 64, 0.06), 0 1px 3px 0 rgba(31, 82, 64, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(31, 82, 64, 0.12), 0 4px 8px -2px rgba(31, 82, 64, 0.04)',
        'elevated': '0 14px 32px -8px rgba(31, 82, 64, 0.14), 0 4px 10px -2px rgba(31, 82, 64, 0.04)',
        'pill': '0 1px 4px 0 rgba(31, 82, 64, 0.12)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '0.875rem', // Matches element corner radius 14 in SD
        '3xl': '1.25rem',
      }
    },
  },
  plugins: [],
}