
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill básico para process.env para evitar erros de AST no Rollup durante o build
    'process.env': 'process.env',
    'global': 'window'
  },
  build: {
    target: 'esnext',
    rollupOptions: {
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
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'lucide-react': 'Lucide'
        }
      }
    },
  },
  optimizeDeps: {
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
