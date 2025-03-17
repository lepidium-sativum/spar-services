/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        black: "#000",
        placeholder: "#999999",
        primary: "#95EBA3",
        yellowLight: "#e4eb95",
        yellow: "#ffd646",
        orange200: "#EBAF95",
        orange600: "#EF1D04",
        primaryLight: "#D7F5C8",
        error: "#FF5555",
        errorLight: "#EB9595",
        grey500: "#555555",
        dark700: "#272727",
        dark800T: "#333333B2",
        dark900: "#1F1F1F",
        bgInput: "#333333",
      },
    },
  },
  plugins: [],
};
