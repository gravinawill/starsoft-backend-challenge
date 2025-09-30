import { defineConfig } from '@niki/eslint-config'

export default defineConfig(
  {},
  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      'sonarjs/todo-tag': 'off'
    },
    ignores: ['generated/prisma']
  }
)
