/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ["text-gradeGreen", "text-gradeYellow", "text-gradeRed"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        black: "#000",
        primary: "#95EBA3",
        yellowLight: "#e4eb95",
        yellow: "#ffd646",
        orange200: "#EBAF95",
        orange600: "#FFAA46",
        primaryLight: "#D7F5C8",
        error: "#FF5555",
        errorLight: "#EB9595",
        grey500: "#555555",
        dark800: "#333333",
        unhighlightedFill: "#555",
        highlightedFill: "#95EBA3",
        unhighlightedStroke: "#464646",
        highlightedStroke: "#95EBA3",
        gradeGreen: "#95EBA3",
        gradeYellow: "#FFD337",
        gradeRed: "#EBAF95",
      },
      dropShadow: {
        customShadow: "0px 2.5px 1.25px rgba(0, 0, 0, 0.60)",
      },
      letterSpacing: {
        tightest: "0.01em",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".stroke-1": {
          strokeWidth: "1px",
        },
      });
    },
  ],
};
