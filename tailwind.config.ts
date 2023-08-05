import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
      },
      strokeWidth: {
        3: "3",
      },
      colors: {
        red: { DEFAULT: colors.rose[500], dark: colors.rose[800] },
        blue: { DEFAULT: colors.blue[500], dark: colors.blue[800] },
        green: { DEFAULT: colors.emerald[500], dark: colors.emerald[800] },
        yellow: { DEFAULT: colors.yellow[400], dark: colors.yellow[700] },
        purple: { DEFAULT: colors.purple[500], dark: colors.purple[800] },
        orange: { DEFAULT: colors.orange[500], dark: colors.orange[800] },
        cyan: { DEFAULT: colors.cyan[500], dark: colors.cyan[800] },
        pink: { DEFAULT: colors.pink[400], dark: colors.pink[700] },
        black: { DEFAULT: colors.stone[600], dark: colors.stone[900] },
        // #bfbab7 a.k.a. colors.stone[350]
        white: { DEFAULT: colors.stone[100], dark: "#bfbab7" },
        tile: {
          DEFAULT: colors.orange[100],
          line: colors.orange[900],
          edge: colors.orange[800],
        },
        board: colors.orange[200],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
