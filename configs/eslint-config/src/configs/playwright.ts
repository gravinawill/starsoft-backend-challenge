import globals from 'globals'

import { playwrightPlugin } from '../plugins'
import { type FlatConfig, type RuleOverrides } from '../types'

export const playwright = (glob: string, overrides?: RuleOverrides): FlatConfig[] => [
  {
    name: 'niki/playwright/setup',
    languageOptions: {
      globals: globals['shared-node-browser']
    }
  },
  {
    name: 'niki/playwright/rules',
    files: [glob],
    plugins: {
      playwright: playwrightPlugin
    },
    rules: {
      ...playwrightPlugin.configs.recommended.rules,

      ...overrides
    }
  }
]
