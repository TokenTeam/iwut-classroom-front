import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true // 强制转换 CommonJS 模块
    },rollupOptions: {
      external: [
        /^node:.*/, // 排除所有node:协议模块
        'fs',
        'path',
        'os',
        'child_process'
      ],
      output: {
        manualChunks: {
          tdesign: ['tdesign-vue-next'] // 优化UI库打包
        }
      }
    }
  },
  optimizeDeps: {
    exclude: [
      'fs',
      'node:fs',
      'node:path'
    ],
    include: [
      'tdesign-vue-next/esm/components/loading',
      'tdesign-vue-next/esm/components/alert'
    ]
  },
  define: {
    // 注入全局变量
    'process.env': {},
    'global': {}
  }
  ,server: {
    proxy: {
      '/api': {
        target: 'https://classroom.iwut-api.heavensdoor.cn/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
