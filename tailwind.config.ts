import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Obsidian Flow" design tokens (from your provided HTML)
        surface: "#0b1326",
        "on-surface": "#dae2fd",
        primary: "#c0c1ff",
        "primary-container": "#8083ff",
        tertiary: "#ffb783",
        error: "#ffb4ab",
        "surface-bright": "#31394d",
        "surface-container-highest": "#2d3449",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-container-high": "#222a3d",
        "surface-container-lowest": "#060e20",
        "outline-variant": "#464554",
        "on-surface-variant": "#c7c4d7",
        "on-primary": "#1000a9",
        "on-primary-container": "#0d0096",
        "on-secondary": "#233143",
        secondary: "#b9c8de",
        "secondary-fixed-dim": "#b9c8de"
      },
      fontFamily: {
        headline: ["Manrope", "system-ui"],
        body: ["Manrope", "system-ui"],
        label: ["Space Grotesk", "ui-monospace", "SFMono-Regular"]
      },
      borderRadius: { DEFAULT: "0.25rem" }
    }
  },
  plugins: []
};

export default config;
