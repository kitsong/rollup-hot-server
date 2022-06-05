import { rollup, MergedRollupOptions } from 'rollup'
import { logger } from './logger/logger'
import { cwd } from 'process'
import { resolve } from 'path'

export async function build(option: MergedRollupOptions) {
  const outputOptions = option.output
  const bundle = await rollup(option)
  logger.stage('build')
  await Promise.all(outputOptions.map(bundle.write))
  outputOptions.forEach(out => {
    logger.logStatic(`> OUTPUT => ${resolve(cwd(), out.file!)}`)
  })
  logger.logStatic(' ')
  await bundle.close()
}
