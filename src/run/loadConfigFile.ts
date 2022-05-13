// edit from rollup/cli/run/loadConfigFile

import { extname, isAbsolute } from 'path'
import { pathToFileURL } from 'url'
import { version } from 'process'
import { rollup } from 'rollup'
import { promises as fs } from 'fs'

type ConfigObject = Record<string, any>

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

function supportsNativeESM(): boolean {
  return Number(/^v(\d+)/.exec(version)![1]) >= 13
}

function getDefaultFromCjs(namespace: ConfigObject): unknown {
  return namespace.__esModule ? namespace.default : namespace
}

export async function loadConfigFile(fileName: string): Promise<ConfigObject> {
  const extension = extname(fileName)

  const configFileExport = !(extension === '.cjs' || (extension === '.mjs' && supportsNativeESM()))
    ? await getDefaultFromTranspiledConfigFile(fileName)
    : extension === '.cjs'
    ? getDefaultFromCjs(require(fileName))
    : (await import(pathToFileURL(fileName).href)).default

  return getConfigList(configFileExport)
}

async function getDefaultFromTranspiledConfigFile(fileName: string): Promise<unknown> {
  const inputOptions = {
    external: (id: string) => (id[0] !== '.' && !isAbsolute(id)) || id.slice(-5, id.length) === '.json',
    input: fileName,
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
  return loadConfigFromBundledFile(fileName, code)
}

async function getConfigList(configFileExport: any): Promise<any[]> {
  const config = await (typeof configFileExport === 'function' ? configFileExport() : configFileExport)
  if (Object.keys(config).length === 0) {
    throw new Error('Config file must export an options object, or an array of options objects')
  }
  return config
}

async function loadConfigFromBundledFile(fileName: string, bundledCode: string): Promise<unknown> {
  const resolvedFileName = await fs.realpath(fileName)
  const extension = extname(resolvedFileName)
  const defaultLoader = require.extensions[extension]
  require.extensions[extension] = (module: NodeModule, requiredFileName: string) => {
    if (requiredFileName === resolvedFileName) {
      ;(module as NodeModuleWithCompile)._compile(bundledCode, requiredFileName)
    } else {
      if (defaultLoader) {
        defaultLoader(module, requiredFileName)
      }
    }
  }
  delete require.cache[resolvedFileName]
  try {
    const config = getDefaultFromCjs(require(fileName))
    require.extensions[extension] = defaultLoader
    return config
  } catch (err: any) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      throw new Error('Node tried to require an ES module from a CommonJS file, which is not supported')
    }
    throw err
  }
}
