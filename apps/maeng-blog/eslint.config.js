// ESLint 9 flat config — 공유 eslint-config-custom next variant 사용
const next = require('eslint-config-custom/next')

module.exports = [
  {
    ignores: ['out/**', 'next-env.d.ts', 'public/**', '.turbo/**'],
  },
  ...next,
  {
    // Node ESM 빌드 스크립트 (scripts/*.mjs)
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
]
