import type { Config } from "tailwindcss";

// ============================================================================
// THE BRIEF — Design System 2.0: Foundation
//
// Direction: intelligence console, not terminal emulator. Neutral white/gray
// carries most of the UI; green is a status signal (on-track/progress/
// success), not a default interactive color; mono type is reserved for
// eyebrows, system messages, and command-line moments rather than every
// string in the app. See .claude/plans (Design System 2.0) for the full
// philosophy this token set is built against.
// ============================================================================

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050506",
        surface: {
          DEFAULT: "#0A0A0B",
          raised: "#111113",
          overlay: "#17171A",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          subtle: "rgba(255,255,255,0.05)",
          strong: "rgba(255,255,255,0.16)",
        },
        ink: {
          primary: "#F2F3F5",
          secondary: "#9CA3AF",
          tertiary: "#5B6472",
        },
        // Status signal — on-track, progress, success. No longer the
        // default interactive/link color.
        signal: {
          DEFAULT: "#10B981",
          dim: "#062B21",
          bright: "#34D399",
        },
        // Priority/urgency accent.
        seal: {
          DEFAULT: "#F59E0B",
          dim: "#3A2A0A",
          bright: "#FBBF24",
        },
        // Secondary accent — informational, not primary CTA.
        accent: {
          DEFAULT: "#3B82F6",
          dim: "#0B1B33",
          bright: "#60A5FA",
        },
        status: {
          onTrack: "#10B981",
          atRisk: "#EF4444",
          neutral: "#71717A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)",
        elevated: "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
      },
      keyframes: {
        "scan-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-signal": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scan-sweep": "scan-sweep 2.4s ease-in-out infinite",
        "pulse-signal": "pulse-signal 2.4s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
