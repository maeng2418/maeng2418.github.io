import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // React 17+ automatic JSX runtime — 페이지/컴포넌트(.tsx) 렌더 테스트용
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
