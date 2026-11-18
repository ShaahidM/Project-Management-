/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './public/script.js',
    './public/login.html'
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        offWhite: '#fafafa',
        black: '#121212',
      }
    },
  },
  plugins: [],
}