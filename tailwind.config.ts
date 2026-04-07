import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'k3-blue': '#0A4A8E',
        'k3-green': '#1DB954', // Bisa disesuaikan dengan warna persis K3
      },
    },
  },
  plugins: [],
} satisfies Config
