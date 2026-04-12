import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/absensiTADbk3smd/', // Aktifkan jika deploy ke Github Pages
  base: '/', // Gunakan '/' untuk deployment ke Vercel atau domain utama
})
