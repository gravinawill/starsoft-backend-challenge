import { commandPlugin } from '../plugins'
import { type FlatConfig } from '../types'

export const command = (): FlatConfig[] => [
  {
    ...commandPlugin(),
    name: 'niki/command/rules'
  }
]
