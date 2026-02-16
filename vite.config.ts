import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        external: ['docx', '@google/genai']
      }
    },
    define: {
      // Define specific strings for replacement. 
      // Avoid replacing 'process' or 'process.env' as objects to prevent 
      // circular structure issues when dev tools or libraries inspect them.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.HF_TOKEN': JSON.stringify(env.HF_TOKEN || env.VITE_HF_TOKEN),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'global': 'window'
    }
  };
});