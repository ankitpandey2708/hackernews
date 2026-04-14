// Migrated from src/tailwind.config.js
// Key change: content paths now scan .ex and .heex files instead of .jsx

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./js/**/*.js",
    "../lib/hn_digest_web/**/*.*ex",
    "../lib/hn_digest_web/**/*.heex",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body:    ["Outfit", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow:    "0 0 30px rgba(255, 107, 53, 0.15)",
        "glow-lg": "0 0 60px rgba(255, 107, 53, 0.2)",
      },
      keyframes: {
        "fade-up":  { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "fade-in":  { from: { opacity: "0" },                                 to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(30px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.95)" },       to: { opacity: "1", transform: "scale(1)" } },
        "shimmer":  { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(255, 107, 53, 0.2)" },
        },
      },
      animation: {
        "fade-up":    "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":    "fade-in 0.25s ease forwards",
        "slide-up":   "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":   "scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":    "shimmer 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "circ-out": "cubic-bezier(0, 0.55, 0.45, 1)",
      },
    },
  },
  plugins: [],
}
