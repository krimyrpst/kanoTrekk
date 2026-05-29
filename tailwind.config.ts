import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1320",
        water: {
          50: "#eef9ff",
          100: "#daf1ff",
          200: "#bce6ff",
          300: "#8dd6ff",
          400: "#56beff",
          500: "#2fa1f5",
          600: "#1683df",
          700: "#1369b2",
          800: "#155890",
          900: "#164a75",
        },
        sun: "#ffb648",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
