/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        accent: "#EC4899",
        surface: "#FFFFFF",
        background: "#F9FAFB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "mobile-xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "mobile-caption": ["0.6875rem", { lineHeight: "1rem" }],
        "mobile-body": ["0.875rem", { lineHeight: "1.25rem" }],
        "xs": ["0.8125rem", { lineHeight: "1.125rem" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "base": ["1rem", { lineHeight: "1.5rem" }],
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5625rem", { lineHeight: "2rem" }],
        "3xl": ["1.953rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.441rem", { lineHeight: "2.5rem" }]
      },
      borderRadius: {
        card: "0.75rem",
        button: "0.5rem",
        input: "0.5rem",
        badge: "9999px"
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.12)",
        dropdown: "0 8px 24px rgba(0, 0, 0, 0.12)",
        modal: "0 16px 32px rgba(0, 0, 0, 0.16)",
        fab: "0 4px 12px rgba(99, 102, 241, 0.3)"
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms"
      },
      zIndex: {
        base: "10",
        dropdown: "40",
        sticky: "45",
        modal: "50",
        toast: "60",
        tooltip: "70"
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        "gradient-accent": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
      },
      animation: {
        "heart-beat": "heartbeat 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out"
      },
      keyframes: {
        heartbeat: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      }
    },
  },
  plugins: [],
}