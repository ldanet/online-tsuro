/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      strokeWidth: {
        3: 3,
        4: 4,
        5: 5,
      },
    },
    colors: {
      red: { DEFAULT: "#f43f5e", dark: "#be123c" },
      blue: { DEFAULT: "#3b82f6", dark: "#1e3fae" },
      green: { DEFAULT: "#10b981", dark: "#047857" },
      yellow: { DEFAULT: "#eab308", dark: "#a26107" },
      purple: { DEFAULT: "#b46aff", dark: "#7e22ce" },
      orange: { DEFAULT: "#f97316", dark: "#c2410c" },
      cyan: { DEFAULT: "#06b6d4", dark: "#0e7490" },
      pink: { DEFAULT: "#f472b6", dark: "#db2777" },
      black: { DEFAULT: "#44403c", dark: "#1c1917" },
      white: { DEFAULT: "#f5f5f4", dark: "#d6d3d1" },
      tile: {
        DEFAULT: "hsl(212, 75%, 72%)",
        line: "hsl(230, 50%, 28%)",
        edge: "hsl(230, 50%, 34%);",
      },
      board: "hsl(212, 75%, 83%)",
    },
  },
  plugins: [],
};
