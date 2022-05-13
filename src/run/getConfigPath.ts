// edit from rollup/cli/run/getConfigPath

import { promises as fs } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'

export async function getRollupConfigPath(commandConfig: string): Promise<string> {
  const DEFAULT_CONFIG_BASE = 'rollup.config'

  if (commandConfig === '') {
    return resolve(await findConfigFileNameInCwd(DEFAULT_CONFIG_BASE))
  }
  if (commandConfig.slice(0, 5) === 'node:') {
    const pkgName = commandConfig.slice(5)
    try {
      return require.resolve(`rollup-config-${pkgName}`, { paths: [cwd()] })
    } catch {
      try {
        return require.resolve(pkgName, { paths: [cwd()] })
      } catch (err: any) {
        if (err.code === 'MODULE_NOT_FOUND') {
          throw new Error(`Could not resolve config file "${commandConfig}"`)
        }
        throw err
      }
    }
  }
  return resolve(commandConfig)
}

export async function getServerConfigPath(commandConfig: string): Promise<string> {
  const DEFAULT_CONFIG_BASE = 'server.config'
  if (commandConfig === '') {
    return resolve(await findConfigFileNameInCwd(DEFAULT_CONFIG_BASE))
  }
  return resolve(commandConfig)
}

async function findConfigFileNameInCwd(configBase: string): Promise<string> {
  const filesInWorkingDir = new Set(await fs.readdir(cwd()))
  for (const extension of ['mjs', 'cjs', 'ts']) {
    const fileName = `${configBase}.${extension}`
    if (filesInWorkingDir.has(fileName)) return fileName
  }
  return `${configBase}.js`
}
