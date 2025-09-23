import { vitestPlugin } from '../plugins'
import { type FlatConfig, type RuleOverrides } from '../types'

export const vitest = (glob: string, overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'niki/vitest/rules',
    files: [glob],
    plugins: {
      vitest: vitestPlugin
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,

      ...overrides
    }
  }
]
