import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './src/server.ts',
  format: 'esm',
  noExternal: [
    '@niki/crypto',
    '@niki/domain',
    '@niki/env',
    '@niki/logger',
    '@niki/message-broker',
    '@niki/eslint-config',
    '@niki/typescript-config',
    '@niki/prettier-config',
    '@niki/token',
    '@niki/utils'
  ],
  platform: 'node',
  alias: {
    '@errors/*': './src/domain/errors/*',
    '@use-cases/*': './src/application/use-cases/*',
    '@repository-contracts/*': './src/domain/repository-contracts/*',
    '@infra/*': './src/infra/*',
    '@factories/*': './src/main/factories/*',
    '@controllers/*': './src/main/controllers/*',
    '@routes/*': './src/main/routes/*',
    '@main/*': './src/main/*'
  },
  unbundle: false,
  outDir: './dist',
  clean: true,
  tsconfig: './tsconfig.json',
  cjsDefault: false,
  sourcemap: false,
  outputOptions: {
    inlineDynamicImports: true
  },
  external: ['pino', 'pino-pretty']
})
