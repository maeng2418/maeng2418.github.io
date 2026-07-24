// ESLint 9 flat config — 공유 eslint-config-custom next variant 사용 (REQ-EDITOR-001/012)
const next = require('eslint-config-custom/next')

module.exports = [
  {
    ignores: ['.next/**', 'next-env.d.ts', '.turbo/**'],
  },
  ...next,
]
