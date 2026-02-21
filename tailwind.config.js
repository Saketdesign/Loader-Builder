/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505', // Ultra deep black
        card: '#0A0A0A', // Slightly lighter for cards/panels

        // UI Elements
        primary: '#F97316', // Orange (Action/Active)
        primaryHover: '#EA580C',

        secondary: '#18181B', // Zinc-900 (Inputs, Secondary Buttons)
        secondaryHover: '#27272A', // Zinc-800

        accent: '#8B5CF6', // Purple (Special/AI)

        destructive: '#EF4444',
        muted: '#71717A', // Zinc-500 (Labels)

        border: '#27272A', // Zinc-800 (Subtle borders)
        input: '#18181B',
        ring: '#F97316',
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
