/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        camp: {
          blue: '#0891b2',
          green: '#059669',
          orange: '#ea580c',
          sand: '#f59e0b',
        }
      },
      fontFamily: {
        'camp': ['System'],
      }
    },
  },
  plugins: [],
}