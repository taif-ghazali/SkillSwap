/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Deep Indigo (#263778) & Electric Blue (#4969F5)
        brand: {
          50: '#f0f4ff',
          100: '#e2ebff',
          200: '#c8d7fe',
          300: '#a2bdfd',
          400: '#7498fb',
          500: '#4969F5', // Electric Blue (Primary Accent)
          600: '#3553e8',
          700: '#2b40d0',
          800: '#263778', // Deep Indigo (Primary)
          900: '#202d64',
          950: '#141c40',
        },
        primary: {
          DEFAULT: '#263778',
          accent: '#4969F5',
        },
        // Secondary: Teal (#16A89A)
        teal: {
          50: '#f0fdfc',
          100: '#ccfbf7',
          200: '#99f6ee',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#16A89A', // Signature Teal
          600: '#0f877d',
          700: '#0f6c64',
          800: '#115651',
          900: '#134844',
        },
        // Success: Mint Green (#DDF7EB)
        mint: {
          50: '#f4fcf8',
          100: '#DDF7EB', // Surface / Badge background
          200: '#bdf1d9',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
        },
        // Highlight & Time Credits: Warm Amber (#F5B84B)
        credit: {
          50: '#fffbf2',
          100: '#fef5e0',
          200: '#fde7be',
          300: '#fbd392',
          400: '#f8bd63',
          500: '#F5B84B', // Warm Amber Signature
          600: '#dc9933',
          700: '#b77524',
          800: '#925a22',
        },
        amber: {
          50: '#fffbf2',
          100: '#fef5e0',
          200: '#fde7be',
          300: '#fbd392',
          400: '#f8bd63',
          500: '#F5B84B',
          600: '#dc9933',
          700: '#b77524',
          800: '#925a22',
          900: '#78461f',
        },
        // Base surfaces
        surface: {
          bg: '#F6F7FB',       // Soft Off-White Background
          card: '#FFFFFF',     // White Surface
          border: '#E5E9F1',   // Soft Grey Borders
          text: '#20283B',     // Deep Slate Text
          muted: '#748096',    // Muted Slate Text
        },
        // Overridden slate to match exact design specification
        slate: {
          50: '#F6F7FB',       // Background
          100: '#eff2f8',
          200: '#E5E9F1',      // Soft Grey Borders
          300: '#d3dae6',
          400: '#9faec4',
          500: '#748096',      // Muted Slate
          600: '#58647a',
          700: '#404c62',
          800: '#2b354b',
          900: '#20283B',      // Deep Slate Main Text
          950: '#121826',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(32, 40, 59, 0.04)',
        'card': '0 2px 10px -2px rgba(38, 55, 120, 0.05), 0 1px 3px 0 rgba(38, 55, 120, 0.03)',
        'card-hover': '0 12px 28px -6px rgba(38, 55, 120, 0.12), 0 6px 12px -4px rgba(38, 55, 120, 0.06)',
        'elevated': '0 16px 36px -12px rgba(38, 55, 120, 0.14), 0 4px 10px -2px rgba(38, 55, 120, 0.04)',
        'credit': '0 4px 14px 0 rgba(245, 184, 75, 0.28)',
        'pill': '0 2px 8px 0 rgba(73, 105, 245, 0.22)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
