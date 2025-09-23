import { unicornPlugin } from '../plugins'
import { type FlatConfig, type RuleOverrides } from '../types'

export const unicorn = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'niki/unicorn/rules',
    plugins: {
      unicorn: unicornPlugin
    },
    rules: {
      ...unicornPlugin.configs.recommended.rules,

      // Too opinionated
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',

      ...overrides
    }
  }
]
