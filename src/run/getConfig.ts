// idea from rollup loadConfigFile

import { getConfigFile } from './getConfigFile'
import { extname, isAbsolute } from 'path'
import { getDefaultFromCjs, supportsNativeESM } from '../utils'
import { pathToFileURL } from 'url'
import { rollup } from 'rollup'

import { Module } from 'module'
import { promises as fs } from 'fs'
import { RunConfig } from '../types/types'

// path '': return {}
// path exit: return config
// path not exit: return err, file node finde

export async function getConfig(path: string, basename: string): Promise<Partial<RunConfig>> {
  const filePath = await getConfigFile(path, basename)
  try {
    await fs.access(filePath)
    const config = await getConfigExport(filePath)

    return config
  } catch (err: any) {
    if (path) {
      console.error(`Error: file not found: ${path}`)
      throw new Error(err)
    }

    return {}
  }
}

async function getConfigExport(filePath: string) {
  try {
    const ext = extname(filePath)

    if (ext === '.cjs') {
      const configCjs = getDefaultFromCjs(require(filePath))
      return configCjs
    }

    if (ext === '.mjs' && supportsNativeESM()) {
      const configMjs = await import(filePath)
      return configMjs
    }

    const code = await transformToCjsCode(filePath)
    const config = loadConfigFromCode(filePath, code)

    return config
  } catch (err) {
    return {}
  }
}

function loadConfigFromCode(filePath: string, code: string) {
  const module = new Module(filePath + '?cache') as NodeModuleWithCompile

  // use private function, not a good idea,
  // but source code use vm.runInContext which is not recommand
  module._compile(code, filePath)

  // adept export defult / module.exports
  const config = module.exports.default || module.exports
  return config
}

async function transformToCjsCode(filePath: string) {
  const inputOptions = {
    external: (id: string) => {
      const temp = (id[0] !== '.' && !isAbsolute(id)) || id.slice(-5, id.length) === '.json'
      console.log('temp', temp)
      return temp
    },
    input: filePath,
  }

  const bundle = await rollup(inputOptions)

  const {
    output: [{ code }],
  } = await bundle.generate({
    exports: 'named',
    format: 'cjs',
    plugins: [
      {
        name: 'transpile-import-meta',
        resolveImportMeta(property, { moduleId }) {
          if (property === 'url') {
            return `'${pathToFileURL(moduleId).href}'`
          }
          if (property == null) {
            return `{url:'${pathToFileURL(moduleId).href}'}`
          }
        },
      },
    ],
  })
  return code
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}
