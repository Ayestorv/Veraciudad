/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        glassBg: 'rgba(255,255,255,0.15)',
        glassBorder: 'rgba(255,255,255,0.25)',
        accentGreen: '#28A745',
        accentBlue: '#007BFF',
      },
      backdropBlur: {
        'xl': '20px',
      },
    },
  },
  plugins: [],
}
