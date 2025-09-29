import fs from 'node:fs/promises'

import { defineConfig } from 'czg'

const getDirectories = async (source: string) => {
  const directories = await fs.readdir(source, { withFileTypes: true })

  return directories.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)
}

const apps = await getDirectories(`${import.meta.dirname}/apps`)
const packages = await getDirectories(`${import.meta.dirname}/packages`)
const configs = await getDirectories(`${import.meta.dirname}/configs`)

const scopes = [...apps, ...packages, ...configs]

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['release', 'workspace', ...scopes]],
    'header-max-length': [2, 'always', 200]
  },
  prompt: {
    customScopesAlign: 'top'
  }
})
