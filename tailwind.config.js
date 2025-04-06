/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#000000',
        dark: {
        'dark-light': '#000000',
        'dark-lighter': '#000000'
        }
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["dark"],
  },
}