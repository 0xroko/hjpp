/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accents: {
          0: "rgb(var(--accents-0) / <alpha-value>)",
          1: "rgb(var(--accents-1) / <alpha-value>)",
          2: "rgb(var(--accents-2) / <alpha-value>)",
          3: "rgb(var(--accents-3) / <alpha-value>)",
          4: "rgb(var(--accents-4) / <alpha-value>)",
          5: "rgb(var(--accents-5) / <alpha-value>)",
          6: "rgb(var(--accents-6) / <alpha-value>)",
          7: "rgb(var(--accents-7) / <alpha-value>)",
          8: "rgb(var(--accents-8) / <alpha-value>)",
          9: "rgb(var(--accents-9) / <alpha-value>)",
        },
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        "search-highlight": "var(--search-highlight)",
      },
      keyframes: {
        slideDown: {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        slideUp: {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        slideDownAndFade: {
          "0%": { opacity: 0, transform: "translateY(-2px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideUpAndFade: {
          "0%": { opacity: 0, transform: "translateY(2px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
      animation: {
        slideDown: "slideDown 350ms cubic-bezier(0.87, 0, 0.13, 1)",
        slideUp: "slideUp 350ms cubic-bezier(0.87, 0, 0.13, 1)",
        slideDownAndFade:
          "slideDownAndFade 350ms cubic-bezier(0.87, 0, 0.13, 1)",
        slideUpAndFade: "slideUpAndFade 350ms cubic-bezier(0.87, 0, 0.13, 1)",
        fadeOut: "fadeOut 150ms cubic-bezier(0.87, 0, 0.13, 1)",
      },
      letterSpacing: {
        heading: "-0.5%",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
