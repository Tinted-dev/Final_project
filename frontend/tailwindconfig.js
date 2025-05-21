/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: "#1f2937",
          accent: "#4ade80"
        }
      }
    },
    darkMode: 'class', // Enable dark mode
    plugins: []
  }
  