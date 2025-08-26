/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // vibrant blue
        secondary: "#fcaf45", // pastel orange
        accent: "#ff6b6b", // coral/red accent
        neutral: "#f5f6fa", // very light gray
        card: "#ffffff", // white for cards
        dark: "#1e293b", // dark blue-gray
        success: "#22c55e", // green
        warning: "#facc15", // yellow
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #2563eb 0%, #ff6b6b 100%)',
        'gradient-hero': 'linear-gradient(180deg, #2563eb 0%, #fcaf45 100%)',
         'gradient-video': 'linear-gradient(180deg, #fcaf45 0%, #2563eb 100%)', // pentru video
      },
    },
  },
  plugins: [],
}