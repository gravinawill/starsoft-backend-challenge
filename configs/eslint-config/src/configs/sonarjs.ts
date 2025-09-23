import { sonarjsPlugin } from '../plugins'
import { type FlatConfig, type RuleOverrides } from '../types'

export const sonarjs = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'niki/sonarjs/rules',
    plugins: {
      sonarjs: sonarjsPlugin
    },
    rules: {
      ...sonarjsPlugin.configs.recommended.rules,

      /*
       * Disable due to poor performance
       * https://community.sonarsource.com/t/eslint-plugin-sonarjs-performance-issues-on-large-codebase/138392
       */
      'sonarjs/no-commented-code': 'off',

      ...overrides
    }
  }
]
