import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      ['onnxruntime-web']: 'onnxruntime-web/dist/ort.es6.min.js',
    },
  },
  base: '/latentwt/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (['onnxruntime-web', '@vue'].some(h => id.includes(h))) return 'runtime';
            if (['chart.js', 'vue-chartjs', 'naive-ui'].some(h => h.includes(h))) return 'ui';
          }
        },
      },
    },
  },
});
