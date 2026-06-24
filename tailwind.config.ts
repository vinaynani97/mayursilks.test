import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#550022",
          50: "#eee6e9",
          100: "#cab0ba",
          200: "#b18a99",
          300: "#8d546b",
          400: "#77334e",
          500: "#550022",
          600: "#4d001f",
          700: "#3c0018",
          800: "#2f0013",
          900: "#24000e",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#fcd146",
          50: "#fffaed",
          100: "#fef1c6",
          200: "#feeaaa",
          300: "#fde083",
          400: "#fdda6b",
          500: "#fcd146",
          600: "#e5be40",
          700: "#b39432",
          800: "#8b7327",
          900: "#6a581d",
          foreground: "#0f0f10",
        },
        cream: {
          DEFAULT: "#faf7f2",
          50: "#fdfcf9",
          100: "#faf7f2",
          200: "#f5efe3",
          300: "#ede0cb",
        },
        gold: "#fcd146",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        josefin: ["var(--font-josefin)", "sans-serif"],
        jost: ["var(--font-jost)", "sans-serif"],
        general: ["var(--font-general)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(40px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
      },
      backgroundImage: {
        "luxury-gradient": "linear-gradient(135deg, #550022 0%, #3c0018 50%, #2f0013 100%)",
        "gold-gradient": "linear-gradient(135deg, #fcd146 0%, #b39432 100%)",
        "cream-gradient": "linear-gradient(180deg, #faf7f2 0%, #f5efe3 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
