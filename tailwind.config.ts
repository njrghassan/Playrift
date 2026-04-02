import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "on-primary-fixed": "#07006c",
        "on-surface": "#dae2fd",
        error: "#ffb4ab",
        "surface-bright": "#31394d",
        "surface-container-highest": "#2d3449",
        "on-tertiary-container": "#452000",
        "surface-container-low": "#131b2e",
        "surface-tint": "#c0c1ff",
        surface: "#0b1326",
        "on-secondary-fixed": "#0d1c2d",
        "secondary-fixed-dim": "#b9c8de",
        "primary-fixed": "#e1e0ff",
        "on-tertiary-fixed": "#301400",
        "on-primary-fixed-variant": "#2f2ebe",
        "on-background": "#dae2fd",
        "on-tertiary": "#4f2500",
        "primary-fixed-dim": "#c0c1ff",
        "on-secondary": "#233143",
        "on-primary": "#1000a9",
        "surface-container": "#171f33",
        "surface-container-lowest": "#060e20",
        "on-tertiary-fixed-variant": "#703700",
        "error-container": "#93000a",
        "on-primary-container": "#0d0096",
        "on-secondary-container": "#a7b6cc",
        primary: "#c0c1ff",
        "tertiary-container": "#d97721",
        "surface-variant": "#2d3449",
        secondary: "#b9c8de",
        "tertiary-fixed-dim": "#ffb783",
        "outline-variant": "#464554",
        tertiary: "#ffb783",
        "inverse-on-surface": "#283044",
        "on-error": "#690005",
        background: "#0b1326",
        "on-secondary-fixed-variant": "#39485a",
        "on-error-container": "#ffdad6",
        "secondary-fixed": "#d4e4fa",
        "surface-container-high": "#222a3d",
        "inverse-primary": "#494bd6",
        "primary-container": "#8083ff",
        "surface-dim": "#0b1326",
        "on-surface-variant": "#c7c4d7",
        "tertiary-fixed": "#ffdcc5",
        "secondary-container": "#39485a",
        outline: "#908fa0",
        "inverse-surface": "#dae2fd"
      },
      fontFamily: {
        headline: ["var(--font-manrope)", "system-ui", "sans-serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
        label: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      }
    }
  },
  plugins: []
};

export default config;
