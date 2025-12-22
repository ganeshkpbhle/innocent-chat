import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the app to access your API key locally
    'process.env.API_KEY': JSON.stringify('YOUR_GEMINI_API_KEY_HERE')
  }
})
