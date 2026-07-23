// ESLint 9 flat config — 공통 베이스 (plan.md §D.4)
// 기존 packages/eslint-config-custom/base.js(.eslintrc 레거시 포맷)를 계승하되
// flat config 배열 export 형태로 재작성했다.
const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const prettier = require('eslint-config-prettier')

module.exports = tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    // CommonJS 설정 파일(.js/.cjs — eslint.config.js, next.config.js 등) 허용
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  }
)
