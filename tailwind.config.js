/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        ink: "var(--ink)",
        muted: "var(--ink-soft)",
        card: "var(--card)",
        line: "var(--line)",
        sage: "var(--sage)",
        "sage-2": "var(--sage-2)",
        fill: "var(--fill)",
        terra: "var(--terra)",
        gold: "var(--gold)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-unbounded)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lazy: "var(--shadow)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
