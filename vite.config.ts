
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Instruímos o Rollup a NÃO tentar resolver esses pacotes no build,
      // pois eles serão resolvidos pelo navegador via importmap.
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'lucide-react',
        'react-router-dom',
        '@google/genai',
        '@supabase/supabase-js'
      ],
    },
  },
  optimizeDeps: {
    // Evita que o Vite tente pré-empacotar esses módulos no desenvolvimento
    exclude: [
      'react',
      'react-dom',
      'lucide-react',
      'react-router-dom',
      '@google/genai',
      '@supabase/supabase-js'
    ],
  },
});
