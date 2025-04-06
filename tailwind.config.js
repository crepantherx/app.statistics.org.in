/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        dark: {
        'dark-light': '#1e1e1e',
        'dark-lighter': '#2d2d2d'
        }
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["dark"],
  },
}