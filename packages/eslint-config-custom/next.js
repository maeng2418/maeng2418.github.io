// ESLint 9 flat config — Next.js 앱용 변형 (SPEC ②③에서 확장 예정)
// Next.js 앱 워크스페이스는 이 설정에 eslint-config-next(flat) 프리셋을 추가해 사용한다.
const base = require('./base')

module.exports = [
  ...base,
  {
    rules: {
      // Next.js 앱 전용 룰은 SPEC ②③에서 eslint-config-next 도입과 함께 추가한다.
    },
  },
]
