/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E8741A",
          dark: "#1A1A1A",
          teal: "#0D4A52",
          cream: "#FDF6EC",
        },
      },
    },
  },
  plugins: [],
}
