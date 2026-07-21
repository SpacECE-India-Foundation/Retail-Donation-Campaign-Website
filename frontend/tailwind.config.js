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
          "orange-hover": "#D86712",
          dark: "#1A1A1A",
          teal: "#0D4A52",
          cream: "#FFF8F2",
          border: "#ECECEC",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"DM Sans"', "sans-serif"],
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        progressFill: {
          from: { width: "0%" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "progress-fill": "progressFill 1s ease-out forwards",
      },
    },
  },
  plugins: [],
}
