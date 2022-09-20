import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import {viteStaticCopy} from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.onnx'],
  plugins: [vue(), VitePWA({
    strategies: 'generateSW',
    workbox: {
      globPatterns: ['*.wasm', '*.onnx'],
    },
    manifest: {
      id: 'com.github.solarliner.latentwt',
      name: 'Latent Wavetables',
    }
  }), viteStaticCopy({
    targets: [{
      src: './node_modules/onnxruntime-web/dist/*.wasm',
      dest: '',
    }],
  })],
  resolve: {
    alias: {
      'onnxruntime-web': 'onnxruntime-web/dist/ort.es6.min.js',
    },
  },
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
