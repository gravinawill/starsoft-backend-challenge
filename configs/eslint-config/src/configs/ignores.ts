import { type FlatConfig } from '../types'

export const ignores = (userIgnores: string[] = []): FlatConfig[] => [
  {
    name: 'niki/ignores',
    ignores: [...userIgnores]
  }
]
