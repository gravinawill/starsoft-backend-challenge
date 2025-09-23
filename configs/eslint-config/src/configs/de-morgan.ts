import { deMorganPlugin } from '../plugins'
import { type FlatConfig, type RuleOverrides } from '../types'

export const deMorgan = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'niki/de-morgan/rules',
    plugins: {
      'de-morgan': deMorganPlugin
    },
    rules: {
      ...deMorganPlugin.configs.recommended.rules,

      ...overrides
    }
  }
]
