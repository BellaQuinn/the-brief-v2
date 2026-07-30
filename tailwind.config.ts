import type { Config } from "tailwindcss";

// ============================================================================
// THE BRIEF — Design tokens
//
// Direction: full retro CRT terminal. Green phosphor on black, amber
// reserved as the one "seal" accent (priority flags, active nav rail).
// Monospace everywhere — there is no separate display/body face anymore.
// ============================================================================

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#050A05",
          raised: "#081006",
          overlay: "#0C1608",
        },
        border: {
          DEFAULT: "#164016",
          subtle: "#0C260C",
          strong: "#1F5C1F",
        },
        ink: {
          primary: "#33FF33",
          secondary: "#2BB82B",
          tertiary: "#1C7A1C",
        },
        signal: {
          DEFAULT: "#33FF33",
          dim: "#123312",
          bright: "#7CFF7C",
        },
        seal: {
          DEFAULT: "#FFB000",
          dim: "#5C3D00",
          bright: "#FFCF59",
        },
        status: {
          onTrack: "#33FF33",
          atRisk: "#FF4D4D",
          neutral: "#2BB82B",
        },
      },
      fontFamily: {
        display: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-mono)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(51,255,51,0.05) inset",
      },
      keyframes: {
        "scan-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-signal": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "scan-sweep": "scan-sweep 2.4s ease-in-out infinite",
        "pulse-signal": "pulse-signal 2s ease-in-out infinite",
      },
      borderRadius: {
        card: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
