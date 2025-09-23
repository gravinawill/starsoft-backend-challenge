import { prettierPlugin, prettierPluginRecommended } from '../plugins'
import { type FlatConfig, type RuleOverrides } from '../types'

export const prettier = (overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'niki/prettier/rules',
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierPluginRecommended.rules,

      ...overrides
    }
  }
]
