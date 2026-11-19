import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' lets the built site run from any path, including GitHub Pages and Vercel
export default defineConfig({
  base: './',
  plugins: [react()],
});
