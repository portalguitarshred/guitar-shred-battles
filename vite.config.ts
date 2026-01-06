import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      // Informamos ao Rollup que estes pacotes não devem ser incluídos no bundle.
      // Eles serão resolvidos em tempo de execução pelo importmap no index.html.
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
