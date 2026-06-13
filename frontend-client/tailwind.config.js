/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple/Google-inspired monochrome palette
        primary: '#1D1D1F',
        secondary: '#86868B',
        surface: '#FAFAFA',
        border: '#E5E5E7',
        accent: '#0071E3',
        success: '#34C759',
        danger: '#FF3B30',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
