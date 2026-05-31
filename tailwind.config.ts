import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kno: {
          green: "#57C985",
          "green-hover": "#4ab874",
          "green-press": "#3da866",
          "green-soft": "rgba(87, 201, 133, 0.12)",
          black: "#050505",
          white: "#FFFFFF",
          "bg-dark": "#0B0D0E",
          "bg-elev-dark": "#14171a",
          "border-dark": "#1F2326",
          "border-strong-dark": "#2A2F33",
          "text-gray": "#6B7280",
          "text-gray-dark": "#9CA3AF",
          "border-gray": "#E5E7EB",
          "border-strong": "#D1D5DB",
          "surface-gray": "#F9FAFB",
          "success-mint": "#D1FAE5",
          "success-fg": "#065F46",
          "error-red": "#DC2626",
          "error-bg": "#FEE2E2",
          "error-border": "#FECACA",
          "warn-bg": "#FEF3C7",
          "warn-fg": "#92400E",
          "warn-border": "#FDE68A",
          "warn-amber": "#D97706",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Geist Mono",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "kno-h1": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "kno-h2": ["28px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "kno-h3": ["22px", { lineHeight: "30px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "kno-body": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "kno-small": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "kno-mono": ["14px", { lineHeight: "22px", fontWeight: "400" }],
      },
      spacing: {
        "kno-1": "4px",
        "kno-2": "8px",
        "kno-3": "12px",
        "kno-4": "16px",
        "kno-5": "20px",
        "kno-6": "24px",
        "kno-8": "32px",
        "kno-10": "40px",
        "kno-12": "48px",
        "kno-16": "64px",
        "kno-20": "80px",
        "kno-24": "96px",
      },
      borderRadius: {
        "kno-sm": "4px",
        "kno-md": "6px",
        "kno-lg": "10px",
        "kno-xl": "14px",
      },
      boxShadow: {
        "kno-xs": "0 1px 1px rgba(5, 5, 5, 0.04)",
        "kno-sm": "0 1px 2px rgba(5, 5, 5, 0.06), 0 1px 1px rgba(5, 5, 5, 0.04)",
        "kno-md": "0 4px 12px rgba(5, 5, 5, 0.08), 0 1px 2px rgba(5, 5, 5, 0.04)",
        "kno-lg": "0 12px 32px rgba(5, 5, 5, 0.10), 0 2px 6px rgba(5, 5, 5, 0.05)",
        "kno-focus": "0 0 0 3px rgba(87, 201, 133, 0.35)",
      },
      transitionTimingFunction: {
        "kno-out": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        "kno-fast": "120ms",
        "kno-base": "180ms",
        "kno-slow": "320ms",
      },
      keyframes: {
        knoFadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "kno-fade-up": "knoFadeUp 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      maxWidth: {
        "kno-content": "1200px",
        "kno-content-wide": "1280px",
        "kno-prose": "760px",
      },
    },
  },
  plugins: [],
};

export default config;
