/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Allows access from local network
    port: 4400, // Default port (you can change this if needed)
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into their own chunks so the main
        // bundle stays small and chunks can be cached independently.
        // Function form: Vite 8 (Rolldown) no longer accepts the object form.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(
              id,
            )
          )
            return 'react-vendor';
          if (
            /[\\/]node_modules[\\/](@tiptap|prosemirror-[^\\/]+)[\\/]/.test(id)
          )
            return 'editor';
          if (/[\\/]node_modules[\\/]@dnd-kit[\\/]/.test(id)) return 'dnd';
          if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return 'query';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
