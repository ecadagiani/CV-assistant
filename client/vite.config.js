/* eslint import/no-extraneous-dependencies: 0 */
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  envDir: '../',
  plugins: [svgr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      src: '/src',
    },
  },
});
