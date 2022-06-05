import { resolve, basename, extname } from 'path'
import { cwd } from 'process'
import { promises as fs } from 'fs'

export async function getConfigFile(path: string, fileName: string) {
  if (path) return resolve(path)

  const file = await getConfigFileInCwdByName(fileName)

  return resolve(file)
}

async function getConfigFileInCwdByName(fileName: string): Promise<string> {
  const files = await fs.readdir(cwd())
  const configFiles = files.filter(file => {
    const ext = extname(file)
    return basename(file, ext) === fileName
  })

  const configFile = configFiles.length ? configFiles[0] : `${fileName}.js`

  return configFile
}
