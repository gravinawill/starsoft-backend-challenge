import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/main/server.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  exports: true,
  platform: 'node',
  noExternal: [
    '@niki/domain',
    '@niki/env',
    '@niki/logger',
    '@niki/message-broker',
    '@niki/token',
    '@niki/utils',
    '@niki/crypto'
  ]
})
