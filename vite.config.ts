import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Garante que referências a process.env não causem crash no navegador
    'process.env': 'window.process.env',
    'global': 'window'
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react-router-dom',
        'lucide-react',
        '@google/genai',
        '@supabase/supabase-js'
      ]
    }
  },
  server: {
    port: 3000
  }
});
