import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Wild Pages forest palette.
        forest: {
          deep: "#0a1f0a", // the always-stable nav green
          dark: "#0d2612",
          mid: "#143a1c",
          moss: "#7fb069",
        },
        ember: {
          DEFAULT: "#ff7a3d",
          soft: "#ffb154",
          deep: "#c2410c",
        },
        gold: "#f2c14e",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        easy: ["var(--font-easy)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "46rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
