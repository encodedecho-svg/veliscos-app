import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        veliscos: {
          primary: "#0A0A0A",
          secondary: "#1A1A2E",
          surface: "#FAFAFA",
          "surface-alt": "#F0F4F5",
          card: "#FFFFFF",
          accent: "#4A90A4",
          "accent-light": "#6BB5CC",
          gold: "#C5A572",
          text: "#1A1A1A",
          "text-muted": "#6B7280",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        heading: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.06)",
        lift: "0 12px 48px rgba(0,0,0,0.10)",
      },
      borderRadius: {
        veliscos: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
