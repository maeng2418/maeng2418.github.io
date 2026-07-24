import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    // 기본 node 환경. Milkdown(ProseMirror) DOM 의존 테스트는 파일별
    // `// @vitest-environment jsdom` 프래그마로 개별 전환한다 (M3 직렬화 테스트).
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
