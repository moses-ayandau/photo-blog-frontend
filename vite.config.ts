import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// Polyfill imports
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::', // Bind to all IPv4 and IPv6 addresses
    port: 8080, // Custom port
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Ensure 'buffer' is resolved correctly
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable polyfills for Node.js globals
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true, // Polyfill Buffer
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        // Rollup plugin for Node polyfills
        rollupNodePolyFill(),
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true, // Handle mixed CommonJS/ESM modules
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
  },
}));