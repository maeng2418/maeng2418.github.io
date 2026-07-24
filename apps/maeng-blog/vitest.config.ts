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
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,tsx}'],
    // 픽스처 재배치(REQ-MIG-004/005): 테스트는 실콘텐츠 대신 테스트 소유 픽스처 디렉터리를 읽는다
    env: {
      MAENG_CONTENT_DIR: path.resolve(__dirname, 'src/lib/content/__tests__/fixtures/content'),
    },
  },
})
